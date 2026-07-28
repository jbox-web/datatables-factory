import DatatableFilter from '../../src/model/datatable_filter.coffee'
import WithFilters from '../../src/modules/with_filters.coffee'

const RANGE_DELIMITER = '-yadcf_delim-'

const logger = { info() {}, warn() {}, error() {}, dump() {} }

const COLUMNS = [{ data: 'first_name' }, { data: 'role' }, { data: 'age' }, { data: 'email' }]

const TEXT_FILTER = {
  column_id: 0,
  filter_type: 'text',
  filter_default_label: 'First name',
  filter_container_id: 'users-first-name-filter',
}

const MULTI_FILTER = {
  column_id: 1,
  filter_type: 'multi_select',
  filter_default_label: 'Role',
  filter_container_id: 'users-role-filter',
  filter_plugin: 'native',
}

const RANGE_FILTER = {
  column_id: 2,
  filter_type: 'range_number',
  filter_default_label: ['Min', 'Max'],
  filter_container_id: 'users-age-filter',
}

const TEXT_INPUT = '#yadcf-filter-users-datatable-0'
const MULTI_SELECT = '#yadcf-filter-users-datatable-1'
const RANGE_FROM = '#yadcf-filter-users-datatable-from-number-2'
const RANGE_TO = '#yadcf-filter-users-datatable-to-number-2'

// Mirrors the real resolution path: find_filter_by_name comes from the shipped
// WithFilters module, only find_column_by_name (DatatableBase) is stubbed.
function buildDatatable(filters, saved_state) {
  return Object.assign(
    {
      dt_id: '#users-datatable',
      dt_id_strip: 'users-datatable',
      dt_class: 'Datatables.UsersDatatable',
      columns: COLUMNS,
      filters: filters,
      find_column_by_name(name) {
        const i = this.columns.findIndex((c) => c.data === name)
        return i >= 0 ? [i, this.columns[i]] : null
      },
      datatable: {
        state: { loaded: () => saved_state, save: jest.fn() },
        draw: jest.fn(),
        columns: () => ({ search: () => ({ draw: jest.fn() }) }),
        context: [{ aoPreSearchCols: [{}, {}, {}, {}] }],
      },
    },
    WithFilters.instance_methods
  )
}

function build(filters, search, options = {}) {
  window.history.replaceState({}, '', `/filters${search || ''}`)

  document.body.innerHTML = filters
    .map((filter) => `<div id="${filter.filter_container_id}"></div>`)
    .join('')

  const datatable = buildDatatable(filters, options.saved_state || null)
  const subject = new DatatableFilter(datatable, filters, options.filters_applied || [], logger)
  subject.load()

  return { subject: subject, datatable: datatable }
}

function search_value(datatable, column_id) {
  return datatable.datatable.context[0].aoPreSearchCols[column_id].search
}

describe('filters pre-applied from the URL', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('text filter', () => {
    it('fills the input with the value read from the URL', () => {
      build([TEXT_FILTER], '?dt_filters[first_name]=Alice')
      expect($(TEXT_INPUT).val()).toBe('Alice')
    })

    it('marks the input as in use', () => {
      build([TEXT_FILTER], '?dt_filters[first_name]=Alice')
      expect($(TEXT_INPUT).hasClass('inuse')).toBe(true)
    })

    it('sets the column search value so the first draw filters server-side', () => {
      const { datatable } = build([TEXT_FILTER], '?dt_filters[first_name]=Alice')
      expect(search_value(datatable, 0)).toBe('Alice')
    })

    it('decodes percent-encoded values', () => {
      build([TEXT_FILTER], '?dt_filters%5Bfirst_name%5D=Ali%20ce')
      expect($(TEXT_INPUT).val()).toBe('Ali ce')
    })

    it('does not trigger an extra draw', () => {
      const { datatable } = build([TEXT_FILTER], '?dt_filters[first_name]=Alice')
      expect(datatable.datatable.draw).not.toHaveBeenCalled()
    })
  })

  describe('multi select filter', () => {
    it('selects every value given as an array', () => {
      build([MULTI_FILTER], '?dt_filters[role][]=admin&dt_filters[role][]=user')
      // The options only exist after the first xhr; the state is what matters here.
      expect($(MULTI_SELECT).length).toBe(1)
    })

    it('stores the values as an array in the filter state', () => {
      const { subject } = build([MULTI_FILTER], '?dt_filters[role][]=admin&dt_filters[role][]=user')
      expect(subject.has_state_for(1)).toEqual({ value: ['admin', 'user'] })
    })

    it('joins the values the way the server expects them', () => {
      const { datatable } = build([MULTI_FILTER], '?dt_filters[role][]=admin&dt_filters[role][]=user')
      expect(search_value(datatable, 1)).toBe('admin|user')
    })

    it('accepts a single value without the array brackets', () => {
      const { subject } = build([MULTI_FILTER], '?dt_filters[role]=admin')
      expect(subject.has_state_for(1)).toEqual({ value: ['admin'] })
    })
  })

  describe('range filter', () => {
    it('fills both bounds from a delimited value', () => {
      build([RANGE_FILTER], `?dt_filters[age]=20${RANGE_DELIMITER}40`)
      expect([$(RANGE_FROM).val(), $(RANGE_TO).val()]).toEqual(['20', '40'])
    })

    it('sends the bounds back with the delimiter the server splits on', () => {
      const { datatable } = build([RANGE_FILTER], `?dt_filters[age]=20${RANGE_DELIMITER}40`)
      expect(search_value(datatable, 2)).toBe(`20${RANGE_DELIMITER}40`)
    })

    it('accepts the bounds as from/to sub-keys', () => {
      build([RANGE_FILTER], '?dt_filters[age][from]=20&dt_filters[age][to]=40')
      expect([$(RANGE_FROM).val(), $(RANGE_TO).val()]).toEqual(['20', '40'])
    })

    it('accepts an open-ended range', () => {
      const { datatable } = build([RANGE_FILTER], '?dt_filters[age][from]=20')
      expect([$(RANGE_FROM).val(), $(RANGE_TO).val()]).toEqual(['20', ''])
      expect(search_value(datatable, 2)).toBe(`20${RANGE_DELIMITER}`)
    })
  })

  describe('unresolvable columns', () => {
    it('ignores a column that does not exist', () => {
      expect(() => build([TEXT_FILTER], '?dt_filters[unknown]=x')).not.toThrow()
    })

    it('ignores a column declared without a filter', () => {
      const { subject } = build([TEXT_FILTER], '?dt_filters[email]=x@y.z')
      expect(subject.has_state_for(3)).toBeNull()
    })

    it('still applies the filters it could resolve', () => {
      build([TEXT_FILTER], '?dt_filters[unknown]=x&dt_filters[first_name]=Alice')
      expect($(TEXT_INPUT).val()).toBe('Alice')
    })

    it('ignores query parameters that are not filters', () => {
      const { subject } = build([TEXT_FILTER], '?page=2&first_name=Alice')
      expect(subject.has_state_for(0)).toBeNull()
    })
  })

  describe('precedence', () => {
    // Rebuilt per example: the filter state is the very object DataTables hands
    // back, and seeding writes into it.
    function saved_state() {
      return { dt_filters_state: { 'users-datatable': { 0: { value: 'Bob' } } } }
    }

    it('overrides the saved DataTables state', () => {
      build([TEXT_FILTER], '?dt_filters[first_name]=Alice', { saved_state: saved_state() })
      expect($(TEXT_INPUT).val()).toBe('Alice')
    })

    it('keeps the saved state for the columns the URL does not name', () => {
      build([TEXT_FILTER], '?dt_filters[unknown]=x', { saved_state: saved_state() })
      expect($(TEXT_INPUT).val()).toBe('Bob')
    })

    it('keeps the saved state when the URL carries no filter at all', () => {
      build([TEXT_FILTER], '', { saved_state: saved_state() })
      expect($(TEXT_INPUT).val()).toBe('Bob')
    })

    it('overrides a default filter declared server-side', () => {
      const { subject } = build([TEXT_FILTER], '?dt_filters[first_name]=Alice')
      subject.apply_default_filters({ type: 'init' })
      expect($(TEXT_INPUT).val()).toBe('Alice')
    })

    it('still applies the default filters of the other columns', () => {
      const filters_applied = [
        { column_id: 0, value: 'Bob' },
        { column_id: 1, value: ['admin'] },
      ]
      const { subject } = build([TEXT_FILTER, MULTI_FILTER], '?dt_filters[first_name]=Alice', {
        filters_applied: filters_applied,
      })
      subject.apply_default_filters({ type: 'init' })

      expect($(TEXT_INPUT).val()).toBe('Alice')
      expect(subject.has_state_for(1)).toEqual({ value: ['admin'] })
    })
  })
})
