import { defineStore } from 'pinia'
import { getSystemConfig } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    adminInfo: JSON.parse(localStorage.getItem('admin_info') || 'null'),
    systemName: localStorage.getItem('system_name') || '团建打卡'
  }),
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('admin_token', token)
    },
    setAdminInfo(info) {
      this.adminInfo = info
      localStorage.setItem('admin_info', JSON.stringify(info))
    },
    async loadSystemName() {
      try {
        const data = await getSystemConfig()
        if (data && data.systemName) {
          this.systemName = data.systemName
          localStorage.setItem('system_name', data.systemName)
          document.title = data.systemName
        }
      } catch (e) {
        console.error(e)
      }
    },
    setSystemName(name) {
      this.systemName = name
      localStorage.setItem('system_name', name)
      document.title = name
    },
    logout() {
      this.token = ''
      this.adminInfo = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
    }
  }
})
