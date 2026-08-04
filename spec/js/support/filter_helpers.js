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
