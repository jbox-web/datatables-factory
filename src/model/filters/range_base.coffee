import BaseFilter from './base_filter.coffee'

class RangeBase extends BaseFilter

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # fetch mandatory data
    @from_placeholder = @filter_default_label[0]
    @to_placeholder   = @filter_default_label[1]

    # fetch optional data
    @range_delimiter  = @options.filter_range_delimiter or '-yadcf_delim-'

    # build ids
    @wrapper_outer_id = "yadcf-filter-wrapper-#{@datatable_filter.dt_id}-#{@column_id}"
    @wrapper_inner_id = "yadcf-filter-wrapper-inner-#{@datatable_filter.dt_id}-#{@column_id}"
    @from_id          = "yadcf-filter-#{@datatable_filter.dt_id}-from-#{@range_type}-#{@column_id}"
    @to_id            = "yadcf-filter-#{@datatable_filter.dt_id}-to-#{@range_type}-#{@column_id}"
    @reset_id         = "yadcf-filter-#{@datatable_filter.dt_id}-reset-#{@range_type}-#{@column_id}"


  ##################
  # PUBLIC METHODS #
  ##################

  create_html: ->
    super()

    # add outer wrapper to hold both filter and reset button
    $("#{@container_id}").append @_html_wrapper_outer()

    # add inner wrapper to hold both filter and reset button
    $("#{@container_id} div.yadcf-filter-wrapper").append @_html_wrapper_inner()

    # add input fields
    $("#{@container_id} div.yadcf-filter-wrapper-inner").append @_html_range_start()
    $("#{@container_id} div.yadcf-filter-wrapper-inner").append @_html_range_separator()
    $("#{@container_id} div.yadcf-filter-wrapper-inner").append @_html_range_end()

    # add reset button
    if @filter_reset_button
      $("#{@container_id} div.yadcf-filter-wrapper").append @_html_reset_button()


  bind_inputs: ->
    super()

    # bind input fields
    delay = @options.filter_delay or 0

    onkeyup_callback = (event) =>
      @_range_change(event)
      return

    $("##{@from_id}").on('keyup', @_with_delay(onkeyup_callback, delay))
    $("##{@to_id}").on('keyup', @_with_delay(onkeyup_callback, delay))

    # bind reset button
    onclick_callback = (event) =>
      @_range_clear(event)
      return

    $("##{@reset_id}").on('click', onclick_callback)


  restore_state: ->
    super()

    saved_state = @datatable_filter.has_state_for(@column_id)

    if saved_state?
      restored_from = saved_state.from
      restored_to   = saved_state.to

      if restored_from != ''
        $("##{@from_id}").val(restored_from)
        $("##{@from_id}").addClass('inuse')

      if restored_to != ''
        $("##{@to_id}").val(restored_to)
        $("##{@to_id}").addClass('inuse')


  reset: (event) ->
    super(event)

    $("##{@from_id}").val('')
    $("##{@from_id}").removeClass('inuse')

    $("##{@to_id}").val('')
    $("##{@to_id}").removeClass('inuse')

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, '')

    # save current value
    @_reset_state(@column_id)


  current_value: ->
    { from: $("##{@from_id}").val(), to: $("##{@to_id}").val() }


  ###################
  # PRIVATE METHODS #
  ###################

  _html_wrapper_outer: ->
    callback = (event) =>
      @stop_propagation(event)

    options =
      id:    @wrapper_outer_id
      class: 'yadcf-filter-wrapper'

    $('<div/>', options)
      .on('click', callback)
      .on('mousedown', callback)


  _html_wrapper_inner: ->
    options =
      id:    @wrapper_inner_id
      class: 'yadcf-filter-wrapper-inner'

    $('<div/>', options)


  _html_range_start: ->
    callback = (event) =>
      @prevent_default_on_enter(event)

    options =
      id:          @from_id
      class:       "yadcf-filter-range yadcf-filter-range-#{@range_type} yadcf-filter-range-start"
      placeholder: @from_placeholder

    $('<input/>', options)
      .on('keydown', callback)


  _html_range_end: ->
    callback = (event) =>
      @prevent_default_on_enter(event)

    options =
      id:          @to_id
      class:       "yadcf-filter-range yadcf-filter-range-#{@range_type} yadcf-filter-range-end"
      placeholder: @to_placeholder

    $('<input/>', options)
      .on('keydown', callback)


  _html_range_separator: ->
    options =
      class: "yadcf-filter-range-#{@range_type}-seperator"

    $('<span/>', options)


  _range_change: (event) ->
    @logger.info "#{@name()} : _range_change"
    @logger.dump(event)


  _range_clear: (event) ->
    @logger.info "#{@name()} : _range_clear"
    @logger.dump(event)

    current_value = @current_value()
    return if current_value.from == '' and current_value.to == ''

    $("##{@from_id}").val('')
    $("##{@from_id}").removeClass('inuse')

    $("##{@to_id}").val('')
    $("##{@to_id}").removeClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, @range_delimiter)

    # save current value
    @_save_state(@column_id, from: '', to: '')


  _debug_log: ->
    super()

    @logger.info("container_id: #{@container_id}")
    @logger.info("wrapper_outer_id: #{@wrapper_outer_id}")
    @logger.info("wrapper_inner_id: #{@wrapper_inner_id}")
    @logger.info("from_id: #{@from_id}")
    @logger.info("to_id: #{@to_id}")
    @logger.info("from_placeholder: #{@from_placeholder}")
    @logger.info("to_placeholder: #{@to_placeholder}")


export default RangeBase
