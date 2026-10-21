import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('live_rooms')
export class LiveRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', length: 200 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cover_image', type: 'text', nullable: true })
  coverImage: string;

  @Column({ name: 'anchor_name', length: 100, nullable: true })
  anchorName: string;

  @Column({ name: 'stream_name', length: 100, unique: true })
  streamName: string;

  @Column({ name: 'status', length: 20, default: 'draft' })
  status: string;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
