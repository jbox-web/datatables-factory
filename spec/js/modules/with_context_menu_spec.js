import ContextMenu from '../../../src/context_menu.coffee'
import WithContextMenu from '../../../src/modules/with_context_menu.coffee'
import { checkBoxColumn, loadTable, stubDataTables } from '../support/table_helpers'

function renderTable({ rows = 2, menuUrl = '/users/menu' } = {}) {
  const body = Array.from(
    { length: rows },
    (_, i) => `<tr id="row-${i}"><td>row ${i}</td></tr>`
  ).join('')

  document.body.innerHTML = `
    <div id="dt-container">
      <table id="users-datatable">
        <tbody data-url="${menuUrl}">${body}</tbody>
      </table>
    </div>
    <div id="context-menu"></div>
    <div id="context-menu-empty"><ul><li>No action</li></ul></div>
  `
}

function build({ context_menu = true, dom } = {}) {
  renderTable(dom)
  const table = loadTable({
    dt_options: { columns: [checkBoxColumn()] },
    dtf_options: { context_menu },
  })
  table.datatable.container = document.getElementById('dt-container')
  table.with_context_menu_set_callbacks('after_init')
  return table
}

// The right-click handler is registered on the tbody; firing a real event is
// what proves the wiring, not just the handler body.
function rightClick(selector) {
  const event = $.Event('contextmenu', { target: $(selector)[0] })
  $(selector).trigger(event)
  return event
}

describe('WithContextMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = '<table id="users-datatable"></table>'
    stubDataTables()
    ContextMenu.show = jest.fn()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('enabling', () => {
    it('stays off when the option is absent', () => {
      renderTable()
      const table = loadTable({ dt_options: { columns: [] } })

      expect(table.with_context_menu_set_callbacks('before_init')).toBe(false)
    })

    it('stays off when the option is false', () => {
      renderTable()
      const table = loadTable({ dt_options: { columns: [] }, dtf_options: { context_menu: false } })

      expect(table.with_context_menu_set_callbacks('before_init')).toBe(false)
    })

    // The option travels through a data-* attribute, so it arrives as the
    // string "true" as often as as a real boolean.
    it('accepts the string "true" as well as the boolean', () => {
      renderTable()
      const table = loadTable({
        dt_options: { columns: [] },
        dtf_options: { context_menu: 'true' },
      })

      expect(table.with_context_menu_set_callbacks('before_init')).not.toBe(false)
    })

    it('marks every created row as having a menu', () => {
      const table = build()

      table.callbacks['createdRow'].forEach((callback) => callback($('#row-0')[0]))

      expect($('#row-0').hasClass('has-context-menu')).toBe(true)
    })
  })

  describe('right click', () => {
    function markRows() {
      $('#dt-container tbody tr').addClass('has-context-menu')
    }

    it('opens the menu on a row that has one', () => {
      build()
      markRows()

      rightClick('#row-0 td')

      expect(ContextMenu.show).toHaveBeenCalled()
    })

    it('suppresses the browser menu', () => {
      build()
      markRows()

      const event = rightClick('#row-0 td')

      expect(event.isDefaultPrevented()).toBe(true)
    })

    // The url is read once at init from the tbody, never at click time: a page
    // script that rewrites the attribute afterwards must not redirect the call.
    it('calls the url captured at init, not the current attribute value', () => {
      build()
      markRows()
      $('#dt-container tbody').attr('data-url', '/evil')

      rightClick('#row-0 td')

      expect(ContextMenu.show.mock.calls[0][1]).toBe('/users/menu')
    })

    it('leaves a row without a menu alone', () => {
      build()

      const event = rightClick('#row-0 td')

      expect(ContextMenu.show).not.toHaveBeenCalled()
      expect(event.isDefaultPrevented()).toBe(false)
    })

    // Right-clicking a link must keep the browser menu, so "open in new tab"
    // still works on the row actions.
    it('leaves a link alone', () => {
      build()
      markRows()
      $('#row-0 td').html('<a href="/users/1">edit</a>')

      rightClick('#row-0 a')

      expect(ContextMenu.show).not.toHaveBeenCalled()
    })
  })

  describe('row selection on right click', () => {
    it('selects the row it was fired on, dropping the previous selection', () => {
      const table = build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      rightClick('#row-0 td')

      expect(table.datatable.deselected).toEqual([{ page: 'current' }])
      expect(table.datatable.selected).toEqual(['#row-0'])
    })

    // Right-clicking inside an existing selection must not shrink it to one row:
    // that is how a bulk action on several rows is triggered.
    it('keeps an existing multi-row selection intact', () => {
      const table = build()
      $('#dt-container tbody tr').addClass('has-context-menu').addClass('selected')

      rightClick('#row-0 td')

      expect(table.datatable.deselected).toEqual([])
      expect(table.datatable.selected).toEqual([])
    })
  })

  describe('long press on touch devices', () => {
    function touch(type, { pageX = 10, pageY = 10, target } = {}) {
      const event = $.Event(type, { target })
      // jQuery.Event#preventDefault delegates to originalEvent, so a stand-in
      // that carries only touches throws the moment the handler suppresses the
      // synthetic click.
      event.originalEvent = {
        touches: [{ pageX, pageY, clientY: pageY }],
        preventDefault() {},
      }
      $(target).trigger(event)
      return event
    }

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('opens the menu after half a second', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      touch('touchstart', { target: $('#row-0 td')[0] })
      jest.advanceTimersByTime(499)
      expect(ContextMenu.show).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1)
      expect(ContextMenu.show).toHaveBeenCalled()
    })

    // A long press that turns into a scroll is not a long press.
    it('gives up once the finger has moved', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      touch('touchstart', { target: $('#row-0 td')[0] })
      touch('touchmove', { pageX: 40, pageY: 10, target: $('#row-0 td')[0] })
      jest.advanceTimersByTime(500)

      expect(ContextMenu.show).not.toHaveBeenCalled()
    })

    it('tolerates a finger that barely moved', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      touch('touchstart', { target: $('#row-0 td')[0] })
      touch('touchmove', { pageX: 15, pageY: 15, target: $('#row-0 td')[0] })
      jest.advanceTimersByTime(500)

      expect(ContextMenu.show).toHaveBeenCalled()
    })

    it('gives up when the finger is lifted early', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      touch('touchstart', { target: $('#row-0 td')[0] })
      touch('touchend', { target: $('#row-0 td')[0] })
      jest.advanceTimersByTime(500)

      expect(ContextMenu.show).not.toHaveBeenCalled()
    })

    // Once the menu is open, the synthetic click that follows touchend would
    // close it immediately.
    it('suppresses the click that follows a press that did fire', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      touch('touchstart', { target: $('#row-0 td')[0] })
      jest.advanceTimersByTime(500)
      const end = touch('touchend', { target: $('#row-0 td')[0] })

      expect(end.isDefaultPrevented()).toBe(true)
    })

    it('lets the click through when no menu was opened', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      touch('touchstart', { target: $('#row-0 td')[0] })
      const end = touch('touchend', { target: $('#row-0 td')[0] })

      expect(end.isDefaultPrevented()).toBe(false)
    })

    // Android fires contextmenu on long press by itself; letting the timer run
    // too would render the menu twice.
    it('cancels the timer when the platform fires contextmenu itself', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      touch('touchstart', { target: $('#row-0 td')[0] })
      rightClick('#row-0 td')
      ContextMenu.show.mockClear()
      jest.advanceTimersByTime(500)

      expect(ContextMenu.show).not.toHaveBeenCalled()
    })

    it('ignores a touch on a row without a menu', () => {
      build()

      touch('touchstart', { target: $('#row-0 td')[0] })
      jest.advanceTimersByTime(500)

      expect(ContextMenu.show).not.toHaveBeenCalled()
    })

    it('ignores a touch on a link', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')
      $('#row-0 td').html('<a href="/users/1">edit</a>')

      touch('touchstart', { target: $('#row-0 a')[0] })
      jest.advanceTimersByTime(500)

      expect(ContextMenu.show).not.toHaveBeenCalled()
    })

    it('ignores a touch event carrying no touch point', () => {
      build()
      $('#dt-container tbody tr').addClass('has-context-menu')
      const event = $.Event('touchstart', { target: $('#row-0 td')[0] })
      event.originalEvent = { touches: [] }

      $('#row-0 td').trigger(event)
      jest.advanceTimersByTime(500)

      expect(ContextMenu.show).not.toHaveBeenCalled()
    })
  })

  describe('teardown', () => {
    it('removes its own handlers and forgets the tbody', () => {
      const table = build()
      $('#dt-container tbody tr').addClass('has-context-menu')

      table._with_context_menu_destroy()
      rightClick('#row-0 td')

      expect(ContextMenu.show).not.toHaveBeenCalled()
      expect(table._context_menu_tbody).toBeNull()
    })

    it('does nothing when the menu was never enabled', () => {
      renderTable()
      const table = loadTable({ dt_options: { columns: [] } })

      expect(() => table._with_context_menu_destroy()).not.toThrow()
    })
  })

  describe('hiding the menu', () => {
    it('hides it on a click anywhere', () => {
      document.body.innerHTML = '<div id="context-menu" style="display:block"></div>'

      WithContextMenu.class_methods.clean_context_menu({ target: document.body })

      expect($('#context-menu').css('display')).toBe('none')
    })

    // Clicking a submenu opener must open it, not dismiss the whole menu.
    it('keeps it open when a submenu link was clicked', () => {
      document.body.innerHTML =
        '<div id="context-menu" style="display:block"><a class="submenu" href="#">more</a></div>'
      const event = { target: $('#context-menu a')[0], preventDefault: jest.fn() }

      WithContextMenu.class_methods.clean_context_menu(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect($('#context-menu').css('display')).not.toBe('none')
    })

    it('can be hidden directly', () => {
      document.body.innerHTML = '<div id="context-menu" style="display:block"></div>'

      WithContextMenu.class_methods.context_menu_hide()

      expect($('#context-menu').css('display')).toBe('none')
    })
  })
})
