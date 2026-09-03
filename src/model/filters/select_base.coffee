import Utils      from '../../utils.coffee'
import BaseFilter from './base_filter.coffee'

class SelectBase extends BaseFilter

  dropdown_data: null

  constructor: (@datatable_filter, @logger, @options) ->
    super arguments...

    # fetch select data
    @filter_plugin         = @options.filter_plugin
    @filter_plugin_options = @options.filter_plugin_options

    # tracks the last rendered dropdown_data, see #reload
    @_dropdown_signature = null

    # build ids
    @wrapper_id = "dtf-filter-wrapper-#{@datatable_filter.dt_id}-#{@column_id}"
    @select_id  = "dtf-filter-#{@datatable_filter.dt_id}-#{@column_id}"
    @reset_id   = "dtf-filter-#{@datatable_filter.dt_id}-reset-#{@column_id}"


  ##################
  # PUBLIC METHODS #
  ##################

  bind_inputs: ->
    super()

    # build select field callback (bound on the plugin instance in _initialize_select_plugin)
    delay = @options.filter_delay or 0

    onchange_callback = (event) =>
      @_select_change(event)
      return

    @onchange_callback = @_with_delay(onchange_callback, delay)

    # bind reset button
    onclick_callback = (event) =>
      @_select_clear(event)
      return

    @_el(@reset_id).on('click', onclick_callback)

    @_initialize_select_plugin()


  restore_state: ->
    super()

    saved_state = @datatable_filter.has_state_for(@column_id)

    if saved_state?
      restored_value = saved_state.value

      @_set_select_value(restored_value)

      if restored_value != ''
        @_el(@select_id).addClass('inuse')


  reset: (event) ->
    super(event)

    @_clear_select_value()
    @_el(@select_id).removeClass('inuse')

    # set search value (datatable reload will be triggered later)
    @_set_search_value(@column_id, '')

    # save current value
    @_reset_state(@column_id)


  destroy: ->
    super()
    @_destroy_select2()
    @select_plugin?.destroy()
    @select_plugin = null


  # Every xhr.dt triggers a reload. Rebuilding an unchanged dropdown throws away
  # and re-creates every option (and makes the plugin re-sync) on each redraw,
  # sort or keystroke in another filter — so only rebuild when the data differs.
  reload: (event) ->
    super(event)

    signature = JSON.stringify(@dropdown_data)

    return if signature == @_dropdown_signature

    @_dropdown_signature = signature
    @_el(@select_id).empty().append(@_select_options())

    # re-read options and selection from the underlying <select>
    @select_plugin?.clearOptions()
    @select_plugin?.sync()

    # Inside the branch: the options are what wipes the selection, so restoring
    # it when nothing was rebuilt only re-ran setValue — a full re-render of the
    # item, for tom-select — on every sort, page change and keystroke in another
    # filter.
    @restore_state()


  ###################
  # PRIVATE METHODS #
  ###################

  _html_input_field: ->
    options =
      id:    @select_id
      class: "dtf-filter #{@filter_css_class}"

    callback1 = (event) =>
      @stop_propagation(event)

    callback2 = (event) =>
      @prevent_default_on_enter(event)

    $('<select/>', options)
      .on('click',     callback1)
      .on('keydown',   callback2)
      .on('mousedown', callback1)


  _select_change: (event) ->
    @logger.info => "#{@name()} : _select_change"
    @logger.dump(event)


  _select_clear: (event) ->
    @logger.info => "#{@name()} : _select_clear"
    @logger.dump(event)

    current_value = @current_value()
    return if @_empty_value(current_value)

    @_set_select_value('')
    @_el(@select_id).removeClass('inuse')

    # run filter (triggers a datatable reload)
    @_run_filter(@column_id, '')

    # save current value
    @_save_state(@column_id, value: '')


  # set value without triggering a 'change' event (and a datatable reload)
  _set_select_value: (value) ->
    if @select_plugin?
      @select_plugin.setValue(value, true)
    else
      @_el(@select_id).val(value)


  # clear value without triggering a 'change' event (and a datatable reload)
  _clear_select_value: ->
    if @select_plugin?
      @select_plugin.clear(true)
    else
      @_el(@select_id).val('')


  _initialize_select_plugin: ->
    @logger.info "#{@name()} : _initialize_select_plugin"

    # A host can declare a plugin and forget to load it. Throwing here takes the
    # whole table's initialisation down, for a filter whose plain <select> still
    # works: fall back to it, and say so.
    if @_missing_plugin()?
      @logger.error("#{@name()} : #{@_missing_plugin()} is not loaded, falling back to the native select")
      return @_bind_native_select()

    switch @filter_plugin
      when 'tom-select'
        select = document.getElementById(@select_id)
        @select_plugin = new TomSelect(select, @_tom_select_options())

        # tom-select emits 'change' through its own emitter, not as a DOM event
        @select_plugin.on('change', @onchange_callback)

        # prevent clicks on the widget from bubbling to the table header (sort).
        # 'click' only : tom-select retains focus through a document-level 'mousedown'
        # handler — stopping mousedown propagation would close the dropdown instantly
        wrapper = @_el(@select_id).next()
        if wrapper? and wrapper.hasClass('ts-wrapper')
          callback = (event) =>
            @stop_propagation(event)
          wrapper.on('click', callback)
      when 'select2'
        @_el(@select_id).select2 @filter_plugin_options

        # select2 triggers 'change' as a jQuery event on the original select
        @_el(@select_id).on('change', @onchange_callback)

        select2 = @_el(@select_id).next()
        if select2? and select2.hasClass('select2-container')
          callback = (event) =>
            @stop_propagation(event)
          select2
            .on('click', callback)
            .on('mousedown', callback)
      when 'native'
        # plain HTML <select>, no plugin — used for compound input-group filters
        @_bind_native_select()
      else
        @logger.error("Unknown select type: #{@filter_plugin}")


  # TomSelect échappe le libellé de ses options. Un hôte qui compose ce libellé
  # côté serveur (badge, pastille de couleur) le verrait donc s'afficher en
  # balisage brut. filter_html_labels demande explicitement le rendu HTML, filtre
  # par filtre — l'échappement reste le comportement par défaut.
  #
  # Le second argument des fonctions de rendu est la fonction d'échappement de
  # TomSelect : ne pas l'appliquer est précisément l'objet de l'option. Ne la
  # poser que sur un libellé dont la partie variable est déjà échappée à la
  # construction, faute de quoi elle ouvre une injection HTML.
  _tom_select_options: ->
    options = @filter_plugin_options or {}
    return options unless @options.filter_html_labels

    Utils.merge_hash options,
      render:
        option: (data, _escape) -> "<div>#{data.text}</div>"
        item:   (data, _escape) -> "<div>#{data.text}</div>"


  # Names the declared plugin when the host has not loaded it, nil otherwise.
  _missing_plugin: ->
    switch @filter_plugin
      when 'tom-select'
        'tom-select' if typeof TomSelect == 'undefined'
      when 'select2'
        'select2' unless $.fn.select2?


  # tom-select hands back an instance, so @select_plugin covers it. select2 does
  # not: it lives in the element's data and answers to .select2('destroy'), which
  # is why destroy() used to be a no-op for it and every rebuild left a widget,
  # its document-level handlers and its .select2-container sibling behind.
  #
  # The data is also the guard, for the same reason as the datepicker's: after a
  # Turbo restoration visit the node in the DOM is not the one select2 was
  # initialised on.
  _destroy_select2: ->
    return unless @filter_plugin == 'select2' and $.fn.select2?

    element = @_el(@select_id)
    element.select2('destroy') if element.data('select2')?
    return


  _bind_native_select: ->
    @_el(@select_id).on('change', @onchange_callback)


  _debug_log: ->
    super()

    @logger.info("container_id: #{@container_id}")
    @logger.info("wrapper_id: #{@wrapper_id}")
    @logger.info("select_id: #{@select_id}")
    @logger.info("reset_id: #{@reset_id}")


export default SelectBase
