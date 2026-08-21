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

    # `filter_plugin` arrives from the server like it does for select filters —
    # see SelectBase#_initialize_select_plugin, which this mirrors. Anything
    # other than 'flatpickr' keeps the historical jQuery UI behaviour, including
    # a filter declared without the option at all.
    switch @filter_plugin
      when 'flatpickr'
        @_bind_flatpickr()
      else
        @_bind_jquery_ui()


  destroy: ->
    switch @filter_plugin
      when 'flatpickr'
        picker.destroy() for picker in [@from_picker, @to_picker] when picker?
      else
        @_el(@from_id).datepicker('destroy')
        @_el(@to_id).datepicker('destroy')


  ###################
  # PRIVATE METHODS #
  ###################

  _bind_jquery_ui: ->
    # load datepicker with callbacks
    @_el(@from_id).datepicker Utils.merge_hash(@filter_plugin_options, onClose: (selected_date) =>
      @_el(@to_id).datepicker 'option', 'minDate', selected_date
      return
    )

    @_el(@to_id).datepicker Utils.merge_hash(@filter_plugin_options, onClose: (selected_date) =>
      @_el(@from_id).datepicker 'option', 'maxDate', selected_date
      return
    )


  # flatpickr is a global the host application provides, exactly like TomSelect.
  # Its options are taken raw from the server: `onSelect` — a jQuery UI callback
  # — has no meaning here, hence @options.filter_plugin_options rather than the
  # merged @filter_plugin_options.
  _bind_flatpickr: ->
    @from_picker = flatpickr(document.getElementById(@from_id), Utils.merge_hash(@options.filter_plugin_options or {}, onChange: (_dates, date_string) =>
      @to_picker?.set('minDate', date_string)
      @_date_select(date_string, {})
      return
    ))

    @to_picker = flatpickr(document.getElementById(@to_id), Utils.merge_hash(@options.filter_plugin_options or {}, onChange: (_dates, date_string) =>
      @from_picker?.set('maxDate', date_string)
      @_date_select(date_string, {})
      return
    ))


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

    try
      @_parse_date(value)
    catch e
      @logger.error("error while parsing date : #{e}")
      ''


  # Parsing goes through the active plugin: a host that ships flatpickr has no
  # $.datepicker, so calling it threw on every keystroke and no date ever counted
  # as "in use". filter_plugin_options is optional in both branches — a filter
  # declared without it would otherwise throw just the same.
  _parse_date: (value) ->
    switch @filter_plugin
      when 'flatpickr'
        date_format = @options.filter_plugin_options?.dateFormat or 'd/m/Y'
        # flatpickr.parseDate answers undefined on a malformed date where jQuery
        # UI throws; the caller branches on the exception, so raise it here.
        parsed = flatpickr.parseDate(value, date_format)
        throw new Error("Invalid date: #{value}") unless parsed instanceof Date
        parsed
      else
        date_format = @options.filter_plugin_options?.dateFormat or 'dd/mm/yy'
        $.datepicker.parseDate(date_format, value)


export default RangeDateFilter
