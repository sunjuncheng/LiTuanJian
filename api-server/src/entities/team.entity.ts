import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'leader_id' })
  leaderId: number;

  @Column({ name: 'invite_code', length: 20, unique: true })
  inviteCode: string;

  @Column({ name: 'status', default: 1, comment: '1正常 0已解散' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
