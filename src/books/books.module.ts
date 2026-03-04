import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookModel } from './model/books.model';
import { AuthorModel } from 'src/author/model/author.model';
import { CategoryModel } from 'src/category/model/category.model';

@Module({
  imports: [SequelizeModule.forFeature([BookModel, AuthorModel, CategoryModel])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService]
})
export class BooksModule {}
