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
  <% dt.head_for_check_box %>
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
| `class` | `[]` | Extra CSS classes — a String or an Array |
| `width` | `''` | Column width |

The filter names passed to the form builder must match a declared column; a
filter naming an unknown column raises `ArgumentError` at render time rather
than silently rendering a filter that filters nothing.

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
| `f.range_date :col` | Date range | Requires jQuery UI (`$.datepicker`) |

### Pre-populating a filter

```erb
<% dt.search_field(column_id: 2, filter_type: 'select', populate_with: 'admin') %>
```

### Pre-applying filters from the URL

A link may carry the filters to apply, under the `dt_filters` key, keyed by column name:

```
/users?dt_filters[role]=admin
/users?dt_filters[role][]=admin&dt_filters[role][]=moderator   # multi_select
/users?dt_filters[age][from]=20&dt_filters[age][to]=40         # range
/users?dt_filters[age]=20-dtf_delim-40                         # range, delimited form
```

The table is filtered on its first draw (no extra request) and every widget shows
its value. The URL wins over both the state saved by DataTables `stateSave` and
the defaults declared with `populate_with`. A column that does not exist, or that
carries no filter, is ignored.

The saved page is dropped as well: a filtered set is shorter, so the page the
user was last on usually falls past the last row, and the link would land on an
empty table.

### Saved page past the last row

The same hazard exists without any URL filter: rows deleted between two visits,
a narrowed scope or a `populate_with` default can all leave the restored page
past the end of the set. Whenever a server-side response reports fewer records
than the current offset, the table falls back to its first page. Nothing to
configure, and the extra request only happens in that case.

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

Add `dt.head_for_check_box` as the first column. The module automatically:
- renders a "select all" checkbox in the header
- sends `selected` / `not_selected` row ids with every AJAX request
- handles touch devices (selection restricted to the checkbox column)

### Context menu

Add `class: 'context-menu'` to the table body:

```erb
<% dt.body class: 'context-menu', data: { url: context_menu_path } %>
```

Right-click (or long-press on touch) on any row opens `#context-menu`. The URL that
handles the menu actions is read from the body's `data-url` attribute. The module
handles row selection and touch long-press (500 ms, cancels on scroll).

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

## Translations

The engine ships English defaults for every DataTables language string, the
select-all button titles and the `Filter by` prefix. Override any of them by
defining the same key in your own `config/locales` — application load paths win
over engine ones.

Per-column filter labels are yours to provide:

```yaml
en:
  datatables:
    filter:
      first_name: "first name"
```

When a column has no entry, the label falls back to the humanized column name
(`shipping_address` → `Filter by shipping address`).

## CSRF

The table load request is a `POST` and carries the `X-CSRF-Token` header read
from `<meta name="csrf-token">`, so it works with the standard Rails
`protect_from_forgery`. Make sure `csrf_meta_tags` is present in your layout.

## Debugging

Pass `?dtf_debug_log=true` or `?dtf_debug_dump=true` in the URL to enable console logging. Only the literal `true` enables a flag. The `dtf_options` hash is forwarded to the JS side and controls verbosity.

## Development

```bash
# Ruby (prefer the binstubs in bin/)
bundle install
bin/rspec           # specs run against spec/dummy (binstub sets BUNDLE_GEMFILE=spec/dummy/Gemfile)
bin/rubocop

# The system specs run against one vendored DataTables and jQuery bundle at a
# time; CI crosses every combination. Defaults: DataTables 2, jQuery 3.
DT_VERSION=3 bin/rspec
JQ_VERSION=4 bin/rspec

# Test against every supported Rails version (see Appraisals)
BUNDLE_GEMFILE=spec/dummy/Gemfile bundle exec appraisal install
BUNDLE_GEMFILE=spec/dummy/Gemfile bundle exec appraisal rspec           # all of them
BUNDLE_GEMFILE=spec/dummy/Gemfile bundle exec appraisal rails_8.0 rspec # just one

# JavaScript
yarn install
yarn webpack        # outputs dist/js/datatables-factory.js (minified)
yarn jest           # JS unit tests, with coverage written to coverage/js/
```

`dist/js/datatables-factory.js` is committed and shipped to gem and npm
consumers: rebuild it whenever `src/` changes — CI rejects a stale bundle.
