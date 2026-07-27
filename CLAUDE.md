# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`datatables-factory` is a dual-language library:
- **Ruby gem** (Rails engine): server-side helpers for rendering DataTables HTML with configuration embedded as `data-*` attributes
- **JavaScript/CoffeeScript library**: client-side loader and table management, compiled via webpack to `dist/js/datatables-factory.js`

It integrates with `ajax-datatables-rails` and the `yadcf` filter plugin.

## Commands

### JavaScript
```bash
yarn install          # install JS dependencies
yarn webpack          # build dist/js/datatables-factory.js (minified; NODE_ENV=development for a readable build)
yarn jest             # JS unit tests (jsdom, real jQuery, stubbed TomSelect)
```

### Ruby (prefer the binstubs in `bin/`)
```bash
bundle install        # install gem dependencies
bin/rspec             # run specs — system specs run against spec/dummy (binstub sets BUNDLE_GEMFILE=spec/dummy/Gemfile); `bundle exec rspec` fails without sprockets-rails
DT_VERSION=3 bin/rspec # run the same specs against DataTables 3 (default: 2)
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

**`SearchFormBuilder`** extends `ActionView::Helpers::FormBuilder` to build filter forms with yadcf-compatible HTML. Its methods never call `super`: they emit the container `<div>` and register the filter on the presenter. A filter naming a column never declared with `head_for` raises `ArgumentError` at render time.

### DataTables version coverage

The library supports DataTables 2 and 3. The dummy app vendors one bundle per major
version in `spec/dummy/public/{javascripts,stylesheets}/datatables{2,3}.bundle.min.*`
(combined builds from datatables.net: DT + Bootstrap 5 + Buttons + colVis + Select).
`ApplicationHelper#datatables_version` picks one from `DT_VERSION`, and the CI runs
the system specs once per version.

DataTables 3 renamed its internal settings properties (hungarian notation dropped),
so any code touching `api.context[0]` internals must handle both spellings — see
`DatatableFilter#_set_search_value` (`aoPreSearchCols` in DT2, `searches` in DT3).

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
