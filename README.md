# 团建打卡小程序

基于微信小程序 + NestJS + Vue 3 的团建活动打卡管理系统。

## 项目结构

```
团建程序开发/
├── user-miniapp/        # 用户端小程序（微信原生）
├── coach-miniapp/       # 教练管理端小程序（微信原生）
├── admin-web/           # 总后台管理端（Vue 3 + Vite + Element Plus）
├── api-server/          # API 接口服务（NestJS + MySQL）
└── 团建小程序-活动任务发布与打卡全流程详细说明文档.docx
```

## 技术栈

| 模块 | 技术栈 |
|------|--------|
| 用户端小程序 | 微信原生小程序 |
| 教练端小程序 | 微信原生小程序 |
| 总后台管理端 | Vue 3 + Vite + Element Plus + Pinia + Vue Router |
| API 服务 | NestJS + TypeORM + MySQL + JWT |
| 数据库 | MySQL 5.7 |

## 服务器配置

- 服务器 IP：`123.56.72.218`
- 域名：`xingcheng.cloud`（备案中）
- 数据库：`db_tunjian123`

## 快速开始

### 1. API 服务（api-server）

```bash
cd api-server
npm install
cp .env.example .env  # 已配置好数据库连接，按需修改
npm run start:dev
```

服务启动后访问：`http://123.56.72.218:3000/api`

### 2. 总后台管理端（admin-web）

```bash
cd admin-web
npm install
npm run dev
```

访问：`http://localhost:5173`

### 3. 小程序

使用微信开发者工具分别导入 `user-miniapp` 和 `coach-miniapp` 目录。

## 数据库表说明

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| coaches | 教练表 |
| admins | 管理员表 |
| tasks | 任务表 |
| task_checkpoints | 任务打卡点表 |
| teams | 队伍表 |
| team_members | 队伍成员表 |
| task_participants | 任务参与者表 |
| checkin_records | 打卡记录表 |

## 核心业务流程

1. 教练端：创建任务 → 设置启动点位 → 添加打卡点（含参照图） → 发布任务
2. 用户端：浏览任务 → 单人/组队接单 → 到达启动点上传定位解锁 → 分点位拍照打卡 → 等待审核
3. 教练端：查看进度 → 审核打卡照片 → 通过/驳回 → 统计完成度

## 环境配置

### API 服务环境变量（api-server/.env）

```
PORT=3000
DB_HOST=123.56.72.218
DB_PORT=3306
DB_USERNAME=db_tunjian123
DB_PASSWORD=liHmdmrJ7X6F5mb
DB_DATABASE=db_tunjian123
JWT_SECRET=team_building_jwt_secret_2026_change_this
```

> 注意：首次启动前需确保数据库已创建，TypeORM 会自动建表（synchronize: true）。

### 小程序 API 地址配置

- `user-miniapp/utils/config.js`
- `coach-miniapp/utils/config.js`

域名备案通过后将 `apiBaseUrl` 改为 `https://xingcheng.cloud/api`。
