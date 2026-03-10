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
} from '@nestjs/common';
import { AuthorService } from './author.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthorCreateDto, FindAuthorQueryDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@ApiTags('author')
@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @ApiOperation({ summary: 'Create author' })
  @ApiResponse({ status: 201 })
  @Post()
  create(@Body() dto: AuthorCreateDto) {
    return this.authorService.create(dto);
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
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return this.authorService.update(id, dto);
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
