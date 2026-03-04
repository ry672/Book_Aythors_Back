import { PartialType } from "@nestjs/swagger";
import { CategoryCreateDto } from "./create-category.dto";

export class UpdateACategoryDto extends PartialType(CategoryCreateDto) {}