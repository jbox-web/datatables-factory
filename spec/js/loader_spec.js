import DatatableBase from '../../src/model/datatable_base.coffee'
import Loader from '../../src/modules/loader.coffee'

// Minimal stand-in for the DataTables API surface the library touches.
class ApiStub {
  constructor(settings) {
    this.settings = settings
    this.destroyed = false
  }

  destroy() {
    this.destroyed = true
  }

  off() {
    return this
  }

  on() {
    return this
  }
}

function stubDataTables() {
  $.fn.DataTable = function (options) {
    // The real DataTables fires preInit.dt during construction; the library
    // captures its API instance there.
    $(this).trigger('preInit.dt', [options])
    return {}
  }
  $.fn.dataTable = { Api: ApiStub }
}

function loaderFor(id, dt_class = 'Datatables.UsersDatatable') {
  return {
    dt_id: `#${id}`,
    dt_class: dt_class,
    dt_options: { columns: [], buttons: [], filters: [], filters_applied: [] },
    dtf_options: {},
  }
}

describe('Loader.load', () => {
  let UsersDatatable

  beforeEach(() => {
    document.body.innerHTML = '<table id="tbl-a"></table>'
    stubDataTables()

    UsersDatatable = class extends DatatableBase {}
    window.Datatables = { UsersDatatable: UsersDatatable }
  })

  describe('loading a table', () => {
    it('exposes the instance on the class', () => {
      Loader.class_methods.load(loaderFor('tbl-a'))
      expect(UsersDatatable.instance).toBeTruthy()
    })

    it('gives it a DataTables API', () => {
      Loader.class_methods.load(loaderFor('tbl-a'))
      expect(UsersDatatable.instance.datatable).toBeInstanceOf(ApiStub)
    })
  })

  // One JS class always maps to a single table: dt_class and the DOM id are both
  // derived from (namespace, dt_id) on the Ruby side, so a class can never be
  // shared by two different ids. A per-class singleton is therefore sufficient.
  describe('reloading the same table', () => {
    it('destroys the previous instance', () => {
      Loader.class_methods.load(loaderFor('tbl-a'))
      const first = UsersDatatable.instance
      Loader.class_methods.load(loaderFor('tbl-a'))

      expect(first.datatable).toBeNull()
    })

    it('replaces it with a new one', () => {
      Loader.class_methods.load(loaderFor('tbl-a'))
      const first = UsersDatatable.instance
      Loader.class_methods.load(loaderFor('tbl-a'))

      expect(UsersDatatable.instance).not.toBe(first)
    })

    it('leaves a single instance behind', () => {
      Loader.class_methods.load(loaderFor('tbl-a'))
      Loader.class_methods.load(loaderFor('tbl-a'))

      expect(UsersDatatable.instance.datatable).toBeInstanceOf(ApiStub)
    })
  })

  describe('unknown class', () => {
    it('returns false rather than throwing', () => {
      expect(Loader.class_methods.load(loaderFor('tbl-a', 'Datatables.Nope'))).toBe(false)
    })
  })
})

describe('button callbacks', () => {
  beforeEach(() => {
    document.body.innerHTML = '<table id="tbl-a"></table>'
    stubDataTables()
  })

  function loadWith(hook) {
    const Klass = class extends DatatableBase {
      before_init() {
        super.before_init()
        hook(this)
      }
    }
    window.Datatables = { UsersDatatable: Klass }
    Loader.class_methods.load(loaderFor('tbl-a'))
    return Klass.instance
  }

  it('preserves an error callback registered in before_init', () => {
    const handler = jest.fn()
    const table = loadWith((t) => {
      t.callbacks['buttons']['select_all'].error = [handler]
    })

    expect(table.callbacks['buttons']['select_all'].error).toContain(handler)
  })

  it('preserves a success callback registered in before_init', () => {
    const handler = jest.fn()
    const table = loadWith((t) => {
      t.callbacks['buttons']['select_all'].success = [handler]
    })

    expect(table.callbacks['buttons']['select_all'].success).toContain(handler)
  })

  it('still installs its own reload callback alongside', () => {
    const handler = jest.fn()
    const table = loadWith((t) => {
      t.callbacks['buttons']['select_all'].success = [handler]
    })

    expect(table.callbacks['buttons']['select_all'].success.length).toBe(2)
  })

  it('installs the reload callback when nothing was registered', () => {
    const table = loadWith(() => {})
    expect(table.callbacks['buttons']['reset_selection'].success.length).toBe(1)
  })
})
