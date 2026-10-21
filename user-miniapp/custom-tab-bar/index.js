Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '任务大厅', icon: '🏃' },
      { pagePath: '/pages/team/team', text: '我的队伍', icon: '👥' },
      { pagePath: '/pages/messages/messages', text: '消息', icon: '🔔' },
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
