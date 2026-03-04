import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryModel } from './model/category.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookModel } from 'src/books/model/books.model';

@Module({
  imports: [SequelizeModule.forFeature([CategoryModel, BookModel])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService]
})
export class CategoryModule {}
