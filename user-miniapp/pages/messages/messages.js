const { get, post } = require('../../utils/request.js')

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
    unreadCount: 0,
    loading: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.loadMessages()
  },

  async loadMessages() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const data = await get('/user/messages')
      const list = (data.list || []).map((item) => ({
        ...item,
        timeText: formatDateTime(item.createdAt),
        typeText:
          item.type === 'task_reminder'
            ? '任务提醒'
            : item.type === 'live_reminder'
              ? '直播提醒'
              : '系统消息'
      }))
      this.setData({
        list,
        unreadCount: data.unreadCount || 0
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  async openMessage(e) {
    const id = Number(e.currentTarget.dataset.id)
    const taskId = Number(e.currentTarget.dataset.taskId) || 0
    const liveRoomId = Number(e.currentTarget.dataset.liveRoomId) || 0
    const isRead = !!e.currentTarget.dataset.isRead
    if (!isRead) {
      try {
        await post('/user/messages/' + id + '/read', {}, { silent: true })
        const list = this.data.list.map((item) => (
          item.id === id ? { ...item, isRead: true } : item
        ))
        const unreadCount = Math.max(0, (this.data.unreadCount || 0) - 1)
        this.setData({ list, unreadCount })
      } catch (e) {
        console.error(e)
      }
    }

    if (taskId) {
      wx.navigateTo({
        url: '/pages/task-detail/task-detail?id=' + taskId
      })
      return
    }

    if (liveRoomId) {
      wx.navigateTo({
        url: '/pages/live-watch/live-watch?id=' + liveRoomId
      })
    }
  },

  goChatList() {
    wx.navigateTo({
      url: '/pages/chat-list/chat-list'
    })
  },

  goLiveList() {
    wx.navigateTo({
      url: '/pages/live-list/live-list'
    })
  }
})
