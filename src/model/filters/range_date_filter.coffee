import Utils     from '../../utils.coffee'
import RangeBase from './range_base.coffee'

class RangeDateFilter extends RangeBase

  range_type: 'date'

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # fetch datepicker data
    @filter_plugin         = @options.filter_plugin
    @filter_plugin_options = Utils.merge_hash({ onSelect: @_date_select }, @options.filter_plugin_options)


  bind_inputs: ->
    super()

    # load datepicker with callbacks
    @_el(@from_id).datepicker Utils.merge_hash(@filter_plugin_options, onClose: (selected_date) =>
      @_el(@to_id).datepicker 'option', 'minDate', selected_date
      return
    )

    @_el(@to_id).datepicker Utils.merge_hash(@filter_plugin_options, onClose: (selected_date) =>
      @_el(@from_id).datepicker 'option', 'maxDate', selected_date
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
      @_el(@from_id).addClass('inuse')
      from = current_value.from
    else
      @_el(@from_id).removeClass('inuse')
      from = ''

    if date_to instanceof Date
      @_el(@to_id).addClass('inuse')
      to = current_value.to
    else
      @_el(@to_id).removeClass('inuse')
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
