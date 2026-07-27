import DatatableFilter from '../../src/model/datatable_filter.coffee'

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

describe('DatatableFilter', () => {
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
