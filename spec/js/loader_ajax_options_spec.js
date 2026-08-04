import Loader from '../../src/modules/loader.coffee'
import { loadTable, stubDataTables } from './support/table_helpers'

function stubAjax() {
  const calls = []
  $.ajax = (options) => {
    calls.push(options)
    return options
  }
  return calls
}

describe('Loader.ajax', () => {
  let ajaxCalls

  beforeEach(() => {
    document.body.innerHTML = ''
    ajaxCalls = stubAjax()
  })

  afterEach(() => {
    delete $.ajax
    document.body.innerHTML = ''
  })

  describe('the request itself', () => {
    // The payload goes out as JSON so Rails receives native types — an integer
    // column index stays an integer instead of arriving as "3".
    it('posts the payload as JSON', () => {
      Loader.class_methods.ajax('/users/data', { draw: 1 }, () => {})

      expect(ajaxCalls[0].type).toBe('POST')
      expect(ajaxCalls[0].contentType).toBe('application/json')
      expect(ajaxCalls[0].data).toBe('{"draw":1}')
    })

    it('honours a configured http method', () => {
      Loader.class_methods.ajax('/users/data', {}, () => {}, { http_method: 'GET' })

      expect(ajaxCalls[0].type).toBe('GET')
    })

    it('hands the response straight to the callback', () => {
      const callback = jest.fn()
      Loader.class_methods.ajax('/users/data', {}, callback)

      ajaxCalls[0].success({ data: [] }, 'success', {})

      expect(callback).toHaveBeenCalledWith({ data: [] })
    })
  })

  // The load is a POST, so Rails rejects it without the token — and the
  // resulting 422 looks exactly like an expired session.
  describe('the CSRF token', () => {
    it('sends the token from the page meta tag', () => {
      document.body.innerHTML = '<meta name="csrf-token" content="abc123">'

      Loader.class_methods.ajax('/users/data', {}, () => {})

      expect(ajaxCalls[0].headers).toEqual({ 'X-CSRF-Token': 'abc123' })
    })

    it('sends no header at all when the page carries no token', () => {
      Loader.class_methods.ajax('/users/data', {}, () => {})

      expect(ajaxCalls[0].headers).toEqual({})
    })
  })

  describe('a 422', () => {
    // jsdom keeps window.location non-configurable and refuses the navigation
    // itself, logging it instead. The handler is still run end to end, so the
    // assignment is exercised; only the resulting URL cannot be asserted here —
    // the message is what these two pin down. Passing a login_url through a
    // custom on_422 below covers the configuration path with a real assertion.
    function run422(dtf_options) {
      const alerted = jest.spyOn(window, 'alert').mockImplementation(() => {})
      const navigation = jest.spyOn(console, 'error').mockImplementation(() => {})

      Loader.class_methods.ajax('/users/data', {}, () => {}, dtf_options)
      ajaxCalls[0].statusCode[422]()

      navigation.mockRestore()
      return alerted
    }

    it('warns the user before sending them to the login page', () => {
      const alerted = run422({ login_url: '/login', session_expired_message: 'Session over' })

      expect(alerted).toHaveBeenCalledWith('Session over')
      alerted.mockRestore()
    })

    it('falls back to a default message', () => {
      const alerted = run422(undefined)

      expect(alerted).toHaveBeenCalledWith('Session expired, please log in again.')
      alerted.mockRestore()
    })

    it('can be handled by the host application instead', () => {
      const handler = jest.fn()

      Loader.class_methods.ajax('/users/data', {}, () => {}, { on_422: handler })
      ajaxCalls[0].statusCode[422]()

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('a failed request', () => {
    // Without this the table sits on "Processing…" forever with nothing in the
    // console to say why.
    it('reports the failure to the console', () => {
      const logged = jest.spyOn(console, 'error').mockImplementation(() => {})

      Loader.class_methods.ajax('/users/data', {}, () => {})
      ajaxCalls[0].error({ status: 500 }, 'error', 'Internal Server Error')

      expect(logged).toHaveBeenCalledWith(
        'DatatableFactory : table load failed (500 error) Internal Server Error'
      )
      logged.mockRestore()
    })

    it('can be handled by the host application instead', () => {
      const handler = jest.fn()

      Loader.class_methods.ajax('/users/data', {}, () => {}, { on_error: handler })
      ajaxCalls[0].error({ status: 500 }, 'error', 'boom')

      expect(handler).toHaveBeenCalledWith({ status: 500 }, 'error', 'boom')
    })

    it('stays quiet on a 422, which is already routed elsewhere', () => {
      const handler = jest.fn()

      Loader.class_methods.ajax('/users/data', {}, () => {}, { on_error: handler })
      ajaxCalls[0].error({ status: 422 }, 'error', '')

      expect(handler).not.toHaveBeenCalled()
    })

    // A second draw landing before the first response aborts it; that is normal
    // traffic, not a failure worth reporting.
    it('stays quiet on an aborted request', () => {
      const handler = jest.fn()

      Loader.class_methods.ajax('/users/data', {}, () => {}, { on_error: handler })
      ajaxCalls[0].error({ status: 0 }, 'abort', '')

      expect(handler).not.toHaveBeenCalled()
    })
  })
})

describe('Loader class helpers', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('constantize', () => {
    it('walks a dotted path down from window', () => {
      window.Deep = { Nested: { Klass: 'found' } }

      expect(Loader.class_methods.constantize('Deep.Nested.Klass')).toBe('found')
    })

    it('returns undefined for a path that leads nowhere', () => {
      expect(Loader.class_methods.constantize('Nope.Missing')).toBeUndefined()
    })
  })

  describe('to_underscore', () => {
    it('splits a camel-cased name on its capitals', () => {
      expect(Loader.class_methods.to_underscore('dtfLoaderOptions')).toBe(
        'dtf_loader_options'
      )
    })
  })

  // jQuery flattens data-dtf-loader-* attributes into a camel-cased hash; the
  // loader picks the prefixed keys back out and keeps the middle segment.
  describe('extract_options', () => {
    it('keeps only the keys carrying the prefix', () => {
      const extracted = Loader.class_methods.extract_options(
        { dtfLoader: { a: 1 }, somethingElse: 2 },
        'dtfLoader'
      )

      expect(extracted).toEqual({ loader: { a: 1 } })
    })

    it('returns nothing when no key carries the prefix', () => {
      expect(Loader.class_methods.extract_options({ other: 1 }, 'dtfLoader')).toEqual({})
    })
  })

  describe('load_datatables', () => {
    it('loads every tagged table on the page', () => {
      stubDataTables()
      document.body.innerHTML = `
        <table id="tbl-a" data-toggle="datatable"></table>
      `
      const Klass = class extends (require('../../src/model/datatable_base.coffee').default) {}
      window.Datatables = { UsersDatatable: Klass }
      $('#tbl-a').data('dtfLoader', {
        dt_id: '#tbl-a',
        dt_class: 'Datatables.UsersDatatable',
        dt_options: { columns: [], buttons: [], filters: [], filters_applied: [] },
        dtf_options: {},
      })

      Loader.class_methods.load_datatables()

      expect(Klass.instance).toBeTruthy()
    })

    it('does nothing on a page with no tagged table', () => {
      document.body.innerHTML = '<table id="tbl-a"></table>'

      expect(() => Loader.class_methods.load_datatables()).not.toThrow()
    })
  })
})

describe('WithLogger and WithDebug, through a loaded table', () => {
  beforeEach(() => {
    document.body.innerHTML = '<table id="users-datatable"></table>'
    stubDataTables()
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
    document.body.innerHTML = ''
  })

  // Every log line carries the JS class name, so a page holding several tables
  // stays readable in the console.
  it('prefixes log lines with the table class', () => {
    const table = loadTable()
    table.logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), dump: jest.fn() }

    table.info('hello')
    table.warn('careful')
    table.error('broken')

    expect(table.logger.info).toHaveBeenCalledWith('Datatables.UsersDatatable : hello')
    expect(table.logger.warn).toHaveBeenCalledWith('Datatables.UsersDatatable : careful')
    expect(table.logger.error).toHaveBeenCalledWith('Datatables.UsersDatatable : broken')
  })

  it('dumps payloads unprefixed, so they stay inspectable', () => {
    const table = loadTable()
    table.logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), dump: jest.fn() }
    const payload = { a: 1 }

    table.dump(payload)

    expect(table.logger.dump).toHaveBeenCalledWith(payload)
  })

  describe('the debug flags travelling with each request', () => {
    it('are off on a plain url', () => {
      const table = loadTable()

      const payload = table._debug_callback_on_ajax()({})

      expect(payload).toEqual({ dtf_debug_log: false, dtf_debug_dump: false })
    })

    // The query string is set through history rather than by stubbing
    // window.location: jsdom keeps location non-configurable, and this exercises
    // the real URLSearchParams read the module performs.
    it('are on when the query string asks for them', () => {
      const table = loadTable()
      window.history.replaceState({}, '', '?dtf_debug_log=true&dtf_debug_dump=true')

      const payload = table._debug_callback_on_ajax()({})

      expect(payload).toEqual({ dtf_debug_log: true, dtf_debug_dump: true })
    })

    // A bare truthiness test would turn ?dtf_debug_log=false on.
    it('stay off for any value other than the literal true', () => {
      const table = loadTable()
      window.history.replaceState({}, '', '?dtf_debug_log=false&dtf_debug_dump=1')

      const payload = table._debug_callback_on_ajax()({})

      expect(payload).toEqual({ dtf_debug_log: false, dtf_debug_dump: false })
    })
  })
})
