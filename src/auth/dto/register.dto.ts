import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: 'Rufina', description: 'Your name' })
    @IsString({ message: 'should be string' })
    @MaxLength(30, { message: 'name should be less than 10' })
    @MinLength(2, { message: 'name should be more than 2' })
    name: string;

    @ApiProperty({ example: 'Garaeva', description: 'Your fullname' })
    @IsString({ message: 'should be string' })
    @MaxLength(30, { message: 'full_name should be less than 30' })
    @MinLength(3, { message: 'full_name should be more than 3' })
    full_name: string;

    @ApiProperty({ example: 'Some bio...', description: 'Your info', required: false })
    @IsOptional()
    @IsString({ message: 'should be string' })
    @MaxLength(100, { message: 'description should be less than 100' })
    @MinLength(5, { message: 'description should be more than 5' })
    description?: string;

    @ApiProperty({ example: 'Tashkent', description: 'Your country', required: false })
    @IsOptional()
    @IsString({ message: 'should be string' })
    @MaxLength(30, { message: 'should be less than 30' })
    @MinLength(2, { message: 'country should be more than 2' })
    country?: string;

    @ApiProperty({ example: 'ruf7306@gmail.com', description: 'Your email' })
    @IsString({ message: 'email should be a string' })
    email: string;

    @ApiProperty({ example: "qwerty123", description: "Пароль пользователя" })
    @IsString({ message: "Password must be a string" })
    @MinLength(6, { message: "Password must be at least 6 characters" })
    @MaxLength(100, { message: "Password must be less than 100 characters" })
    password: string;

    
}