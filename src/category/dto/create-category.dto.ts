import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength} from "class-validator";


export class CategoryCreateDto {
    @ApiProperty({example: "Fantasy", description: "Category name"})
    @IsString({message: "should be string"})
    @MaxLength(20, {message: "should be less than 10"})
    @MinLength(2, {message: "name should be more than 2"})
    name: string;

}