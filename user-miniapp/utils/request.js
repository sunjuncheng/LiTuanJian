const app = getApp()

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token || wx.getStorageSync('token')
    wx.request({
      url: app.globalData.apiBaseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : ''
      },
      success: (res) => {
        const silent = options.silent
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            app.globalData.token = ''
            app.globalData.userInfo = null
            reject(res.data)
          } else {
            if (!silent) {
              wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
            }
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          app.globalData.token = ''
          app.globalData.userInfo = null
          reject(res)
        } else {
          const errMsg = (res.data && res.data.msg) || (res.data && res.data.message) || '网络请求失败(' + res.statusCode + ')'
          if (!silent) {
            wx.showToast({ title: errMsg, icon: 'none' })
          }
          reject(res)
        }
      },
      fail: (err) => {
        if (!options.silent) {
          wx.showToast({ title: '网络连接失败', icon: 'none' })
        }
        reject(err)
      }
    })
  })
}

const get = (url, data, options = {}) => request({ url, method: 'GET', data, ...options })
const post = (url, data, options = {}) => request({ url, method: 'POST', data, ...options })
const put = (url, data, options = {}) => request({ url, method: 'PUT', data, ...options })
const del = (url, data, options = {}) => request({ url, method: 'DELETE', data, ...options })

module.exports = { request, get, post, put, del }
