import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthorModule } from './author/author.module';
import { CategoryModule } from './category/category.module';
import { BooksModule } from './books/books.module';
import { ImagekitModule } from './imagekit/imagekit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadModels: true,
      synchronize: true,
      sync: { force: true },
      logging: false,
    }),
    AuthorModule,
    CategoryModule,
    BooksModule,
    ImagekitModule,
  ],
})
export class AppModule {}