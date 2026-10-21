import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { User } from '../../entities/user.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { ChatConversation } from '../../entities/chat-conversation.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamChatGateway } from './team-chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Team,
      TeamMember,
      User,
      TaskParticipant,
      ChatConversation,
      ChatMessage,
    ]),
  ],
  controllers: [TeamController],
  providers: [TeamService, TeamChatGateway],
  exports: [TeamService, TeamChatGateway],
})
export class TeamModule {}
