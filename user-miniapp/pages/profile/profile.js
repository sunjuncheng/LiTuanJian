const auth = require('../../utils/auth.js')
const { get } = require('../../utils/request.js')
const {
  DEFAULT_AVATAR,
  ILLUSTRATION_LOGIN
} = require('../../utils/default-images.js')
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
    defaultAvatar: DEFAULT_AVATAR,
    loginIllustration: ILLUSTRATION_LOGIN,
    unreadMessageCount: 0,
    icons: {
      phone: '/assets/icons/phone.svg',
      task: '/assets/icons/task.svg',
      records: '/assets/icons/records.svg',
      message: '/assets/icons/message.svg',
      settings: '/assets/icons/settings.svg'
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    this.loadUserInfo()
  },

  async loadUserInfo() {
    let userInfo = auth.getUserInfo()
    const isLoggedIn = auth.isLoggedIn()

    if (isLoggedIn) {
      try {
        userInfo = await get('/user/profile', {}, { silent: true })
        auth.setUserInfo(userInfo)
        app.globalData.userInfo = userInfo
      } catch (e) {
        console.error(e)
      }
    }

    this.setData({
      userInfo,
      isLoggedIn,
      unreadMessageCount: 0
    })
    if (isLoggedIn) {
      this.loadUnreadMessageCount()
    }
  },

  async loadUnreadMessageCount() {
    try {
      const data = await get('/user/messages', {}, { silent: true })
      this.setData({ unreadMessageCount: data.unreadCount || 0 })
    } catch (e) {
      console.error(e)
    }
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

  needCompleteProfile(userInfo) {
    if (!userInfo) return true
    const nickname = String(userInfo.nickname || '').trim()
    return !userInfo.hasPhone || !userInfo.avatarUrl || !nickname || nickname === '微信用户'
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

  async doWxLogin() {
    this.setData({ loading: true })
    try {
      const data = await app.login()
      this.setData({
        userInfo: data.userInfo,
        isLoggedIn: true,
        showLoginForm: false,
        phone: '',
        password: '',
        nickname: ''
      })
      this.loadUnreadMessageCount()
      wx.showToast({ title: '登录成功', icon: 'success' })
      if (this.needCompleteProfile(data.userInfo)) {
        setTimeout(() => {
          wx.showModal({
            title: '完成账号设置',
            content: '为了方便识别队伍成员并保障账号使用，请继续完善头像、昵称和手机号。',
            showCancel: false,
            success: () => {
              this.goEditProfile()
            }
          })
        }, 500)
      }
    } catch (e) {
      const msg = typeof e === 'string' ? e : (e && e.msg) || '微信登录失败'
      wx.showToast({ title: msg, icon: 'none' })
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

  goBindPhone() {
    wx.navigateTo({ url: '/pages/bind-phone/bind-phone' })
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/records/records' })
  },

  goMessages() {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.switchTab({ url: '/pages/messages/messages' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
