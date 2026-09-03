import SelectBase from './select_base.coffee'

class SelectFilter extends SelectBase

  ##################
  # PUBLIC METHODS #
  ##################

  current_value: ->
    # Not $.trim: jQuery 4 dropped it. String(x ? '') keeps its contract —
    # coerce to a string, and map null/undefined (no element) to ''.
    String(@_el(@select_id).find('option:selected').val() ? '').trim()


  set: (value) ->
    super(value)

    # The widget too, not just the wire and the state: a default applied from
    # populate_with filtered the table while the select still showed its
    # placeholder, until a later draw carrying dropdown data happened to put it
    # back through restore_state.
    @_set_select_value(value)
    @_el(@select_id).addClass('inuse') if !@_empty_value(value)

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, value)

    # save current value
    @_save_state(@column_id, value: value)


  ###################
  # PRIVATE METHODS #
  ###################

  # Built through the DOM API, never by string interpolation: dropdown_data
  # comes from the server and may contain HTML metacharacters, which would
  # otherwise inject attributes or elements when appended by jQuery.
  _select_options: ->
    options = [new Option(@filter_default_label, '')]
    if @dropdown_data?
      options.push(new Option(data.label, data.value)) for data in @dropdown_data
    options


  _empty_value: (value) ->
    value == ''


  _select_change: (event) ->
    super(event)

    current_value = @current_value()

    if @_empty_value(current_value)
      search_value = ''
      @_el(@select_id).removeClass('inuse')
    else
      search_value = current_value
      @_el(@select_id).addClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, value: current_value)


  _html_input_field: ->
    input = super()
    $(input)
      .attr('data-placeholder', @filter_default_label)


export default SelectFilter
