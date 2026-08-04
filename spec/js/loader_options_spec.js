import Loader from '../../src/modules/loader.coffee'
import {
  DataTableApiStub,
  lastApiStub,
  loadTable,
  resetApiStubs,
  stubDataTables,
} from './support/table_helpers'

// The loader's job is to fold every module's callbacks into the single options
// hash DataTables is constructed with. These specs read that hash back out.
function stubAjax() {
  const calls = []
  $.ajax = (options) => {
    calls.push(options)
    return options
  }
  return calls
}

describe('the options the loader builds', () => {
  let ajaxCalls

  beforeEach(() => {
    document.body.innerHTML = '<table id="users-datatable"></table>'
    stubDataTables()
    resetApiStubs()
    ajaxCalls = stubAjax()
  })

  afterEach(() => {
    resetApiStubs()
    delete $.ajax
    window.history.replaceState({}, '', '/')
    document.body.innerHTML = ''
  })

  describe('createdRow', () => {
    it('fans a new row out to every registered callback', () => {
      const table = loadTable()
      const first = jest.fn()
      const second = jest.fn()
      table.callbacks['createdRow'].push(first, second)
      table._loader_load_created_row_callbacks()

      table.dt_options.createdRow('row', 'data', 1, 'cells')

      expect(first).toHaveBeenCalledWith('row', 'data', 1, 'cells')
      expect(second).toHaveBeenCalledWith('row', 'data', 1, 'cells')
    })

    it('is installed even when nothing registered one', () => {
      const table = loadTable()

      expect(() => table.dt_options.createdRow('row', 'data', 0, 'cells')).not.toThrow()
    })
  })

  describe('drawCallback', () => {
    it('fans a draw out to every registered callback', () => {
      const table = loadTable()
      const handler = jest.fn()
      table.callbacks['drawCallback'].push(handler)
      table._loader_load_draw_callbacks()

      table.dt_options.drawCallback('settings')

      expect(handler).toHaveBeenCalledWith('settings')
    })
  })

  describe('the ajax option', () => {
    it('posts to the declared source', () => {
      const table = loadTable({ dt_options: { source: '/users/data' } })

      table.dt_options.ajax({ draw: 1 }, () => {}, {})

      expect(ajaxCalls[0].url).toBe('/users/data')
    })

    // With modules registered, each one gets to enrich the payload before it
    // goes out — that is how the checkbox selection rides along.
    it('lets each registered callback enrich the payload', () => {
      const table = loadTable({ dt_options: { source: '/users/data' } })
      table.callbacks['ajax'].push(() => ({ selected: ['row-1'] }))
      table._loader_load_ajax_callbacks()

      table.dt_options.ajax({ draw: 1 }, () => {}, {})

      // objectContaining, not toEqual: the debug module has already registered
      // a callback of its own, and it enriches the same payload.
      expect(JSON.parse(ajaxCalls[0].data)).toEqual(
        expect.objectContaining({ draw: 1, selected: ['row-1'] })
      )
    })

    it('sends the payload untouched when no callback registered', () => {
      const table = loadTable({ dt_options: { source: '/users/data' } })
      table.callbacks['ajax'] = []
      table._loader_load_ajax_callbacks()

      table.dt_options.ajax({ draw: 1 }, () => {}, {})

      expect(JSON.parse(ajaxCalls[0].data)).toEqual({ draw: 1 })
    })
  })

  describe('the button success callbacks', () => {
    // Both selection buttons must refresh the table once the server answered,
    // otherwise the page still shows the old selection.
    it('reload the table through the class the button belongs to', () => {
      const table = loadTable()

      table.callbacks['buttons']['select_all'].success.forEach((callback) =>
        callback('Datatables.UsersDatatable', {}, 'success', {})
      )

      expect(table.datatable.reloads.length).toBe(1)
    })

    it('are installed on both selection buttons', () => {
      const table = loadTable()

      expect(table.callbacks['buttons']['select_all'].success.length).toBe(1)
      expect(table.callbacks['buttons']['reset_selection'].success.length).toBe(1)
    })
  })

  // The saved state restores the page the table was last left on; a URL filter
  // makes that page meaningless, and DataTables applies the state after preInit,
  // so it has to be dropped through stateLoadParams at construction time.
  describe('dropping the saved page when the URL carries filters', () => {
    it('installs no hook on a plain url', () => {
      const table = loadTable()

      expect(table.dt_options.stateLoadParams).toBeUndefined()
    })

    it('rewinds the saved offset to zero', () => {
      window.history.replaceState({}, '', '?dt_filters[role]=admin')
      const table = loadTable()
      const data = { start: 40 }

      table.dt_options.stateLoadParams({}, data)

      expect(data.start).toBe(0)
    })

    it('keeps a hook the host application already declared', () => {
      window.history.replaceState({}, '', '?dt_filters[role]=admin')
      const previous = jest.fn()
      const table = loadTable({ dt_options: { stateLoadParams: previous } })
      const data = { start: 40 }

      table.dt_options.stateLoadParams({}, data)

      expect(previous).toHaveBeenCalled()
      expect(data.start).toBe(0)
    })
  })

  // Last line of defence: rows deleted, a scope narrowed or a populate_with
  // default can all leave the restored offset past the last row, and the table
  // then renders empty while announcing "showing 11 to 3 of 3".
  describe('recovering from a saved page that no longer exists', () => {
    // The handler builds a fresh Api from the xhr settings rather than reusing
    // the instance, so the assertions read the last stub that was constructed.
    function respondFrom(start, json) {
      const table = loadTable()
      resetApiStubs()
      DataTableApiStub.defaultPageInfo = { start }

      $(table.dt_id).trigger('xhr.dt.dtf-paging', [{}, json])

      return lastApiStub()
    }

    it('goes back to the first page when the offset is past the last row', () => {
      const api = respondFrom(40, { recordsFiltered: 3 })

      expect(api.pagedTo).toBe(0)
      expect(api.draws).toEqual(['page'])
    })

    it('leaves a valid page alone', () => {
      const api = respondFrom(0, { recordsFiltered: 30 })

      expect(api.pagedTo).toBeNull()
    })

    // An empty result set is a legitimate state, not a stale page: redrawing
    // would cost a request per response for a table that has nothing to show.
    it('leaves an empty result set alone', () => {
      const table = loadTable()
      table.datatable.pageInfo = { start: 40 }

      $(table.dt_id).trigger('xhr.dt.dtf-paging', [{}, { recordsFiltered: 0 }])

      expect(table.datatable.pagedTo).toBeNull()
    })

    it('ignores a response carrying no count', () => {
      const table = loadTable()
      table.datatable.pageInfo = { start: 40 }

      $(table.dt_id).trigger('xhr.dt.dtf-paging', [{}, {}])

      expect(table.datatable.pagedTo).toBeNull()
    })

    it('ignores an empty response', () => {
      const table = loadTable()
      table.datatable.pageInfo = { start: 40 }

      $(table.dt_id).trigger('xhr.dt.dtf-paging', [{}, null])

      expect(table.datatable.pagedTo).toBeNull()
    })
  })

  describe('the filter icons', () => {
    function withFilters(filters) {
      document.body.innerHTML = `
        <div>
          <div id="users-datatable_wrapper"></div>
          <div id="role-filter"><div class="input-group"><input></div></div>
        </div>
        <table id="users-datatable"></table>
      `
      // Assigned after the load rather than passed in dt_options: declared
      // filters make init_filters build a real DatatableFilter, which is a
      // different subsystem and has its own specs.
      const table = loadTable()
      table.filters = filters
      table._prepend_filter_icons($('#users-datatable_wrapper').parent())
      return table
    }

    it('prepends the declared icon to the filter group', () => {
      withFilters([{ filter_container_id: 'role-filter', icon: 'magnifying-glass' }])

      expect($('#role-filter .dtf-filter-icon i').attr('class')).toBe(
        'fa-solid fa-magnifying-glass'
      )
    })

    it('adds nothing for a filter that declares no icon', () => {
      withFilters([{ filter_container_id: 'role-filter' }])

      expect($('#role-filter .dtf-filter-icon').length).toBe(0)
    })

    // The name is interpolated into a class attribute, so anything outside the
    // FontAwesome charset is refused rather than escaped.
    it('refuses an icon name that could carry markup', () => {
      withFilters([
        { filter_container_id: 'role-filter', icon: '"><img src=x onerror=alert(1)>' },
      ])

      expect($('#role-filter .dtf-filter-icon').length).toBe(0)
      expect($('#role-filter img').length).toBe(0)
    })

    it('never adds the same icon twice', () => {
      const table = withFilters([
        { filter_container_id: 'role-filter', icon: 'magnifying-glass' },
      ])

      table._prepend_filter_icons($('#users-datatable_wrapper').parent())

      expect($('#role-filter .dtf-filter-icon').length).toBe(1)
    })

    it('skips a filter whose container is not on the page', () => {
      withFilters([{ filter_container_id: 'missing-filter', icon: 'user' }])

      expect($('.dtf-filter-icon').length).toBe(0)
    })
  })
})

describe('Loader.load', () => {
  beforeEach(() => {
    document.body.innerHTML = '<table id="users-datatable"></table>'
    stubDataTables()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('reports an unknown class through the logger rather than throwing', () => {
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = Loader.class_methods.load({
      dt_id: '#users-datatable',
      dt_class: 'Datatables.Missing',
      dt_options: {},
      dtf_options: { debug_log: true },
    })

    expect(result).toBe(false)
    expect(logged).toHaveBeenCalledWith(
      "DatatableFactory : Datatable 'Datatables.Missing' not found"
    )
    logged.mockRestore()
  })
})
