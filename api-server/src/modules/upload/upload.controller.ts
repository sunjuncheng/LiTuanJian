import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('image') image: string,
  ) {
    let url: string;
    if (file) {
      url = await this.uploadService.saveFile(file);
    } else if (image) {
      url = await this.uploadService.saveBase64Image(image);
    } else {
      throw new Error('请上传图片');
    }
    return { url };
  }
}
