import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Table,
  UpdatedAt,
  Model,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { AuthorModel } from '../../author/model/author.model';
import { CategoryModel } from '../../category/model/category.model';

interface BookCreate {
  name: string;
  categoryId: number;
  price: number;
  authorId: number;
  description: string;
  link: string;
  is_deleted?: boolean;
  photos?: string | null;
}

@Table({ tableName: 'books', timestamps: true, underscored: true })
export class BookModel extends Model<BookModel, BookCreate> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ForeignKey(() => CategoryModel)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'category_id' })
  declare categoryId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare price: number;

  @ForeignKey(() => AuthorModel)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'author_id' })
  declare authorId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare link: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare is_deleted?: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(500),
    defaultValue: null,
  })
  declare photos?: string | null;

  @BelongsTo(() => AuthorModel, { foreignKey: 'authorId' })
  declare author: AuthorModel;

  @BelongsTo(() => CategoryModel, { foreignKey: 'categoryId' })
  declare category: CategoryModel;
}