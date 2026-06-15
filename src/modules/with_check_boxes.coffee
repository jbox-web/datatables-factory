import Utils from '../utils.coffee'

WithCheckBoxes = {}

WithCheckBoxes.class_methods =

  ########################
  # Public Class methods #
  ########################

  reload: (callback = null, reset_paging = true) ->
    this.instance.reload(callback, reset_paging)


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

        @info('Add check_boxes callbacks to : createdRow')
        @callbacks['createdRow'].push @_check_boxes_callback_on_created_row()

        @_restrict_touch_selection_to_check_boxes()

      when 'after_init'
        @info('Add check_boxes callbacks to : datatable')

        @_check_boxes_thead = $('thead', @datatable.table().container())

        # Update state of "Select all" control
        @datatable.on 'draw.dt', @_check_boxes_callback_on_draw()

        # Update global count
        @datatable.on 'xhr.dt', @_check_boxes_callback_on_xhr()

        # Handle row selection event
        @datatable.on 'select.dt deselect.dt', @_check_boxes_callback_on_select()

        # Handle click on "Select all" control
        @_check_boxes_thead.on 'click', 'input[type="checkbox"]', @_check_boxes_callback_checkbox_on_click()

        # Handle click on heading containing "Select all" control
        @_check_boxes_thead.on 'click', 'th:first-child', @_check_boxes_callback_th_on_click()


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


  select_row: (tr) ->
    @datatable.row('#' + tr.attr('id'), { page: 'current' }).select()


  update_select_all_ctrl: ->
    if !@datatable?
      @error "update_select_all_ctrl: Datatable instance is null"
      return false

    table          = @datatable.table().container()
    select_all     = $('thead input[type="checkbox"]', table).get(0)
    chkbox_all     = $('tbody input[type="checkbox"]', table)
    chkbox_checked = $('tbody input[type="checkbox"]:checked', table)

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


  _check_boxes_callback_on_created_row: ->
    (row) =>
      @_add_row_if_checked($(row))


  _check_boxes_callback_on_draw: ->
    =>
      @update_select_all_ctrl()


  _check_boxes_callback_on_xhr: ->
    (e, settings, json, _xhr) =>
      if json? && json['records_selected']?
        @_update_select_all_global_count(json['records_selected'])
      else
        return false


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


  _with_check_boxes_destroy: ->
    return if !@_check_boxes_enabled()
    @datatable.off('draw.dt')
    @datatable.off('xhr.dt')
    @datatable.off('select.dt deselect.dt')
    @_check_boxes_thead?.off('click')
    @_check_boxes_thead = null


  _add_row_if_checked: (tr) ->
    checkbox = $($(tr).find('input[type="checkbox"]')[0])
    if checkbox.is(':checked')
      @select_row(tr)


  _update_select_all_global_count: (count) ->
    label = @dtf_options?['selected_count_label'] || 'Total selected: '
    $("#{@dt_id}_wrapper .selected-count")
      .html(label)
      .append $('<span>').attr('id', 'selected-count-number').html(count)


export default WithCheckBoxes
