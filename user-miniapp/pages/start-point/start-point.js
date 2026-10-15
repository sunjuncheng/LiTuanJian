const { get, post } = require('../../utils/request.js')
const location = require('../../utils/location.js')

Page({
  data: {
    taskId: '',
    task: null,
    currentLocation: null,
    distance: 0,
    inRange: false,
    checking: false,
    unlocked: false
  },

  onLoad(options) {
    this.setData({ taskId: options.taskId || options.id })
    this.loadTask()
  },

  async loadTask() {
    try {
      const task = await get('/tasks/' + this.data.taskId)
      this.setData({ task })
    } catch (e) {
      console.error(e)
    }
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

  goCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin?taskId=' + this.data.taskId
    })
  }
})
