import SelectFilter from '../../../src/model/filters/select_filter.coffee'
import TextFilter from '../../../src/model/filters/text_filter.coffee'

const logger = { info() {}, warn() {}, error() {}, dump() {} }

const datatableFilter = {
  dt_class: 'Datatables.UsersDatatable',
  dt_id: 'users-datatable',
  has_state_for: () => null,
}

function buildFilter(Klass, overrides = {}) {
  const options = Object.assign(
    {
      column_id: 3,
      filter_default_label: 'Role',
      filter_container_id: 'users-role-filter',
      filter_plugin: 'native',
    },
    overrides
  )
  return new Klass(datatableFilter, logger, options)
}

// jQuery 4 dropped $.trim, so current_value must not depend on it. The
// surviving implementation has to keep $.trim's own contract: coerce to a
// string first, and map a missing element (val() === undefined) to ''.
describe('filter current_value without jQuery.trim', () => {
  afterEach(() => {
    $('body').empty()
  })

  describe('TextFilter', () => {
    it('trims the surrounding whitespace of the input value', () => {
      const filter = buildFilter(TextFilter)
      $('body').append(`<input id="${filter.input_id}" value="  admin  ">`)

      expect(filter.current_value()).toBe('admin')
    })

    it('returns an empty string when the input is absent', () => {
      const filter = buildFilter(TextFilter)

      expect(filter.current_value()).toBe('')
    })
  })

  describe('SelectFilter', () => {
    it('trims the selected option value', () => {
      const filter = buildFilter(SelectFilter)
      $('body').append(
        `<select id="${filter.select_id}"><option value="  admin  " selected></option></select>`
      )

      expect(filter.current_value()).toBe('admin')
    })

    it('returns an empty string when the select is absent', () => {
      const filter = buildFilter(SelectFilter)

      expect(filter.current_value()).toBe('')
    })
  })
})
