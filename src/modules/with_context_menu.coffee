import ContextMenu from '../context_menu.coffee'

WithContextMenu = {}

WithContextMenu.class_methods =

  ########################
  # Public Class methods #
  ########################

  clean_context_menu: (event) ->
    target = $(event.target)
    if (target.is('a') && target.hasClass('submenu'))
      event.preventDefault()
      return
    WithContextMenu.class_methods.context_menu_hide()


  context_menu_hide: ->
    $('#context-menu').hide()


WithContextMenu.instance_methods =

  ##########
  # LOADER #
  ##########

  with_context_menu_set_callbacks: (callback_type) ->
    return false if !@_context_menu_enabled()

    switch callback_type
      when 'before_init'
        @info('Add context_menu callbacks to : createdRow')
        @callbacks['createdRow'].push @_context_menu_callback_on_created_row()

      when 'after_init'
        @info('Add context_menu callbacks to : datatable')

        # Handle right click on datatable
        $('tbody', @datatable.table().container()).on 'contextmenu', @_context_menu_callback_on_contextmenu()


  #############
  # Callbacks #
  #############

  _context_menu_callback_on_created_row: ->
    (row) =>
      @_enable_contextual_menu_for_row(row)


  _context_menu_callback_on_contextmenu: ->
    (event) =>
      target = $(event.target)
      return if target.is('a')

      tr = target.parents('tr').first()
      return if !tr.hasClass('has-context-menu')

      event.preventDefault()
      @_handle_row_selection(tr)
      ContextMenu.show(event)


  ############################
  # Private Instance methods #
  ############################

  _context_menu_enabled: ->
    @dtf_options.context_menu? and (@dtf_options.context_menu == true or @dtf_options.context_menu == 'true')


  _enable_contextual_menu_for_row: (row) ->
    $(row).addClass('has-context-menu')


  _handle_row_selection: (row) ->
    if !row.hasClass('selected')
      @unselect_all_rows()
      @select_row(row)
      @update_select_all_ctrl()


export default WithContextMenu
