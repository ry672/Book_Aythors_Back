import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize, type WhereOptions } from 'sequelize';
import { basename, join } from 'path';
import * as fs from 'fs/promises';

import { BookModel } from './model/books.model';
import { AuthorModel } from 'src/author/model/author.model';
import { CategoryModel } from 'src/category/model/category.model';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

type FindBookQuery = {
  name?: string;
  description?: string;
  price?: string;
  link?: string;
  search?: string;
  take?: number;
  page?: number;
  tags?: string;
  minPrice?: string;
  maxPrice?: string;
};

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(BookModel) private readonly bookModel: typeof BookModel,
    @InjectModel(AuthorModel) private readonly authorModel: typeof AuthorModel,
    @InjectModel(CategoryModel) private readonly categoryModel: typeof CategoryModel,
  ) {}

  private getPhotosPublicUrl(fileName: string) {
    return `/uploads/books/${fileName}`;
  }

  private getPhotosDiskPath(fileName: string) {
    return join(process.cwd(), 'uploads', 'books', fileName);
  }

  private async safeRemoveFileByUrl(fileUrl?: string | null) {
    if (!fileUrl) return;

    try {
      const fileName = basename(fileUrl);
      const filePath = this.getPhotosDiskPath(fileName);
      await fs.unlink(filePath);
    } catch {
      // ignore delete errors
    }
  }

  private async safeRemoveManyFiles(fileUrls?: string[] | null) {
    if (!fileUrls?.length) return;
    await Promise.all(fileUrls.map((url) => this.safeRemoveFileByUrl(url)));
  }

  private normalizeRemovePhotoUrls(
    value?: string | string[] | null,
  ): string[] {
    if (!value) return [];

    if (Array.isArray(value)) {
      return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
    }

    const trimmed = value.trim();
    if (!trimmed) return [];

    // JSON array string: ["url1","url2"]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return [
            ...new Set(
              parsed
                .filter((item): item is string => typeof item === 'string')
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          ];
        }
      } catch {
        throw new BadRequestException('remove_photo_urls has invalid JSON');
      }
    }

    // comma separated string: url1,url2
    if (trimmed.includes(',')) {
      return [
        ...new Set(
          trimmed
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ];
    }

    // single string
    return [trimmed];
  }

  async create(dto: CreateBookDto, files?: Express.Multer.File[]) {
    const author = await this.authorModel.findByPk(dto.authorId);
    if (!author) throw new BadRequestException('Author not found');

    const category = await this.categoryModel.findByPk(dto.categoryId);
    if (!category) throw new BadRequestException('Category not found');

    const photoUrls =
      files?.map((file) => this.getPhotosPublicUrl(file.filename)) ?? [];

    if (photoUrls.length < 1 || photoUrls.length > 10) {
      await this.safeRemoveManyFiles(photoUrls);
      throw new BadRequestException('Book must have from 1 to 10 photos');
    }

    try {
      return await this.bookModel.create({
        ...dto,
        photos: photoUrls,
      });
    } catch (error: unknown) {
      await this.safeRemoveManyFiles(photoUrls);
      const message = error instanceof Error ? error.message : 'Create failed';
      throw new InternalServerErrorException(message);
    }
  }

  async findByPk(id: number) {
    const book = await this.bookModel.findByPk(id, {
      include: [
        { model: this.authorModel, as: 'author' },
        { model: this.categoryModel, as: 'category' },
      ],
    });

    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async findMany(query: FindBookQuery) {
    const takeRaw = Number(query.take ?? 10);
    const pageRaw = Number(query.page ?? 1);

    const take = Number.isFinite(takeRaw)
      ? Math.min(Math.max(takeRaw, 1), 100)
      : 10;

    const page = Number.isFinite(pageRaw) ? Math.max(pageRaw, 1) : 1;
    const offset = (page - 1) * take;

    const where: WhereOptions<BookModel> = { is_deleted: false };

    if (query.name?.trim()) {
      where.name = { [Op.iLike]: `%${query.name.trim()}%` };
    }

    if (query.description?.trim()) {
      where.description = { [Op.iLike]: `%${query.description.trim()}%` };
    }

    if (query.link?.trim()) {
      where.link = { [Op.iLike]: `%${query.link.trim()}%` };
    }

    if (query.price !== undefined && query.price !== '') {
      const exact = Number(query.price);
      if (!Number.isNaN(exact)) where.price = exact;
    }

    const q = query.search?.trim();
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        Sequelize.where(Sequelize.cast(Sequelize.col('price'), 'text'), {
          [Op.iLike]: `%${q}%`,
        }),
      ];
    }

    const result = await this.bookModel.findAndCountAll({
      where,
      limit: take,
      offset,
      order: [['id', 'DESC']],
      include: [
        { model: this.authorModel, as: 'author' },
        { model: this.categoryModel, as: 'category' },
      ],
      distinct: true,
      col: 'id',
    });

    const count = Number(result.count);
    const pages = count === 0 ? 0 : Math.ceil(count / take);

    return {
      count,
      rows: result.rows,
      page,
      take,
      pages,
    };
  }

  async update(id: number, dto: UpdateBookDto, files?: Express.Multer.File[]) {
    const book = await this.findByPk(id);

    if (dto.authorId !== undefined) {
      const author = await this.authorModel.findByPk(dto.authorId);
      if (!author) throw new BadRequestException('Author not found');
    }

    if (dto.categoryId !== undefined) {
      const category = await this.categoryModel.findByPk(dto.categoryId);
      if (!category) throw new BadRequestException('Category not found');
    }

    const shouldRemoveAllPhotos = dto.remove_photos === 'true';

    const removePhotoUrls = this.normalizeRemovePhotoUrls(
      dto.remove_photo_urls,
    );

    const oldPhotoUrls = book.photos ?? [];
    const newPhotoUrls =
      files?.map((file) => this.getPhotosPublicUrl(file.filename)) ?? [];

    if (newPhotoUrls.length > 10) {
      await this.safeRemoveManyFiles(newPhotoUrls);
      throw new BadRequestException('Maximum 10 photos allowed');
    }

    const invalidRemoveUrls = removePhotoUrls.filter(
      (url) => !oldPhotoUrls.includes(url),
    );

    if (invalidRemoveUrls.length > 0) {
      await this.safeRemoveManyFiles(newPhotoUrls);
      throw new BadRequestException(
        `Some photos do not belong to this book: ${invalidRemoveUrls.join(', ')}`,
      );
    }

    let keptOldPhotos: string[] = [];
    let removedOldPhotos: string[] = [];

    if (shouldRemoveAllPhotos) {
      keptOldPhotos = [];
      removedOldPhotos = [...oldPhotoUrls];
    } else {
      keptOldPhotos = oldPhotoUrls.filter(
        (url) => !removePhotoUrls.includes(url),
      );
      removedOldPhotos = oldPhotoUrls.filter((url) =>
        removePhotoUrls.includes(url),
      );
    }

    const finalPhotos = [...keptOldPhotos, ...newPhotoUrls];

    if (finalPhotos.length < 1 || finalPhotos.length > 10) {
      await this.safeRemoveManyFiles(newPhotoUrls);
      throw new BadRequestException('Book must have from 1 to 10 photos');
    }

    try {
      await book.update({
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.link !== undefined ? { link: dto.link } : {}),
        ...(dto.authorId !== undefined ? { authorId: dto.authorId } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        photos: finalPhotos,
      });

      if (removedOldPhotos.length > 0) {
        await this.safeRemoveManyFiles(removedOldPhotos);
      }

      return await this.findByPk(id);
    } catch (error: unknown) {
      await this.safeRemoveManyFiles(newPhotoUrls);
      const message = error instanceof Error ? error.message : 'Update failed';
      throw new InternalServerErrorException(message);
    }
  }

  async softremove(id: number) {
    const book = await this.bookModel.findOne({
      where: { id, is_deleted: false },
    });

    if (!book) throw new NotFoundException('Book not found or already deleted');

    try {
      await book.update({ is_deleted: true });
      return { message: 'Book soft-deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }

  async hardremove(id: number) {
    const book = await this.bookModel.findByPk(id);
    if (!book) throw new NotFoundException('Book not found');

    try {
      await this.safeRemoveManyFiles(book.photos ?? []);
      await book.destroy();
      return { message: 'Book fully deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }
}