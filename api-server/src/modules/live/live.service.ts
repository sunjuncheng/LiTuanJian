import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { LiveRoom } from '../../entities/live-room.entity';
import { User } from '../../entities/user.entity';
import { UserMessage } from '../../entities/user-message.entity';
import { SystemConfigService } from '../system-config/system-config.service';
import { fixImageUrl } from '../../common/utils/image';

type LiveStatus = 'draft' | 'live' | 'ended';

@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(LiveRoom)
    private liveRepo: Repository<LiveRoom>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserMessage)
    private userMessageRepo: Repository<UserMessage>,
    private configService: SystemConfigService,
  ) {}

  private getAliLiveConfig() {
    const pushDomain = String(this.configService.get('aliLivePushDomain') || '').trim();
    const playDomain = String(this.configService.get('aliLivePlayDomain') || '').trim();
    const appName = String(this.configService.get('aliLiveAppName') || 'live').trim() || 'live';
    const authKey = String(this.configService.get('aliLiveAuthKey') || '').trim();
    const authExpireSeconds = Number(this.configService.get('aliLiveAuthExpireSeconds') || 3600) || 3600;

    return {
      pushDomain,
      playDomain,
      appName,
      authKey,
      authExpireSeconds,
      configured: !!(pushDomain && playDomain),
    };
  }

  private normalizeStreamName(streamName?: string) {
    const raw = String(streamName || '').trim();
    const safe = raw
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return safe || `room-${Date.now()}`;
  }

  private buildAuthQuery(uriPath: string) {
    const config = this.getAliLiveConfig();
    if (!config.authKey) return '';

    const timestamp = Math.floor(Date.now() / 1000) + config.authExpireSeconds;
    const rand = 0;
    const uid = 0;
    const hash = createHash('md5')
      .update(`${uriPath}-${timestamp}-${rand}-${uid}-${config.authKey}`)
      .digest('hex');

    return `auth_key=${timestamp}-${rand}-${uid}-${hash}`;
  }

  private buildUrls(streamName: string) {
    const config = this.getAliLiveConfig();
    if (!config.configured) {
      return {
        pushUrl: '',
        playUrl: '',
        flvUrl: '',
        obsServer: '',
        streamKey: '',
        appName: config.appName,
        isConfigured: false,
      };
    }

    const pushPath = `/${config.appName}/${streamName}`;
    const playPath = `/${config.appName}/${streamName}.m3u8`;
    const flvPath = `/${config.appName}/${streamName}.flv`;

    const pushQuery = this.buildAuthQuery(pushPath);
    const playQuery = this.buildAuthQuery(playPath);
    const flvQuery = this.buildAuthQuery(flvPath);

    return {
      pushUrl: `rtmp://${config.pushDomain}${pushPath}${pushQuery ? `?${pushQuery}` : ''}`,
      playUrl: `https://${config.playDomain}${playPath}${playQuery ? `?${playQuery}` : ''}`,
      flvUrl: `https://${config.playDomain}${flvPath}${flvQuery ? `?${flvQuery}` : ''}`,
      obsServer: `rtmp://${config.pushDomain}/${config.appName}`,
      streamKey: `${streamName}${pushQuery ? `?${pushQuery}` : ''}`,
      appName: config.appName,
      isConfigured: true,
    };
  }

  private statusText(status: LiveStatus) {
    return {
      draft: '待开播',
      live: '直播中',
      ended: '已结束',
    }[status] || status;
  }

  private formatRoom(room: LiveRoom | null) {
    if (!room) return null;
    const urls = this.buildUrls(room.streamName);

    return {
      id: room.id,
      title: room.title,
      description: room.description || '',
      coverImage: fixImageUrl(room.coverImage),
      anchorName: room.anchorName || '官方直播间',
      streamName: room.streamName,
      status: room.status,
      statusText: this.statusText(room.status as LiveStatus),
      startedAt: room.startedAt,
      endedAt: room.endedAt,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      ...urls,
    };
  }

  async getAdminList() {
    const list = await this.liveRepo.find({
      order: { createdAt: 'DESC' },
    });

    return {
      config: this.getAliLiveConfig(),
      list: list.map((item) => this.formatRoom(item)),
    };
  }

  async createRoom(data: {
    title?: string;
    description?: string;
    coverImage?: string;
    anchorName?: string;
    streamName?: string;
  }) {
    const title = String(data.title || '').trim();
    if (!title) {
      throw new BadRequestException('直播标题不能为空');
    }

    const streamName = this.normalizeStreamName(data.streamName);
    const existing = await this.liveRepo.findOne({ where: { streamName } });
    if (existing) {
      throw new BadRequestException('流名称已存在，请更换后重试');
    }

    const room = this.liveRepo.create({
      title,
      description: String(data.description || '').trim(),
      coverImage: String(data.coverImage || '').trim(),
      anchorName: String(data.anchorName || '').trim() || '官方直播间',
      streamName,
      status: 'draft',
    });

    const saved = await this.liveRepo.save(room);
    return this.formatRoom(saved);
  }

  async startRoom(id: number) {
    const room = await this.liveRepo.findOne({ where: { id: Number(id) } });
    if (!room) {
      throw new NotFoundException('直播不存在');
    }

    const others = await this.liveRepo.find({ where: { status: 'live' } });
    for (const item of others) {
      if (item.id !== room.id) {
        item.status = 'ended';
        item.endedAt = new Date();
        await this.liveRepo.save(item);
      }
    }

    room.status = 'live';
    room.startedAt = room.startedAt || new Date();
    room.endedAt = null;
    await this.liveRepo.save(room);
    await this.sendLiveReminder(room);
    return this.formatRoom(room);
  }

  async stopRoom(id: number) {
    const room = await this.liveRepo.findOne({ where: { id: Number(id) } });
    if (!room) {
      throw new NotFoundException('直播不存在');
    }

    room.status = 'ended';
    room.endedAt = new Date();
    await this.liveRepo.save(room);
    return this.formatRoom(room);
  }

  async getCurrentRoom() {
    const room = await this.liveRepo.findOne({
      where: { status: 'live' },
      order: { startedAt: 'DESC', id: 'DESC' },
    });
    return this.formatRoom(room);
  }

  async getPublicList() {
    const list = await this.liveRepo.find({
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return {
      list: list.map((item) => this.formatRoom(item)),
      current: await this.getCurrentRoom(),
    };
  }

  async getRoomDetail(id: number) {
    const room = await this.liveRepo.findOne({ where: { id: Number(id) } });
    if (!room) {
      throw new NotFoundException('直播不存在');
    }
    return this.formatRoom(room);
  }

  private async sendLiveReminder(room: LiveRoom) {
    const existing = await this.userMessageRepo.findOne({
      where: {
        type: 'live_reminder',
        liveRoomId: room.id,
      },
      select: ['id'],
    });
    if (existing) return;

    const users = await this.userRepo.find({
      where: { status: 1 },
      select: ['id'],
    });
    if (!users.length) return;

    const messages = users.map((user) =>
      this.userMessageRepo.create({
        userId: user.id,
        type: 'live_reminder',
        title: '直播提醒',
        content: `直播「${room.title}」已开始，点击立即进入直播间观看。`,
        liveRoomId: room.id,
        isRead: false,
      }),
    );
    await this.userMessageRepo.save(messages);
  }
}
