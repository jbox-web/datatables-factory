// The library expects jQuery and TomSelect as globals (see .eslintrc.js).
// jQuery runs for real against jsdom so DOM assertions reflect the browser;
// TomSelect is stubbed because it is a peer the host application provides.
const jquery = require('jquery')

global.$ = global.jQuery = jquery

class TomSelectStub {
  constructor(element, options) {
    this.element = element
    this.options = options
    this.handlers = {}
    this.value = ''
    this.destroyed = false
  }

  on(event, handler) {
    this.handlers[event] = handler
  }

  setValue(value) {
    this.value = value
  }

  clear() {
    this.value = ''
  }

  clearOptions() {}
  sync() {}

  destroy() {
    this.destroyed = true
  }
}

global.TomSelect = TomSelectStub
