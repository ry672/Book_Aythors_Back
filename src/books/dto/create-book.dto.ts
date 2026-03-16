import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    example: 'Clean Code',
    description: 'Book name',
  })
  @IsString()
  @MaxLength(50)
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 100,
    description: 'Book price',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 'Good book about code...',
    description: 'Book description',
  })
  @IsString()
  @MaxLength(200)
  @MinLength(10)
  description: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'Link to book',
  })
  @IsString()
  @IsUrl(
    {},
    {
      message: 'link must be a valid URL',
    },
  )
  link: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Book photos (1 to 10 files)',
  })
  @IsOptional()
  files?: unknown[];

  @ApiProperty({
    example: 1,
    description: 'authorId',
  })
  @Type(() => Number)
  @IsInt()
  authorId: number;

  @ApiProperty({
    example: 1,
    description: 'categoryId',
  })
  @Type(() => Number)
  @IsInt()
  categoryId: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiPropertyOptional({
    example: 'true',
    description: 'Remove all old photos before saving new ones',
  })
  @IsOptional()
  @IsString()
  remove_photos?: string;

  @ApiPropertyOptional({
    example: '["/uploads/books/1711-a.jpg","/uploads/books/1711-b.jpg"]',
    description:
      'Specific old photo URLs to remove. Can be JSON string, single string, or comma-separated string.',
  })
  @IsOptional()
  remove_photo_urls?: string | string[];
}

export class FindBookQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  price?: string;

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

  @ApiPropertyOptional({
    example: '10',
    description: 'Minimum price filter',
  })
  @IsOptional()
  @IsString()
  minPrice?: string;

  @ApiPropertyOptional({
    example: '500',
    description: 'Maximum price filter',
  })
  @IsOptional()
  @IsString()
  maxPrice?: string;
}
