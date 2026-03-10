import { Injectable } from '@nestjs/common';
import ImageKit from 'imagekit';

@Injectable()
export class ImagekitService {
  private readonly imagekit: ImageKit;

  constructor() {
    console.log('IMAGEKIT_PUBLIC_KEY exists:', !!process.env.IMAGEKIT_PUBLIC_KEY);
    console.log('IMAGEKIT_PRIVATE_KEY exists:', !!process.env.IMAGEKIT_PRIVATE_KEY);
    console.log('IMAGEKIT_URL_ENDPOINT exists:', !!process.env.IMAGEKIT_URL_ENDPOINT);
    console.log('IMAGEKIT_URL_ENDPOINT value:', process.env.IMAGEKIT_URL_ENDPOINT);

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error('ImageKit env variables are missing');
    }

    this.imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  getAuthParameters() {
    return this.imagekit.getAuthenticationParameters();
  }
}