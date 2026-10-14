import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Coach } from '../../entities/coach.entity';
import { Task } from '../../entities/task.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { Team } from '../../entities/team.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(TaskCheckpoint) private checkpointRepo: Repository<TaskCheckpoint>,
    @InjectRepository(TaskParticipant) private participantRepo: Repository<TaskParticipant>,
    @InjectRepository(CheckinRecord) private checkinRepo: Repository<CheckinRecord>,
    @InjectRepository(Team) private teamRepo: Repository<Team>,
  ) {}

  async getDashboardStats() {
    const [userCount, coachCount] = await Promise.all([
      this.userRepo.count(),
      this.coachRepo.count(),
    ]);
    const publishedTasks = await this.taskRepo.count({ where: { status: 'published' } });
    const tasks = await this.taskRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });
    const recentTasks = [];
    for (const task of tasks) {
      const checkpointCount = await this.checkpointRepo.count({ where: { taskId: task.id } });
      const participants = await this.participantRepo.find({ where: { taskId: task.id } });
      const participantCount = participants.length;
      const checkins = await this.checkinRepo.find({ where: { taskId: task.id } });
      let completionRate = 0;
      if (participantCount > 0 && checkpointCount > 0) {
        let totalPercent = 0;
        for (const p of participants) {
          const userCheckins = checkins.filter((c) => c.userId === p.userId);
          const userPassed = userCheckins.filter((c) => c.status === 'passed').length;
          totalPercent += Math.round((userPassed / checkpointCount) * 100);
        }
        completionRate = Math.round(totalPercent / participantCount);
      }
      recentTasks.push({
        ...task,
        checkpointCount,
        participantCount,
        completionRate,
      });
    }
    return {
      stats: [
        { label: '总用户数', value: userCount, color: '#409eff' },
        { label: '总教练数', value: coachCount, color: '#67c23a' },
        { label: '进行中任务', value: publishedTasks, color: '#e6a23c' },
        { label: '今日打卡数', value: 0, color: '#f56c6c' },
      ],
      recentTasks,
    };
  }

  async getUserList(params: { page: number; pageSize: number; keyword?: string }) {
    const qb = this.userRepo.createQueryBuilder('u');
    if (params.keyword) {
      qb.where('u.nickname LIKE :keyword OR u.phone LIKE :keyword', {
        keyword: `%${params.keyword}%`,
      });
    }
    qb.orderBy('u.createdAt', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize);
    const [list, total] = await qb.getManyAndCount();
    return { list, total };
  }

  async updateUserStatus(id: number, status: number) {
    await this.userRepo.update(id, { status });
    return this.userRepo.findOne({ where: { id } });
  }

  async updateUser(id: number, data: { nickname?: string; phone?: string }) {
    const updateData: any = {};
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.phone !== undefined) updateData.phone = data.phone;
    await this.userRepo.update(id, updateData);
    return this.userRepo.findOne({ where: { id } });
  }

  async getTaskList(params: { page: number; pageSize: number; name?: string; status?: string }) {
    const qb = this.taskRepo.createQueryBuilder('t');
    if (params.name) {
      qb.where('t.name LIKE :name', { name: `%${params.name}%` });
    }
    if (params.status) {
      qb.andWhere('t.status = :status', { status: params.status });
    }
    qb.orderBy('t.createdAt', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize);
    const [list, total] = await qb.getManyAndCount();

    const result = [];
    for (const task of list) {
      const coach = await this.coachRepo.findOne({ where: { id: task.coachId } });
      const checkpointCount = await this.checkpointRepo.count({ where: { taskId: task.id } });
      const participants = await this.participantRepo.find({ where: { taskId: task.id } });
      const participantCount = participants.length;
      const checkins = await this.checkinRepo.find({ where: { taskId: task.id } });

      let completionRate = 0;
      if (participantCount > 0 && checkpointCount > 0) {
        let totalPercent = 0;
        for (const p of participants) {
          const userCheckins = checkins.filter((c) => c.userId === p.userId);
          const userPassed = userCheckins.filter((c) => c.status === 'passed').length;
          totalPercent += Math.round((userPassed / checkpointCount) * 100);
        }
        completionRate = Math.round(totalPercent / participantCount);
      }

      result.push({
        ...task,
        coachName: coach?.name || '',
        checkpointCount,
        participantCount,
        completionRate,
      });
    }
    return { list: result, total };
  }

  async getTaskDetail(id: number) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) return null;
    const coach = await this.coachRepo.findOne({ where: { id: task.coachId } });
    const checkpoints = await this.checkpointRepo.find({
      where: { taskId: id },
      order: { sortOrder: 'ASC' },
    });
    const participants = await this.participantRepo.find({ where: { taskId: id } });
    const checkins = await this.checkinRepo.find({
      where: { taskId: id },
      order: { createdAt: 'ASC' },
    });
    const passedCount = checkins.filter((c) => c.status === 'passed').length;

    let completionRate = 0;
    if (participants.length > 0 && checkpoints.length > 0) {
      let totalPercent = 0;
      for (const p of participants) {
        const userCheckins = checkins.filter((c) => c.userId === p.userId);
        const userPassed = userCheckins.filter((c) => c.status === 'passed').length;
        totalPercent += Math.round((userPassed / checkpoints.length) * 100);
      }
      completionRate = Math.round(totalPercent / participants.length);
    }

    const participantList = [];
    for (const p of participants) {
      const user = await this.userRepo.findOne({ where: { id: p.userId } });
      let teamName = '';
      if (p.teamId) {
        const team = await this.teamRepo.findOne({ where: { id: p.teamId } });
        teamName = team?.name || '';
      }
      const userCheckins = checkins.filter((c) => c.userId === p.userId);
      const userPassed = userCheckins.filter((c) => c.status === 'passed').length;
      const userReviewing = userCheckins.filter((c) => c.status === 'reviewing').length;
      const lastCheckin = userCheckins.length > 0 ? userCheckins[userCheckins.length - 1] : null;

      const checkpointRecords = checkpoints.map((cp) => {
        const rec = userCheckins.find((c) => c.checkpointId === cp.id);
        return {
          checkinId: rec?.id || null,
          checkpointId: cp.id,
          checkpointName: cp.name,
          status: rec?.status || 'pending',
          photoUrl: this.fixImageUrl(rec?.photoUrl || ''),
          checkinTime: rec?.createdAt || null,
          reviewTime: rec?.reviewTime || null,
          rejectReason: rec?.rejectReason || '',
        };
      });

      participantList.push({
        id: p.id,
        userId: p.userId,
        nickname: user?.nickname || '',
        phone: user?.phone || '',
        participantType: p.participantType,
        participantTypeText: p.participantType === 'solo' ? '单人' : '团队',
        teamId: p.teamId || null,
        teamName,
        status: p.status,
        statusText: { in_progress: '进行中', completed: '已完成', overdue: '已超时' }[p.status] || p.status,
        unlocked: p.unlocked,
        percentage: checkpoints.length > 0 ? Math.round((userPassed / checkpoints.length) * 100) : 0,
        passedCount: userPassed,
        reviewingCount: userReviewing,
        totalCheckpoints: checkpoints.length,
        joinedAt: p.createdAt,
        lastCheckinTime: lastCheckin?.createdAt || null,
        completedAt: p.status === 'completed' ? lastCheckin?.createdAt || p.updatedAt : null,
        checkpoints: checkpointRecords,
      });
    }

    return {
      ...task,
      coachName: coach?.name || '',
      checkpointCount: checkpoints.length,
      participantCount: participants.length,
      completionRate,
      checkpoints: checkpoints.map((cp) => ({
        ...cp,
        latitude: Number(cp.latitude),
        longitude: Number(cp.longitude),
        referenceImage: this.fixImageUrl(cp.referenceImage),
      })),
      participants: participantList,
    };
  }

  private fixImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    return url.replace(':3000', '');
  }

  async deleteTask(id: number) {
    await this.checkpointRepo.delete({ taskId: id });
    await this.participantRepo.delete({ taskId: id });
    await this.checkinRepo.delete({ taskId: id });
    return this.taskRepo.delete(id);
  }

  async batchDeleteTasks(ids: number[]) {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    for (const id of ids) {
      await this.checkpointRepo.delete({ taskId: id });
      await this.participantRepo.delete({ taskId: id });
      await this.checkinRepo.delete({ taskId: id });
    }
    const result = await this.taskRepo.delete(ids);
    return { success: true, count: result.affected || 0 };
  }

  getSystemConfig() {
    return {
      systemName: '团建打卡管理系统',
      userWxAppId: process.env.WX_USER_APPID || '',
      userWxAppSecret: process.env.WX_USER_SECRET || '',
      coachWxAppId: process.env.WX_COACH_APPID || '',
      coachWxAppSecret: process.env.WX_COACH_SECRET || '',
      uploadSizeLimit: 10,
      defaultLocationRange: 50,
    };
  }

  updateSystemConfig(data: any) {
    return { ...data, updated: true };
  }

  async getPendingCheckins(taskId: number) {
    const checkins = await this.checkinRepo.find({
      where: { taskId, status: 'reviewing' },
      order: { createdAt: 'ASC' },
    });
    return checkins.map((c) => ({
      ...c,
      photoUrl: this.fixImageUrl(c.photoUrl),
    }));
  }

  async reviewCheckin(checkinId: number, status: 'passed' | 'rejected', rejectReason?: string) {
    const checkin = await this.checkinRepo.findOne({ where: { id: checkinId } });
    if (!checkin) throw new Error('打卡记录不存在');
    checkin.status = status;
    checkin.rejectReason = rejectReason || null;
    checkin.reviewTime = new Date();
    return this.checkinRepo.save(checkin);
  }
}
