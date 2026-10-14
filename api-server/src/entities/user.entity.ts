import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'openid', unique: true, nullable: true })
  openid: string;

  @Column({ name: 'unionid', nullable: true })
  unionid: string;

  @Column({ name: 'nickname', length: 100, nullable: true })
  nickname: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'password', nullable: true, select: false })
  password: string;

  @Column({ name: 'status', default: 1, comment: '1正常 0禁用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
