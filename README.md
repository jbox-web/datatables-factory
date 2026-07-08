# datatables-factory

[![GitHub license](https://img.shields.io/github/license/jbox-web/datatables-factory.svg)](https://github.com/jbox-web/datatables-factory/blob/master/LICENSE)
[![Build Status](https://github.com/jbox-web/datatables-factory/workflows/CI/badge.svg)](https://github.com/jbox-web/datatables-factory/actions)

A Rails engine + JavaScript library that simplifies building [DataTables](https://datatables.net/) with AJAX, filters, checkboxes, buttons, and context menus. Works alongside [ajax-datatables-rails](https://github.com/jbox-web/ajax-datatables-rails).

## Installation

**Gemfile:**
```ruby
gem 'datatables-factory'
```

**package.json:**
```json
{
  "dependencies": {
    "@jbox-web/datatables-factory": "^1.0.0"
  }
}
```

## Usage

### 1. Ruby side — declare the table in your view

Use `bootstrap_datatables_for` (includes Bootstrap 5 classes) or `datatables_for` (bare):

```erb
<% dt = bootstrap_datatables_for(:users, source: users_path, stateSave: true) do |dt| %>
  <% dt.head_for :check_box %>
  <% dt.head_for :name,       label: 'Name',   sortable: true %>
  <% dt.head_for :email,      label: 'Email',  sortable: true %>
  <% dt.head_for :created_at, label: 'Created', sortable: true %>
  <% dt.head_for :actions,    label: '',        sortable: false, searchable: false, colvis: false %>

  <% dt.search_form do |f| %>
    <%= f.text_field :name %>
    <%= f.select    :role %>
    <%= f.render_datatable %>
  <% end %>
<% end %>
```

`head_for` options:

| Option | Default | Description |
|---|---|---|
| `label` | `''` | Column header text |
| `sortable` | `true` | Enables column sorting |
| `searchable` | `true` | Includes column in global search |
| `visible` | `true` | Column visibility |
| `colvis` | `true` | Appears in column visibility toggle |
| `class` | `[]` | Extra CSS classes |
| `width` | `''` | Column width |

### 2. JavaScript side — define a datatable class

```js
import { DatatableBase } from '@jbox-web/datatables-factory'

class UsersDatatable extends DatatableBase {}

// Expose on window under the namespace the Ruby side expects
window.datatables = window.datatables || {}
window.datatables.UsersDatatable = UsersDatatable
```

The Ruby presenter resolves the JS class by building a dotted path from the table id and an optional namespace. For a table declared as `datatables_for(:users)`, it looks for `window.datatables.UsersDatatable`.

### 3. Initialize on page load

```js
import { DatatableBase } from '@jbox-web/datatables-factory'

document.addEventListener('DOMContentLoaded', () => {
  DatatableBase.load_datatables()
})
```

`load_datatables()` scans for `[data-toggle=datatable]` elements, resolves the class, and initializes each table.

## Filters

Declare filters in the view with `search_form`. Filter type is set by the form builder method:

| Method | Filter type | Notes |
|---|---|---|
| `f.text_field :col` | Text input | Debounced search |
| `f.select :col` | Single select | tom-select by default |
| `f.multi_select :col` | Multi select | tom-select with tag removal |
| `f.range :col` | Number range | Min/max inputs |
| `f.range_date :col` | Date range | Requires jQuery UI or flatpickr |

### Pre-populating a filter

```erb
<% dt.search_field(column_id: 2, filter_type: 'select', populate_with: 'admin') %>
```

### Icon on a filter

```erb
<%= f.text_field :name, icon: 'magnifying-glass' %>
```

Prepends a `<span class="input-group-text dtf-filter-icon"><i class="fa-solid fa-magnifying-glass"></i></span>` inside the input group.

### Select plugin

By default selects use **tom-select**. Pass `filter_plugin: 'select2'` to use Select2 instead:

```erb
<%= f.select :status, filter_plugin: 'select2' %>
```

## Optional features

### Checkboxes

Add `dt.head_for :check_box` as the first column. The module automatically:
- renders a "select all" checkbox in the header
- sends `selected` / `not_selected` row ids with every AJAX request
- handles touch devices (selection restricted to the checkbox column)

### Context menu

Add `class: 'context-menu'` to the table body:

```erb
<% dt.body class: 'context-menu' %>
```

Right-click (or long-press on touch) on any row opens `#context-menu`. The module handles row selection and touch long-press (500 ms, cancels on scroll).

### Buttons

```ruby
dt.button extend: 'colvis', text: 'Columns'
dt.button extend: 'csv'
```

## Namespacing

For tables inside a module namespace:

```ruby
bootstrap_datatables_for(:invoices, namespace: [:billing])
```

Looks for `window.datatables.Billing.InvoicesDatatable`.

Use `js_namespace` to override the JS root:

```ruby
bootstrap_datatables_for(:invoices, js_namespace: 'MyApp')
```

Looks for `window.MyApp.InvoicesDatatable`.

## HTTP method

The table load request is sent as `POST` with a JSON body by default. The method
is configurable through `dtf_options['http_method']`:

```ruby
datatables_for(:users, opts: { dtf_options: { http_method: 'QUERY' } }) do |dt|
  # ...
end
```

The default remains `POST`, so leaving the option unset preserves the current
behavior. Setting it to `QUERY` (the safe, cacheable method with a body defined
by [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html)) is an opt-in that
assumes your server and any intermediate proxies accept the method — the body
shape is unchanged. This option only affects the table load request, not toolbar
button or context-menu actions.

## Debugging

Pass `?dtf_debug_log=true` or `?dtf_debug_dump=true` in the URL to enable console logging. The `dtf_options` hash is forwarded to the JS side and controls verbosity.

## Development

```bash
# Ruby (prefer the binstubs in bin/)
bundle install
bin/rspec           # system specs run against spec/dummy (binstub sets BUNDLE_GEMFILE=spec/dummy/Gemfile)
bin/rubocop

# JavaScript
yarn install
yarn webpack        # outputs dist/js/datatables-factory.js
```
