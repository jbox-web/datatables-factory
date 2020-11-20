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

      when 'after_init'
        @info('Add check_boxes callbacks to : datatable')

        # Update state of "Select all" control
        @datatable.on 'draw.dt', @_check_boxes_callback_on_draw()

        # Update global count
        @datatable.on 'xhr.dt', @_check_boxes_callback_on_xhr()

        # Handle row selection event
        @datatable.on 'select.dt deselect.dt', @_check_boxes_callback_on_select()

        # Handle click on "Select all" control
        $('thead', @datatable.table().container()).on 'click', 'input[type="checkbox"]', @_check_boxes_callback_checkbox_on_click()

        # Handle click on heading containing "Select all" control
        $('thead', @datatable.table().container()).on 'click', 'th:first-child', @_check_boxes_callback_th_on_click()


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
      $.extend {}, d, e


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
    (e, api, _type, _items) =>
      if e.type == 'select'
        $('tr.selected input[type="checkbox"]', api.table().container()).prop('checked', true)
      else
        $('tr:not(.selected) input[type="checkbox"]', api.table().container()).prop('checked', false)

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


  _add_row_if_checked: (tr) ->
    checkbox = $($(tr).find('input[type="checkbox"]')[0])
    if checkbox.is(':checked')
      @select_row(tr)


  _update_select_all_global_count: (count) ->
    $("#{@dt_id}_wrapper .selected-count")
      .html("Nombre total d'éléments sélectionnés : ")
      .append $('<span>').attr('id', 'selected-count-number').html(count)


export default WithCheckBoxes
