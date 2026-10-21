import { Controller, Get, Put, Post, Body, Req, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  private getUserId(req: { user?: { id?: number } }) {
    return Number(req?.user?.id) || 0;
  }

  @Get('profile')
  getProfile(@Req() req: { user?: { id?: number } }) {
    return this.userService.findById(this.getUserId(req));
  }

  @Put('profile')
  updateProfile(
    @Req() req: { user?: { id?: number } },
    @Body() body: { nickname?: string; avatarUrl?: string },
  ) {
    return this.userService.updateProfile(this.getUserId(req), body);
  }

  @Post('bind-phone')
  bindPhone(
    @Req() req: { user?: { id?: number } },
    @Body() body: { phone?: string; password?: string },
  ) {
    return this.userService.bindPhone(this.getUserId(req), body.phone || '', body.password || '');
  }

  @Post('change-password')
  changePassword(
    @Req() req: { user?: { id?: number } },
    @Body() body: { oldPassword?: string; newPassword?: string },
  ) {
    return this.userService.changePassword(
      this.getUserId(req),
      body.oldPassword || '',
      body.newPassword || '',
    );
  }

  @Get('messages')
  getMessages(@Req() req: { user?: { id?: number } }) {
    return this.userService.getMessages(this.getUserId(req));
  }

  @Post('messages/:id/read')
  readMessage(@Req() req: { user?: { id?: number } }, @Param('id') id: number) {
    return this.userService.readMessage(this.getUserId(req), id);
  }
}
