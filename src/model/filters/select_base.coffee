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

  create_html: ->
    super()

    # add a wrapper to hold both filter and reset button
    $("#{@container_id}").append @_html_wrapper()

    # add input fields
    $("#{@container_id} div.yadcf-filter-wrapper").append @_html_input_field()

    # add reset button
    $("#{@container_id} div.yadcf-filter-wrapper").append @_html_reset_button()


  bind_inputs: ->
    super()

    # bind select field
    onchange_callback = (event) =>
      @_select_change(event)
      return

    $("##{@select_id}").on('change', onchange_callback)

    # bind reset button
    onclick_callback = (event) =>
      @_select_clear(event)
      return

    $("##{@reset_id}").on('click', onclick_callback)

    @_initialize_select_plugin()


  restore_state: ->
    super()

    saved_state = @datatable_filter.has_state_for(@column_id)

    if saved_state?
      restored_value = saved_state.value

      $("##{@select_id}").val(restored_value)

      if restored_value != '-1'
        $("##{@select_id}").addClass('inuse')


  reset: (event) ->
    super(event)

    $("##{@select_id}").val('')
    $("##{@select_id}").removeClass('inuse')

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, '')

    # save current value
    @_reset_state(@column_id)


  reload: (event) ->
    super(event)

    $("##{@select_id}").empty()
    $("##{@select_id}").append(@_select_options())

    @restore_state()


  ###################
  # PRIVATE METHODS #
  ###################

  _html_input_field: ->
    options =
      id:          @select_id
      class:       "yadcf-filter #{@filter_css_class}"
      onclick:     "#{@dt_class}.stop_propagation(event);"
      onkeydown:   "#{@dt_class}.prevent_default_on_enter(event);"
      onmousedown: "#{@dt_class}.stop_propagation(event);"

    $('<select/>', options)


  _select_change: (event) ->
    @logger.info "#{@name()} : _select_change"
    @logger.dump(event)


  _select_clear: (event) ->
    @logger.info "#{@name()} : _select_clear"
    @logger.dump(event)

    current_value = @current_value()
    return if @_empty_value(current_value)

    $("##{@select_id}").val('-1')
    $("##{@select_id}").removeClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, '')

    # save current value
    @_save_state(@column_id, value: '-1')


  _initialize_select_plugin: ->
    @logger.info "#{@name()} : _initialize_select_plugin"

    switch @filter_plugin
      when 'select2'
        $("##{@select_id}").select2 @filter_plugin_options
        select2 = $("##{@select_id}").next()
        if select2? and select2.hasClass('select2-container')
          select2
            .attr('onclick', "#{@dt_class}.stop_propagation(event);")
            .attr('onmousedown', "#{@dt_class}.stop_propagation(event);")
      else
        @logger.error("Unknown select type: #{@filter_plugin}")


  _debug_log: ->
    super()

    @logger.info("container_id: #{@container_id}")
    @logger.info("wrapper_id: #{@wrapper_id}")
    @logger.info("select_id: #{@select_id}")
    @logger.info("reset_id: #{@reset_id}")


export default SelectBase
