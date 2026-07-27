import SelectFilter from '../../../src/model/filters/select_filter.coffee'
import SelectMultiFilter from '../../../src/model/filters/select_multi_filter.coffee'

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

function render(filter) {
  const select = $('<select></select>')
  select.append(filter._select_options())
  return select
}

describe('select filter option rendering', () => {
  describe('SelectFilter', () => {
    it('renders the placeholder plus one option per entry', () => {
      const filter = buildFilter(SelectFilter)
      filter.dropdown_data = [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ]

      expect(render(filter).find('option').length).toBe(3)
    })

    it('keeps values and labels intact', () => {
      const filter = buildFilter(SelectFilter)
      filter.dropdown_data = [{ value: 'admin', label: 'Admin' }]

      const option = render(filter).find('option').last()
      expect(option.val()).toBe('admin')
      expect(option.text()).toBe('Admin')
    })

    it('does not let a label break out of the option element', () => {
      const filter = buildFilter(SelectFilter)
      filter.dropdown_data = [
        { value: 'admin', label: '</option><option value="x" onmouseover="window.PWNED = true">boom' },
      ]

      const select = render(filter)
      expect(select.find('[onmouseover]').length).toBe(0)
      expect(select.find('option').length).toBe(2)
    })

    it('renders an injected label as literal text', () => {
      const filter = buildFilter(SelectFilter)
      const label = '</option><option>boom'
      filter.dropdown_data = [{ value: 'admin', label: label }]

      expect(render(filter).find('option').last().text()).toBe(label)
    })

    it('does not let a value inject an attribute', () => {
      const filter = buildFilter(SelectFilter)
      filter.dropdown_data = [{ value: '" onmouseover="window.PWNED = true', label: 'Admin' }]

      const select = render(filter)
      expect(select.find('[onmouseover]').length).toBe(0)
      expect(select.find('option').last().val()).toBe('" onmouseover="window.PWNED = true')
    })

    it('does not let the default label inject markup', () => {
      const filter = buildFilter(SelectFilter, {
        filter_default_label: '<img src=x onerror="window.PWNED = true">',
      })
      filter.dropdown_data = []

      const select = render(filter)
      expect(select.find('img').length).toBe(0)
      expect(select.find('option').length).toBe(1)
    })
  })

  describe('SelectMultiFilter', () => {
    it('renders one option per entry and no placeholder', () => {
      const filter = buildFilter(SelectMultiFilter)
      filter.dropdown_data = [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ]

      expect(render(filter).find('option').length).toBe(2)
    })

    it('renders nothing when there is no dropdown data', () => {
      const filter = buildFilter(SelectMultiFilter)
      expect(render(filter).find('option').length).toBe(0)
    })

    it('does not let a label break out of the option element', () => {
      const filter = buildFilter(SelectMultiFilter)
      filter.dropdown_data = [
        { value: 'admin', label: '</option><option value="x" onmouseover="window.PWNED = true">boom' },
      ]

      const select = render(filter)
      expect(select.find('[onmouseover]').length).toBe(0)
      expect(select.find('option').length).toBe(1)
    })
  })
})
