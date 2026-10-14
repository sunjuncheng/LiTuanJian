import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private uploadDir = path.resolve(__dirname, '../../../uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveBase64Image(base64: string): Promise<string> {
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) throw new Error('无效的图片数据');

    const ext = matches[1];
    const data = matches[2];
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
    return this.buildUrl(`/uploads/${filename}`);
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);
    return this.buildUrl(`/uploads/${filename}`);
  }

  private buildUrl(filePath: string): string {
    const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
    return `${baseUrl}${filePath}`;
  }
}
