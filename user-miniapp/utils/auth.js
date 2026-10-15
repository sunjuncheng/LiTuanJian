const app = getApp()

const auth = {
  getUserInfo() {
    return app.globalData.userInfo || wx.getStorageSync('userInfo')
  },

  setUserInfo(userInfo) {
    app.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  getToken() {
    return app.globalData.token || wx.getStorageSync('token')
  },

  isLoggedIn() {
    return !!this.getToken()
  },

  logout() {
    app.globalData.token = ''
    app.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },

  requireLogin() {
    if (!this.isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            app.login()
          }
        }
      })
      return false
    }
    return true
  }
}

module.exports = auth
