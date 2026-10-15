const { get } = require('../../utils/request.js')
const { DEFAULT_TASK_COVER } = require('../../utils/default-images.js')

Page({
  data: {
    records: [],
    loading: false,
    defaultCover: DEFAULT_TASK_COVER
  },

  onShow() {
    this.loadRecords()
  },

  async loadRecords() {
    this.setData({ loading: true })
    try {
      const list = await get('/tasks/my', {}, { silent: true })
      const records = (list || []).filter(item => item.statusText === '已完成')
      this.setData({ records })
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
