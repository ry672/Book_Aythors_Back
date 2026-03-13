import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs/promises';

import { BooksService } from './books.service';
import { CreateBookDto, FindBookQuery } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: 'Create book with 1-10 photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'name',
        'description',
        'price',
        'link',
        'authorId',
        'categoryId',
        'files',
      ],
      properties: {
        name: { type: 'string', example: 'Book 1' },
        description: { type: 'string', example: 'Some description...' },
        price: { type: 'number', example: 100 },
        link: { type: 'string', example: 'https://example.com' },
        authorId: { type: 'number', example: 1 },
        categoryId: { type: 'number', example: 1 },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201 })
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          try {
            const dir = join(process.cwd(), 'uploads', 'books');
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
          } catch (e) {
            cb(e as Error, '');
          }
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ok = /image\/(png|jpeg|jpg|webp|gif)/i.test(file.mimetype);
        cb(ok ? null : new Error('Only image files are allowed'), ok);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
      },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )
  create(
    @Body() dto: CreateBookDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.booksService.create(dto, files);
  }

  @ApiOperation({ summary: 'Get books' })
  @ApiResponse({ status: 200 })
  @Get()
  find(@Query() search: FindBookQuery) {
    return this.booksService.findMany(search);
  }

  @ApiOperation({ summary: 'Get book by id' })
  @ApiResponse({ status: 200 })
  @Get(':id')
  findByPk(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findByPk(id);
  }

  @ApiOperation({ summary: 'Update book with optional photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Book 1' },
        description: { type: 'string', example: 'Some description...' },
        price: { type: 'number', example: 100 },
        link: { type: 'string', example: 'https://example.com' },
        authorId: { type: 'number', example: 1 },
        categoryId: { type: 'number', example: 1 },
        remove_photos: { type: 'string', example: 'true' },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: async (_req, _file, cb) => {
          try {
            const dir = join(process.cwd(), 'uploads', 'books');
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
          } catch (e) {
            cb(e as Error, '');
          }
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ok = /image\/(png|jpeg|jpg|webp|gif)/i.test(file.mimetype);
        cb(ok ? null : new Error('Only image files are allowed'), ok);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
      },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.booksService.update(id, dto, files);
  }

  @ApiOperation({ summary: 'Delete book soft' })
  @ApiResponse({ status: 200 })
  @Delete(':id/soft')
  softremove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.softremove(id);
  }

  @ApiOperation({ summary: 'Delete book hard' })
  @ApiResponse({ status: 200 })
  @Delete(':id/hard')
  hardremove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.hardremove(id);
  }
}
