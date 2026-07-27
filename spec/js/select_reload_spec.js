import SelectFilter from '../../src/model/filters/select_filter.coffee'

const logger = { info() {}, warn() {}, error() {}, dump() {} }

const datatableFilter = {
  dt_class: 'Datatables.UsersDatatable',
  dt_id: 'users-datatable',
  has_state_for: () => null,
}

const SELECT_ID = 'yadcf-filter-users-datatable-3'

function build() {
  document.body.innerHTML = `<div id="users-role-filter"><select id="${SELECT_ID}"></select></div>`

  return new SelectFilter(datatableFilter, logger, {
    column_id: 3,
    filter_default_label: 'Role',
    filter_container_id: 'users-role-filter',
    filter_plugin: 'native',
  })
}

const DATA = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

describe('SelectBase#reload', () => {
  it('renders the options on first load', () => {
    const filter = build()
    filter.dropdown_data = DATA
    filter.reload({})

    expect($(`#${SELECT_ID} option`).length).toBe(3)
  })

  it('does not rebuild the options when the data is unchanged', () => {
    const filter = build()
    filter.dropdown_data = DATA
    filter.reload({})

    // A rebuild would empty the select and drop this marker.
    $(`#${SELECT_ID}`).append('<option id="marker" value="marker">marker</option>')
    filter.dropdown_data = DATA.slice()
    filter.reload({})

    expect($('#marker').length).toBe(1)
  })

  it('rebuilds the options when the data changes', () => {
    const filter = build()
    filter.dropdown_data = DATA
    filter.reload({})

    filter.dropdown_data = [{ value: 'admin', label: 'Admin' }]
    filter.reload({})

    expect($(`#${SELECT_ID} option`).length).toBe(2)
  })

  it('reflects new labels when the data changes', () => {
    const filter = build()
    filter.dropdown_data = DATA
    filter.reload({})

    filter.dropdown_data = [{ value: 'admin', label: 'Administrator' }]
    filter.reload({})

    expect($(`#${SELECT_ID} option`).last().text()).toBe('Administrator')
  })
})
