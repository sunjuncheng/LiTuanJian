import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class UploadService {
  private uploadDir = this.resolveUploadDir();

  constructor(private configService: SystemConfigService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private resolveUploadDir() {
    const configuredDir = process.env.UPLOAD_DIR || './uploads';
    if (path.isAbsolute(configuredDir)) {
      return configuredDir;
    }
    return path.resolve(process.cwd(), configuredDir);
  }

  private checkSize(bytes: number) {
    const limitMb = this.configService.get('uploadSizeLimit') || 10;
    if (bytes > limitMb * 1024 * 1024) {
      throw new BadRequestException(`图片大小不能超过 ${limitMb}MB`);
    }
  }

  async saveBase64Image(base64: string): Promise<string> {
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) throw new BadRequestException('无效的图片数据');

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    this.checkSize(buffer.length);

    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, buffer);
    return this.buildUrl(`/uploads/${filename}`);
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    this.checkSize(file.size);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);
    return this.buildUrl(`/uploads/${filename}`);
  }

  private buildUrl(filePath: string): string {
    const baseUrl = process.env.BASE_URL || 'http://123.56.72.218';
    return `${baseUrl}${filePath}`;
  }
}
