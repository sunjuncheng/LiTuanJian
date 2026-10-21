const { put } = require('../../utils/request.js')
const auth = require('../../utils/auth.js')
const { DEFAULT_AVATAR } = require('../../utils/default-images.js')
const app = getApp()

Page({
  data: {
    userInfo: null,
    nickname: '',
    avatarUrl: '',
    defaultAvatar: DEFAULT_AVATAR,
    saving: false
  },

  onLoad() {
    const userInfo = auth.getUserInfo() || {}
    this.setData({
      userInfo,
      nickname: userInfo.nickname || '',
      avatarUrl: userInfo.avatarUrl || ''
    })
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onChooseAvatar(e) {
    const avatarUrl = e && e.detail ? e.detail.avatarUrl : ''
    if (!avatarUrl) {
      wx.showToast({ title: '未选择头像', icon: 'none' })
      return
    }
    this.uploadAvatar(avatarUrl)
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.uploadAvatar(tempPath)
      }
    })
  },

  uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...' })
    wx.uploadFile({
      url: app.globalData.apiBaseUrl + '/upload/image',
      filePath,
      name: 'file',
      header: { Authorization: 'Bearer ' + auth.getToken() },
      success: (res) => {
        wx.hideLoading()
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0 && data.data && data.data.url) {
            this.setData({ avatarUrl: data.data.url })
            wx.showToast({ title: '上传成功', icon: 'success' })
          } else {
            wx.showToast({ title: data.msg || '上传失败', icon: 'none' })
          }
        } catch (e) {
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
      }
    })
  },

  async saveProfile() {
    if (this.data.saving) return
    this.setData({ saving: true })
    wx.showLoading({ title: '保存中...' })
    try {
      const userInfo = await put('/user/profile', {
        nickname: this.data.nickname,
        avatarUrl: this.data.avatarUrl
      }, { silent: true })
      wx.hideLoading()
      auth.setUserInfo(userInfo)
      app.globalData.userInfo = userInfo
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 800)
    } catch (e) {
      wx.hideLoading()
      const msg = (e && e.msg) || '保存失败'
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  },

  goChangePassword() {
    wx.navigateTo({ url: '/pages/change-password/change-password' })
  },

  goBindPhone() {
    wx.navigateTo({ url: '/pages/bind-phone/bind-phone' })
  }
})
