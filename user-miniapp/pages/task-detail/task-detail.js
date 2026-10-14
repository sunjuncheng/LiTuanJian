const { get, post } = require('../../utils/request.js')
const app = getApp()

Page({
  data: {
    taskId: '',
    task: null,
    acceptModeText: '',
    myProgress: null
  },

  onLoad(options) {
    this.setData({ taskId: options.id })
    this.loadTaskDetail()
  },

  async loadTaskDetail() {
    try {
      const task = await get('/tasks/' + this.data.taskId)
      let acceptModeText = ''
      if (task.acceptMode === 1) acceptModeText = '仅单人接单'
      else if (task.acceptMode === 2) acceptModeText = '仅团队接单'
      else acceptModeText = '单人+团队均可接单'
      this.setData({ task, acceptModeText })
      this.loadMyProgress()
    } catch (e) {
      console.error(e)
    }
  },

  async loadMyProgress() {
    try {
      const progress = await get('/tasks/' + this.data.taskId + '/my-progress')
      this.setData({ myProgress: progress })
    } catch (e) {
      console.error(e)
    }
  },

  acceptSolo() {
    wx.showLoading({ title: '接单中...' })
    post('/tasks/' + this.data.taskId + '/accept', { mode: 'solo' })
      .then(() => {
        wx.hideLoading()
        wx.showToast({ title: '接单成功', icon: 'success' })
        app.globalData.needRefreshMyTasks = true
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1000)
      })
      .catch(() => wx.hideLoading())
  },

  acceptTeam() {
    wx.navigateTo({
      url: '/pages/team/team?taskId=' + this.data.taskId
    })
  },

  goStartPoint() {
    wx.navigateTo({
      url: '/pages/start-point/start-point?taskId=' + this.data.taskId
    })
  },

  goCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/checkin?taskId=' + this.data.taskId
    })
  }
})
