const { get, post } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')
const { DEFAULT_AVATAR } = require('../../utils/default-images.js')
const app = getApp()

Page({
  data: {
    taskId: '',
    myTeam: null,
    isLoggedIn: false,
    defaultAvatar: DEFAULT_AVATAR,
    creating: false,
    joining: false,
    fromTask: false
  },

  onLoad(options) {
    if (options.taskId) {
      this.setData({ taskId: options.taskId, fromTask: true })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    if (app.globalData.acceptTaskId) {
      this.setData({ taskId: app.globalData.acceptTaskId, fromTask: true })
      app.globalData.acceptTaskId = null
    }
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
    if (this.data.creating) return
    wx.showModal({
      title: '创建队伍',
      editable: true,
      placeholderText: '请输入队伍名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          this.setData({ creating: true })
          const isAccepting = this.data.fromTask && this.data.taskId
          wx.showLoading({ title: isAccepting ? '创建并接单中...' : '创建中...' })
          try {
            const team = await post('/team/create', { name: res.content }, { silent: true })
            this.setData({ myTeam: team })
            if (isAccepting) {
              await this.acceptTeamTask(team.id)
            } else {
              wx.hideLoading()
              wx.showToast({ title: '创建成功', icon: 'success' })
            }
          } catch (e) {
            wx.hideLoading()
            const msg = (e && e.msg) || '操作失败'
            wx.showToast({ title: msg, icon: 'none' })
          } finally {
            this.setData({ creating: false })
          }
        }
      }
    })
  },

  joinTeam() {
    if (this.data.joining) return
    wx.showModal({
      title: '加入队伍',
      editable: true,
      placeholderText: '请输入邀请码',
      success: async (res) => {
        if (res.confirm && res.content) {
          this.setData({ joining: true })
          const isAccepting = this.data.fromTask && this.data.taskId
          wx.showLoading({ title: isAccepting ? '加入并接单中...' : '加入中...' })
          try {
            const team = await post('/team/join', { code: res.content.toUpperCase() }, { silent: true })
            this.setData({ myTeam: team })
            if (isAccepting) {
              await this.acceptTeamTask(team.id)
            } else {
              wx.hideLoading()
              wx.showToast({ title: '加入成功', icon: 'success' })
            }
          } catch (e) {
            wx.hideLoading()
            const msg = (e && e.msg) || '操作失败'
            wx.showToast({ title: msg, icon: 'none' })
          } finally {
            this.setData({ joining: false })
          }
        }
      }
    })
  },

  acceptTeamTask(teamId) {
    return post('/tasks/' + this.data.taskId + '/accept', { mode: 'team', teamId }, { silent: true })
      .then(() => {
        wx.hideLoading()
        wx.showToast({ title: '接单成功', icon: 'success' })
        app.globalData.needRefreshMyTasks = true
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 800)
      })
      .catch((e) => {
        wx.hideLoading()
        const msg = (e && e.msg) || '接单失败'
        wx.showModal({
          title: '队伍已创建',
          content: '队伍创建成功，但接单失败：' + msg,
          showCancel: false
        })
      })
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
    const isLeader = this.data.myTeam.isLeader
    const title = isLeader ? '确认解散队伍？' : '确认退出队伍？'
    const content = isLeader ? '解散后队伍将不存在，确定吗？' : '退出后需重新加入，确定退出吗？'
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          post('/team/leave', {}, { silent: true })
            .then(() => {
              wx.showToast({ title: isLeader ? '已解散' : '已退出', icon: 'success' })
              this.setData({ myTeam: null })
            })
            .catch((e) => {
              const msg = (e && e.msg) || '操作失败'
              wx.showToast({ title: msg, icon: 'none' })
            })
        }
      }
    })
  },

  removeMember(e) {
    const userId = e.currentTarget.dataset.userId
    const nickname = e.currentTarget.dataset.nickname
    wx.showModal({
      title: '移除队员',
      content: `确定将「${nickname}」移出队伍吗？`,
      success: (res) => {
        if (res.confirm) {
          post('/team/members/' + userId + '/remove', {}, { silent: true })
            .then(() => {
              wx.showToast({ title: '已移除', icon: 'success' })
              this.loadMyTeam()
            })
            .catch((e) => {
              const msg = (e && e.msg) || '操作失败'
              wx.showToast({ title: msg, icon: 'none' })
            })
        }
      }
    })
  }
})
