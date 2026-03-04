import { PartialType } from "@nestjs/swagger";
import { AuthorCreateDto } from "./create-author.dto";

export class UpdateAuthorDto extends PartialType(AuthorCreateDto) {}