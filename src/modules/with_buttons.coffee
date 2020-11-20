WithButtons = {}

WithButtons.class_methods =

  ########################
  # Public Class methods #
  ########################

  reset_datatable_selection: ->
    this.instance.reset_datatable_selection()


WithButtons.instance_methods =

  ##########
  # LOADER #
  ##########

  with_buttons_set_callbacks: (callback_type) ->
    return false if !@_buttons_enabled()

    switch callback_type
      when 'before_init'
        @info('Load buttons')

        @_load_button 'select_all',            (_event, button) => @select_all(button)
        @_load_button 'reset_selection',       (_event, button) => @reset_selection(button)
        @_load_button 'reset_filters',         (event, _button) => @reset_filters(event)
        @_load_button 'apply_default_filters', (event, _button) => @apply_default_filters(event)


  ###########################
  # Public Instance methods #
  ###########################

  reset_datatable_selection: ->
    button = @find_button_by_name('reset_selection')
    if button?
      @reset_selection(button[1])


  find_button_by_name: (button_name) ->
    @_find_button(@buttons, button_name)


  reset_filters: (event) ->
    @datatable_filter.reset_filters(event)


  apply_default_filters: (event) ->
    @datatable_filter.apply_default_filters(event)


  select_all: (button) ->
    # Get datatable params
    params = @datatable.ajax.params()
    # Set length to -1 to get all filtered records
    params['length'] = -1
    # Reset selection
    params['selected'] = []
    params['not_selected'] = []
    # select all rows in the current page
    @select_all_rows()
    # Call url
    @_call_url(button, params, @datatable.ajax.reload)


  reset_selection: (button) ->
    # Get datatable params
    params = @datatable.ajax.params()
    # Reset selection
    params['selected'] = []
    params['not_selected'] = []
    # unselect all rows in the current page
    @unselect_all_rows()
    # Call url
    @_call_url(button, params, @datatable.ajax.reload)


  ############################
  # Private Instance methods #
  ############################

  _buttons_enabled: ->
    @buttons.length > 0


  _find_button: (buttons, button_name) ->
    i = 0
    len = buttons.length
    while i < len
      if buttons[i].button_name == button_name
        return [i, buttons[i]]
      i++
    null


  _load_button: (button_name, callback) ->
    button = @find_button_by_name(button_name)
    if button?
      @_add_callback(button, callback)


  _add_callback: (button, callback) ->
    idx    = button[0]
    button = button[1]
    button.action = (event, _dt, _node, _config) ->
      callback(event, button)
    @buttons[idx] = button


  _call_url: (button, params, callback) ->
    options = { url: button.url, method: button.method }
    options = $.extend {}, options, data: params if params
    options = $.extend {}, options, { success: () -> callback() } if callback
    $.ajax options


export default WithButtons
