import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../entities/system-config.entity';

export interface AppConfig {
  systemName: string;
  userWxAppId: string;
  userWxAppSecret: string;
  coachWxAppId: string;
  coachWxAppSecret: string;
  uploadSizeLimit: number;
  defaultLocationRange: number;
  aliLivePushDomain: string;
  aliLivePlayDomain: string;
  aliLiveAppName: string;
  aliLiveAuthKey: string;
  aliLiveAuthExpireSeconds: number;
}

const DEFAULTS: AppConfig = {
  systemName: '团建打卡管理系统',
  userWxAppId: process.env.WX_USER_APPID || '',
  userWxAppSecret: process.env.WX_USER_SECRET || '',
  coachWxAppId: process.env.WX_COACH_APPID || '',
  coachWxAppSecret: process.env.WX_COACH_SECRET || '',
  uploadSizeLimit: 10,
  defaultLocationRange: 50,
  aliLivePushDomain: process.env.ALI_LIVE_PUSH_DOMAIN || '',
  aliLivePlayDomain: process.env.ALI_LIVE_PLAY_DOMAIN || '',
  aliLiveAppName: process.env.ALI_LIVE_APP_NAME || 'live',
  aliLiveAuthKey: process.env.ALI_LIVE_AUTH_KEY || '',
  aliLiveAuthExpireSeconds: Number(process.env.ALI_LIVE_AUTH_EXPIRE_SECONDS) || 3600,
};

@Injectable()
export class SystemConfigService implements OnModuleInit {
  private cache: Partial<AppConfig> = {};

  constructor(
    @InjectRepository(SystemConfig)
    private configRepo: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    await this.loadAll();
  }

  private async loadAll() {
    const rows = await this.configRepo.find();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.configKey] = row.configValue;
    }
    this.cache = {
      systemName: map.systemName || DEFAULTS.systemName,
      userWxAppId: map.userWxAppId || DEFAULTS.userWxAppId,
      userWxAppSecret: map.userWxAppSecret || DEFAULTS.userWxAppSecret,
      coachWxAppId: map.coachWxAppId || DEFAULTS.coachWxAppId,
      coachWxAppSecret: map.coachWxAppSecret || DEFAULTS.coachWxAppSecret,
      uploadSizeLimit: Number(map.uploadSizeLimit) || DEFAULTS.uploadSizeLimit,
      defaultLocationRange: Number(map.defaultLocationRange) || DEFAULTS.defaultLocationRange,
      aliLivePushDomain: map.aliLivePushDomain || DEFAULTS.aliLivePushDomain,
      aliLivePlayDomain: map.aliLivePlayDomain || DEFAULTS.aliLivePlayDomain,
      aliLiveAppName: map.aliLiveAppName || DEFAULTS.aliLiveAppName,
      aliLiveAuthKey: map.aliLiveAuthKey || DEFAULTS.aliLiveAuthKey,
      aliLiveAuthExpireSeconds:
        Number(map.aliLiveAuthExpireSeconds) || DEFAULTS.aliLiveAuthExpireSeconds,
    };
  }

  getConfig(): AppConfig {
    return { ...DEFAULTS, ...this.cache };
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    const value = this.cache[key];
    if (value !== undefined && value !== null && value !== '') {
      return value as AppConfig[K];
    }
    return DEFAULTS[key];
  }

  async updateConfig(data: Partial<AppConfig>): Promise<AppConfig> {
    for (const key of Object.keys(data)) {
      const value = String((data as any)[key]);
      const existing = await this.configRepo.findOne({ where: { configKey: key } });
      if (existing) {
        existing.configValue = value;
        await this.configRepo.save(existing);
      } else {
        await this.configRepo.save(this.configRepo.create({ configKey: key, configValue: value }));
      }
    }
    await this.loadAll();
    return this.getConfig();
  }
}
