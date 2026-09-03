import Utils          from '../../utils.coffee'
import WithDatePicker from '../../modules/with_date_picker.coffee'
import RangeBase      from './range_base.coffee'

class RangeDateFilter extends RangeBase
  @include WithDatePicker.instance_methods

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
        # A host can declare the plugin and forget to load it. Throwing here
        # takes the whole table's initialisation down, for a filter that still
        # works as a plain text input — the keyup handler filters on its own.
        if typeof flatpickr == 'undefined'
          @logger.error("#{@name()} : flatpickr is not loaded, falling back to a plain input")
        else
          @_bind_flatpickr()
      else
        # jQuery UI is a peer just like flatpickr, and this is the branch a filter
        # declared without any plugin lands in. Calling .datepicker() blindly took
        # the whole table's initialisation down — columns, sorting and every other
        # filter — for a library missing on a single field.
        if @_datepicker_loaded()
          @_bind_jquery_ui()
        else
          @logger.error("#{@name()} : jQuery UI datepicker is not loaded, falling back to a plain input")


  destroy: ->
    switch @filter_plugin
      when 'flatpickr'
        picker.destroy() for picker in [@from_picker, @to_picker] when picker?
      else
        return unless @_datepicker_loaded()

        @_el(@from_id).datepicker('destroy')
        @_el(@to_id).datepicker('destroy')


  ###################
  # PRIVATE METHODS #
  ###################

  _datepicker_loaded: ->
    $.fn.datepicker?


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


  # Picking a date fires no keyup, so the inherited handler would leave the table
  # on its previous result. It delegates to _range_change rather than repeating
  # it — same reason RangeNumberSliderFilter#_slider_change does: an empty event
  # carries no keyCode, and the arrow-key guard lets it through.
  #
  # Delegating is also what fixes the marker. This method used to build the
  # search value itself and never touched the `inuse` class, so a date chosen in
  # the calendar filtered the table while leaving its input looking empty — the
  # marker only appeared at the next reload, when restore_state put it back. It
  # also sent both bounds raw, where _range_change drops a bound that does not
  # parse.
  _date_select: (_date, _event) =>
    @logger.info "#{@name()} : _date_select"

    @_range_change({})


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


export default RangeDateFilter
