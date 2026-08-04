import ContextMenu from '../../src/context_menu.coffee'

// jsdom does no layout, so every measured box is 0×0. The menu placement logic
// is arithmetic over those measurements, so the sizes are injected explicitly —
// that is the only way to exercise the flip-left and flip-up branches at all.
function stubGeometry({ menuWidth = 100, menuHeight = 100, window: win = {} } = {}) {
  $.fn.width = function width() {
    return menuWidth
  }
  $.fn.height = function height() {
    return menuHeight
  }
  ContextMenu.window_size = () => ({
    width: win.width || 1000,
    height: win.height || 800,
  })
}

function stubAjax() {
  const calls = []
  $.ajax = (options) => {
    calls.push(options)
    return options
  }
  return calls
}

function clickAt({ pageX = 10, pageY = 10, clientY = pageY } = {}) {
  return { pageX, pageY, clientY, target: $('#row-0 td')[0] }
}

const MENU_HTML = '<ul><li>Edit</li><li>Delete</li></ul>'

describe('ContextMenu', () => {
  let ajaxCalls
  const realWidth = $.fn.width
  const realHeight = $.fn.height
  const realWindowSize = ContextMenu.window_size

  beforeEach(() => {
    document.body.innerHTML = `
      <form action="/users"><input type="hidden" name="scope" value="active"></form>
      <table><tbody><tr id="row-0"><td>row</td></tr></tbody></table>
      <div id="context-menu"></div>
      <div id="context-menu-empty"><ul><li>No action</li></ul></div>
    `
    ajaxCalls = stubAjax()
    stubGeometry()
  })

  afterEach(() => {
    $.fn.width = realWidth
    $.fn.height = realHeight
    ContextMenu.window_size = realWindowSize
    delete $.ajax
    document.body.innerHTML = ''
  })

  describe('the request', () => {
    it('calls the url it was given', () => {
      ContextMenu.show(clickAt(), '/users/menu')

      expect(ajaxCalls[0].url).toBe('/users/menu')
    })

    // The surrounding form carries the current scope, so the menu the server
    // builds matches what the user is actually looking at.
    it('sends the surrounding form along', () => {
      document.body.innerHTML = `
        <form><input type="hidden" name="scope" value="active">
          <table><tbody><tr id="row-0"><td>row</td></tr></tbody></table>
        </form>
        <div id="context-menu"></div>
        <div id="context-menu-empty"></div>
      `

      ContextMenu.show(clickAt(), '/users/menu')

      expect(ajaxCalls[0].data).toBe('scope=active')
    })

    it('sends nothing when the row sits outside any form', () => {
      ContextMenu.show(clickAt(), '/users/menu')

      expect(ajaxCalls[0].data).toBe('')
    })

    it('empties the menu before the response lands', () => {
      $('#context-menu').html('<ul><li>stale</li></ul>')

      ContextMenu.show(clickAt(), '/users/menu')

      expect($('#context-menu').html()).toBe('')
    })
  })

  describe('rendering the response', () => {
    it('shows the items the server returned', () => {
      ContextMenu.show(clickAt(), '/users/menu')

      ajaxCalls[0].success(MENU_HTML, 'success', {})

      expect($('#context-menu li').length).toBe(2)
      expect($('#context-menu').css('display')).not.toBe('none')
    })

    it('accepts bare <li> nodes as a menu', () => {
      ContextMenu.show(clickAt(), '/users/menu')

      ajaxCalls[0].success('<li>Edit</li>', 'success', {})

      expect($('#context-menu li').length).toBe(1)
    })

    // An empty response would leave the menu blank and the right click looking
    // dead, so the placeholder menu is rendered instead.
    it('falls back to the placeholder menu on an empty response', () => {
      ContextMenu.show(clickAt(), '/users/menu')

      ajaxCalls[0].success('', 'success', {})

      expect($('#context-menu').text()).toBe('No action')
    })

    it('falls back when the response carries no list at all', () => {
      ContextMenu.show(clickAt(), '/users/menu')

      ajaxCalls[0].success('<div>nothing here</div>', 'success', {})

      expect($('#context-menu').text()).toBe('No action')
    })

    // $.parseHTML with keepScripts off is what drops the script tag; inline
    // handler attributes are NOT neutralised, which is why the markup is
    // escaped server-side. This pins the half the client is responsible for.
    it('drops script tags out of the response', () => {
      ContextMenu.show(clickAt(), '/users/menu')

      ajaxCalls[0].success('<ul><li>Edit</li></ul><script>window.pwned = true</script>', 'success', {})

      expect($('#context-menu script').length).toBe(0)
      expect(window.pwned).toBeUndefined()
    })
  })

  describe('when the request fails', () => {
    it('renders the placeholder menu rather than nothing', () => {
      const logged = jest.spyOn(console, 'error').mockImplementation(() => {})
      ContextMenu.show(clickAt(), '/users/menu')

      ajaxCalls[0].error({ status: 500 }, 'error', 'Internal Server Error')

      expect($('#context-menu').text()).toBe('No action')
      expect(logged).toHaveBeenCalled()
      logged.mockRestore()
    })

    // An aborted request is the normal outcome of a second right click landing
    // before the first response: it is not a failure to report.
    it('stays silent when the request was merely aborted', () => {
      const logged = jest.spyOn(console, 'error').mockImplementation(() => {})
      ContextMenu.show(clickAt(), '/users/menu')

      ajaxCalls[0].error({ status: 0 }, 'abort', '')

      expect(logged).not.toHaveBeenCalled()
      expect($('#context-menu').text()).toBe('')
      logged.mockRestore()
    })
  })

  describe('placement', () => {
    function open(click, geometry) {
      stubGeometry(geometry)
      ContextMenu.show(click, '/users/menu')
      ajaxCalls[ajaxCalls.length - 1].success(MENU_HTML, 'success', {})
    }

    it('opens at the pointer when there is room', () => {
      open(clickAt({ pageX: 10, pageY: 20 }))

      expect($('#context-menu').css('left')).toBe('10px')
      expect($('#context-menu').css('top')).toBe('20px')
      expect($('#context-menu').hasClass('reverse-x')).toBe(false)
      expect($('#context-menu').hasClass('reverse-y')).toBe(false)
    })

    // Near the right edge the menu would run off screen, so it flips to the
    // left of the pointer instead.
    it('flips to the left near the right edge', () => {
      open(clickAt({ pageX: 900, pageY: 20 }), { menuWidth: 100, window: { width: 1000 } })

      expect($('#context-menu').hasClass('reverse-x')).toBe(true)
      expect($('#context-menu').css('left')).toBe('800px')
    })

    it('flips upwards near the bottom edge', () => {
      open(clickAt({ pageX: 10, pageY: 750, clientY: 750 }), {
        menuHeight: 100,
        window: { height: 800 },
      })

      expect($('#context-menu').hasClass('reverse-y')).toBe(true)
      expect($('#context-menu').css('top')).toBe('650px')
    })

    it('never places the menu off the top-left corner', () => {
      open(clickAt({ pageX: 10, pageY: 10, clientY: 10 }), {
        menuWidth: 100,
        menuHeight: 100,
        window: { width: 50, height: 50 },
      })

      expect($('#context-menu').css('left')).toBe('1px')
      expect($('#context-menu').css('top')).toBe('1px')
    })

    describe('submenu direction', () => {
      beforeEach(() => {
        $('#context-menu').html('')
      })

      it('opens submenus downwards when the menu itself flipped up against the top', () => {
        stubGeometry({ menuHeight: 400, window: { height: 500 } })
        ContextMenu.show(clickAt({ pageY: 300, clientY: 300 }), '/users/menu')

        ajaxCalls[0].success('<ul><li class="folder">More</li></ul>', 'success', {})

        expect($('#context-menu .folder').hasClass('down')).toBe(true)
      })

      // The 'up' class next to this branch is unreachable as the code stands:
      // it is guarded by window_height - clientY < menu_height inside the else
      // of max_height > window_height, and that else already guarantees
      // window_height - clientY >= menu_height. Pinned as "never up" rather
      // than skipped, so the day the guard is fixed this spec fails and says so.
      it('never opens submenus upwards while there is room below', () => {
        stubGeometry({ menuHeight: 100, window: { height: 800 } })
        ContextMenu.show(clickAt({ pageY: 10, clientY: 690 }), '/users/menu')

        ajaxCalls[0].success('<ul><li class="folder">More</li></ul>', 'success', {})

        expect($('#context-menu').hasClass('reverse-y')).toBe(false)
        expect($('#context-menu .folder').hasClass('up')).toBe(false)
      })
    })
  })

  describe('window_size', () => {
    it('reports the browser viewport', () => {
      ContextMenu.window_size = realWindowSize

      expect(ContextMenu.window_size()).toEqual({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    })
  })
})
