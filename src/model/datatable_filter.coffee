import Extendable        from '../extendable.coffee'
import WithLogger        from '../modules/with_logger.coffee'
import TextFilter        from './filters/text_filter.coffee'
import RangeDateFilter   from './filters/range_date_filter.coffee'
import RangeNumberFilter from './filters/range_number_filter.coffee'
import SelectFilter      from './filters/select_filter.coffee'
import SelectMultiFilter from './filters/select_multi_filter.coffee'

class DatatableFilter extends Extendable
  @include WithLogger.instance_methods

  # Query string key holding the filters to pre-apply, Rails style:
  #   ?dt_filters[state]=to_sell&dt_filters[commercial][]=12&dt_filters[age][from]=20
  URL_FILTERS_KEY: 'dt_filters'

  # Both bounds of a range travel to the server in a single search value, joined
  # by this delimiter (the convention the Ruby side splits on).
  RANGE_DELIMITER: '-dtf_delim-'


  # Asked by the Loader before any table exists, to decide whether the saved
  # page still means anything (see Loader#_loader_load_state_params). Kept here
  # so the query string format stays described in a single place.
  @carries_url_filters: (search = window.location.search) ->
    return false if !search? or search == ''

    prefix = "#{DatatableFilter::URL_FILTERS_KEY}["
    found  = false

    new URLSearchParams(search).forEach (_value, key) ->
      found = true if key.indexOf(prefix) == 0

    found


  constructor: (@datatable, @filters, @filters_applied, @logger) ->
    # Call Extendable parent
    super()

    # initialize loaded_filters
    @loaded_filters = {}

    # Set datatable instance
    @dt_id    = @datatable.dt_id_strip
    @dt_class = @datatable.dt_class
    @instance = @datatable.datatable

    # Restore filter state from the last saved DT state (if any)
    saved_state = @instance.state.loaded()
    @_filter_state = saved_state?['dt_filters_state'] or {}

    # Columns pre-applied from the URL, so a server-side default filter cannot
    # overwrite them afterwards (see _apply_filters).
    @_url_seeded_columns = {}


  load: ->
    # Seeding the filter state BEFORE the filters are built is the single
    # branching point needed: every filter type reads it back through its own
    # restore_state(), and the value is already in the DataTables per-column
    # search store when the first draw builds the request — no extra redraw.
    @_seed_filters_from_url()
    @_load_filters()
    @_bind_datatable()


  destroy: ->
    clearTimeout(@_save_state_timer) if @_save_state_timer?
    $(@datatable.dt_id).off('stateSaveParams.dt').off('xhr.dt')
    for _column_id, filter of @loaded_filters
      filter.destroy?()
    @loaded_filters = {}


  find_by_column_id: (column_id) ->
    @loaded_filters[column_id]


  save_state: (column_id, data) ->
    @info "Save current filter state (#{column_id})"

    # instance might not be present (session expired?)
    return if !@_instance_present_for('save_state')

    # Update the filter state for this column directly — direct assignment
    # is equivalent to deepmerge with overwrite_merge for arrays (multi-select).
    @_filter_state[@dt_id] ?= {}
    @_filter_state[@dt_id][column_id] = data

    # save DT state
    @_save_state()


  has_state_for: (column_id) ->
    @info "Get current filter state (#{column_id})"

    # instance might not be present (session expired?)
    return if !@_instance_present_for('has_state_for')

    @_filter_state[@dt_id]?[column_id] or null


  set_search_value: (column_id, value) ->
    @info "Set search value (#{column_id})"
    @_set_search_value(column_id, value)


  run_filter: (column_id, value) ->
    @info "Run filter (#{column_id})"
    @_run_filter(column_id, value)


  reset_filters: (event) ->
    for _column_id, filter of @loaded_filters
      filter.reset(event)
    @_draw_instance()


  apply_default_filters: (event) ->
    @info 'Apply default filters'
    @_apply_filters(event)


  ###################
  # PRIVATE METHODS #
  ###################

  # Pre-apply the filters carried by the query string. The URL wins over the
  # saved DataTables state on purpose: a stale state would otherwise silently
  # discard the filters of the link the user just followed.
  _seed_filters_from_url: ->
    url_filters = @_parse_url_filters(window.location.search)
    return if Object.keys(url_filters).length == 0

    @info 'Seed filters from URL'

    for column_name, entry of url_filters
      filter = @_find_url_filter(column_name)

      # Unknown column, or a column declared without a filter: ignored silently
      # (@info, not @warn — an URL is user input, not a programming error).
      if !filter?
        @info "No filter declared for URL filter '#{column_name}'"
        continue

      column_id = filter.column_id

      @_filter_state[@dt_id] ?= {}
      @_filter_state[@dt_id][column_id] = @_url_filter_state(filter, entry)
      @_url_seeded_columns[column_id] = true

      # restore_state() only repopulates the widget; the search value has to be
      # written separately, and set_search_value does it without a draw.
      @set_search_value(column_id, @_url_search_value(filter, entry))


  # find_filter_by_name returns [index_in_filters, filter] — undefined when the
  # column itself is unknown, null when it carries no filter.
  _find_url_filter: (column_name) ->
    found = @datatable.find_filter_by_name(column_name)
    if found? then found[1] else null


  # Turns the query string into { <column_name>: { values: [...], parts: {from, to} } }
  _parse_url_filters: (search) ->
    filters = {}
    return filters if !search? or search == ''

    new URLSearchParams(search).forEach (value, key) =>
      parsed = @_parse_url_filter_key(key)
      return if !parsed?

      [column_name, sub_key] = parsed

      filters[column_name] ?= { values: [], parts: {} }

      if sub_key == 'from' or sub_key == 'to'
        filters[column_name]['parts'][sub_key] = value
      else
        filters[column_name]['values'].push(value)

      return

    filters


  # 'dt_filters[role]', 'dt_filters[role][]' and 'dt_filters[age][from]' all
  # resolve to [column_name, sub_key]; anything else is not one of our params.
  _parse_url_filter_key: (key) ->
    match = key.match(new RegExp("^#{@URL_FILTERS_KEY}\\[([^\\[\\]]+)\\](?:\\[([^\\[\\]]*)\\])?$"))
    return null if !match?

    [match[1], match[2]]


  # Shape expected by each filter type's restore_state().
  _url_filter_state: (filter, entry) ->
    switch filter.filter_type
      when 'multi_select'
        value: entry['values']
      when 'range_number', 'range_date'
        bounds = @_url_range_bounds(entry)
        from: bounds[0], to: bounds[1]
      else
        value: entry['values'][0] or ''


  # Shape expected by the server, through the column search value.
  _url_search_value: (filter, entry) ->
    switch filter.filter_type
      when 'multi_select'
        entry['values'].join('|')
      when 'range_number', 'range_date'
        bounds = @_url_range_bounds(entry)
        "#{bounds[0]}#{@RANGE_DELIMITER}#{bounds[1]}"
      else
        entry['values'][0] or ''


  # A range accepts both spellings: the delimited value the server itself uses
  # (?dt_filters[age]=20-dtf_delim-40) and explicit bounds
  # (?dt_filters[age][from]=20&dt_filters[age][to]=40).
  _url_range_bounds: (entry) ->
    parts = entry['parts']

    if parts['from']? or parts['to']?
      return [parts['from'] or '', parts['to'] or '']

    value = entry['values'][0] or ''
    bounds = value.split(@RANGE_DELIMITER)

    [bounds[0] or '', bounds[1] or '']


  # An unbuildable filter (unknown type) is left out of loaded_filters entirely:
  # indexing a null there would make every later traversal (_dt_on_draw,
  # reset_filters, destroy) throw and take the valid filters down with it.
  _load_filters: ->
    for filter in @filters
      loaded = @_load_filter(filter)
      @loaded_filters[filter.column_id] = loaded if loaded?


  _load_filter: (filter) ->
    switch filter.filter_type
      when 'text'
        TextFilter.build(this, @logger, filter)
      when 'range_number'
        RangeNumberFilter.build(this, @logger, filter)
      when 'range_date'
        RangeDateFilter.build(this, @logger, filter)
      when 'select'
        SelectFilter.build(this, @logger, filter)
      when 'multi_select'
        SelectMultiFilter.build(this, @logger, filter)
      else
        @error("Unknown filter type: #{filter.filter_type}")
        @dump(filter)
        null


  _bind_datatable: ->
    @info "Bind datatable"

    # set onsave callback
    onsave_callback = (event, settings, data) =>
      @_dt_on_save(event, settings, data)
      return

    # This event allows modification of the state saving object prior to actually doing the save,
    # including addition or other state properties (for plug-ins) or modification of a DataTables core property.
    # See: https://datatables.net/reference/event/stateSaveParams
    $(@datatable.dt_id).off('stateSaveParams.dt').on('stateSaveParams.dt', onsave_callback)

    # set ondraw callback
    ondraw_callback = (event, settings, json) =>
      @_dt_on_draw(event, settings, json)
      return

    $(@datatable.dt_id).off('xhr.dt').on('xhr.dt', ondraw_callback)

    # we need to make sure that the filter state will be saved after page reload
    @_save_state()


  _apply_filters: (event) ->
    # return to avoid a useless datatable reload
    return if @filters_applied.length == 0

    @dump event

    # apply filters
    for item in @filters_applied
      # A filter pre-applied from the URL is not overwritten by the default
      # declared server-side: load() runs before this, so the default would
      # otherwise always win.
      continue if @_url_seeded_columns[item.column_id]

      filter = @find_by_column_id(item.column_id)
      if filter?
        filter.set(item.value)

    # reload datatable
    if event.type == 'click'
      @_draw_instance()


  # (<jQuery event object>, <DataTables settings object>, <State information to be saved>)
  _dt_on_save: (event, settings, data) ->
    @info "Datatable has been saved"
    data['dt_filters_state'] = @_filter_state


  _dt_on_draw: (event, settings, json) ->
    @info "Datatable has been reloaded, fetch dropdown data for filters"

    if !json?
      @warn 'datatables xhr.dt event came back with null data instead of JSON data.'
      return

    for column_id, filter of @loaded_filters
      if json["dt_filter_data_#{column_id}"]?
        @info "Loading data for #{filter.name()}"
        filter.dropdown_data = json["dt_filter_data_#{column_id}"]
        filter.reload(event)


  _instance_present_for: (method) ->
    if !@instance?
      @error "#{method}: Datatable instance is null"
      return false
    else
      return true


  _draw_instance: ->
    @instance.draw()


  _run_filter: (column_id, value) ->
    @instance.columns(column_id).search(value).draw(false)


  _set_search_value: (column_id, value) ->
    # Uses the internal per-column search store to set the column search value without
    # triggering a draw (columns().search() schedules a redraw in DT 2.x and 3.x which
    # breaks default filter pre-population and stateSave restore).
    # DT 3 dropped the hungarian notation internals: aoPreSearchCols became searches.
    settings = @instance.context[0]
    store    = settings.searches or settings.aoPreSearchCols
    store[column_id]['search'] = value


  _save_state: ->
    # Debounce to batch rapid filter changes (e.g. keystrokes, apply_default_filters)
    # into a single localStorage write instead of one per event.
    clearTimeout(@_save_state_timer) if @_save_state_timer?
    @_save_state_timer = setTimeout =>
      @_save_state_timer = null
      @instance.state.save()
    , 100


export default DatatableFilter
