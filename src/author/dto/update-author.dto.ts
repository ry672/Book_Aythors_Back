import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { AuthorCreateDto } from "./create-author.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateAuthorDto extends PartialType(AuthorCreateDto) {
    @ApiPropertyOptional({ example: 'true' })
    @IsOptional()
    @IsString()
    remove_photo?: string;
}