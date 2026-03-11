import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateFileDto {
    @ApiProperty({example: "Fantasy", description: "Category name"})
    @IsString({message: "should be string"})
    author_photo?: File | null;
}
