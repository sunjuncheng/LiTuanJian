const { post } = require('../../utils/request.js')
const location = require('../../utils/location.js')
const app = getApp()

Page({
  data: {
    step: 1,
    form: {
      name: '',
      description: '',
      notice: '',
      coverImage: '',
      deadline: '',
      acceptMode: 1,
      minTeamSize: 2,
      needReview: true
    },
    startPoint: {
      name: '',
      latitude: null,
      longitude: null,
      range: 50
    },
    checkpoints: [],
    rangeOptions: [30, 50, 100],
    submitting: false
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onStartPointInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`startPoint.${field}`]: e.detail.value })
  },

  onAcceptModeChange(e) {
    this.setData({ 'form.acceptMode': Number(e.detail.value) })
  },

  onReviewChange(e) {
    this.setData({ 'form.needReview': e.detail.value })
  },

  onRangeChange(e) {
    this.setData({ 'startPoint.range': Number(e.detail.value) })
  },

  onDeadlineChange(e) {
    this.setData({ 'form.deadline': e.detail.value })
  },

  uploadCoverImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        wx.showLoading({ title: '上传中...' })
        wx.uploadFile({
          url: app.globalData.apiBaseUrl + '/upload/image',
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('coach_token'))
          },
          success: (uploadRes) => {
            wx.hideLoading()
            try {
              const data = JSON.parse(uploadRes.data)
              if (data.code === 0) {
                this.setData({ 'form.coverImage': data.data.url })
                wx.showToast({ title: '上传成功', icon: 'success' })
              } else {
                wx.showToast({ title: data.msg || '上传失败', icon: 'none' })
              }
            } catch (err) {
              wx.showToast({ title: '上传失败', icon: 'none' })
            }
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '上传失败', icon: 'none' })
          }
        })
      }
    })
  },

  async getCurrentLocation() {
    try {
      const loc = await location.getCurrentLocation()
      this.setData({
        'startPoint.latitude': loc.latitude,
        'startPoint.longitude': loc.longitude
      })
      wx.showToast({ title: '定位成功', icon: 'success' })
    } catch (e) {
      console.error(e)
    }
  },

  nextStep() {
    if (this.data.step === 1) {
      if (!this.data.form.name) {
        wx.showToast({ title: '请输入任务名称', icon: 'none' })
        return
      }
      this.setData({ step: 2 })
    } else if (this.data.step === 2) {
      if (!this.data.startPoint.latitude) {
        wx.showToast({ title: '请先获取启动点位', icon: 'none' })
        return
      }
      if (!this.data.startPoint.name) {
        wx.showToast({ title: '请输入启动点名称', icon: 'none' })
        return
      }
      this.setData({ step: 3 })
    }
  },

  prevStep() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 })
    }
  },

  addCheckpoint() {
    const checkpoints = this.data.checkpoints
    checkpoints.push({
      name: '',
      latitude: null,
      longitude: null,
      range: 50,
      referenceImage: '',
      requireGroupPhoto: false,
      allowRemark: true
    })
    this.setData({ checkpoints })
  },

  removeCheckpoint(e) {
    const index = e.currentTarget.dataset.index
    const checkpoints = this.data.checkpoints
    checkpoints.splice(index, 1)
    this.setData({ checkpoints })
  },

  onCheckpointInput(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({ [`checkpoints[${index}].${field}`]: e.detail.value })
  },

  async getCheckpointLocation(e) {
    const index = e.currentTarget.dataset.index
    try {
      const loc = await location.getCurrentLocation()
      this.setData({
        [`checkpoints[${index}].latitude`]: loc.latitude,
        [`checkpoints[${index}].longitude`]: loc.longitude
      })
      wx.showToast({ title: '定位成功', icon: 'success' })
    } catch (e) {
      console.error(e)
    }
  },

  uploadReferenceImage(e) {
    const index = e.currentTarget.dataset.index
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        wx.uploadFile({
          url: app.globalData.apiBaseUrl + '/upload/image',
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('coach_token'))
          },
          success: (uploadRes) => {
            try {
              const data = JSON.parse(uploadRes.data)
              if (data.code === 0) {
                this.setData({
                  [`checkpoints[${index}].referenceImage`]: data.data.url
                })
                wx.showToast({ title: '上传成功', icon: 'success' })
              } else {
                wx.showToast({ title: data.msg || '上传失败', icon: 'none' })
              }
            } catch (err) {
              wx.showToast({ title: '上传失败', icon: 'none' })
            }
          },
          fail: () => {
            wx.showToast({ title: '上传失败', icon: 'none' })
          }
        })
      }
    })
  },

  onCheckboxChange(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({ [`checkpoints[${index}].${field}`]: e.detail.value })
  },

  async submitTask(publish) {
    if (this.data.submitting) return
    if (this.data.checkpoints.length === 0) {
      wx.showToast({ title: '请至少添加一个打卡点', icon: 'none' })
      return
    }
    for (let i = 0; i < this.data.checkpoints.length; i++) {
      const cp = this.data.checkpoints[i]
      if (!cp.name || !cp.latitude || !cp.referenceImage) {
        wx.showToast({ title: `任务${i + 1}信息不完整`, icon: 'none' })
        return
      }
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: publish ? '发布中...' : '保存中...' })
    try {
      await post('/coach/tasks', {
        ...this.data.form,
        startPoint: this.data.startPoint,
        checkpoints: this.data.checkpoints,
        status: publish ? 'published' : 'draft'
      })
      wx.hideLoading()
      wx.showToast({
        title: publish ? '发布成功' : '草稿已保存',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (e) {
      wx.hideLoading()
    } finally {
      this.setData({ submitting: false })
    }
  },

  saveDraft() {
    this.submitTask(false)
  },

  publishTask() {
    this.submitTask(true)
  }
})
