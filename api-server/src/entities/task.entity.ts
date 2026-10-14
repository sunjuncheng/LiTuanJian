import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column({ name: 'name', length: 200 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'notice', type: 'text', nullable: true })
  notice: string;

  @Column({ name: 'deadline', type: 'datetime', nullable: true })
  deadline: Date;

  @Column({
    name: 'accept_mode',
    type: 'tinyint',
    default: 3,
    comment: '1仅单人 2仅团队 3均可',
  })
  acceptMode: number;

  @Column({ name: 'need_review', default: true })
  needReview: boolean;

  @Column({
    name: 'status',
    length: 20,
    default: 'draft',
    comment: 'draft/published/ended',
  })
  status: string;

  @Column({ name: 'start_point_name', length: 200 })
  startPointName: string;

  @Column({ name: 'start_point_lat', type: 'decimal', precision: 10, scale: 6 })
  startPointLat: number;

  @Column({ name: 'start_point_lng', type: 'decimal', precision: 10, scale: 6 })
  startPointLng: number;

  @Column({ name: 'start_point_range', default: 50 })
  startPointRange: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
