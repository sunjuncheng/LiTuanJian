const app = getApp()

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token || wx.getStorageSync('coach_token')
    wx.request({
      url: app.globalData.apiBaseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            wx.removeStorageSync('coach_token')
            wx.removeStorageSync('coach_info')
            app.globalData.token = ''
            app.globalData.coachInfo = null
            wx.switchTab({ url: '/pages/profile/profile' })
            reject(res.data)
          } else {
            wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('coach_token')
          wx.removeStorageSync('coach_info')
          app.globalData.token = ''
          app.globalData.coachInfo = null
          wx.switchTab({ url: '/pages/profile/profile' })
          reject(res)
        } else {
          const errMsg = (res.data && res.data.msg) || '网络请求失败'
          wx.showToast({ title: errMsg, icon: 'none' })
          reject(res)
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

const get = (url, data) => request({ url, method: 'GET', data })
const post = (url, data) => request({ url, method: 'POST', data })
const put = (url, data) => request({ url, method: 'PUT', data })
const del = (url, data) => request({ url, method: 'DELETE', data })

module.exports = { request, get, post, put, del }
