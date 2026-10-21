const { get, post } = require('../../utils/request.js')
const { DEFAULT_AVATAR, DEFAULT_IMAGE, DEFAULT_TASK_COVER } = require('../../utils/default-images.js')

function formatCoordinate(latitude, longitude) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!lat && !lng) return '未设置坐标'
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

function formatDateTime(value) {
  if (!value) return '未设置截止时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未设置截止时间'
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

Page({
  data: {
    taskId: '',
    task: null,
    participants: [],
    teams: [],
    activeTab: 'solo',
    defaultAvatar: DEFAULT_AVATAR,
    defaultImage: DEFAULT_IMAGE,
    defaultCover: DEFAULT_TASK_COVER
  },

  onLoad(options) {
    this.setData({ taskId: options.id })
    this.loadDetail()
  },

  async loadDetail() {
    try {
      const [task, participants, teams] = await Promise.all([
        get('/coach/tasks/' + this.data.taskId),
        get('/coach/tasks/' + this.data.taskId + '/participants'),
        get('/coach/tasks/' + this.data.taskId + '/teams')
      ])
      const checkpointList = (task.checkpoints || []).map((item, index) => ({
        ...item,
        sortLabel: `第${index + 1}站`,
        rangeText: `${Number(item.range) || 0}米`,
        coordinateText: formatCoordinate(item.latitude, item.longitude),
        referenceImage: item.referenceImage || DEFAULT_IMAGE,
        hasReferenceImage: !!item.referenceImage,
        photoRuleText: item.requireGroupPhoto ? '需要团队合照' : '普通打卡照片',
        remarkRuleText: item.allowRemark ? '允许填写备注' : '无需填写备注'
      }))

      this.setData({
        task: {
          ...task,
          coverImage: task.coverImage || DEFAULT_TASK_COVER,
          acceptModeText: task.acceptMode === 2 ? '仅团队接单' : '仅个人接单',
          reviewModeText: task.needReview ? '需人工审核' : '自动审核',
          deadlineText: formatDateTime(task.deadline),
          checkpointCount: checkpointList.length,
          completionRate: Number(task.completionRate) || 0,
          startPoint: {
            ...(task.startPoint || {}),
            name: task.startPoint && task.startPoint.name ? task.startPoint.name : '未设置启动点名称',
            rangeText: `${Number(task.startPoint && task.startPoint.range) || 0}米`,
            coordinateText: formatCoordinate(
              task.startPoint && task.startPoint.latitude,
              task.startPoint && task.startPoint.longitude
            )
          },
          checkpoints: checkpointList
        },
        participants: (participants || []).map(item => ({
          ...item,
          avatarUrl: item.avatarUrl || DEFAULT_AVATAR
        })),
        teams: teams || []
      })
    } catch (e) {
      console.error(e)
    }
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  goReview(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/review-detail/review-detail?taskId=' + this.data.taskId + '&participantId=' + id
    })
  },

  manualUnlock(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '手动解锁',
      content: '确定为该用户手动解锁任务吗？',
      success: (res) => {
        if (res.confirm) {
          post('/coach/tasks/' + this.data.taskId + '/unlock', { participantId: id })
            .then(() => {
              wx.showToast({ title: '已解锁', icon: 'success' })
              this.loadDetail()
            })
            .catch(() => {})
        }
      }
    })
  },

  remind(e) {
    const id = e.currentTarget.dataset.id
    post('/coach/tasks/' + this.data.taskId + '/remind', { participantId: id })
      .then(() => {
        wx.showToast({ title: '已发送提醒', icon: 'success' })
      })
      .catch(() => {})
  }
})
