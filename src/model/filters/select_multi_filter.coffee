import SelectBase from './select_base.coffee'

class SelectMultiFilter extends SelectBase

  ##################
  # PUBLIC METHODS #
  ##################

  current_value: ->
    $("##{@select_id}").val()


  set: (value) ->
    super(value)

    search_value = @_cast_value(value)

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, search_value)

    # save current value
    @_save_state(@column_id, value: value)


  ###################
  # PRIVATE METHODS #
  ###################

  _select_options: ->
    options = ''
    if @dropdown_data?
      for data in @dropdown_data
        options += "<option value=\"#{data.value}\" >#{data.label}</option>"
    options


  _empty_value: (value) ->
    value.length == 0


  _select_change: (event) ->
    super(event)

    current_value = @current_value()

    if @_empty_value(current_value)
      search_value = ''
      $("##{@select_id}").removeClass('inuse')
    else
      search_value = @_cast_value(current_value)
      $("##{@select_id}").addClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, value: current_value)


  _html_input_field: ->
    input = super()
    $(input)
      .attr('multiple', true)
      .attr('data-placeholder', @filter_default_label)


  _cast_value: (value) ->
    value.join('|')


export default SelectMultiFilter
