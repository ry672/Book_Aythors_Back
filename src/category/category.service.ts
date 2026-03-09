import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';
import { CategoryModel } from './model/category.model';
import { CategoryCreateDto } from './dto/create-category.dto';
import { UpdateACategoryDto } from './dto/update-category.dto';

export type FindCategoryQuery = {
  name?: string;
  search?: string;
  page?: number | string;
  take?: number | string;
};

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryModel)
    private readonly categoryModel: typeof CategoryModel,
  ) {}

  async create(dto: CategoryCreateDto) {
    const existing = await this.categoryModel.findOne({
      where: { name: dto.name.trim() },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    try {
      return await this.categoryModel.create({
        ...dto,
        name: dto.name.trim(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Create failed';
      throw new InternalServerErrorException(message);
    }
  }

  async findByPk(id: number) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findAll(query: FindCategoryQuery) {
    const takeRaw = Number(query.take ?? 10);
    const pageRaw = Number(query.page ?? 1);

    const take = Number.isFinite(takeRaw)
      ? Math.min(Math.max(takeRaw, 1), 100)
      : 10;

    const page = Number.isFinite(pageRaw) ? Math.max(pageRaw, 1) : 1;
    const offset = (page - 1) * take;

    const where: WhereOptions<CategoryModel> = {
      is_deleted: false,
    };

    if (query.name?.trim()) {
      where.name = {
        [Op.iLike]: `%${query.name.trim()}%`,
      };
    }

    const q = query.search?.trim();
    if (q) {
      where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
    }

    try {
      const result = await this.categoryModel.findAndCountAll({
        where,
        limit: take,
        offset,
        order: [['id', 'DESC']],
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Fetch failed';
      throw new InternalServerErrorException(message);
    }
  }

  async update(id: number, dto: UpdateACategoryDto) {
    const category = await this.findByPk(id);

    if (dto.name) {
      const existing = await this.categoryModel.findOne({
        where: {
          name: dto.name.trim(),
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw new ConflictException('Category already exists');
      }
    }

    try {
      await category.update({
        ...dto,
        ...(dto.name ? { name: dto.name.trim() } : {}),
      });

      return category;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Update failed';
      throw new InternalServerErrorException(message);
    }
  }

  async softremove(id: number) {
    const category = await this.categoryModel.findOne({
      where: {
        id,
        is_deleted: false,
        status: 'active',
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found or already deleted');
    }

    try {
      await category.update({
        is_deleted: true,
        status: 'unactive',
      });

      return { message: 'Category soft-deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }

  async hardremove(id: number) {
    const category = await this.findByPk(id);

    try {
      await category.destroy();
      return { message: 'Category fully deleted' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new InternalServerErrorException(message);
    }
  }
}
