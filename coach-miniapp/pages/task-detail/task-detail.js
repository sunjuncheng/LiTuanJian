const { get, post } = require('../../utils/request.js')

Page({
  data: {
    taskId: '',
    task: null,
    participants: [],
    teams: [],
    activeTab: 'solo'
  },

  onLoad(options) {
    this.setData({ taskId: options.id })
    this.loadDetail()
  },

  async loadDetail() {
    try {
      const [task, participants, teams] = await Promise.all([
        get('/coach/tasks/' + this.data.taskId),
        get('/coach/tasks/' + this.data.taskId + '/participants'),
        get('/coach/tasks/' + this.data.taskId + '/teams')
      ])
      this.setData({ task, participants, teams })
    } catch (e) {
      console.error(e)
    }
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  goReview(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/review-detail/review-detail?taskId=' + this.data.taskId + '&participantId=' + id
    })
  },

  manualUnlock(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '手动解锁',
      content: '确定为该用户手动解锁任务吗？',
      success: (res) => {
        if (res.confirm) {
          post('/coach/tasks/' + this.data.taskId + '/unlock', { participantId: id })
            .then(() => {
              wx.showToast({ title: '已解锁', icon: 'success' })
              this.loadDetail()
            })
            .catch(() => {})
        }
      }
    })
  },

  remind(e) {
    const id = e.currentTarget.dataset.id
    post('/coach/tasks/' + this.data.taskId + '/remind', { participantId: id })
      .then(() => {
        wx.showToast({ title: '已发送提醒', icon: 'success' })
      })
      .catch(() => {})
  }
})
