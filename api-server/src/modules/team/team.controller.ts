import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get('my')
  getMyTeam(@Req() req) {
    return this.teamService.getMyTeam(req.user.id);
  }

  @Post('create')
  createTeam(@Body() body, @Req() req) {
    return this.teamService.createTeam(req.user.id, body.name, body.taskId);
  }

  @Post('join')
  joinTeam(@Body() body, @Req() req) {
    return this.teamService.joinTeam(req.user.id, body.code, body.taskId);
  }

  @Post('leave')
  leaveTeam(@Req() req) {
    return this.teamService.leaveTeam(req.user.id);
  }
}
