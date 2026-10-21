Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/task-list/task-list', text: '任务', icon: '🏃' },
      { pagePath: '/pages/review/review', text: '审核', icon: '🔔' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '👤' }
    ]
  },
  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const url = this.data.list[index].pagePath
      wx.switchTab({ url })
    }
  }
})
