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
};

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryModel)
    private readonly categoryModel: typeof CategoryModel,
  ) {}

  async create(dto: CategoryCreateDto) {
    const existing = await this.categoryModel.findOne({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Category already exists');

    try {
      return await this.categoryModel.create(dto);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Create failed';
      throw new InternalServerErrorException(message);
    }
  }

  async findByPk(id: number) {
    const category = await this.categoryModel.findByPk(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }


  async findAll(dto: FindCategoryQuery) {
    const where: WhereOptions<CategoryModel> = {};

    
    if (dto.name?.trim()) {
      where.name = { [Op.iLike]: `%${dto.name.trim()}%` };
    }

    
    const q = dto.search?.trim();
    if (q) {
      where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
    }

    return this.categoryModel.findAll({
      where,
      order: [['id', 'DESC']],
    });
  }

  async update(id: number, dto: UpdateACategoryDto) {
    const category = await this.findByPk(id);

    try {
      await category.update(dto);
      return category;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Update failed';
      throw new InternalServerErrorException(message);
    }
  }

  async softremove(id: number) {
    const category = await this.categoryModel.findOne({
      where: { id, is_deleted: false, status: 'active'},
    });
    if (!category) throw new NotFoundException('Category not found or already deleted');

    try {
      await category.update({ is_deleted: true, status: 'unactive' });
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
