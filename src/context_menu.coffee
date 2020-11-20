class ContextMenu

  #################
  # Class methods #
  #################

  @window_size: ->
    w = null
    h = null
    if window.innerWidth
      w = window.innerWidth
      h = window.innerHeight
    else if document.documentElement
      w = document.documentElement.clientWidth
      h = document.documentElement.clientHeight
    else
      w = document.body.clientWidth
      h = document.body.clientHeight

    return { width: w, height: h }


  @show: (event) ->
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

    $.ajax
      url: $(event.target).parents('tbody').first().data('url')
      data: $(event.target).parents('form').first().serialize()
      success: (result, _textStatus, _jqXHR) ->
        data =
          if $(result).children('li').length >= 1
            result
          else
            $('#context-menu-empty').children().clone()

        $('#context-menu').html(data)

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
          if mouse_y_c < 325
            $('#context-menu .folder').addClass('down')
        else
          # adding class for submenu
          if window_height - mouse_y_c < 345
            $('#context-menu .folder').addClass('up')
          $('#context-menu').removeClass('reverse-y')

        render_x = 1 if render_x <= 0
        render_y = 1 if render_y <= 0

        $('#context-menu').css('left', (render_x + 'px'))
        $('#context-menu').css('top', (render_y + 'px'))
        $('#context-menu').show()


export default ContextMenu
