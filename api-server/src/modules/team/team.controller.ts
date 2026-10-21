import { Controller, Get, Post, Body, Req, Param, Query } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamChatGateway } from './team-chat.gateway';

@Controller('team')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private teamChatGateway: TeamChatGateway,
  ) {}

  @Get('my')
  getMyTeam(@Req() req) {
    return this.teamService.getMyTeam(req.user.id);
  }

  @Get('chat')
  getTeamChat(@Req() req) {
    return this.teamService.getTeamChat(req.user.id);
  }

  @Get('chat/list')
  async getTeamChatList(@Req() req) {
    const chat = await this.teamService.getTeamChat(req.user.id);
    const onlineUserIds = this.teamChatGateway.getOnlineUserIdsByTeam(chat.teamId);
    return {
      list: [
        {
          ...chat,
          chatType: 'team',
          title: `${chat.teamName}群聊`,
          subtitle: chat.lastMessage || '和队友实时沟通任务进度与集合安排',
          onlineCount: onlineUserIds.length,
          onlineUserIds,
        },
      ],
    };
  }

  @Get('chat/online')
  async getTeamChatOnline(@Req() req) {
    const chat = await this.teamService.getTeamChat(req.user.id);
    const onlineUserIds = this.teamChatGateway.getOnlineUserIdsByTeam(chat.teamId);
    return {
      teamId: chat.teamId,
      onlineCount: onlineUserIds.length,
      onlineUserIds,
    };
  }

  @Get('chat/messages')
  getTeamChatMessages(@Req() req, @Query('beforeId') beforeId?: number, @Query('limit') limit?: number) {
    return this.teamService.getTeamChatMessages(req.user.id, Number(beforeId), Number(limit));
  }

  @Post('chat/messages')
  sendTeamChatMessage(@Req() req, @Body() body) {
    return this.teamService.sendTeamChatMessage(req.user.id, body.content);
  }

  @Post('create')
  createTeam(@Body() body, @Req() req) {
    return this.teamService.createTeam(req.user.id, body.name);
  }

  @Post('join')
  joinTeam(@Body() body, @Req() req) {
    return this.teamService.joinTeam(req.user.id, body.code);
  }

  @Post('leave')
  leaveTeam(@Req() req) {
    return this.teamService.leaveTeam(req.user.id);
  }

  @Post('members/:userId/remove')
  removeMember(@Param('userId') userId: number, @Req() req) {
    return this.teamService.removeMember(req.user.id, Number(userId));
  }
}
