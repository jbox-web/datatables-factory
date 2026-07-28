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

    # Without a handler, a 500 or a dropped connection leaves DataTables stuck
    # on "Processing…" forever, with nothing reported to the user or the console.
    on_error = dtf_options['on_error'] or (xhr, status, error) ->
      console.error("DatatableFactory : table load failed (#{xhr.status} #{status}) #{error}")

    $.ajax
      url: url
      type: dtf_options['http_method'] or 'POST'
      data: JSON.stringify(data)
      contentType: 'application/json'
      headers: Loader.class_methods.csrf_headers()
      statusCode:
        422: on_422

      success: (data, _textStatus, _jqXHR) ->
        callback(data)

      error: (xhr, status, error) ->
        # 422 is already routed to on_422; an abort is not a failure.
        return if xhr.status == 422 or status == 'abort'
        on_error(xhr, status, error)


  # The table load is a POST, so Rails rejects it without the token. The
  # resulting 422 is indistinguishable from an expired session, which sends the
  # reader down the wrong path entirely — so send the token up front.
  # Applications that already inject it globally (e.g. through an
  # $.ajaxPrefilter) simply overwrite this header, harmlessly.
  csrf_headers: ->
    token = $('meta[name="csrf-token"]').attr('content')
    if token? then { 'X-CSRF-Token': token } else {}


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

    # create filters just after dt initialization.
    # The handler is namespaced and cleared first: when a table is reloaded in
    # place the node is reused, so the previous instance would still be
    # subscribed and would re-assign its own @datatable on the next init —
    # resurrecting the very instance that was just destroyed.
    $(@dt_id).off('preInit.dt.dtf').on 'preInit.dt.dtf', (event, settings) =>
      @info('preInit.dt callback was called, set filters if exist')

      @datatable = new $.fn.dataTable.Api(settings)
      @init_filters(event)

    $(@dt_id).DataTable(@dt_options)

    # After DataTable(), not before: the call above fires preInit, and the
    # DatatableFilter built there clears every xhr.dt handler on the node
    # (_bind_datatable) — a handler bound earlier would be dropped on the spot.
    # Bound outside init_filters on purpose too: a table without any declared
    # filter can land on an out-of-range page just as well.
    $(@dt_id).off('xhr.dt.dtf-paging').on 'xhr.dt.dtf-paging', (_event, settings, json) =>
      @_reset_stale_page(settings, json)

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
    @_loader_load_state_params()


  ############################
  # Private Instance methods #
  ############################

  # Prepend a FontAwesome icon (input-group-text) to each filter declaring an
  # `icon` option. Styling/responsive behavior is left to the host application
  # through the .dtf-filter-icon class.
  _prepend_filter_icons: (form) ->
    for filter in @filters
      continue if !filter.icon?
      # Icon names are interpolated into a class attribute: restrict them to the
      # FontAwesome charset so no markup can be injected.
      continue if !/^[a-z0-9-]+$/.test(filter.icon)

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


  # The saved state restores the page the table was last left on. Filters coming
  # from the URL make that page meaningless: a filtered set is shorter, so the
  # page usually falls past the last row and the first draw asks the server for
  # an offset it cannot serve — the link lands on an empty table announcing
  # "showing 11 to 2 of 2".
  #
  # It has to be dropped from the state itself: DataTables applies the state
  # after preInit, so moving the offset from DatatableFilter (built there) is
  # undone right after. stateLoadParams is the documented hook, and it only
  # exists as an init option — hence here, before the table is created.
  _loader_load_state_params: ->
    return if !DatatableFilter.carries_url_filters()

    @info('Build datatable options : drop the saved page (URL carries filters)')

    previous = @dt_options['stateLoadParams']

    local_opts =
      stateLoadParams: (settings, data) ->
        previous?(settings, data)
        data.start = 0

    @dt_options = Utils.merge_hash(@dt_options, local_opts)


  # Last line of defence against a page that no longer exists. The saved state
  # restores the page the table was last left on, and nothing guarantees it
  # still holds rows: records may have been deleted, a scope narrowed, or a
  # `populate_with` default applied on load (_apply_filters only redraws on a
  # click). Server-side, the offset then goes out as-is and the table renders
  # empty while announcing "showing 11 to 3 of 3" — results exist, none are
  # shown, and nothing in the page gets the user out of it.
  #
  # Only reachable when the offset is genuinely past the last row, so the extra
  # request is paid in the broken case alone. Going back to the first page
  # rather than the last valid one matches what DataTables does when a search
  # shrinks the set. No recursion: the new request carries start = 0.
  _reset_stale_page: (settings, json) ->
    return if !json?

    filtered = json['recordsFiltered']
    return if !filtered? or filtered <= 0

    api = new $.fn.dataTable.Api(settings)
    return if api.page.info().start < filtered

    @info("Saved page is past the last row (#{filtered} records), back to the first one")
    api.page(0).draw('page')


  _loader_load_buttons_callbacks: ->
    @info('Build datatable callbacks options : buttons')

    callback = (dt_class, _data, _status, _xhr) ->
      klass = Loader.class_methods.constantize(dt_class)
      klass.instance.datatable.ajax.reload()

    # Merge, never assign: before_init runs first, so a consumer may already
    # have registered beforeSend/error/success callbacks here.
    for button_name in ['select_all', 'reset_selection']
      entry = @callbacks['buttons'][button_name] or {}
      entry['success'] = (entry['success'] or []).concat([callback])
      @callbacks['buttons'][button_name] = entry


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
