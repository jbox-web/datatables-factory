WithFilters = {}

WithFilters.class_methods = {}


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
    i = filters.findIndex (f) -> f.column_id == column_id
    if i >= 0 then [i, filters[i]] else null


export default WithFilters
