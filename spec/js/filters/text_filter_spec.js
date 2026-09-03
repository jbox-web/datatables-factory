import TextFilter from '../../../src/model/filters/text_filter.coffee'
import {
  buildDatatableFilter,
  buildLogger,
  filterOptions,
  renderContainer,
  resetDom,
} from '../support/filter_helpers'

function build({ datatableFilter, options } = {}) {
  const owner = datatableFilter || buildDatatableFilter()
  const filter = new TextFilter(owner, buildLogger(), filterOptions(options))
  return { filter, owner }
}

function keyEvent(keyCode = 65) {
  return { keyCode }
}

describe('TextFilter', () => {
  beforeEach(renderContainer)
  afterEach(resetDom)

  describe('rendering', () => {
    it('renders a text input, the reset button and the default label as placeholder', () => {
      const { filter } = build()
      filter.create_html()

      const input = $(`#${filter.input_id}`)
      expect(input.attr('type')).toBe('text')
      expect(input.attr('placeholder')).toBe('Role')
      expect($(`#${filter.reset_id}`).length).toBe(1)
    })

    it('carries the configured css class alongside the base one', () => {
      const { filter } = build({ options: { filter_css_class: 'form-control' } })
      filter.create_html()

      expect($(`#${filter.input_id}`).attr('class')).toBe('dtf-filter form-control')
    })

    it('marks the input as off-limits for password-manager autofill', () => {
      const { filter } = build()
      filter.create_html()

      const input = $(`#${filter.input_id}`)
      expect(input.attr('autocomplete')).toBe('off')
      expect(input.attr('data-bwignore')).toBe('1')
      expect(input.attr('data-lpignore')).toBe('true')
      expect(input.attr('data-1p-ignore')).toBe('')
    })

    it('uses the configured reset button text', () => {
      const { filter } = build({ options: { filter_reset_button_text: 'clear' } })
      filter.create_html()

      expect($(`#${filter.reset_id}`).text()).toBe('clear')
    })
  })

  describe('reading and writing the value', () => {
    it('trims the input value', () => {
      const { filter } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('  admin  ')

      expect(filter.current_value()).toBe('admin')
    })

    it('writes the value, marks it in use and records it when set programmatically', () => {
      const { filter, owner } = build()
      filter.create_html()

      filter.set('admin')

      expect($(`#${filter.input_id}`).val()).toBe('admin')
      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(true)
      expect(owner.searches).toEqual([{ column_id: 3, value: 'admin' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { value: 'admin' } }])
    })

    it('does not mark the input in use when set to an empty value', () => {
      const { filter } = build()
      filter.create_html()

      filter.set('')

      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(false)
    })

    it('restores a saved value and marks it in use', () => {
      const owner = buildDatatableFilter({ state: { value: 'admin' } })
      const { filter } = build({ datatableFilter: owner })
      filter.create_html()

      filter.restore_state()

      expect($(`#${filter.input_id}`).val()).toBe('admin')
      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(true)
    })

    it('leaves the input untouched when there is no saved state', () => {
      const { filter } = build()
      filter.create_html()

      filter.restore_state()

      expect($(`#${filter.input_id}`).val()).toBe('')
    })

    it('clears the input, the search value and the state on reset', () => {
      const { filter, owner } = build()
      filter.create_html()
      filter.set('admin')
      owner.searches.length = 0
      owner.saved.length = 0

      filter.reset({})

      expect($(`#${filter.input_id}`).val()).toBe('')
      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(false)
      expect(owner.searches).toEqual([{ column_id: 3, value: '' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: undefined }])
    })
  })

  describe('typing', () => {
    it('filters on the typed value and marks the input in use', () => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('adm')

      filter._text_change(keyEvent())

      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(true)
      expect(owner.filters).toEqual([{ column_id: 3, value: 'adm' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { value: 'adm' } }])
    })

    it('drops the in-use marker once the input is emptied', () => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('').addClass('inuse')

      filter._text_change(keyEvent())

      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(false)
      expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
    })

    // Moving the caret must not re-run the filter: each arrow key would
    // otherwise cost a round trip to the server for an unchanged value.
    it.each([37, 38, 39, 40])('ignores arrow key %i', (keyCode) => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('adm')

      filter._text_change(keyEvent(keyCode))

      expect(owner.filters).toEqual([])
    })

    it('debounces keyup by filter_delay', () => {
      jest.useFakeTimers()
      try {
        const { filter, owner } = build({ options: { filter_delay: 300 } })
        filter.create_html()
        filter.bind_inputs()

        $(`#${filter.input_id}`).val('a').trigger($.Event('keyup', { keyCode: 65 }))
        $(`#${filter.input_id}`).val('ad').trigger($.Event('keyup', { keyCode: 68 }))

        jest.advanceTimersByTime(299)
        expect(owner.filters).toEqual([])

        jest.advanceTimersByTime(1)
        expect(owner.filters).toEqual([{ column_id: 3, value: 'ad' }])
      } finally {
        jest.useRealTimers()
      }
    })

    // The window between a keystroke and its debounced call is exactly the one
    // a Turbo navigation lands in. Left running, the timer reaches into a
    // DatatableFilter whose DataTables instance is gone, and then schedules a
    // state write nobody will cancel.
    it('drops a pending call when the filter is destroyed', () => {
      jest.useFakeTimers()
      try {
        const { filter, owner } = build({ options: { filter_delay: 300 } })
        filter.create_html()
        filter.bind_inputs()

        $(`#${filter.input_id}`).val('a').trigger($.Event('keyup', { keyCode: 65 }))
        filter.destroy()
        jest.advanceTimersByTime(500)

        expect(owner.filters).toEqual([])
      } finally {
        jest.useRealTimers()
      }
    })
  })

  // Every value typed into a filter is copied into the DataTables state and
  // persisted by stateSave — localStorage by default, with no expiry. That is
  // not where a national ID searched on a shared workstation belongs, so a
  // filter can opt out of it.
  describe('filter_no_state', () => {
    it('keeps the value off the saved state', () => {
      const { filter, owner } = build({ options: { filter_no_state: true } })
      filter.create_html()

      filter.set('123-45-6789')

      expect(owner.saved).toEqual([])
      expect(owner.searches).toEqual([{ column_id: 3, value: '123-45-6789' }])
    })

    // Called straight rather than through a keyup: the handler is debounced, and
    // what matters here is the split between filtering and saving.
    it('still filters the table', () => {
      const { filter, owner } = build({ options: { filter_no_state: true } })
      filter.create_html()
      $(`#${filter.input_id}`).val('abc')

      filter._text_change({ keyCode: 65 })

      expect(owner.filters).toEqual([{ column_id: 3, value: 'abc' }])
      expect(owner.saved).toEqual([])
    })

    it('saves the value like any other filter when not set', () => {
      const { filter, owner } = build()
      filter.create_html()

      filter.set('abc')

      expect(owner.saved).toEqual([{ column_id: 3, data: { value: 'abc' } }])
    })
  })

  describe('the reset button', () => {
    it('does nothing when the input is already empty', () => {
      const { filter, owner } = build()
      filter.create_html()

      filter._text_clear({})

      expect(owner.filters).toEqual([])
      expect(owner.saved).toEqual([])
    })

    it('clears the input and filters on empty', () => {
      const { filter, owner } = build()
      filter.create_html()
      $(`#${filter.input_id}`).val('admin').addClass('inuse')

      filter._text_clear({})

      expect($(`#${filter.input_id}`).val()).toBe('')
      expect($(`#${filter.input_id}`).hasClass('inuse')).toBe(false)
      expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { value: '' } }])
    })

    it('is wired to the click event', () => {
      const { filter, owner } = build()
      filter.create_html()
      filter.bind_inputs()
      $(`#${filter.input_id}`).val('admin')

      $(`#${filter.reset_id}`).trigger('click')

      expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
    })
  })
})

// BaseFilter has no instances of its own; TextFilter is the thinnest subclass
// through which its shared behaviour can be exercised.
describe('BaseFilter, through TextFilter', () => {
  beforeEach(renderContainer)
  afterEach(resetDom)

  it('names itself by JS class, filter class and column, for the logs', () => {
    const { filter } = build()

    expect(filter.name()).toBe('Datatables.UsersDatatable/TextFilter#3')
  })

  it('builds, renders and binds in one call through @build', () => {
    const owner = buildDatatableFilter({ state: { value: 'admin' } })
    const filter = TextFilter.build(owner, buildLogger(), filterOptions())

    expect($(`#${filter.input_id}`).length).toBe(1)
    expect($(`#${filter.input_id}`).val()).toBe('admin')
  })

  it('dumps its configuration when the debug option is on', () => {
    const logger = buildLogger()
    logger.info = jest.fn()
    logger.dump = jest.fn()
    const filter = new TextFilter(
      buildDatatableFilter(),
      logger,
      filterOptions({ debug: true })
    )

    filter.bind()

    expect(logger.dump).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith('column_id: 3')
  })

  it('stays quiet when the debug option is off', () => {
    const logger = buildLogger()
    logger.dump = jest.fn()
    const filter = new TextFilter(buildDatatableFilter(), logger, filterOptions())

    filter.bind()

    expect(logger.dump).not.toHaveBeenCalled()
  })

  describe('prevent_default_on_enter', () => {
    // Enter inside a filter input would submit the surrounding form and reload
    // the page, losing the table state entirely.
    it('swallows Enter', () => {
      const { filter } = build()
      const event = { keyCode: 13, preventDefault: jest.fn() }

      filter.prevent_default_on_enter(event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('lets every other key through', () => {
      const { filter } = build()
      const event = { keyCode: 65, preventDefault: jest.fn() }

      filter.prevent_default_on_enter(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('falls back to returnValue when preventDefault is missing', () => {
      const { filter } = build()
      const event = { keyCode: 13 }

      filter.prevent_default_on_enter(event)

      expect(event.returnValue).toBe(false)
    })
  })

  describe('stop_propagation', () => {
    // The filters sit inside the table header: a click reaching it would sort
    // the column the user is trying to filter.
    it('stops the event', () => {
      const { filter } = build()
      const event = { stopPropagation: jest.fn() }

      filter.stop_propagation(event)

      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('falls back to cancelBubble when stopPropagation is missing', () => {
      const { filter } = build()
      const event = {}

      filter.stop_propagation(event)

      expect(event.cancelBubble).toBe(true)
    })

    it('is wired to the reset button so clicking it never sorts the column', () => {
      const { filter } = build()
      filter.create_html()
      const event = $.Event('mousedown')

      $(`#${filter.reset_id}`).trigger(event)

      expect(event.isPropagationStopped()).toBe(true)
    })

    it('is wired to the input so clicking it never sorts the column', () => {
      const { filter } = build()
      filter.create_html()
      const event = $.Event('mousedown')

      $(`#${filter.input_id}`).trigger(event)

      expect(event.isPropagationStopped()).toBe(true)
    })
  })

  it('is wired to the input so Enter never submits the surrounding form', () => {
    const { filter } = build()
    filter.create_html()
    const event = $.Event('keydown', { keyCode: 13 })

    $(`#${filter.input_id}`).trigger(event)

    expect(event.isDefaultPrevented()).toBe(true)
  })

  // The base reload is a logging no-op; the select filters are the ones that
  // override it. Exercised here so the default path is not silently untested.
  it('logs a reload without touching the value', () => {
    const { filter } = build()
    filter.create_html()
    filter.set('admin')

    filter.reload({})

    expect($(`#${filter.input_id}`).val()).toBe('admin')
  })
})
