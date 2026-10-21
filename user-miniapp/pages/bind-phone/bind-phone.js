const { post } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')
const app = getApp()

Page({
  data: {
    phone: '',
    password: '',
    confirmPassword: '',
    saving: false
  },

  onLoad() {
    const userInfo = auth.getUserInfo() || {}
    this.setData({
      phone: userInfo.phone || ''
    })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  onConfirmInput(e) {
    this.setData({ confirmPassword: e.detail.value })
  },

  async submit() {
    const { phone, password, confirmPassword, saving } = this.data
    if (saving) return
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    wx.showLoading({ title: '绑定中...' })
    try {
      const userInfo = await post('/user/bind-phone', { phone, password }, { silent: true })
      wx.hideLoading()
      auth.setUserInfo(userInfo)
      app.globalData.userInfo = userInfo
      wx.showToast({ title: '绑定成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 800)
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: (e && e.msg) || '绑定失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  }
})
