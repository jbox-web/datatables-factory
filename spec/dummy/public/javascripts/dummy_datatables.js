// Plays the role of the host application's JS pack.
//
// Everything here is evaluated ONCE, from the <head>, and survives Turbo
// navigations. That matters: if the datatable classes were redefined on every
// page (a <script> in the body), each navigation would produce a brand new
// class whose `instance` is undefined, and Loader.load would never take the
// "already loaded -> destroy and recreate" branch. The host application defines
// them once in a pack, so the dummy must too.
//
// Table (re)initialisation happens on turbo:load, with no teardown — same
// lifecycle as the host application.
;(function () {
  'use strict'

  // The UMD bundle exposes the named exports object { DatatableBase }; unwrap it
  // once. Guarded so a second evaluation cannot reduce it to undefined.
  if (window.DatatableBase && window.DatatableBase.DatatableBase) {
    window.DatatableBase = window.DatatableBase.DatatableBase
  }

  var DatatableBase = window.DatatableBase

  window.Datatables = window.Datatables || {}
  window.Datatables.Acme = window.Datatables.Acme || {}

  // DT 2.x escapes HTML, so the checkbox is injected client-side in createdRow.
  function withCheckBoxColumn(Klass) {
    return class extends Klass {
      before_init() {
        super.before_init()
        this.callbacks['createdRow'].push(function (row) {
          $(row).find('td.check_box').html('<input type="checkbox" class="form-check-input">')
        })
      }
    }
  }

  // Mirrors the host application's own ApplicationDatatable: it does not extend
  // DatatableBase directly, it interposes a base class that overrides
  // with_buttons_set_callbacks and reaches into the library's internals
  // (_buttons_enabled, find_button_by_name, _add_callback, callbacks['buttons']).
  // Those are the seams the host actually depends on, so they need a consumer
  // here or nothing tells us when one of them moves.
  window.Datatables.ApplicationDatatable = class extends DatatableBase {
    with_buttons_set_callbacks(callback_type) {
      super.with_buttons_set_callbacks(callback_type)

      if (!this._buttons_enabled()) return false

      if (callback_type === 'before_init') {
        this._load_custom_button('export', (_event, button) => this._run_button_action(button))
      }
    }

    _load_custom_button(button_name, callback) {
      var button = this.find_button_by_name(button_name)
      if (button && button[1] && button[1].method === 'redirect') {
        this._add_callback(button, callback)
      }
    }

    _run_button_action(button) {
      window.__dtf_custom_button = button.url
    }

    // Assigned, not pushed — exactly what the host does. The library must merge
    // its own reload callback onto this rather than replace it, which is what
    // _loader_load_buttons_callbacks' "merge, never assign" comment is about.
    _setup_selection_callbacks(datatable) {
      var on_send = function () { $('#' + datatable + '_processing').show() }
      var on_done = function () { $('#' + datatable + '_processing').hide() }

      this.callbacks['buttons']['select_all']['beforeSend'] = [on_send]
      this.callbacks['buttons']['select_all']['error'] = [on_done]
      this.callbacks['buttons']['select_all']['success'] = [on_done]

      this.callbacks['buttons']['reset_selection']['beforeSend'] = [on_send]
      this.callbacks['buttons']['reset_selection']['error'] = [on_done]
      this.callbacks['buttons']['reset_selection']['success'] = [on_done]
    }
  }

  window.Datatables.BulkDatatable = class extends withCheckBoxColumn(window.Datatables.ApplicationDatatable) {
    // Before super(), like the host application does — its comment records that
    // the ordering matters, so the dummy has to reproduce it to keep it true.
    before_init() {
      this._setup_selection_callbacks('bulk-datatable')
      super.before_init()
    }
  }

  window.Datatables.DefaultsDatatable = class extends DatatableBase {}
  window.Datatables.BasicDatatable = class extends DatatableBase {}
  window.Datatables.ButtonsDatatable = class extends DatatableBase {}
  window.Datatables.FiltersDatatable = class extends DatatableBase {}
  window.Datatables.SlidersDatatable = class extends DatatableBase {}
  window.Datatables.Acme.NamespacedDatatable = class extends DatatableBase {}
  window.Datatables.CheckboxesDatatable = withCheckBoxColumn(DatatableBase)
  window.Datatables.ContextMenuDatatable = withCheckBoxColumn(DatatableBase)

  // Delegated from document so it survives navigations without re-binding.
  $(document).on('click', '#show-selection', function () {
    var instance = window.Datatables.CheckboxesDatatable.instance
    if (!instance) return

    var selected = instance.get_selected_checkbox_ids()
    var $alert = $('#selection-alert')

    if (selected.length === 0) {
      $alert.text('No rows selected.')
    } else {
      $alert.text('Selected IDs: ' + selected.join(', '))
    }
    $alert.removeClass('d-none')
  })

  // Closes the context menu when clicking outside of it.
  $(document).on('click', function (e) {
    if (!$(e.target).closest('#context-menu').length) {
      $('#context-menu').hide()
    }
  })

  // The context menu markup is injected by ajax; its links are wired once it is
  // shown. #context-menu is a fresh node after each navigation, so the observer
  // is re-attached on every turbo:load.
  var observer = null

  function watchContextMenu() {
    var node = document.getElementById('context-menu')
    if (observer) observer.disconnect()
    if (!node) return

    observer = new MutationObserver(function () {
      var row = $('tbody tr.selected').first()
      var rawId = row.attr('id') || ''
      var id = rawId.replace(/^\D+-/, '') // "user-123" -> "123"
      if (!id) return

      $('[data-ctx="view"]').attr('href', '/users/' + id)
      $('[data-ctx="edit"]').attr('href', '/users/' + id + '/edit')
      $('[data-ctx="delete"]').off('click').on('click', function (e) {
        e.preventDefault()
        if (!confirm('Supprimer cet utilisateur ?')) return

        var form = $('<form>', { method: 'POST', action: '/users/' + id })
          .append($('<input>', { type: 'hidden', name: '_method', value: 'delete' }))
          .append($('<input>', {
            type: 'hidden',
            name: 'authenticity_token',
            value: $('meta[name="csrf-token"]').attr('content'),
          }))

        $('body').append(form)
        form.submit()
      })
    })

    observer.observe(node, { childList: true, attributes: true, attributeFilter: ['style'] })
  }

  // Registered once, fires on the initial load and on every Turbo navigation.
  $(document).on('turbo:load', function () {
    watchContextMenu()
    DatatableBase.load_datatables()
  })
})()
