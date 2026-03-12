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
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookDto} from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindBookQuery } from './dto/create-book.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';


@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard)
@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: 'Create book for author' })
  @ApiResponse({ status: 201 })
  @Post()
  create(
    @Body() dto: CreateBookDto,
  ) {
    return this.booksService.create(dto);
  }

  @ApiOperation({ summary: 'Get books (search includes deleted)' })
  @ApiResponse({ status: 200 })
  @Get()
  find(
    @Query() search: FindBookQuery

  ) {
    return this.booksService.findMany(search);
  }

  @ApiOperation({ summary: 'Get book by id' })
  @ApiResponse({ status: 200 })
  @Get(':id')
  findByPk(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findByPk(id);
  }

  @ApiOperation({ summary: 'Update book' })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
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
