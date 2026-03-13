import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateBookDto } from "./create-book.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateBookDto extends PartialType(CreateBookDto) {
    @ApiPropertyOptional({ example: 'true' })
    @IsOptional()
    @IsString()
    remove_photos?: string;

}