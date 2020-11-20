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
      debug_log  = !!@_param('dtf_debug_log')
      debug_dump = !!@_param('dtf_debug_dump')
      e =
        dtf_debug_log:  debug_log
        dtf_debug_dump: debug_dump
      $.extend {}, d, e


  ############################
  # Private Instance methods #
  ############################

  _param: (name) ->
    (location.search.split(name + '=')[1] || '').split('&')[0]


export default WithDebug
