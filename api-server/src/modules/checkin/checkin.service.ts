import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { isWithinRange } from '../../common/utils/location';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(CheckinRecord) private checkinRepo: Repository<CheckinRecord>,
    @InjectRepository(TaskCheckpoint) private checkpointRepo: Repository<TaskCheckpoint>,
    @InjectRepository(TaskParticipant) private participantRepo: Repository<TaskParticipant>,
  ) {}

  async submitCheckin(userId: number, data: any) {
    const participant = await this.participantRepo.findOne({
      where: { taskId: data.taskId, userId },
    });
    if (!participant) throw new BadRequestException('未承接该任务');
    if (!participant.unlocked) throw new BadRequestException('请先到启动点解锁任务');

    const checkpoint = await this.checkpointRepo.findOne({
      where: { id: data.checkpointId, taskId: data.taskId },
    });
    if (!checkpoint) throw new NotFoundException('打卡点不存在');

    const result = isWithinRange(
      data.latitude,
      data.longitude,
      Number(checkpoint.latitude),
      Number(checkpoint.longitude),
      checkpoint.range,
    );
    if (!result.inRange) {
      throw new BadRequestException(`未到达打卡点，距离 ${result.distance} 米`);
    }

    const existing = await this.checkinRepo.findOne({
      where: {
        taskId: data.taskId,
        checkpointId: data.checkpointId,
        userId,
      },
    });

    if (existing) {
      existing.photoUrl = data.photo;
      existing.remark = data.remark;
      existing.latitude = data.latitude;
      existing.longitude = data.longitude;
      existing.accuracy = data.accuracy;
      existing.status = 'reviewing';
      existing.rejectReason = null;
      return this.checkinRepo.save(existing);
    }

    const record = this.checkinRepo.create({
      taskId: data.taskId,
      checkpointId: data.checkpointId,
      participantId: participant.id,
      userId,
      teamId: participant.teamId,
      photoUrl: data.photo,
      remark: data.remark,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      status: 'reviewing',
    });
    return this.checkinRepo.save(record);
  }
}
