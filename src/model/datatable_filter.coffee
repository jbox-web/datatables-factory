import Extendable        from '../extendable.coffee'
import WithLogger        from '../modules/with_logger.coffee'
import TextFilter        from './filters/text_filter.coffee'
import RangeDateFilter   from './filters/range_date_filter.coffee'
import RangeNumberFilter from './filters/range_number_filter.coffee'
import SelectFilter      from './filters/select_filter.coffee'
import SelectMultiFilter from './filters/select_multi_filter.coffee'

class DatatableFilter extends Extendable
  @include WithLogger.instance_methods


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


  load: ->
    @_load_filters()
    @_bind_datatable()


  destroy: ->
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

  _load_filters: ->
    for filter in @filters
      column_id = filter.column_id
      @loaded_filters[column_id] = @_load_filter(filter)


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

    # we need to make sure that the yadcf state will be saved after page reload
    @_save_state()


  _apply_filters: (event) ->
    # return to avoid a useless datatable reload
    return if @filters_applied.length == 0

    @dump event

    # apply filters
    for item in @filters_applied
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
    # Uses the internal aoPreSearchCols API to set the column search value without
    # triggering a draw (columns().search() schedules a redraw in DT 2.x which
    # breaks default filter pre-population and stateSave restore).
    @instance.context[0].aoPreSearchCols[column_id]['search'] = value


  _save_state: ->
    @instance.state.save()


export default DatatableFilter
