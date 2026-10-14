const { get } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')
const app = getApp()

Page({
  data: {
    currentTab: 'all',
    allTasks: [],
    myTasks: [],
    loading: false,
    isLoggedIn: false
  },

  onLoad() {
    this.setData({ isLoggedIn: auth.isLoggedIn() })
  },

  onShow() {
    const loggedIn = auth.isLoggedIn()
    this.setData({ isLoggedIn: loggedIn })
    if (app.globalData.needRefreshMyTasks) {
      app.globalData.needRefreshMyTasks = false
      this.setData({ currentTab: 'my' })
    }
    this.loadCurrentTab()
  },

  onPullDownRefresh() {
    this.loadCurrentTab().then(() => wx.stopPullDownRefresh())
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.loadCurrentTab()
  },

  async loadCurrentTab() {
    if (this.data.currentTab === 'all') {
      await this.loadAllTasks()
    } else {
      await this.loadMyTasks()
    }
  },

  async loadAllTasks() {
    this.setData({ loading: true })
    try {
      const list = await get('/tasks/public', { page: 1, pageSize: 50 }, { silent: true })
      this.setData({ allTasks: list || [] })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadMyTasks() {
    if (!this.data.isLoggedIn) {
      this.setData({ myTasks: [] })
      return
    }
    this.setData({ loading: true })
    try {
      const list = await get('/tasks/my', {}, { silent: true })
      this.setData({ myTasks: list || [] })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/task-detail/task-detail?id=' + id })
  },

  goMyTaskDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/task-detail/task-detail?id=' + id })
  },

  goLogin() {
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
