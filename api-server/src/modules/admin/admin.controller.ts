import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CoachService } from '../coach/coach.service';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private coachService: CoachService,
  ) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('tasks')
  getTaskList(@Query() query) {
    return this.adminService.getTaskList({
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      name: query.name,
      status: query.status,
    });
  }

  @Get('tasks/:id')
  getTaskDetail(@Param('id') id: number) {
    return this.adminService.getTaskDetail(id);
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: number) {
    return this.adminService.deleteTask(id);
  }

  @Post('tasks/batch-delete')
  batchDeleteTasks(@Body() body: { ids: number[] }) {
    return this.adminService.batchDeleteTasks(body.ids || []);
  }

  @Get('tasks/:id/checkins/pending')
  getPendingCheckins(@Param('id') id: number) {
    return this.adminService.getPendingCheckins(id);
  }

  @Post('checkins/:id/review')
  reviewCheckin(
    @Param('id') id: number,
    @Body() body: { status: 'passed' | 'rejected'; rejectReason?: string },
  ) {
    return this.adminService.reviewCheckin(id, body.status, body.rejectReason);
  }

  @Get('users')
  getUserList(@Query() query) {
    return this.adminService.getUserList({
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      keyword: query.keyword,
    });
  }

  @Put('users/:id/status')
  updateUserStatus(@Param('id') id: number, @Body('status') status: number) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: number, @Body() body: { nickname?: string; phone?: string }) {
    return this.adminService.updateUser(id, body);
  }

  @Get('coaches')
  getCoachList(@Query() query) {
    return this.coachService.findAll({
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 20,
      keyword: query.keyword,
    });
  }

  @Post('coaches')
  createCoach(@Body() body) {
    return this.coachService.create(body);
  }

  @Put('coaches/:id')
  updateCoach(@Param('id') id: number, @Body() body) {
    return this.coachService.update(id, body);
  }

  @Delete('coaches/:id')
  deleteCoach(@Param('id') id: number) {
    return this.coachService.delete(id);
  }

  @Get('settings')
  getSystemConfig() {
    return this.adminService.getSystemConfig();
  }

  @Put('settings')
  updateSystemConfig(@Body() body) {
    return this.adminService.updateSystemConfig(body);
  }
}
