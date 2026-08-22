import Utils          from '../../utils.coffee'
import WithDatePicker from '../../modules/with_date_picker.coffee'
import TextFilter     from './text_filter.coffee'

# A single date, not a range. It is a text filter that happens to carry a picker:
# one input, one value, the raw value on the wire — so the server needs nothing it
# does not already handle for `text`. What the date brings on top is a grammar,
# hence the two overrides below.
class DateFilter extends TextFilter
  @include WithDatePicker.instance_methods

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # fetch datepicker data
    @filter_plugin         = @options.filter_plugin
    @filter_plugin_options = Utils.merge_hash({ onSelect: @_date_select }, @options.filter_plugin_options)


  ##################
  # PUBLIC METHODS #
  ##################

  bind_inputs: ->
    super()

    # Mirrors RangeDateFilter#bind_inputs: `filter_plugin` arrives from the
    # server, anything other than 'flatpickr' means jQuery UI, and a declared
    # plugin that the host forgot to load must not take the table's
    # initialisation down — the keyup handler filters on its own.
    switch @filter_plugin
      when 'flatpickr'
        if typeof flatpickr == 'undefined'
          @logger.error("#{@name()} : flatpickr is not loaded, falling back to a plain input")
        else
          @_bind_flatpickr()
      else
        if @_datepicker_loaded()
          @_bind_jquery_ui()
        else
          @logger.error("#{@name()} : jQuery UI datepicker is not loaded, falling back to a plain input")


  destroy: ->
    switch @filter_plugin
      when 'flatpickr'
        @picker?.destroy()
      else
        return unless @_datepicker_loaded()

        @_el(@input_id).datepicker('destroy')


  ###################
  # PRIVATE METHODS #
  ###################

  _datepicker_loaded: ->
    $.fn.datepicker?


  _bind_jquery_ui: ->
    @_el(@input_id).datepicker(@filter_plugin_options)


  # flatpickr is a global the host application provides, exactly like TomSelect.
  # Its options are taken raw from the server: `onSelect` — a jQuery UI callback
  # — has no meaning here, hence @options.filter_plugin_options rather than the
  # merged @filter_plugin_options.
  _bind_flatpickr: ->
    @picker = flatpickr(document.getElementById(@input_id), Utils.merge_hash(@options.filter_plugin_options or {}, onChange: (_dates, date_string) =>
      @_date_select(date_string, {})
      return
    ))


  # Picking a date fires no keyup, so the inherited handler would leave the table
  # on its previous result until the next keystroke.
  _date_select: (_date, _event) =>
    @logger.info "#{@name()} : _date_select"

    @_text_change({})


  # An unparsable value is not "in use" — a half-typed date must not light the
  # input up as if it were filtering.
  _empty_value: (value) ->
    not (@_date_or_empty_string(value) instanceof Date)


  _search_value: (value) ->
    if @_empty_value(value) then '' else value


export default DateFilter
