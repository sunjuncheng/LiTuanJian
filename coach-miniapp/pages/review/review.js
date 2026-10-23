const { get } = require('../../utils/request.js')
const { DEFAULT_AVATAR } = require('../../utils/default-images.js')
const app = getApp()

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
    activeTab: 'pending',
    messageList: [],
    pendingCount: 0,
    reviewedCount: 0,
    loading: false,
    defaultAvatar: DEFAULT_AVATAR,
    icons: {
      review: '/assets/icons/review.svg',
      success: '/assets/icons/success.svg'
    }
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 1 })
    }
    if (!app.globalData.token && !wx.getStorageSync('coach_token')) {
      return
    }
    this.loadMessages()
  },

  onPullDownRefresh() {
    this.loadMessages().then(() => wx.stopPullDownRefresh())
  },

  switchTab(e) {
    const activeTab = e.currentTarget.dataset.tab
    if (activeTab === this.data.activeTab) return
    this.setData({ activeTab })
    this.loadMessages()
  },

  async loadMessages() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const data = await get('/coach/review/messages', { status: this.data.activeTab })
      const messageList = (data.list || []).map((item) => ({
        ...item,
        timeLabel: this.data.activeTab === 'reviewed' ? '审核时间' : '提交时间',
        timeText: formatDateTime(this.data.activeTab === 'reviewed' ? item.reviewTime : item.submitTime)
      }))
      this.setData({
        messageList,
        pendingCount: data.pendingCount || 0,
        reviewedCount: data.reviewedCount || 0
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  goDetail(e) {
    const { taskId, participantId, checkpointId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/review-detail/review-detail?taskId=${taskId}&participantId=${participantId}&checkpointId=${checkpointId}`
    })
  }
})
