import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.findById(req.user.id);
  }

  @Put('profile')
  updateProfile(@Req() req, @Body() body) {
    return this.userService.updateProfile(req.user.id, body);
  }
}
