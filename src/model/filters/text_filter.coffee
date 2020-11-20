import BaseFilter from './base_filter.coffee'

class TextFilter extends BaseFilter

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # build ids
    @wrapper_id   = "yadcf-filter-wrapper-#{@datatable_filter.dt_id}-#{@column_id}"
    @input_id     = "yadcf-filter-#{@datatable_filter.dt_id}-#{@column_id}"
    @reset_id     = "yadcf-filter-#{@datatable_filter.dt_id}-reset-#{@column_id}"


  create_html: ->
    super()

    # add a wrapper to hold both filter and reset button
    $("#{@container_id}").append @_html_wrapper()

    # add input fields
    $("#{@container_id} div.yadcf-filter-wrapper").append @_html_input_field()

    # add reset button
    $("#{@container_id} div.yadcf-filter-wrapper").append @_html_reset_button()


  ##################
  # PUBLIC METHODS #
  ##################

  bind_inputs: ->
    super()

    # bind input field
    delay = @options.filter_delay or 0

    onkeyup_callback = (event) =>
      @_text_change(event)
      return

    $("##{@input_id}").on('keyup', @_with_delay(onkeyup_callback, delay))

    # bind reset button
    onclick_callback = (event) =>
      @_text_clear(event)
      return

    $("##{@reset_id}").on('click', onclick_callback)


  restore_state: ->
    super()

    saved_state = @datatable_filter.has_state_for(@column_id)

    if saved_state?
      restored_value = saved_state.value

      $("##{@input_id}").val(restored_value)

      if restored_value != ''
        $("##{@input_id}").addClass('inuse')


  reset: (event) ->
    super(event)

    $("##{@input_id}").val('')
    $("##{@input_id}").removeClass('inuse')

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, '')

    # save current value
    @_reset_state(@column_id)


  set: (value) ->
    super(value)

    $("##{@input_id}").val(value)
    $("##{@input_id}").addClass('inuse') if value != ''

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, value)

    # save current value
    @_save_state(@column_id, value: value)


  current_value: ->
    $.trim $("##{@input_id}").val()


  ###################
  # PRIVATE METHODS #
  ###################

  _html_input_field: ->
    options =
      type:        'text'
      id:          @input_id
      class:       "yadcf-filter #{@filter_css_class}"
      placeholder: @filter_default_label
      onkeydown:   "#{@dt_class}.prevent_default_on_enter(event);"
      onmousedown: "#{@dt_class}.stop_propagation(event);"

    $('<input/>', options)


  _empty_value: (value) ->
    value == ''


  _text_change: (event) ->
    @logger.info "#{@name()} : _text_change"
    @logger.dump(event)

    return if @_skip_key_codes().includes(event.keyCode)

    current_value = @current_value()

    if @_empty_value(current_value)
      $("##{@input_id}").removeClass('inuse')
    else
      $("##{@input_id}").addClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, current_value)

    # save current value
    @_save_state(@column_id, value: current_value)


  _text_clear: (event) ->
    @logger.info "#{@name()} : _text_clear"
    @logger.dump(event)

    current_value = @current_value()
    return if @_empty_value(current_value)

    $("##{@input_id}").val('')
    $("##{@input_id}").removeClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, '')

    # save current value
    @_save_state(@column_id, value: '')


export default TextFilter
