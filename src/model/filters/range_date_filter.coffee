import RangeBase from './range_base.coffee'

class RangeDateFilter extends RangeBase

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # customize class
    @range_type = 'date'

    # fetch datepicker data
    @filter_plugin         = @options.filter_plugin
    @filter_plugin_options = $.extend({}, { onSelect: @_date_select }, @options.filter_plugin_options)


  bind_inputs: ->
    super()

    # load datepicker with callbacks
    $("##{@from_id}").datepicker $.extend(@filter_plugin_options, onClose: (selected_date) ->
      $("##{@to_id}").datepicker 'option', 'minDate', selected_date
      return
    )

    $("##{@to_id}").datepicker $.extend(@filter_plugin_options, onClose: (selected_date) ->
      $("##{@from_id}").datepicker 'option', 'maxDate', selected_date
      return
    )


  ###################
  # PRIVATE METHODS #
  ###################

  _date_select: (_date, _event) =>
    @logger.info "#{@name()} : _date_select"

    current_value = @current_value()

    from = current_value.from
    to = current_value.to

    search_value = "#{from}#{@range_delimiter}#{to}"

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, from: from, to: to)


  _range_change: (event) ->
    super(event)

    return if @_skip_key_codes().includes(event.keyCode)

    current_value = @current_value()

    date_from = @_date_or_empty_string(current_value.from)
    date_to   = @_date_or_empty_string(current_value.to)

    if date_from instanceof Date
      $("##{@from_id}").addClass('inuse')
      from = current_value.from
    else
      $("##{@from_id}").removeClass('inuse')
      from = ''

    if date_to instanceof Date
      $("##{@to_id}").addClass('inuse')
      to = current_value.to
    else
      $("##{@to_id}").removeClass('inuse')
      to = ''

    search_value = "#{from}#{@range_delimiter}#{to}"

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, search_value)

    # save current value
    @_save_state(@column_id, from: from, to: to)


  _date_or_empty_string: (value) ->
    return '' if value == ''

    date_format = @options.filter_plugin_options.dateFormat

    try
      $.datepicker.parseDate(date_format, value)
    catch e
      @logger.error("error while parsing date : #{e}")
      ''


export default RangeDateFilter
