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
            accuracy: res.accuracy,
            speed: res.speed
          })
        },
        fail: (err) => {
          if (err.errMsg.indexOf('auth deny') !== -1 || err.errMsg.indexOf('authorize') !== -1) {
            wx.showModal({
              title: '定位权限',
              content: '需要获取您的地理位置才能完成打卡，请在设置中开启定位权限',
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
  },

  calculateDistance(lat1, lng1, lat2, lng2) {
    const rad = (d) => d * Math.PI / 180.0
    const R = 6378137
    const dLat = rad(lat2 - lat1)
    const dLng = rad(lng2 - lng1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  isWithinRange(lat1, lng1, lat2, lng2, range) {
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2)
    return {
      inRange: distance <= range,
      distance: Math.round(distance)
    }
  }
}

module.exports = location
