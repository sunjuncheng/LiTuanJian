import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('checkin_records')
export class CheckinRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'checkpoint_id' })
  checkpointId: number;

  @Column({ name: 'participant_id' })
  participantId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'team_id', nullable: true })
  teamId: number;

  @Column({ name: 'photo_url' })
  photoUrl: string;

  @Column({ name: 'remark', type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ name: 'accuracy', type: 'decimal', precision: 10, scale: 2, nullable: true })
  accuracy: number;

  @Column({
    name: 'status',
    length: 20,
    default: 'reviewing',
    comment: 'reviewing/passed/rejected',
  })
  status: string;

  @Column({ name: 'reviewer_id', nullable: true })
  reviewerId: number;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason: string;

  @Column({ name: 'review_time', type: 'datetime', nullable: true })
  reviewTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
