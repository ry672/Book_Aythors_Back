import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
    @ApiProperty()
    @IsString()
    @IsJWT()
    @IsNotEmpty()
    refresh_token: string;
}