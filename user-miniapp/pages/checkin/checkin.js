const { get, post } = require('../../utils/request.js')
const location = require('../../utils/location.js')
const {
  DEFAULT_IMAGE,
  ILLUSTRATION_CHECKIN
} = require('../../utils/default-images.js')

Page({
  data: {
    taskId: '',
    checkpoints: [],
    currentIndex: 0,
    photoPath: '',
    remark: '',
    submitting: false,
    isEnded: false,
    defaultImage: DEFAULT_IMAGE,
    checkinIllustration: ILLUSTRATION_CHECKIN,
    currentLocation: null,
    distance: 0,
    inRange: false,
    mapLatitude: 0,
    mapLongitude: 0,
    mapScale: 16,
    markers: [],
    circles: [],
    includePoints: [],
    icons: {
      location: '/assets/icons/location.svg',
      success: '/assets/icons/success.svg',
      camera: '/assets/icons/camera.svg'
    }
  },

  onLoad(options) {
    this.setData({ taskId: options.taskId })
    this.loadTaskAndCheckpoints()
  },

  async loadTaskAndCheckpoints() {
    try {
      const [task, checkpoints] = await Promise.all([
        get('/tasks/' + this.data.taskId),
        get('/tasks/' + this.data.taskId + '/checkpoints')
      ])
      this.setData({ checkpoints, isEnded: !!(task && task.isEnded) })
      this.updateCurrentCheckpointMap()
    } catch (e) {
      console.error(e)
    }
  },

  selectCheckpoint(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentIndex: index, photoPath: '', remark: '' })
    this.updateCurrentCheckpointMap()
  },

  updateCurrentCheckpointMap() {
    const checkpoint = this.data.checkpoints[this.data.currentIndex]
    if (!checkpoint) {
      this.setData({
        mapLatitude: 0,
        mapLongitude: 0,
        markers: [],
        circles: [],
        includePoints: [],
        distance: 0,
        inRange: false
      })
      return
    }

    const latitude = Number(checkpoint.latitude)
    const longitude = Number(checkpoint.longitude)
    const hasValidCheckpoint = !Number.isNaN(latitude) && !Number.isNaN(longitude) &&
      (latitude !== 0 || longitude !== 0)
    const currentLocation = this.data.currentLocation
    const markers = []
    const includePoints = []

    if (hasValidCheckpoint) {
      markers.push({
        id: 1,
        latitude,
        longitude,
        width: 32,
        height: 32,
        callout: {
          content: checkpoint.name || '打卡点',
          display: 'ALWAYS',
          padding: 8,
          borderRadius: 8,
          bgColor: '#ffffff',
          color: '#333333'
        }
      })
      includePoints.push({ latitude, longitude })
    }

    let distance = 0
    let inRange = false
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

      if (hasValidCheckpoint) {
        const rangeResult = location.isWithinRange(
          currentLocation.latitude,
          currentLocation.longitude,
          latitude,
          longitude,
          checkpoint.range || 50
        )
        distance = rangeResult.distance
        inRange = rangeResult.inRange
      }
    }

    const circles = hasValidCheckpoint
      ? [{
          latitude,
          longitude,
          radius: Number(checkpoint.range) || 0,
          strokeWidth: 2,
          color: inRange ? '#34C759' : '#FF6B35',
          fillColor: inRange ? 'rgba(52, 199, 89, 0.18)' : 'rgba(255, 107, 53, 0.18)'
        }]
      : []

    this.setData({
      distance,
      inRange,
      mapLatitude: currentLocation ? currentLocation.latitude : latitude,
      mapLongitude: currentLocation ? currentLocation.longitude : longitude,
      markers,
      circles,
      includePoints
    })
  },

  async fetchCurrentLocation(showLoading = true) {
    if (showLoading) {
      wx.showLoading({ title: '定位中...' })
    }
    try {
      const currentLocation = await location.getCurrentLocation()
      this.setData({ currentLocation })
      this.updateCurrentCheckpointMap()
      return currentLocation
    } catch (e) {
      console.error(e)
      return null
    } finally {
      if (showLoading) {
        wx.hideLoading()
      }
    }
  },

  async moveToMyLocation() {
    const currentLocation = this.data.currentLocation || await this.fetchCurrentLocation(true)
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

  openCheckpointLocation() {
    const checkpoint = this.data.checkpoints[this.data.currentIndex]
    if (!checkpoint) {
      wx.showToast({ title: '暂无打卡点信息', icon: 'none' })
      return
    }
    wx.openLocation({
      latitude: Number(checkpoint.latitude),
      longitude: Number(checkpoint.longitude),
      scale: 18,
      name: checkpoint.name || '打卡点'
    })
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => {
        this.setData({ photoPath: res.tempFiles[0].tempFilePath })
      }
    })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  async submitCheckin() {
    if (this.data.isEnded) {
      wx.showToast({ title: '任务已过时，无法打卡', icon: 'none' })
      return
    }
    if (!this.data.photoPath) {
      wx.showToast({ title: '请先拍照', icon: 'none' })
      return
    }
    if (this.data.submitting) return
    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })
    try {
      const loc = await this.fetchCurrentLocation(false)
      if (!loc) {
        wx.hideLoading()
        this.setData({ submitting: false })
        wx.showToast({ title: '定位失败，请重试', icon: 'none' })
        return
      }
      const cp = this.data.checkpoints[this.data.currentIndex]
      const rangeResult = location.isWithinRange(
        loc.latitude, loc.longitude,
        cp.latitude, cp.longitude, cp.range || 50
      )
      if (!rangeResult.inRange) {
        wx.hideLoading()
        wx.showToast({
          title: '未到达打卡点，距 ' + rangeResult.distance + ' 米',
          icon: 'none'
        })
        this.setData({ submitting: false })
        return
      }
      await post('/checkin/submit', {
        taskId: this.data.taskId,
        checkpointId: cp.id,
        photo: this.data.photoPath,
        remark: this.data.remark,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy
      }, { silent: true })
      wx.hideLoading()
      wx.showToast({ title: '提交成功，待审核', icon: 'success' })

      const nextIndex = this.findNextPendingCheckpoint()
      if (nextIndex >= 0) {
        setTimeout(() => {
          this.setData({
            currentIndex: nextIndex,
            photoPath: '',
            remark: '',
            submitting: false
          })
          this.loadTaskAndCheckpoints()
        }, 1000)
      } else {
        setTimeout(() => {
          wx.showToast({ title: '全部打卡完成', icon: 'success' })
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        }, 800)
      }
    } catch (e) {
      wx.hideLoading()
      this.setData({ submitting: false })
    }
  },

  findNextPendingCheckpoint() {
    const list = this.data.checkpoints
    const current = this.data.currentIndex
    for (let i = current + 1; i < list.length; i++) {
      if (list[i].status !== 'passed' && list[i].status !== 'reviewing') {
        return i
      }
    }
    for (let i = 0; i < current; i++) {
      if (list[i].status !== 'passed' && list[i].status !== 'reviewing') {
        return i
      }
    }
    return -1
  }
})
