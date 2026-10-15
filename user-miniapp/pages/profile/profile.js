const auth = require('../../utils/auth.js')
const { DEFAULT_AVATAR } = require('../../utils/default-images.js')
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    showLoginForm: false,
    mode: 'login',
    phone: '',
    password: '',
    nickname: '',
    loading: false,
    defaultAvatar: DEFAULT_AVATAR
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = auth.getUserInfo()
    this.setData({
      userInfo,
      isLoggedIn: auth.isLoggedIn()
    })
  },

  toggleLoginForm() {
    this.setData({ showLoginForm: !this.data.showLoginForm, mode: 'login' })
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode || (this.data.mode === 'login' ? 'register' : 'login')
    this.setData({ mode })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  async doLogin() {
    const { phone, password } = this.data
    if (!phone || !password) {
      wx.showToast({ title: '请输入手机号和密码', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      const data = await app.userLogin(phone, password)
      this.setData({
        userInfo: data.userInfo,
        isLoggedIn: true,
        showLoginForm: false,
        phone: '',
        password: '',
        nickname: ''
      })
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: e || '登录失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async doRegister() {
    const { phone, password, nickname } = this.data
    if (!phone || !password) {
      wx.showToast({ title: '请输入手机号和密码', icon: 'none' })
      return
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    try {
      const data = await app.userRegister(phone, password, nickname)
      this.setData({
        userInfo: data.userInfo,
        isLoggedIn: true,
        showLoginForm: false,
        phone: '',
        password: '',
        nickname: ''
      })
      wx.showToast({ title: '注册成功', icon: 'success' })
    } catch (e) {
      const msg = typeof e === 'string' ? e : (e && e.msg) || '注册失败'
      wx.showToast({ title: msg, icon: 'none' })
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
          auth.logout()
          this.setData({ userInfo: null, isLoggedIn: false })
        }
      }
    })
  },

  goMyTasks() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goEditProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/records/records' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
