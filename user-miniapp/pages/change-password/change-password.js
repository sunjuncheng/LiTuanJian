const { post } = require('../../utils/request.js')

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    saving: false
  },

  onOldInput(e) { this.setData({ oldPassword: e.detail.value }) },
  onNewInput(e) { this.setData({ newPassword: e.detail.value }) },
  onConfirmInput(e) { this.setData({ confirmPassword: e.detail.value }) },

  async submit() {
    const { oldPassword, newPassword, confirmPassword } = this.data
    if (!oldPassword || !newPassword || !confirmPassword) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    if (newPassword.length < 6) {
      wx.showToast({ title: '新密码至少6位', icon: 'none' })
      return
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    if (this.data.saving) return
    this.setData({ saving: true })
    wx.showLoading({ title: '提交中...' })
    try {
      await post('/user/change-password', { oldPassword, newPassword }, { silent: true })
      wx.hideLoading()
      wx.showToast({ title: '修改成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (e) {
      wx.hideLoading()
      const msg = (e && e.msg) || '修改失败'
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  }
})
