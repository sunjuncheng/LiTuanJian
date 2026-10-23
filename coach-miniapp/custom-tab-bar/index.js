Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/task-list/task-list',
        text: '任务',
        icon: '/assets/icons/task.svg',
        activeIcon: '/assets/icons/task.svg'
      },
      {
        pagePath: '/pages/review/review',
        text: '审核',
        icon: '/assets/icons/review.svg',
        activeIcon: '/assets/icons/review.svg'
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
