import BaseFilter from './base_filter.coffee'

class SelectBase extends BaseFilter

  dropdown_data: null

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # fetch select data
    @filter_plugin         = @options.filter_plugin
    @filter_plugin_options = @options.filter_plugin_options

    # build ids
    @wrapper_id = "yadcf-filter-wrapper-#{@datatable_filter.dt_id}-#{@column_id}"
    @select_id  = "yadcf-filter-#{@datatable_filter.dt_id}-#{@column_id}"
    @reset_id   = "yadcf-filter-#{@datatable_filter.dt_id}-reset-#{@column_id}"


  ##################
  # PUBLIC METHODS #
  ##################

  bind_inputs: ->
    super()

    # build select field callback (bound on the plugin instance in _initialize_select_plugin)
    delay = @options.filter_delay or 0

    onchange_callback = (event) =>
      @_select_change(event)
      return

    @onchange_callback = @_with_delay(onchange_callback, delay)

    # bind reset button
    onclick_callback = (event) =>
      @_select_clear(event)
      return

    @_el(@reset_id).on('click', onclick_callback)

    @_initialize_select_plugin()


  restore_state: ->
    super()

    saved_state = @datatable_filter.has_state_for(@column_id)

    if saved_state?
      restored_value = saved_state.value

      @_set_select_value(restored_value)

      if restored_value != ''
        @_el(@select_id).addClass('inuse')


  reset: (event) ->
    super(event)

    @_clear_select_value()
    @_el(@select_id).removeClass('inuse')

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, '')

    # save current value
    @_reset_state(@column_id)


  destroy: ->
    @select_plugin?.destroy()
    @select_plugin = null


  reload: (event) ->
    super(event)

    @_el(@select_id).empty().append(@_select_options())

    # re-read options and selection from the underlying <select>
    @select_plugin?.clearOptions()
    @select_plugin?.sync()

    @restore_state()


  ###################
  # PRIVATE METHODS #
  ###################

  _html_input_field: ->
    options =
      id:    @select_id
      class: "yadcf-filter #{@filter_css_class}"

    callback1 = (event) =>
      @stop_propagation(event)

    callback2 = (event) =>
      @prevent_default_on_enter(event)

    $('<select/>', options)
      .on('click',     callback1)
      .on('keydown',   callback2)
      .on('mousedown', callback1)


  _select_change: (event) ->
    @logger.info "#{@name()} : _select_change"
    @logger.dump(event)


  _select_clear: (event) ->
    @logger.info "#{@name()} : _select_clear"
    @logger.dump(event)

    current_value = @current_value()
    return if @_empty_value(current_value)

    @_set_select_value('')
    @_el(@select_id).removeClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, '')

    # save current value
    @_save_state(@column_id, value: '')


  # set value without triggering a 'change' event (and a datatable reload)
  _set_select_value: (value) ->
    if @select_plugin?
      @select_plugin.setValue(value, true)
    else
      @_el(@select_id).val(value)


  # clear value without triggering a 'change' event (and a datatable reload)
  _clear_select_value: ->
    if @select_plugin?
      @select_plugin.clear(true)
    else
      @_el(@select_id).val('')


  _initialize_select_plugin: ->
    @logger.info "#{@name()} : _initialize_select_plugin"

    switch @filter_plugin
      when 'tom-select'
        select = document.getElementById(@select_id)
        @select_plugin = new TomSelect(select, @filter_plugin_options or {})

        # tom-select emits 'change' through its own emitter, not as a DOM event
        @select_plugin.on('change', @onchange_callback)

        # prevent clicks on the widget from bubbling to the table header (sort).
        # 'click' only : tom-select retains focus through a document-level 'mousedown'
        # handler — stopping mousedown propagation would close the dropdown instantly
        wrapper = @_el(@select_id).next()
        if wrapper? and wrapper.hasClass('ts-wrapper')
          callback = (event) =>
            @stop_propagation(event)
          wrapper.on('click', callback)
      when 'select2'
        @_el(@select_id).select2 @filter_plugin_options

        # select2 triggers 'change' as a jQuery event on the original select
        @_el(@select_id).on('change', @onchange_callback)

        select2 = @_el(@select_id).next()
        if select2? and select2.hasClass('select2-container')
          callback = (event) =>
            @stop_propagation(event)
          select2
            .on('click', callback)
            .on('mousedown', callback)
      when 'native'
        # plain HTML <select>, no plugin — used for compound input-group filters
        @_el(@select_id).on('change', @onchange_callback)
      else
        @logger.error("Unknown select type: #{@filter_plugin}")


  _debug_log: ->
    super()

    @logger.info("container_id: #{@container_id}")
    @logger.info("wrapper_id: #{@wrapper_id}")
    @logger.info("select_id: #{@select_id}")
    @logger.info("reset_id: #{@reset_id}")


export default SelectBase
