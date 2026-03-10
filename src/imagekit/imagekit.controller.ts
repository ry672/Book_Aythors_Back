import { Controller, Get } from '@nestjs/common';
import { ImagekitService } from './imagekit.service';

@Controller('imagekit')
export class ImagekitController {
  constructor(private readonly imagekitService: ImagekitService) {}

  @Get('auth')
  getAuth() {
    return this.imagekitService.getAuthParameters();
  }
}