import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { AuthorModel } from './model/author.model';
import { BookModel } from 'src/books/model/books.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([AuthorModel, BookModel, AuthModule])],
  providers: [AuthorService],
  controllers: [AuthorController],
  exports: [AuthorService],
})
export class AuthorModule {}
