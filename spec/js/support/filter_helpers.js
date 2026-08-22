// Shared scaffolding for the filter specs. Filters talk to the outside world
// through exactly three collaborators — the DatatableFilter that owns them, a
// logger, and the DOM — so recording the first two is enough to assert what a
// filter did without standing up a real DataTable.

// Records every call the filter makes back into its owner. The filters never
// read anything back from it except has_state_for, which is what makes a plain
// recorder sufficient.
export function buildDatatableFilter(overrides = {}) {
  const recorder = {
    dt_class: 'Datatables.UsersDatatable',
    dt_id: 'users-datatable',
    saved: [],
    searches: [],
    filters: [],
    state: null,

    has_state_for() {
      return this.state
    },

    save_state(column_id, data) {
      this.saved.push({ column_id, data })
    },

    set_search_value(column_id, value) {
      this.searches.push({ column_id, value })
    },

    run_filter(column_id, value) {
      this.filters.push({ column_id, value })
    },
  }

  return Object.assign(recorder, overrides)
}

export function buildLogger() {
  return { info() {}, warn() {}, error() {}, dump() {} }
}

export function filterOptions(overrides = {}) {
  return Object.assign(
    {
      column_id: 3,
      filter_default_label: 'Role',
      filter_container_id: 'users-role-filter',
      filter_plugin: 'native',
    },
    overrides
  )
}

// The filters render into #{filter_container_id}; without it create_html has
// nowhere to append and every DOM assertion silently matches nothing.
export function renderContainer(id = 'users-role-filter') {
  $('body').append(`<div id="${id}"></div>`)
  return $(`#${id}`)
}

export function resetDom() {
  $('body').empty()
}

// jQuery UI is a peer the host application provides, so it is stubbed like
// TomSelect. Only the two things range_date_filter actually consumes are
// modelled: $.fn.datepicker as a no-op recorder, and $.datepicker.parseDate
// with the pass/throw contract the filter branches on (a parsed Date means
// "in use", a throw means "not a date"). Nothing here reimplements jQuery UI's
// own date arithmetic — the specs never assert on the parsed value itself.
export function stubDatepicker() {
  const calls = []

  $.fn.datepicker = function datepicker(...args) {
    calls.push({ elements: this.toArray(), args })
    return this
  }

  $.datepicker = {
    parseDate(format, value) {
      const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
      if (!match) throw new Error(`Invalid date: ${value}`)

      return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
    },
  }

  return calls
}

export function unstubDatepicker() {
  delete $.fn.datepicker
  delete $.datepicker
}

// flatpickr is a peer too, reached as a global exactly like TomSelect. The stub
// records every call and hands back an instance exposing the two methods the
// filter uses — set() for the cross bounds, destroy() for teardown — so a spec
// can assert on what the filter asked for without pulling the real library in.
export function stubFlatpickr() {
  const calls = []

  global.flatpickr = function flatpickr(element, options) {
    const instance = {
      element,
      options,
      settings: [],
      destroyed: false,
      set(key, value) {
        this.settings.push({ key, value })
      },
      destroy() {
        this.destroyed = true
      },
    }
    calls.push(instance)
    return instance
  }

  // Same pass/throw contract as $.datepicker.parseDate: the filter branches on
  // a Date meaning "in use" and a throw meaning "not a date".
  global.flatpickr.parseDate = function parseDate(value, format) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
    if (!match) throw new Error(`Invalid date: ${value} (${format})`)

    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
  }

  return calls
}

export function unstubFlatpickr() {
  delete global.flatpickr
}

// noUiSlider is a peer reached as a global, exactly like flatpickr. The stub
// models the event semantics of the real library rather than guessing them:
// checked against nouislider 15.8.1, `valueSet` (dist/nouislider.js:2071-2074)
// fires 'update' and 'set' but never 'change', which is what lets the filter
// sync the handles programmatically without triggering a server round-trip.
// `drag` is the test-side handle for what a user does: move, then release.
export function stubNoUiSlider() {
  const sliders = []

  global.noUiSlider = {
    create(element, options) {
      const handlers = {}

      const api = {
        element,
        options,
        values: options.start.slice(),
        destroyed: false,

        on(event, callback) {
          handlers[event] = handlers[event] || []
          handlers[event].push(callback)
        },

        emit(event) {
          const format = options.format
          const values = api.values.map((v) => (format ? format.to(Number(v)) : v))
          for (const callback of handlers[event] || []) callback(values)
        },

        set(values) {
          api.values = [].concat(values)
          api.emit('update')
          api.emit('set')
        },

        drag(values) {
          api.values = [].concat(values)
          api.emit('update')
          api.emit('change')
        },

        destroy() {
          api.destroyed = true
          delete element.noUiSlider
        },
      }

      element.noUiSlider = api
      sliders.push(api)
      api.emit('update')

      return api
    },
  }

  return sliders
}

export function unstubNoUiSlider() {
  delete global.noUiSlider
}
