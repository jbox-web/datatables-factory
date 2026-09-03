import { loadTable, stubDataTables, resetApiStubs } from './support/table_helpers'

// Loader#init_filters was never entered under jest: table_helpers always passed
// `filters: []`, so the guard on its first line returned and everything below
// it — the Bootstrap wrapping, the configurable reset-button class, the icon
// prepending — was only ever exercised in a browser.
describe('Loader#init_filters', () => {
  const CONTAINER = 'users-name-filter'

  const filter = {
    column_id: 1,
    filter_type: 'text',
    filter_default_label: 'Name',
    filter_container_id: CONTAINER,
    icon: 'magnifying-glass',
  }

  // The form init_filters looks for is the PARENT of the DataTables wrapper, so
  // the filter containers have to live under it — the layout the Rails side
  // produces.
  function loadWithFilters(dtf_options = {}, filters = [filter]) {
    document.body.innerHTML = `
      <div id="page">
        <div id="${CONTAINER}"></div>
        <div id="users-datatable_wrapper"></div>
        <table id="users-datatable"></table>
      </div>
    `
    stubDataTables()
    return loadTable({
      dt_options: {
        columns: [{ data: 'id' }, { data: 'name' }],
        filters,
      },
      dtf_options,
    })
  }

  beforeEach(() => {
    resetApiStubs()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete window.Datatables
  })

  it('builds the declared filter inside its container', () => {
    loadWithFilters()

    expect($(`#${CONTAINER} input.dtf-filter`).length).toBe(1)
  })

  it('wraps the filter for the Bootstrap grid', () => {
    loadWithFilters()

    expect($(`#${CONTAINER} div.mb-3.row`).length).toBe(1)
    expect($(`#${CONTAINER} div.input-group`).length).toBe(1)
    expect($(`#${CONTAINER} div.col-md-12`).length).toBe(1)
  })

  it('gives the reset button the class the host configured', () => {
    loadWithFilters({ filter_reset_button_class: 'btn btn-soft-secondary' })

    expect($('.dtf-filter-reset-button').hasClass('btn-soft-secondary')).toBe(true)
  })

  it('falls back to a default reset-button class', () => {
    loadWithFilters()

    expect($('.dtf-filter-reset-button').hasClass('btn-secondary')).toBe(true)
  })

  it('prepends the declared icon', () => {
    loadWithFilters()

    expect($(`#${CONTAINER} span.dtf-filter-icon i.fa-magnifying-glass`).length).toBe(1)
  })

  // The icon name is interpolated into a class attribute, so it is restricted to
  // the FontAwesome charset rather than escaped.
  it('ignores an icon name outside the allowed charset', () => {
    loadWithFilters({}, [Object.assign({}, filter, { icon: 'x" onload="alert(1)' })])

    expect($(`#${CONTAINER} span.dtf-filter-icon`).length).toBe(0)
    expect($(`#${CONTAINER} input.dtf-filter`).length).toBe(1)
  })

  // Reloading in place is the path a Turbo restoration visit takes: the markup
  // is already there and the table is built again on top of it.
  describe('loaded a second time on the same markup', () => {
    it('replaces the filter instead of adding to it', () => {
      loadWithFilters()
      loadTable({
        dt_options: { columns: [{ data: 'id' }, { data: 'name' }], filters: [filter] },
      })

      expect($(`#${CONTAINER} div.dtf-filter-wrapper`).length).toBe(1)
      expect($(`#${CONTAINER} input.dtf-filter`).length).toBe(1)
    })

    it('does not nest the Bootstrap wrapping deeper', () => {
      loadWithFilters()
      loadTable({
        dt_options: { columns: [{ data: 'id' }, { data: 'name' }], filters: [filter] },
      })

      expect($(`#${CONTAINER} div.mb-3.row`).length).toBe(1)
      expect($(`#${CONTAINER} div.input-group`).length).toBe(1)
    })
  })
})
