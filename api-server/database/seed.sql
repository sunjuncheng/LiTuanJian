-- ============================================
-- 团建打卡小程序 - 初始数据脚本
-- 默认管理员账号: admin / admin123
-- 登录后请及时修改密码
-- ============================================

SET NAMES utf8mb4;

-- 插入默认管理员
INSERT INTO `admins` (`username`, `password`, `name`, `status`) VALUES
('admin', '$2b$10$2w5qrHjOvityMMHyEE9ftugD.JM/bzQFYiBVTmvdjKA56OsThLmwK', '超级管理员', 1);
