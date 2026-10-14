const { get, post } = require('../../utils/request.js')

Page({
  data: {
    taskId: '',
    participantId: '',
    checkpoints: [],
    currentIndex: 0,
    rejectReason: '',
    showReject: false
  },

  onLoad(options) {
    this.setData({
      taskId: options.taskId,
      participantId: options.participantId
    })
    this.loadCheckpoints()
  },

  async loadCheckpoints() {
    try {
      const checkpoints = await get('/coach/review/checkpoints', {
        taskId: this.data.taskId,
        participantId: this.data.participantId
      })
      this.setData({ checkpoints })
    } catch (e) {
      console.error(e)
    }
  },

  selectCheckpoint(e) {
    this.setData({ currentIndex: e.currentTarget.dataset.index })
  },

  approve() {
    const cp = this.data.checkpoints[this.data.currentIndex]
    if (!cp) return
    post('/coach/review/approve', {
      taskId: this.data.taskId,
      participantId: this.data.participantId,
      checkpointId: cp.id
    }).then(() => {
      wx.showToast({ title: '已通过', icon: 'success' })
      this.loadCheckpoints()
    }).catch(() => {})
  },

  reject() {
    this.setData({ showReject: true })
  },

  onRejectInput(e) {
    this.setData({ rejectReason: e.detail.value })
  },

  confirmReject() {
    if (!this.data.rejectReason) {
      wx.showToast({ title: '请填写驳回原因', icon: 'none' })
      return
    }
    const cp = this.data.checkpoints[this.data.currentIndex]
    if (!cp) return
    post('/coach/review/reject', {
      taskId: this.data.taskId,
      participantId: this.data.participantId,
      checkpointId: cp.id,
      reason: this.data.rejectReason
    }).then(() => {
      wx.showToast({ title: '已驳回', icon: 'success' })
      this.setData({ showReject: false, rejectReason: '' })
      this.loadCheckpoints()
    }).catch(() => {})
  },

  cancelReject() {
    this.setData({ showReject: false, rejectReason: '' })
  }
})
