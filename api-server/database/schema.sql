-- ============================================
-- 团建打卡小程序 - 数据库初始化脚本
-- 数据库: db_tunjian123
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 用户表
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) DEFAULT NULL COMMENT '微信openid',
  `unionid` varchar(100) DEFAULT NULL COMMENT '微信unionid',
  `nickname` varchar(100) DEFAULT NULL COMMENT '昵称',
  `avatar_url` varchar(500) DEFAULT NULL COMMENT '头像',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_users_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 教练表
-- ----------------------------
DROP TABLE IF EXISTS `coaches`;
CREATE TABLE `coaches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) DEFAULT NULL COMMENT '微信openid',
  `name` varchar(100) NOT NULL COMMENT '姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `password` varchar(255) DEFAULT NULL COMMENT '密码(bcrypt)',
  `avatar_url` varchar(500) DEFAULT NULL COMMENT '头像',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_coaches_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教练表';

-- ----------------------------
-- 管理员表
-- ----------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码(bcrypt)',
  `name` varchar(100) NOT NULL COMMENT '姓名',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_admins_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- ----------------------------
-- 任务表
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `coach_id` int(11) NOT NULL COMMENT '教练ID',
  `name` varchar(200) NOT NULL COMMENT '任务名称',
  `description` text COMMENT '任务简介',
  `notice` text COMMENT '活动须知',
  `deadline` datetime DEFAULT NULL COMMENT '最晚打卡截止时间',
  `accept_mode` tinyint(1) NOT NULL DEFAULT 3 COMMENT '1仅单人 2仅团队 3均可',
  `need_review` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否需要人工审核',
  `status` varchar(20) NOT NULL DEFAULT 'draft' COMMENT 'draft草稿 published已发布 ended已结束',
  `start_point_name` varchar(200) NOT NULL COMMENT '启动点名称',
  `start_point_lat` decimal(10,6) NOT NULL COMMENT '启动点纬度',
  `start_point_lng` decimal(10,6) NOT NULL COMMENT '启动点经度',
  `start_point_range` int(11) NOT NULL DEFAULT 50 COMMENT '启动点误差范围(米)',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_tasks_coach_id` (`coach_id`),
  KEY `IDX_tasks_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- ----------------------------
-- 任务打卡点表
-- ----------------------------
DROP TABLE IF EXISTS `task_checkpoints`;
CREATE TABLE `task_checkpoints` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL COMMENT '任务ID',
  `name` varchar(200) NOT NULL COMMENT '打卡点名称',
  `latitude` decimal(10,6) NOT NULL COMMENT '纬度',
  `longitude` decimal(10,6) NOT NULL COMMENT '经度',
  `range` int(11) NOT NULL DEFAULT 50 COMMENT '误差范围(米)',
  `reference_image` varchar(500) DEFAULT NULL COMMENT '官方参照图',
  `require_group_photo` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否需要团队合照',
  `allow_remark` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否允许备注',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_task_checkpoints_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务打卡点表';

-- ----------------------------
-- 队伍表
-- ----------------------------
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL COMMENT '任务ID',
  `name` varchar(100) NOT NULL COMMENT '队伍名称',
  `leader_id` int(11) NOT NULL COMMENT '队长用户ID',
  `invite_code` varchar(20) NOT NULL COMMENT '邀请码',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1正常 0已解散',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_teams_invite_code` (`invite_code`),
  KEY `IDX_teams_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='队伍表';

-- ----------------------------
-- 队伍成员表
-- ----------------------------
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL COMMENT '队伍ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `is_leader` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否队长',
  `joined_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_team_members_team_id` (`team_id`),
  KEY `IDX_team_members_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='队伍成员表';

-- ----------------------------
-- 任务参与者表
-- ----------------------------
DROP TABLE IF EXISTS `task_participants`;
CREATE TABLE `task_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL COMMENT '任务ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `team_id` int(11) DEFAULT NULL COMMENT '队伍ID(团队模式)',
  `participant_type` varchar(10) NOT NULL COMMENT 'solo单人 team团队',
  `unlocked` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已解锁',
  `unlock_lat` decimal(10,6) DEFAULT NULL COMMENT '解锁时纬度',
  `unlock_lng` decimal(10,6) DEFAULT NULL COMMENT '解锁时经度',
  `unlock_time` datetime DEFAULT NULL COMMENT '解锁时间',
  `status` varchar(20) NOT NULL DEFAULT 'in_progress' COMMENT 'in_progress进行中 completed已完成 overdue已逾期',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_task_participants_task_id` (`task_id`),
  KEY `IDX_task_participants_user_id` (`user_id`),
  KEY `IDX_task_participants_team_id` (`team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务参与者表';

-- ----------------------------
-- 打卡记录表
-- ----------------------------
DROP TABLE IF EXISTS `checkin_records`;
CREATE TABLE `checkin_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL COMMENT '任务ID',
  `checkpoint_id` int(11) NOT NULL COMMENT '打卡点ID',
  `participant_id` int(11) NOT NULL COMMENT '参与者ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `team_id` int(11) DEFAULT NULL COMMENT '队伍ID',
  `photo_url` varchar(500) NOT NULL COMMENT '打卡照片',
  `remark` text COMMENT '备注',
  `latitude` decimal(10,6) NOT NULL COMMENT '打卡纬度',
  `longitude` decimal(10,6) NOT NULL COMMENT '打卡经度',
  `accuracy` decimal(10,2) DEFAULT NULL COMMENT '定位精度',
  `status` varchar(20) NOT NULL DEFAULT 'reviewing' COMMENT 'reviewing待审核 passed已通过 rejected已驳回',
  `reviewer_id` int(11) DEFAULT NULL COMMENT '审核人ID',
  `reject_reason` text COMMENT '驳回原因',
  `review_time` datetime DEFAULT NULL COMMENT '审核时间',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_checkin_records_task_id` (`task_id`),
  KEY `IDX_checkin_records_checkpoint_id` (`checkpoint_id`),
  KEY `IDX_checkin_records_user_id` (`user_id`),
  KEY `IDX_checkin_records_participant_id` (`participant_id`),
  KEY `IDX_checkin_records_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='打卡记录表';

SET FOREIGN_KEY_CHECKS = 1;
