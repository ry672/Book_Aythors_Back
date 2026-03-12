import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AuthorModel } from "src/author/model/author.model";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";


@Module({
  imports: [SequelizeModule.forFeature([AuthorModel])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
