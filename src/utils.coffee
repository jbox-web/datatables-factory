# The schemes a url coming from configuration or from a server response may
# carry. Anything relative has none, and is always fine.
SAFE_SCHEMES = ['http', 'https', 'mailto', 'tel']

# What a scheme may contain, per RFC 3986. Everything else is dropped before the
# comparison: browsers tolerate whitespace and control characters inside a
# scheme, so "java\tscript:" runs while a naive match on the raw value does not
# see it.
SCHEME_CHARS = /[^a-z0-9.+-]/gi

# A scheme can only appear before the first of these; past them a colon belongs
# to a path or a query, as in "/users/1?from=a:b".
PATH_START = /[\/?#]/


class Utils

  @merge_hash: (hash1, hash2) ->
    $.extend(true, {}, hash1, hash2)


  # Shallow, and into the target rather than into a copy. Used where a hash is
  # enriched step by step and immediately serialized: a deep merge combines
  # arrays by index there, so a step narrowing a list left the tail of the
  # previous one behind.
  @extend_hash: (target, source) ->
    $.extend(target, source)


  # True for anything the browser may follow from this library: a relative url,
  # or one of the schemes above. Everything else — javascript:, data: — is not
  # something a configured login url or a menu entry has any reason to be.
  @safe_url: (value) ->
    head  = String(value or '').split(PATH_START)[0]
    colon = head.indexOf(':')
    return true if colon < 0

    scheme = head.slice(0, colon).replace(SCHEME_CHARS, '').toLowerCase()
    scheme == '' or scheme in SAFE_SCHEMES


  # $.parseHTML drops <script> — keepScripts defaults to false — and nothing
  # else: inline handlers and javascript: urls survive it untouched. Escaping
  # markup stays the server's job; this bounds what a single unescaped
  # interpolation can do, which would otherwise be script execution.
  @sanitize: (nodes) ->
    for node in $(nodes).find('*').addBack()
      element = $(node)

      for attribute in Array::slice.call(node.attributes or [])
        name = attribute.name.toLowerCase()

        if name.indexOf('on') == 0
          element.removeAttr(attribute.name)
        else if name in ['href', 'src', 'xlink:href'] and !Utils.safe_url(attribute.value)
          element.removeAttr(attribute.name)

    nodes


  # Same, for a caller that has a string and wants one back.
  @sanitize_html: (html) ->
    $('<div/>').append(Utils.sanitize($.parseHTML(String(html ? ''), null) or [])).html()


export default Utils
