import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { User } from '../../entities/user.entity';
import { TaskParticipant } from '../../entities/task-participant.entity';
import { ChatConversation } from '../../entities/chat-conversation.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { fixImageUrl } from '../../common/utils/image';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(TeamMember) private memberRepo: Repository<TeamMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(TaskParticipant) private participantRepo: Repository<TaskParticipant>,
    @InjectRepository(ChatConversation) private conversationRepo: Repository<ChatConversation>,
    @InjectRepository(ChatMessage) private messageRepo: Repository<ChatMessage>,
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

  private async getCurrentTeamAccess(userId: number) {
    const member = await this.memberRepo.findOne({ where: { userId } });
    if (!member) {
      throw new BadRequestException('您还没有加入任何队伍');
    }

    const team = await this.teamRepo.findOne({ where: { id: member.teamId, status: 1 } });
    if (!team) {
      throw new NotFoundException('队伍不存在或已解散');
    }

    const members = await this.memberRepo.find({ where: { teamId: team.id } });
    return { member, team, members };
  }

  private async getOrCreateTeamConversation(teamId: number) {
    let conversation = await this.conversationRepo.findOne({
      where: { type: 'team', teamId },
    });

    if (!conversation) {
      conversation = this.conversationRepo.create({
        type: 'team',
        teamId,
      });
      conversation = await this.conversationRepo.save(conversation);
    }

    return conversation;
  }

  private async buildMessagePayloadList(messages: ChatMessage[]) {
    if (!messages.length) return [];

    const senderIds = [...new Set(messages.map((item) => item.senderId))];
    const users = await this.userRepo.find({
      where: { id: In(senderIds) },
    });
    const userMap = new Map(users.map((item) => [item.id, item]));

    return messages.map((item) => {
      const sender = userMap.get(item.senderId);
      return {
        id: item.id,
        conversationId: item.conversationId,
        senderId: item.senderId,
        senderNickname: sender?.nickname || `用户${item.senderId}`,
        senderAvatar: fixImageUrl(sender?.avatarUrl || ''),
        messageType: item.messageType,
        content: item.content,
        createdAt: item.createdAt,
      };
    });
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

  async getTeamChat(userId: number) {
    const { team, members } = await this.getCurrentTeamAccess(userId);
    const conversation = await this.getOrCreateTeamConversation(team.id);

    return {
      conversationId: conversation.id,
      teamId: team.id,
      teamName: team.name,
      memberCount: members.length,
      lastMessage: conversation.lastMessage || '',
      lastMessageTime: conversation.lastMessageTime,
    };
  }

  async getTeamChatMessages(userId: number, beforeId?: number, limit = 50) {
    const chat = await this.getTeamChat(userId);
    const size = Math.min(Math.max(Number(limit) || 20, 1), 50);

    const query = this.messageRepo
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', {
        conversationId: chat.conversationId,
      });

    if (beforeId && Number(beforeId) > 0) {
      query.andWhere('message.id < :beforeId', { beforeId: Number(beforeId) });
    }

    const rows = await query
      .orderBy('message.id', 'DESC')
      .take(size)
      .getMany();

    const list = await this.buildMessagePayloadList(rows.reverse());

    return {
      ...chat,
      list,
      hasMore: rows.length === size,
    };
  }

  async sendTeamChatMessage(userId: number, content: string) {
    const text = String(content || '').trim();
    if (!text) {
      throw new BadRequestException('消息内容不能为空');
    }
    if (text.length > 500) {
      throw new BadRequestException('单条消息不能超过500字');
    }

    const chat = await this.getTeamChat(userId);
    const message = this.messageRepo.create({
      conversationId: chat.conversationId,
      senderId: userId,
      messageType: 'text',
      content: text,
    });
    const saved = await this.messageRepo.save(message);

    await this.conversationRepo.update(chat.conversationId, {
      lastMessage: text,
      lastMessageTime: saved.createdAt,
    });

    const [payload] = await this.buildMessagePayloadList([saved]);
    return {
      ...payload,
      teamId: chat.teamId,
      teamName: chat.teamName,
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
