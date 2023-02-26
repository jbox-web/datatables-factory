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
    # Select all rows in the current page
    @select_all_rows()
    # Build ajax options
    ajax_options = @_build_ajax_options('select_all')
    # Call url
    @_call_url(button, params, ajax_options)


  reset_selection: (button) ->
    # Get datatable params
    params = @datatable.ajax.params()
    # Reset selection
    params['selected'] = []
    params['not_selected'] = []
    # unselect all rows in the current page
    @unselect_all_rows()
    # Build ajax options
    ajax_options = @_build_ajax_options('reset_selection')
    # Call url
    @_call_url(button, params, ajax_options)


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


  _build_ajax_options: (button) ->
    callbacks  = @callbacks['buttons'][button]
    on_send    = if callbacks.beforeSend? then callbacks.beforeSend else []
    on_error   = if callbacks.error? then callbacks.error else []
    on_success = if callbacks.success? then callbacks.success else []

    {
      beforeSend: (xhr, settings) =>
        for c in on_send
          c(xhr, settings)
      error: (xhr, status, error) =>
        for c in on_error
          c(xhr, status, error)
      success: (data, status, xhr) =>
        for c in on_success
          c(data, status, xhr)
    }


  _call_url: (button, params, ajax_options) ->
    options = { url: button.url, method: button.method }
    options = $.extend {}, options, data: params if params
    options = $.extend {}, options, ajax_options if ajax_options
    $.ajax options


export default WithButtons
