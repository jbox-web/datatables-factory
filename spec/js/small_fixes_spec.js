import RangeDateFilter from '../../src/model/filters/range_date_filter.coffee'
import WithDebug from '../../src/modules/with_debug.coffee'
import WithCheckBoxes from '../../src/modules/with_check_boxes.coffee'
import Loader from '../../src/modules/loader.coffee'

const logger = { info() {}, warn() {}, error() {}, dump() {} }

const datatableFilter = {
  dt_class: 'Datatables.UsersDatatable',
  dt_id: 'users-datatable',
  has_state_for: () => null,
}

describe('RangeDateFilter without plugin options', () => {
  function build(overrides = {}) {
    const options = Object.assign(
      {
        column_id: 5,
        filter_default_label: ['From', 'To'],
        filter_container_id: 'users-created-at-filter',
      },
      overrides
    )
    return new RangeDateFilter(datatableFilter, logger, options)
  }

  beforeEach(() => {
    document.body.innerHTML = '<div id="users-created-at-filter"></div>'
    $.datepicker = { parseDate: (format, value) => new Date(value) }
  })

  it('does not throw when filter_plugin_options is absent', () => {
    const filter = build()
    expect(() => filter._date_or_empty_string('01/01/2020')).not.toThrow()
  })

  it('still parses a date when filter_plugin_options is absent', () => {
    const filter = build()
    expect(filter._date_or_empty_string('01/01/2020')).toBeInstanceOf(Date)
  })

  it('returns an empty string for an empty value', () => {
    const filter = build()
    expect(filter._date_or_empty_string('')).toBe('')
  })

  it('uses the configured date format when provided', () => {
    const seen = []
    $.datepicker = {
      parseDate: (format, value) => {
        seen.push(format)
        return new Date(value)
      },
    }
    build({ filter_plugin_options: { dateFormat: 'dd/mm/yy' } })._date_or_empty_string('01/01/2020')

    expect(seen).toEqual(['dd/mm/yy'])
  })
})

describe('WithDebug flag parsing', () => {
  const param = WithDebug.instance_methods._param

  function search(query) {
    window.history.replaceState({}, '', `/${query}`)
  }

  it('reads a flag set to true', () => {
    search('?dtf_debug_log=true')
    expect(param('dtf_debug_log')).toBe(true)
  })

  it('treats an explicit false as disabled', () => {
    search('?dtf_debug_log=false')
    expect(param('dtf_debug_log')).toBe(false)
  })

  it('treats a missing flag as disabled', () => {
    search('')
    expect(param('dtf_debug_log')).toBe(false)
  })

  it('treats an arbitrary value as disabled', () => {
    search('?dtf_debug_log=maybe')
    expect(param('dtf_debug_log')).toBe(false)
  })
})

describe('selected count rendering', () => {
  const update = WithCheckBoxes.instance_methods._update_select_all_global_count

  beforeEach(() => {
    document.body.innerHTML = '<div id="t_wrapper"><span class="selected-count"></span></div>'
  })

  const context = { dt_id: '#t', dtf_options: {} }

  it('renders the count', () => {
    update.call(context, 42)
    expect($('#selected-count-number').text()).toBe('42')
  })

  it('does not interpret a server-sent count as markup', () => {
    update.call(context, '<img src=x onerror="window.PWNED = true">')
    expect($('#t_wrapper img').length).toBe(0)
  })

  it('does not interpret a configured label as markup', () => {
    update.call({ dt_id: '#t', dtf_options: { selected_count_label: '<b>Total</b>' } }, 1)
    expect($('#t_wrapper b').length).toBe(0)
  })
})

describe('filter icons', () => {
  const prepend = Loader.instance_methods._prepend_filter_icons

  beforeEach(() => {
    document.body.innerHTML =
      '<form><div id="users-name-filter"><div class="input-group"></div></div></form>'
  })

  function run(icon) {
    prepend.call({ filters: [{ filter_container_id: 'users-name-filter', icon: icon }] }, $('form'))
  }

  it('prepends the icon element', () => {
    run('magnifying-glass')
    expect($('.dtf-filter-icon i').attr('class')).toBe('fa-solid fa-magnifying-glass')
  })

  it('is a no-op when no icon is declared', () => {
    prepend.call({ filters: [{ filter_container_id: 'users-name-filter' }] }, $('form'))
    expect($('.dtf-filter-icon').length).toBe(0)
  })

  it('rejects an icon name carrying markup', () => {
    run('x"><img src=y onerror="window.PWNED = true">')
    expect($('form img').length).toBe(0)
  })

  it('does not add the icon twice', () => {
    run('magnifying-glass')
    run('magnifying-glass')
    expect($('.dtf-filter-icon').length).toBe(1)
  })
})
