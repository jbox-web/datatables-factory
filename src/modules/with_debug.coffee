import Utils from '../utils.coffee'

WithDebug = {}

WithDebug.class_methods = {}


WithDebug.instance_methods =

  ##########
  # LOADER #
  ##########

  with_debug_set_callbacks: (callback_type) ->
    switch callback_type
      when 'before_init'
        @info('Add debug callbacks to : ajax')
        @callbacks['ajax'].push @_debug_callback_on_ajax()


  #############
  # Callbacks #
  #############

  _debug_callback_on_ajax: ->
    (d) =>
      e =
        dtf_debug_log:  @_param('dtf_debug_log')
        dtf_debug_dump: @_param('dtf_debug_dump')
      Utils.merge_hash(d, e)


  ############################
  # Private Instance methods #
  ############################

  # Only the literal 'true' enables a debug flag, matching what the Ruby side
  # and the Logger expect. A bare truthiness test would turn ?flag=false on.
  _param: (name) ->
    new URLSearchParams(location.search).get(name) == 'true'


export default WithDebug
