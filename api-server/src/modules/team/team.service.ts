import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(TeamMember) private memberRepo: Repository<TeamMember>,
  ) {}

  generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
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

    return { ...saved, memberCount: 1 };
  }

  async joinTeam(userId: number, code: string, taskId?: number) {
    const team = await this.teamRepo.findOne({ where: { inviteCode: code, status: 1 } });
    if (!team) throw new NotFoundException('邀请码无效或队伍已解散');

    const existing = await this.memberRepo.findOne({ where: { userId } });
    if (existing) throw new BadRequestException('您已在一个队伍中');

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
    return {
      ...team,
      inviteCode: team.inviteCode,
      memberCount: members.length,
      isLeader: member.isLeader,
      members: members.map((m) => ({
        id: m.userId,
        isLeader: m.isLeader,
      })),
    };
  }

  async leaveTeam(userId: number) {
    const member = await this.memberRepo.findOne({ where: { userId } });
    if (!member) throw new NotFoundException('您不在任何队伍中');

    if (member.isLeader) {
      await this.teamRepo.update(member.teamId, { status: 0 });
      await this.memberRepo.delete({ teamId: member.teamId });
    } else {
      await this.memberRepo.delete({ userId });
    }
    return { success: true };
  }
}
