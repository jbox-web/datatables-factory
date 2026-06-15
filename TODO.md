# TODO — Code review JS

## Bugs

- [ ] **`RangeNumberFilter` : `@range_type` settée après `super()`** (`src/model/filters/range_number_filter.coffee`)
  `@range_type = 'number'` est assignée *après* `super arguments...`, mais `RangeBase.constructor` construit les IDs (`@from_id`, `@to_id`, `@reset_id`) en utilisant `@range_type` — qui vaut `undefined` à ce moment-là. Les IDs contiennent `"undefined"` dans le DOM. Setter `@range_type` avant l'appel à `super`.

- [ ] **`_check_boxes_callback_on_select` décoche trop de lignes** (`src/modules/with_check_boxes.coffee` ligne ~151)
  Sur un événement `deselect`, le code décoche toutes les `tr:not(.selected)`, y compris les lignes non concernées par l'événement. Avec une sélection partielle, des lignes qui devaient rester cochées peuvent être décochées.

---

## Sécurité

---

## Couplage aux internals de DataTables

- [ ] **`_set_search_value` accède à `aoPreSearchCols`** (`src/model/datatable_filter.coffee` ligne ~215)
  `@instance.context[0].aoPreSearchCols[column_id][key]` est une API privée interne. Elle a déjà nécessité un branchement `dt_v2` pour gérer le renommage `sSearch` → `search`. Surveiller à chaque mise à jour majeure.

- [ ] **`_set_state` accède à `oLoadedState`** (`src/model/datatable_filter.coffee` ligne ~228)
  `@instance.context[0].oLoadedState = state` — même problème, API privée non documentée.

---

## Qualité / nettoyage

