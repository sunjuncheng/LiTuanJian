const auth = require('../../utils/auth.js')
const app = getApp()

Page({
  data: {
    version: '1.0.0'
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  },

  about() {
    wx.showModal({
      title: '关于团建打卡',
      content: '版本：' + this.data.version + '\n一款团队协作打卡小程序',
      showCancel: false
    })
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout()
          wx.showToast({ title: '已退出', icon: 'success' })
          setTimeout(() => {
            wx.switchTab({ url: '/pages/profile/profile' })
          }, 800)
        }
      }
    })
  }
})
