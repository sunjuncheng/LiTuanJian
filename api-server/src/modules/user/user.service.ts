import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateProfile(userId: number, data: { nickname?: string; avatarUrl?: string }) {
    await this.userRepo.update(userId, data);
    return this.findById(userId);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.findById(userId);
    if (!user) throw new BadRequestException('用户不存在');
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new BadRequestException('原密码错误');
    if (newPassword.length < 6) throw new BadRequestException('新密码至少6位');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { password: hashed });
  }
}
