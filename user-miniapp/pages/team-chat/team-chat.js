const { get, post } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')
const socket = require('../../utils/team-chat-socket.js')
const { DEFAULT_AVATAR } = require('../../utils/default-images.js')
const app = getApp()

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

Page({
  data: {
    chat: null,
    messageList: [],
    inputValue: '',
    loading: false,
    connected: false,
    onlineCount: 0,
    scrollIntoView: 'chat-bottom',
    defaultAvatar: DEFAULT_AVATAR
  },

  onLoad() {
    if (!auth.isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 600)
      return
    }
    this.initChat()
  },

  onPullDownRefresh() {
    this.loadMessages().finally(() => wx.stopPullDownRefresh())
  },

  onUnload() {
    socket.close()
  },

  async initChat() {
    this.setData({ loading: true })
    try {
      const chat = await get('/team/chat', {}, { silent: true })
      wx.setNavigationBarTitle({ title: chat.teamName + '群聊' })
      this.setData({ chat })
      await this.loadMessages()
      await this.loadOnlineStatus()
      this.connectSocket()
    } catch (e) {
      const msg = (e && e.msg) || '暂时无法进入群聊'
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadMessages() {
    try {
      const data = await get('/team/chat/messages', {}, { silent: true })
      const messageList = (data.list || []).map(item => this.normalizeMessage(item))
      this.setData({
        chat: {
          conversationId: data.conversationId,
          teamId: data.teamId,
          teamName: data.teamName,
          memberCount: data.memberCount
        },
        messageList
      })
      this.scrollToBottom()
    } catch (e) {
      console.error(e)
    }
  },

  async loadOnlineStatus() {
    try {
      const data = await get('/team/chat/online', {}, { silent: true })
      this.setData({ onlineCount: data.onlineCount || 0 })
    } catch (e) {
      console.error(e)
    }
  },

  connectSocket() {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (!token) return

    socket.connect(token, {
      onOpen: () => {
        this.setData({ connected: true })
        socket.send({ type: 'join' })
        this.loadOnlineStatus()
      },
      onMessage: (packet) => {
        if (packet.type === 'new_message' && packet.data) {
          this.appendMessage(packet.data)
        }
        if (packet.type === 'joined') {
          this.loadOnlineStatus()
        }
        if (packet.type === 'error') {
          wx.showToast({ title: packet.msg || '连接异常', icon: 'none' })
        }
      },
      onClose: () => {
        this.setData({ connected: false, onlineCount: 0 })
      },
      onError: () => {
        this.setData({ connected: false })
      }
    })
  },

  normalizeMessage(item) {
    const currentUserId = app.globalData.userInfo?.id || wx.getStorageSync('userInfo')?.id
    return {
      ...item,
      senderAvatar: item.senderAvatar || DEFAULT_AVATAR,
      timeText: formatTime(item.createdAt),
      isSelf: Number(item.senderId) === Number(currentUserId)
    }
  },

  appendMessage(item) {
    const exists = this.data.messageList.some(message => message.id === item.id)
    if (exists) return
    const messageList = this.data.messageList.concat(this.normalizeMessage(item))
    this.setData({ messageList })
    this.scrollToBottom()
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  async sendMessage() {
    const content = (this.data.inputValue || '').trim()
    if (!content) return

    this.setData({ inputValue: '' })

    if (this.data.connected && socket.send({ type: 'send', content })) {
      return
    }

    try {
      const message = await post('/team/chat/messages', { content }, { silent: true })
      this.appendMessage(message)
    } catch (e) {
      wx.showToast({ title: (e && e.msg) || '发送失败', icon: 'none' })
      this.setData({ inputValue: content })
    }
  },

  scrollToBottom() {
    this.setData({ scrollIntoView: '' })
    setTimeout(() => {
      this.setData({ scrollIntoView: 'chat-bottom' })
    }, 30)
  }
})
