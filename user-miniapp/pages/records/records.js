const { get } = require('../../utils/request.js')
const {
  DEFAULT_TASK_COVER,
  ILLUSTRATION_RECORDS
} = require('../../utils/default-images.js')

Page({
  data: {
    records: [],
    loading: false,
    defaultCover: DEFAULT_TASK_COVER,
    recordsIllustration: ILLUSTRATION_RECORDS,
    icons: {
      records: '/assets/icons/records.svg',
      success: '/assets/icons/success.svg',
      location: '/assets/icons/location.svg'
    }
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
