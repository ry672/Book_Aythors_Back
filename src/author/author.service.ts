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
import { join } from 'path';
import * as fs from 'fs/promises';
import { BookModel } from 'src/books/model/books.model';

export type FindAuthorQuery = {
  name?: string;
  full_name?: string;
  description?: string;
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
  ) { }

  async create(dto: AuthorCreateDto, file?: Express.Multer.File) {
    const existing = await this.authorModel.findOne({
      where: {
        is_deleted: false,
        [Op.or]: [{ name: dto.name }, { full_name: dto.full_name }],
      },
    });

    if (existing) {
      if (file) {
        try {
          const filePath = join(process.cwd(), 'uploads', 'avatars', file.filename);
          await fs.unlink(filePath);
        } catch { }
      }
      throw new ConflictException('Author already exists');
    }

    try {
      const author = await this.authorModel.create({
        ...dto,
        is_deleted: false,
      });

      if (file) {
        const publicUrl = `/uploads/avatars/${file.filename}`;
        author.author_photo = publicUrl;
        await author.save();
      }

      return author;
    } catch (error: unknown) {
      if (file) {
        try {
          const filePath = join(process.cwd(), 'uploads', 'avatars', file.filename);
          await fs.unlink(filePath);
        } catch { }
      }

      const message = error instanceof Error ? error.message : 'Create failed';
      throw new InternalServerErrorException(message);
    }
  }

  async findByPk(id: number) {
    const author = await this.authorModel.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: this.bookModel,
          as: 'book',
          required: false,
        },
      ],
    });

    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  async findMany(query: FindAuthorQuery) {
    const takeRaw = Number(query.take ?? 10);
    const pageRaw = Number(query.page ?? 1);

    const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 100) : 10;
    const page = Number.isFinite(pageRaw) ? Math.max(pageRaw, 1) : 1;
    const offset = (page - 1) * take;


    const where: WhereOptions<AuthorModel> = { is_deleted: false };
    if (query.name?.trim()) {
      where.name = { [Op.iLike]: `%${query.name.trim()}%` };
    }
    if (query.full_name?.trim()) {
      where.full_name = { [Op.iLike]: `%${query.full_name.trim()}%` };
    }
    if (query.description?.trim()) {
      where.description = { [Op.iLike]: `%${query.description.trim()}%` };
    }

    const q = query.search?.trim();
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { full_name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const result = await this.authorModel.findAndCountAll({
      where,
      limit: take,
      offset,
      order: [['id', 'DESC']],
      include: [
        {
          model: this.bookModel,
          as: 'book',
          required: false,
        },
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

  async update(id: number, dto: UpdateAuthorDto, file?: Express.Multer.File) {
    const author = await this.findByPk(id);

    const oldPhoto = author.author_photo;

    try {
      await author.update(dto);
      if (file) {
        const publicUrl = `/uploads/avatars/${file.filename}`;
        author.author_photo = publicUrl;
        await author.save();

        if (oldPhoto && oldPhoto.startsWith('/uploads/avatars/')) {
          const oldFilename = oldPhoto.replace('/uploads/avatars/', '');
          const oldPath = join(process.cwd(), 'uploads', 'avatars', oldFilename);

          try {
            await fs.unlink(oldPath);
          } catch {

          }
        }
      }

      return author;
    } catch (error: unknown) {
      if (file) {
        try {
          const filePath = join(process.cwd(), 'uploads', 'avatars', file.filename);
          await fs.unlink(filePath);
        } catch { }
      }

      const message = error instanceof Error ? error.message : 'Update failed';
      throw new InternalServerErrorException(message);
    }
  }

  async softremove(id: number) {
    const author = await this.authorModel.findOne({
      where: { id, is_deleted: false },
    });

    if (!author) throw new NotFoundException('Author not found or already deleted');

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
    if (!author) throw new NotFoundException('Author not found');

    try {
      await author.destroy();
      return { message: 'Author fully deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }
}

