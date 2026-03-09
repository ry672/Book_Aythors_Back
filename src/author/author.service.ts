import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions, UniqueConstraintError } from 'sequelize';
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
  country?: string
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

  private async safeRemoveUploadedFile(file?: Express.Multer.File) {
    if (!file) return;
    try {
      const filePath = join(process.cwd(), 'uploads', 'avatars', file.filename);
      await fs.unlink(filePath);
    } catch {
      
    }
  }

  async create(dto: AuthorCreateDto, file?: Express.Multer.File) {
    
    const name = dto.name?.trim();
    const fullName = dto.full_name?.trim();

    if (!name || !fullName) {
      await this.safeRemoveUploadedFile(file);
      throw new ConflictException('name and full_name are required');
    }

    
    const existing = await this.authorModel.findOne({
      where: {
        is_deleted: false,
        [Op.or]: [
          { name: { [Op.iLike]: name } },
          { full_name: { [Op.iLike]: fullName } },     
        ],
      },
    });

    if (existing) {
      await this.safeRemoveUploadedFile(file);

    }

    try {
      const author = await this.authorModel.create({
        ...dto,
        name,
        full_name: fullName,
        is_deleted: false,
      });

      if (file) {
        author.author_photo = `/uploads/avatars/${file.filename}`;
        await author.save();
      }

      return author;
    } catch (error: unknown) {
      await this.safeRemoveUploadedFile(file);

      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Author name or full_name already exists');
      }

      const message = error instanceof Error ? error.message : 'Create failed';
      throw new InternalServerErrorException(message);
    }
  }

  async findByPk(id: number) {
    const author = await this.authorModel.findOne({
      where: { id, is_deleted: false },
      include: [{ model: this.bookModel, as: 'book', required: false }],
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

    if(query.country?.trim()) {
      where.country = {[Op.iLike]: `%${query.country.trim()}%`}
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
      include: [{ model: this.bookModel, as: 'book', required: false }],
      distinct: true,
      col: 'id',
    });

    const count = Number(result.count);
    const pages = count === 0 ? 0 : Math.ceil(count / take);

    return { count, rows: result.rows, page, take, pages };
  }

  async update(id: number, dto: UpdateAuthorDto, file?: Express.Multer.File) {
    const author = await this.findByPk(id);
    const oldPhoto = author.author_photo;


    const nextName = dto.name?.trim();
    const nextFullName = dto.full_name?.trim();

    if (!nextName || !nextFullName) {
      const conflict = await this.authorModel.findOne({
        where: {
          id: { [Op.ne]: id },
          is_deleted: false,
          [Op.or]: [
            ...(nextName ? [{ name: { [Op.iLike]: nextName } }] : []),
            ...(nextFullName ? [{ full_name: { [Op.iLike]: nextFullName } }] : []),
          ],
        },
      });

      if (conflict) {
        await this.safeRemoveUploadedFile(file);
        throw new ConflictException('Author name or full_name already exists');
      }
    }

    try {
      await author.update({
        ...dto,
        ...(nextName !== undefined ? { name: nextName } : {}),
        ...(nextFullName !== undefined ? { full_name: nextFullName } : {}),
      });

      if (file) {
        author.author_photo = `/uploads/avatars/${file.filename}`;
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
      await this.safeRemoveUploadedFile(file);

      

      const message = error instanceof Error ? error.message : 'Update failed';
      throw new InternalServerErrorException(message);
    }
  }

  async softremove(id: number) {
    const author = await this.authorModel.findOne({ where: { id, is_deleted: false } });
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

