const config = require('./utils/config.js')

App({
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: config.apiBaseUrl,
    currentTask: null,
    currentTeam: null,
    needRefreshMyTasks: false
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
    }
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: this.globalData.apiBaseUrl + '/auth/wx-login',
              method: 'POST',
              data: { code: res.code },
              success: (resp) => {
                if (resp.data.code === 0) {
                  this.globalData.token = resp.data.data.token
                  this.globalData.userInfo = resp.data.data.userInfo
                  wx.setStorageSync('token', resp.data.data.token)
                  wx.setStorageSync('userInfo', resp.data.data.userInfo)
                  resolve(resp.data.data)
                } else {
                  reject(resp.data.msg)
                }
              },
              fail: reject
            })
          } else {
            reject('微信登录失败')
          }
        },
        fail: reject
      })
    })
  },

  userLogin(phone, password) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBaseUrl + '/auth/login',
        method: 'POST',
        data: { phone, password },
        success: (resp) => {
          if (resp.data.code === 0) {
            this.globalData.token = resp.data.data.token
            this.globalData.userInfo = resp.data.data.userInfo
            wx.setStorageSync('token', resp.data.data.token)
            wx.setStorageSync('userInfo', resp.data.data.userInfo)
            resolve(resp.data.data)
          } else {
            reject(resp.data.msg)
          }
        },
        fail: reject
      })
    })
  },

  userRegister(phone, password, nickname) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBaseUrl + '/auth/register',
        method: 'POST',
        data: { phone, password, nickname },
        success: (resp) => {
          if (resp.data && resp.data.code === 0) {
            this.globalData.token = resp.data.data.token
            this.globalData.userInfo = resp.data.data.userInfo
            wx.setStorageSync('token', resp.data.data.token)
            wx.setStorageSync('userInfo', resp.data.data.userInfo)
            resolve(resp.data.data)
          } else {
            reject(resp.data && resp.data.msg ? resp.data.msg : '注册失败：' + JSON.stringify(resp.data))
          }
        },
        fail: (err) => {
          reject('网络错误：' + (err.errMsg || JSON.stringify(err)))
        }
      })
    })
  },

  checkLogin() {
    if (!this.globalData.token) {
      return this.login()
    }
    return Promise.resolve()
  }
})
