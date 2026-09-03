import Utils from '../utils.coffee'

WithCheckBoxes = {}

WithCheckBoxes.class_methods =

  ########################
  # Public Class methods #
  ########################

  # `instance` is null until the table is built, and again after a teardown.
  # Host code that reloads on a timer or on a websocket message hits both
  # windows, where an unguarded call raised "can't access property reload,
  # this.instance is null" — a crash for something that simply has nothing to
  # reload yet.
  reload: (callback = null, reset_paging = true) ->
    this.instance?.reload(callback, reset_paging)


WithCheckBoxes.instance_methods =

  ##########
  # LOADER #
  ##########

  with_check_boxes_set_callbacks: (callback_type) ->
    return false if !@_check_boxes_enabled()

    switch callback_type
      when 'before_init'
        @info('Add check_boxes callbacks to : ajax')
        @callbacks['ajax'].push @_check_boxes_callback_on_ajax()

        @_restrict_touch_selection_to_check_boxes()
        @_drop_selection_from_saved_state()

      when 'after_init'
        @info('Add check_boxes callbacks to : datatable')

        @_check_boxes_thead = $('thead', @datatable.table().container())

        # All handlers are namespaced so teardown removes only ours and leaves
        # any handler registered by the host application untouched.

        # Update state of "Select all" control
        @datatable.on 'draw.dt.dtfCheckBoxes', @_check_boxes_callback_on_draw()

        # Update global count
        @datatable.on 'xhr.dt.dtfCheckBoxes', @_check_boxes_callback_on_xhr()

        # Handle row selection event
        @datatable.on 'select.dt.dtfCheckBoxes deselect.dt.dtfCheckBoxes', @_check_boxes_callback_on_select()

        # Handle click on "Select all" control
        @_check_boxes_thead.on 'click.dtfCheckBoxes', 'input[type="checkbox"]', @_check_boxes_callback_checkbox_on_click()

        # Handle click on heading containing "Select all" control
        @_check_boxes_thead.on 'click.dtfCheckBoxes', 'th:first-child', @_check_boxes_callback_th_on_click()


  ###########################
  # Public Instance methods #
  ###########################

  reload: (callback = null, reset_paging = true) ->
    @datatable.ajax.reload(callback, reset_paging)


  get_selected_checkbox_ids: ->
    $(@dt_id)
      .find('tbody > tr.selected')
      .map -> this.id
      .toArray()


  get_not_selected_checkbox_ids: ->
    $(@dt_id)
      .find('tbody > tr').not('.selected')
      .map -> this.id
      .toArray()


  select_all_rows: ->
    @datatable.rows({ page: 'current' }).select()


  unselect_all_rows: ->
    @datatable.rows({ page: 'current' }).deselect()


  # By node, never by a selector built from the row id. A table whose server
  # sends no DT_RowId produced '#undefined', which matched nothing and selected
  # no row without a word; an id carrying a comma matched every row instead.
  select_row: (tr) ->
    @datatable.row($(tr).get(0), { page: 'current' }).select()


  update_select_all_ctrl: ->
    if !@datatable?
      @error "update_select_all_ctrl: Datatable instance is null"
      return false

    # Two passes over the body, not three: the checked ones are a subset of the
    # ones already in hand. This runs more than once per draw — selecting rows
    # fires the select event, whose handler refreshes the control again — so
    # what it costs each time is worth keeping down.
    table          = @datatable.table().container()
    select_all     = $('thead input[type="checkbox"]', table).get(0)
    chkbox_all     = $('tbody input[type="checkbox"]', table)
    chkbox_checked = chkbox_all.filter(':checked')

    return false if !select_all?

    # If none of the checkboxes are checked
    if chkbox_checked.length == 0
      select_all.checked = false
      if 'indeterminate' of select_all
        select_all.indeterminate = false

    # If all of the checkboxes are checked
    else if chkbox_checked.length == chkbox_all.length
      select_all.checked = true
      if 'indeterminate' of select_all
        select_all.indeterminate = false

    # If some of the checkboxes are checked
    else
      select_all.checked = true
      if 'indeterminate' of select_all
        select_all.indeterminate = true

    return


  #############
  # Callbacks #
  #############

  _check_boxes_callback_on_ajax: ->
    (d) =>
      e =
        selected:     @get_selected_checkbox_ids()
        not_selected: @get_not_selected_checkbox_ids()
      Utils.merge_hash(d, e)


  _check_boxes_callback_on_draw: ->
    =>
      @_reselect_checked_rows()
      @update_select_all_ctrl()


  # A bare return, never `false`: jQuery reads a false return as preventDefault
  # plus stopPropagation, so a response carrying no count — the normal case for
  # a server that does not send one — stopped xhr.dt from ever reaching a
  # handler the host application bound on an ancestor.
  _check_boxes_callback_on_xhr: ->
    (e, settings, json, _xhr) =>
      @_update_select_all_global_count(json['records_selected']) if json? and json['records_selected']?
      return


  _check_boxes_callback_on_select: ->
    (e, api, _type, indexes) =>
      checked = e.type == 'select'
      api.rows(indexes).nodes().each (row) ->
        $(row).find('input[type="checkbox"]').prop('checked', checked)

      # Update state of "Select all" control
      @update_select_all_ctrl()


  _check_boxes_callback_checkbox_on_click: ->
    (event) =>
      event.stopPropagation()

      if event.target.checked
        @select_all_rows()
      else
        @unselect_all_rows()


  _check_boxes_callback_th_on_click: ->
    (_event) ->
      $('input[type="checkbox"]', this).trigger('click')


  ############################
  # Private Instance methods #
  ############################

  _check_boxes_enabled: ->
    column = @find_column_by_name('check_box')
    column?


  # On touch devices, rows are selected through the checkbox column only :
  # a tap on the rest of the row no longer toggles the selection (accidental
  # taps while browsing). Only applies when the table has a checkbox column
  # (this module is a noop otherwise) and no custom selector is already set.
  _restrict_touch_selection_to_check_boxes: ->
    return if !window.matchMedia?('(pointer: coarse)').matches

    select = @dt_options['select']
    return if !select? || select == false

    select = {} if select == true
    return if select['selector']?

    select['selector'] = 'td.check_box'
    @dt_options['select'] = select


  # DataTables Select writes the selected rows into the saved state and, when
  # restoring it, calls `rows().deselect()` before re-selecting them. With this
  # module the checked boxes come from the server, so a state left in
  # localStorage by an earlier visit wins over what the server just rendered:
  # measured on a campaign form where a fourth recipient, checked server-side,
  # came back unchecked — and the next ajax call then reported it as
  # deselected, dropping it from the server-side selection for good.
  #
  # Removing `select` from the loaded state closes both restore paths at once:
  # DataTables runs the `stateLoadParams` option callbacks before firing the
  # event Select listens on, and freezes `state.loaded()` only after them.
  #
  # The host application's own callback is kept and its return value passed
  # through — a `false` there cancels the state load entirely.
  _drop_selection_from_saved_state: ->
    previous = @dt_options['stateLoadParams']

    @dt_options['stateLoadParams'] = (settings, data) ->
      delete data['select'] if data?
      previous?.call(this, settings, data)


  _with_check_boxes_destroy: ->
    return if !@_check_boxes_enabled()
    @datatable.off('draw.dt.dtfCheckBoxes')
    @datatable.off('xhr.dt.dtfCheckBoxes')
    @datatable.off('select.dt.dtfCheckBoxes deselect.dt.dtfCheckBoxes')
    @_check_boxes_thead?.off('click.dtfCheckBoxes')
    @_check_boxes_thead = null


  # One scan and one select call per draw, where this used to be a row lookup and
  # a select event per row — and each of those events refreshed the "select all"
  # control, rescanning the whole container, so a page of checked rows cost
  # quadratic work exactly when the feature was in use.
  #
  # The refresh still happens twice on a draw that selects something: once from
  # the select event this triggers, once from the draw handler. Dropping either
  # would mean relying on the select event firing, and DataTables does not fire
  # it for a row already selected — so the cost is cut inside
  # update_select_all_ctrl instead, where it is unconditional.
  #
  # Running on draw rather than on row creation also puts it after every
  # createdRow callback, including the host application's: a checkbox injected
  # there did not exist yet when the per-row hook looked for it.
  _reselect_checked_rows: ->
    return if !@datatable?

    rows = $('tbody > tr', @datatable.table().container()).filter ->
      $(this).find('input[type="checkbox"]').is(':checked')

    @datatable.rows(rows.toArray()).select() if rows.length > 0
    return


  # .text(), never .html(): the count comes from the server response and the
  # label from configuration — neither is meant to be markup.
  _update_select_all_global_count: (count) ->
    label = @dtf_options?['selected_count_label'] || 'Total selected: '
    $("#{@dt_id}_wrapper .selected-count")
      .text(label)
      .append $('<span>').attr('id', 'selected-count-number').text(count)


export default WithCheckBoxes
