import Extendable from '../../extendable.coffee'
import WithLogger from '../../modules/with_logger.coffee'

class BaseFilter extends Extendable
  @extend  WithLogger.class_methods
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
    @create_html()
    @bind_inputs()
    @restore_state()


  name: ->
    "#{@dt_class}/#{this.constructor.name}##{@column_id}"


  # implementation (must be overriden)
  create_html: ->
    @logger.info "#{@name()} : create_html"


  bind_inputs: ->
    @logger.info "#{@name()} : bind_inputs"


  restore_state: ->
    @logger.info "#{@name()} : restore_state"


  set: (value) ->
    @logger.info "#{@name()} : set"
    @logger.dump value


  reset: (event) ->
    @logger.info "#{@name()} : reset"
    @logger.dump event


  reload: (event) ->
    @logger.info "#{@name()} : reload"
    @logger.dump event


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

  _html_wrapper: ->
    options =
      id:    @wrapper_id
      class: 'yadcf-filter-wrapper'

    $('<div/>', options)


  _html_reset_button: ->
    callback = (event) =>
      @stop_propagation(event)

    options =
      type:  'button'
      id:    @reset_id
      text:  @filter_reset_button_text
      class: 'yadcf-filter-reset-button'

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


  _with_delay: (callback, ms) ->
    timer = 0
    ->
      context = this
      args = arguments
      clearTimeout timer
      timer = setTimeout((->
        callback.apply context, args
        return
      ), ms or 0)
      return


export default BaseFilter
