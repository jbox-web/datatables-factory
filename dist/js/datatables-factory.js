(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/context_menu.coffee":
/*!*********************************!*\
  !*** ./src/context_menu.coffee ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var ContextMenu;
ContextMenu = class ContextMenu {
  //################
  // Class methods #
  //################
  static window_size() {
    var h, w;
    w = null;
    h = null;
    if (window.innerWidth) {
      w = window.innerWidth;
      h = window.innerHeight;
    } else if (document.documentElement) {
      w = document.documentElement.clientWidth;
      h = document.documentElement.clientHeight;
    } else {
      w = document.body.clientWidth;
      h = document.body.clientHeight;
    }
    return {
      width: w,
      height: h
    };
  }
  static show(event) {
    var max_height, max_width, menu_height, menu_width, mouse_x, mouse_y, mouse_y_c, render_x, render_y, window_height, window_width;
    mouse_x = event.pageX;
    mouse_y = event.pageY;
    mouse_y_c = event.clientY;
    render_x = mouse_x;
    render_y = mouse_y;
    menu_width = null;
    menu_height = null;
    window_width = null;
    window_height = null;
    max_width = null;
    max_height = null;
    $('#context-menu').css('left', render_x + 'px');
    $('#context-menu').css('top', render_y + 'px');
    $('#context-menu').html('');
    return $.ajax({
      url: $(event.target).parents('tbody').first().data('url'),
      data: $(event.target).parents('form').first().serialize(),
      success: function (result, _textStatus, _jqXHR) {
        var data, ws;
        data = $(result).children('li').length >= 1 ? result : $('#context-menu-empty').children().clone();
        $('#context-menu').html(data);
        menu_width = $('#context-menu').width();
        menu_height = $('#context-menu').height();
        max_width = mouse_x + 2 * menu_width;
        max_height = mouse_y_c + menu_height;
        ws = ContextMenu.window_size();
        window_width = ws.width;
        window_height = ws.height;
        // display the menu above and/or to the left of the click if needed
        if (max_width > window_width) {
          render_x -= menu_width;
          $('#context-menu').addClass('reverse-x');
        } else {
          $('#context-menu').removeClass('reverse-x');
        }
        if (max_height > window_height) {
          render_y -= menu_height;
          $('#context-menu').addClass('reverse-y');
          // adding class for submenu
          if (mouse_y_c < 325) {
            $('#context-menu .folder').addClass('down');
          }
        } else {
          // adding class for submenu
          if (window_height - mouse_y_c < 345) {
            $('#context-menu .folder').addClass('up');
          }
          $('#context-menu').removeClass('reverse-y');
        }
        if (render_x <= 0) {
          render_x = 1;
        }
        if (render_y <= 0) {
          render_y = 1;
        }
        $('#context-menu').css('left', render_x + 'px');
        $('#context-menu').css('top', render_y + 'px');
        return $('#context-menu').show();
      }
    });
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ContextMenu);

/***/ }),

/***/ "./src/extendable.coffee":
/*!*******************************!*\
  !*** ./src/extendable.coffee ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Extendable,
  moduleKeywords,
  indexOf = [].indexOf;
moduleKeywords = ['extended', 'included'];
Extendable = class Extendable {
  static extend(obj) {
    var key, ref, value;
    for (key in obj) {
      value = obj[key];
      if (indexOf.call(moduleKeywords, key) < 0) {
        this[key] = value;
      }
    }
    if (obj != null) {
      if ((ref = obj.extended) != null) {
        ref.apply(this);
      }
    }
    return this;
  }
  static include(obj) {
    var key, ref, value;
    for (key in obj) {
      value = obj[key];
      if (indexOf.call(moduleKeywords, key) < 0) {
        // Assign properties to the prototype
        this.prototype[key] = value;
      }
    }
    if (obj != null) {
      if ((ref = obj.included) != null) {
        ref.apply(this);
      }
    }
    return this;
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Extendable);

/***/ }),

/***/ "./src/logger.coffee":
/*!***************************!*\
  !*** ./src/logger.coffee ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./extendable.coffee */ "./src/extendable.coffee");
var Logger;

Logger = class Logger extends _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(dtf_options) {
    super();
    this.dtf_options = dtf_options;
  }
  log_delimiter() {
    return this.info('----------------------------------------');
  }
  info(message) {
    if (this.dtf_options.debug_log != null && (this.dtf_options.debug_log === true || this.dtf_options.debug_log === 'true')) {
      return console.info(`DatatableFactory : ${message}`);
    }
  }
  warn(message) {
    return console.warn(`DatatableFactory : ${message}`);
  }
  error(message) {
    return console.error(`DatatableFactory : ${message}`);
  }
  dump(message) {
    if (this.dtf_options.debug_dump != null && (this.dtf_options.debug_dump === true || this.dtf_options.debug_dump === 'true')) {
      return console.info(message);
    }
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Logger);

/***/ }),

/***/ "./src/model/datatable_base.coffee":
/*!*****************************************!*\
  !*** ./src/model/datatable_base.coffee ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var compare_versions__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! compare-versions */ "./node_modules/compare-versions/lib/esm/compare.js");
/* harmony import */ var _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../extendable.coffee */ "./src/extendable.coffee");
/* harmony import */ var _modules_loader_coffee__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/loader.coffee */ "./src/modules/loader.coffee");
/* harmony import */ var _modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/with_logger.coffee */ "./src/modules/with_logger.coffee");
/* harmony import */ var _modules_with_filters_coffee__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../modules/with_filters.coffee */ "./src/modules/with_filters.coffee");
/* harmony import */ var _modules_with_check_boxes_coffee__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../modules/with_check_boxes.coffee */ "./src/modules/with_check_boxes.coffee");
/* harmony import */ var _modules_with_buttons_coffee__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../modules/with_buttons.coffee */ "./src/modules/with_buttons.coffee");
/* harmony import */ var _modules_with_context_menu_coffee__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../modules/with_context_menu.coffee */ "./src/modules/with_context_menu.coffee");
/* harmony import */ var _modules_with_debug_coffee__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../modules/with_debug.coffee */ "./src/modules/with_debug.coffee");
var DatatableBase;









DatatableBase = function () {
  class DatatableBase extends _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(dt_class, dt_id, dt_options, dtf_options, logger) {
      super();
      this.dt_class = dt_class;
      this.dt_id = dt_id;
      this.dt_options = dt_options;
      this.dtf_options = dtf_options;
      this.logger = logger;
      // Extract some options
      this.columns = this.dt_options['columns'] || [];
      this.buttons = this.dt_options['buttons'] || [];
      this.filters = this.dt_options['filters'] || [];
      this.filters_applied = this.dt_options['filters_applied'] || [];
      // Don't polute jQuery Datatable options namespace
      this.dt_options = this._select(this.dt_options, function (k, _v) {
        return k !== 'filters' && k !== 'filters_applied';
      });
      this.dt_id_strip = this.dt_id.substring(1);
      // Init callbacks hash
      this.callbacks['ajax'] = [];
      this.callbacks['createdRow'] = [];
      this.callbacks['drawCallback'] = [];
      this.callbacks['buttons'] = {};
      this.callbacks['buttons']['select_all'] = {};
      this.callbacks['buttons']['reset_selection'] = {};
      // Check datatables version
      this.dt_version = $.fn.dataTable.version;
      this.dt_v2 = (0,compare_versions__WEBPACK_IMPORTED_MODULE_8__.compare)(this.dt_version, '2.0.0', '>=');
    }

    //##########################
    // Public Instance methods #
    //##########################
    load() {
      // Call before callback (good to extend options)
      this.before_init();
      // Build options
      this.loader_load_callbacks();
      // Log final hash options
      this.log_final_options();
      // Create the real datatable
      this.init_datatable();
      // Call after callback (good to apply CSS rules after rendering)
      return this.after_init();
    }
    destroy() {
      this.datatable.destroy();
      return this.datatable = null;
    }
    before_init() {
      this.info('Build config');
      this.info('Before init callbacks');
      // Load callbacks and buttons
      this.with_check_boxes_set_callbacks('before_init');
      this.with_context_menu_set_callbacks('before_init');
      this.with_debug_set_callbacks('before_init');
      return this.with_buttons_set_callbacks('before_init');
    }
    after_init() {
      this.info('After init callbacks');
      // Load callbacks
      this.with_check_boxes_set_callbacks('after_init');
      this.with_context_menu_set_callbacks('after_init');
      this.with_debug_set_callbacks('after_init');
      return this.with_buttons_set_callbacks('after_init');
    }
    log_final_options() {
      this.info('Final config');
      this.info('dt_options:');
      return this.dump(this.dt_options);
    }
    find_column_by_name(column_name) {
      return this._find_column(this.columns, column_name);
    }

    //###########################
    // Private Instance methods #
    //###########################
    _find_column(columns, column_name) {
      var i, len;
      i = 0;
      len = columns.length;
      while (i < len) {
        if (columns[i].data === column_name) {
          return [i, columns[i]];
        }
        i++;
      }
      return null;
    }
  }
  ;
  DatatableBase.extend(_modules_loader_coffee__WEBPACK_IMPORTED_MODULE_1__["default"].class_methods);
  DatatableBase.include(_modules_loader_coffee__WEBPACK_IMPORTED_MODULE_1__["default"].instance_methods);
  DatatableBase.extend(_modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_2__["default"].class_methods);
  DatatableBase.include(_modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_2__["default"].instance_methods);
  DatatableBase.extend(_modules_with_filters_coffee__WEBPACK_IMPORTED_MODULE_3__["default"].class_methods);
  DatatableBase.include(_modules_with_filters_coffee__WEBPACK_IMPORTED_MODULE_3__["default"].instance_methods);
  DatatableBase.extend(_modules_with_check_boxes_coffee__WEBPACK_IMPORTED_MODULE_4__["default"].class_methods);
  DatatableBase.include(_modules_with_check_boxes_coffee__WEBPACK_IMPORTED_MODULE_4__["default"].instance_methods);
  DatatableBase.extend(_modules_with_buttons_coffee__WEBPACK_IMPORTED_MODULE_5__["default"].class_methods);
  DatatableBase.include(_modules_with_buttons_coffee__WEBPACK_IMPORTED_MODULE_5__["default"].instance_methods);
  DatatableBase.extend(_modules_with_context_menu_coffee__WEBPACK_IMPORTED_MODULE_6__["default"].class_methods);
  DatatableBase.include(_modules_with_context_menu_coffee__WEBPACK_IMPORTED_MODULE_6__["default"].instance_methods);
  DatatableBase.extend(_modules_with_debug_coffee__WEBPACK_IMPORTED_MODULE_7__["default"].class_methods);
  DatatableBase.include(_modules_with_debug_coffee__WEBPACK_IMPORTED_MODULE_7__["default"].instance_methods);

  //###################
  // Class attributes #
  //###################
  DatatableBase.instance = null;
  DatatableBase.dtf_options = null;

  //######################
  // Instance attributes #
  //######################
  DatatableBase.prototype.datatable = null;
  DatatableBase.prototype.columns = [];
  DatatableBase.prototype.buttons = [];
  DatatableBase.prototype.filters = [];
  DatatableBase.prototype.filters_applied = [];
  DatatableBase.prototype.callbacks = {};
  return DatatableBase;
}.call(undefined);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DatatableBase);

/***/ }),

/***/ "./src/model/datatable_filter.coffee":
/*!*******************************************!*\
  !*** ./src/model/datatable_filter.coffee ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../extendable.coffee */ "./src/extendable.coffee");
/* harmony import */ var _modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/with_logger.coffee */ "./src/modules/with_logger.coffee");
/* harmony import */ var _filters_text_filter_coffee__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./filters/text_filter.coffee */ "./src/model/filters/text_filter.coffee");
/* harmony import */ var _filters_range_date_filter_coffee__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./filters/range_date_filter.coffee */ "./src/model/filters/range_date_filter.coffee");
/* harmony import */ var _filters_range_number_filter_coffee__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./filters/range_number_filter.coffee */ "./src/model/filters/range_number_filter.coffee");
/* harmony import */ var _filters_select_filter_coffee__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./filters/select_filter.coffee */ "./src/model/filters/select_filter.coffee");
/* harmony import */ var _filters_select_multi_filter_coffee__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./filters/select_multi_filter.coffee */ "./src/model/filters/select_multi_filter.coffee");
var DatatableFilter, merge;
merge = __webpack_require__(/*! deepmerge */ "./node_modules/deepmerge/dist/cjs.js");







DatatableFilter = function () {
  class DatatableFilter extends _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(datatable, filters, filters_applied, logger) {
      super();
      this.datatable = datatable;
      this.filters = filters;
      this.filters_applied = filters_applied;
      this.logger = logger;
      // initialize loaded_filters
      this.loaded_filters = {};
      // Set datatable instance
      this.dt_id = this.datatable.dt_id_strip;
      this.dt_class = this.datatable.dt_class;
      this.instance = this.datatable.datatable;
    }
    load() {
      this._load_filters();
      return this._bind_datatable();
    }
    find_by_column_id(column_id) {
      return this.loaded_filters[column_id];
    }
    save_state(column_id, data) {
      var overwrite_merge, state, tmp;
      this.info(`Save current filter state (${column_id})`);
      if (!this._instance_present_for('save_state')) {
        return;
      }
      // get current state
      state = this._get_state();
      // build tmp hash
      tmp = {};
      tmp["dt_filters_state"] = {};
      tmp['dt_filters_state'][this.dt_id] = {};
      tmp['dt_filters_state'][this.dt_id][column_id] = data;
      // for multi-select: otherwise users cannot delete tags from input
      // See: https://github.com/TehShrike/deepmerge?tab=readme-ov-file#arraymerge-example-overwrite-target-array
      overwrite_merge = (destinationArray, sourceArray, options) => {
        return sourceArray;
      };
      // deep merge it with current state
      state = merge(state, tmp, {
        arrayMerge: overwrite_merge
      });
      // update DT state
      this._set_state(state);
      // save DT state
      return this._save_state();
    }
    has_state_for(column_id) {
      var state;
      this.info(`Get current filter state (${column_id})`);
      if (!this._instance_present_for('has_state_for')) {
        return;
      }
      // get current state
      state = this._get_state();
      // search value for *column_id* or return null
      if (state != null && state['dt_filters_state'] != null && state['dt_filters_state'][this.dt_id] != null && state['dt_filters_state'][this.dt_id][column_id] != null) {
        return state['dt_filters_state'][this.dt_id][column_id];
      } else {
        return null;
      }
    }
    set_search_value(column_id, value) {
      this.info(`Set search value (${column_id})`);
      return this._set_search_value(column_id, value);
    }
    run_filter(column_id, value) {
      this.info(`Run filter (${column_id})`);
      return this._run_filter(column_id, value);
    }
    reset_filters(event) {
      var _column_id, filter, ref;
      ref = this.loaded_filters;
      for (_column_id in ref) {
        filter = ref[_column_id];
        filter.reset(event);
      }
      return this._draw_instance();
    }
    apply_default_filters(event) {
      this.info('Apply default filters');
      return this._apply_filters(event);
    }

    //##################
    // PRIVATE METHODS #
    //##################
    _load_filters() {
      var column_id, filter, i, len, ref, results;
      ref = this.filters;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        filter = ref[i];
        column_id = filter.column_id;
        results.push(this.loaded_filters[column_id] = this._load_filter(filter));
      }
      return results;
    }
    _load_filter(filter) {
      switch (filter.filter_type) {
        case 'text':
          return _filters_text_filter_coffee__WEBPACK_IMPORTED_MODULE_2__["default"].build(this, this.logger, filter);
        case 'range_number':
          return _filters_range_number_filter_coffee__WEBPACK_IMPORTED_MODULE_4__["default"].build(this, this.logger, filter);
        case 'range_date':
          return _filters_range_date_filter_coffee__WEBPACK_IMPORTED_MODULE_3__["default"].build(this, this.logger, filter);
        case 'select':
          return _filters_select_filter_coffee__WEBPACK_IMPORTED_MODULE_5__["default"].build(this, this.logger, filter);
        case 'multi_select':
          return _filters_select_multi_filter_coffee__WEBPACK_IMPORTED_MODULE_6__["default"].build(this, this.logger, filter);
        default:
          this.error(`Unknown filter type: ${filter.filter_type}`);
          this.dump(filter);
          return null;
      }
    }
    _bind_datatable() {
      var ondraw_callback, onsave_callback;
      this.info("Bind datatable");
      // set onsave callback
      onsave_callback = (event, settings, data) => {
        this._dt_on_save(event, settings, data);
      };
      // This event allows modification of the state saving object prior to actually doing the save,
      // including addition or other state properties (for plug-ins) or modification of a DataTables core property.
      // See: https://datatables.net/reference/event/stateSaveParams
      $(this.datatable.dt_id).off('stateSaveParams.dt').on('stateSaveParams.dt', onsave_callback);
      // set ondraw callback
      ondraw_callback = (event, settings, json) => {
        this._dt_on_draw(event, settings, json);
      };
      $(this.datatable.dt_id).off('xhr.dt').on('xhr.dt', ondraw_callback);
      // we need to make sure that the yadcf state will be saved after page reload
      return this._save_state();
    }
    _apply_filters(event) {
      var filter, i, item, len, ref;
      // return to avoid a useless datatable reload
      if (this.filters_applied.length === 0) {
        return;
      }
      this.dump(event);
      ref = this.filters_applied;
      // apply filters
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        filter = this.find_by_column_id(item.column_id);
        if (filter != null) {
          filter.set(item.value);
        }
      }
      // reload datatable
      if (event.type === 'click') {
        return this._draw_instance();
      }
    }

    // (<jQuery event object>, <DataTables settings object>, <State information to be saved>)
    _dt_on_save(event, settings, data) {
      var state;
      this.info("Datatable has been saved");
      state = this._get_state();
      if (state != null) {
        return data['dt_filters_state'] = state['dt_filters_state'];
      }
    }
    _dt_on_draw(event, settings, json) {
      var column_id, filter, ref, results;
      this.info("Datatable has been reloaded, fetch dropdown data for filters");
      if (json == null) {
        this.warn('datatables xhr.dt event came back with null data instead of JSON data.');
        return;
      }
      ref = this.loaded_filters;
      results = [];
      for (column_id in ref) {
        filter = ref[column_id];
        if (json[`dt_filter_data_${column_id}`] != null) {
          this.info(`Loading data for ${filter.name()}`);
          filter.dropdown_data = json[`dt_filter_data_${column_id}`];
          results.push(filter.reload(event));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
    _instance_present_for(method) {
      if (this.instance == null) {
        this.error(`${method}: Datatable instance is null`);
        return false;
      } else {
        return true;
      }
    }
    _draw_instance() {
      return this.instance.draw();
    }
    _run_filter(column_id, value) {
      return this.instance.columns(column_id).search(value).draw(false);
    }
    _set_search_value(column_id, value) {
      var key;
      if (this.datatable.dt_v2) {
        key = 'search';
      } else {
        key = 'sSearch';
      }
      return this.instance.context[0].aoPreSearchCols[column_id][key] = value;
    }
    _get_state() {
      return this.instance.state.loaded();
    }
    _set_state(state) {
      return this.instance.context[0].oLoadedState = state;
    }
    _save_state() {
      return this.instance.state.save();
    }
  }
  ;
  DatatableFilter.extend(_modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_1__["default"].class_methods);
  DatatableFilter.include(_modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_1__["default"].instance_methods);
  return DatatableFilter;
}.call(undefined);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DatatableFilter);

/***/ }),

/***/ "./src/model/filters/base_filter.coffee":
/*!**********************************************!*\
  !*** ./src/model/filters/base_filter.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../extendable.coffee */ "./src/extendable.coffee");
/* harmony import */ var _modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../modules/with_logger.coffee */ "./src/modules/with_logger.coffee");
var BaseFilter;


BaseFilter = function () {
  class BaseFilter extends _extendable_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
    static build(datatable_filter, logger, options) {
      var object;
      object = new this(datatable_filter, logger, options);
      object.bind();
      return object;
    }
    constructor(datatable_filter1, logger1, options1) {
      super(...arguments);
      this.datatable_filter = datatable_filter1;
      this.logger = logger1;
      this.options = options1;
      // Get datatable JS class
      this.dt_class = this.datatable_filter.dt_class;
      // fetch mandatory data
      this.column_id = this.options.column_id;
      this.filter_default_label = this.options.filter_default_label;
      // fetch optional data
      this.filter_css_class = this.options.filter_css_class || '';
      this.filter_reset_button = this.options.filter_reset_button === false ? false : true;
      this.filter_reset_button_text = this.options.filter_reset_button_text || 'x';
      // build ids
      this.container_id = `#${this.options.filter_container_id}`;
    }

    //#################
    // PUBLIC METHODS #
    //#################

    // loader
    bind() {
      this.logger.info(`* Loading '${this.name()}'`);
      if (this.options.debug === true) {
        this._debug_log();
      }
      this.create_html();
      this.bind_inputs();
      return this.restore_state();
    }
    name() {
      return `${this.dt_class}/${this.constructor.name}#${this.column_id}`;
    }

    // implementation (must be overriden)
    create_html() {
      return this.logger.info(`${this.name()} : create_html`);
    }
    bind_inputs() {
      return this.logger.info(`${this.name()} : bind_inputs`);
    }
    restore_state() {
      return this.logger.info(`${this.name()} : restore_state`);
    }
    set(value) {
      this.logger.info(`${this.name()} : set`);
      return this.logger.dump(value);
    }
    reset(event) {
      this.logger.info(`${this.name()} : reset`);
      return this.logger.dump(event);
    }
    reload(event) {
      this.logger.info(`${this.name()} : reload`);
      return this.logger.dump(event);
    }
    prevent_default_on_enter(event) {
      if (event.keyCode === 13) {
        if (event.preventDefault) {
          event.preventDefault();
        } else {
          event.returnValue = false;
        }
      }
    }
    stop_propagation(event) {
      if (event.stopPropagation != null) {
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
    }

    //##################
    // PRIVATE METHODS #
    //##################
    _html_wrapper() {
      var options;
      options = {
        id: this.wrapper_id,
        class: 'yadcf-filter-wrapper'
      };
      return $('<div/>', options);
    }
    _html_reset_button() {
      var callback, options;
      callback = event => {
        return this.stop_propagation(event);
      };
      options = {
        type: 'button',
        id: this.reset_id,
        text: this.filter_reset_button_text,
        class: 'yadcf-filter-reset-button'
      };
      return $('<button/>', options).on('mousedown', callback);
    }
    _reset_state(column_id) {
      return this._save_state(column_id, void 0);
    }
    _save_state(column_id, data) {
      return this.datatable_filter.save_state(column_id, data);
    }
    _set_search_value(column_id, value) {
      return this.datatable_filter.set_search_value(column_id, value);
    }
    _run_filter(column_id, value) {
      return this.datatable_filter.run_filter(column_id, value);
    }
    _debug_log() {
      this.logger.info(`${this.name()} : _debug_log`);
      this.logger.dump(this.options);
      return this.logger.info(`column_id: ${this.column_id}`);
    }
    _skip_key_codes() {
      return [37, 38, 39, 40];
    }
    _with_delay(callback, ms) {
      var timer;
      timer = 0;
      return function () {
        var args, context;
        context = this;
        args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          callback.apply(context, args);
        }, ms || 0);
      };
    }
  }
  ;
  BaseFilter.extend(_modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_1__["default"].class_methods);
  BaseFilter.include(_modules_with_logger_coffee__WEBPACK_IMPORTED_MODULE_1__["default"].instance_methods);
  return BaseFilter;
}.call(undefined);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BaseFilter);

/***/ }),

/***/ "./src/model/filters/range_base.coffee":
/*!*********************************************!*\
  !*** ./src/model/filters/range_base.coffee ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base_filter_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base_filter.coffee */ "./src/model/filters/base_filter.coffee");
var RangeBase;

RangeBase = class RangeBase extends _base_filter_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(datatable_filter, logger, options1) {
    super(...arguments);
    this.datatable_filter = datatable_filter;
    this.logger = logger;
    this.options = options1;
    // fetch mandatory data
    this.from_placeholder = this.filter_default_label[0];
    this.to_placeholder = this.filter_default_label[1];
    // fetch optional data
    this.range_delimiter = this.options.filter_range_delimiter || '-yadcf_delim-';
    // build ids
    this.wrapper_outer_id = `yadcf-filter-wrapper-${this.datatable_filter.dt_id}-${this.column_id}`;
    this.wrapper_inner_id = `yadcf-filter-wrapper-inner-${this.datatable_filter.dt_id}-${this.column_id}`;
    this.from_id = `yadcf-filter-${this.datatable_filter.dt_id}-from-${this.range_type}-${this.column_id}`;
    this.to_id = `yadcf-filter-${this.datatable_filter.dt_id}-to-${this.range_type}-${this.column_id}`;
    this.reset_id = `yadcf-filter-${this.datatable_filter.dt_id}-reset-${this.range_type}-${this.column_id}`;
  }

  //#################
  // PUBLIC METHODS #
  //#################
  create_html() {
    super.create_html();
    // add outer wrapper to hold both filter and reset button
    $(`${this.container_id}`).append(this._html_wrapper_outer());
    // add inner wrapper to hold both filter and reset button
    $(`${this.container_id} div.yadcf-filter-wrapper`).append(this._html_wrapper_inner());
    // add input fields
    $(`${this.container_id} div.yadcf-filter-wrapper-inner`).append(this._html_range_start());
    $(`${this.container_id} div.yadcf-filter-wrapper-inner`).append(this._html_range_separator());
    $(`${this.container_id} div.yadcf-filter-wrapper-inner`).append(this._html_range_end());
    // add reset button
    if (this.filter_reset_button) {
      return $(`${this.container_id} div.yadcf-filter-wrapper`).append(this._html_reset_button());
    }
  }
  bind_inputs() {
    var delay, onclick_callback, onkeyup_callback;
    super.bind_inputs();
    // bind input fields
    delay = this.options.filter_delay || 0;
    onkeyup_callback = event => {
      this._range_change(event);
    };
    $(`#${this.from_id}`).on('keyup', this._with_delay(onkeyup_callback, delay));
    $(`#${this.to_id}`).on('keyup', this._with_delay(onkeyup_callback, delay));
    // bind reset button
    onclick_callback = event => {
      this._range_clear(event);
    };
    return $(`#${this.reset_id}`).on('click', onclick_callback);
  }
  restore_state() {
    var restored_from, restored_to, saved_state;
    super.restore_state();
    saved_state = this.datatable_filter.has_state_for(this.column_id);
    if (saved_state != null) {
      restored_from = saved_state.from;
      restored_to = saved_state.to;
      if (restored_from !== '') {
        $(`#${this.from_id}`).val(restored_from);
        $(`#${this.from_id}`).addClass('inuse');
      }
      if (restored_to !== '') {
        $(`#${this.to_id}`).val(restored_to);
        return $(`#${this.to_id}`).addClass('inuse');
      }
    }
  }
  reset(event) {
    super.reset(event);
    $(`#${this.from_id}`).val('');
    $(`#${this.from_id}`).removeClass('inuse');
    $(`#${this.to_id}`).val('');
    $(`#${this.to_id}`).removeClass('inuse');
    // set search value (datatable reload will be triggered later)
    this._set_search_value(this.column_id, '');
    // save current value
    return this._reset_state(this.column_id);
  }
  current_value() {
    return {
      from: $(`#${this.from_id}`).val(),
      to: $(`#${this.to_id}`).val()
    };
  }

  //##################
  // PRIVATE METHODS #
  //##################
  _html_wrapper_outer() {
    var callback, options;
    callback = event => {
      return this.stop_propagation(event);
    };
    options = {
      id: this.wrapper_outer_id,
      class: 'yadcf-filter-wrapper'
    };
    return $('<div/>', options).on('click', callback).on('mousedown', callback);
  }
  _html_wrapper_inner() {
    var options;
    options = {
      id: this.wrapper_inner_id,
      class: 'yadcf-filter-wrapper-inner'
    };
    return $('<div/>', options);
  }
  _html_range_start() {
    var callback, options;
    callback = event => {
      return this.prevent_default_on_enter(event);
    };
    options = {
      id: this.from_id,
      class: `yadcf-filter-range yadcf-filter-range-${this.range_type} yadcf-filter-range-start`,
      placeholder: this.from_placeholder
    };
    return $('<input/>', options).on('keydown', callback);
  }
  _html_range_end() {
    var callback, options;
    callback = event => {
      return this.prevent_default_on_enter(event);
    };
    options = {
      id: this.to_id,
      class: `yadcf-filter-range yadcf-filter-range-${this.range_type} yadcf-filter-range-end`,
      placeholder: this.to_placeholder
    };
    return $('<input/>', options).on('keydown', callback);
  }
  _html_range_separator() {
    var options;
    options = {
      class: `yadcf-filter-range-${this.range_type}-seperator`
    };
    return $('<span/>', options);
  }
  _range_change(event) {
    this.logger.info(`${this.name()} : _range_change`);
    return this.logger.dump(event);
  }
  _range_clear(event) {
    var current_value;
    this.logger.info(`${this.name()} : _range_clear`);
    this.logger.dump(event);
    current_value = this.current_value();
    if (current_value.from === '' && current_value.to === '') {
      return;
    }
    $(`#${this.from_id}`).val('');
    $(`#${this.from_id}`).removeClass('inuse');
    $(`#${this.to_id}`).val('');
    $(`#${this.to_id}`).removeClass('inuse');
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, this.range_delimiter);
    // save current value
    return this._save_state(this.column_id, {
      from: '',
      to: ''
    });
  }
  _debug_log() {
    super._debug_log();
    this.logger.info(`container_id: ${this.container_id}`);
    this.logger.info(`wrapper_outer_id: ${this.wrapper_outer_id}`);
    this.logger.info(`wrapper_inner_id: ${this.wrapper_inner_id}`);
    this.logger.info(`from_id: ${this.from_id}`);
    this.logger.info(`to_id: ${this.to_id}`);
    this.logger.info(`from_placeholder: ${this.from_placeholder}`);
    return this.logger.info(`to_placeholder: ${this.to_placeholder}`);
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RangeBase);

/***/ }),

/***/ "./src/model/filters/range_date_filter.coffee":
/*!****************************************************!*\
  !*** ./src/model/filters/range_date_filter.coffee ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _range_base_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./range_base.coffee */ "./src/model/filters/range_base.coffee");
var RangeDateFilter,
  boundMethodCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new Error('Bound instance method accessed before binding');
    }
  };

RangeDateFilter = class RangeDateFilter extends _range_base_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(datatable_filter, logger, options) {
    super(...arguments);
    //##################
    // PRIVATE METHODS #
    //##################
    this._date_select = this._date_select.bind(this);
    this.datatable_filter = datatable_filter;
    this.logger = logger;
    this.options = options;
    // customize class
    this.range_type = 'date';
    // fetch datepicker data
    this.filter_plugin = this.options.filter_plugin;
    this.filter_plugin_options = $.extend({}, {
      onSelect: this._date_select
    }, this.options.filter_plugin_options);
  }
  bind_inputs() {
    super.bind_inputs();
    // load datepicker with callbacks
    $(`#${this.from_id}`).datepicker($.extend(this.filter_plugin_options, {
      onClose: function (selected_date) {
        $(`#${this.to_id}`).datepicker('option', 'minDate', selected_date);
      }
    }));
    return $(`#${this.to_id}`).datepicker($.extend(this.filter_plugin_options, {
      onClose: function (selected_date) {
        $(`#${this.from_id}`).datepicker('option', 'maxDate', selected_date);
      }
    }));
  }
  _date_select(_date, _event) {
    var current_value, from, search_value, to;
    boundMethodCheck(this, RangeDateFilter);
    this.logger.info(`${this.name()} : _date_select`);
    current_value = this.current_value();
    from = current_value.from;
    to = current_value.to;
    search_value = `${from}${this.range_delimiter}${to}`;
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, search_value);
    // save current value
    return this._save_state(this.column_id, {
      from: from,
      to: to
    });
  }
  _range_change(event) {
    var current_value, date_from, date_to, from, search_value, to;
    super._range_change(event);
    if (this._skip_key_codes().includes(event.keyCode)) {
      return;
    }
    current_value = this.current_value();
    date_from = this._date_or_empty_string(current_value.from);
    date_to = this._date_or_empty_string(current_value.to);
    if (date_from instanceof Date) {
      $(`#${this.from_id}`).addClass('inuse');
      from = current_value.from;
    } else {
      $(`#${this.from_id}`).removeClass('inuse');
      from = '';
    }
    if (date_to instanceof Date) {
      $(`#${this.to_id}`).addClass('inuse');
      to = current_value.to;
    } else {
      $(`#${this.to_id}`).removeClass('inuse');
      to = '';
    }
    search_value = `${from}${this.range_delimiter}${to}`;
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, search_value);
    // save current value
    return this._save_state(this.column_id, {
      from: from,
      to: to
    });
  }
  _date_or_empty_string(value) {
    var date_format, e;
    if (value === '') {
      return '';
    }
    date_format = this.options.filter_plugin_options.dateFormat;
    try {
      return $.datepicker.parseDate(date_format, value);
    } catch (error) {
      e = error;
      this.logger.error(`error while parsing date : ${e}`);
      return '';
    }
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RangeDateFilter);

/***/ }),

/***/ "./src/model/filters/range_number_filter.coffee":
/*!******************************************************!*\
  !*** ./src/model/filters/range_number_filter.coffee ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _range_base_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./range_base.coffee */ "./src/model/filters/range_base.coffee");
var RangeNumberFilter;

RangeNumberFilter = class RangeNumberFilter extends _range_base_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(datatable_filter, logger, options) {
    super(...arguments);
    this.datatable_filter = datatable_filter;
    this.logger = logger;
    this.options = options;
    // customize class
    this.range_type = 'number';
  }

  //##################
  // PRIVATE METHODS #
  //##################
  _range_change(event) {
    var current_value, max, min, search_value;
    super._range_change(event);
    if (this._skip_key_codes().includes(event.keyCode)) {
      return;
    }
    current_value = this.current_value();
    min = this._int_or_empty_string(current_value.from);
    max = this._int_or_empty_string(current_value.to);
    if (min !== '') {
      $(`#${this.from_id}`).addClass('inuse');
    } else {
      $(`#${this.from_id}`).removeClass('inuse');
    }
    if (max !== '') {
      $(`#${this.to_id}`).addClass('inuse');
    } else {
      $(`#${this.to_id}`).removeClass('inuse');
    }
    search_value = `${min}${this.range_delimiter}${max}`;
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, search_value);
    // save current value
    return this._save_state(this.column_id, {
      from: min,
      to: max
    });
  }
  _int_or_empty_string(value) {
    value = value !== '' ? +value : value;
    if (isNaN(value)) {
      value = '';
    }
    return value;
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RangeNumberFilter);

/***/ }),

/***/ "./src/model/filters/select_base.coffee":
/*!**********************************************!*\
  !*** ./src/model/filters/select_base.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base_filter_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base_filter.coffee */ "./src/model/filters/base_filter.coffee");
var SelectBase;

SelectBase = function () {
  class SelectBase extends _base_filter_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(datatable_filter, logger, options1) {
      super(...arguments);
      this.datatable_filter = datatable_filter;
      this.logger = logger;
      this.options = options1;
      // fetch select data
      this.filter_plugin = this.options.filter_plugin;
      this.filter_plugin_options = this.options.filter_plugin_options;
      // build ids
      this.wrapper_id = `yadcf-filter-wrapper-${this.datatable_filter.dt_id}-${this.column_id}`;
      this.select_id = `yadcf-filter-${this.datatable_filter.dt_id}-${this.column_id}`;
      this.reset_id = `yadcf-filter-${this.datatable_filter.dt_id}-reset-${this.column_id}`;
    }

    //#################
    // PUBLIC METHODS #
    //#################
    create_html() {
      super.create_html();
      // add a wrapper to hold both filter and reset button
      $(`${this.container_id}`).append(this._html_wrapper());
      // add input fields
      $(`${this.container_id} div.yadcf-filter-wrapper`).append(this._html_input_field());
      // add reset button
      if (this.filter_reset_button) {
        return $(`${this.container_id} div.yadcf-filter-wrapper`).append(this._html_reset_button());
      }
    }
    bind_inputs() {
      var onchange_callback, onclick_callback;
      super.bind_inputs();
      // bind select field
      onchange_callback = event => {
        this._select_change(event);
      };
      $(`#${this.select_id}`).on('change', onchange_callback);
      // bind reset button
      onclick_callback = event => {
        this._select_clear(event);
      };
      $(`#${this.reset_id}`).on('click', onclick_callback);
      return this._initialize_select_plugin();
    }
    restore_state() {
      var restored_value, saved_state;
      super.restore_state();
      saved_state = this.datatable_filter.has_state_for(this.column_id);
      if (saved_state != null) {
        restored_value = saved_state.value;
        $(`#${this.select_id}`).val(restored_value);
        if (restored_value !== '-1') {
          return $(`#${this.select_id}`).addClass('inuse');
        }
      }
    }
    reset(event) {
      super.reset(event);
      $(`#${this.select_id}`).val('');
      $(`#${this.select_id}`).removeClass('inuse');
      // set search value (datatable reload will be triggered later)
      this._set_search_value(this.column_id, '');
      // save current value
      return this._reset_state(this.column_id);
    }
    reload(event) {
      super.reload(event);
      $(`#${this.select_id}`).empty();
      $(`#${this.select_id}`).append(this._select_options());
      return this.restore_state();
    }

    //##################
    // PRIVATE METHODS #
    //##################
    _html_input_field() {
      var callback1, callback2, options;
      options = {
        id: this.select_id,
        class: `yadcf-filter ${this.filter_css_class}`
      };
      callback1 = event => {
        return this.stop_propagation(event);
      };
      callback2 = event => {
        return this.prevent_default_on_enter(event);
      };
      return $('<select/>', options).on('click', callback1).on('keydown', callback2).on('mousedown', callback1);
    }
    _select_change(event) {
      this.logger.info(`${this.name()} : _select_change`);
      return this.logger.dump(event);
    }
    _select_clear(event) {
      var current_value;
      this.logger.info(`${this.name()} : _select_clear`);
      this.logger.dump(event);
      current_value = this.current_value();
      if (this._empty_value(current_value)) {
        return;
      }
      $(`#${this.select_id}`).val('-1');
      $(`#${this.select_id}`).removeClass('inuse');
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, '');
      // save current value
      return this._save_state(this.column_id, {
        value: '-1'
      });
    }
    _initialize_select_plugin() {
      var callback, select2;
      this.logger.info(`${this.name()} : _initialize_select_plugin`);
      switch (this.filter_plugin) {
        case 'select2':
          $(`#${this.select_id}`).select2(this.filter_plugin_options);
          select2 = $(`#${this.select_id}`).next();
          if (select2 != null && select2.hasClass('select2-container')) {
            callback = event => {
              return this.stop_propagation(event);
            };
            return select2.on('click', callback).on('mousedown', callback);
          }
          break;
        default:
          return this.logger.error(`Unknown select type: ${this.filter_plugin}`);
      }
    }
    _debug_log() {
      super._debug_log();
      this.logger.info(`container_id: ${this.container_id}`);
      this.logger.info(`wrapper_id: ${this.wrapper_id}`);
      this.logger.info(`select_id: ${this.select_id}`);
      return this.logger.info(`reset_id: ${this.reset_id}`);
    }
  }
  ;
  SelectBase.prototype.dropdown_data = null;
  return SelectBase;
}.call(undefined);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SelectBase);

/***/ }),

/***/ "./src/model/filters/select_filter.coffee":
/*!************************************************!*\
  !*** ./src/model/filters/select_filter.coffee ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _select_base_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./select_base.coffee */ "./src/model/filters/select_base.coffee");
var SelectFilter;

SelectFilter = class SelectFilter extends _select_base_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
  //#################
  // PUBLIC METHODS #
  //#################
  current_value() {
    return $.trim($(`#${this.select_id}`).find('option:selected').val());
  }
  set(value) {
    super.set(value);
    // set search value (datatable reload will be triggered later)
    this._set_search_value(this.column_id, value);
    // save current value
    return this._save_state(this.column_id, {
      value: value
    });
  }

  //##################
  // PRIVATE METHODS #
  //##################
  _select_options() {
    var data, i, len, options, ref;
    options = `<option value=\"-1\">${this.filter_default_label}</option>`;
    if (this.dropdown_data != null) {
      ref = this.dropdown_data;
      for (i = 0, len = ref.length; i < len; i++) {
        data = ref[i];
        options += `<option value=\"${data.value}\" >${data.label}</option>`;
      }
    }
    return options;
  }
  _empty_value(value) {
    return value === '-1';
  }
  _select_change(event) {
    var current_value, search_value;
    super._select_change(event);
    current_value = this.current_value();
    if (this._empty_value(current_value)) {
      search_value = '';
      $(`#${this.select_id}`).removeClass('inuse');
    } else {
      search_value = current_value;
      $(`#${this.select_id}`).addClass('inuse');
    }
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, search_value);
    // save current value
    return this._save_state(this.column_id, {
      value: current_value
    });
  }
  _html_input_field() {
    var input;
    input = super._html_input_field();
    return $(input).attr('data-placeholder', this.filter_default_label);
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SelectFilter);

/***/ }),

/***/ "./src/model/filters/select_multi_filter.coffee":
/*!******************************************************!*\
  !*** ./src/model/filters/select_multi_filter.coffee ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _select_base_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./select_base.coffee */ "./src/model/filters/select_base.coffee");
var SelectMultiFilter;

SelectMultiFilter = class SelectMultiFilter extends _select_base_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
  //#################
  // PUBLIC METHODS #
  //#################
  current_value() {
    return $(`#${this.select_id}`).val();
  }
  set(value) {
    var search_value;
    super.set(value);
    search_value = this._cast_value(value);
    // set search value (datatable reload will be triggered later)
    this._set_search_value(this.column_id, search_value);
    // save current value
    return this._save_state(this.column_id, {
      value: value
    });
  }

  //##################
  // PRIVATE METHODS #
  //##################
  _select_options() {
    var data, i, len, options, ref;
    options = '';
    if (this.dropdown_data != null) {
      ref = this.dropdown_data;
      for (i = 0, len = ref.length; i < len; i++) {
        data = ref[i];
        options += `<option value=\"${data.value}\" >${data.label}</option>`;
      }
    }
    return options;
  }
  _empty_value(value) {
    return value.length === 0;
  }
  _select_change(event) {
    var current_value, search_value;
    super._select_change(event);
    current_value = this.current_value();
    if (this._empty_value(current_value)) {
      search_value = '';
      $(`#${this.select_id}`).removeClass('inuse');
    } else {
      search_value = this._cast_value(current_value);
      $(`#${this.select_id}`).addClass('inuse');
    }
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, search_value);
    // save current value
    return this._save_state(this.column_id, {
      value: current_value
    });
  }
  _html_input_field() {
    var input;
    input = super._html_input_field();
    return $(input).attr('multiple', true).attr('data-placeholder', this.filter_default_label);
  }
  _cast_value(value) {
    return value.join('|');
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SelectMultiFilter);

/***/ }),

/***/ "./src/model/filters/text_filter.coffee":
/*!**********************************************!*\
  !*** ./src/model/filters/text_filter.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base_filter_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base_filter.coffee */ "./src/model/filters/base_filter.coffee");
var TextFilter;

TextFilter = class TextFilter extends _base_filter_coffee__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(datatable_filter, logger, options1) {
    super(...arguments);
    this.datatable_filter = datatable_filter;
    this.logger = logger;
    this.options = options1;
    // build ids
    this.wrapper_id = `yadcf-filter-wrapper-${this.datatable_filter.dt_id}-${this.column_id}`;
    this.input_id = `yadcf-filter-${this.datatable_filter.dt_id}-${this.column_id}`;
    this.reset_id = `yadcf-filter-${this.datatable_filter.dt_id}-reset-${this.column_id}`;
  }
  create_html() {
    super.create_html();
    // add a wrapper to hold both filter and reset button
    $(`${this.container_id}`).append(this._html_wrapper());
    // add input fields
    $(`${this.container_id} div.yadcf-filter-wrapper`).append(this._html_input_field());
    // add reset button
    if (this.filter_reset_button) {
      return $(`${this.container_id} div.yadcf-filter-wrapper`).append(this._html_reset_button());
    }
  }

  //#################
  // PUBLIC METHODS #
  //#################
  bind_inputs() {
    var delay, onclick_callback, onkeyup_callback;
    super.bind_inputs();
    // bind input field
    delay = this.options.filter_delay || 0;
    onkeyup_callback = event => {
      this._text_change(event);
    };
    $(`#${this.input_id}`).on('keyup', this._with_delay(onkeyup_callback, delay));
    // bind reset button
    onclick_callback = event => {
      this._text_clear(event);
    };
    return $(`#${this.reset_id}`).on('click', onclick_callback);
  }
  restore_state() {
    var restored_value, saved_state;
    super.restore_state();
    saved_state = this.datatable_filter.has_state_for(this.column_id);
    if (saved_state != null) {
      restored_value = saved_state.value;
      $(`#${this.input_id}`).val(restored_value);
      if (restored_value !== '') {
        return $(`#${this.input_id}`).addClass('inuse');
      }
    }
  }
  reset(event) {
    super.reset(event);
    $(`#${this.input_id}`).val('');
    $(`#${this.input_id}`).removeClass('inuse');
    // set search value (datatable reload will be triggered later)
    this._set_search_value(this.column_id, '');
    // save current value
    return this._reset_state(this.column_id);
  }
  set(value) {
    super.set(value);
    $(`#${this.input_id}`).val(value);
    if (value !== '') {
      $(`#${this.input_id}`).addClass('inuse');
    }
    // set search value (datatable reload will be triggered later)
    this._set_search_value(this.column_id, value);
    // save current value
    return this._save_state(this.column_id, {
      value: value
    });
  }
  current_value() {
    return $.trim($(`#${this.input_id}`).val());
  }

  //##################
  // PRIVATE METHODS #
  //##################
  _html_input_field() {
    var callback1, callback2, options;
    callback1 = event => {
      return this.prevent_default_on_enter(event);
    };
    callback2 = event => {
      return this.stop_propagation(event);
    };
    options = {
      type: 'text',
      id: this.input_id,
      class: `yadcf-filter ${this.filter_css_class}`,
      placeholder: this.filter_default_label
    };
    return $('<input/>', options).on('keydown', callback1).on('mousedown', callback2);
  }
  _empty_value(value) {
    return value === '';
  }
  _text_change(event) {
    var current_value;
    this.logger.info(`${this.name()} : _text_change`);
    this.logger.dump(event);
    if (this._skip_key_codes().includes(event.keyCode)) {
      return;
    }
    current_value = this.current_value();
    if (this._empty_value(current_value)) {
      $(`#${this.input_id}`).removeClass('inuse');
    } else {
      $(`#${this.input_id}`).addClass('inuse');
    }
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, current_value);
    // save current value
    return this._save_state(this.column_id, {
      value: current_value
    });
  }
  _text_clear(event) {
    var current_value;
    this.logger.info(`${this.name()} : _text_clear`);
    this.logger.dump(event);
    current_value = this.current_value();
    if (this._empty_value(current_value)) {
      return;
    }
    $(`#${this.input_id}`).val('');
    $(`#${this.input_id}`).removeClass('inuse');
    // run filter (triggers a datatable reload)
    this._run_filter(this.column_id, '');
    // save current value
    return this._save_state(this.column_id, {
      value: ''
    });
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextFilter);

/***/ }),

/***/ "./src/modules/loader.coffee":
/*!***********************************!*\
  !*** ./src/modules/loader.coffee ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _logger_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../logger.coffee */ "./src/logger.coffee");
/* harmony import */ var _model_datatable_filter_coffee__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/datatable_filter.coffee */ "./src/model/datatable_filter.coffee");
var Loader,
  dig,
  hasProp = {}.hasOwnProperty;
dig = __webpack_require__(/*! object-dig */ "./node_modules/object-dig/dist/index.js");


Loader = {};
Loader.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  ajax: function (url, data, callback) {
    return $.ajax({
      url: url,
      type: 'POST',
      data: data,
      statusCode: {
        422: function () {
          alert("Votre session a expiré, veuillez vous reconnecter.");
          return window.location.href = "/users/login/";
        }
      },
      success: function (data, _textStatus, _jqXHR) {
        return callback(data);
      }
    });
  },
  load_datatables: function () {
    return $('[data-toggle=datatable]').each(function () {
      var data, loader;
      data = $(this).data();
      loader = Loader.class_methods.extract_options(data, 'dtfLoader').loader;
      return Loader.class_methods.load(loader);
    });
  },
  load: function (loader) {
    var klass, logger;
    logger = new _logger_coffee__WEBPACK_IMPORTED_MODULE_0__["default"](loader.dtf_options);
    logger.log_delimiter();
    logger.info('* Class loader received data:');
    logger.info(`id: '${loader.dt_id}'`);
    logger.info(`class: '${loader.dt_class}'`);
    logger.info('dt_options:');
    logger.dump(loader.dt_options);
    logger.info('dtf_options:');
    logger.dump(loader.dtf_options);
    // Find datatable class
    klass = Loader.class_methods.constantize(loader.dt_class);
    if (klass == null) {
      logger.error(`Datatable '${loader.dt_class}' not found`);
      return false;
    }
    if (klass.instance != null) {
      logger.info(`* Trigger full reloading of datatable '${loader.dt_class}'`);
      klass.instance.destroy();
      delete klass.instance;
    }
    logger.info(`* Loading datatable '${loader.dt_class}'`);
    klass.instance = Loader.class_methods.create(klass, loader.dt_class, loader.dt_id, loader.dt_options, loader.dtf_options, logger);
    logger.info(`* Loaded datatable '${loader.dt_class}'`);
    logger.log_delimiter();
    return klass;
  },
  create: function (klass, dt_class, dt_id, dt_options, dtf_options, logger) {
    var table;
    table = new klass(dt_class, dt_id, dt_options, dtf_options, logger);
    table.load();
    return table;
  },
  extract_options: function (data, prefix) {
    var key, options, value;
    options = {};
    for (key in data) {
      if (!hasProp.call(data, key)) continue;
      value = data[key];
      if (key.startsWith(prefix)) {
        options[Loader.class_methods.to_underscore(key).split('_')[1]] = value;
      }
    }
    return options;
  },
  constantize: function (string) {
    var constant, path;
    path = string.split('.');
    constant = dig(window, ...path);
    return constant;
  },
  to_underscore: function (string) {
    return string.split(/(?=[A-Z])/).join('_').toLowerCase();
  }
};
Loader.instance_methods = {
  //##########################
  // Public Instance methods #
  //##########################
  init_datatable: function () {
    this.info('Create Datatable');
    // create filters just after dt initialization
    $(this.dt_id).on('preInit.dt', (event, settings) => {
      this.info('preInit.dt callback was called, set filters if exist');
      this.datatable = new $.fn.dataTable.Api(settings);
      return this.init_filters(event);
    });
    $(this.dt_id).DataTable(this.dt_options);
    return this.info('Datatable created');
  },
  init_filters: function (event) {
    var form;
    if (this.filters.length === 0) {
      return;
    }
    this.info('Load Datatable filters');
    this.datatable_filter = new _model_datatable_filter_coffee__WEBPACK_IMPORTED_MODULE_1__["default"](this, this.filters, this.filters_applied, this.logger);
    this.datatable_filter.load();
    this.datatable_filter.apply_default_filters(event);
    form = $(this.dt_id + '_wrapper').parent();
    if (form != null) {
      $(form).find('.yadcf-filter-wrapper').each(function () {
        $(this).children().wrapAll('<div class="col-md-12"></div>').wrapAll('<div class="input-group"></div>');
        return $(this).children().wrapAll('<div class="form-group row"></div>');
      });
      $(form).find('.yadcf-filter-reset-button').addClass('btn btn-default').wrap('<span class="input-group-btn"></span>');
      $(form).find('.yadcf-filter').addClass('form-control');
    }
    return this.info('Datatable filters loaded');
  },
  loader_load_callbacks: function () {
    this._loader_load_ajax_callbacks();
    this._loader_load_created_row_callbacks();
    this._loader_load_draw_callbacks();
    return this._loader_load_buttons_callbacks();
  },
  //###########################
  // Private Instance methods #
  //###########################
  _loader_load_ajax_callbacks: function () {
    var local_opts;
    this.info('Build datatable callbacks options : ajax');
    if (this.callbacks['ajax'].length > 0) {
      local_opts = this._build_ajax_option_with_callbacks();
    } else {
      local_opts = this._build_ajax_option_without_callbacks();
    }
    return this.dt_options = $.extend({}, this.dt_options, local_opts);
  },
  _loader_load_created_row_callbacks: function () {
    var callbacks, local_opts;
    this.info('Build datatable callbacks options : createdRow');
    // Keep a local reference for the createdRow option
    callbacks = this.callbacks['createdRow'];
    local_opts = {
      createdRow: function (row, data, index, cells) {
        var c, i, len, results;
        results = [];
        for (i = 0, len = callbacks.length; i < len; i++) {
          c = callbacks[i];
          results.push(c(row, data, index, cells));
        }
        return results;
      }
    };
    return this.dt_options = $.extend({}, this.dt_options, local_opts);
  },
  _loader_load_draw_callbacks: function () {
    var callbacks, local_opts;
    this.info('Build datatable callbacks options : drawCallback');
    // Keep a local reference for the drawCallback option
    callbacks = this.callbacks['drawCallback'];
    local_opts = {
      drawCallback: function (settings) {
        var c, i, len, results;
        results = [];
        for (i = 0, len = callbacks.length; i < len; i++) {
          c = callbacks[i];
          results.push(c(settings));
        }
        return results;
      }
    };
    return this.dt_options = $.extend({}, this.dt_options, local_opts);
  },
  _loader_load_buttons_callbacks: function () {
    var callback;
    this.info('Build datatable callbacks options : buttons');
    callback = function (dt_class, _data, _status, _xhr) {
      var klass;
      klass = Loader.class_methods.constantize(dt_class);
      return klass.instance.datatable.ajax.reload();
    };
    this.callbacks['buttons']['select_all'] = {
      success: [callback]
    };
    return this.callbacks['buttons']['reset_selection'] = {
      success: [callback]
    };
  },
  _select: function (obj, predicate) {
    var k, res, v;
    res = {};
    for (k in obj) {
      v = obj[k];
      if (predicate(k, v)) {
        res[k] = v;
      }
    }
    return res;
  },
  _build_ajax_option_with_callbacks: function () {
    var callbacks, url;
    // Keep a local reference for the ajax option
    url = this.dt_options['source'];
    callbacks = this.callbacks['ajax'];
    return {
      ajax: function (data, callback, _settings) {
        var c, i, len;
        for (i = 0, len = callbacks.length; i < len; i++) {
          c = callbacks[i];
          data = $.extend({}, data, c(data));
        }
        return Loader.class_methods.ajax(url, data, callback);
      }
    };
  },
  _build_ajax_option_without_callbacks: function () {
    var url;
    url = this.dt_options['source'];
    return {
      ajax: function (data, callback, _settings) {
        return Loader.class_methods.ajax(url, data, callback);
      }
    };
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Loader);

/***/ }),

/***/ "./src/modules/with_buttons.coffee":
/*!*****************************************!*\
  !*** ./src/modules/with_buttons.coffee ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var WithButtons;
WithButtons = {};
WithButtons.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  reset_datatable_selection: function () {
    return this.instance.reset_datatable_selection();
  }
};
WithButtons.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_buttons_set_callbacks: function (callback_type) {
    if (!this._buttons_enabled()) {
      return false;
    }
    switch (callback_type) {
      case 'before_init':
        this.info('Load buttons');
        this._load_button('select_all', (_event, button) => {
          return this.select_all(button);
        });
        this._load_button('reset_selection', (_event, button) => {
          return this.reset_selection(button);
        });
        this._load_button('reset_filters', (event, _button) => {
          return this.reset_filters(event);
        });
        return this._load_button('apply_default_filters', (event, _button) => {
          return this.apply_default_filters(event);
        });
    }
  },
  //##########################
  // Public Instance methods #
  //##########################
  reset_datatable_selection: function () {
    var button;
    button = this.find_button_by_name('reset_selection');
    if (button != null) {
      return this.reset_selection(button[1]);
    }
  },
  find_button_by_name: function (button_name) {
    return this._find_button(this.buttons, button_name);
  },
  reset_filters: function (event) {
    return this.datatable_filter.reset_filters(event);
  },
  apply_default_filters: function (event) {
    return this.datatable_filter.apply_default_filters(event);
  },
  select_all: function (button) {
    var ajax_options, params;
    // Get datatable params
    params = this.datatable.ajax.params();
    // Set length to -1 to get all filtered records
    params['length'] = -1;
    // Reset selection
    params['selected'] = [];
    params['not_selected'] = [];
    // Select all rows in the current page
    this.select_all_rows();
    // Build ajax options
    ajax_options = this._build_ajax_options('select_all');
    // Call url
    return this._call_url(button, params, ajax_options);
  },
  reset_selection: function (button) {
    var ajax_options, params;
    // Get datatable params
    params = this.datatable.ajax.params();
    // Reset selection
    params['selected'] = [];
    params['not_selected'] = [];
    // unselect all rows in the current page
    this.unselect_all_rows();
    // Build ajax options
    ajax_options = this._build_ajax_options('reset_selection');
    // Call url
    return this._call_url(button, params, ajax_options);
  },
  //###########################
  // Private Instance methods #
  //###########################
  _buttons_enabled: function () {
    return this.buttons.length > 0;
  },
  _find_button: function (buttons, button_name) {
    var i, len;
    i = 0;
    len = buttons.length;
    while (i < len) {
      if (buttons[i].button_name === button_name) {
        return [i, buttons[i]];
      }
      i++;
    }
    return null;
  },
  _load_button: function (button_name, callback) {
    var button;
    button = this.find_button_by_name(button_name);
    if (button != null) {
      return this._add_callback(button, callback);
    }
  },
  _add_callback: function (button, callback) {
    var idx;
    idx = button[0];
    button = button[1];
    button.action = function (event, _dt, _node, _config) {
      return callback(event, button);
    };
    return this.buttons[idx] = button;
  },
  _build_ajax_options: function (button) {
    var callbacks, dt_class, on_error, on_send, on_success;
    dt_class = this.dt_class;
    callbacks = this.callbacks['buttons'][button];
    on_send = callbacks.beforeSend != null ? callbacks.beforeSend : [];
    on_error = callbacks.error != null ? callbacks.error : [];
    on_success = callbacks.success != null ? callbacks.success : [];
    return {
      beforeSend: (xhr, settings) => {
        var c, j, len1, results;
        results = [];
        for (j = 0, len1 = on_send.length; j < len1; j++) {
          c = on_send[j];
          results.push(c(dt_class, xhr, settings));
        }
        return results;
      },
      error: (xhr, status, error) => {
        var c, j, len1, results;
        results = [];
        for (j = 0, len1 = on_error.length; j < len1; j++) {
          c = on_error[j];
          results.push(c(dt_class, xhr, status, error));
        }
        return results;
      },
      success: (data, status, xhr) => {
        var c, j, len1, results;
        results = [];
        for (j = 0, len1 = on_success.length; j < len1; j++) {
          c = on_success[j];
          results.push(c(dt_class, data, status, xhr));
        }
        return results;
      }
    };
  },
  _call_url: function (button, params, ajax_options) {
    var options;
    options = {
      url: button.url,
      method: button.method
    };
    if (params) {
      options = $.extend({}, options, {
        data: params
      });
    }
    if (ajax_options) {
      options = $.extend({}, options, ajax_options);
    }
    return $.ajax(options);
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WithButtons);

/***/ }),

/***/ "./src/modules/with_check_boxes.coffee":
/*!*********************************************!*\
  !*** ./src/modules/with_check_boxes.coffee ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var WithCheckBoxes;
WithCheckBoxes = {};
WithCheckBoxes.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  reload: function (callback = null, reset_paging = true) {
    return this.instance.reload(callback, reset_paging);
  }
};
WithCheckBoxes.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_check_boxes_set_callbacks: function (callback_type) {
    if (!this._check_boxes_enabled()) {
      return false;
    }
    switch (callback_type) {
      case 'before_init':
        this.info('Add check_boxes callbacks to : ajax');
        this.callbacks['ajax'].push(this._check_boxes_callback_on_ajax());
        this.info('Add check_boxes callbacks to : createdRow');
        return this.callbacks['createdRow'].push(this._check_boxes_callback_on_created_row());
      case 'after_init':
        this.info('Add check_boxes callbacks to : datatable');
        // Update state of "Select all" control
        this.datatable.on('draw.dt', this._check_boxes_callback_on_draw());
        // Update global count
        this.datatable.on('xhr.dt', this._check_boxes_callback_on_xhr());
        // Handle row selection event
        this.datatable.on('select.dt deselect.dt', this._check_boxes_callback_on_select());
        // Handle click on "Select all" control
        $('thead', this.datatable.table().container()).on('click', 'input[type="checkbox"]', this._check_boxes_callback_checkbox_on_click());
        // Handle click on heading containing "Select all" control
        return $('thead', this.datatable.table().container()).on('click', 'th:first-child', this._check_boxes_callback_th_on_click());
    }
  },
  //##########################
  // Public Instance methods #
  //##########################
  reload: function (callback = null, reset_paging = true) {
    return this.datatable.ajax.reload(callback, reset_paging);
  },
  get_selected_checkbox_ids: function () {
    return $(this.dt_id).find('tbody > tr.selected').map(function () {
      return this.id;
    }).toArray();
  },
  get_not_selected_checkbox_ids: function () {
    return $(this.dt_id).find('tbody > tr').not('.selected').map(function () {
      return this.id;
    }).toArray();
  },
  select_all_rows: function () {
    return this.datatable.rows({
      page: 'current'
    }).select();
  },
  unselect_all_rows: function () {
    return this.datatable.rows({
      page: 'current'
    }).deselect();
  },
  select_row: function (tr) {
    return this.datatable.row('#' + tr.attr('id'), {
      page: 'current'
    }).select();
  },
  update_select_all_ctrl: function () {
    var chkbox_all, chkbox_checked, select_all, table;
    if (this.datatable == null) {
      this.error("update_select_all_ctrl: Datatable instance is null");
      return false;
    }
    table = this.datatable.table().container();
    select_all = $('thead input[type="checkbox"]', table).get(0);
    chkbox_all = $('tbody input[type="checkbox"]', table);
    chkbox_checked = $('tbody input[type="checkbox"]:checked', table);
    if (select_all == null) {
      return false;
    }
    // If none of the checkboxes are checked
    if (chkbox_checked.length === 0) {
      select_all.checked = false;
      if ('indeterminate' in select_all) {
        select_all.indeterminate = false;
      }
      // If all of the checkboxes are checked
    } else if (chkbox_checked.length === chkbox_all.length) {
      select_all.checked = true;
      if ('indeterminate' in select_all) {
        select_all.indeterminate = false;
      }
    } else {
      // If some of the checkboxes are checked
      select_all.checked = true;
      if ('indeterminate' in select_all) {
        select_all.indeterminate = true;
      }
    }
  },
  //############
  // Callbacks #
  //############
  _check_boxes_callback_on_ajax: function () {
    return d => {
      var e;
      e = {
        selected: this.get_selected_checkbox_ids(),
        not_selected: this.get_not_selected_checkbox_ids()
      };
      return $.extend({}, d, e);
    };
  },
  _check_boxes_callback_on_created_row: function () {
    return row => {
      return this._add_row_if_checked($(row));
    };
  },
  _check_boxes_callback_on_draw: function () {
    return () => {
      return this.update_select_all_ctrl();
    };
  },
  _check_boxes_callback_on_xhr: function () {
    return (e, settings, json, _xhr) => {
      if (json != null && json['records_selected'] != null) {
        return this._update_select_all_global_count(json['records_selected']);
      } else {
        return false;
      }
    };
  },
  _check_boxes_callback_on_select: function () {
    return (e, api, _type, _items) => {
      if (e.type === 'select') {
        $('tr.selected input[type="checkbox"]', api.table().container()).prop('checked', true);
      } else {
        $('tr:not(.selected) input[type="checkbox"]', api.table().container()).prop('checked', false);
      }
      // Update state of "Select all" control
      return this.update_select_all_ctrl();
    };
  },
  _check_boxes_callback_checkbox_on_click: function () {
    return event => {
      event.stopPropagation();
      if (event.target.checked) {
        return this.select_all_rows();
      } else {
        return this.unselect_all_rows();
      }
    };
  },
  _check_boxes_callback_th_on_click: function () {
    return function (_event) {
      return $('input[type="checkbox"]', this).trigger('click');
    };
  },
  //###########################
  // Private Instance methods #
  //###########################
  _check_boxes_enabled: function () {
    var column;
    column = this.find_column_by_name('check_box');
    return column != null;
  },
  _add_row_if_checked: function (tr) {
    var checkbox;
    checkbox = $($(tr).find('input[type="checkbox"]')[0]);
    if (checkbox.is(':checked')) {
      return this.select_row(tr);
    }
  },
  _update_select_all_global_count: function (count) {
    return $(`${this.dt_id}_wrapper .selected-count`).html("Nombre total d'éléments sélectionnés : ").append($('<span>').attr('id', 'selected-count-number').html(count));
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WithCheckBoxes);

/***/ }),

/***/ "./src/modules/with_context_menu.coffee":
/*!**********************************************!*\
  !*** ./src/modules/with_context_menu.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _context_menu_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../context_menu.coffee */ "./src/context_menu.coffee");
var WithContextMenu;

WithContextMenu = {};
WithContextMenu.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  clean_context_menu: function (event) {
    var target;
    target = $(event.target);
    if (target.is('a') && target.hasClass('submenu')) {
      event.preventDefault();
      return;
    }
    return WithContextMenu.class_methods.context_menu_hide();
  },
  context_menu_hide: function () {
    return $('#context-menu').hide();
  }
};
WithContextMenu.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_context_menu_set_callbacks: function (callback_type) {
    if (!this._context_menu_enabled()) {
      return false;
    }
    switch (callback_type) {
      case 'before_init':
        this.info('Add context_menu callbacks to : createdRow');
        return this.callbacks['createdRow'].push(this._context_menu_callback_on_created_row());
      case 'after_init':
        this.info('Add context_menu callbacks to : datatable');
        // Handle right click on datatable
        return $('tbody', this.datatable.table().container()).on('contextmenu', this._context_menu_callback_on_contextmenu());
    }
  },
  //############
  // Callbacks #
  //############
  _context_menu_callback_on_created_row: function () {
    return row => {
      return this._enable_contextual_menu_for_row(row);
    };
  },
  _context_menu_callback_on_contextmenu: function () {
    return event => {
      var target, tr;
      target = $(event.target);
      if (target.is('a')) {
        return;
      }
      tr = target.parents('tr').first();
      if (!tr.hasClass('has-context-menu')) {
        return;
      }
      event.preventDefault();
      this._handle_row_selection(tr);
      return _context_menu_coffee__WEBPACK_IMPORTED_MODULE_0__["default"].show(event);
    };
  },
  //###########################
  // Private Instance methods #
  //###########################
  _context_menu_enabled: function () {
    return this.dtf_options.context_menu != null && (this.dtf_options.context_menu === true || this.dtf_options.context_menu === 'true');
  },
  _enable_contextual_menu_for_row: function (row) {
    return $(row).addClass('has-context-menu');
  },
  _handle_row_selection: function (row) {
    if (!row.hasClass('selected')) {
      this.unselect_all_rows();
      this.select_row(row);
      return this.update_select_all_ctrl();
    }
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WithContextMenu);

/***/ }),

/***/ "./src/modules/with_debug.coffee":
/*!***************************************!*\
  !*** ./src/modules/with_debug.coffee ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var WithDebug;
WithDebug = {};
WithDebug.class_methods = {};
WithDebug.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_debug_set_callbacks: function (callback_type) {
    switch (callback_type) {
      case 'before_init':
        this.info('Add debug callbacks to : ajax');
        return this.callbacks['ajax'].push(this._debug_callback_on_ajax());
    }
  },
  //############
  // Callbacks #
  //############
  _debug_callback_on_ajax: function () {
    return d => {
      var debug_dump, debug_log, e;
      debug_log = !!this._param('dtf_debug_log');
      debug_dump = !!this._param('dtf_debug_dump');
      e = {
        dtf_debug_log: debug_log,
        dtf_debug_dump: debug_dump
      };
      return $.extend({}, d, e);
    };
  },
  //###########################
  // Private Instance methods #
  //###########################
  _param: function (name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WithDebug);

/***/ }),

/***/ "./src/modules/with_filters.coffee":
/*!*****************************************!*\
  !*** ./src/modules/with_filters.coffee ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var WithFilters;
WithFilters = {};
WithFilters.class_methods = {};
WithFilters.instance_methods = {
  //##########################
  // Public Instance methods #
  //##########################
  find_filter_by_name: function (column_name) {
    var column;
    column = this.find_column_by_name(column_name);
    if (column != null) {
      return this._find_filter(this.filters, column[0]);
    }
  },
  //###########################
  // Private Instance methods #
  //###########################
  _find_filter: function (filters, column_id) {
    var i, len;
    i = 0;
    len = filters.length;
    while (i < len) {
      if (filters[i].column_id === column_id) {
        return [i, filters[i]];
      }
      i++;
    }
    return null;
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WithFilters);

/***/ }),

/***/ "./src/modules/with_logger.coffee":
/*!****************************************!*\
  !*** ./src/modules/with_logger.coffee ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var WithLogger;
WithLogger = {};
WithLogger.class_methods = {};
WithLogger.instance_methods = {
  //##########################
  // Public Instance methods #
  //##########################
  info: function (message) {
    return this.logger.info(this._format_message(message));
  },
  warn: function (message) {
    return this.logger.warn(this._format_message(message));
  },
  error: function (message) {
    return this.logger.error(this._format_message(message));
  },
  dump: function (message) {
    return this.logger.dump(message);
  },
  _format_message: function (message) {
    return `${this.dt_class} : ${message}`;
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WithLogger);

/***/ }),

/***/ "./node_modules/compare-versions/lib/esm/compare.js":
/*!**********************************************************!*\
  !*** ./node_modules/compare-versions/lib/esm/compare.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compare: () => (/* binding */ compare)
/* harmony export */ });
/* harmony import */ var _compareVersions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./compareVersions.js */ "./node_modules/compare-versions/lib/esm/compareVersions.js");

/**
 * Compare [semver](https://semver.org/) version strings using the specified operator.
 *
 * @param v1 First version to compare
 * @param v2 Second version to compare
 * @param operator Allowed arithmetic operator to use
 * @returns `true` if the comparison between the firstVersion and the secondVersion satisfies the operator, `false` otherwise.
 *
 * @example
 * ```
 * compare('10.1.8', '10.0.4', '>'); // return true
 * compare('10.0.1', '10.0.1', '='); // return true
 * compare('10.1.1', '10.2.2', '<'); // return true
 * compare('10.1.1', '10.2.2', '<='); // return true
 * compare('10.1.1', '10.2.2', '>='); // return false
 * ```
 */
const compare = (v1, v2, operator) => {
    // validate input operator
    assertValidOperator(operator);
    // since result of compareVersions can only be -1 or 0 or 1
    // a simple map can be used to replace switch
    const res = (0,_compareVersions_js__WEBPACK_IMPORTED_MODULE_0__.compareVersions)(v1, v2);
    return operatorResMap[operator].includes(res);
};
const operatorResMap = {
    '>': [1],
    '>=': [0, 1],
    '=': [0],
    '<=': [-1, 0],
    '<': [-1],
    '!=': [-1, 1],
};
const allowedOperators = Object.keys(operatorResMap);
const assertValidOperator = (op) => {
    if (typeof op !== 'string') {
        throw new TypeError(`Invalid operator type, expected string but got ${typeof op}`);
    }
    if (allowedOperators.indexOf(op) === -1) {
        throw new Error(`Invalid operator, expected one of ${allowedOperators.join('|')}`);
    }
};
//# sourceMappingURL=compare.js.map

/***/ }),

/***/ "./node_modules/compare-versions/lib/esm/compareVersions.js":
/*!******************************************************************!*\
  !*** ./node_modules/compare-versions/lib/esm/compareVersions.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compareVersions: () => (/* binding */ compareVersions)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./node_modules/compare-versions/lib/esm/utils.js");

/**
 * Compare [semver](https://semver.org/) version strings to find greater, equal or lesser.
 * This library supports the full semver specification, including comparing versions with different number of digits like `1.0.0`, `1.0`, `1`, and pre-release versions like `1.0.0-alpha`.
 * @param v1 - First version to compare
 * @param v2 - Second version to compare
 * @returns Numeric value compatible with the [Array.sort(fn) interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters).
 */
const compareVersions = (v1, v2) => {
    // validate input and split into segments
    const n1 = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.validateAndParse)(v1);
    const n2 = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.validateAndParse)(v2);
    // pop off the patch
    const p1 = n1.pop();
    const p2 = n2.pop();
    // validate numbers
    const r = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.compareSegments)(n1, n2);
    if (r !== 0)
        return r;
    // validate pre-release
    if (p1 && p2) {
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.compareSegments)(p1.split('.'), p2.split('.'));
    }
    else if (p1 || p2) {
        return p1 ? -1 : 1;
    }
    return 0;
};
//# sourceMappingURL=compareVersions.js.map

/***/ }),

/***/ "./node_modules/compare-versions/lib/esm/utils.js":
/*!********************************************************!*\
  !*** ./node_modules/compare-versions/lib/esm/utils.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   compareSegments: () => (/* binding */ compareSegments),
/* harmony export */   semver: () => (/* binding */ semver),
/* harmony export */   validateAndParse: () => (/* binding */ validateAndParse)
/* harmony export */ });
const semver = /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;
const validateAndParse = (version) => {
    if (typeof version !== 'string') {
        throw new TypeError('Invalid argument expected string');
    }
    const match = version.match(semver);
    if (!match) {
        throw new Error(`Invalid argument not valid semver ('${version}' received)`);
    }
    match.shift();
    return match;
};
const isWildcard = (s) => s === '*' || s === 'x' || s === 'X';
const tryParse = (v) => {
    const n = parseInt(v, 10);
    return isNaN(n) ? v : n;
};
const forceType = (a, b) => typeof a !== typeof b ? [String(a), String(b)] : [a, b];
const compareStrings = (a, b) => {
    if (isWildcard(a) || isWildcard(b))
        return 0;
    const [ap, bp] = forceType(tryParse(a), tryParse(b));
    if (ap > bp)
        return 1;
    if (ap < bp)
        return -1;
    return 0;
};
const compareSegments = (a, b) => {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const r = compareStrings(a[i] || '0', b[i] || '0');
        if (r !== 0)
            return r;
    }
    return 0;
};
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/deepmerge/dist/cjs.js":
/*!********************************************!*\
  !*** ./node_modules/deepmerge/dist/cjs.js ***!
  \********************************************/
/***/ ((module) => {



var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

module.exports = deepmerge_1;


/***/ }),

/***/ "./node_modules/object-dig/dist/index.js":
/*!***********************************************!*\
  !*** ./node_modules/object-dig/dist/index.js ***!
  \***********************************************/
/***/ ((module) => {



module.exports = function (target) {
  for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    keys[_key - 1] = arguments[_key];
  }

  var digged = target;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      if (typeof digged === 'undefined' || digged === null) {
        return undefined;
      }
      if (typeof key === 'function') {
        digged = key(digged);
      } else {
        digged = digged[key];
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  ;
  return digged;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/index.coffee ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DatatableBase: () => (/* reexport safe */ _model_datatable_base_coffee__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _model_datatable_base_coffee__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model/datatable_base.coffee */ "./src/model/datatable_base.coffee");


})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});