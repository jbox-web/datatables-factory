import BaseFilter from './base_filter.coffee'

class TextFilter extends BaseFilter

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # build ids
    @wrapper_id   = "dtf-filter-wrapper-#{@datatable_filter.dt_id}-#{@column_id}"
    @input_id     = "dtf-filter-#{@datatable_filter.dt_id}-#{@column_id}"
    @reset_id     = "dtf-filter-#{@datatable_filter.dt_id}-reset-#{@column_id}"


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

    @_el(@input_id).on('keyup', @_with_delay(onkeyup_callback, delay))

    # bind reset button
    onclick_callback = (event) =>
      @_text_clear(event)
      return

    @_el(@reset_id).on('click', onclick_callback)


  restore_state: ->
    super()

    saved_state = @datatable_filter.has_state_for(@column_id)

    if saved_state?
      restored_value = saved_state.value

      @_el(@input_id).val(restored_value)

      if restored_value != ''
        @_el(@input_id).addClass('inuse')


  reset: (event) ->
    super(event)

    @_el(@input_id).val('').removeClass('inuse')

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, '')

    # save current value
    @_reset_state(@column_id)


  set: (value) ->
    super(value)

    @_el(@input_id).val(value)
    @_el(@input_id).addClass('inuse') if value != ''

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, value)

    # save current value
    @_save_state(@column_id, value: value)


  current_value: ->
    # Not $.trim: jQuery 4 dropped it. String(x ? '') keeps its contract —
    # coerce to a string, and map null/undefined (no element) to ''.
    String(@_el(@input_id).val() ? '').trim()


  ###################
  # PRIVATE METHODS #
  ###################

  _html_input_field: ->
    callback1 = (event) =>
      @prevent_default_on_enter(event)

    callback2 = (event) =>
      @stop_propagation(event)

    options =
      type:        'text'
      id:          @input_id
      class:       "dtf-filter #{@filter_css_class}"
      placeholder: @filter_default_label

    $('<input/>', options)
      # via .attr() et non le hash de $('<input/>', …) : 'autocomplete' y serait
      # interprété comme un appel à la méthode jQuery-UI .autocomplete() (qui lève).
      # empêche les gestionnaires de mots de passe (Bitwarden, 1Password, LastPass…) d'injecter leur autofill
      .attr(
        autocomplete:     'off'
        'data-bwignore':  '1'
        'data-lpignore':  'true'
        'data-1p-ignore': ''
      )
      .on('keydown', callback1)
      .on('mousedown', callback2)


  _empty_value: (value) ->
    value == ''


  # What actually travels to the server for a given input value. A text filter
  # searches for exactly what was typed; a subclass whose input has a grammar —
  # a date — overrides this so a half-typed value is not sent as a criterion.
  _search_value: (value) ->
    value


  _text_change: (event) ->
    @logger.info => "#{@name()} : _text_change"
    @logger.dump(event)

    return if @_skip_key_codes().includes(event.keyCode)

    current_value = @current_value()

    if @_empty_value(current_value)
      @_el(@input_id).removeClass('inuse')
    else
      @_el(@input_id).addClass('inuse')

    search_value = @_search_value(current_value)

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, value: search_value)


  _text_clear: (event) ->
    @logger.info => "#{@name()} : _text_clear"
    @logger.dump(event)

    current_value = @current_value()
    return if @_empty_value(current_value)

    @_el(@input_id).val('').removeClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, '')

    # save current value
    @_save_state(@column_id, value: '')


export default TextFilter
