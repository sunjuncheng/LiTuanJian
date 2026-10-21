import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { TaskCheckpoint } from '../../entities/task-checkpoint.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { CheckinRecord } from '../../entities/checkin-record.entity';
import { User } from '../../entities/user.entity';
import { UserMessage } from '../../entities/user-message.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { isWithinRange } from '../../common/utils/location';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(TaskCheckpoint) private checkpointRepo: Repository<TaskCheckpoint>,
    @InjectRepository(TaskParticipant) private participantRepo: Repository<TaskParticipant>,
    @InjectRepository(CheckinRecord) private checkinRepo: Repository<CheckinRecord>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserMessage) private messageRepo: Repository<UserMessage>,
    @InjectRepository(TeamMember) private memberRepo: Repository<TeamMember>,
    private configService: SystemConfigService,
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
        coverImage: this.fixImageUrl(task.coverImage),
        checkpointCount,
        participantCount,
        accepted,
        isEnded,
        deadlineText: task.deadline ? task.deadline.toLocaleDateString() : '',
        canAccept: task.status === 'published' && !isEnded && !accepted,
        statusText: isEnded ? '已过时' : (task.status === 'published' ? '进行中' : '未发布'),
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
    const now = new Date();
    for (const p of participants) {
      const task = await this.taskRepo.findOne({ where: { id: p.taskId } });
      if (!task) continue;
      const totalCheckpoints = await this.checkpointRepo.count({ where: { taskId: task.id } });
      const checkins = await this.checkinRepo.find({ where: { taskId: task.id, userId } });
      const passedCount = checkins.filter((c) => c.status === 'passed').length;
      const percentage = totalCheckpoints > 0 ? Math.round((passedCount / totalCheckpoints) * 100) : 0;
      const isTaskEnded = task.deadline ? new Date(task.deadline) < now : false;
      const displayStatus = isTaskEnded && p.status === 'in_progress' ? 'overdue' : p.status;
      result.push({
        taskId: task.id,
        name: task.name,
        description: task.description,
        participantType: p.participantType,
        participantTypeText: p.participantType === 'solo' ? '单人' : '团队',
        status: displayStatus,
        statusText: displayStatus === 'completed' ? '已完成' : (displayStatus === 'overdue' ? '已过时' : '进行中'),
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
      coverImage: this.fixImageUrl(task.coverImage),
      checkpoints: checkpoints.map((cp) => ({
        ...cp,
        latitude: Number(cp.latitude) || 0,
        longitude: Number(cp.longitude) || 0,
        referenceImage: this.fixImageUrl(cp.referenceImage),
      })),
      participantCount,
      isEnded,
      statusText: isEnded ? '已过时' : (task.status === 'published' ? '进行中' : '未发布'),
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
    const baseUrl = process.env.BASE_URL || 'http://123.56.72.218';
    const match = url.match(/(\/uploads\/.+)$/);
    if (match) {
      return baseUrl + match[1];
    }
    if (url.startsWith('/uploads/')) {
      return baseUrl + url;
    }
    return url;
  }

  async createTask(coachId: number, data: any) {
    if (![1, 2].includes(data.acceptMode)) {
      throw new BadRequestException('接单模式无效，仅支持仅个人或仅团队');
    }
    const task = this.taskRepo.create({
      coachId,
      name: data.name,
      description: data.description,
      notice: data.notice,
      coverImage: data.coverImage || '',
      deadline: data.deadline ? new Date(data.deadline) : null,
      acceptMode: data.acceptMode,
      minTeamSize: data.minTeamSize || 2,
      needReview: data.needReview,
      status: data.status,
      startPointName: data.startPoint.name,
      startPointLat: data.startPoint.latitude,
      startPointLng: data.startPoint.longitude,
      startPointRange: data.startPoint.range || this.configService.get('defaultLocationRange'),
    });
    const saved = await this.taskRepo.save(task);

    const checkpoints = data.checkpoints.map((cp, index) =>
      this.checkpointRepo.create({
        taskId: saved.id,
        name: cp.name,
        latitude: cp.latitude ? Number(cp.latitude) : 0,
        longitude: cp.longitude ? Number(cp.longitude) : 0,
        range: cp.range ? Number(cp.range) : this.configService.get('defaultLocationRange'),
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

    if (mode === 'solo' && task.acceptMode === 2) {
      throw new BadRequestException('该任务仅支持团队接单');
    }
    if (mode === 'team' && task.acceptMode === 1) {
      throw new BadRequestException('该任务仅支持单人接单');
    }

    const existing = await this.participantRepo.findOne({ where: { taskId: id, userId } });
    if (existing) throw new BadRequestException('您已承接该任务');

    if (mode === 'team') {
      if (!teamId) throw new BadRequestException('请先创建或加入队伍');
      const teamMember = await this.memberRepo.findOne({ where: { teamId, userId } });
      if (!teamMember) throw new BadRequestException('您不在该队伍中');
      if (!teamMember.isLeader) throw new BadRequestException('仅队长可以发起团队接单');

      const teamParticipants = await this.participantRepo.find({ where: { taskId: id, teamId } });
      if (teamParticipants.length > 0) {
        throw new BadRequestException('该队伍已承接此任务');
      }

      const members = await this.memberRepo.find({ where: { teamId } });
      if (members.length < task.minTeamSize) {
        throw new BadRequestException(`队伍人数不足，该任务要求至少 ${task.minTeamSize} 人`);
      }

      const participants = members.map((m) =>
        this.participantRepo.create({
          taskId: id,
          userId: m.userId,
          teamId,
          participantType: 'team',
          status: 'in_progress',
        }),
      );
      return this.participantRepo.save(participants);
    }

    const participant = this.participantRepo.create({
      taskId: id,
      userId,
      teamId: null,
      participantType: mode,
      status: 'in_progress',
    });
    return this.participantRepo.save(participant);
  }

  async cancelAccept(taskId: number, userId: number) {
    const id = Number(taskId);
    const participant = await this.participantRepo.findOne({ where: { taskId: id, userId } });
    if (!participant) throw new BadRequestException('您未承接该任务');
    if (participant.unlocked) throw new BadRequestException('已解锁启动点，无法取消');
    if (participant.participantType === 'team') {
      throw new BadRequestException('团队接单请由队长放弃');
    }
    await this.checkinRepo.delete({ taskId: id, userId });
    await this.participantRepo.delete({ id: participant.id });
    return { success: true };
  }

  async giveUpTeamTask(taskId: number, userId: number) {
    const id = Number(taskId);
    const leaderParticipant = await this.participantRepo.findOne({ where: { taskId: id, userId } });
    if (!leaderParticipant) throw new BadRequestException('您未承接该任务');
    if (leaderParticipant.participantType !== 'team') {
      throw new BadRequestException('仅团队接单可放弃');
    }
    const teamId = leaderParticipant.teamId;
    const member = await this.memberRepo.findOne({ where: { teamId, userId } });
    if (!member || !member.isLeader) throw new BadRequestException('仅队长可放弃团队接单');

    const anyUnlocked = await this.participantRepo.findOne({ where: { taskId: id, teamId, unlocked: true } });
    if (anyUnlocked) throw new BadRequestException('已有成员解锁启动点，无法放弃');

    await this.checkinRepo.delete({ taskId: id, teamId });
    await this.participantRepo.delete({ taskId: id, teamId });
    return { success: true };
  }

  async unlockTask(taskId: number, userId: number, location: { latitude: number; longitude: number }) {
    const id = Number(taskId);
    if (isNaN(id)) throw new BadRequestException('任务ID无效');
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('任务不存在');

    const now = new Date();
    if (task.deadline && new Date(task.deadline) < now) {
      throw new BadRequestException('任务已过时，无法解锁');
    }

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

    if (participant.participantType === 'team' && participant.teamId) {
      const teamMembers = await this.memberRepo.find({ where: { teamId: participant.teamId } });
      const memberIds = teamMembers.map((m) => m.userId);
      const allCheckins = await this.checkinRepo.find({ where: { taskId: id } });
      const teamCheckins = allCheckins.filter((c) => memberIds.includes(c.userId));

      let allCompleted = true;
      const memberProgress = [];
      for (const member of teamMembers) {
        const memberCheckins = teamCheckins.filter((c) => c.userId === member.userId);
        const memberPassed = memberCheckins.filter((c) => c.status === 'passed').length;
        const memberDone = totalCheckpoints > 0 && memberPassed >= totalCheckpoints;
        if (!memberDone) allCompleted = false;
        memberProgress.push({
          userId: member.userId,
          passed: memberPassed,
          done: memberDone,
        });
      }

      const totalMemberCheckins = memberIds.length * totalCheckpoints;
      const totalPassed = teamCheckins.filter((c) => c.status === 'passed').length;
      const percentage = totalMemberCheckins > 0 ? Math.round((totalPassed / totalMemberCheckins) * 100) : 0;

      if (allCompleted && participant.status !== 'completed') {
        participant.status = 'completed';
        await this.participantRepo.save(participant);
      }

      return {
        unlocked: participant.unlocked,
        percentage,
        passedCount: totalPassed,
        totalCheckpoints,
        memberCount: teamMembers.length,
        allCompleted,
        memberProgress,
      };
    }

    const checkins = await this.checkinRepo.find({ where: { taskId: id, userId } });
    const passedCount = checkins.filter((c) => c.status === 'passed').length;
    const reviewingCount = checkins.filter((c) => c.status === 'reviewing').length;
    const pendingCount = totalCheckpoints - passedCount - reviewingCount;
    const percentage = totalCheckpoints > 0 ? Math.round((passedCount / totalCheckpoints) * 100) : 0;

    if (percentage === 100 && participant.status !== 'completed') {
      participant.status = 'completed';
      await this.participantRepo.save(participant);
    }

    return {
      unlocked: participant.unlocked,
      percentage,
      passedCount,
      reviewingCount,
      pendingCount: Math.max(0, pendingCount),
      totalCheckpoints,
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
        userPhoto: this.fixImageUrl(checkin?.photoUrl),
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
        userPhoto: this.fixImageUrl(checkin?.photoUrl),
        userLocation: checkin
          ? { latitude: Number(checkin.latitude) || 0, longitude: Number(checkin.longitude) || 0 }
          : null,
        submitTime: checkin?.createdAt,
        rejectReason: checkin?.rejectReason,
      };
    });
  }

  async getCoachReviewMessages(coachId: number, filterStatus?: string) {
    const tasks = await this.taskRepo.find({
      where: { coachId },
      order: { createdAt: 'DESC' },
    });
    const taskIds = tasks.map((item) => item.id);
    if (!taskIds.length) {
      return {
        pendingCount: 0,
        reviewedCount: 0,
        list: [],
      };
    }

    const [allCheckins, checkpoints, participants] = await Promise.all([
      this.checkinRepo.find({ where: taskIds.map((taskId) => ({ taskId })) }),
      this.checkpointRepo.find({ where: taskIds.map((taskId) => ({ taskId })) }),
      this.participantRepo.find({ where: taskIds.map((taskId) => ({ taskId })) }),
    ]);

    const userIds = [...new Set(participants.map((item) => item.userId))];
    const users = userIds.length
      ? await this.userRepo.find({ where: userIds.map((id) => ({ id })) })
      : [];

    const taskMap = new Map(tasks.map((item) => [item.id, item]));
    const checkpointMap = new Map(checkpoints.map((item) => [item.id, item]));
    const participantMap = new Map(participants.map((item) => [item.id, item]));
    const userMap = new Map(users.map((item) => [item.id, item]));

    const pendingCount = allCheckins.filter((item) => item.status === 'reviewing').length;
    const reviewedCount = allCheckins.filter((item) => item.status === 'passed' || item.status === 'rejected').length;

    const list = allCheckins
      .filter((item) => {
        if (filterStatus === 'reviewed') {
          return item.status === 'passed' || item.status === 'rejected';
        }
        return item.status === 'reviewing';
      })
      .sort((a, b) => {
        const timeA = filterStatus === 'reviewed'
          ? new Date(a.reviewTime || a.updatedAt || a.createdAt).getTime()
          : new Date(a.createdAt).getTime();
        const timeB = filterStatus === 'reviewed'
          ? new Date(b.reviewTime || b.updatedAt || b.createdAt).getTime()
          : new Date(b.createdAt).getTime();
        return timeB - timeA;
      })
      .map((item) => {
        const task = taskMap.get(item.taskId);
        const checkpoint = checkpointMap.get(item.checkpointId);
        const participant = participantMap.get(item.participantId);
        const user = participant ? userMap.get(participant.userId) : null;
        return {
          id: item.id,
          taskId: item.taskId,
          participantId: item.participantId,
          checkpointId: item.checkpointId,
          taskName: task?.name || '未知任务',
          checkpointName: checkpoint?.name || '未知打卡点',
          participantName: user?.nickname || '未知用户',
          participantAvatar: this.fixImageUrl(user?.avatarUrl || ''),
          participantType: participant?.participantType || 'solo',
          participantTypeText: participant?.participantType === 'team' ? '团队成员' : '个人用户',
          status: item.status,
          statusText: item.status === 'passed' ? '已通过' : (item.status === 'rejected' ? '已驳回' : '待审核'),
          submitTime: item.createdAt,
          reviewTime: item.reviewTime,
          rejectReason: item.rejectReason,
          userPhoto: this.fixImageUrl(item.photoUrl),
        };
      });

    return {
      pendingCount,
      reviewedCount,
      list,
    };
  }

  async reviewCheckin(body: any, status: string, reviewerId?: number) {
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
    checkin.reviewerId = reviewerId || null;
    if (status === 'rejected') {
      checkin.rejectReason = body.reason;
    } else {
      checkin.rejectReason = null;
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
        avatarUrl: this.fixImageUrl(user?.avatarUrl || ''),
        unlocked: p.unlocked,
        status: p.status,
        statusText: p.status === 'completed' ? '已完成' : (p.status === 'overdue' ? '已过时' : '进行中'),
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

  async remindParticipant(taskId: number, targetId: number) {
    const id = Number(taskId);
    const target = Number(targetId);
    if (isNaN(id) || isNaN(target)) throw new BadRequestException('参数无效');

    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('任务不存在');

    const singleParticipant = await this.participantRepo.findOne({
      where: { id: target, taskId: id },
    });

    let recipients: number[] = [];
    if (singleParticipant) {
      recipients = [singleParticipant.userId];
    } else {
      const teamParticipants = await this.participantRepo.find({
        where: { taskId: id, teamId: target, participantType: 'team' },
      });
      recipients = [...new Set(teamParticipants.map((item) => item.userId).filter(Boolean))];
    }

    if (!recipients.length) {
      throw new NotFoundException('未找到提醒对象');
    }

    const messages = recipients.map((userId) =>
      this.messageRepo.create({
        userId,
        type: 'task_reminder',
        title: '任务提醒',
        content: `教练提醒你关注任务「${task.name}」，请及时查看任务详情并完成后续打卡。`,
        taskId: id,
        isRead: false,
      }),
    );
    await this.messageRepo.save(messages);

    return {
      success: true,
      message: '提醒已发送',
      recipientCount: recipients.length,
    };
  }
}
