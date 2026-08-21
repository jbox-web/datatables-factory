import BaseFilter from './base_filter.coffee'

class RangeBase extends BaseFilter

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # fetch mandatory data
    @from_placeholder = @filter_default_label[0]
    @to_placeholder   = @filter_default_label[1]

    # fetch optional data
    @range_delimiter  = @options.filter_range_delimiter or '-dtf_delim-'

    # build ids
    @wrapper_outer_id = "dtf-filter-wrapper-#{@datatable_filter.dt_id}-#{@column_id}"
    @wrapper_inner_id = "dtf-filter-wrapper-inner-#{@datatable_filter.dt_id}-#{@column_id}"
    @from_id          = "dtf-filter-#{@datatable_filter.dt_id}-from-#{@range_type}-#{@column_id}"
    @to_id            = "dtf-filter-#{@datatable_filter.dt_id}-to-#{@range_type}-#{@column_id}"
    @reset_id         = "dtf-filter-#{@datatable_filter.dt_id}-reset-#{@range_type}-#{@column_id}"


  ##################
  # PUBLIC METHODS #
  ##################

  create_html: ->
    @logger.info "#{@name()} : create_html"

    # add outer wrapper to hold both filter and reset button
    @_container().append @_html_wrapper_outer()

    # add inner wrapper
    @_container_find('div.dtf-filter-wrapper').append @_html_wrapper_inner()

    # add input fields
    @_container_find('div.dtf-filter-wrapper-inner').append @_html_range_start()
    @_container_find('div.dtf-filter-wrapper-inner').append @_html_range_separator()
    @_container_find('div.dtf-filter-wrapper-inner').append @_html_range_end()

    # add reset button
    if @filter_reset_button
      @_container_find('div.dtf-filter-wrapper').append @_html_reset_button()


  bind_inputs: ->
    super()

    # bind input fields
    delay = @options.filter_delay or 0

    onkeyup_callback = (event) =>
      @_range_change(event)
      return

    @_el(@from_id).on('keyup', @_with_delay(onkeyup_callback, delay))
    @_el(@to_id).on('keyup', @_with_delay(onkeyup_callback, delay))

    # bind reset button
    onclick_callback = (event) =>
      @_range_clear(event)
      return

    @_el(@reset_id).on('click', onclick_callback)


  restore_state: ->
    super()

    saved_state = @datatable_filter.has_state_for(@column_id)

    if saved_state?
      restored_from = saved_state.from
      restored_to   = saved_state.to

      if restored_from != ''
        @_el(@from_id).val(restored_from).addClass('inuse')

      if restored_to != ''
        @_el(@to_id).val(restored_to).addClass('inuse')


  reset: (event) ->
    super(event)

    @_el(@from_id).val('').removeClass('inuse')
    @_el(@to_id).val('').removeClass('inuse')

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, '')

    # save current value
    @_reset_state(@column_id)


  current_value: ->
    { from: @_el(@from_id).val(), to: @_el(@to_id).val() }


  ###################
  # PRIVATE METHODS #
  ###################

  _html_wrapper_outer: ->
    callback = (event) =>
      @stop_propagation(event)

    options =
      id:    @wrapper_outer_id
      class: 'dtf-filter-wrapper'

    $('<div/>', options)
      .on('click', callback)
      .on('mousedown', callback)


  _html_wrapper_inner: ->
    options =
      id:    @wrapper_inner_id
      class: 'dtf-filter-wrapper-inner'

    $('<div/>', options)


  _html_range_start: ->
    callback = (event) =>
      @prevent_default_on_enter(event)

    options =
      id:          @from_id
      class:       "dtf-filter-range dtf-filter-range-#{@range_type} dtf-filter-range-start"
      placeholder: @from_placeholder

    $('<input/>', options)
      .attr(@_autofill_off())
      .on('keydown', callback)


  _html_range_end: ->
    callback = (event) =>
      @prevent_default_on_enter(event)

    options =
      id:          @to_id
      class:       "dtf-filter-range dtf-filter-range-#{@range_type} dtf-filter-range-end"
      placeholder: @to_placeholder

    $('<input/>', options)
      .attr(@_autofill_off())
      .on('keydown', callback)


  # via .attr() et non le hash de $('<input/>', …) : 'autocomplete' y serait
  # interprété comme un appel à la méthode jQuery-UI .autocomplete() (qui lève).
  # empêche les gestionnaires de mots de passe (Bitwarden, 1Password, LastPass…) d'injecter leur autofill
  _autofill_off: ->
    autocomplete:     'off'
    'data-bwignore':  '1'
    'data-lpignore':  'true'
    'data-1p-ignore': ''


  _html_range_separator: ->
    options =
      class: "dtf-filter-range-#{@range_type}-separator"

    $('<span/>', options)


  _range_change: (event) ->
    @logger.info "#{@name()} : _range_change"
    @logger.dump(event)


  _range_clear: (event) ->
    @logger.info "#{@name()} : _range_clear"
    @logger.dump(event)

    current_value = @current_value()
    return if current_value.from == '' and current_value.to == ''

    @_el(@from_id).val('').removeClass('inuse')
    @_el(@to_id).val('').removeClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, @range_delimiter)

    # save current value
    @_save_state(@column_id, from: '', to: '')


  _debug_log: ->
    super()

    @logger.info("container_id: #{@container_id}")
    @logger.info("wrapper_outer_id: #{@wrapper_outer_id}")
    @logger.info("wrapper_inner_id: #{@wrapper_inner_id}")
    @logger.info("from_id: #{@from_id}")
    @logger.info("to_id: #{@to_id}")
    @logger.info("from_placeholder: #{@from_placeholder}")
    @logger.info("to_placeholder: #{@to_placeholder}")


export default RangeBase
