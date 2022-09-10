import Extendable        from '../extendable.coffee'
import WithLogger        from '../modules/with_logger.coffee'
import TextFilter        from './filters/text_filter.coffee'
import RangeDateFilter   from './filters/range_date_filter.coffee'
import RangeNumberFilter from './filters/range_number_filter.coffee'
import SelectFilter      from './filters/select_filter.coffee'
import SelectMultiFilter from './filters/select_multi_filter.coffee'

class DatatableFilter extends Extendable
  @extend  WithLogger.class_methods
  @include WithLogger.instance_methods


  constructor: (@datatable, @filters, @filters_applied, @logger) ->
    # Call Extendable parent
    super()

    # initialize loaded_filters
    @loaded_filters = {}

    # Set datatable instance
    @dt_id    = @datatable.dt_id_strip
    @dt_class = @datatable.dt_class
    @instance = @datatable.datatable.settings()[0].oInstance


  load: ->
    @_load_filters()
    @_bind_datatable()
    @_apply_filters()


  find_by_column_id: (column_id) ->
    @loaded_filters[column_id]


  save_state: (column_id, data) ->
    @info "Save current filter state (#{column_id})"

    if @instance? and @instance.fnSettings()?
      if !@instance.fnSettings().oLoadedState
        @instance.fnSettings().oLoadedState = {}

      # @_dump_dt_filters_state()

      if  @instance.fnSettings().oLoadedState.dt_filters_state? and
          @instance.fnSettings().oLoadedState.dt_filters_state[@dt_id]?

        @instance.fnSettings().oLoadedState.dt_filters_state[@dt_id][column_id] = data
      else
        tmp = {}
        tmp[@dt_id] = {}
        tmp[@dt_id][column_id] = data
        @instance.fnSettings().oLoadedState.dt_filters_state = tmp

      # @_dump_dt_filters_state()

      @_save()
    else
      @error "save_state: Datatable instance is null"


  has_state_for: (column_id) ->
    if  @instance? and
        @instance.fnSettings()? and
        @instance.fnSettings().oLoadedState? and
        @instance.fnSettings().oLoadedState.dt_filters_state? and
        @instance.fnSettings().oLoadedState.dt_filters_state[@dt_id]? and
        @instance.fnSettings().oLoadedState.dt_filters_state[@dt_id][column_id]?

      @instance.fnSettings().oLoadedState.dt_filters_state[@dt_id][column_id]
    else
      null


  set_search_value: (column_id, value) ->
    @instance.fnSettings().aoPreSearchCols[column_id].sSearch = value


  run_filter: (column_id, value) ->
    @instance.fnFilter value, column_id


  reset_filters: (event) ->
    for _column_id, filter of @loaded_filters
      filter.reset(event)
    @_draw()


  apply_default_filters: (event) ->
    @info 'apply_default_filters'
    @dump event

    @_apply_filters()


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

    $(@datatable.dt_id).off('stateSaveParams.dt').on('stateSaveParams.dt', onsave_callback)

    # set ondraw callback
    ondraw_callback = (event, settings, json) =>
      @_dt_on_draw(event, settings, json)
      return

    $(@datatable.dt_id).off('xhr.dt').on('xhr.dt', ondraw_callback)

    # we need to make sure that the yadcf state will be saved after page reload
    @_save()


  _apply_filters: ->
    # return to avoid a useless datatable reload
    return if @filters_applied.length == 0

    # apply filters
    for item in @filters_applied
      filter = @find_by_column_id(item.column_id)
      if filter?
        filter.set(item.value)

    # reload datatable
    @_draw()


  _dt_on_save: (event, settings, data) ->
    @info "Datatable has been saved"

    if settings.oLoadedState and settings.oLoadedState.dt_filters_state?
      data.dt_filters_state = settings.oLoadedState.dt_filters_state


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


  _save: ->
    @instance.fnSettings().oApi._fnSaveState @instance.fnSettings()


  _draw: ->
    @instance.fnDraw @instance.fnSettings()


  _dump_dt_filters_state: ->
    object =
      if @instance.fnSettings().oLoadedState.dt_filters_state?
        @instance.fnSettings().oLoadedState.dt_filters_state
      else
        {}

    @dump object


export default DatatableFilter
