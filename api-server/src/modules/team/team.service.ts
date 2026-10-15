import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { User } from '../../entities/user.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { fixImageUrl } from '../../common/utils/image';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(TeamMember) private memberRepo: Repository<TeamMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(TaskParticipant) private participantRepo: Repository<TaskParticipant>,
  ) {}

  generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async teamHasActiveTask(teamId: number): Promise<boolean> {
    const participants = await this.participantRepo.find({
      where: { teamId, status: 'in_progress' },
    });
    return participants.length > 0;
  }

  async createTeam(userId: number, name: string, taskId?: number) {
    const existing = await this.memberRepo.findOne({ where: { userId } });
    if (existing) {
      throw new BadRequestException('您已在一个队伍中');
    }

    let inviteCode = this.generateInviteCode();
    while (await this.teamRepo.findOne({ where: { inviteCode } })) {
      inviteCode = this.generateInviteCode();
    }

    const team = this.teamRepo.create({
      taskId: taskId || 0,
      name,
      leaderId: userId,
      inviteCode,
    });
    const saved = await this.teamRepo.save(team);

    const member = this.memberRepo.create({
      teamId: saved.id,
      userId,
      isLeader: true,
    });
    await this.memberRepo.save(member);

    return this.getMyTeam(userId);
  }

  async joinTeam(userId: number, code: string) {
    const team = await this.teamRepo.findOne({ where: { inviteCode: code, status: 1 } });
    if (!team) throw new NotFoundException('邀请码无效或队伍已解散');

    const existing = await this.memberRepo.findOne({ where: { userId } });
    if (existing) throw new BadRequestException('您已在一个队伍中');

    if (await this.teamHasActiveTask(team.id)) {
      throw new BadRequestException('该队伍已有进行中的任务，暂不允许加入');
    }

    const member = this.memberRepo.create({
      teamId: team.id,
      userId,
      isLeader: false,
    });
    await this.memberRepo.save(member);

    return this.getMyTeam(userId);
  }

  async getMyTeam(userId: number) {
    const member = await this.memberRepo.findOne({ where: { userId } });
    if (!member) return null;

    const team = await this.teamRepo.findOne({ where: { id: member.teamId } });
    if (!team) return null;

    const members = await this.memberRepo.find({ where: { teamId: team.id } });

    const memberDetails = [];
    for (const m of members) {
      const user = await this.userRepo.findOne({ where: { id: m.userId } });
      memberDetails.push({
        id: m.userId,
        isLeader: m.isLeader,
        nickname: user?.nickname || '用户' + m.userId,
        avatarUrl: fixImageUrl(user?.avatarUrl || ''),
        phone: user?.phone || '',
      });
    }

    const leader = memberDetails.find((m) => m.isLeader);
    const hasActiveTask = await this.teamHasActiveTask(team.id);

    return {
      ...team,
      inviteCode: team.inviteCode,
      memberCount: members.length,
      isLeader: member.isLeader,
      leaderName: leader?.nickname || '',
      hasActiveTask,
      members: memberDetails,
    };
  }

  async leaveTeam(userId: number) {
    const member = await this.memberRepo.findOne({ where: { userId } });
    if (!member) throw new NotFoundException('您不在任何队伍中');

    if (member.isLeader) {
      if (await this.teamHasActiveTask(member.teamId)) {
        throw new BadRequestException('队伍有进行中的任务，无法解散，请先放弃任务');
      }
      await this.participantRepo.delete({ teamId: member.teamId });
      await this.memberRepo.delete({ teamId: member.teamId });
      await this.teamRepo.delete(member.teamId);
    } else {
      if (await this.teamHasActiveTask(member.teamId)) {
        throw new BadRequestException('队伍有进行中的任务，无法退出，请等待任务结束');
      }
      await this.memberRepo.delete({ userId });
    }
    return { success: true };
  }

  async removeMember(leaderId: number, memberUserId: number) {
    const leader = await this.memberRepo.findOne({ where: { userId: leaderId } });
    if (!leader || !leader.isLeader) {
      throw new BadRequestException('仅队长可移除队员');
    }

    const targetMember = await this.memberRepo.findOne({
      where: { userId: memberUserId, teamId: leader.teamId },
    });
    if (!targetMember) throw new NotFoundException('该队员不在队伍中');
    if (targetMember.isLeader) throw new BadRequestException('不能移除队长');

    await this.participantRepo.delete({ teamId: leader.teamId, userId: memberUserId });
    await this.memberRepo.delete({ userId: memberUserId, teamId: leader.teamId });

    return { success: true };
  }
}
