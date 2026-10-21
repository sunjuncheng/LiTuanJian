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
    id: 0,
    detail: null,
    loading: false,
    playerState: ''
  },

  onLoad(options) {
    this.setData({
      id: Number(options.id) || 0
    })
  },

  onShow() {
    this.loadDetail()
  },

  async loadDetail() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const data = this.data.id
        ? await get('/live/' + this.data.id, {}, { silent: true })
        : await get('/live/current', {}, { silent: true })

      if (!data) {
        this.setData({ detail: null })
        return
      }

      wx.setNavigationBarTitle({ title: data.title || '直播观看' })
      this.setData({
        detail: {
          ...data,
          startedText: formatDateTime(data.startedAt),
          createdText: formatDateTime(data.createdAt)
        }
      })
    } catch (e) {
      console.error(e)
      wx.showToast({ title: (e && e.msg) || '加载直播失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onStateChange(e) {
    const code = Number(e.detail && e.detail.code)
    const map = {
      2004: '直播已开始',
      2007: '正在缓冲画面',
      2103: '网络断开，正在重连',
      3005: '直播已结束'
    }
    if (map[code]) {
      this.setData({ playerState: map[code] })
    }
  }
})
