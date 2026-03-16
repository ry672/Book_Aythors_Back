import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateBookDto } from "./create-book.dto";
import { IsOptional, IsString } from "class-validator";

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