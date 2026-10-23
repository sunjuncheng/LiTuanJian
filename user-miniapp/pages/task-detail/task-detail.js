const { get, post } = require('../../utils/request.js')
const { DEFAULT_IMAGE, DEFAULT_TASK_COVER } = require('../../utils/default-images.js')
const app = getApp()

function formatCoordinate(latitude, longitude) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!lat && !lng) return '未设置坐标'
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

function formatDateTime(value) {
  if (!value) return '未设置截止时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未设置截止时间'
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function getAcceptModeText(mode) {
  if (mode === 1) return '仅个人接单'
  if (mode === 2) return '仅团队接单'
  return '个人+团队接单'
}

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
    defaultCover: DEFAULT_TASK_COVER,
    icons: {
      location: '/assets/icons/location.svg',
      team: '/assets/icons/team.svg',
      clock: '/assets/icons/clock.svg'
    },
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
      const checkpointList = (task.checkpoints || []).map((item, index) => ({
        ...item,
        sortLabel: `第${index + 1}站`,
        rangeText: `${Number(item.range) || 0}米`,
        coordinateText: formatCoordinate(item.latitude, item.longitude),
        referenceImage: item.referenceImage || DEFAULT_IMAGE,
        hasReferenceImage: !!item.referenceImage,
        photoRuleText: item.requireGroupPhoto ? '需要团队合照' : '普通打卡照片',
        remarkRuleText: item.allowRemark ? '允许填写备注' : '无需填写备注'
      }))

      this.setData({
        task: {
          ...task,
          coverImage: task.coverImage || DEFAULT_TASK_COVER,
          acceptModeText: getAcceptModeText(task.acceptMode),
          reviewModeText: task.needReview ? '需人工审核' : '自动审核',
          deadlineText: formatDateTime(task.deadline),
          checkpointCount: checkpointList.length,
          startPoint: {
            ...(task.startPoint || {}),
            name: task.startPoint && task.startPoint.name ? task.startPoint.name : '未设置启动点名称',
            rangeText: `${Number(task.startPoint && task.startPoint.range) || 0}米`,
            coordinateText: formatCoordinate(
              task.startPoint && task.startPoint.latitude,
              task.startPoint && task.startPoint.longitude
            )
          },
          checkpoints: checkpointList
        },
        acceptModeText: getAcceptModeText(task.acceptMode)
      })
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
