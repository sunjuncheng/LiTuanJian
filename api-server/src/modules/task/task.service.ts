import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { User } from '../../entities/user.entity';
import { isWithinRange } from '../../common/utils/location';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(TaskCheckpoint) private checkpointRepo: Repository<TaskCheckpoint>,
    @InjectRepository(TaskParticipant) private participantRepo: Repository<TaskParticipant>,
    @InjectRepository(CheckinRecord) private checkinRepo: Repository<CheckinRecord>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getPublicTasks(userId?: number) {
    const tasks = await this.taskRepo.find({
      where: { status: 'published' },
      order: { createdAt: 'DESC' },
    });
    const result = [];
    for (const task of tasks) {
      const checkpointCount = await this.checkpointRepo.count({ where: { taskId: task.id } });
      const participantCount = await this.participantRepo.count({ where: { taskId: task.id } });
      let accepted = false;
      if (userId) {
        const p = await this.participantRepo.findOne({ where: { taskId: task.id, userId } });
        accepted = !!p;
      }
      const now = new Date();
      const isEnded = task.deadline ? new Date(task.deadline) < now : false;
      result.push({
        ...task,
        checkpointCount,
        participantCount,
        accepted,
        deadlineText: task.deadline ? task.deadline.toLocaleDateString() : '',
        canAccept: task.status === 'published' && !isEnded && !accepted,
        statusText: isEnded ? '已结束' : (task.status === 'published' ? '进行中' : '未发布'),
      });
    }
    return result;
  }

  async getMyTasks(userId: number) {
    const participants = await this.participantRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const result = [];
    for (const p of participants) {
      const task = await this.taskRepo.findOne({ where: { id: p.taskId } });
      if (!task) continue;
      const totalCheckpoints = await this.checkpointRepo.count({ where: { taskId: task.id } });
      const checkins = await this.checkinRepo.find({ where: { taskId: task.id, userId } });
      const passedCount = checkins.filter((c) => c.status === 'passed').length;
      const percentage = totalCheckpoints > 0 ? Math.round((passedCount / totalCheckpoints) * 100) : 0;
      result.push({
        taskId: task.id,
        name: task.name,
        description: task.description,
        participantType: p.participantType,
        participantTypeText: p.participantType === 'solo' ? '单人' : '团队',
        status: p.status,
        statusText: p.status === 'completed' ? '已完成' : (p.status === 'overdue' ? '已逾期' : '进行中'),
        unlocked: p.unlocked,
        percentage,
        passedCount,
        totalCheckpoints,
        deadline: task.deadline,
        deadlineText: task.deadline ? task.deadline.toLocaleDateString() : '',
        createdAt: p.createdAt,
      });
    }
    return result;
  }

  async getTaskDetail(taskId: number) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('任务不存在');
    const checkpoints = await this.checkpointRepo.find({
      where: { taskId: id },
      order: { sortOrder: 'ASC' },
    });
    const participantCount = await this.participantRepo.count({ where: { taskId: id } });
    const now = new Date();
    const isEnded = task.deadline ? new Date(task.deadline) < now : false;
    return {
      ...task,
      checkpoints: checkpoints.map((cp) => ({
        ...cp,
        latitude: Number(cp.latitude) || 0,
        longitude: Number(cp.longitude) || 0,
        referenceImage: this.fixImageUrl(cp.referenceImage),
      })),
      participantCount,
      isEnded,
      statusText: isEnded ? '已结束' : (task.status === 'published' ? '进行中' : '未发布'),
      canAccept: task.status === 'published' && !isEnded,
      startPoint: {
        name: task.startPointName,
        latitude: Number(task.startPointLat) || 0,
        longitude: Number(task.startPointLng) || 0,
        range: task.startPointRange,
      },
    };
  }

  private fixImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    return url.replace(':3000', '');
  }

  async createTask(coachId: number, data: any) {
    const task = this.taskRepo.create({
      coachId,
      name: data.name,
      description: data.description,
      notice: data.notice,
      deadline: data.deadline ? new Date(data.deadline) : null,
      acceptMode: data.acceptMode,
      needReview: data.needReview,
      status: data.status,
      startPointName: data.startPoint.name,
      startPointLat: data.startPoint.latitude,
      startPointLng: data.startPoint.longitude,
      startPointRange: data.startPoint.range,
    });
    const saved = await this.taskRepo.save(task);

    const checkpoints = data.checkpoints.map((cp, index) =>
      this.checkpointRepo.create({
        taskId: saved.id,
        name: cp.name,
        latitude: cp.latitude ? Number(cp.latitude) : 0,
        longitude: cp.longitude ? Number(cp.longitude) : 0,
        range: cp.range ? Number(cp.range) : 50,
        referenceImage: cp.referenceImage || '',
        requireGroupPhoto: !!cp.requireGroupPhoto,
        allowRemark: cp.allowRemark !== false,
        sortOrder: index,
      }),
    );
    await this.checkpointRepo.save(checkpoints);
    return saved;
  }

  async deleteTask(id: number) {
    await this.checkpointRepo.delete({ taskId: id });
    await this.taskRepo.delete(id);
    return { success: true };
  }

  async getCoachTasks(coachId: number) {
    const tasks = await this.taskRepo.find({
      where: { coachId },
      order: { createdAt: 'DESC' },
    });
    const result = [];
    for (const task of tasks) {
      const checkpointCount = await this.checkpointRepo.count({ where: { taskId: task.id } });
      const participantCount = await this.participantRepo.count({ where: { taskId: task.id } });
      result.push({ ...task, checkpointCount, participantCount, completionRate: 0 });
    }
    return result;
  }

  async acceptTask(taskId: number, userId: number, mode: string, teamId?: number) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('任务不存在');
    if (task.status !== 'published') throw new BadRequestException('任务未发布');
    const now = new Date();
    if (task.deadline && new Date(task.deadline) < now) {
      throw new BadRequestException('任务已结束，无法接单');
    }

    const existing = await this.participantRepo.findOne({ where: { taskId: id, userId } });
    if (existing) throw new BadRequestException('已承接该任务');

    const participant = this.participantRepo.create({
      taskId: id,
      userId,
      teamId: mode === 'team' ? teamId : null,
      participantType: mode,
      status: 'in_progress',
    });
    return this.participantRepo.save(participant);
  }

  async unlockTask(taskId: number, userId: number, location: { latitude: number; longitude: number }) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('任务不存在');

    const participant = await this.participantRepo.findOne({ where: { taskId: id, userId } });
    if (!participant) throw new BadRequestException('未承接该任务');
    if (participant.unlocked) return { unlocked: true, message: '已解锁' };

    const userLat = Number(location.latitude);
    const userLng = Number(location.longitude);
    if (isNaN(userLat) || isNaN(userLng)) {
      throw new BadRequestException('位置信息无效，请重试');
    }

    const result = isWithinRange(
      userLat,
      userLng,
      Number(task.startPointLat),
      Number(task.startPointLng),
      task.startPointRange,
    );

    if (!result.inRange) {
      throw new BadRequestException(`未到达启动点，距离 ${result.distance} 米`);
    }

    participant.unlocked = true;
    participant.unlockLat = userLat;
    participant.unlockLng = userLng;
    participant.unlockTime = new Date();
    await this.participantRepo.save(participant);

    return { unlocked: true, message: '解锁成功' };
  }

  async getMyProgress(taskId: number, userId: number) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const participant = await this.participantRepo.findOne({ where: { taskId: id, userId } });
    if (!participant) return null;

    const totalCheckpoints = await this.checkpointRepo.count({ where: { taskId: id } });
    const checkins = await this.checkinRepo.find({ where: { taskId: id, userId } });
    const passedCount = checkins.filter((c) => c.status === 'passed').length;
    const reviewingCount = checkins.filter((c) => c.status === 'reviewing').length;
    const pendingCount = totalCheckpoints - passedCount - reviewingCount;

    return {
      unlocked: participant.unlocked,
      percentage: totalCheckpoints > 0 ? Math.round((passedCount / totalCheckpoints) * 100) : 0,
      passedCount,
      reviewingCount,
      pendingCount: Math.max(0, pendingCount),
    };
  }

  async getTaskCheckpoints(taskId: number, userId: number) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const checkpoints = await this.checkpointRepo.find({
      where: { taskId: id },
      order: { sortOrder: 'ASC' },
    });
    const checkins = await this.checkinRepo.find({ where: { taskId: id, userId } });

    return checkpoints.map((cp) => {
      const checkin = checkins.find((c) => c.checkpointId === cp.id);
      return {
        ...cp,
        latitude: Number(cp.latitude) || 0,
        longitude: Number(cp.longitude) || 0,
        referenceImage: this.fixImageUrl(cp.referenceImage),
        status: checkin ? checkin.status : 'pending',
        userPhoto: checkin?.photoUrl,
        rejectReason: checkin?.rejectReason,
      };
    });
  }

  async getReviewCheckpoints(taskId: number, participantId: number) {
    const id = Number(taskId);
    const pId = Number(participantId);
    if (isNaN(id) || isNaN(pId)) throw new BadRequestException('参数无效');
    const checkpoints = await this.checkpointRepo.find({
      where: { taskId: id },
      order: { sortOrder: 'ASC' },
    });
    const participant = await this.participantRepo.findOne({ where: { id: pId } });
    if (!participant) throw new NotFoundException('参与者不存在');

    const checkins = await this.checkinRepo.find({
      where: { taskId: id, userId: participant.userId },
    });

    return checkpoints.map((cp) => {
      const checkin = checkins.find((c) => c.checkpointId === cp.id);
      return {
        ...cp,
        latitude: Number(cp.latitude) || 0,
        longitude: Number(cp.longitude) || 0,
        referenceImage: this.fixImageUrl(cp.referenceImage),
        status: checkin ? checkin.status : 'pending',
        userPhoto: checkin?.photoUrl,
        userLocation: checkin
          ? { latitude: Number(checkin.latitude) || 0, longitude: Number(checkin.longitude) || 0 }
          : null,
        submitTime: checkin?.createdAt,
        rejectReason: checkin?.rejectReason,
      };
    });
  }

  async reviewCheckin(body: any, status: string) {
    const taskId = Number(body.taskId);
    const checkpointId = Number(body.checkpointId);
    const participantId = Number(body.participantId);
    if (isNaN(taskId) || isNaN(checkpointId) || isNaN(participantId)) {
      throw new BadRequestException('参数无效');
    }
    const checkin = await this.checkinRepo.findOne({
      where: {
        taskId,
        checkpointId,
        participantId,
      },
      order: { createdAt: 'DESC' },
    });
    if (!checkin) throw new NotFoundException('打卡记录不存在');

    checkin.status = status;
    checkin.reviewTime = new Date();
    if (status === 'rejected') {
      checkin.rejectReason = body.reason;
    }
    return this.checkinRepo.save(checkin);
  }

  async getTaskParticipants(taskId: number) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const participants = await this.participantRepo.find({
      where: { taskId: id, participantType: 'solo' },
    });
    const totalCheckpoints = await this.checkpointRepo.count({ where: { taskId: id } });
    const checkins = await this.checkinRepo.find({ where: { taskId: id } });
    const result = [];
    for (const p of participants) {
      const user = await this.userRepo.findOne({ where: { id: p.userId } });
      const userCheckins = checkins.filter((c) => c.userId === p.userId);
      const passedCount = userCheckins.filter((c) => c.status === 'passed').length;
      const completionRate = totalCheckpoints > 0 ? Math.round((passedCount / totalCheckpoints) * 100) : 0;
      result.push({
        id: p.id,
        userId: p.userId,
        nickname: user?.nickname || '未知用户',
        avatarUrl: user?.avatarUrl || '',
        unlocked: p.unlocked,
        status: p.status,
        statusText: p.status === 'completed' ? '已完成' : (p.status === 'overdue' ? '已逾期' : '进行中'),
        completionRate,
      });
    }
    return result;
  }

  async getTaskTeams(taskId: number) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const participants = await this.participantRepo.find({
      where: { taskId: id, participantType: 'team' },
    });
    const teamIds = [...new Set(participants.map((p) => p.teamId).filter(Boolean))];
    return teamIds.map((teamId) => ({
      id: teamId,
      name: `队伍${teamId}`,
      leaderName: '',
      memberCount: participants.filter((p) => p.teamId === teamId).length,
      completionRate: 0,
    }));
  }

  async manualUnlock(taskId: number, participantId: number) {
    const id = Number(taskId);
    const pId = Number(participantId);
    if (isNaN(id) || isNaN(pId)) throw new BadRequestException('参数无效');
    const participant = await this.participantRepo.findOne({ where: { id: pId, taskId: id } });
    if (!participant) throw new NotFoundException('参与者不存在');
    participant.unlocked = true;
    participant.unlockTime = new Date();
    return this.participantRepo.save(participant);
  }
}

