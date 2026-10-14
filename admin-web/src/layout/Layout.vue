<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <el-icon :size="28"><Trophy /></el-icon>
        </div>
        <div class="logo-text">
          <div class="logo-title">团建打卡</div>
          <div class="logo-subtitle">运动管理后台</div>
        </div>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
      >
        <el-menu-item v-for="route in menuRoutes" :key="route.path" :index="route.path">
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div class="deco-circle"></div>
      </div>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <div class="breadcrumb-bar">
            <span class="page-title">{{ $route.meta.title }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <div class="avatar">
                <el-icon :size="18"><User /></el-icon>
              </div>
              <span class="user-name">{{ adminInfo?.name || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()

const adminInfo = computed(() => userStore.adminInfo)

const menuRoutes = computed(() => {
  return router.options.routes
    .find(r => r.path === '/')
    .children
    .filter(r => !r.meta?.hidden)
})

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #1a2332 0%, #2d3e50 100%);
  overflow: hidden;
  position: relative;
}

.logo {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 14px;
  background: rgba(255, 255, 255, 0.05);
}

.logo-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.logo-text {
  flex: 1;
}

.logo-title {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}

.logo-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  margin-top: 2px;
  letter-spacing: 1px;
}

.sidebar-menu {
  border-right: none !important;
  background: transparent !important;
  padding: 12px 0;
}

.sidebar-menu .el-menu-item {
  margin: 4px 12px;
  border-radius: 10px;
  height: 48px;
  line-height: 48px;
  color: rgba(255, 255, 255, 0.7) !important;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.35);
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  overflow: hidden;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  bottom: -60px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 70%);
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 64px !important;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #475569;
  padding: 6px 14px;
  border-radius: 24px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f1f5f9;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.user-name {
  font-weight: 600;
}

.main-content {
  background: #f0f4f8;
  padding: 24px;
}
</style>
