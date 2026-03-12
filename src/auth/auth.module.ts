import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthorModel } from 'src/author/model/author.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([AuthorModel]),
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
