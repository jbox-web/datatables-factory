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
yarn webpack          # build dist/js/datatables-factory.js
```

### Ruby (prefer the binstubs in `bin/`)
```bash
bundle install        # install gem dependencies
bin/rspec             # run specs — system specs run against spec/dummy (binstub sets BUNDLE_GEMFILE=spec/dummy/Gemfile); `bundle exec rspec` fails without sprockets-rails
DT_VERSION=3 bin/rspec # run the same specs against DataTables 3 (default: 2)
bin/rubocop           # lint Ruby
bin/guard             # watch and re-run specs on file changes
```

## Architecture

### JavaScript (`src/`)

**Entry point:** `src/index.coffee` exports `DatatableBase`.

**`DatatableBase`** (`src/model/datatable_base.coffee`) is the core class consumers extend. It uses a mixin system via `Extendable` (`src/extendable.coffee`) with `@extend` (class methods) and `@include` (instance methods). All feature modules follow this pattern:

- `Loader` — discovers `[data-toggle=datatable]` elements, resolves the JS class by dotted namespace path (e.g. `datatables.MyDatatable`), instantiates and calls `load()`
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

**`SearchFormBuilder`** extends `SimpleForm::FormBuilder` to build filter forms with yadcf-compatible HTML.

### DataTables version coverage

The library supports DataTables 2 and 3. The dummy app vendors one bundle per major
version in `spec/dummy/public/{javascripts,stylesheets}/datatables{2,3}.bundle.min.*`
(combined builds from datatables.net: DT + Bootstrap 5 + Buttons + colVis + Select).
`ApplicationHelper#datatables_version` picks one from `DT_VERSION`, and the CI runs
the system specs once per version.

DataTables 3 renamed its internal settings properties (hungarian notation dropped),
so any code touching `api.context[0]` internals must handle both spellings — see
`DatatableFilter#_set_search_value` (`aoPreSearchCols` in DT2, `searches` in DT3).

### Data flow between Ruby and JS

The Ruby `Presenter#build_datatable_options` serializes columns, buttons, filters, and all DataTables options into a `data-dtf-loader` attribute on the `<table>` element. The JS `Loader` reads this attribute on page load and reconstructs the full configuration client-side.
