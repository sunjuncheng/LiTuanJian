import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
