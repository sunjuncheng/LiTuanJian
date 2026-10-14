import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../../entities/admin.entity';
import { User } from '../../entities/user.entity';
import { Coach } from '../../entities/coach.entity';
import { Task } from '../../entities/task.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { Team } from '../../entities/team.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CoachModule } from '../coach/coach.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, User, Coach, Task, TaskCheckpoint, TaskParticipant, CheckinRecord, Team]),
    CoachModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
