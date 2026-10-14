import { Controller, Post, Body, Req } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkin')
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  @Post('submit')
  submitCheckin(@Body() body, @Req() req) {
    return this.checkinService.submitCheckin(req.user.id, body);
  }
}
