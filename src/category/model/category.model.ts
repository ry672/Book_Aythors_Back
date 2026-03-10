import { HasMany, Model } from 'sequelize-typescript';
import { Column, CreatedAt, DataType, Table, UpdatedAt } from 'sequelize-typescript';
import { BookModel } from 'src/books/model/books.model';

interface CategoryCreate {
  name: string;
  status?: string;
}

@Table({ tableName: 'categories', timestamps: true })
export class CategoryModel extends Model<CategoryModel, CategoryCreate> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false})
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'active' })
  declare status: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare is_deleted: boolean;


  @CreatedAt
  declare createdAt: Date;
  
  @UpdatedAt
  declare updatedAt: Date;

}