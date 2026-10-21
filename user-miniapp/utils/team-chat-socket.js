const config = require('./config.js')

let socketTask = null
let handlers = {}

function buildSocketUrl(token) {
  const base = config.apiBaseUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
  return `${base.replace(/\/api$/, '')}/ws/team-chat?token=${encodeURIComponent(token)}`
}

function connect(token, nextHandlers = {}) {
  close()
  handlers = nextHandlers
  socketTask = wx.connectSocket({
    url: buildSocketUrl(token)
  })

  socketTask.onOpen(() => {
    handlers.onOpen && handlers.onOpen()
  })

  socketTask.onMessage((res) => {
    try {
      const data = JSON.parse(res.data)
      handlers.onMessage && handlers.onMessage(data)
    } catch (e) {
      handlers.onError && handlers.onError(e)
    }
  })

  socketTask.onError((err) => {
    handlers.onError && handlers.onError(err)
  })

  socketTask.onClose(() => {
    socketTask = null
    handlers.onClose && handlers.onClose()
  })

  return socketTask
}

function send(data) {
  if (!socketTask) return false
  socketTask.send({
    data: JSON.stringify(data)
  })
  return true
}

function close() {
  if (socketTask) {
    socketTask.close()
    socketTask = null
  }
}

module.exports = {
  connect,
  send,
  close
}
