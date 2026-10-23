const app = getApp()
const { DEFAULT_AVATAR } = require('../../utils/default-images.js')

Page({
  data: {
    coachInfo: null,
    isLoggedIn: false,
    showLoginForm: true,
    phone: '',
    password: '',
    loading: false,
    defaultAvatar: DEFAULT_AVATAR,
    icons: {
      task: '/assets/icons/task.svg',
      review: '/assets/icons/review.svg',
      settings: '/assets/icons/settings.svg'
    }
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) {
      tabBar.setData({ selected: 2 })
    }
    const coachInfo = app.globalData.coachInfo || wx.getStorageSync('coach_info')
    this.setData({
      coachInfo,
      isLoggedIn: !!coachInfo
    })
  },

  async login() {
    this.setData({ showLoginForm: true })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  async doLogin() {
    const { phone, password } = this.data
    if (!phone || !password) {
      wx.showToast({ title: '请输入手机号和密码', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      const data = await app.coachLogin(phone, password)
      this.setData({
        coachInfo: data.coachInfo,
        isLoggedIn: true,
        showLoginForm: false
      })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: e || '登录失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.token = ''
          app.globalData.coachInfo = null
          wx.removeStorageSync('coach_token')
          wx.removeStorageSync('coach_info')
          this.setData({ coachInfo: null, isLoggedIn: false })
        }
      }
    })
  },

  goTaskList() {
    wx.switchTab({ url: '/pages/task-list/task-list' })
  },

  goReviewList() {
    wx.switchTab({ url: '/pages/review/review' })
  },

  showSettingsTip() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  }
})
