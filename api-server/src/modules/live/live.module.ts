import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveRoom } from '../../entities/live-room.entity';
import { User } from '../../entities/user.entity';
import { UserMessage } from '../../entities/user-message.entity';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([LiveRoom, User, UserMessage]), SystemConfigModule],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}
