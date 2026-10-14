import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('task_participants')
export class TaskParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'team_id', nullable: true })
  teamId: number;

  @Column({
    name: 'participant_type',
    length: 10,
    comment: 'solo/team',
  })
  participantType: string;

  @Column({ name: 'unlocked', default: false })
  unlocked: boolean;

  @Column({ name: 'unlock_lat', type: 'decimal', precision: 10, scale: 6, nullable: true })
  unlockLat: number;

  @Column({ name: 'unlock_lng', type: 'decimal', precision: 10, scale: 6, nullable: true })
  unlockLng: number;

  @Column({ name: 'unlock_time', type: 'datetime', nullable: true })
  unlockTime: Date;

  @Column({
    name: 'status',
    length: 20,
    default: 'in_progress',
    comment: 'in_progress/completed/overdue',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
