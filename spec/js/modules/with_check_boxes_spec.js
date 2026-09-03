import WithCheckBoxes from '../../../src/modules/with_check_boxes.coffee'
import { checkBoxColumn, loadTable, stubDataTables } from '../support/table_helpers'

// The checkbox column is what switches the whole module on; a table without it
// must stay a plain DataTable.
function build({ columns = [checkBoxColumn()], dt_options, dtf_options } = {}) {
  return loadTable({ dt_options: Object.assign({ columns }, dt_options), dtf_options })
}

// The real markup the module walks: a "select all" box in the head, one box per
// row in the body, all inside the container DataTables reports.
function renderTable({ rows = 2, checkedRows = [] } = {}) {
  const body = rows
    ? Array.from({ length: rows }, (_, i) => {
        const checked = checkedRows.includes(i) ? ' checked' : ''
        const selected = checkedRows.includes(i) ? ' class="selected"' : ''
        return `<tr id="row-${i}"${selected}><td><input type="checkbox"${checked}></td></tr>`
      }).join('')
    : ''

  document.body.innerHTML = `
    <div id="dt-container">
      <table id="users-datatable">
        <thead><tr><th><input type="checkbox"></th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    <div id="users-datatable_wrapper"><span class="selected-count"></span></div>
  `
}

// after_init reads the container, so the table has to exist in the document
// first; loadTable runs the whole lifecycle against whatever is there.
function buildRendered(options = {}) {
  renderTable(options.dom)
  const table = build(options)
  table.datatable.container = document.getElementById('dt-container')
  table.with_check_boxes_set_callbacks('after_init')
  return table
}

describe('WithCheckBoxes', () => {
  beforeEach(() => {
    document.body.innerHTML = '<table id="users-datatable"></table>'
    stubDataTables()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    delete window.matchMedia
  })

  describe('when the table has no checkbox column', () => {
    it('registers nothing', () => {
      const table = build({ columns: [{ data: 'name' }] })

      expect(table.with_check_boxes_set_callbacks('before_init')).toBe(false)
    })

    it('tears down without touching DataTables', () => {
      const table = build({ columns: [{ data: 'name' }] })

      table._with_check_boxes_destroy()

      expect(Object.keys(table.datatable.handlers)).toEqual([])
    })
  })

  describe('registration', () => {
    // Measured against a table without the column rather than against a fixed
    // count: the loader registers callbacks of its own, and hard-coding the
    // total would break the day it registers one more.
    it('adds one ajax callback of its own', () => {
      const plain = build({ columns: [{ data: 'name' }] })
      const withBoxes = build()

      expect(withBoxes.callbacks['ajax'].length).toBe(plain.callbacks['ajax'].length + 1)
    })

    // Re-selection happens on draw, not on row creation, so nothing is
    // registered there any more.
    it('registers no createdRow callback', () => {
      const plain = build({ columns: [{ data: 'name' }] })
      const withBoxes = build()

      expect(withBoxes.callbacks['createdRow'].length).toBe(plain.callbacks['createdRow'].length)
    })

    it('listens for draw, xhr and selection on the table', () => {
      const table = buildRendered()

      expect(Object.keys(table.datatable.handlers).sort()).toEqual([
        'draw.dt.dtfCheckBoxes',
        'select.dt.dtfCheckBoxes deselect.dt.dtfCheckBoxes',
        'xhr.dt.dtfCheckBoxes',
      ])
    })

    // Namespaced teardown: the host application may have its own draw.dt
    // handler on the same table, and it must survive our destroy.
    it('removes only its own handlers on teardown', () => {
      const table = buildRendered()
      table.datatable.on('draw.dt.hostApp', () => {})

      table._with_check_boxes_destroy()

      expect(Object.keys(table.datatable.handlers)).toEqual(['draw.dt.hostApp'])
      expect(table._check_boxes_thead).toBeNull()
    })
  })

  describe('touch devices', () => {
    it('restricts selection to the checkbox column', () => {
      window.matchMedia = () => ({ matches: true })

      const table = build({ dt_options: { select: true } })

      expect(table.dt_options['select']).toEqual({ selector: 'td.check_box' })
    })

    it('leaves a selector the host application already set alone', () => {
      window.matchMedia = () => ({ matches: true })

      const table = build({ dt_options: { select: { selector: 'td.custom' } } })

      expect(table.dt_options['select']).toEqual({ selector: 'td.custom' })
    })

    it('does nothing when selection is disabled', () => {
      window.matchMedia = () => ({ matches: true })

      const table = build({ dt_options: { select: false } })

      expect(table.dt_options['select']).toBe(false)
    })

    it('does nothing on a pointer-precise device', () => {
      window.matchMedia = () => ({ matches: false })

      const table = build({ dt_options: { select: true } })

      expect(table.dt_options['select']).toBe(true)
    })
  })

  // DataTables Select stores the selected rows in the saved state and, on
  // restore, deselects everything before re-selecting them. Here the checked
  // boxes come from the server, so a stale state silently drops rows.
  describe('the selection held in the saved state', () => {
    it('drops it from the loaded state and leaves the rest alone', () => {
      const table = build()
      const data = { select: { rows: ['row-0'] }, length: 25 }

      table.dt_options['stateLoadParams']({}, data)

      expect(data.select).toBeUndefined()
      expect(data.length).toBe(25)
    })

    it('still runs a callback the host application already set', () => {
      const seen = []
      const table = build({
        dt_options: { stateLoadParams: (_settings, data) => seen.push(data) },
      })
      const data = { select: {} }

      table.dt_options['stateLoadParams']({}, data)

      expect(seen).toEqual([data])
      expect(data.select).toBeUndefined()
    })

    // A `false` cancels the state load entirely — swallowing it would silently
    // restore a state the host application meant to reject.
    it('propagates a false returned by the host callback', () => {
      const table = build({ dt_options: { stateLoadParams: () => false } })

      expect(table.dt_options['stateLoadParams']({}, {})).toBe(false)
    })

    it('tolerates an empty state', () => {
      const table = build()

      expect(() => table.dt_options['stateLoadParams']({}, null)).not.toThrow()
    })

    it('leaves a table without a checkbox column alone', () => {
      const table = build({ columns: [{ data: 'name' }] })

      expect(table.dt_options['stateLoadParams']).toBeUndefined()
    })
  })

  describe('reading the selection from the DOM', () => {
    it('collects the ids of the selected rows', () => {
      const table = buildRendered({ dom: { rows: 3, checkedRows: [0, 2] } })

      expect(table.get_selected_checkbox_ids()).toEqual(['row-0', 'row-2'])
    })

    it('collects the ids of the rest', () => {
      const table = buildRendered({ dom: { rows: 3, checkedRows: [0, 2] } })

      expect(table.get_not_selected_checkbox_ids()).toEqual(['row-1'])
    })

    // Both lists ride along with every ajax request so the server knows what the
    // user ticked on a page it is about to replace.
    it('sends both lists along with the request payload', () => {
      const table = buildRendered({ dom: { rows: 3, checkedRows: [1] } })

      const payload = table.callbacks['ajax'][0]({ draw: 1 })

      expect(payload.draw).toBe(1)
      expect(payload.selected).toEqual(['row-1'])
      expect(payload.not_selected).toEqual(['row-0', 'row-2'])
    })
  })

  describe('selecting rows', () => {
    it('selects and deselects the current page', () => {
      const table = buildRendered()

      table.select_all_rows()
      table.unselect_all_rows()

      expect(table.datatable.selected).toEqual([{ page: 'current' }])
      expect(table.datatable.deselected).toEqual([{ page: 'current' }])
    })

    // By node: a table whose server sends no DT_RowId used to produce the
    // selector '#undefined', which matched nothing and selected no row.
    it('selects a row by its node rather than by its id', () => {
      const table = buildRendered({ dom: { rows: 1 } })

      table.select_row($('#row-0'))

      expect(table.datatable.selected).toEqual([$('#row-0')[0]])
    })

    it('selects a row that carries no id at all', () => {
      const table = buildRendered({ dom: { rows: 1 } })
      $('#row-0').removeAttr('id')

      table.select_row($('tbody tr').first())

      expect(table.datatable.selected.length).toBe(1)
      expect(table.datatable.selected[0].nodeName).toBe('TR')
    })

    // One call for the whole page, from the draw handler: per row it meant a
    // lookup and a select event each, and each of those rescanned the container
    // to refresh the select-all control.
    it('re-selects every row that came back checked, in one call', () => {
      const table = buildRendered({ dom: { rows: 3, checkedRows: [0, 2] } })

      table.datatable.handlers['draw.dt.dtfCheckBoxes']()

      expect(table.datatable.selected.length).toBe(1)
      expect(table.datatable.selected[0].length).toBe(2)
    })

    it('selects nothing when no row came back checked', () => {
      const table = buildRendered({ dom: { rows: 3 } })

      table.datatable.handlers['draw.dt.dtfCheckBoxes']()

      expect(table.datatable.selected).toEqual([])
    })
  })

  describe('the select-all control', () => {
    it('is unchecked when no row is', () => {
      const table = buildRendered({ dom: { rows: 2 } })

      table.update_select_all_ctrl()

      const box = $('#dt-container thead input')[0]
      expect(box.checked).toBe(false)
      expect(box.indeterminate).toBe(false)
    })

    it('is checked when every row is', () => {
      const table = buildRendered({ dom: { rows: 2, checkedRows: [0, 1] } })

      table.update_select_all_ctrl()

      const box = $('#dt-container thead input')[0]
      expect(box.checked).toBe(true)
      expect(box.indeterminate).toBe(false)
    })

    it('is indeterminate when only some rows are', () => {
      const table = buildRendered({ dom: { rows: 2, checkedRows: [0] } })

      table.update_select_all_ctrl()

      const box = $('#dt-container thead input')[0]
      expect(box.checked).toBe(true)
      expect(box.indeterminate).toBe(true)
    })

    it('refuses to run once the table has been destroyed', () => {
      const table = buildRendered()
      table.datatable = null

      expect(table.update_select_all_ctrl()).toBe(false)
    })

    it('gives up quietly when the header has no control to update', () => {
      const table = buildRendered()
      $('#dt-container thead input').remove()

      expect(table.update_select_all_ctrl()).toBe(false)
    })

    it('is refreshed on every draw', () => {
      const table = buildRendered({ dom: { rows: 2, checkedRows: [0, 1] } })

      table.datatable.handlers['draw.dt.dtfCheckBoxes']()

      expect($('#dt-container thead input')[0].checked).toBe(true)
    })
  })

  describe('clicking the select-all control', () => {
    // The starting state is the *un*ticked one on purpose: jQuery routes clicks
    // on a checkbox through the native control first (leverageNative), so by the
    // time the handler runs event.target.checked already holds the toggled
    // value — exactly as it does for a real user click.
    it('selects every row when ticked', () => {
      const table = buildRendered()

      $('#dt-container thead input').prop('checked', false).trigger('click')

      expect(table.datatable.selected).toEqual([{ page: 'current' }])
    })

    it('deselects every row when unticked', () => {
      const table = buildRendered()

      $('#dt-container thead input').prop('checked', true).trigger('click')

      expect(table.datatable.deselected).toEqual([{ page: 'current' }])
    })

    // The <th> is what DataTables sorts on, so the click has to stop at the box.
    it('stops the click before it reaches the header cell', () => {
      const table = buildRendered()
      const event = { stopPropagation: jest.fn(), target: { checked: true } }

      table._check_boxes_callback_checkbox_on_click()(event)

      expect(event.stopPropagation).toHaveBeenCalled()
      expect(table.datatable.selected).toEqual([{ page: 'current' }])
    })

    it('lets a click anywhere in the header cell toggle the control', () => {
      const table = buildRendered()

      $('#dt-container thead th').trigger('click')

      expect(table.datatable.selected.length + table.datatable.deselected.length).toBe(1)
    })
  })

  describe('row selection events', () => {
    it('ticks the boxes of the rows DataTables just selected', () => {
      const table = buildRendered({ dom: { rows: 2 } })
      table.datatable.rowNodes = [$('#row-0')[0]]

      table.datatable.handlers['select.dt.dtfCheckBoxes deselect.dt.dtfCheckBoxes'](
        { type: 'select' },
        table.datatable,
        'row',
        [0]
      )

      expect($('#row-0 input').prop('checked')).toBe(true)
    })

    it('unticks them on deselect', () => {
      const table = buildRendered({ dom: { rows: 2, checkedRows: [0] } })
      table.datatable.rowNodes = [$('#row-0')[0]]

      table.datatable.handlers['select.dt.dtfCheckBoxes deselect.dt.dtfCheckBoxes'](
        { type: 'deselect' },
        table.datatable,
        'row',
        [0]
      )

      expect($('#row-0 input').prop('checked')).toBe(false)
    })
  })

  describe('the global selected count', () => {
    it('renders the count returned by the server', () => {
      const table = buildRendered()

      table.datatable.handlers['xhr.dt.dtfCheckBoxes']({}, {}, { records_selected: 42 }, {})

      expect($('.selected-count').text()).toBe('Total selected: 42')
      expect($('#selected-count-number').text()).toBe('42')
    })

    it('uses the label configured for the table', () => {
      const table = buildRendered({ dtf_options: { selected_count_label: 'Sélection : ' } })

      table.datatable.handlers['xhr.dt.dtfCheckBoxes']({}, {}, { records_selected: 7 }, {})

      expect($('.selected-count').text()).toBe('Sélection : 7')
    })

    // The count comes from the server: rendering it as markup would make the
    // response able to inject elements into the page.
    it('escapes a count that looks like markup', () => {
      const table = buildRendered()

      table.datatable.handlers['xhr.dt.dtfCheckBoxes'](
        {},
        {},
        { records_selected: '<img src=x onerror=alert(1)>' },
        {}
      )

      expect($('#selected-count-number').find('img').length).toBe(0)
      expect($('#selected-count-number').text()).toBe('<img src=x onerror=alert(1)>')
    })

    it('ignores a response that carries no count', () => {
      const table = buildRendered()

      table.datatable.handlers['xhr.dt.dtfCheckBoxes']({}, {}, {}, {})

      expect($('.selected-count').text()).toBe('')
    })

    // jQuery reads a false return as preventDefault plus stopPropagation. The
    // handler used to return one whenever the response carried no count — the
    // normal case for a server that does not send one — which stopped xhr.dt
    // from ever reaching a handler the host bound on an ancestor.
    it('lets the event keep bubbling when the response carries no count', () => {
      document.body.innerHTML = '<div id="host"><table id="users-datatable"></table></div>'
      const reached = jest.fn()
      $('#host').on('xhr.dt', reached)

      const handler = WithCheckBoxes.instance_methods._check_boxes_callback_on_xhr.call({
        _update_select_all_global_count: () => {},
      })
      $('#users-datatable').on('xhr.dt', handler)

      $('#users-datatable').trigger('xhr.dt', [{}, {}, {}])

      expect(reached).toHaveBeenCalled()
    })
  })

  describe('reload', () => {
    it('asks DataTables to reload, resetting paging by default', () => {
      const table = buildRendered()

      table.reload()

      expect(table.datatable.reloads).toEqual([{ callback: null, resetPaging: true }])
    })

    it('forwards a callback and a paging choice', () => {
      const table = buildRendered()
      const callback = jest.fn()

      table.reload(callback, false)

      expect(table.datatable.reloads).toEqual([{ callback, resetPaging: false }])
    })

    it('is reachable from the class, for host application code', () => {
      const table = buildRendered()

      table.constructor.reload()

      expect(table.datatable.reloads.length).toBe(1)
    })

    // `instance` is null until the table is built, and again once Turbo tears
    // the page down. Host code that reloads on a timer or on a websocket
    // message hits both windows, and a bare `this.instance.reload()` turned
    // them into "can't access property reload, this.instance is null".
    it('does nothing when no table has been built yet', () => {
      const table = buildRendered()
      const klass = table.constructor
      klass.instance = null

      expect(() => klass.reload()).not.toThrow()
      expect(table.datatable.reloads.length).toBe(0)
    })
  })
})
