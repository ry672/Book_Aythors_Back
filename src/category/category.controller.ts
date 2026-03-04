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
import { CategoryService} from './category.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryCreateDto } from './dto/create-category.dto';
import { UpdateACategoryDto } from './dto/update-category.dto';
export type FindCategoryQuery = {
  name?: string;
  search?: string;
}

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201 })
  @Post()
  create(@Body() dto: CategoryCreateDto) {
    return this.categoryService.create(dto);
  }

  @ApiOperation({ summary: 'Get categories' })
  @ApiResponse({ status: 200 })
  @Get()
  findAll(@Query() query: FindCategoryQuery) {
    return this.categoryService.findAll(query);
  }

  @ApiOperation({ summary: 'Get category by Id' })
  @ApiResponse({ status: 200 })
  @Get(':id')
  findByPk(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findByPk(id);
  }

  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateACategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete category soft' })
  @ApiResponse({ status: 200 })
  @Delete(':id/soft')
  softremove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.softremove(id);
  }

  @ApiOperation({ summary: 'Delete category hard' })
  @ApiResponse({ status: 200 })
  @Delete(':id/hard')
  hardremove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.hardremove(id);
  }
}