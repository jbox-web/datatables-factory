import SelectFilter from '../../../src/model/filters/select_filter.coffee'
import SelectMultiFilter from '../../../src/model/filters/select_multi_filter.coffee'
import {
  buildDatatableFilter,
  buildLogger,
  filterOptions,
  renderContainer,
  resetDom,
} from '../support/filter_helpers'

function build(Klass, { datatableFilter, options, dropdown_data } = {}) {
  const owner = datatableFilter || buildDatatableFilter()
  const filter = new Klass(owner, buildLogger(), filterOptions(options))
  if (dropdown_data) filter.dropdown_data = dropdown_data
  return { filter, owner }
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

function renderSelect(filter) {
  filter.create_html()
  $(`#${filter.select_id}`).append(filter._select_options())
  return $(`#${filter.select_id}`)
}

describe('select filters', () => {
  beforeEach(renderContainer)
  afterEach(resetDom)

  describe('SelectFilter', () => {
    it('renders a select carrying the default label as its placeholder', () => {
      const { filter } = build(SelectFilter)
      filter.create_html()

      expect($(`#${filter.select_id}`).prop('tagName')).toBe('SELECT')
      expect($(`#${filter.select_id}`).attr('data-placeholder')).toBe('Role')
    })

    it('reads the selected option, trimmed', () => {
      const { filter } = build(SelectFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)
      select.val('admin')

      expect(filter.current_value()).toBe('admin')
    })

    it('reports an empty string when nothing is selected', () => {
      const { filter } = build(SelectFilter)
      filter.create_html()

      expect(filter.current_value()).toBe('')
    })

    it('records the search value and the state when set programmatically', () => {
      const { filter, owner } = build(SelectFilter)

      filter.set('admin')

      expect(owner.searches).toEqual([{ column_id: 3, value: 'admin' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { value: 'admin' } }])
    })

    it('marks the select in use and filters on it when a value is picked', () => {
      const { filter, owner } = build(SelectFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)
      select.val('admin')

      filter._select_change({})

      expect(select.hasClass('inuse')).toBe(true)
      expect(owner.filters).toEqual([{ column_id: 3, value: 'admin' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { value: 'admin' } }])
    })

    it('clears the in-use marker when the selection goes back to the placeholder', () => {
      const { filter, owner } = build(SelectFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)
      select.val('').addClass('inuse')

      filter._select_change({})

      expect(select.hasClass('inuse')).toBe(false)
      expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
    })

    it('does nothing when the reset button is clicked on an empty select', () => {
      const { filter, owner } = build(SelectFilter, { dropdown_data: ROLES })
      renderSelect(filter)

      filter._select_clear({})

      expect(owner.filters).toEqual([])
      expect(owner.saved).toEqual([])
    })

    it('clears the selection and filters on empty when reset is clicked', () => {
      const { filter, owner } = build(SelectFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)
      select.val('admin').addClass('inuse')

      filter._select_clear({})

      expect(select.val()).toBe('')
      expect(select.hasClass('inuse')).toBe(false)
      expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { value: '' } }])
    })
  })

  describe('SelectMultiFilter', () => {
    it('renders a multiple select with no placeholder option', () => {
      const { filter } = build(SelectMultiFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)

      // prop, not attr: the filter sets it via .attr('multiple', true), which
      // renders the literal string "true" — the property is what actually makes
      // the element multi-select.
      expect(select.prop('multiple')).toBe(true)
      expect(select.find('option').length).toBe(2)
    })

    it('renders nothing at all when no dropdown data was loaded', () => {
      const { filter } = build(SelectMultiFilter)

      expect(filter._select_options()).toEqual([])
    })

    // The server expects the selected values pipe-joined in a single search
    // string, so the array has to be cast on the way out — but stored as an
    // array, which is what restore_state feeds back into the select.
    it('joins the selection with a pipe for the search value, and stores the array', () => {
      const { filter, owner } = build(SelectMultiFilter)

      filter.set(['admin', 'user'])

      expect(owner.searches).toEqual([{ column_id: 3, value: 'admin|user' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: { value: ['admin', 'user'] } }])
    })

    it('filters on the pipe-joined selection when a value is picked', () => {
      const { filter, owner } = build(SelectMultiFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)
      select.val(['admin', 'user'])

      filter._select_change({})

      expect(select.hasClass('inuse')).toBe(true)
      expect(owner.filters).toEqual([{ column_id: 3, value: 'admin|user' }])
    })

    it('treats an empty selection as no filter', () => {
      const { filter, owner } = build(SelectMultiFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)
      select.val([]).addClass('inuse')

      filter._select_change({})

      expect(select.hasClass('inuse')).toBe(false)
      expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
    })
  })

  describe('SelectBase, through SelectFilter', () => {
    it('restores a saved value and marks the select in use', () => {
      const owner = buildDatatableFilter({ state: { value: 'admin' } })
      const { filter } = build(SelectFilter, { datatableFilter: owner, dropdown_data: ROLES })
      const select = renderSelect(filter)

      filter.restore_state()

      expect(select.val()).toBe('admin')
      expect(select.hasClass('inuse')).toBe(true)
    })

    it('does not mark the select in use when the saved value is empty', () => {
      const owner = buildDatatableFilter({ state: { value: '' } })
      const { filter } = build(SelectFilter, { datatableFilter: owner, dropdown_data: ROLES })
      const select = renderSelect(filter)

      filter.restore_state()

      expect(select.hasClass('inuse')).toBe(false)
    })

    it('clears the value, the search and the state on reset', () => {
      const { filter, owner } = build(SelectFilter, { dropdown_data: ROLES })
      const select = renderSelect(filter)
      select.val('admin').addClass('inuse')

      filter.reset({})

      expect(select.val()).toBe('')
      expect(select.hasClass('inuse')).toBe(false)
      expect(owner.searches).toEqual([{ column_id: 3, value: '' }])
      expect(owner.saved).toEqual([{ column_id: 3, data: undefined }])
    })

    // Every xhr.dt calls reload. Rebuilding an unchanged dropdown would discard
    // and recreate every option on each redraw, sort or keystroke elsewhere.
    it('rebuilds the options only when the dropdown data actually changed', () => {
      const { filter } = build(SelectFilter, { dropdown_data: ROLES })
      renderSelect(filter)

      filter.reload({})
      const firstOption = $(`#${filter.select_id}`).find('option')[0]

      filter.reload({})
      expect($(`#${filter.select_id}`).find('option')[0]).toBe(firstOption)

      filter.dropdown_data = [{ value: 'guest', label: 'Guest' }]
      filter.reload({})
      expect($(`#${filter.select_id}`).find('option')[0]).not.toBe(firstOption)
      expect($(`#${filter.select_id}`).find('option').length).toBe(2)
    })

    describe('plugin initialisation', () => {
      // The handler is wrapped in _with_delay, so it fires through setTimeout
      // even when filter_delay is 0 — asserting synchronously would test
      // nothing but the trigger call itself.
      it('wires the change handler directly on the element for a native select', () => {
        jest.useFakeTimers()
        try {
          const { filter, owner } = build(SelectFilter, {
            options: { filter_plugin: 'native' },
            dropdown_data: ROLES,
          })
          renderSelect(filter)
          filter.bind_inputs()

          $(`#${filter.select_id}`).val('admin').trigger('change')
          jest.runAllTimers()

          expect(owner.filters).toEqual([{ column_id: 3, value: 'admin' }])
        } finally {
          jest.useRealTimers()
        }
      })

      it('debounces the change handler by filter_delay', () => {
        jest.useFakeTimers()
        try {
          const { filter, owner } = build(SelectFilter, {
            options: { filter_plugin: 'native', filter_delay: 300 },
            dropdown_data: ROLES,
          })
          renderSelect(filter)
          filter.bind_inputs()

          $(`#${filter.select_id}`).val('admin').trigger('change')
          $(`#${filter.select_id}`).val('user').trigger('change')

          jest.advanceTimersByTime(299)
          expect(owner.filters).toEqual([])

          jest.advanceTimersByTime(1)
          expect(owner.filters).toEqual([{ column_id: 3, value: 'user' }])
        } finally {
          jest.useRealTimers()
        }
      })

      it('instantiates TomSelect and listens on its own emitter', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'tom-select' },
          dropdown_data: ROLES,
        })
        renderSelect(filter)

        filter.bind_inputs()

        expect(filter.select_plugin).toBeInstanceOf(TomSelect)
        expect(filter.select_plugin.handlers.change).toBe(filter.onchange_callback)
      })

      // Les libellés d'option peuvent être construits côté serveur (badge décoré).
      // TomSelect échappe par défaut : sans opt-in explicite, ce balisage s'affiche
      // en texte brut. L'option ne doit s'activer que lorsqu'elle est demandée.
      it('escapes option labels by default', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'tom-select' },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        filter.bind_inputs()

        expect(filter.select_plugin.options.render).toBeUndefined()
      })

      it('renders option labels as HTML when filter_html_labels is set', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'tom-select', filter_html_labels: true },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        filter.bind_inputs()

        const render = filter.select_plugin.options.render
        const badge  = '<span class="badge">Admin</span>'

        expect(render.option({ text: badge }, (s) => s)).toContain(badge)
        expect(render.item({ text: badge }, (s) => s)).toContain(badge)
      })

      it('routes value changes through the plugin so no change event fires', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'tom-select' },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        filter.bind_inputs()

        filter._set_select_value('admin')
        expect(filter.select_plugin.value).toBe('admin')

        filter._clear_select_value()
        expect(filter.select_plugin.value).toBe('')
      })

      it('tears the plugin down on destroy', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'tom-select' },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        filter.bind_inputs()
        const plugin = filter.select_plugin

        filter.destroy()

        expect(plugin.destroyed).toBe(true)
        expect(filter.select_plugin).toBeNull()
      })

      it('survives destroy when no plugin was ever created', () => {
        const { filter } = build(SelectFilter)

        expect(() => filter.destroy()).not.toThrow()
      })

      // Declaring a plugin the host forgot to load used to throw right there,
      // taking the whole table's initialisation with it — for a filter whose
      // plain <select> still works.
      describe('when the declared plugin is not loaded', () => {
        let saved

        beforeEach(() => {
          saved = global.TomSelect
          delete global.TomSelect
        })

        afterEach(() => {
          global.TomSelect = saved
        })

        it('reports it instead of throwing', () => {
          const { filter } = build(SelectFilter, {
            options: { filter_plugin: 'tom-select' },
            dropdown_data: ROLES,
          })
          filter.logger.error = jest.fn()
          renderSelect(filter)

          expect(() => filter.bind_inputs()).not.toThrow()
          expect(filter.logger.error).toHaveBeenCalledWith(expect.stringMatching(/tom-select/i))
        })

        it('falls back to the native select so the column stays filterable', () => {
          jest.useFakeTimers()
          try {
            const { filter, owner } = build(SelectFilter, {
              options: { filter_plugin: 'tom-select' },
              dropdown_data: ROLES,
            })
            renderSelect(filter)
            filter.bind_inputs()

            $(`#${filter.select_id}`).val('admin').trigger('change')
            jest.runAllTimers()

            expect(owner.filters).toEqual([{ column_id: 3, value: 'admin' }])
          } finally {
            jest.useRealTimers()
          }
        })
      })

      // The widget TomSelect renders sits next to the original select; a click
      // in it must not reach the table header and sort the column. Only click
      // is stopped: TomSelect keeps focus through a document-level mousedown
      // handler, and stopping that one closes the dropdown instantly.
      it('shields the TomSelect widget from the header, on click only', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'tom-select' },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        $(`#${filter.select_id}`).after('<div class="ts-wrapper"></div>')

        filter.bind_inputs()

        const click = $.Event('mousedown')
        $('.ts-wrapper').trigger(click)
        expect(click.isPropagationStopped()).toBe(false)

        const stopped = $.Event('click')
        $('.ts-wrapper').trigger(stopped)
        expect(stopped.isPropagationStopped()).toBe(true)
      })

      it('initialises select2 and listens on the element', () => {
        const { filter, owner } = build(SelectFilter, {
          options: { filter_plugin: 'select2', filter_plugin_options: { width: '100%' } },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        const select2Calls = []
        $.fn.select2 = function select2(options) {
          select2Calls.push(options)
          return this
        }

        // Timers first: the change handler is debounced, so a setTimeout
        // scheduled before jest takes them over can never be flushed.
        jest.useFakeTimers()
        try {
          filter.bind_inputs()

          expect(select2Calls).toEqual([{ width: '100%' }])

          $(`#${filter.select_id}`).val('admin').trigger('change')
          jest.runAllTimers()

          expect(owner.filters).toEqual([{ column_id: 3, value: 'admin' }])
        } finally {
          jest.useRealTimers()
          delete $.fn.select2
        }
      })

      // The tom-select arm of _missing_plugin was covered, this one never was:
      // every select2 example installs $.fn.select2 first. A host that declares
      // the plugin and forgets to load it must get a working native select and
      // a message, not a table that fails to initialise.
      it('falls back to the native select when select2 is not loaded', () => {
        const { filter, owner } = build(SelectFilter, {
          options: { filter_plugin: 'select2' },
          dropdown_data: ROLES,
        })
        const reported = []
        filter.logger.error = (message) => reported.push(message)
        renderSelect(filter)

        jest.useFakeTimers()
        try {
          expect(() => filter.bind_inputs()).not.toThrow()

          $(`#${filter.select_id}`).val('admin').trigger('change')
          jest.runAllTimers()

          expect(owner.filters).toEqual([{ column_id: 3, value: 'admin' }])
          expect(reported.join(' ')).toMatch(/select2 is not loaded/)
        } finally {
          jest.useRealTimers()
        }
      })

      it('shields the select2 container from the header', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'select2' },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        $(`#${filter.select_id}`).after('<div class="select2-container"></div>')
        $.fn.select2 = function select2() {
          return this
        }

        try {
          filter.bind_inputs()

          const click = $.Event('click')
          $('.select2-container').trigger(click)
          expect(click.isPropagationStopped()).toBe(true)
        } finally {
          delete $.fn.select2
        }
      })

      it('re-syncs the plugin when the dropdown data changed', () => {
        const { filter } = build(SelectFilter, {
          options: { filter_plugin: 'tom-select' },
          dropdown_data: ROLES,
        })
        renderSelect(filter)
        filter.bind_inputs()
        filter.select_plugin.clearOptions = jest.fn()
        filter.select_plugin.sync = jest.fn()

        filter.reload({})
        expect(filter.select_plugin.clearOptions).toHaveBeenCalledTimes(1)

        filter.reload({})
        expect(filter.select_plugin.clearOptions).toHaveBeenCalledTimes(1)

        filter.dropdown_data = [{ value: 'guest', label: 'Guest' }]
        filter.reload({})
        expect(filter.select_plugin.clearOptions).toHaveBeenCalledTimes(2)
        expect(filter.select_plugin.sync).toHaveBeenCalledTimes(2)
      })

      it('dumps its ids when the debug option is on', () => {
        const logger = buildLogger()
        logger.info = jest.fn()
        const filter = new SelectFilter(
          buildDatatableFilter(),
          logger,
          filterOptions({ debug: true })
        )

        filter.bind()

        expect(logger.info).toHaveBeenCalledWith(`select_id: ${filter.select_id}`)
        expect(logger.info).toHaveBeenCalledWith(`reset_id: ${filter.reset_id}`)
      })

      it('is wired so the reset button clears the select', () => {
        const { filter, owner } = build(SelectFilter, { dropdown_data: ROLES })
        const select = renderSelect(filter)
        filter.bind_inputs()
        select.val('admin')

        $(`#${filter.reset_id}`).trigger('click')

        expect(owner.filters).toEqual([{ column_id: 3, value: '' }])
      })

      it('stops a click on the select from sorting the column', () => {
        const { filter } = build(SelectFilter, { dropdown_data: ROLES })
        const select = renderSelect(filter)

        const click = $.Event('click')
        select.trigger(click)
        expect(click.isPropagationStopped()).toBe(true)

        const enter = $.Event('keydown', { keyCode: 13 })
        select.trigger(enter)
        expect(enter.isDefaultPrevented()).toBe(true)
      })

      it('logs an error rather than throwing on an unknown plugin name', () => {
        const logger = buildLogger()
        logger.error = jest.fn()
        const filter = new SelectFilter(
          buildDatatableFilter(),
          logger,
          filterOptions({ filter_plugin: 'nope' })
        )
        filter.create_html()

        filter.bind_inputs()

        expect(logger.error).toHaveBeenCalledWith('Unknown select type: nope')
      })
    })
  })
})
