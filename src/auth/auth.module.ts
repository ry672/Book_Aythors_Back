import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthorModule } from 'src/author/author.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([AuthorModule]),
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
