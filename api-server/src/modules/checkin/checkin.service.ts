import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { Task } from '../../entities/task.entity';
import { isWithinRange } from '../../common/utils/location';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(CheckinRecord) private checkinRepo: Repository<CheckinRecord>,
    @InjectRepository(TaskCheckpoint) private checkpointRepo: Repository<TaskCheckpoint>,
    @InjectRepository(TaskParticipant) private participantRepo: Repository<TaskParticipant>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}

  async submitCheckin(userId: number, data: any) {
    const taskId = Number(data.taskId);
    const checkpointId = Number(data.checkpointId);
    if (isNaN(taskId) || isNaN(checkpointId)) {
      throw new BadRequestException('参数无效，请重试');
    }

    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('任务不存在');
    const now = new Date();
    if (task.deadline && new Date(task.deadline) < now) {
      throw new BadRequestException('任务已过时，无法打卡');
    }

    const participant = await this.participantRepo.findOne({
      where: { taskId, userId },
    });
    if (!participant) throw new BadRequestException('未承接该任务');
    if (!participant.unlocked) throw new BadRequestException('请先到启动点解锁任务');

    const checkpoint = await this.checkpointRepo.findOne({
      where: { id: checkpointId, taskId },
    });
    if (!checkpoint) throw new NotFoundException('打卡点不存在');

    const userLat = Number(data.latitude);
    const userLng = Number(data.longitude);
    if (isNaN(userLat) || isNaN(userLng)) {
      throw new BadRequestException('位置信息无效，请重试');
    }

    const result = isWithinRange(
      userLat,
      userLng,
      Number(checkpoint.latitude),
      Number(checkpoint.longitude),
      checkpoint.range,
    );
    if (!result.inRange) {
      throw new BadRequestException(`未到达打卡点，距离 ${result.distance} 米`);
    }

    const existing = await this.checkinRepo.findOne({
      where: {
        taskId,
        checkpointId,
        userId,
      },
    });

    if (existing) {
      existing.photoUrl = data.photo;
      existing.remark = data.remark;
      existing.latitude = userLat;
      existing.longitude = userLng;
      existing.accuracy = data.accuracy;
      existing.status = 'reviewing';
      existing.rejectReason = null;
      return this.checkinRepo.save(existing);
    }

    const record = this.checkinRepo.create({
      taskId,
      checkpointId,
      participantId: participant.id,
      userId,
      teamId: participant.teamId,
      photoUrl: data.photo,
      remark: data.remark,
      latitude: userLat,
      longitude: userLng,
      accuracy: data.accuracy,
      status: 'reviewing',
    });
    return this.checkinRepo.save(record);
  }
}
