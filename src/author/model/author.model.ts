import type { CreationOptional } from "sequelize";
import { AllowNull, BelongsTo, HasMany, Model } from "sequelize-typescript";
import { Column, CreatedAt, DataType, Table, UpdatedAt } from "sequelize-typescript";
import { BookModel } from "src/books/model/books.model";

interface AuthorCreate  {
    name: string;
    full_name: string;
    description?: string;
    country?: string;
    is_deleted?: boolean;
}


@Table({tableName: "authors", timestamps: true})
export class AuthorModel extends Model<AuthorModel, AuthorCreate> {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    declare id: CreationOptional<number>;

    @Column({type: DataType.STRING, allowNull: false})
    declare name: string;

    @Column({type: DataType.STRING, allowNull: false})
    declare full_name: string;

    @Column({type: DataType.STRING, allowNull: true})
    declare description?: string;

    @Column({type: DataType.STRING(500), allowNull: true, defaultValue: null})
    declare author_photo?: string | null; 

    @Column({type: DataType.STRING, allowNull: true})
    declare country?: string;

    @Column({type: DataType.BOOLEAN, allowNull: false, defaultValue: false})
    declare is_deleted: boolean;

    @HasMany(() => BookModel)
    declare book: BookModel[];

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
    
}