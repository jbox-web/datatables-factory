WithLogger = {}

WithLogger.class_methods = {}


WithLogger.instance_methods =

  ###########################
  # Public Instance methods #
  ###########################

  info: (message) ->
    @logger.info(@_format_message(message))


  error: (message) ->
    @logger.error(@_format_message(message))


  dump: (message) ->
    @logger.dump(message)


  _format_message: (message) ->
    "#{@dt_class} : #{message}"


export default WithLogger
