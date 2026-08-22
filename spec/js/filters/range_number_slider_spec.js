import RangeNumberSliderFilter from '../../../src/model/filters/range_number_slider_filter.coffee'
import {
  buildDatatableFilter,
  buildLogger,
  filterOptions,
  renderContainer,
  resetDom,
  stubNoUiSlider,
  unstubNoUiSlider,
} from '../support/filter_helpers'

const BOUNDS = {
  filter_default_label: ['Min', 'Max'],
  filter_range_min: 0,
  filter_range_max: 120,
}

function build({ datatableFilter, options } = {}) {
  const owner = datatableFilter || buildDatatableFilter()
  const filter = new RangeNumberSliderFilter(
    owner,
    buildLogger(),
    filterOptions(Object.assign({}, BOUNDS, options))
  )
  return { filter, owner }
}

// create_html then bind_inputs is what BaseFilter#bind does; restore_state comes
// after, which is why the state specs call all three in order.
function load(built) {
  built.filter.create_html()
  built.filter.bind_inputs()
  return built
}

describe('RangeNumberSliderFilter', () => {
  let sliders

  beforeEach(() => {
    renderContainer()
    sliders = stubNoUiSlider()
  })

  afterEach(() => {
    unstubNoUiSlider()
    resetDom()
  })

  describe('rendering', () => {
    it('adds a slider container inside the inner wrapper', () => {
      const { filter } = build()
      filter.create_html()

      expect($(`#${filter.wrapper_inner_id} #${filter.slider_id}`).length).toBe(1)
    })

    it('keeps the two inputs the rest of the plumbing reads from', () => {
      const { filter } = build()
      filter.create_html()

      expect($(`#${filter.from_id}`).length).toBe(1)
      expect($(`#${filter.to_id}`).length).toBe(1)
    })
  })

  describe('the slider it builds', () => {
    it('hands the declared bounds to noUiSlider', () => {
      const { filter } = load(build())

      expect(sliders.length).toBe(1)
      expect(sliders[0].options.range).toEqual({ min: 0, max: 120 })
      expect(sliders[0].options.start).toEqual([0, 120])
    })

    it('defaults the step to 1 and honours a declared one', () => {
      expect(load(build()).filter && sliders[0].options.step).toBe(1)

      resetDom()
      renderContainer()
      sliders.length = 0
      load(build({ options: { filter_range_step: 5 } }))

      expect(sliders[0].options.step).toBe(5)
    })

    it('shows the values on the handles', () => {
      load(build())

      expect(sliders[0].options.tooltips).toBe(true)
    })

    // The two inputs stay in the DOM because they carry the value, but showing
    // them next to the slider would put two editable controls on screen for one
    // filter, free to disagree.
    it('hides the inputs and their separator', () => {
      const { filter } = load(build())

      expect($(`#${filter.from_id}`).css('display')).toBe('none')
      expect($(`#${filter.to_id}`).css('display')).toBe('none')
      expect($('.dtf-filter-range-number-separator').css('display')).toBe('none')
    })
  })

  describe('dragging the handles', () => {
    it('writes both bounds into the inputs', () => {
      const { filter } = load(build())

      sliders[0].drag([20, 40])

      expect($(`#${filter.from_id}`).val()).toBe('20')
      expect($(`#${filter.to_id}`).val()).toBe('40')
    })

    it('runs the filter in the delimited form range_number already uses', () => {
      const { owner } = load(build())

      sliders[0].drag([20, 40])

      expect(owner.filters).toEqual([{ column_id: 3, value: '20-dtf_delim-40' }])
    })

    it('saves the bounds as state', () => {
      const { owner } = load(build())

      sliders[0].drag([20, 40])

      expect(owner.saved).toEqual([{ column_id: 3, data: { from: 20, to: 40 } }])
    })

    it('drops the decimals the default formatter would add on an integer step', () => {
      const { filter } = load(build())

      sliders[0].drag([20, 40])

      expect($(`#${filter.from_id}`).val()).toBe('20')
    })

    it('keeps the decimals a fractional step calls for', () => {
      const { filter } = load(build({ options: { filter_range_step: 0.5 } }))

      sliders[0].drag([20.5, 40])

      expect($(`#${filter.from_id}`).val()).toBe('20.5')
    })
  })

  // Moving the handles from code must not look like a user filtering: it happens
  // on every state restore, and each one would otherwise cost a server round-trip.
  describe('moving the handles from code', () => {
    it('writes the inputs without running the filter', () => {
      const { filter, owner } = load(build())

      sliders[0].set([20, 40])

      expect($(`#${filter.from_id}`).val()).toBe('20')
      expect(owner.filters).toEqual([])
    })
  })

  describe('restoring a saved state', () => {
    it('moves the handles onto the saved bounds', () => {
      const owner = buildDatatableFilter({ state: { from: 20, to: 40 } })
      const { filter } = load(build({ datatableFilter: owner }))

      filter.restore_state()

      expect(sliders[0].values).toEqual([20, 40])
    })

    it('falls back to the declared bounds when a side was left open', () => {
      const owner = buildDatatableFilter({ state: { from: 20, to: '' } })
      const { filter } = load(build({ datatableFilter: owner }))

      filter.restore_state()

      expect(sliders[0].values).toEqual([20, 120])
    })
  })

  describe('resetting', () => {
    it('sends the handles back to the declared bounds', () => {
      const { filter } = load(build())
      sliders[0].drag([20, 40])

      filter._range_clear({})

      expect(sliders[0].values).toEqual([0, 120])
    })

    it('clears the search value', () => {
      const { filter, owner } = load(build())
      sliders[0].drag([20, 40])
      owner.filters.length = 0

      filter._range_clear({})

      expect(owner.filters).toEqual([{ column_id: 3, value: '-dtf_delim-' }])
    })
  })

  describe('teardown', () => {
    it('destroys the slider', () => {
      const { filter } = load(build())

      filter.destroy()

      expect(sliders[0].destroyed).toBe(true)
    })
  })

  // noUiSlider is a peer the host may not have loaded. Losing the slider must
  // leave a working numeric range, not a dead filter.
  describe('without noUiSlider', () => {
    beforeEach(unstubNoUiSlider)

    it('reports it instead of throwing', () => {
      const { filter } = build()
      filter.create_html()
      filter.logger.error = jest.fn()

      expect(() => filter.bind_inputs()).not.toThrow()
      expect(filter.logger.error).toHaveBeenCalledWith(expect.stringMatching(/noUiSlider/i))
    })

    it('leaves the inputs visible', () => {
      const { filter } = load(build())

      expect($(`#${filter.from_id}`).css('display')).not.toBe('none')
    })

    it('still filters from the keyboard', () => {
      const { filter, owner } = load(build())
      $(`#${filter.from_id}`).val('20')

      filter._range_change({ keyCode: 48 })

      expect(owner.filters).toEqual([{ column_id: 3, value: '20-dtf_delim-' }])
    })

    it('does not throw on destroy either', () => {
      const { filter } = load(build())

      expect(() => filter.destroy()).not.toThrow()
    })
  })
})
