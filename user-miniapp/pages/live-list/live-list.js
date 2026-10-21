const { get } = require('../../utils/request.js')

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

Page({
  data: {
    list: [],
    current: null,
    loading: false
  },

  onShow() {
    this.loadList()
  },

  async loadList() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const data = await get('/live/list', {}, { silent: true })
      const list = (data.list || []).map((item) => ({
        ...item,
        createdText: formatDateTime(item.createdAt),
        startedText: formatDateTime(item.startedAt)
      }))
      const current = data.current
        ? {
            ...data.current,
            startedText: formatDateTime(data.current.startedAt)
          }
        : null
      this.setData({ list, current })
    } catch (e) {
      console.error(e)
      wx.showToast({ title: (e && e.msg) || '加载直播失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  openCurrentLive() {
    if (!this.data.current) return
    this.openLiveById(this.data.current.id)
  },

  openLive(e) {
    const id = Number(e.currentTarget.dataset.id) || 0
    if (!id) return
    this.openLiveById(id)
  },

  openLiveById(id) {
    wx.navigateTo({
      url: '/pages/live-watch/live-watch?id=' + id
    })
  }
})
