import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs/promises';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('avatar/:authorId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          try {
            const dir = join(process.cwd(), 'uploads', 'avatars');
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
          } catch (e) {
            cb(e as Error, '');
          }
        },
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ok = /image\/(png|jpeg|jpg|webp|gif)/i.test(file.mimetype);
        cb(ok ? null : new Error('Only image files are allowed'), ok);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @Param('authorId', ParseIntPipe) authorId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Необходимо прикрепить файл формата: png | jpg | jpeg | webp | gif',
      );
    }

    return this.filesService.setAvatar(authorId, file);
  }

  @Patch('avatar/:authorId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          try {
            const dir = join(process.cwd(), 'uploads', 'avatars');
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
          } catch (e) {
            cb(e as Error, '');
          }
        },
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ok = /image\/(png|jpeg|jpg|webp|gif)/i.test(file.mimetype);
        cb(ok ? null : new Error('Only image files are allowed'), ok);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateAvatar(
    @Param('authorId', ParseIntPipe) authorId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Необходимо прикрепить файл формата: png | jpg | jpeg | webp | gif',
      );
    }

    return this.filesService.updateAvatar(authorId, file);
  }

  @Delete('avatar/:authorId')
  async deleteAvatar(
    @Param('authorId', ParseIntPipe) authorId: number,
  ) {
    return this.filesService.deleteAvatar(authorId);
  }
}