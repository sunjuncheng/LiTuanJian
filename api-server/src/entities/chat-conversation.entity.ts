import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chat_conversations')
export class ChatConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type', length: 30, default: 'team' })
  type: string;

  @Column({ name: 'team_id', nullable: true })
  teamId: number;

  @Column({ name: 'last_message', type: 'text', nullable: true })
  lastMessage: string;

  @Column({ name: 'last_message_time', type: 'datetime', nullable: true })
  lastMessageTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
