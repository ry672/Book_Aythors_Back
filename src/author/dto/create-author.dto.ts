import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  
  MinLength,
} from 'class-validator';
import { Min } from 'class-validator';

export class AuthorCreateDto {
  @ApiProperty({ example: 'Rufina', description: 'Your name' })
  @IsString({ message: 'should be string' })
  @MaxLength(30, { message: 'should be less than 10' })
  @MinLength(2, { message: 'name should be more than 2' })
  name: string;

  @ApiProperty({ example: 'Garaeva', description: 'Your fullname' })
  @IsString({ message: 'should be string' })
  @MaxLength(30, { message: 'should be less than 30' })
  @MinLength(3, { message: 'full_name should be more than 3' })
  full_name: string;

  @ApiProperty({ example: 'Some bio...', description: 'Your info', required: false })
  @IsOptional()
  @IsString({ message: 'should be string' })
  @MaxLength(100, { message: 'should be less than 100' })
  @MinLength(5, { message: 'should be more than 10' })
  description?: string;

  @ApiProperty({ example: 'Tashkent', description: 'Your country', required: false })
  @IsOptional()
  @IsString({ message: 'should be string' })
  @MaxLength(30, { message: 'should be less than 30' })
  @MinLength(2, { message: 'country should be more than 2' })
  country?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  author_photo?: string | undefined;
}
export class FindAuthorQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  tags?: string;
}


