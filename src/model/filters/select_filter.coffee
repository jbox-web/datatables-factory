import SelectBase from './select_base.coffee'

class SelectFilter extends SelectBase

  ##################
  # PUBLIC METHODS #
  ##################

  current_value: ->
    $.trim $("##{@select_id}").find('option:selected').val()


  set: (value) ->
    super(value)



    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, value)

    # save current value
    @_save_state(@column_id, value: value)


  ###################
  # PRIVATE METHODS #
  ###################

  _select_options: ->
    options = "<option value=\"-1\">#{@filter_default_label}</option>"
    if @dropdown_data?
      for data in @dropdown_data
        options += "<option value=\"#{data.value}\" >#{data.label}</option>"
    options


  _empty_value: (value) ->
    value == '-1'


  _select_change: (event) ->
    super(event)

    current_value = @current_value()

    if @_empty_value(current_value)
      search_value = ''
      $("##{@select_id}").removeClass('inuse')
    else
      search_value = current_value
      $("##{@select_id}").addClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, value: current_value)


export default SelectFilter
