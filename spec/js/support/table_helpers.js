import DatatableBase from '../../../src/model/datatable_base.coffee'
import Loader from '../../../src/modules/loader.coffee'

// Stand-in for the slice of the DataTables API the library actually calls.
// Everything is recorded rather than simulated: the specs assert on what the
// library asked DataTables to do, which is the real contract between them.
export class DataTableApiStub {
  constructor(settings) {
    this.settings = settings
    this.destroyed = false
    this.handlers = {}
    this.selected = []
    this.deselected = []
    this.reloads = []
    this.ajaxParams = {}
    this.container = $('<div class="dt-container"></div>')[0]

    const api = this
    this.ajax = {
      params: () => Object.assign({}, api.ajaxParams),
      reload: (callback, resetPaging) => api.reloads.push({ callback, resetPaging }),
    }

    // _reset_stale_page builds its own Api from the xhr settings rather than
    // reusing the instance, so specs need to reach that throwaway object:
    // every instance registers itself, and the page state it starts from is a
    // class-level default they can set beforehand.
    DataTableApiStub.instances.push(this)

    // page() is both a function and a namespace in the real API: page(n) moves
    // the table, page.info() reports where it is.
    this.pageInfo = Object.assign({ start: 0 }, DataTableApiStub.defaultPageInfo)
    this.draws = []
    this.pagedTo = null
    const page = (n) => {
      api.pagedTo = n
      return { draw: (mode) => api.draws.push(mode) }
    }
    page.info = () => api.pageInfo
    this.page = page

    // Modelled because a table that declares filters cannot load without them:
    // DatatableFilter reads the saved state in its constructor and writes the
    // per-column search straight into the settings store, one slot per declared
    // column, exactly as DataTables builds it.
    this.stateSaves = 0
    this.state = {
      loaded: () => DataTableApiStub.defaultState,
      save: () => {
        api.stateSaves += 1
      },
    }
    const columns = (settings && settings.columns) || []
    this.context = [{ aoPreSearchCols: columns.map(() => ({ search: '' })) }]
  }

  table() {
    return { container: () => this.container }
  }

  rows(selector) {
    const api = this
    return {
      select() {
        api.selected.push(selector)
        return this
      },
      deselect() {
        api.deselected.push(selector)
        return this
      },
      nodes() {
        return { each: (fn) => (api.rowNodes || []).forEach(fn) }
      },
    }
  }

  row(selector) {
    const api = this
    return {
      select() {
        api.selected.push(selector)
        return this
      },
    }
  }

  // Handlers are registered under namespaced event strings ("draw.dt.dtfCheckBoxes");
  // keeping the raw key is what lets a spec prove teardown removed exactly its own.
  on(events, handler) {
    this.handlers[events] = handler
    return this
  }

  off(events) {
    delete this.handlers[events]
    return this
  }

  destroy() {
    this.destroyed = true
  }
}

DataTableApiStub.instances = []
DataTableApiStub.defaultPageInfo = null
DataTableApiStub.defaultState = null

export function resetApiStubs() {
  DataTableApiStub.instances = []
  DataTableApiStub.defaultPageInfo = null
  DataTableApiStub.defaultState = null
}

export function lastApiStub() {
  return DataTableApiStub.instances[DataTableApiStub.instances.length - 1]
}

export function stubDataTables() {
  $.fn.DataTable = function DataTable(options) {
    $(this).trigger('preInit.dt', [options])
    return {}
  }
  $.fn.dataTable = { Api: DataTableApiStub }
}

export function loaderPayload(id, overrides = {}) {
  return {
    dt_id: `#${id}`,
    dt_class: 'Datatables.UsersDatatable',
    dt_options: Object.assign(
      { columns: [], buttons: [], filters: [], filters_applied: [] },
      overrides.dt_options
    ),
    dtf_options: overrides.dtf_options || {},
  }
}

// Loads a table the way the real page does — through Loader — so the instance
// under test carries every mixin, wired exactly as in production.
export function loadTable({ id = 'users-datatable', dt_options, dtf_options, subclass } = {}) {
  const Klass = subclass || class extends DatatableBase {}
  window.Datatables = { UsersDatatable: Klass }
  Loader.class_methods.load(loaderPayload(id, { dt_options, dtf_options }))
  return Klass.instance
}

export function checkBoxColumn() {
  return { data: 'check_box' }
}
