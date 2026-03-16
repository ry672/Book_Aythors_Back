import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
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
  photos?: string[];
}

@Table({
  tableName: 'books',
  timestamps: true,
  underscored: true,
})
export class BookModel extends Model<BookModel, BookCreate> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @ForeignKey(() => CategoryModel)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'category_id',
  })
  declare categoryId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare price: number;

  @ForeignKey(() => AuthorModel)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    field: 'author_id',
  })
  declare authorId: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare description: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare link: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare is_deleted: boolean;

  @AllowNull(false)
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare photos: string[];

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @BelongsTo(() => AuthorModel, { foreignKey: 'authorId' })
  declare author: AuthorModel;

  @BelongsTo(() => CategoryModel, { foreignKey: 'categoryId' })
  declare category: CategoryModel;
}