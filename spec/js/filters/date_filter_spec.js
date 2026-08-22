import DateFilter from '../../../src/model/filters/date_filter.coffee'
import {
  buildDatatableFilter,
  buildLogger,
  filterOptions,
  renderContainer,
  resetDom,
  stubDatepicker,
  stubFlatpickr,
  unstubDatepicker,
  unstubFlatpickr,
} from '../support/filter_helpers'

function build({ datatableFilter, options } = {}) {
  const owner = datatableFilter || buildDatatableFilter()
  const filter = new DateFilter(
    owner,
    buildLogger(),
    filterOptions(Object.assign({ filter_default_label: 'Created at' }, options))
  )
  return { filter, owner }
}

// keyup handlers read event.keyCode; the arrow keys are the documented no-ops.
function keyEvent(keyCode = 65) {
  return { keyCode }
}

const FLATPICKR = {
  filter_plugin: 'flatpickr',
  filter_plugin_options: { dateFormat: 'd/m/Y' },
}

describe('DateFilter', () => {
  let datepickerCalls

  beforeEach(() => {
    renderContainer()
    datepickerCalls = stubDatepicker()
  })

  afterEach(() => {
    unstubDatepicker()
    resetDom()
  })

  describe('rendering', () => {
    it('renders one text input and the reset button, with the label as placeholder', () => {
      const { filter } = build()
      filter.create_html()

      const input = $(`#${filter.input_id}`)
      expect(input.length).toBe(1)
      expect(input.attr('type')).toBe('text')
      expect(input.attr('placeholder')).toBe('Created at')
      expect($(`#${filter.reset_id}`).length).toBe(1)
    })
  })

  // The wire format is the raw value, on the same path as a text filter — no
  // delimiter, nothing for the server to learn. What a date filter owes on top
  // is that a half-typed date is not a criterion.
  describe('the value it sends', () => {
    it('sends the typed date once it parses', () => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('01/01/2024')

      filter._text_change(keyEvent())

      expect(owner.filters).toEqual([{ column_id: 3, value: '01/01/2024' }])
    })

    it('sends nothing while the date is still incomplete', () => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('01/0')

      filter._text_change(keyEvent())

      expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
    })

    it('marks the input in use only for a parsable date', () => {
      const { filter } = build()
      filter.create_html()

      $(`#${filter.input_id}`).val('01/0')
      filter._text_change(keyEvent())
      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(false)

      $(`#${filter.input_id}`).val('01/01/2024')
      filter._text_change(keyEvent())
      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(true)
    })

    // Storing the half-typed text would restore an input that filters nothing
    // on the next page load, with no way for the user to tell.
    it('saves the searchable value, not the partial input', () => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('01/0')

      filter._text_change(keyEvent())

      expect(owner.saved).toEqual([{ column_id: 3, data: { value: '' } }])
    })
  })

  describe('with jQuery UI', () => {
    it('attaches the datepicker to the input', () => {
      const { filter } = build()
      filter.create_html()

      filter.bind_inputs()

      expect(datepickerCalls.length).toBe(1)
      expect(datepickerCalls[0].elements[0].id).toBe(filter.input_id)
    })

    // A pick fires no keyup, so the keyup handler alone would leave the table
    // showing the previous result until the next keystroke.
    it('runs the filter when a date is picked', () => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('01/01/2024')

      filter._date_select('01/01/2024', {})

      expect(owner.filters).toEqual([{ column_id: 3, value: '01/01/2024' }])
    })
  })

  describe('with flatpickr', () => {
    let pickers

    beforeEach(() => {
      pickers = stubFlatpickr()
    })

    afterEach(() => {
      unstubFlatpickr()
    })

    it('attaches flatpickr to the input and leaves jQuery UI alone', () => {
      const { filter } = build({ options: FLATPICKR })
      filter.create_html()

      filter.bind_inputs()

      expect(pickers.length).toBe(1)
      expect(datepickerCalls.length).toBe(0)
    })

    it('carries the declared date format over to flatpickr', () => {
      const { filter } = build({ options: FLATPICKR })
      filter.create_html()

      filter.bind_inputs()

      expect(pickers[0].options.dateFormat).toBe('d/m/Y')
    })

    it('runs the filter when a date is picked', () => {
      const { filter, owner } = build({ options: FLATPICKR })
      filter.create_html()
      filter.bind_inputs()
      $(`#${filter.input_id}`).val('01/01/2024')

      pickers[0].options.onChange([], '01/01/2024')

      expect(owner.filters).toEqual([{ column_id: 3, value: '01/01/2024' }])
    })

    it('does not throw on destroy', () => {
      const { filter } = build({ options: FLATPICKR })
      filter.create_html()
      filter.bind_inputs()

      expect(() => filter.destroy()).not.toThrow()
      expect(pickers[0].destroyed).toBe(true)
    })

    describe('declared but not loaded', () => {
      beforeEach(unstubFlatpickr)

      it('reports it instead of throwing', () => {
        const { filter } = build({ options: FLATPICKR })
        filter.create_html()
        filter.logger.error = jest.fn()

        expect(() => filter.bind_inputs()).not.toThrow()
        expect(filter.logger.error).toHaveBeenCalledWith(expect.stringMatching(/flatpickr/i))
      })

      it('still filters from the keyboard', () => {
        const { filter, owner } = build({ options: FLATPICKR })
        filter.create_html()
        filter.bind_inputs()
        $(`#${filter.input_id}`).val('01/01/2024')

        filter._text_change(keyEvent())

        expect(owner.filters).toEqual([{ column_id: 3, value: '01/01/2024' }])
      })
    })
  })

  // Same reasoning as the range filter: a host shipping neither library must not
  // lose the whole table's initialisation to one field.
  describe('without jQuery UI', () => {
    it('reports the missing datepicker instead of throwing', () => {
      const { filter } = build()
      filter.create_html()
      filter.logger.error = jest.fn()
      unstubDatepicker()

      expect(() => filter.bind_inputs()).not.toThrow()
      expect(filter.logger.error).toHaveBeenCalledWith(expect.stringMatching(/datepicker/i))
    })

    it('does not throw on destroy either', () => {
      const { filter } = build()
      filter.create_html()
      unstubDatepicker()
      filter.bind_inputs()

      expect(() => filter.destroy()).not.toThrow()
    })

    it('still filters from the keyboard', () => {
      const { filter, owner } = build()
      filter.create_html()
      unstubDatepicker()
      filter.bind_inputs()
      $(`#${filter.input_id}`).val('01/01/2024')

      filter._text_change(keyEvent())

      expect(owner.filters).toEqual([{ column_id: 3, value: '01/01/2024' }])
    })
  })
})
