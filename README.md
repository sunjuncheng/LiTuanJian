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

## 部署指南

> ⚠️ `deploy/` 目录不上传到 GitHub（已在 `.gitignore` 中排除），部署包通过 `build-deploy.sh` 脚本在本地生成。

### 生成部署包

在项目根目录执行：

```bash
./build-deploy.sh
```

脚本会自动完成以下操作：
1. 构建 API 服务（nest build）
2. 构建后台管理端（vite build）
3. 将 `dist`、`node_modules`、`.env`、`package.json`、`ecosystem.config.js` 复制到 `deploy/tuanjian-api/`
4. 将后台构建产物复制到 `deploy/tuanjian-admin/`
5. 打包成 `tuanjian-api.zip` 和 `tuanjian-admin.zip`

### 部署产物目录

```
deploy/
├── tuanjian-api/        # API 服务部署包（已包含 node_modules）
│   ├── dist/            # 编译后的 JS 文件
│   ├── node_modules/    # 生产依赖（上传后无需再 npm install）
│   ├── .env             # 环境变量配置
│   ├── package.json     # 依赖声明
│   └── ecosystem.config.js  # PM2 进程配置
├── tuanjian-admin/      # 后台管理端静态文件（Vue 构建产物）
│   ├── index.html
│   └── assets/
├── tuanjian-api.zip     # API 服务压缩包
└── tuanjian-admin.zip   # 后台管理端压缩包
```

### 一、API 服务部署

服务器目录：`/www/wwwroot/123.56.72.218/tuanjian-api/`

**步骤：**

1. **上传并解压部署包**

   将 `deploy/tuanjian-api.zip` 上传到服务器 `/www/wwwroot/123.56.72.218/`，然后解压覆盖：

   ```bash
   cd /www/wwwroot/123.56.72.218
   unzip -o tuanjian-api.zip
   ```

2. **启动服务**

   ```bash
   # 先删除旧进程（如果存在）
   pm2 delete tuanjian-api

   # 启动服务
   pm2 start /www/wwwroot/123.56.72.218/tuanjian-api/ecosystem.config.js

   # 查看状态
   pm2 list

   # 查看日志
   pm2 logs tuanjian-api
   ```

   正常启动后日志应显示：`API 服务已启动: http://localhost:3000`

3. **验证**

   ```bash
   curl http://127.0.0.1:3000/api/admin/dashboard/stats
   ```

### 二、后台管理端部署

服务器目录：`/www/wwwroot/123.56.72.218/tuanjian-admin/`

**步骤：**

1. 将 `deploy/tuanjian-admin/` 目录下的所有文件上传到服务器 `/www/wwwroot/123.56.72.218/tuanjian-admin/`。

2. 确保 Nginx 已配置 `/tuanjian-admin/` 路径（见下文 Nginx 配置）。

3. 访问：`http://123.56.72.218/tuanjian-admin/`

### 三、Nginx 配置

编辑服务器 Nginx 配置文件，确保包含以下 location 块：

```nginx
server {
    listen 80;
    server_name 123.56.72.218;
    root /www/wwwroot/123.56.72.218;

    # 后台管理端（SPA 路由支持）
    location ^~ /tuanjian-admin {
        root /www/wwwroot/123.56.72.218;
        index index.html;
        try_files $uri $uri/ /tuanjian-admin/index.html;
    }

    # API 接口反向代理
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传文件静态托管
    location ^~ /uploads/ {
        alias /www/wwwroot/123.56.72.218/tuanjian-api/uploads/;
    }
}
```

> ⚠️ 宝塔面板中**不要配置伪静态规则**，否则可能导致 `/api/` 和 `/uploads/` 请求被错误重写。

修改后重载 Nginx：

```bash
nginx -t && nginx -s reload
```

### 四、常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `Cannot find module '@nestjs/core'` | node_modules 缺失 | 重新执行 `./build-deploy.sh` 生成完整部署包 |
| 502 Bad Gateway | API 服务未启动或崩溃 | `pm2 list` 查看状态，`pm2 logs tuanjian-api` 查看错误 |
| 500 Internal Server Error | Nginx 重定向循环或伪静态干扰 | 使用 `root` 而非 `alias`，清空伪静态规则 |
| `Unknown column 'NaN' in 'where clause'` | 经纬度或 ID 参数为 NaN | 已修复，重新部署最新代码 |
| 图片不显示 | BASE_URL 带端口或伪静态加 .php 后缀 | BASE_URL 用 `http://123.56.72.218`，清空伪静态规则 |
| 后台页面空白 | Vue Router 未设置 base | vite.config.js 的 base 和 router 的 createWebHistory 都设为 `/tuanjian-admin/` |
