import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'team_id' })
  teamId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'is_leader', default: false })
  isLeader: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
