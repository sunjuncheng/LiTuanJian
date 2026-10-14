import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    adminInfo: JSON.parse(localStorage.getItem('admin_info') || 'null')
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
    logout() {
      this.token = ''
      this.adminInfo = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
    }
  }
})
