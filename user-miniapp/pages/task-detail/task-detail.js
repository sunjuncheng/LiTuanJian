const { get, post } = require('../../utils/request.js')
const { DEFAULT_IMAGE } = require('../../utils/default-images.js')
const app = getApp()

Page({
  data: {
    taskId: '',
    task: null,
    acceptModeText: '',
    myProgress: null,
    myTeam: null,
    isTeamTask: false,
    canGiveUp: false,
    canCancel: false,
    defaultImage: DEFAULT_IMAGE,
    accepting: false
  },

  onLoad(options) {
    this.setData({ taskId: options.id })
    this.loadTaskDetail()
  },

  onShow() {
    if (this.data.taskId) {
      this.loadTaskDetail()
    }
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
      this.loadMyTeam()
    } catch (e) {
      console.error(e)
    }
  },

  async loadMyTeam() {
    try {
      const team = await get('/team/my', {}, { silent: true })
      this.setData({ myTeam: team })
      const progress = this.data.myProgress
      if (progress) {
        const isTeamTask = !!(progress && progress.memberCount !== undefined)
        const canGiveUp = !!(team && team.isLeader && isTeamTask)
        this.setData({ canGiveUp })
      }
    } catch (e) {
      this.setData({ myTeam: null })
    }
  },

  async loadMyProgress() {
    try {
      const progress = await get('/tasks/' + this.data.taskId + '/my-progress')
      const isTeamTask = !!(progress && progress.memberCount !== undefined)
      const canGiveUp = !!(this.data.myTeam && this.data.myTeam.isLeader && isTeamTask)
      const canCancel = !isTeamTask
      this.setData({ myProgress: progress, isTeamTask, canGiveUp, canCancel })
    } catch (e) {
      console.error(e)
    }
  },

  async acceptSolo() {
    if (this.data.accepting) return
    this.setData({ accepting: true })
    wx.showLoading({ title: '接单中...' })
    try {
      await post('/tasks/' + this.data.taskId + '/accept', { mode: 'solo' }, { silent: true })
      wx.hideLoading()
      wx.showToast({ title: '接单成功', icon: 'success' })
      app.globalData.needRefreshMyTasks = true
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 800)
    } catch (e) {
      wx.hideLoading()
      const msg = (e && e.msg) || '接单失败'
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ accepting: false })
    }
  },

  async acceptTeam() {
    if (this.data.accepting) return
    this.setData({ accepting: true })
    wx.showLoading({ title: '加载中...' })
    try {
      const myTeam = await get('/team/my', {}, { silent: true })
      if (!myTeam) {
        wx.hideLoading()
        app.globalData.acceptTaskId = this.data.taskId
        wx.switchTab({ url: '/pages/team/team' })
        return
      }
      if (!myTeam.isLeader) {
        wx.hideLoading()
        wx.showToast({ title: '仅队长可发起团队接单', icon: 'none' })
        return
      }
      wx.hideLoading()
      wx.showLoading({ title: '接单中...' })
      await post('/tasks/' + this.data.taskId + '/accept', { mode: 'team', teamId: myTeam.id }, { silent: true })
      wx.hideLoading()
      wx.showToast({ title: '接单成功', icon: 'success' })
      app.globalData.needRefreshMyTasks = true
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 800)
    } catch (e) {
      wx.hideLoading()
      const msg = (e && e.msg) || '接单失败'
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ accepting: false })
    }
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
  },

  giveUpTeamTask() {
    wx.showModal({
      title: '放弃团队接单',
      content: '放弃后队伍所有成员的该任务都将取消，确定吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          post('/tasks/' + this.data.taskId + '/giveup', {}, { silent: true })
            .then(() => {
              wx.hideLoading()
              wx.showToast({ title: '已放弃', icon: 'success' })
              app.globalData.needRefreshMyTasks = true
              setTimeout(() => {
                wx.switchTab({ url: '/pages/index/index' })
              }, 800)
            })
            .catch((e) => {
              wx.hideLoading()
              const msg = (e && e.msg) || '操作失败'
              wx.showToast({ title: msg, icon: 'none' })
            })
        }
      }
    })
  },

  cancelTask() {
    wx.showModal({
      title: '放弃任务',
      content: '确定放弃该任务吗？放弃后需重新接单',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          post('/tasks/' + this.data.taskId + '/cancel', {}, { silent: true })
            .then(() => {
              wx.hideLoading()
              wx.showToast({ title: '已放弃', icon: 'success' })
              app.globalData.needRefreshMyTasks = true
              setTimeout(() => {
                wx.switchTab({ url: '/pages/index/index' })
              }, 800)
            })
            .catch((e) => {
              wx.hideLoading()
              const msg = (e && e.msg) || '操作失败'
              wx.showToast({ title: msg, icon: 'none' })
            })
        }
      }
    })
  }
})
