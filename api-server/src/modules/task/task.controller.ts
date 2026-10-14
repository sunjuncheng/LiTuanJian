import { Controller, Get, Post, Body, Param, Req, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Public()
  @Get('tasks/public')
  getPublicTasks(@Req() req) {
    const userId = req.user ? req.user.id : undefined;
    return this.taskService.getPublicTasks(userId);
  }

  @Get('tasks/my')
  getMyTasks(@Req() req) {
    return this.taskService.getMyTasks(req.user.id);
  }

  @Public()
  @Get('tasks/:id')
  getTaskDetail(@Param('id') id: number) {
    return this.taskService.getTaskDetail(id);
  }

  @Post('tasks/:id/accept')
  acceptTask(@Param('id') id: number, @Body() body, @Req() req) {
    return this.taskService.acceptTask(id, req.user.id, body.mode, body.teamId);
  }

  @Post('tasks/:id/unlock')
  unlockTask(@Param('id') id: number, @Body() body, @Req() req) {
    return this.taskService.unlockTask(id, req.user.id, body);
  }

  @Get('tasks/:id/my-progress')
  getMyProgress(@Param('id') id: number, @Req() req) {
    return this.taskService.getMyProgress(id, req.user.id);
  }

  @Get('tasks/:id/checkpoints')
  getTaskCheckpoints(@Param('id') id: number, @Req() req) {
    return this.taskService.getTaskCheckpoints(id, req.user.id);
  }

  @Get('coach/tasks')
  getCoachTasks(@Req() req) {
    return this.taskService.getCoachTasks(req.user.id);
  }

  @Post('coach/tasks')
  createTask(@Body() body, @Req() req) {
    return this.taskService.createTask(req.user.id, body);
  }

  @Post('coach/tasks/:id/delete')
  deleteTask(@Param('id') id: number) {
    return this.taskService.deleteTask(id);
  }

  @Get('coach/tasks/:id')
  getCoachTaskDetail(@Param('id') id: number) {
    return this.taskService.getTaskDetail(id);
  }

  @Get('coach/tasks/:id/participants')
  getTaskParticipants(@Param('id') id: number) {
    return this.taskService.getTaskParticipants(id);
  }

  @Get('coach/tasks/:id/teams')
  getTaskTeams(@Param('id') id: number) {
    return this.taskService.getTaskTeams(id);
  }

  @Post('coach/tasks/:id/unlock')
  manualUnlock(@Param('id') id: number, @Body() body) {
    return this.taskService.manualUnlock(id, body.participantId);
  }

  @Post('coach/tasks/:id/remind')
  remindParticipant(@Param('id') id: number, @Body() body) {
    return { success: true, message: '提醒已发送' };
  }

  @Get('coach/review/checkpoints')
  getReviewCheckpoints(@Query() query) {
    return this.taskService.getReviewCheckpoints(
      Number(query.taskId),
      Number(query.participantId),
    );
  }

  @Post('coach/review/approve')
  approveCheckin(@Body() body) {
    return this.taskService.reviewCheckin(body, 'passed');
  }

  @Post('coach/review/reject')
  rejectCheckin(@Body() body) {
    return this.taskService.reviewCheckin(body, 'rejected');
  }
}
