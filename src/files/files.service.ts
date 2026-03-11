import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthorModel } from 'src/author/model/author.model';
import { basename, join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(AuthorModel)
    private readonly authorModel: typeof AuthorModel,
  ) {}

  async setAvatar(authorId: number, file: Express.Multer.File) {
    const author = await this.authorModel.findByPk(authorId);
    if (!author) {
      throw new NotFoundException('Автор не найден');
    }

    
    const publicUrl = `/uploads/avatars/${file.filename}`;

    if (author.author_photo) {
      try {
        const prevName = basename(author.author_photo);
        const prevPath = join(process.cwd(), 'uploads', 'avatars', prevName);
        await fs.unlink(prevPath);
      } catch {
        
      }
    }

    await author.update({ author_photo: publicUrl });
    return author;
  }
}
