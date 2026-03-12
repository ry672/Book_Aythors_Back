import type { CreationOptional } from 'sequelize';
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { BookModel } from 'src/books/model/books.model';

interface AuthorCreate {
  name: string;
  full_name: string;
  description?: string;
  author_photo?: string | null;
  country?: string;
  is_deleted?: boolean;
}

@Table({
  tableName: 'authors',
  timestamps: true,
})
export class AuthorModel extends Model<AuthorModel, AuthorCreate> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(30),
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(30),
  })
  declare full_name: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(100),
  })
  declare description?: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(500),
    defaultValue: null,
  })
  declare author_photo?: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(30),
  })
  declare country?: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_deleted: boolean;

  @HasMany(() => BookModel, {
    foreignKey: 'authorId',
    as: 'books',
  })
  declare books: BookModel[];

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}