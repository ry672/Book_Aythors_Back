import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';
import { AuthorCreateDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorModel } from './model/author.model';
import { basename, join } from 'path';
import * as fs from 'fs/promises';
import { BookModel } from 'src/books/model/books.model';

export type FindAuthorQuery = {
  name?: string;
  full_name?: string;
  description?: string;
  country?: string;
  search?: string;
  take?: number;
  page?: number;
  tags?: string;
};

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(AuthorModel)
    private readonly authorModel: typeof AuthorModel,

    @InjectModel(BookModel)
    private readonly bookModel: typeof BookModel,
  ) {}

  private getAvatarPublicUrl(fileName: string) {
    return `/uploads/avatars/${fileName}`;
  }

  private getAvatarDiskPath(fileName: string) {
    return join(process.cwd(), 'uploads', 'avatars', fileName);
  }

  private async safeRemoveFileByUrl(fileUrl?: string | null) {
    if (!fileUrl) return;

    try {
      const fileName = basename(fileUrl);
      const filePath = this.getAvatarDiskPath(fileName);
      await fs.unlink(filePath);
    } catch {
      // ignore delete errors
    }
  }

  async create(dto: AuthorCreateDto, file?: Express.Multer.File) {
    const name = dto.name?.trim();
    const fullName = dto.full_name?.trim();

    if (!name || !fullName) {
      throw new ConflictException('name and full_name are required');
    }

    const publicUrl = file ? this.getAvatarPublicUrl(file.filename) : null;

    try {
      const author = await this.authorModel.create({
        name,
        full_name: fullName,
        description: dto.description?.trim() || undefined,
        country: dto.country?.trim() || undefined,
        author_photo: publicUrl,
        is_deleted: false,
      });

      return author;
    } catch (error: unknown) {
      if (publicUrl) {
        await this.safeRemoveFileByUrl(publicUrl);
      }

      const message = error instanceof Error ? error.message : 'Create failed';
      throw new InternalServerErrorException(message);
    }
  }

  async findByPk(id: number) {
    const author = await this.authorModel.findOne({
      where: { id, is_deleted: false },
      include: [{ model: this.bookModel, as: 'books', required: false }],
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    return author;
  }

  async findMany(query: FindAuthorQuery) {
    const takeRaw = Number(query.take ?? 10);
    const pageRaw = Number(query.page ?? 1);

    const take = Number.isFinite(takeRaw)
      ? Math.min(Math.max(takeRaw, 1), 100)
      : 10;

    const page = Number.isFinite(pageRaw) ? Math.max(pageRaw, 1) : 1;
    const offset = (page - 1) * take;

    const where: WhereOptions<AuthorModel> = {
      is_deleted: false,
    };

    if (query.name?.trim()) {
      where.name = { [Op.iLike]: `%${query.name.trim()}%` };
    }

    if (query.full_name?.trim()) {
      where.full_name = { [Op.iLike]: `%${query.full_name.trim()}%` };
    }

    if (query.description?.trim()) {
      where.description = { [Op.iLike]: `%${query.description.trim()}%` };
    }

    if (query.country?.trim()) {
      where.country = { [Op.iLike]: `%${query.country.trim()}%` };
    }

    const q = query.search?.trim();
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { full_name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { country: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const result = await this.authorModel.findAndCountAll({
      where,
      limit: take,
      offset,
      order: [['id', 'DESC']],
      include: [{ model: this.bookModel, as: 'books', required: false }],
      distinct: true,
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

  async update(id: number, dto: UpdateAuthorDto, file?: Express.Multer.File) {
    const author = await this.findByPk(id);

    const nextName = dto.name?.trim();
    const nextFullName = dto.full_name?.trim();
    const nextDescription = dto.description?.trim();
    const nextCountry = dto.country?.trim();

    const shouldRemovePhoto = dto.remove_photo === 'true';
    const newPhotoUrl = file ? this.getAvatarPublicUrl(file.filename) : undefined;
    const oldPhotoUrl = author.author_photo;

    try {
      await author.update({
        ...(nextName !== undefined ? { name: nextName } : {}),
        ...(nextFullName !== undefined ? { full_name: nextFullName } : {}),
        ...(dto.description !== undefined ? { description: nextDescription || '' } : {}),
        ...(dto.country !== undefined ? { country: nextCountry || '' } : {}),
        ...(shouldRemovePhoto ? { author_photo: null } : {}),
        ...(newPhotoUrl !== undefined ? { author_photo: newPhotoUrl } : {}),
      });

      if ((shouldRemovePhoto || newPhotoUrl) && oldPhotoUrl) {
        await this.safeRemoveFileByUrl(oldPhotoUrl);
      }

      return author;
    } catch (error: unknown) {
      if (newPhotoUrl) {
        await this.safeRemoveFileByUrl(newPhotoUrl);
      }

      const message = error instanceof Error ? error.message : 'Update failed';
      throw new InternalServerErrorException(message);
    }
  }

  async softremove(id: number) {
    const author = await this.authorModel.findOne({
      where: { id, is_deleted: false },
    });

    if (!author) {
      throw new NotFoundException('Author not found or already deleted');
    }

    try {
      await author.update({ is_deleted: true });
      return { message: 'Author soft-deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }

  async hardremove(id: number) {
    const author = await this.authorModel.findByPk(id);

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    try {
      if (author.author_photo) {
        await this.safeRemoveFileByUrl(author.author_photo);
      }

      await author.destroy();
      return { message: 'Author fully deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }
}

