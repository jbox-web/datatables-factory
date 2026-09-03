import DatatableFilter from '../../src/model/datatable_filter.coffee'
import DateFilter from '../../src/model/filters/date_filter.coffee'
import RangeNumberSliderFilter from '../../src/model/filters/range_number_slider_filter.coffee'

function buildLogger() {
  return { info: jest.fn(), warn: jest.fn(), error: jest.fn(), dump: jest.fn() }
}

function buildDatatable() {
  return {
    dt_id: '#users-datatable',
    dt_id_strip: 'users-datatable',
    dt_class: 'Datatables.UsersDatatable',
    datatable: {
      state: { loaded: () => null, save: jest.fn() },
      draw: jest.fn(),
      columns: () => ({ search: () => ({ draw: jest.fn() }) }),
      context: [{ aoPreSearchCols: [{}, {}, {}, {}] }],
    },
  }
}

function build(filters, logger = buildLogger()) {
  document.body.innerHTML = '<div id="users-role-filter"></div><div id="users-name-filter"></div>'
  const datatableFilter = new DatatableFilter(buildDatatable(), filters, [], logger)
  datatableFilter._load_filters()
  return datatableFilter
}

const textFilter = {
  column_id: 1,
  filter_type: 'text',
  filter_default_label: 'Name',
  filter_container_id: 'users-name-filter',
}

const unknownFilter = {
  column_id: 3,
  filter_type: 'carrier_pigeon',
  filter_default_label: 'Role',
  filter_container_id: 'users-role-filter',
}

const dateFilter = {
  column_id: 3,
  filter_type: 'date',
  filter_default_label: 'Created at',
  filter_container_id: 'users-role-filter',
}

const sliderFilter = {
  column_id: 3,
  filter_type: 'range_number_slider',
  filter_default_label: ['Min', 'Max'],
  filter_container_id: 'users-role-filter',
  filter_range_min: 0,
  filter_range_max: 120,
}

describe('DatatableFilter', () => {
  // Both types reach a peer library the specs do not load; each degrades to a
  // plain input, so building them here needs no stub.
  describe('dispatching on filter_type', () => {
    it('builds a DateFilter for a date filter', () => {
      const subject = build([dateFilter])
      expect(subject.find_by_column_id(3)).toBeInstanceOf(DateFilter)
    })

    it('builds a RangeNumberSliderFilter for a range_number_slider filter', () => {
      const subject = build([sliderFilter])
      expect(subject.find_by_column_id(3)).toBeInstanceOf(RangeNumberSliderFilter)
    })
  })

  // A date carries a single value like a text filter; a slider carries the two
  // bounds of the range it is a UI for.
  describe('the shape a URL filter is restored into', () => {
    const entry = { values: ['20-dtf_delim-40'], parts: {} }

    it('gives a date filter the single-value shape', () => {
      const subject = build([dateFilter])
      expect(subject._url_filter_state(dateFilter, { values: ['01/01/2024'], parts: {} }))
        .toEqual({ value: '01/01/2024' })
    })

    it('gives a slider filter the two bounds', () => {
      const subject = build([sliderFilter])
      expect(subject._url_filter_state(sliderFilter, entry)).toEqual({ from: '20', to: '40' })
    })

    it('sends a slider filter to the server in the delimited form', () => {
      const subject = build([sliderFilter])
      expect(subject._url_search_value(sliderFilter, entry)).toBe('20-dtf_delim-40')
    })
  })

  describe('loading filters', () => {
    it('indexes a known filter by column id', () => {
      const subject = build([textFilter])
      expect(subject.find_by_column_id(1)).toBeTruthy()
    })

    it('does not index a filter whose type is unknown', () => {
      const subject = build([unknownFilter])
      expect(subject.find_by_column_id(3)).toBeUndefined()
    })

    it('reports the unknown filter type', () => {
      const logger = buildLogger()
      build([unknownFilter], logger)
      expect(logger.error.mock.calls.join(' ')).toMatch(/carrier_pigeon/)
    })

    it('still loads the valid filters alongside an invalid one', () => {
      const subject = build([textFilter, unknownFilter])
      expect(subject.find_by_column_id(1)).toBeTruthy()
    })
  })

  describe('redraw with an unknown filter type declared', () => {
    it('does not throw when the server sends dropdown data', () => {
      const subject = build([textFilter, unknownFilter])
      const json = { dt_filter_data_3: [{ value: 'admin', label: 'Admin' }] }

      expect(() => subject._dt_on_draw({}, {}, json)).not.toThrow()
    })

    it('does not throw when resetting filters', () => {
      const subject = build([textFilter, unknownFilter])
      expect(() => subject.reset_filters({ type: 'click' })).not.toThrow()
    })

    it('does not throw on destroy', () => {
      const subject = build([textFilter, unknownFilter])
      expect(() => subject.destroy()).not.toThrow()
    })
  })

  // The "does not throw" examples above cannot see the dispatch itself: they
  // load a TextFilter, and until every filter got one, destroy?() there resolved
  // to nothing.
  describe('destroy', () => {
    it('destroys each filter it had loaded', () => {
      const subject = build([dateFilter])
      const destroyed = jest.spyOn(subject.find_by_column_id(3), 'destroy')

      subject.destroy()

      expect(destroyed).toHaveBeenCalled()
    })

    it('forgets them afterwards', () => {
      const subject = build([textFilter])

      subject.destroy()

      expect(subject.find_by_column_id(1)).toBeUndefined()
    })

    // The state write is debounced, so there is always a window in which one is
    // scheduled. Left running it calls state.save() on a table that is gone.
    it('cancels a state save still pending', () => {
      jest.useFakeTimers()
      try {
        const subject = build([textFilter])
        const save = subject.instance.state.save
        subject.save_state(1, { value: 'x' })

        subject.destroy()
        jest.advanceTimersByTime(500)

        expect(save).not.toHaveBeenCalled()
      } finally {
        jest.useRealTimers()
      }
    })
  })

  describe('state persistence without a datatable instance', () => {
    it('reports that the state cannot be saved', () => {
      const logger = buildLogger()
      const subject = build([textFilter], logger)
      subject.instance = null

      subject.save_state(1, { value: 'x' })
      expect(logger.error.mock.calls.join(' ')).toMatch(/save_state/)
    })
  })
})
