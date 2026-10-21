const { get, post } = require('../../utils/request.js')
const { DEFAULT_TASK_COVER } = require('../../utils/default-images.js')
const app = getApp()

Page({
  data: {
    taskList: [],
    loading: false,
    defaultCover: DEFAULT_TASK_COVER
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 0 })
    }
    if (!app.globalData.token && !wx.getStorageSync('coach_token')) {
      return
    }
    this.loadTaskList()
  },

  onPullDownRefresh() {
    this.loadTaskList().then(() => wx.stopPullDownRefresh())
  },

  async loadTaskList() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const list = await get('/coach/tasks')
      const taskList = (list || []).map(item => ({
        ...item,
        coverImage: item.coverImage || DEFAULT_TASK_COVER
      }))
      this.setData({ taskList })
    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/task-create/task-create' })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/task-detail/task-detail?id=' + id })
  },

  deleteTask(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          post('/coach/tasks/' + id + '/delete').then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadTaskList()
          }).catch(() => {})
        }
      }
    })
  }
})
