import Extendable from './extendable.coffee'

class Logger extends Extendable

  constructor: (@dtf_options) ->
    super()


  log_delimiter: ->
    @info('----------------------------------------')


  # Exposed so a caller can skip building a message it is about to throw away.
  info_enabled: ->
    @_flag_on('debug_log')


  dump_enabled: ->
    @_flag_on('debug_dump')


  # A function is called only once logging is on. That is the whole point: with
  # debug_log off — the production setting — a message interpolated at the call
  # site is built and discarded on every keystroke and every draw.
  info: (message) ->
    return unless @info_enabled()

    console.info "DatatableFactory : #{@_resolve(message)}"


  warn: (message) ->
    console.warn "DatatableFactory : #{message}"


  error: (message) ->
    console.error "DatatableFactory : #{message}"


  dump: (message) ->
    return unless @dump_enabled()

    console.info @_resolve(message)


  _resolve: (message) ->
    if typeof message == 'function' then message() else message


  _flag_on: (name) ->
    value = @dtf_options[name]
    value? and (value == true or value == 'true')


export default Logger
