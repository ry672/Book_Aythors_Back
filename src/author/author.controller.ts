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
  UploadedFile,
  UseInterceptors,
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

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 50 * 1024 * 1024;
const VALID_UPLOADS_MIME_TYPES = ['image/jpeg', 'image/png'];

const avatarUploadInterceptor = FileInterceptor('file', {
  storage: diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        const dir = join(process.cwd(), 'uploads', 'avatars');
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
      } catch (e) {
        cb(e as Error, '');
      }
    },
    filename: (_req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!VALID_UPLOADS_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only jpeg/png allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES },
});

@ApiTags('author')
@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @ApiOperation({ summary: 'Create author' })
  @ApiResponse({ status: 201 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        full_name: { type: 'string' },
        description: { type: 'string' },
        country: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['name', 'full_name'],
    },
  })
  @Post()
  @UseInterceptors(avatarUploadInterceptor)
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

  @ApiOperation({ summary: 'Update author' })
  @ApiResponse({ status: 200 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        full_name: { type: 'string' },
        description: { type: 'string' },
        country: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Patch(':id')
  @UseInterceptors(avatarUploadInterceptor)
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
