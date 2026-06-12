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

        tbody = $('tbody', @datatable.table().container())

        # Handle right click on datatable
        tbody.on 'contextmenu', @_context_menu_callback_on_contextmenu()

        # Handle long-press on touch devices (parity with right click)
        @_context_menu_bind_long_press(tbody)


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

  # Long-press (~500ms) on a row opens the context menu, like right click does.
  # The timer is canceled when the finger moves (scroll) or is lifted early.
  # Android already fires 'contextmenu' on long-press : the timer is canceled
  # to avoid a double rendering. preventDefault on 'touchend' suppresses the
  # synthetic click that would otherwise close the menu right away.
  _context_menu_bind_long_press: (tbody) ->
    timer = null
    fired = false
    start = null

    tbody.on 'touchstart', (event) =>
      fired = false
      touch = event.originalEvent.touches[0]
      return if !touch?

      target = $(event.target)
      return if target.is('a')

      tr = target.parents('tr').first()
      return if !tr.hasClass('has-context-menu')

      start = { pageX: touch.pageX, pageY: touch.pageY, clientY: touch.clientY, target: event.target }
      timer = setTimeout(=>
        timer = null
        fired = true
        @_handle_row_selection(tr)
        ContextMenu.show(start)
      , 500)

    tbody.on 'touchmove', (event) ->
      return if !timer?
      touch = event.originalEvent.touches[0]
      if Math.abs(touch.pageX - start.pageX) > 10 || Math.abs(touch.pageY - start.pageY) > 10
        clearTimeout(timer)
        timer = null

    tbody.on 'touchend touchcancel', (event) ->
      clearTimeout(timer) if timer?
      timer = null
      event.preventDefault() if fired

    tbody.on 'contextmenu', ->
      clearTimeout(timer) if timer?
      timer = null


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
