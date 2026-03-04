import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize, type WhereOptions } from 'sequelize';
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

  async create(dto: CreateBookDto) {
    const author = await this.authorModel.findByPk(dto.authorId);
    if (!author) throw new BadRequestException('Author not found');

    const category = await this.categoryModel.findByPk(dto.categoryId);
    if (!category) throw new BadRequestException('Category not found');

    try {
      return await this.bookModel.create({ ...dto });
    } catch (error: unknown) {
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
    } else {
      // const min = query.minPrice !== undefined ? Number(query.minPrice) : NaN;
      // const max = query.maxPrice !== undefined ? Number(query.maxPrice) : NaN;

      // if (!Number.isNaN(min) || !Number.isNaN(max)) {
      //   where.price = {
      //     ...(Number.isNaN(min) ? {} : { [Op.gte]: min }),
      //     ...(Number.isNaN(max) ? {} : { [Op.lte]: max }),
      //   } as any;
      // }
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

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findByPk(id);

    try {
      await book.update(dto);
      return book;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Update failed';
      throw new InternalServerErrorException(message);
    }
  }

  async softremove(id: number) {
    const book = await this.bookModel.findOne({ where: { id, is_deleted: false } });
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
      await book.destroy();
      return { message: 'Book fully deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }
}
