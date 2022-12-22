import Extendable      from '../extendable.coffee'
import Loader          from '../modules/loader.coffee'
import WithLogger      from '../modules/with_logger.coffee'
import WithFilters     from '../modules/with_filters.coffee'
import WithCheckBoxes  from '../modules/with_check_boxes.coffee'
import WithButtons     from '../modules/with_buttons.coffee'
import WithContextMenu from '../modules/with_context_menu.coffee'
import WithDebug       from '../modules/with_debug.coffee'


class DatatableBase extends Extendable
  @extend  Loader.class_methods
  @include Loader.instance_methods

  @extend  WithLogger.class_methods
  @include WithLogger.instance_methods

  @extend  WithFilters.class_methods
  @include WithFilters.instance_methods

  @extend  WithCheckBoxes.class_methods
  @include WithCheckBoxes.instance_methods

  @extend  WithButtons.class_methods
  @include WithButtons.instance_methods

  @extend  WithContextMenu.class_methods
  @include WithContextMenu.instance_methods

  @extend  WithDebug.class_methods
  @include WithDebug.instance_methods


  ####################
  # Class attributes #
  ####################

  @instance: null
  @dtf_options: null

  #######################
  # Instance attributes #
  #######################

  columns: []
  buttons: []
  filters: []
  filters_applied: []
  callbacks: {}


  constructor: (@dt_class, @dt_id, @dt_options, @dtf_options, @logger) ->
    # Call Extendable parent
    super()

    # Extract some options
    @columns         = @dt_options['columns'] || []
    @buttons         = @dt_options['buttons'] || []
    @filters         = @dt_options['filters'] || []
    @filters_applied = @dt_options['filters_applied'] || []

    # Don't polute jQuery Datatable options namespace
    @dt_options    = @_select @dt_options, (k, _v) -> k not in ['filters', 'filters_applied']
    @dt_id_strip   = @dt_id.substring(1)

    # Init callbacks hash
    @callbacks['ajax']                       = []
    @callbacks['createdRow']                 = []
    @callbacks['drawCallback']               = []
    @callbacks['buttons']                    = {}
    @callbacks['buttons']['select_all']      = {}
    @callbacks['buttons']['reset_selection'] = {}

  ###########################
  # Public Instance methods #
  ###########################

  load: ->
    # Call before callback (good to extend options)
    @before_init()

    # Build options
    @loader_load_callbacks()

    # Log final hash options
    @log_final_options()

    # Create the real datatable
    @init_datatable()

    # Call after callback (good to apply CSS rules after rendering)
    @after_init()


  destroy: ->
    @datatable.destroy()
    @datatable = null


  before_init: ->
    @info('Build config')
    @info('Before init callbacks')

    # Load callbacks and buttons
    @with_check_boxes_set_callbacks('before_init')
    @with_context_menu_set_callbacks('before_init')
    @with_debug_set_callbacks('before_init')
    @with_buttons_set_callbacks('before_init')


  after_init: ->
    @info('After init callbacks')

    # Load callbacks
    @with_check_boxes_set_callbacks('after_init')
    @with_context_menu_set_callbacks('after_init')
    @with_debug_set_callbacks('after_init')
    @with_buttons_set_callbacks('after_init')


  log_final_options: ->
    @info('Final config')
    @info('dt_options:')
    @dump(@dt_options)


  find_column_by_name: (column_name) ->
    @_find_column(@columns, column_name)


  ############################
  # Private Instance methods #
  ############################

  _find_column: (columns, column_name) ->
    i = 0
    len = columns.length
    while i < len
      if columns[i].data == column_name
        return [i, columns[i]]
      i++
    null


export default DatatableBase
