import { checkBoxColumn, loadTable, stubDataTables } from '../support/table_helpers'

const BUTTONS = [
  { button_name: 'select_all', url: '/users/select_all', method: 'POST' },
  { button_name: 'reset_selection', url: '/users/reset_selection', method: 'POST' },
  { button_name: 'reset_filters' },
  { button_name: 'apply_default_filters' },
]

function build({ buttons = BUTTONS, columns = [checkBoxColumn()] } = {}) {
  return loadTable({ dt_options: { buttons: JSON.parse(JSON.stringify(buttons)), columns } })
}

// The buttons post to the server themselves rather than going through
// DataTables' ajax, so $.ajax is the observable boundary.
function stubAjax() {
  const calls = []
  $.ajax = (options) => {
    calls.push(options)
    return options
  }
  return calls
}

describe('WithButtons', () => {
  let ajaxCalls

  beforeEach(() => {
    document.body.innerHTML = '<table id="users-datatable"></table>'
    stubDataTables()
    ajaxCalls = stubAjax()
  })

  afterEach(() => {
    delete $.ajax
    document.body.innerHTML = ''
  })

  describe('when the table declares no buttons', () => {
    it('does nothing at all', () => {
      const table = build({ buttons: [] })

      expect(table.with_buttons_set_callbacks('before_init')).toBe(false)
    })
  })

  describe('looking a button up', () => {
    it('returns its index and the button itself', () => {
      const table = build()

      const [index, button] = table.find_button_by_name('reset_selection')

      expect(index).toBe(1)
      expect(button.url).toBe('/users/reset_selection')
    })

    it('returns null for a name the table does not declare', () => {
      const table = build()

      expect(table.find_button_by_name('nope')).toBeNull()
    })
  })

  describe('wiring the actions', () => {
    // DataTables calls button.action(event, dt, node, config); the library
    // installs one that closes over the button, so the handler can read its url.
    it('gives every known button an action', () => {
      const table = build()

      expect(table.buttons.every((button) => typeof button.action === 'function')).toBe(true)
    })

    it('leaves a button the module knows nothing about untouched', () => {
      const table = build({ buttons: [{ button_name: 'export_csv', url: '/export' }] })

      expect(table.buttons[0].action).toBeUndefined()
    })
  })

  describe('select_all', () => {
    it('selects every row on the current page', () => {
      const table = build()

      table.select_all(table.find_button_by_name('select_all')[1])

      expect(table.datatable.selected).toEqual([{ page: 'current' }])
    })

    // length: -1 is what tells the server to act on the whole filtered set and
    // not just the page; the selection is reset so the server starts from the
    // filter, not from whatever was ticked before.
    it('posts the filtered set with the selection reset', () => {
      const table = build()
      table.datatable.ajaxParams = { draw: 1, length: 10 }

      table.select_all(table.find_button_by_name('select_all')[1])

      expect(ajaxCalls[0].url).toBe('/users/select_all')
      expect(ajaxCalls[0].method).toBe('POST')
      expect(ajaxCalls[0].data.length).toBe(-1)
      expect(ajaxCalls[0].data.selected).toEqual([])
      expect(ajaxCalls[0].data.not_selected).toEqual([])
      expect(ajaxCalls[0].data.draw).toBe(1)
    })

    it('fires through the button action DataTables installed', () => {
      const table = build()

      table.buttons[0].action({}, null, null, null)

      expect(ajaxCalls[0].url).toBe('/users/select_all')
    })
  })

  describe('reset_selection', () => {
    it('deselects every row on the current page', () => {
      const table = build()

      table.reset_selection(table.find_button_by_name('reset_selection')[1])

      expect(table.datatable.deselected).toEqual([{ page: 'current' }])
    })

    it('posts an empty selection without touching the page length', () => {
      const table = build()
      table.datatable.ajaxParams = { draw: 2, length: 10 }

      table.reset_selection(table.find_button_by_name('reset_selection')[1])

      expect(ajaxCalls[0].url).toBe('/users/reset_selection')
      expect(ajaxCalls[0].data.length).toBe(10)
      expect(ajaxCalls[0].data.selected).toEqual([])
    })

    it('is reachable from the class, for host application code', () => {
      const table = build()

      table.constructor.reset_datatable_selection()

      expect(table.datatable.deselected).toEqual([{ page: 'current' }])
    })

    it('does nothing from the class when the table declares no such button', () => {
      const table = build({ buttons: [{ button_name: 'select_all', url: '/x' }] })

      expect(() => table.constructor.reset_datatable_selection()).not.toThrow()
      expect(ajaxCalls).toEqual([])
    })
  })

  describe('the filter buttons', () => {
    it('delegates reset_filters to the filter manager', () => {
      const table = build()
      table.datatable_filter = { reset_filters: jest.fn(), apply_default_filters: jest.fn() }
      const event = {}

      table.reset_filters(event)

      expect(table.datatable_filter.reset_filters).toHaveBeenCalledWith(event)
    })

    it('delegates apply_default_filters to the filter manager', () => {
      const table = build()
      table.datatable_filter = { reset_filters: jest.fn(), apply_default_filters: jest.fn() }
      const event = {}

      table.apply_default_filters(event)

      expect(table.datatable_filter.apply_default_filters).toHaveBeenCalledWith(event)
    })
  })

  describe('the ajax callbacks', () => {
    // Every registered callback receives dt_class as its first argument, so the
    // host application can tell which table a shared handler was fired for.
    it('passes the JS class name to a beforeSend callback', () => {
      const handler = jest.fn()
      const table = build()
      table.callbacks['buttons']['select_all'].beforeSend = [handler]

      const options = table._build_ajax_options('select_all')
      options.beforeSend('xhr', 'settings')

      expect(handler).toHaveBeenCalledWith('Datatables.UsersDatatable', 'xhr', 'settings')
    })

    it('passes the JS class name to an error callback', () => {
      const handler = jest.fn()
      const table = build()
      table.callbacks['buttons']['select_all'].error = [handler]

      table._build_ajax_options('select_all').error('xhr', 'status', 'error')

      expect(handler).toHaveBeenCalledWith(
        'Datatables.UsersDatatable',
        'xhr',
        'status',
        'error'
      )
    })

    it('passes the JS class name to a success callback', () => {
      const handler = jest.fn()
      const table = build()
      table.callbacks['buttons']['select_all'].success = [handler]

      table._build_ajax_options('select_all').success('data', 'status', 'xhr')

      expect(handler).toHaveBeenCalledWith(
        'Datatables.UsersDatatable',
        'data',
        'status',
        'xhr'
      )
    })

    it('survives a button with no callbacks registered at all', () => {
      const table = build()
      table.callbacks['buttons']['select_all'] = {}

      const options = table._build_ajax_options('select_all')

      expect(() => options.beforeSend('xhr', 'settings')).not.toThrow()
      expect(() => options.error('xhr', 'status', 'error')).not.toThrow()
      expect(() => options.success('data', 'status', 'xhr')).not.toThrow()
    })
  })
})
