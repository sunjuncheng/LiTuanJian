const { get, post } = require('../../utils/request.js')
const app = getApp()

Page({
  data: {
    taskList: [],
    loading: false
  },

  onShow() {
    if (!app.globalData.token && !wx.getStorageSync('coach_token')) {
      return
    }
    this.loadTaskList()
  },

  onPullDownRefresh() {
    this.loadTaskList().then(() => wx.stopPullDownRefresh())
  },

  async loadTaskList() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const list = await get('/coach/tasks')
      this.setData({ taskList: list || [] })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/task-create/task-create' })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/task-detail/task-detail?id=' + id })
  },

  deleteTask(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          post('/coach/tasks/' + id + '/delete').then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadTaskList()
          }).catch(() => {})
        }
      }
    })
  }
})
