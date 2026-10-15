const { get } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')
const { DEFAULT_TASK_COVER } = require('../../utils/default-images.js')
const app = getApp()

Page({
  data: {
    currentTab: 'all',
    myTaskFilter: 'all',
    allTasks: [],
    myTasks: [],
    loading: false,
    isLoggedIn: false,
    defaultCover: DEFAULT_TASK_COVER
  },

  onLoad() {
    this.setData({ isLoggedIn: auth.isLoggedIn() })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
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
      this.setData({ myTasks: [], filteredMyTasks: [] })
      return
    }
    this.setData({ loading: true })
    try {
      const list = await get('/tasks/my', {}, { silent: true })
      const myTasks = list || []
      const filteredMyTasks = this.filterMyTasks(myTasks)
      this.setData({ myTasks, filteredMyTasks })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  filterMyTasks(list) {
    if (this.data.myTaskFilter === 'all') return list
    return list.filter(item => item.participantType === this.data.myTaskFilter)
  },

  switchMyTaskFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ myTaskFilter: filter })
    this.setData({ filteredMyTasks: this.filterMyTasks(this.data.myTasks) })
  },

  cancelTask(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '放弃任务',
      content: '确定放弃该任务吗？放弃后需重新接单',
      success: (res) => {
        if (res.confirm) {
          const { post } = require('../../utils/request.js')
          wx.showLoading({ title: '处理中...' })
          post('/tasks/' + id + '/cancel', {}, { silent: true })
            .then(() => {
              wx.hideLoading()
              wx.showToast({ title: '已放弃', icon: 'success' })
              this.loadMyTasks()
            })
            .catch((err) => {
              wx.hideLoading()
              const msg = (err && err.msg) || '操作失败'
              wx.showToast({ title: msg, icon: 'none' })
            })
        }
      }
    })
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
