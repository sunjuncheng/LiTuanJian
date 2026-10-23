const { get, post } = require('../../utils/request.js')
const location = require('../../utils/location.js')
const { ILLUSTRATION_START_POINT } = require('../../utils/default-images.js')

Page({
  data: {
    taskId: '',
    task: null,
    currentLocation: null,
    distance: 0,
    inRange: false,
    checking: false,
    unlocked: false,
    hasValidStartPoint: false,
    mapLatitude: 0,
    mapLongitude: 0,
    mapScale: 16,
    markers: [],
    circles: [],
    includePoints: [],
    startIllustration: ILLUSTRATION_START_POINT,
    icons: {
      location: '/assets/icons/location.svg',
      success: '/assets/icons/success.svg'
    }
  },

  onLoad(options) {
    this.setData({ taskId: options.taskId || options.id })
    this.loadTask()
  },

  async loadTask() {
    try {
      const task = await get('/tasks/' + this.data.taskId)
      this.setData({ task })
      this.updateMap(task, this.data.currentLocation, this.data.inRange)
    } catch (e) {
      console.error(e)
    }
  },

  updateMap(task, currentLocation, inRange) {
    const startPoint = task && task.startPoint ? task.startPoint : {}
    const startLatitude = Number(startPoint.latitude)
    const startLongitude = Number(startPoint.longitude)
    const hasValidStartPoint = !Number.isNaN(startLatitude) && !Number.isNaN(startLongitude) &&
      (startLatitude !== 0 || startLongitude !== 0)

    const markers = []
    const includePoints = []

    if (hasValidStartPoint) {
      markers.push({
        id: 1,
        latitude: startLatitude,
        longitude: startLongitude,
        width: 32,
        height: 32,
        callout: {
          content: startPoint.name || '任务启动点',
          display: 'ALWAYS',
          padding: 8,
          borderRadius: 8,
          bgColor: '#ffffff',
          color: '#333333'
        }
      })
      includePoints.push({
        latitude: startLatitude,
        longitude: startLongitude
      })
    }

    if (currentLocation) {
      markers.push({
        id: 2,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        width: 26,
        height: 26,
        callout: {
          content: '我的位置',
          display: 'BYCLICK',
          padding: 6,
          borderRadius: 8,
          bgColor: '#FF6B35',
          color: '#ffffff'
        }
      })
      includePoints.push({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      })
    }

    const circles = hasValidStartPoint
      ? [{
          latitude: startLatitude,
          longitude: startLongitude,
          radius: Number(startPoint.range) || 0,
          strokeWidth: 2,
          color: inRange ? '#34C759' : '#FF6B35',
          fillColor: inRange ? 'rgba(52, 199, 89, 0.18)' : 'rgba(255, 107, 53, 0.18)'
        }]
      : []

    const mapLatitude = currentLocation
      ? currentLocation.latitude
      : (hasValidStartPoint ? startLatitude : 0)
    const mapLongitude = currentLocation
      ? currentLocation.longitude
      : (hasValidStartPoint ? startLongitude : 0)

    this.setData({
      hasValidStartPoint,
      mapLatitude,
      mapLongitude,
      markers,
      circles,
      includePoints
    })
  },

  async checkLocation() {
    if (this.data.checking) return
    if (this.data.task && this.data.task.isEnded) {
      wx.showToast({ title: '任务已过时，无法解锁', icon: 'none' })
      return
    }
    this.setData({ checking: true })
    wx.showLoading({ title: '定位中...' })
    try {
      const loc = await location.getCurrentLocation()
      this.setData({ currentLocation: loc })
      if (this.data.task && this.data.task.startPoint) {
        const result = location.isWithinRange(
          loc.latitude, loc.longitude,
          this.data.task.startPoint.latitude,
          this.data.task.startPoint.longitude,
          this.data.task.startPoint.range
        )
        this.setData({
          distance: result.distance,
          inRange: result.inRange
        })
        this.updateMap(this.data.task, loc, result.inRange)
        if (result.inRange) {
          this.unlockTask(loc)
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '距离起点还有 ' + result.distance + ' 米',
            icon: 'none'
          })
        }
      }
    } catch (e) {
      wx.hideLoading()
      console.error(e)
    } finally {
      this.setData({ checking: false })
    }
  },

  async unlockTask(loc) {
    try {
      await post('/tasks/' + this.data.taskId + '/unlock', {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy
      }, { silent: true })
      wx.hideLoading()
      this.setData({ unlocked: true })
      wx.showModal({
        title: '解锁成功',
        content: '已抵达活动起点，全部打卡任务已解锁！',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: '/pages/checkin/checkin?taskId=' + this.data.taskId
          })
        }
      })
    } catch (e) {
      wx.hideLoading()
    }
  },

  openStartPointLocation() {
    if (!this.data.hasValidStartPoint || !this.data.task || !this.data.task.startPoint) {
      wx.showToast({ title: '未配置启动点坐标', icon: 'none' })
      return
    }
    const startPoint = this.data.task.startPoint
    wx.openLocation({
      latitude: Number(startPoint.latitude),
      longitude: Number(startPoint.longitude),
      scale: 18,
      name: startPoint.name || '任务启动点',
      address: startPoint.coordinateText || ''
    })
  },

  async moveToMyLocation() {
    let currentLocation = this.data.currentLocation
    if (!currentLocation) {
      wx.showLoading({ title: '定位中...' })
      try {
        currentLocation = await location.getCurrentLocation()
        this.setData({ currentLocation })
        this.updateMap(this.data.task, currentLocation, this.data.inRange)
      } catch (e) {
        console.error(e)
      } finally {
        wx.hideLoading()
      }
    }
    if (!currentLocation) {
      wx.showToast({ title: '定位失败，请重试', icon: 'none' })
      return
    }
    this.setData({
      mapLatitude: currentLocation.latitude,
      mapLongitude: currentLocation.longitude,
      mapScale: 17
    })
  },

  goCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin?taskId=' + this.data.taskId
    })
  }
})
