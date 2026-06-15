# TODO — Code review JS

## Bugs

- [ ] **`RangeNumberFilter` : `@range_type` settée après `super()`** (`src/model/filters/range_number_filter.coffee`)
  `@range_type = 'number'` est assignée *après* `super arguments...`, mais `RangeBase.constructor` construit les IDs (`@from_id`, `@to_id`, `@reset_id`) en utilisant `@range_type` — qui vaut `undefined` à ce moment-là. Les IDs contiennent `"undefined"` dans le DOM. Setter `@range_type` avant l'appel à `super`.

- [ ] **`_check_boxes_callback_on_select` décoche trop de lignes** (`src/modules/with_check_boxes.coffee` ligne ~151)
  Sur un événement `deselect`, le code décoche toutes les `tr:not(.selected)`, y compris les lignes non concernées par l'événement. Avec une sélection partielle, des lignes qui devaient rester cochées peuvent être décochées.

---

## Sécurité

- [ ] **XSS potentiel dans le context menu** (`src/context_menu.coffee` ligne ~48)
  Le résultat de l'appel Ajax est injecté brut via `$('#context-menu').html(data)`. Si des données utilisateur se retrouvent dans le HTML retourné, c'est une surface XSS. Sanitiser ou utiliser `$.parseHTML` avec un contexte sûr.

- [ ] **URL du context menu lue depuis le DOM** (`src/context_menu.coffee` ligne ~41)
  `$(event.target).parents('tbody').first().data('url')` — l'URL de la requête Ajax est lue depuis un attribut `data-url` dans le DOM. Une injection de `data-url` sur une ligne permet de cibler une URL arbitraire.

---

## Strings applicatives hardcodées dans la lib

- [ ] **Message 422 en français + URL hardcodée** (`src/modules/loader.coffee` ligne ~22)
  ```
  alert "Votre session a expiré, veuillez vous reconnecter."
  window.location.href = "/users/login/"
  ```
  Rendre configurable via `dtf_options` (callback ou URL de redirection).

- [ ] **Label "Nombre total d'éléments sélectionnés"** (`src/modules/with_check_boxes.coffee` ligne ~211)
  String en français hardcodée dans `_update_select_all_global_count`. Rendre configurable via `dtf_options`.

---

## Couplage aux internals de DataTables

- [ ] **`_set_search_value` accède à `aoPreSearchCols`** (`src/model/datatable_filter.coffee` ligne ~215)
  `@instance.context[0].aoPreSearchCols[column_id][key]` est une API privée interne. Elle a déjà nécessité un branchement `dt_v2` pour gérer le renommage `sSearch` → `search`. Surveiller à chaque mise à jour majeure.

- [ ] **`_set_state` accède à `oLoadedState`** (`src/model/datatable_filter.coffee` ligne ~228)
  `@instance.context[0].oLoadedState = state` — même problème, API privée non documentée.

---

## Qualité / nettoyage

- [ ] **Fallbacks IE8 dans `ContextMenu.window_size`** (`src/context_menu.coffee`)
  Les branches `document.documentElement` et `document.body` pour `clientWidth/clientHeight` sont mortes. `window.innerWidth` / `window.innerHeight` suffisent.

- [ ] **Constantes magiques de positionnement du context menu** (`src/context_menu.coffee` lignes ~72-78)
  `325` et `345` (hauteurs en pixels pour sous-menus) sont hardcodées. Calculer dynamiquement depuis la hauteur réelle du menu ou externaliser en option.

- [ ] **`create_html` dupliqué dans chaque filtre** (`TextFilter`, `SelectBase`, `RangeBase`)
  La structure wrapper + input + reset button est identique dans les trois classes. La remonter dans `BaseFilter.create_html` avec `_html_input_field` comme hook à surcharger.

- [ ] **Sentinel `-1` pour valeur vide dans `SelectFilter`** (`src/model/filters/select_filter.coffee`)
  La valeur vide est représentée par la string `"-1"`. Fragile si une vraie option a cette valeur. Remplacer par `''` ou `null`.

- [ ] **`while` avec index explicite dans les `_find_*`** (`datatable_base.coffee`, `with_buttons.coffee`, `with_filters.coffee`)
  `_find_column`, `_find_button`, `_find_filter` utilisent des boucles `while i < len`. Remplacer par `Array.prototype.find`.

- [ ] **`WithLogger.class_methods` vide partout**
  Le module est inclus dans toutes les classes mais `class_methods: {}` ne contient rien. Supprimer ce boilerplate.

- [ ] **Attributs de tableau déclarés au niveau classe dans `DatatableBase`** (`src/model/datatable_base.coffee` lignes ~48-52)
  `columns: []`, `buttons: []`, etc. déclarés comme propriétés de classe sont des références partagées entre toutes les instances. Le constructeur les réassigne immédiatement donc ça ne mord pas en pratique, mais c'est trompeur. Les supprimer ou les déplacer dans le constructeur.

- [ ] **Mix CommonJS / ESM** (`src/modules/loader.coffee`, `src/model/datatable_filter.coffee`)
  `dig = require('object-dig')` et `merge = require('deepmerge')` mélangés avec des `import`. Migrer vers `import dig from 'object-dig'` et `import merge from 'deepmerge'`.
