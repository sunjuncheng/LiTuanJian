import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { LiveService } from './live.service';

@Controller()
export class LiveController {
  constructor(private liveService: LiveService) {}

  @Get('admin/live')
  getAdminList() {
    return this.liveService.getAdminList();
  }

  @Post('admin/live')
  createRoom(
    @Body()
    body: { title?: string; description?: string; coverImage?: string; anchorName?: string; streamName?: string },
  ) {
    return this.liveService.createRoom(body);
  }

  @Post('admin/live/:id/start')
  startRoom(@Param('id') id: number) {
    return this.liveService.startRoom(id);
  }

  @Post('admin/live/:id/stop')
  stopRoom(@Param('id') id: number) {
    return this.liveService.stopRoom(id);
  }

  @Public()
  @Get('live/current')
  getCurrentRoom() {
    return this.liveService.getCurrentRoom();
  }

  @Public()
  @Get('live/list')
  getPublicList() {
    return this.liveService.getPublicList();
  }

  @Public()
  @Get('live/:id')
  getRoomDetail(@Param('id') id: number) {
    return this.liveService.getRoomDetail(id);
  }
}
