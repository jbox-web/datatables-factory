import Logger          from '../logger.coffee'
import DatatableFilter from '../model/datatable_filter.coffee'

Loader = {}

Loader.class_methods =

  ########################
  # Public Class methods #
  ########################

  load_datatables: ->
    $('[data-toggle=datatable]').each ->
      data = $(this).data()
      loader = Loader.class_methods.extract_options(data, 'dtfLoader').loader
      Loader.class_methods.load(loader)


  load: (loader) ->
    logger = new Logger(loader.dtf_options)

    logger.log_delimiter()
    logger.info('* Class loader received data:')

    logger.info("id: '#{loader.dt_id}'")
    logger.info("class: '#{loader.dt_class}'")

    logger.info('dt_options:')
    logger.dump(loader.dt_options)

    logger.info('dtf_options:')
    logger.dump(loader.dtf_options)

    # Find datatable class
    klass = Loader.class_methods.constantize(loader.dt_class)
    if not klass?
      logger.error("Datatable '#{loader.dt_class}' not found")
      return false

    if klass.instance?
      logger.info("* Trigger full reloading of datatable '#{loader.dt_class}'")
      klass.instance.destroy()
      delete klass.instance

    logger.info("* Loading datatable '#{loader.dt_class}'")
    klass.instance = Loader.class_methods.create(klass, loader.dt_class, loader.dt_id, loader.dt_options, loader.dtf_options, logger)

    logger.info("* Loaded datatable '#{loader.dt_class}'")
    logger.log_delimiter()

    return klass


  create: (klass, dt_class, dt_id, dt_options, dtf_options, logger) ->
    table = new klass(dt_class, dt_id, dt_options, dtf_options, logger)
    table.load()
    return table


  extract_options: (data, prefix) ->
    options = {}
    for own key, value of data
      options[Loader.class_methods.to_underscore(key).split('_')[1]] = value if key.startsWith(prefix)
    return options


  constantize: (string) ->
    constant = null
    eval("constant = window.#{string}")
    return constant


  to_underscore: (string) ->
    string.split(/(?=[A-Z])/).join('_').toLowerCase()


Loader.instance_methods =

  ###########################
  # Public Instance methods #
  ###########################

  init_datatable: ->
    @info('Create Datatable')

    @datatable = $(@dt_id).DataTable(@dt_options)

    @info('Datatable created')


  init_filters: ->
    return if @filters.length == 0

    @info('Load Datatable filters')

    @datatable_filter = new DatatableFilter(this, @filters, @filters_applied, @logger)
    @datatable_filter.load()

    form = $(@dt_id + '_wrapper').parent()

    if form?
      $(form).find('.yadcf-filter-wrapper').each ->
        $(this).children().wrapAll('<div class="col-md-12"></div>').wrapAll('<div class="input-group"></div>')
        $(this).children().wrapAll('<div class="form-group row"></div>')

      $(form).find('.yadcf-filter-reset-button').addClass('btn btn-default').wrap('<span class="input-group-btn"></span>')
      $(form).find('.yadcf-filter').addClass('form-control')

    @info('Datatable filters loaded')


  loader_load_callbacks: ->
    @_loader_load_ajax_callbacks()
    @_loader_load_created_row_callbacks()
    @_loader_load_draw_callbacks()


  ############################
  # Private Instance methods #
  ############################

  _loader_load_ajax_callbacks: ->
    @info('Build datatable callbacks options : ajax')

    # Keep a local reference for the ajax option
    callbacks = @callbacks['ajax']

    if @callbacks['ajax'].length > 0
      local_opts =
        ajax:
          url:  @dt_options['source']
          type: 'POST'
          data: (d) ->
            data = {}
            for c in callbacks
              data = $.extend {}, data, c(d)
            data

    else
      local_opts =
        ajax:
          url:  @dt_options['source']
          type: 'POST'

    @dt_options = $.extend {}, @dt_options, local_opts


  _loader_load_created_row_callbacks: ->
    @info('Build datatable callbacks options : createdRow')

    # Keep a local reference for the createdRow option
    callbacks = @callbacks['createdRow']

    local_opts =
      createdRow: (row, data, index, cells) ->
        for c in callbacks
          c(row, data, index, cells)

    @dt_options = $.extend {}, @dt_options, local_opts


  _loader_load_draw_callbacks: ->
    @info('Build datatable callbacks options : drawCallback')

    # Keep a local reference for the drawCallback option
    callbacks = @callbacks['drawCallback']

    local_opts =
      drawCallback: (settings) ->
        for c in callbacks
          c(settings)

    @dt_options = $.extend {}, @dt_options, local_opts


  _select: (obj, predicate) ->
    res = {}
    res[k] = v for k, v of obj when predicate(k, v)
    res


export default Loader
