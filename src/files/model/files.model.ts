import { Column, DataType, Model, Table } from "sequelize-typescript";
interface FilesCreate{
    author_photo?: File | null;
}

@Table({tableName: "files", timestamps: true})
export class FilesModel extends Model<FilesModel, FilesCreate> {
    @Column({type: DataType.STRING(500), allowNull: true, defaultValue: null})
    declare author_photo?: File | null; 

}