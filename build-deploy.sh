#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="$ROOT_DIR/deploy"

echo "========================================="
echo "  团建打卡小程序 - 一键部署打包脚本"
echo "========================================="

# 清理旧的 deploy 目录
echo ""
echo "[1/6] 清理旧的 deploy 目录..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/tuanjian-api"
mkdir -p "$DEPLOY_DIR/tuanjian-admin"

# 1. 构建 API 服务
echo ""
echo "[2/6] 构建 API 服务 (nest build)..."
cd "$ROOT_DIR/api-server"
npm run build

# 复制 API 服务文件（包含 node_modules）
echo ""
echo "[3/6] 复制 API 服务文件（含 node_modules）..."
cp -r "$ROOT_DIR/api-server/dist" "$DEPLOY_DIR/tuanjian-api/dist"
cp -r "$ROOT_DIR/api-server/node_modules" "$DEPLOY_DIR/tuanjian-api/node_modules"
cp "$ROOT_DIR/api-server/package.json" "$DEPLOY_DIR/tuanjian-api/package.json"
cp "$ROOT_DIR/api-server/ecosystem.config.js" "$DEPLOY_DIR/tuanjian-api/ecosystem.config.js" 2>/dev/null || true
cp "$ROOT_DIR/api-server/.env" "$DEPLOY_DIR/tuanjian-api/.env" 2>/dev/null || true

# 2. 构建后台管理端
echo ""
echo "[5/6] 构建后台管理端 (npm run build)..."
cd "$ROOT_DIR/admin-web"
npm run build

# 复制后台管理端文件
echo ""
echo "复制后台管理端文件..."
cp -r "$ROOT_DIR/admin-web/dist/"* "$DEPLOY_DIR/tuanjian-admin/"

# 3. 打包 zip
echo ""
echo "[6/6] 打包部署文件..."
cd "$DEPLOY_DIR"
zip -r "$DEPLOY_DIR/tuanjian-api.zip" tuanjian-api > /dev/null
zip -r "$DEPLOY_DIR/tuanjian-admin.zip" tuanjian-admin > /dev/null

echo ""
echo "========================================="
echo "  打包完成！"
echo "========================================="
echo ""
echo "部署包位置："
echo "  API 服务:     $DEPLOY_DIR/tuanjian-api.zip"
echo "  后台管理端:   $DEPLOY_DIR/tuanjian-admin.zip"
echo ""
echo "上传到服务器后："
echo "  1. 解压 tuanjian-api.zip 到 /www/wwwroot/123.56.72.218/tuanjian-api/"
echo "  2. 解压 tuanjian-admin.zip 到 /www/wwwroot/123.56.72.218/tuanjian-admin/"
echo "  3. pm2 restart tuanjian-api"
echo ""
