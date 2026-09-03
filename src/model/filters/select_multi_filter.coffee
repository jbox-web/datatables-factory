import SelectBase from './select_base.coffee'

class SelectMultiFilter extends SelectBase

  ##################
  # PUBLIC METHODS #
  ##################

  current_value: ->
    @_el(@select_id).val()


  set: (value) ->
    super(value)

    values       = [].concat(value ? [])
    search_value = @_cast_value(values)

    # The widget too, not just the wire and the state. It used to be left on its
    # placeholder until a later draw happened to carry dropdown data and
    # restore_state put the value back — and never at all on a static list.
    @_set_select_value(values)
    @_el(@select_id).addClass('inuse') if !@_empty_value(values)

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, search_value)

    # save current value
    @_save_state(@column_id, value: values)


  ###################
  # PRIVATE METHODS #
  ###################

  # See SelectFilter#_select_options: DOM API, never string interpolation.
  _select_options: ->
    return [] if !@dropdown_data?
    (new Option(data.label, data.value) for data in @dropdown_data)


  _empty_value: (value) ->
    value.length == 0


  _select_change: (event) ->
    super(event)

    current_value = @current_value()

    if @_empty_value(current_value)
      search_value = ''
      @_el(@select_id).removeClass('inuse')
    else
      search_value = @_cast_value(current_value)
      @_el(@select_id).addClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, value: current_value)


  _html_input_field: ->
    input = super()
    $(input)
      .attr('multiple', true)
      .attr('data-placeholder', @filter_default_label)


  # [].concat, because populate_with is written by hand in a view: a scalar
  # declared for a multi_select used to throw on join and take every default
  # filter after it down with it.
  _cast_value: (value) ->
    [].concat(value ? []).join('|')


export default SelectMultiFilter
