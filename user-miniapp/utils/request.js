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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data
          if (body && typeof body === 'object' && body.code !== undefined) {
            if (body.code === 0) {
              resolve(body.data)
            } else if (body.code === 401) {
              wx.removeStorageSync('token')
              wx.removeStorageSync('userInfo')
              app.globalData.token = ''
              app.globalData.userInfo = null
              reject(body)
            } else {
              if (!silent) {
                wx.showToast({ title: body.msg || '请求失败', icon: 'none' })
              }
              reject(body)
            }
          } else {
            resolve(body)
          }
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          app.globalData.token = ''
          app.globalData.userInfo = null
          reject(res)
        } else {
          const body = res.data
          const errMsg = (body && body.msg) || (body && body.message) || '网络请求失败(' + res.statusCode + ')'
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
