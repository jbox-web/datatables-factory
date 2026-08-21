# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`datatables-factory` is a dual-language library:
- **Ruby gem** (Rails engine): server-side helpers for rendering DataTables HTML with configuration embedded as `data-*` attributes
- **JavaScript/CoffeeScript library**: client-side loader and table management, compiled via webpack to `dist/js/datatables-factory.js`

It integrates with `ajax-datatables-rails` and provides its own column filters.

## Commands

### JavaScript
```bash
yarn install          # install JS dependencies
yarn webpack          # build dist/js/datatables-factory.js (minified; NODE_ENV=development for a readable build)
yarn jest             # JS unit tests (jsdom, real jQuery, stubbed TomSelect); coverage is always on, written to coverage/js/
```

### Ruby (prefer the binstubs in `bin/`)
```bash
bundle install        # install gem dependencies
bin/rspec             # run specs — system specs run against spec/dummy (binstub sets BUNDLE_GEMFILE=spec/dummy/Gemfile); `bundle exec rspec` fails without sprockets-rails
DT_VERSION=3 bin/rspec # run the same specs against DataTables 3 (default: 2)
JQ_VERSION=4 bin/rspec # run the same specs against jQuery 4 (default: 3)
bin/rubocop           # lint Ruby
bin/guard             # watch and re-run specs on file changes
BUNDLE_GEMFILE=spec/dummy/Gemfile bundle exec appraisal rspec   # every supported Rails version
```

## Architecture

### JavaScript (`src/`)

**Entry point:** `src/index.coffee` exports `DatatableBase`.

**`DatatableBase`** (`src/model/datatable_base.coffee`) is the core class consumers extend. It uses a mixin system via `Extendable` (`src/extendable.coffee`) with `@extend` (class methods) and `@include` (instance methods). All feature modules follow this pattern:

- `Loader` — discovers `[data-toggle=datatable]` elements, resolves the JS class by dotted namespace path (e.g. `Datatables.MyDatatable`), instantiates and calls `load()`
- `WithFilters` — filter lookup by column name
- `WithCheckBoxes`, `WithButtons`, `WithContextMenu`, `WithDebug`, `WithLogger` — feature modules in `src/modules/`

**Filter system:** `DatatableFilter` (`src/model/datatable_filter.coffee`) manages filter instances. Filter types live in `src/model/filters/`: `text`, `range_date`, `range_number`, `select`, `multi_select`. Filters persist state via DataTables' `stateSave` API under the key `dt_filters_state`.

`DatatableFilter#load` seeds that state from the query string (`?dt_filters[column]=value`)
*before* building the filters, which is the single branching point the feature needs: every
filter type then picks the value up through its own `restore_state()`, and the value is
already in the per-column search store when the first draw builds its request — no extra
redraw. The URL deliberately wins over both the saved state and the `populate_with` defaults
(`_apply_filters` skips the columns seeded from the URL).

The saved *page* has to be dropped too, and cannot be handled there: DataTables applies the
state after `preInit`, so an offset moved from `DatatableFilter` is overwritten right after
(measured: `page(0)` lands, then `start` is back to its saved value at the first draw). It
goes through the `stateLoadParams` option instead, set by `Loader#_loader_load_state_params`
before the table is created — `DatatableFilter.carries_url_filters()` answers whether the
query string justifies it.

A URL filter is only one way to invalidate the saved page: deleted rows, a narrowed scope or
a `populate_with` default do it too. `Loader#_reset_stale_page` is the catch-all — on every
server-side response, an offset past `recordsFiltered` sends the table back to its first
page. It is bound **after** `$(dt_id).DataTable(...)`, never before: that call fires
`preInit`, and the `DatatableFilter` built there clears every `xhr.dt` handler on the node
(`_bind_datatable`), so an earlier binding is dropped on the spot.

**Loading flow:**
1. `Loader.load_datatables()` scans DOM for `[data-toggle=datatable]`
2. Resolves JS class via `window` path lookup (`Loader.constantize`)
3. Instantiates the class, calls `load()` → `before_init()` → `loader_load_callbacks()` → `init_datatable()` → `after_init()`
4. On `preInit.dt`, creates `DatatableFilter` and applies default filters

### Ruby (`lib/datatables_factory/`)

**`Presenter`** is the main Rails helper object (a `SimpleDelegator` wrapping the view). Consumers call it inside a view block to declare:
- `head_for :column_name` — adds a column
- `search_field(...)` — adds a filter
- `button(...)` — adds a toolbar button
- `render_datatable` — emits the `<table>` tag with all options serialized as `data-dtf-loader` JSON

**`ViewHelper`** provides the `datatable_for` method included into Rails views.

**`SearchFormBuilder`** extends `ActionView::Helpers::FormBuilder` to build filter forms with the HTML the filters expect. Its methods never call `super`: they emit the container `<div>` and register the filter on the presenter. A filter naming a column never declared with `head_for` raises `ArgumentError` at render time.

### DataTables and jQuery version coverage

The library supports DataTables 2 and 3. The dummy app vendors one bundle per major
version in `spec/dummy/public/{javascripts,stylesheets}/datatables{2,3}.bundle.min.*`
(combined builds from datatables.net: DT + Bootstrap 5 + Buttons + colVis + Select).
`ApplicationHelper#datatables_version` picks one from `DT_VERSION`, and the CI runs
the system specs once per version.

DataTables 3 renamed its internal settings properties (hungarian notation dropped),
so any code touching `api.context[0]` internals must handle both spellings — see
`DatatableFilter#_set_search_value` (`aoPreSearchCols` in DT2, `searches` in DT3).

jQuery follows the same pattern: `spec/dummy/public/javascripts/jquery{3,4}.min.js`,
selected by `ApplicationHelper#jquery_version` from `JQ_VERSION`, CI matrix crossing
both with the DataTables versions. jQuery 4 removed `$.trim`, `$.isArray`,
`$.isFunction`, `$.isNumeric`, `$.parseJSON`, `$.now` and `$.type` — none of them may
come back into `src/`. `spec/system/jquery_version_spec.rb` is the guard: it asserts
the requested major is the one running *and* that those APIs are absent under 4, so a
green run cannot be jQuery 3 in disguise. jest already runs against jQuery 4 only
(`yarn.lock` resolves the `>=3.6.0` dev dependency to 4.x), which is the other half of
the coverage.

### JS unit specs

`spec/js` runs under jsdom with real jQuery; the peers the host application
provides are stubbed (`TomSelect` in `support/setup.js`, jQuery UI's datepicker in
`support/filter_helpers.js`, select2 per spec). Two support modules carry the
scaffolding: `filter_helpers.js` for the filters (a recorder standing in for the
owning `DatatableFilter`, the container they render into), `table_helpers.js` for
anything reached through a loaded table (`DataTableApiStub`, `loadTable`, which
runs the real `Loader` so every mixin is wired as in production).

Two traps this suite has already hit, both measured:

- `coffee_transformer.js` must key its cache on `options.instrument`. Without it
  Jest serves the uninstrumented build back to the coverage run and the report
  comes out `0/0` — green, and measuring nothing.
- jQuery routes clicks on a checkbox through the native control first
  (`leverageNative`), so by the time a handler runs `event.target.checked` already
  holds the *toggled* value. A spec that ticks the box then triggers a click
  exercises the untick path.

### System specs

The dummy app mirrors the host application's lifecycle on purpose: Turbo, JS classes defined
**once** in `spec/dummy/public/javascripts/dummy_datatables.js`, init on `turbo:load`, no teardown,
and real `protect_from_forgery`. Defining the classes per page would hand each navigation a fresh
class whose `instance` is undefined, and the destroy/recreate path would never be exercised.

Never assert on datatable rows directly — use `spec/support/datatable_helpers.rb`:

- `turbo_click(link)` — navigate and wait for `turbo:load`. Turbo paints a cached snapshot first,
  so anything done before that fires acts on DOM about to be discarded (assertions passing against
  stale rows, text typed into an input that gets replaced).
- `wait_for_rows(selector, count:)` — counts in a single `evaluate_script`. Capybara resolves a
  selector into node handles *then* queries each one, so a redraw landing in between leaves it
  holding detached nodes, reported as `<<ERROR>>`.
- `wait_for_datatable` / `wait_for_js` — settle on `jQuery.active`, poll a JS expression.

Rails' `driven_by :cuprite` re-registers the driver, so a `Capybara.register_driver(:cuprite)`
block alone is silently discarded: the options must be passed through `driven_by`
(`spec/rails_helper.rb`). `.dt-processing` is not a usable synchronisation point either — the dummy
never renders it, since it does not enable DataTables' `processing` option.

The payload is posted as JSON (`contentType: application/json`), so Rails receives native types:
`order[].column` is an Integer, not `"3"`. `ajax-datatables-rails` was written for form-encoded
params where everything is a String — see its own CLAUDE.md.

### Data flow between Ruby and JS

The Ruby `Presenter#build_datatable_options` serializes columns, buttons, filters, and all DataTables options into a `data-dtf-loader` attribute on the `<table>` element. The JS `Loader` reads this attribute on page load and reconstructs the full configuration client-side.
