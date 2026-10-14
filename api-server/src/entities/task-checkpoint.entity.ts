import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('task_checkpoints')
export class TaskCheckpoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'name', length: 200 })
  name: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ name: 'range', default: 50 })
  range: number;

  @Column({ name: 'reference_image', nullable: true })
  referenceImage: string;

  @Column({ name: 'require_group_photo', default: false })
  requireGroupPhoto: boolean;

  @Column({ name: 'allow_remark', default: true })
  allowRemark: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
