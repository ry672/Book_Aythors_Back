import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'ruf7306@gmail.com', description: 'Your email' })
    @IsString({ message: 'email should be string' })
    email: string;

    @ApiProperty({ example: "qwerty123", description: "Пароль пользователя" })
    @IsString({ message: "Password must be a string" })
    @MinLength(6, { message: "Password must be at least 6 characters" })
    @MaxLength(100, { message: "Password must be less than 100 characters" })
    password: string;
}