import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { User } from '../../entities/user.entity';
import { UserMessage } from '../../entities/user-message.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskCheckpoint, TaskParticipant, CheckinRecord, User, UserMessage, TeamMember]),
    SystemConfigModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
