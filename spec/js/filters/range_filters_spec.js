import RangeDateFilter from '../../../src/model/filters/range_date_filter.coffee'
import RangeNumberFilter from '../../../src/model/filters/range_number_filter.coffee'
import {
  buildDatatableFilter,
  buildLogger,
  filterOptions,
  renderContainer,
  resetDom,
  stubDatepicker,
  unstubDatepicker,
} from '../support/filter_helpers'

const RANGE_LABELS = ['From', 'To']

function build(Klass, { datatableFilter, options } = {}) {
  const owner = datatableFilter || buildDatatableFilter()
  const filter = new Klass(
    owner,
    buildLogger(),
    filterOptions(Object.assign({ filter_default_label: RANGE_LABELS }, options))
  )
  return { filter, owner }
}

// keyup handlers read event.keyCode; the arrow keys are the documented no-ops.
function keyEvent(keyCode = 65) {
  return { keyCode }
}

describe('range filters', () => {
  beforeEach(() => {
    renderContainer()
    stubDatepicker()
  })

  afterEach(() => {
    unstubDatepicker()
    resetDom()
  })

  describe('RangeBase, through RangeNumberFilter', () => {
    it('renders both inputs, the separator and the reset button', () => {
      const { filter } = build(RangeNumberFilter)
      filter.create_html()

      expect($(`#${filter.from_id}`).length).toBe(1)
      expect($(`#${filter.to_id}`).length).toBe(1)
      expect($(`#${filter.reset_id}`).length).toBe(1)
      expect($('.yadcf-filter-range-number-seperator').length).toBe(1)
    })

    it('uses the two labels as the placeholders, in order', () => {
      const { filter } = build(RangeNumberFilter)
      filter.create_html()

      expect($(`#${filter.from_id}`).attr('placeholder')).toBe('From')
      expect($(`#${filter.to_id}`).attr('placeholder')).toBe('To')
    })

    // Password managers inject autofill into anything that looks like a form
    // field; the attributes have to land on the element, not in jQuery's
    // options hash where 'autocomplete' would call jQuery UI's method instead.
    it('marks both inputs as off-limits for autofill', () => {
      const { filter } = build(RangeNumberFilter)
      filter.create_html()

      const from = $(`#${filter.from_id}`)
      expect(from.attr('autocomplete')).toBe('off')
      expect(from.attr('data-bwignore')).toBe('1')
      expect(from.attr('data-lpignore')).toBe('true')
      expect(from.attr('data-1p-ignore')).toBe('')
    })

    it('omits the reset button when filter_reset_button is false', () => {
      const { filter } = build(RangeNumberFilter, { options: { filter_reset_button: false } })
      filter.create_html()

      expect($(`#${filter.reset_id}`).length).toBe(0)
    })

    it('defaults the range delimiter to yadcf’s and honours an override', () => {
      expect(build(RangeNumberFilter).filter.range_delimiter).toBe('-yadcf_delim-')

      const { filter } = build(RangeNumberFilter, {
        options: { filter_range_delimiter: '..' },
      })
      expect(filter.range_delimiter).toBe('..')
    })

    it('reads the current value from both inputs', () => {
      const { filter } = build(RangeNumberFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('10')
      $(`#${filter.to_id}`).val('20')

      expect(filter.current_value()).toEqual({ from: '10', to: '20' })
    })

    it('restores a saved range and marks only the non-empty side as in use', () => {
      const owner = buildDatatableFilter({ state: { from: '10', to: '' } })
      const { filter } = build(RangeNumberFilter, { datatableFilter: owner })
      filter.create_html()

      filter.restore_state()

      expect($(`#${filter.from_id}`).val()).toBe('10')
      expect($(`#${filter.from_id}`).hasClass('inuse')).toBe(true)
      expect($(`#${filter.to_id}`).hasClass('inuse')).toBe(false)
    })

    it('leaves the inputs alone when there is no saved state', () => {
      const { filter } = build(RangeNumberFilter)
      filter.create_html()

      filter.restore_state()

      expect($(`#${filter.from_id}`).val()).toBe('')
      expect($(`#${filter.from_id}`).hasClass('inuse')).toBe(false)
    })

    it('clears both inputs, the search value and the saved state on reset', () => {
      const { filter, owner } = build(RangeNumberFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('10').addClass('inuse')
      $(`#${filter.to_id}`).val('20').addClass('inuse')

      filter.reset({})

      expect($(`#${filter.from_id}`).val()).toBe('')
      expect($(`#${filter.from_id}`).hasClass('inuse')).toBe(false)
      expect(owner.searches).toEqual([{ column_id: 3, value: '' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: undefined }])
    })

    it('does nothing when the reset button is clicked on an already empty range', () => {
      const { filter, owner } = build(RangeNumberFilter)
      filter.create_html()

      filter._range_clear({})

      expect(owner.filters).toEqual([])
      expect(owner.saved).toEqual([])
    })

    it('runs the filter with a bare delimiter when clearing a filled range', () => {
      const { filter, owner } = build(RangeNumberFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('10')

      filter._range_clear({})

      expect(owner.filters).toEqual([{ column_id: 3, value: '-yadcf_delim-' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { from: '', to: '' } }])
    })

    describe('the bound handlers', () => {
      it('filters on keyup in either bound', () => {
        jest.useFakeTimers()
        try {
          const { filter, owner } = build(RangeNumberFilter)
          filter.create_html()
          filter.bind_inputs()

          $(`#${filter.from_id}`).val('10').trigger($.Event('keyup', { keyCode: 48 }))
          jest.runAllTimers()
          expect(owner.filters).toEqual([{ column_id: 3, value: '10-yadcf_delim-' }])

          $(`#${filter.to_id}`).val('20').trigger($.Event('keyup', { keyCode: 48 }))
          jest.runAllTimers()
          expect(owner.filters[1]).toEqual({ column_id: 3, value: '10-yadcf_delim-20' })
        } finally {
          jest.useRealTimers()
        }
      })

      it('clears the range when the reset button is clicked', () => {
        const { filter, owner } = build(RangeNumberFilter)
        filter.create_html()
        filter.bind_inputs()
        $(`#${filter.from_id}`).val('10')

        $(`#${filter.reset_id}`).trigger('click')

        expect(owner.filters).toEqual([{ column_id: 3, value: '-yadcf_delim-' }])
      })

      // The filters sit in the table header: a click reaching it sorts the
      // column the user is trying to filter.
      it('keeps clicks inside the wrapper from sorting the column', () => {
        const { filter } = build(RangeNumberFilter)
        filter.create_html()

        const click = $.Event('click')
        $(`#${filter.wrapper_outer_id}`).trigger(click)
        expect(click.isPropagationStopped()).toBe(true)

        const down = $.Event('mousedown')
        $(`#${filter.wrapper_outer_id}`).trigger(down)
        expect(down.isPropagationStopped()).toBe(true)
      })

      it('keeps Enter in either bound from submitting the form', () => {
        const { filter } = build(RangeNumberFilter)
        filter.create_html()

        const from = $.Event('keydown', { keyCode: 13 })
        $(`#${filter.from_id}`).trigger(from)
        expect(from.isDefaultPrevented()).toBe(true)

        const to = $.Event('keydown', { keyCode: 13 })
        $(`#${filter.to_id}`).trigger(to)
        expect(to.isDefaultPrevented()).toBe(true)
      })

      it('dumps both bound ids when the debug option is on', () => {
        const logger = buildLogger()
        logger.info = jest.fn()
        const filter = new RangeNumberFilter(
          buildDatatableFilter(),
          logger,
          filterOptions({ filter_default_label: RANGE_LABELS, debug: true })
        )

        filter.bind()

        expect(logger.info).toHaveBeenCalledWith(`from_id: ${filter.from_id}`)
        expect(logger.info).toHaveBeenCalledWith(`to_id: ${filter.to_id}`)
      })
    })
  })

  describe('RangeNumberFilter', () => {
    it('sends both bounds joined by the delimiter', () => {
      const { filter, owner } = build(RangeNumberFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('10')
      $(`#${filter.to_id}`).val('20')

      filter._range_change(keyEvent())

      expect(owner.filters).toEqual([{ column_id: 3, value: '10-yadcf_delim-20' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { from: 10, to: 20 } }])
    })

    it('marks a bound as in use only while it holds a number', () => {
      const { filter } = build(RangeNumberFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('10')

      filter._range_change(keyEvent())
      expect($(`#${filter.from_id}`).hasClass('inuse')).toBe(true)
      expect($(`#${filter.to_id}`).hasClass('inuse')).toBe(false)

      $(`#${filter.from_id}`).val('')
      filter._range_change(keyEvent())
      expect($(`#${filter.from_id}`).hasClass('inuse')).toBe(false)
    })

    // Non-numeric input must degrade to an empty bound, not to NaN: "NaN" would
    // travel to the server as the search value.
    it('drops a non-numeric bound instead of sending NaN', () => {
      const { filter, owner } = build(RangeNumberFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('abc')
      $(`#${filter.to_id}`).val('20')

      filter._range_change(keyEvent())

      expect(owner.filters).toEqual([{ column_id: 3, value: '-yadcf_delim-20' }])
    })

    it.each([37, 38, 39, 40])('ignores arrow key %i', (keyCode) => {
      const { filter, owner } = build(RangeNumberFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('10')

      filter._range_change(keyEvent(keyCode))

      expect(owner.filters).toEqual([])
    })
  })

  describe('RangeDateFilter', () => {
    it('attaches a datepicker to both inputs', () => {
      const { filter } = build(RangeDateFilter)
      filter.create_html()
      const calls = stubDatepicker()

      filter.bind_inputs()

      expect(calls.length).toBe(2)
    })

    it('tears both datepickers down on destroy', () => {
      const { filter } = build(RangeDateFilter)
      filter.create_html()
      const calls = stubDatepicker()

      filter.destroy()

      expect(calls.map((call) => call.args[0])).toEqual(['destroy', 'destroy'])
    })

    it('sends both dates joined by the delimiter', () => {
      const { filter, owner } = build(RangeDateFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('01/01/2024')
      $(`#${filter.to_id}`).val('31/12/2024')

      filter._range_change(keyEvent())

      expect(owner.filters).toEqual([
        { column_id: 3, value: '01/01/2024-yadcf_delim-31/12/2024' },
      ])
      expect(owner.saved).toEqual([
        { column_id: 3, data: { from: '01/01/2024', to: '31/12/2024' } },
      ])
    })

    // A half-typed date parses as garbage on nearly every keystroke; sending it
    // would filter the table on a value the user never finished entering.
    it('drops a bound that does not parse as a date', () => {
      const { filter, owner } = build(RangeDateFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('01/0')
      $(`#${filter.to_id}`).val('31/12/2024')

      filter._range_change(keyEvent())

      expect(owner.filters).toEqual([{ column_id: 3, value: '-yadcf_delim-31/12/2024' }])
      expect($(`#${filter.from_id}`).hasClass('inuse')).toBe(false)
      expect($(`#${filter.to_id}`).hasClass('inuse')).toBe(true)
    })

    it('reports an empty input as empty rather than as a parse error', () => {
      const { filter } = build(RangeDateFilter)

      expect(filter._date_or_empty_string('')).toBe('')
    })

    // The filter may be declared without filter_plugin_options at all, which is
    // why the date format is read through a guarded access with a default.
    it('falls back to dd/mm/yy when no date format was configured', () => {
      const { filter } = build(RangeDateFilter)

      expect(filter._date_or_empty_string('01/01/2024')).toBeInstanceOf(Date)
    })

    // Picking a start date must bound the end picker, and vice versa, so the
    // user cannot build a range that ends before it starts.
    it('bounds each picker with the date chosen in the other', () => {
      const { filter } = build(RangeDateFilter)
      filter.create_html()
      const calls = stubDatepicker()

      filter.bind_inputs()

      calls[0].args[0].onClose('01/01/2024')
      calls[1].args[0].onClose('31/12/2024')

      const minDate = calls.find((call) => call.args[1] === 'minDate')
      const maxDate = calls.find((call) => call.args[1] === 'maxDate')
      expect(minDate.args).toEqual(['option', 'minDate', '01/01/2024'])
      expect(maxDate.args).toEqual(['option', 'maxDate', '31/12/2024'])
    })

    it.each([37, 38, 39, 40])('ignores arrow key %i', (keyCode) => {
      const { filter, owner } = build(RangeDateFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('01/01/2024')

      filter._range_change(keyEvent(keyCode))

      expect(owner.filters).toEqual([])
    })

    it('drops a bound that does not parse, on the end side too', () => {
      const { filter, owner } = build(RangeDateFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('01/01/2024')
      $(`#${filter.to_id}`).val('31/1')

      filter._range_change(keyEvent())

      expect(owner.filters).toEqual([{ column_id: 3, value: '01/01/2024-yadcf_delim-' }])
    })

    it('honours a configured date format', () => {
      const { filter } = build(RangeDateFilter, {
        options: { filter_plugin_options: { dateFormat: 'dd/mm/yy' } },
      })

      expect(filter._date_or_empty_string('01/01/2024')).toBeInstanceOf(Date)
    })

    it('sends the current range when the datepicker picks a date', () => {
      const { filter, owner } = build(RangeDateFilter)
      filter.create_html()
      $(`#${filter.from_id}`).val('01/01/2024')

      filter._date_select('01/01/2024', {})

      expect(owner.filters).toEqual([{ column_id: 3, value: '01/01/2024-yadcf_delim-' }])
    })
  })
})
