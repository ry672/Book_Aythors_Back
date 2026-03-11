import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthorCreateDto, FindAuthorQueryDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs/promises';

@ApiTags('author')
@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) { }

  @ApiOperation({ summary: 'Create author with optional avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'full_name'],
      properties: {
        name: { type: 'string', example: 'Rufina' },
        full_name: { type: 'string', example: 'Garaeva' },
        description: { type: 'string', example: 'Some bio...' },
        country: { type: 'string', example: 'Tashkent' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201 })
  @Post()
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
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )
  create(
    @Body() dto: AuthorCreateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authorService.create(dto, file);
  }

  @ApiOperation({ summary: 'Get authors' })
  @ApiResponse({ status: 200 })
  @Get()
  find(@Query() search: FindAuthorQueryDto) {
    return this.authorService.findMany(search);
  }

  @ApiOperation({ summary: 'Get author by id' })
  @ApiResponse({ status: 200 })
  @Get(':id')
  findByPk(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.findByPk(id);
  }

  @ApiOperation({ summary: 'Update author with optional avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Rufina' },
        full_name: { type: 'string', example: 'Garaeva' },
        description: { type: 'string', example: 'Some bio...' },
        country: { type: 'string', example: 'Tashkent' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200 })
  @Patch(':id')
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
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authorService.update(id, dto, file);
  }

  @ApiOperation({ summary: 'Delete author soft' })
  @ApiResponse({ status: 200 })
  @Delete(':id/soft')
  softremove(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.softremove(id);
  }

  @ApiOperation({ summary: 'Delete author hard' })
  @ApiResponse({ status: 200 })
  @Delete(':id/hard')
  hardremove(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.hardremove(id);
  }
}
