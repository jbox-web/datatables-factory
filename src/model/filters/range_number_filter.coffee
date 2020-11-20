import RangeBase from './range_base.coffee'

class RangeNumberFilter extends RangeBase

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # customize class
    @range_type = 'number'


  ###################
  # PRIVATE METHODS #
  ###################

  _range_change: (event) ->
    super(event)

    return if @_skip_key_codes().includes(event.keyCode)

    current_value = @current_value()

    min = @_int_or_empty_string(current_value.from)
    max = @_int_or_empty_string(current_value.to)

    if min != ''
      $("##{@from_id}").addClass('inuse')
    else
      $("##{@from_id}").removeClass('inuse')

    if max != ''
      $("##{@to_id}").addClass('inuse')
    else
      $("##{@to_id}").removeClass('inuse')

    search_value = "#{min}#{@range_delimiter}#{max}"

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, from: min, to: max)


  _int_or_empty_string: (value) ->
    value = if value != '' then +value else value
    value = '' if isNaN(value)
    value


export default RangeNumberFilter
