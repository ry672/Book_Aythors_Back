import {
  Injectable,
  InternalServerErrorException,
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

  private async findAuthor(authorId: number) {
    const author = await this.authorModel.findOne({
      where: {
        id: authorId,
        is_deleted: false
      }
    })

    if (!author) throw new NotFoundException("Author not found")

    return author

  }
  
  private async safeRemoveAvatarByUrl(fileUrl?: string | null) {
   if (!fileUrl) return;
    try {
      const prevName = basename(fileUrl)
      const prevPath = join (process.cwd(), 'uploads', prevName)
      await fs.unlink(prevPath)
    } catch (error) {
      
    }
  }
    



  async setAvatar(authorId: number, file: Express.Multer.File) {
    const author = await this.findAuthor(authorId)
    const publicUrl = `/uploads/${file.filename}`


    try {
      if (author.author_photo) {
        await this.safeRemoveAvatarByUrl(author.author_photo)
      }

      await author.update({author_photo: publicUrl})
      return author
    } catch (error) {
      const message = error instanceof Error ? error.message : "Can not save"
      throw new InternalServerErrorException(message)
    }

    
  }

  async updateAvatar(authorId: number, file: Express.Multer.File) {
    return this.setAvatar(authorId, file);
  }

  async deleteAvatar(authorId: number) {
    const author = await this.findAuthor(authorId);

    try {
      if (author.author_photo) {
        await this.safeRemoveAvatarByUrl(author.author_photo);
      }

      await author.update({ author_photo: null });

      return {
        message: 'Avatar deleted',
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Can not save';
      throw new InternalServerErrorException(message);
    }
  }
}
