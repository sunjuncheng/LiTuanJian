const { get, post } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')
const app = getApp()

Page({
  data: {
    taskId: '',
    myTeam: null,
    inviteCode: '',
    joinCode: '',
    isLoggedIn: false
  },

  onLoad(options) {
    if (options.taskId) {
      this.setData({ taskId: options.taskId })
    }
  },

  onShow() {
    this.setData({ isLoggedIn: auth.isLoggedIn() })
    if (auth.isLoggedIn()) {
      this.loadMyTeam()
    }
  },

  goLogin() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  async loadMyTeam() {
    try {
      const team = await get('/team/my', {}, { silent: true })
      this.setData({ myTeam: team })
    } catch (e) {
      this.setData({ myTeam: null })
    }
  },

  createTeam() {
    wx.showModal({
      title: '创建队伍',
      editable: true,
      placeholderText: '请输入队伍名称',
      success: (res) => {
        if (res.confirm && res.content) {
          post('/team/create', { name: res.content, taskId: this.data.taskId })
            .then((team) => {
              wx.showToast({ title: '创建成功', icon: 'success' })
              this.setData({ myTeam: team })
              if (this.data.taskId) {
                this.acceptTeamTask(team.id)
              }
            })
            .catch(() => {})
        }
      }
    })
  },

  joinTeam() {
    wx.showModal({
      title: '加入队伍',
      editable: true,
      placeholderText: '请输入邀请码',
      success: (res) => {
        if (res.confirm && res.content) {
          post('/team/join', { code: res.content, taskId: this.data.taskId })
            .then((team) => {
              wx.showToast({ title: '加入成功', icon: 'success' })
              this.setData({ myTeam: team })
              if (this.data.taskId) {
                this.acceptTeamTask(team.id)
              }
            })
            .catch(() => {})
        }
      }
    })
  },

  acceptTeamTask(teamId) {
    post('/tasks/' + this.data.taskId + '/accept', { mode: 'team', teamId })
      .then(() => {
        wx.showToast({ title: '接单成功', icon: 'success' })
        app.globalData.needRefreshMyTasks = true
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1000)
      })
      .catch(() => {})
  },

  copyCode() {
    wx.setClipboardData({
      data: this.data.myTeam.inviteCode,
      success: () => {
        wx.showToast({ title: '邀请码已复制', icon: 'success' })
      }
    })
  },

  leaveTeam() {
    wx.showModal({
      title: '确认退出',
      content: '退出队伍后将转为单人模式，确定退出吗？',
      success: (res) => {
        if (res.confirm) {
          post('/team/leave')
            .then(() => {
              wx.showToast({ title: '已退出队伍', icon: 'success' })
              this.setData({ myTeam: null })
            })
            .catch(() => {})
        }
      }
    })
  }
})
