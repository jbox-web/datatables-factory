class ContextMenu

  #################
  # Class methods #
  #################

  @window_size: ->
    { width: window.innerWidth, height: window.innerHeight }


  @show: (event, url) ->
    mouse_x       = event.pageX
    mouse_y       = event.pageY
    mouse_y_c     = event.clientY
    render_x      = mouse_x
    render_y      = mouse_y
    menu_width    = null
    menu_height   = null
    window_width  = null
    window_height = null
    max_width     = null
    max_height    = null

    $('#context-menu').css('left', (render_x + 'px'))
    $('#context-menu').css('top', (render_y + 'px'))
    $('#context-menu').html('')

    position = ->
      menu_width = $('#context-menu').width()
      menu_height = $('#context-menu').height()
      max_width = mouse_x + 2 * menu_width
      max_height = mouse_y_c + menu_height

      ws = ContextMenu.window_size()
      window_width = ws.width
      window_height = ws.height

      # display the menu above and/or to the left of the click if needed
      if max_width > window_width
        render_x -= menu_width
        $('#context-menu').addClass('reverse-x')
      else
        $('#context-menu').removeClass('reverse-x')

      if max_height > window_height
        render_y -= menu_height
        $('#context-menu').addClass('reverse-y')
        # adding class for submenu
        if mouse_y_c < menu_height
          $('#context-menu .folder').addClass('down')
      else
        # adding class for submenu
        if window_height - mouse_y_c < menu_height
          $('#context-menu .folder').addClass('up')
        $('#context-menu').removeClass('reverse-y')

      render_x = 1 if render_x <= 0
      render_y = 1 if render_y <= 0

      $('#context-menu').css('left', (render_x + 'px'))
      $('#context-menu').css('top', (render_y + 'px'))
      $('#context-menu').show()

    render = (data) ->
      $('#context-menu').empty().append(data)
      position()

    fallback = ->
      $('#context-menu-empty').children().clone()

    $.ajax
      url: url
      data: $(event.target).parents('form').first().serialize()

      success: (result, _textStatus, _jqXHR) ->
        # keepScripts defaults to false, so $.parseHTML drops <script> tags.
        # It does NOT neutralise inline event-handler attributes: the menu markup
        # must still be escaped server-side.
        nodes = $.parseHTML(result, null) or []
        items = $(nodes)
        # Accept both a wrapping <ul> and bare <li> nodes as a non-empty menu.
        has_items = (items.filter('li').length + items.find('li').length) >= 1

        render(if has_items then nodes else fallback())

      # Without this the menu stays empty and hidden: the right click looks dead.
      error: (xhr, status, error) ->
        return if status == 'abort'
        console.error("DatatableFactory : context menu request failed (#{xhr.status} #{status}) #{error}")
        render(fallback())


export default ContextMenu
