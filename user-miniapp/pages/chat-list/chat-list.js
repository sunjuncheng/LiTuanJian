const { get } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')

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
    loading: false,
    isLoggedIn: false
  },

  onShow() {
    const isLoggedIn = auth.isLoggedIn()
    this.setData({ isLoggedIn })
    if (isLoggedIn) {
      this.loadChatList()
    }
  },

  onPullDownRefresh() {
    this.loadChatList().finally(() => wx.stopPullDownRefresh())
  },

  async loadChatList() {
    if (!auth.isLoggedIn() || this.data.loading) return
    this.setData({ loading: true })
    try {
      const data = await get('/team/chat/list', {}, { silent: true })
      const list = (data.list || []).map(item => ({
        ...item,
        timeText: formatDateTime(item.lastMessageTime),
      }))
      this.setData({ list })
    } catch (e) {
      this.setData({ list: [] })
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  goLogin() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  openChat() {
    wx.navigateTo({ url: '/pages/team-chat/team-chat' })
  }
})
