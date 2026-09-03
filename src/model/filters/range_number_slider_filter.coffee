import Utils             from '../../utils.coffee'
import RangeNumberFilter from './range_number_filter.coffee'

# A numeric range driven by a slider rather than by typing. The two inputs of
# RangeNumberFilter are kept and go on carrying the value — the slider writes
# into them — so current_value, the saved state, the reset button and the
# `min-dtf_delim-max` wire format are inherited untouched and the server sees
# exactly what a plain range_number sends. They are hidden while the slider is
# up: two editable controls for one filter would be free to disagree.
#
# Bounds cannot be derived here the way yadcf derives them: in server-side mode
# the page holds one draw's worth of rows, not the column's extent. They are
# declared through SearchFormBuilder#range_slider, which refuses to render
# without them.
class RangeNumberSliderFilter extends RangeNumberFilter

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # fetch mandatory data
    @range_min = @options.filter_range_min
    @range_max = @options.filter_range_max

    # fetch optional data
    @range_step = @options.filter_range_step or 1

    # build ids
    @slider_id = "dtf-filter-slider-#{@datatable_filter.dt_id}-#{@column_id}"


  ##################
  # PUBLIC METHODS #
  ##################

  create_html: ->
    super()

    @_container_find('div.dtf-filter-wrapper-inner').append @_html_slider()


  bind_inputs: ->
    # Bound first and left in place: they are what keeps the filter usable when
    # the library below turns out to be missing.
    super()

    if typeof noUiSlider == 'undefined'
      @logger.error("#{@name()} : noUiSlider is not loaded, falling back to plain inputs")
      return

    @_bind_slider()
    @_hide_inputs()


  restore_state: ->
    super()

    @_slider_from_inputs()


  reset: (event) ->
    super(event)

    @_slider_reset()


  destroy: ->
    super()
    @slider?.destroy()


  ###################
  # PRIVATE METHODS #
  ###################

  _html_slider: ->
    options =
      id:    @slider_id
      class: 'dtf-filter-slider'

    $('<div/>', options)


  _bind_slider: ->
    defaults =
      start:    [@range_min, @range_max]
      range:    { min: @range_min, max: @range_max }
      step:     @range_step
      connect:  true
      tooltips: true
      # The stock formatter renders every value with two decimals, so an integer
      # range would filter on "20.00". Decimals follow the declared step.
      format:
        to:   (value) => @_format_number(value)
        from: (value) -> Number(value)

    @slider = noUiSlider.create(document.getElementById(@slider_id), Utils.merge_hash(defaults, @options.filter_plugin_options or {}))

    # 'update' fires on every move and on programmatic set; 'change' only when
    # the user lets go of a handle. Filtering on 'update' would post a request
    # per pixel dragged, and would also fire on each state restore.
    @slider.on 'update', (values) =>
      @_slider_update(values)
      return

    @slider.on 'change', (values) =>
      @_slider_change(values)
      return


  _slider_update: (values) ->
    @_el(@from_id).val(values[0])
    @_el(@to_id).val(values[1])


  _slider_change: (values) ->
    @_slider_update(values)

    # No keyCode: the inherited handler skips the arrow keys, and a released
    # handle is not a keystroke.
    @_range_change({})


  _slider_reset: ->
    @slider?.set([@range_min, @range_max])


  # The inputs are the source of truth here too: RangeBase#restore_state has just
  # filled them from the saved state, and an unfilled side means "open", which
  # for a slider is the declared bound.
  _slider_from_inputs: ->
    return unless @slider?

    from = @_int_or_empty_string(@_el(@from_id).val())
    to   = @_int_or_empty_string(@_el(@to_id).val())

    from = @range_min if from == ''
    to   = @range_max if to == ''

    @slider.set([from, to])


  _hide_inputs: ->
    @_el(@from_id).hide()
    @_el(@to_id).hide()
    @_container_find("span.dtf-filter-range-#{@range_type}-separator").hide()


  _format_number: (value) ->
    Number(value).toFixed(@_decimals())


  _decimals: ->
    parts = String(@range_step).split('.')
    if parts.length > 1 then parts[1].length else 0


  _range_clear: (event) ->
    super(event)

    @_slider_reset()


  _debug_log: ->
    super()

    @logger.info("slider_id: #{@slider_id}")
    @logger.info("range_min: #{@range_min}")
    @logger.info("range_max: #{@range_max}")
    @logger.info("range_step: #{@range_step}")


export default RangeNumberSliderFilter
