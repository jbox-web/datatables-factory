WithFilters = {}

WithFilters.class_methods =

  ########################
  # Public Class methods #
  ########################

  prevent_default_on_enter: (event) ->
    if event.keyCode == 13
      if event.preventDefault
        event.preventDefault()
      else
        event.returnValue = false
    return


  stop_propagation: (event) ->
    if event.stopPropagation?
      event.stopPropagation()
    else
      event.cancelBubble = true
    return


WithFilters.instance_methods =

  ###########################
  # Public Instance methods #
  ###########################

  find_filter_by_name: (column_name) ->
    column = @find_column_by_name(column_name)
    if column?
      @_find_filter(@filters, column[0])


  ############################
  # Private Instance methods #
  ############################

  _find_filter: (filters, column_id) ->
    i = 0
    len = filters.length
    while i < len
      if filters[i].column_id == column_id
        return [i, filters[i]]
      i++
    null


export default WithFilters
