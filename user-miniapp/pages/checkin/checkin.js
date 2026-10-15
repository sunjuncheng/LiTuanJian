const { get, post } = require('../../utils/request.js')
const location = require('../../utils/location.js')
const { DEFAULT_IMAGE } = require('../../utils/default-images.js')

Page({
  data: {
    taskId: '',
    checkpoints: [],
    currentIndex: 0,
    photoPath: '',
    remark: '',
    submitting: false,
    isEnded: false,
    defaultImage: DEFAULT_IMAGE
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
    } catch (e) {
      console.error(e)
    }
  },

  selectCheckpoint(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentIndex: index, photoPath: '', remark: '' })
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
      const loc = await location.getCurrentLocation()
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
