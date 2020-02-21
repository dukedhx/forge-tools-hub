export default class {
  constructor(eventEmitter) {
    this.messageChannel = new window.MessageChannel()
    this.eventEmitter = eventEmitter
  }

  getHandler(callback) {
    return function*(event) {
      while (true) {
        const obj = Object.assign({}, event)
        console.log(obj)
        yield callback(obj)
      }
    }
  }

  initAsync() {
    return navigator.serviceWorker.ready
  }

  async init() {
    return navigator.serviceWorker.ready
  }

  postMessage(message) {
    //console.log(message);
    navigator.serviceWorker.controller.postMessage(message)
  }

  onChannelMessage(callback) {
    const event = {}
    this.messageChannel.port1.onmessage = e =>
      this.eventCallback({
        eventName: 'onChannelMessage',
        e,
        event,
        handler: this.getHandler(callback)(event)
      })
  }

  onMessageEvent(callback) {
    const event = {}
    navigator.serviceWorker.addEventListener('message', e =>
      this.eventCallback({
        eventName: 'onChannelMessage',
        e,
        event,
        handler: this.getHandler(callback)(event)
      })
    )
  }

  eventCallback({ handler, e, event, eventName }) {
    event.operation = e.data.operation
    event.data = e.data
    const result = handler.next()
    if (this.eventEmitter) this.eventEmitter.emit(eventName, result)
  }
}
