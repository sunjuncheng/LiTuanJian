import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../../entities/coach.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
  ) {}

  findById(id: number) {
    return this.coachRepo.findOne({ where: { id } });
  }

  findAll(params: { page: number; pageSize: number; keyword?: string }) {
    const qb = this.coachRepo.createQueryBuilder('c');
    if (params.keyword) {
      qb.where('c.name LIKE :keyword', { keyword: `%${params.keyword}%` });
    }
    qb.orderBy('c.createdAt', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize);
    return qb.getManyAndCount().then(([list, total]) => ({ list, total }));
  }

  async create(data: { name: string; phone: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const coach = this.coachRepo.create({
      name: data.name,
      phone: data.phone,
      password: hashedPassword,
    });
    return this.coachRepo.save(coach);
  }

  async update(id: number, data: { name?: string; phone?: string; status?: number }) {
    await this.coachRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    return this.coachRepo.delete(id);
  }
}
