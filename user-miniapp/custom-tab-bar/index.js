Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '任务大厅',
        icon: '/assets/icons/task.svg',
        activeIcon: '/assets/icons/task.svg'
      },
      {
        pagePath: '/pages/team/team',
        text: '我的队伍',
        icon: '/assets/icons/team.svg',
        activeIcon: '/assets/icons/team.svg'
      },
      {
        pagePath: '/pages/messages/messages',
        text: '消息',
        icon: '/assets/icons/message.svg',
        activeIcon: '/assets/icons/message.svg'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        icon: '/assets/icons/profile.svg',
        activeIcon: '/assets/icons/profile.svg'
      }
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
