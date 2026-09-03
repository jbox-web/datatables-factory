WithLogger = {}

WithLogger.instance_methods =

  ###########################
  # Public Instance methods #
  ###########################

  # Guarded before anything is built: _format_message interpolates too, so a
  # message discarded downstream still cost two concatenations per call.
  #
  # Skipped only when the logger says so. A host application may hand its own
  # logger in, and one that does not answer info_enabled must keep receiving
  # everything rather than fall silent.
  info: (message) ->
    return if @logger.info_enabled? and !@logger.info_enabled()

    @logger.info(@_format_message(if typeof message == 'function' then message() else message))


  warn: (message) ->
    @logger.warn(@_format_message(message))


  error: (message) ->
    @logger.error(@_format_message(message))


  dump: (message) ->
    @logger.dump(message)


  _format_message: (message) ->
    "#{@dt_class} : #{message}"


export default WithLogger
