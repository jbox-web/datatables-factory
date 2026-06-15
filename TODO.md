# TODO — Code review JS

## Bugs

---

## Sécurité

---

## Couplage aux internals de DataTables

- [ ] **`_set_state` accède à `oLoadedState`** (`src/model/datatable_filter.coffee` ligne ~228)
  `@instance.context[0].oLoadedState = state` — même problème, API privée non documentée.

---

## Qualité / nettoyage

