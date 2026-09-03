import Utils from './utils.coffee'

# Kept between calls so a second right click can cancel the first request. The
# stale answer would otherwise render into the menu already open and move it
# back to the coordinates of the click before it.
pending = null


class ContextMenu

  #################
  # Class methods #
  #################

  @window_size: ->
    { width: window.innerWidth, height: window.innerHeight }


  @show: (event, url) ->
    # Looked up once. Every read and write below goes through this, where the
    # method used to resolve the same id fourteen times per open.
    menu          = $('#context-menu')
    mouse_x       = event.pageX
    mouse_y       = event.pageY
    mouse_y_c     = event.clientY
    render_x      = mouse_x
    render_y      = mouse_y

    menu.html('')

    position = ->
      # Both measurements are taken before either coordinate is written back:
      # interleaving them forces a synchronous layout per write.
      menu_width  = menu.width()
      menu_height = menu.height()
      ws          = ContextMenu.window_size()

      # display the menu above and/or to the left of the click if needed
      if mouse_x + 2 * menu_width > ws.width
        render_x -= menu_width
        menu.addClass('reverse-x')
      else
        menu.removeClass('reverse-x')

      if mouse_y_c + menu_height > ws.height
        render_y -= menu_height
        menu.addClass('reverse-y')
        # The menu itself flipped up, so a submenu opening from it has room
        # below. There is no symmetric branch: the else of this test already
        # guarantees the room a "flip the submenu up" case would look for.
        $('#context-menu .folder').addClass('down') if mouse_y_c < menu_height
      else
        menu.removeClass('reverse-y')

      render_x = 1 if render_x <= 0
      render_y = 1 if render_y <= 0

      menu.css(left: "#{render_x}px", top: "#{render_y}px").show()

    render = (data) ->
      menu.empty().append(data)
      position()

    fallback = ->
      $('#context-menu-empty').children().clone()

    # The enclosing form carries the current scope, so the menu the server builds
    # matches what the user is looking at — but its CSRF token does not belong in
    # a query string, where it would reach the server logs and the Referer of
    # whatever the menu links to.
    form = $(event.target).parents('form').first()
    data = form.find(':input').not('[name="authenticity_token"], [name="utf8"]').serialize()

    pending?.abort()
    pending = $.ajax
      url: url
      data: data

      success: (result, _textStatus, _jqXHR) ->
        nodes = Utils.sanitize($.parseHTML(result, null) or [])
        items = $(nodes)
        # Accept both a wrapping <ul> and bare <li> nodes as a non-empty menu.
        has_items = (items.filter('li').length + items.find('li').length) >= 1

        render(if has_items then nodes else fallback())

      # Without this the menu stays empty and hidden: the right click looks dead.
      # A status of 0 means no response arrived at all — a navigation, most of
      # the time — and a browser error monitor files console.error as a crash,
      # so it is downgraded here exactly as Loader.ajax downgrades it.
      error: (xhr, status, error) ->
        return if status == 'abort'

        message = "DatatableFactory : context menu request failed (#{xhr.status} #{status}) #{error}"
        if xhr.status == 0 then console.warn(message) else console.error(message)
        render(fallback())

      complete: ->
        pending = null
        return


export default ContextMenu
