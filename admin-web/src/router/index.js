import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据概览', icon: 'DataAnalysis' }
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: () => import('@/views/TaskList.vue'),
        meta: { title: '任务管理', icon: 'List' }
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: () => import('@/views/TaskDetail.vue'),
        meta: { title: '任务详情', hidden: true }
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/UserList.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'coaches',
        name: 'CoachList',
        component: () => import('@/views/CoachList.vue'),
        meta: { title: '教练管理', icon: 'Avatar' }
      },
      {
        path: 'teams',
        name: 'TeamList',
        component: () => import('@/views/TeamList.vue'),
        meta: { title: '队伍管理', icon: 'UserFilled' }
      },
      {
        path: 'live',
        name: 'LiveManage',
        component: () => import('@/views/LiveManage.vue'),
        meta: { title: '直播管理', icon: 'VideoPlay' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SystemSettings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/tuanjian-admin/'),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
