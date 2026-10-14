import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CoachModule } from './modules/coach/coach.module';
import { AdminModule } from './modules/admin/admin.module';
import { TaskModule } from './modules/task/task.module';
import { TeamModule } from './modules/team/team.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      timezone: '+08:00',
      retryAttempts: 3,
      retryDelay: 1000,
      autoLoadEntities: true,
    }),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
    AuthModule,
    UserModule,
    CoachModule,
    AdminModule,
    TaskModule,
    TeamModule,
    CheckinModule,
    UploadModule,
  ],
})
export class AppModule {}
