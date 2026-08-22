# The two date filters — the single `date` and the `range_date` — read the same
# two options (`filter_plugin`, `filter_plugin_options`) and have to answer the
# same question about a typed value: is this a date? Only the number of inputs
# differs between them, so the parsing lives here and the binding stays in each
# filter.
WithDatePicker = {}

WithDatePicker.instance_methods =

  ############################
  # Private Instance methods #
  ############################

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
        return @_parse_date_without_plugin(value) if typeof flatpickr == 'undefined'

        date_format = @options.filter_plugin_options?.dateFormat or 'd/m/Y'
        # flatpickr.parseDate answers undefined on a malformed date where jQuery
        # UI throws; the caller branches on the exception, so raise it here.
        parsed = flatpickr.parseDate(value, date_format)
        throw new Error("Invalid date: #{value}") unless parsed instanceof Date
        parsed
      else
        return @_parse_date_without_plugin(value) unless $.datepicker?

        date_format = @options.filter_plugin_options?.dateFormat or 'dd/mm/yy'
        $.datepicker.parseDate(date_format, value)


  # Only reached when the declared plugin is missing. Refusing every date there
  # would leave the filter unusable from the keyboard too — which is precisely
  # what the fallback exists to preserve. Both formats the gem ships are
  # day/month/year, so that is what this reads.
  _parse_date_without_plugin: (value) ->
    match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value)
    throw new Error("Invalid date: #{value}") unless match

    new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))


export default WithDatePicker
