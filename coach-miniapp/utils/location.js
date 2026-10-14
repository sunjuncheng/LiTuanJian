const location = {
  getCurrentLocation(type = 'gcj02') {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type,
        isHighAccuracy: true,
        highAccuracyExpireTime: 4000,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          })
        },
        fail: (err) => {
          if (err.errMsg.indexOf('auth deny') !== -1 || err.errMsg.indexOf('authorize') !== -1) {
            wx.showModal({
              title: '定位权限',
              content: '需要获取您的地理位置来设置打卡点位，请在设置中开启定位权限',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting()
                }
              }
            })
          }
          reject(err)
        }
      })
    })
  },

  chooseLocation() {
    return new Promise((resolve, reject) => {
      wx.chooseLocation({
        success: resolve,
        fail: reject
      })
    })
  }
}

module.exports = location
