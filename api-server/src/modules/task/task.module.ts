import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskCheckpoint, TaskParticipant, CheckinRecord])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
