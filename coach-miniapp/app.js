const config = require('./utils/config.js')

App({
  globalData: {
    coachInfo: null,
    token: '',
    apiBaseUrl: config.apiBaseUrl
  },

  onLaunch() {
    const token = wx.getStorageSync('coach_token')
    if (token) {
      this.globalData.token = token
    }
    const coachInfo = wx.getStorageSync('coach_info')
    if (coachInfo) {
      this.globalData.coachInfo = coachInfo
    }
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: this.globalData.apiBaseUrl + '/coach/auth/wx-login',
              method: 'POST',
              data: { code: res.code },
              success: (resp) => {
                if (resp.data.code === 0) {
                  this.globalData.token = resp.data.data.token
                  this.globalData.coachInfo = resp.data.data.coachInfo
                  wx.setStorageSync('coach_token', resp.data.data.token)
                  wx.setStorageSync('coach_info', resp.data.data.coachInfo)
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

  bindWx(phone, password) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: this.globalData.apiBaseUrl + '/coach/auth/bind-wx',
              method: 'POST',
              data: { code: res.code, phone, password },
              success: (resp) => {
                if (resp.data.code === 0) {
                  this.globalData.token = resp.data.data.token
                  this.globalData.coachInfo = resp.data.data.coachInfo
                  wx.setStorageSync('coach_token', resp.data.data.token)
                  wx.setStorageSync('coach_info', resp.data.data.coachInfo)
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

  coachLogin(phone, password) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBaseUrl + '/coach/auth/login',
        method: 'POST',
        data: { phone, password },
        success: (resp) => {
          if (resp.data.code === 0) {
            this.globalData.token = resp.data.data.token
            this.globalData.coachInfo = resp.data.data.coachInfo
            wx.setStorageSync('coach_token', resp.data.data.token)
            wx.setStorageSync('coach_info', resp.data.data.coachInfo)
            resolve(resp.data.data)
          } else {
            reject(resp.data.msg)
          }
        },
        fail: reject
      })
    })
  }
})
