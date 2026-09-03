import Extendable from '../../extendable.coffee'
import WithLogger from '../../modules/with_logger.coffee'

class BaseFilter extends Extendable
  @include WithLogger.instance_methods


  @build: (datatable_filter, logger, options) ->
    object = new @(datatable_filter, logger, options)
    object.bind()
    object


  constructor: (@datatable_filter, @logger, @options) ->
    # Call Extendable parent
    super arguments...

    # Get datatable JS class
    @dt_class = @datatable_filter.dt_class

    # fetch mandatory data
    @column_id            = @options.column_id
    @filter_default_label = @options.filter_default_label

    # fetch optional data
    @filter_css_class         = @options.filter_css_class or ''
    @filter_reset_button      = if @options.filter_reset_button == false then false else true
    @filter_reset_button_text = @options.filter_reset_button_text or 'x'

    # build ids
    @container_id = "##{@options.filter_container_id}"


  ##################
  # PUBLIC METHODS #
  ##################

  # loader
  bind: ->
    @logger.info("* Loading '#{@name()}'")
    @_debug_log() if @options.debug == true
    # Cleared, not appended to. The container is rendered empty by the server
    # (SearchFormBuilder#basic_field emits tag.div('')), so anything inside it
    # was put there by an earlier build of this same filter. create_html only
    # appends: without this, a rebuild stacked a second widget set on the first,
    # both answering to the same ids — measured at 2 wrappers and 3 inputs after
    # a single Turbo restoration visit, with the visible input bound to the
    # instance that had just been destroyed.
    @_container().empty()
    @create_html()
    @bind_inputs()
    @restore_state()


  name: ->
    "#{@dt_class}/#{this.constructor.name}##{@column_id}"


  create_html: ->
    @logger.info "#{@name()} : create_html"
    @_container().append @_html_wrapper()
    @_container_find('div.dtf-filter-wrapper').append @_html_input_field()
    if @filter_reset_button
      @_container_find('div.dtf-filter-wrapper').append @_html_reset_button()


  bind_inputs: ->
    @logger.info "#{@name()} : bind_inputs"


  restore_state: ->
    @logger.info "#{@name()} : restore_state"


  set: (value) ->
    @logger.info => "#{@name()} : set"
    @logger.dump value


  reset: (event) ->
    @logger.info => "#{@name()} : reset"
    @logger.dump event


  reload: (event) ->
    @logger.info => "#{@name()} : reload"
    @logger.dump event


  # Every filter has one, so DatatableFilter#destroy always has something to
  # call. A debounced keyup scheduled just before a teardown used to fire
  # afterwards — measured: one _run_filter call landing on the destroyed
  # DatatableFilter, which reaches into a DataTables instance that is gone and
  # then schedules a state write nobody will cancel. Subclasses that tear a
  # plugin down call super().
  destroy: ->
    clearTimeout(@_delay_timer) if @_delay_timer?
    @_delay_timer = null


  prevent_default_on_enter: (event) ->
    if event.keyCode == 13
      if event.preventDefault
        event.preventDefault()
      else
        event.returnValue = false
    return


  stop_propagation: (event) ->
    if event.stopPropagation?
      event.stopPropagation()
    else
      event.cancelBubble = true
    return


  ###################
  # PRIVATE METHODS #
  ###################

  # DOM helpers — single jQuery dependency point
  _el: (id) -> $("##{id}")
  _container: -> $(@container_id)
  _container_find: (selector) -> $("#{@container_id} #{selector}")


  _html_wrapper: ->
    options =
      id:    @wrapper_id
      class: 'dtf-filter-wrapper'

    $('<div/>', options)


  _html_reset_button: ->
    callback = (event) =>
      @stop_propagation(event)

    options =
      type:  'button'
      id:    @reset_id
      text:  @filter_reset_button_text
      class: 'dtf-filter-reset-button'

    $('<button/>', options)
      .on('mousedown', callback)


  _reset_state: (column_id) ->
    @_save_state(column_id, undefined)


  _save_state: (column_id, data) ->
    @datatable_filter.save_state(column_id, data)


  _set_search_value: (column_id, value) ->
    @datatable_filter.set_search_value(column_id, value)


  _run_filter: (column_id, value) ->
    @datatable_filter.run_filter(column_id, value)


  _debug_log: ->
    @logger.info "#{@name()} : _debug_log"
    @logger.dump(@options)
    @logger.info("column_id: #{@column_id}")


  _skip_key_codes: ->
    [
      37
      38
      39
      40
    ]


  # The timer lives on the filter, not in the closure, for two reasons: destroy()
  # has to be able to cancel it, and a range filter builds this twice — one
  # handler per bound — which gave the two inputs of a single filter independent
  # timers, so typing in one no longer cancelled the other's pending call.
  _with_delay: (callback, ms) ->
    filter = this
    ->
      context = this
      args = arguments
      clearTimeout filter._delay_timer if filter._delay_timer?
      filter._delay_timer = setTimeout((->
        filter._delay_timer = null
        callback.apply context, args
        return
      ), ms or 0)
      return


export default BaseFilter
