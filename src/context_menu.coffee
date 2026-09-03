# The schemes a menu entry may legitimately carry. Anything relative has none,
# and is always fine.
SAFE_SCHEMES = ['http', 'https', 'mailto', 'tel']

# What a scheme may contain, per RFC 3986. Everything else is dropped before the
# comparison: browsers tolerate whitespace and control characters inside a
# scheme, so "java\tscript:" runs while a naive match on the raw value does not
# see it.
SCHEME_CHARS = /[^a-z0-9.+-]/gi

# A scheme can only appear before the first of these; past them a colon belongs
# to a path or a query, as in "/users/1?from=a:b".
PATH_START = /[\/?#]/

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


  @safe_url: (value) ->
    head  = String(value or '').split(PATH_START)[0]
    colon = head.indexOf(':')
    return true if colon < 0

    scheme = head.slice(0, colon).replace(SCHEME_CHARS, '').toLowerCase()
    scheme == '' or scheme in SAFE_SCHEMES


  # $.parseHTML already drops <script> — keepScripts defaults to false — and
  # nothing else: inline handlers and javascript: urls survive it untouched.
  # The markup is the host application's own, so escaping it stays the server's
  # job; this only bounds what a single unescaped interpolation in a menu
  # partial can do, which would otherwise be script execution on a right click.
  @sanitize: (nodes) ->
    for node in $(nodes).find('*').addBack()
      element = $(node)

      for attribute in Array::slice.call(node.attributes or [])
        name = attribute.name.toLowerCase()

        if name.indexOf('on') == 0
          element.removeAttr(attribute.name)
        else if name in ['href', 'src', 'xlink:href'] and !ContextMenu.safe_url(attribute.value)
          element.removeAttr(attribute.name)

    nodes


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
        nodes = ContextMenu.sanitize($.parseHTML(result, null) or [])
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
