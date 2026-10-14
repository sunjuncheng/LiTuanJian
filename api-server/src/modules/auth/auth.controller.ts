import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('auth/wx-login')
  async userWxLogin(@Body('code') code: string) {
    return this.authService.userWxLogin(code);
  }

  @Public()
  @Post('auth/login')
  async userLogin(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    return this.authService.userLogin(phone, password);
  }

  @Public()
  @Post('auth/register')
  async userRegister(
    @Body('phone') phone: string,
    @Body('password') password: string,
    @Body('nickname') nickname: string,
  ) {
    return this.authService.userRegister(phone, password, nickname);
  }

  @Public()
  @Post('coach/auth/wx-login')
  async coachWxLogin(@Body('code') code: string) {
    return this.authService.coachWxLogin(code);
  }

  @Public()
  @Post('coach/auth/bind-wx')
  async coachBindWx(
    @Body('code') code: string,
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    return this.authService.coachBindWx(code, phone, password);
  }

  @Public()
  @Post('coach/auth/login')
  async coachLogin(
    @Body('phone') phone: string,
    @Body('password') password: string,
  ) {
    return this.authService.coachLogin(phone, password);
  }

  @Public()
  @Post('admin/auth/login')
  async adminLogin(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.adminLogin(username, password);
  }
}
