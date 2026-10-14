const { get } = require('../../utils/request.js')
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

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/task-detail/task-detail?id=' + id })
  }
})
