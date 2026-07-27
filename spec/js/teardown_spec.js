import ContextMenu from '../../src/context_menu.coffee'
import WithCheckBoxes from '../../src/modules/with_check_boxes.coffee'
import WithContextMenu from '../../src/modules/with_context_menu.coffee'

describe('ContextMenu.show', () => {
  let sent

  beforeEach(() => {
    sent = null
    document.body.innerHTML =
      '<div id="context-menu" style="display:none"></div>' +
      '<div id="context-menu-empty"><ul><li>Nothing here</li></ul></div>' +
      '<div id="row"></div>'
    $.ajax = jest.fn((options) => {
      sent = options
    })
  })

  const event = { pageX: 10, pageY: 20, clientY: 20, target: document.body }

  it('registers an error handler', () => {
    ContextMenu.show(event, '/menu')
    expect(typeof sent.error).toBe('function')
  })

  it('falls back to the empty menu when the request fails', () => {
    ContextMenu.show(event, '/menu')
    sent.error({ status: 500 }, 'error', 'boom')

    expect($('#context-menu').text()).toMatch(/Nothing here/)
  })

  it('shows the menu even when the request fails', () => {
    ContextMenu.show(event, '/menu')
    expect($('#context-menu').css('display')).toBe('none')

    sent.error({ status: 500 }, 'error', 'boom')
    expect($('#context-menu').css('display')).not.toBe('none')
  })

  it('renders the returned menu on success', () => {
    ContextMenu.show(event, '/menu')
    sent.success('<li>Edit</li>', 'success', {})

    expect($('#context-menu').text()).toMatch(/Edit/)
  })

  it('does not execute scripts carried by the response', () => {
    ContextMenu.show(event, '/menu')
    sent.success('<li>Edit</li><script>window.PWNED = true</script>', 'success', {})

    expect(window.PWNED).toBeUndefined()
  })
})

describe('event teardown', () => {
  describe('checkbox module', () => {
    it('only removes its own datatable handlers', () => {
      const off = jest.fn()
      const context = {
        _check_boxes_enabled: () => true,
        datatable: { off: off },
        _check_boxes_thead: null,
      }

      WithCheckBoxes.instance_methods._with_check_boxes_destroy.call(context)

      const namespaced = off.mock.calls.every((call) => call[0].includes('.dtfCheckBoxes'))
      expect(namespaced).toBe(true)
    })

    it('is a no-op when the module is disabled', () => {
      const off = jest.fn()
      const context = { _check_boxes_enabled: () => false, datatable: { off: off } }

      WithCheckBoxes.instance_methods._with_check_boxes_destroy.call(context)
      expect(off).not.toHaveBeenCalled()
    })
  })

  describe('context menu module', () => {
    it('leaves a handler registered by the host application in place', () => {
      document.body.innerHTML = '<table><tbody></tbody></table>'
      const tbody = $('tbody')
      const hostHandler = jest.fn()
      tbody.on('contextmenu', hostHandler)

      const context = {
        _context_menu_enabled: () => true,
        _context_menu_tbody: tbody,
      }
      WithContextMenu.instance_methods._with_context_menu_destroy.call(context)

      tbody.trigger('contextmenu')
      expect(hostHandler).toHaveBeenCalled()
    })
  })
})
