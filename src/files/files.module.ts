import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuthorModel } from 'src/author/model/author.model';

@Module({
  imports: [SequelizeModule.forFeature([AuthorModel])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
