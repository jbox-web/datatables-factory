import RangeBase from './range_base.coffee'

# What a bound may be: an optional sign, digits, an optional decimal part.
# Anything else — a stray space, an exponent, a letter — means "no bound".
NUMERIC = /^-?\d+(\.\d+)?$/

class RangeNumberFilter extends RangeBase

  range_type: 'number'

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...


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
      @_el(@from_id).addClass('inuse')
    else
      @_el(@from_id).removeClass('inuse')

    if max != ''
      @_el(@to_id).addClass('inuse')
    else
      @_el(@to_id).removeClass('inuse')

    search_value = "#{min}#{@range_delimiter}#{max}"

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, from: min, to: max)


  # Strict, and trimmed first. Unary plus reads a blank string as 0, so a bound
  # left with nothing but a space — a paste, a half-erased value — went to the
  # server as ">= 0" instead of being treated as open. It also read '1e3' as
  # 1000, which is not something anyone typed on purpose in an age field.
  _int_or_empty_string: (value) ->
    value = String(value ? '').trim()
    return '' if !NUMERIC.test(value)

    +value


export default RangeNumberFilter
