import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { User } from '../../entities/user.entity';
import { Coach } from '../../entities/coach.entity';
import { Admin } from '../../entities/admin.entity';
import { fixImageUrl } from '../../common/utils/image';
import { SystemConfigService } from '../system-config/system-config.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Coach) private coachRepo: Repository<Coach>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private configService: SystemConfigService,
  ) {}

  async wxLogin(code: string, appId: string, secret: string) {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const resp = await axios.get(url);
    const { openid, session_key } = resp.data;
    if (!openid) {
      throw new UnauthorizedException('微信登录失败');
    }
    return { openid, sessionKey: session_key };
  }

  async userWxLogin(code: string) {
    const appId = this.configService.get('userWxAppId');
    const secret = this.configService.get('userWxAppSecret');
    const { openid } = await this.wxLogin(code, appId, secret);

    let user = await this.userRepo.findOne({ where: { openid } });
    if (!user) {
      user = this.userRepo.create({ openid, nickname: '微信用户' });
      user = await this.userRepo.save(user);
    }

    const token = this.jwtService.sign({
      id: user.id,
      role: 'user',
      openid: user.openid,
    });

    return {
      token,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: fixImageUrl(user.avatarUrl),
      },
    };
  }

  async coachWxLogin(code: string) {
    const appId = this.configService.get('coachWxAppId');
    const secret = this.configService.get('coachWxAppSecret');
    const { openid } = await this.wxLogin(code, appId, secret);

    let coach = await this.coachRepo.findOne({ where: { openid } });
    if (!coach) {
      throw new UnauthorizedException('该微信号未绑定教练账号，请联系管理员');
    }
    if (coach.status !== 1) {
      throw new UnauthorizedException('教练账号已被禁用');
    }

    const token = this.jwtService.sign({
      id: coach.id,
      role: 'coach',
      openid: coach.openid,
    });

    return {
      token,
      coachInfo: {
        id: coach.id,
        name: coach.name,
        avatarUrl: fixImageUrl(coach.avatarUrl),
      },
    };
  }

  async coachBindWx(code: string, phone: string, password: string) {
    const appId = this.configService.get('coachWxAppId');
    const secret = this.configService.get('coachWxAppSecret');
    const { openid } = await this.wxLogin(code, appId, secret);

    const coach = await this.coachRepo.findOne({ where: { phone } });
    if (!coach) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    if (coach.status !== 1) {
      throw new UnauthorizedException('教练账号已被禁用');
    }
    const valid = await bcrypt.compare(password, coach.password);
    if (!valid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    coach.openid = openid;
    await this.coachRepo.save(coach);

    const token = this.jwtService.sign({
      id: coach.id,
      role: 'coach',
      openid: coach.openid,
    });

    return {
      token,
      coachInfo: {
        id: coach.id,
        name: coach.name,
        avatarUrl: fixImageUrl(coach.avatarUrl),
      },
    };
  }

  async coachLogin(phone: string, password: string) {
    const coach = await this.coachRepo.findOne({ where: { phone } });
    if (!coach) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    if (coach.status !== 1) {
      throw new UnauthorizedException('教练账号已被禁用');
    }
    const valid = await bcrypt.compare(password, coach.password);
    if (!valid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const token = this.jwtService.sign({
      id: coach.id,
      role: 'coach',
    });

    return {
      token,
      coachInfo: {
        id: coach.id,
        name: coach.name,
        avatarUrl: fixImageUrl(coach.avatarUrl),
      },
    };
  }

  async userLogin(phone: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { phone },
      select: ['id', 'nickname', 'avatarUrl', 'password', 'status'],
    });
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }
    if (!user.password) {
      throw new UnauthorizedException('请先设置密码');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const token = this.jwtService.sign({ id: user.id, role: 'user' });
    return {
      token,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: fixImageUrl(user.avatarUrl),
      },
    };
  }

  async userRegister(phone: string, password: string, nickname?: string) {
    const existing = await this.userRepo.findOne({ where: { phone } });
    if (existing) {
      throw new BadRequestException('该手机号已注册');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      phone,
      password: hashedPassword,
      nickname: nickname || `用户${phone.slice(-4)}`,
      status: 1,
    });
    const saved = await this.userRepo.save(user);

    const token = this.jwtService.sign({ id: saved.id, role: 'user' });
    return {
      token,
      userInfo: {
        id: saved.id,
        nickname: saved.nickname,
        avatarUrl: fixImageUrl(saved.avatarUrl),
      },
    };
  }

  async adminLogin(username: string, password: string) {
    const admin = await this.adminRepo.findOne({ where: { username } });
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (admin.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const token = this.jwtService.sign({
      id: admin.id,
      role: 'admin',
      username: admin.username,
    });

    return {
      token,
      adminInfo: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
      },
    };
  }
}
