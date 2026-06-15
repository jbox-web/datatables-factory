# TODO — Code review JS

## Bugs

---

## Sécurité

---

## Couplage aux internals de DataTables

- [ ] **`_set_search_value` accède à `aoPreSearchCols`** (`src/model/datatable_filter.coffee`)
  `columns().search()` sans `.draw()` n'est pas équivalent en DT 2.x — il schedule un redraw qui casse la pré-population des filtres et la restauration stateSave. L'accès direct à `aoPreSearchCols[col]['search']` reste nécessaire tant que DataTables n'expose pas d'API publique pour setter sans draw.


---

## Qualité / nettoyage

