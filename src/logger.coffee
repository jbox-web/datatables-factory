import Extendable from './extendable.coffee'

class Logger extends Extendable

  constructor: (@dtf_options) ->
    super()


  log_delimiter: ->
    @info('----------------------------------------')


  info: (message) ->
    if @dtf_options.debug_log? and (@dtf_options.debug_log == true or @dtf_options.debug_log == 'true')
      console.info "DatatableFactory : #{message}"


  warn: (message) ->
    console.warn "DatatableFactory : #{message}"


  error: (message) ->
    console.error "DatatableFactory : #{message}"


  dump: (message) ->
    if @dtf_options.debug_dump? and (@dtf_options.debug_dump == true or @dtf_options.debug_dump == 'true')
      console.info message


export default Logger
