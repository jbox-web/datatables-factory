import dig from 'object-dig'

import Utils           from '../utils.coffee'
import Logger          from '../logger.coffee'
import DatatableFilter from '../model/datatable_filter.coffee'

Loader = {}

Loader.class_methods =

  ########################
  # Public Class methods #
  ########################

  ajax: (url, data, callback, dtf_options = {}) ->
    on_422 = dtf_options['on_422'] or ->
      msg      = dtf_options['session_expired_message'] or 'Session expired, please log in again.'
      login_url = dtf_options['login_url'] or '/'
      alert msg
      window.location.href = login_url

    $.ajax
      url: url
      type: dtf_options['http_method'] or 'POST'
      data: JSON.stringify(data)
      contentType: 'application/json'
      statusCode:
        422: on_422

      success: (data, _textStatus, _jqXHR) ->
        callback(data)


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
    path = string.split('.')
    constant = dig(window, ...path)
    return constant


  to_underscore: (string) ->
    string.split(/(?=[A-Z])/).join('_').toLowerCase()


Loader.instance_methods =

  ###########################
  # Public Instance methods #
  ###########################

  init_datatable: ->
    @info('Create Datatable')

    # create filters just after dt initialization
    $(@dt_id).on 'preInit.dt', (event, settings) =>
      @info('preInit.dt callback was called, set filters if exist')

      @datatable = new $.fn.dataTable.Api(settings)
      @init_filters(event)

    $(@dt_id).DataTable(@dt_options)

    @info('Datatable created')


  init_filters: (event)  ->
    return if @filters.length == 0

    @info('Load Datatable filters')

    @datatable_filter = new DatatableFilter(this, @filters, @filters_applied, @logger)
    @datatable_filter.load()
    @datatable_filter.apply_default_filters(event)

    form = $(@dt_id + '_wrapper').parent()

    if form?
      $(form).find('.yadcf-filter-wrapper').each ->
        $(this).children().wrapAll('<div class="col-md-12"></div>').wrapAll('<div class="input-group"></div>')
        $(this).children().wrapAll('<div class="mb-3 row"></div>')

      # Bootstrap 5 : le bouton reset est enfant direct de .input-group (plus de wrapper .input-group-btn)
      # La classe du bouton est configurable via dtf_options (filter_reset_button_class)
      reset_class = @dtf_options?['filter_reset_button_class'] || 'btn btn-secondary'
      $(form).find('.yadcf-filter-reset-button').addClass(reset_class)
      $(form).find('.yadcf-filter').addClass('form-control')

      # Optional icon declared on the Rails side (f.text_field :name, icon: 'magnifying-glass')
      @_prepend_filter_icons(form)

    @info('Datatable filters loaded')


  loader_load_callbacks: ->
    @_loader_load_ajax_callbacks()
    @_loader_load_created_row_callbacks()
    @_loader_load_draw_callbacks()
    @_loader_load_buttons_callbacks()


  ############################
  # Private Instance methods #
  ############################

  # Prepend a FontAwesome icon (input-group-text) to each filter declaring an
  # `icon` option. Styling/responsive behavior is left to the host application
  # through the .dtf-filter-icon class.
  _prepend_filter_icons: (form) ->
    for filter in @filters
      continue if !filter.icon?

      group = $(form).find("##{filter.filter_container_id} .input-group").first()
      continue if group.length == 0 || group.children('.dtf-filter-icon').length > 0

      group.prepend("<span class=\"input-group-text dtf-filter-icon\"><i class=\"fa-solid fa-#{filter.icon}\"></i></span>")


  _loader_load_ajax_callbacks: ->
    @info('Build datatable callbacks options : ajax')

    if @callbacks['ajax'].length > 0
      local_opts = @_build_ajax_option_with_callbacks()
    else
      local_opts = @_build_ajax_option_without_callbacks()

    @dt_options = Utils.merge_hash(@dt_options, local_opts)


  _loader_load_created_row_callbacks: ->
    @info('Build datatable callbacks options : createdRow')

    # Keep a local reference for the createdRow option
    callbacks = @callbacks['createdRow']

    local_opts =
      createdRow: (row, data, index, cells) ->
        for c in callbacks
          c(row, data, index, cells)

    @dt_options = Utils.merge_hash(@dt_options, local_opts)


  _loader_load_draw_callbacks: ->
    @info('Build datatable callbacks options : drawCallback')

    # Keep a local reference for the drawCallback option
    callbacks = @callbacks['drawCallback']

    local_opts =
      drawCallback: (settings) ->
        for c in callbacks
          c(settings)

    @dt_options = Utils.merge_hash(@dt_options, local_opts)


  _loader_load_buttons_callbacks: ->
    @info('Build datatable callbacks options : buttons')

    callback = (dt_class, _data, _status, _xhr) ->
      klass = Loader.class_methods.constantize(dt_class)
      klass.instance.datatable.ajax.reload()

    @callbacks['buttons']['select_all']      = { success: [callback] }
    @callbacks['buttons']['reset_selection'] = { success: [callback] }


  _select: (obj, predicate) ->
    res = {}
    res[k] = v for k, v of obj when predicate(k, v)
    res


  _build_ajax_option_with_callbacks: ->
    # Keep a local reference for the ajax option
    url         = @dt_options['source']
    callbacks   = @callbacks['ajax']
    dtf_options = @dtf_options

    ajax: (data, callback, _settings) ->
      for c in callbacks
        data = Utils.merge_hash(data, c(data))

      Loader.class_methods.ajax(url, data, callback, dtf_options)


  _build_ajax_option_without_callbacks: ->
    url         = @dt_options['source']
    dtf_options = @dtf_options

    ajax: (data, callback, _settings) ->
      Loader.class_methods.ajax(url, data, callback, dtf_options)


export default Loader
