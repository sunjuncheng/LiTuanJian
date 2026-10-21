import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { UserMessage } from '../../entities/user-message.entity';
import { fixImageUrl } from '../../common/utils/image';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserMessage) private messageRepo: Repository<UserMessage>,
  ) {}

  private normalizeUser(user: User | null) {
    if (!user) return null;
    return {
      id: user.id,
      nickname: user.nickname || '',
      avatarUrl: fixImageUrl(user.avatarUrl),
      phone: user.phone || '',
      hasPhone: !!user.phone,
      hasPassword: !!user.password,
      status: user.status,
      openid: user.openid || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private findUserEntityById(id: number, includePassword = false) {
    if (includePassword) {
      return this.userRepo.findOne({
        where: { id },
        select: [
          'id',
          'openid',
          'nickname',
          'avatarUrl',
          'phone',
          'password',
          'status',
          'createdAt',
          'updatedAt',
        ],
      });
    }
    return this.userRepo.findOne({ where: { id } });
  }

  async findById(id: number) {
    const user = await this.findUserEntityById(id, true);
    return this.normalizeUser(user);
  }

  async updateProfile(userId: number, data: { nickname?: string; avatarUrl?: string }) {
    const updateData: { nickname?: string; avatarUrl?: string } = {};
    if (data.nickname !== undefined) {
      const nickname = String(data.nickname || '').trim();
      if (!nickname) {
        throw new BadRequestException('昵称不能为空');
      }
      if (nickname.length > 20) {
        throw new BadRequestException('昵称不能超过20个字');
      }
      updateData.nickname = nickname;
    }
    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl || '';
    }
    await this.userRepo.update(userId, updateData);
    return this.findById(userId);
  }

  async bindPhone(userId: number, phone: string, password: string) {
    const phoneText = String(phone || '').trim();
    const passwordText = String(password || '').trim();

    if (!/^1\d{10}$/.test(phoneText)) {
      throw new BadRequestException('请输入正确的手机号');
    }
    if (passwordText.length < 6) {
      throw new BadRequestException('登录密码至少6位');
    }

    const user = await this.findUserEntityById(userId, true);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const existingUser = await this.userRepo.findOne({
      where: { phone: phoneText },
      select: ['id'],
    });
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('该手机号已被其他账号绑定');
    }

    const hashedPassword = await bcrypt.hash(passwordText, 10);
    const nextNickname =
      !user.nickname || user.nickname === '微信用户'
        ? `用户${phoneText.slice(-4)}`
        : user.nickname;

    await this.userRepo.update(userId, {
      phone: phoneText,
      password: hashedPassword,
      nickname: nextNickname,
    });

    return this.findById(userId);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.findUserEntityById(userId, true);
    if (!user) throw new BadRequestException('用户不存在');
    if (!user.password) throw new BadRequestException('请先绑定手机号并设置登录密码');
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new BadRequestException('原密码错误');
    if (newPassword.length < 6) throw new BadRequestException('新密码至少6位');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { password: hashed });
  }

  async getMessages(userId: number) {
    const list = await this.messageRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return {
      unreadCount: list.filter((item) => !item.isRead).length,
      list,
    };
  }

  async readMessage(userId: number, messageId: number) {
    const id = Number(messageId);
    if (isNaN(id)) throw new BadRequestException('消息ID无效');
    const message = await this.messageRepo.findOne({ where: { id, userId } });
    if (!message) throw new BadRequestException('消息不存在');
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await this.messageRepo.save(message);
    }
    return message;
  }
}
