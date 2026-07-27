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

  window.Datatables.BasicDatatable = class extends DatatableBase {}
  window.Datatables.ButtonsDatatable = class extends DatatableBase {}
  window.Datatables.FiltersDatatable = class extends DatatableBase {}
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
