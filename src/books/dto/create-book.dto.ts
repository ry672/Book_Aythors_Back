import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code', description: 'Book name' })
  @IsString()
  @MaxLength(50)
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 100, description: 'Book price' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Good book about code...', description: 'Description' })
  @IsString()
  @MaxLength(200)
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'https://example.com', description: 'Link to book' })
  @IsString()
  link: string;

  @ApiProperty({example: 1, description: 'authorId'})
  @Type(() => Number)
  @IsInt()
  authorId: number;

  @ApiProperty({example: 1, description: "categoryId"})
  @Type(() => Number)
  @IsInt()
  categoryId: number;
  
  
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
  
  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // minPrice?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // maxPrice?: string;
}
