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
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ContextMenu;
ContextMenu = /*#__PURE__*/function () {
  function ContextMenu() {
    _classCallCheck(this, ContextMenu);
  }
  _createClass(ContextMenu, null, [{
    key: "window_size",
    value:
    //################
    // Class methods #
    //################
    function window_size() {
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
  }, {
    key: "show",
    value: function show(event) {
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
        success: function success(result, _textStatus, _jqXHR) {
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
  }]);
  return ContextMenu;
}();
var _default = exports["default"] = ContextMenu;

/***/ }),

/***/ "./src/extendable.coffee":
/*!*******************************!*\
  !*** ./src/extendable.coffee ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Extendable,
  moduleKeywords,
  indexOf = [].indexOf;
moduleKeywords = ['extended', 'included'];
Extendable = /*#__PURE__*/function () {
  function Extendable() {
    _classCallCheck(this, Extendable);
  }
  _createClass(Extendable, null, [{
    key: "extend",
    value: function extend(obj) {
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
  }, {
    key: "include",
    value: function include(obj) {
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
  }]);
  return Extendable;
}();
var _default = exports["default"] = Extendable;

/***/ }),

/***/ "./src/logger.coffee":
/*!***************************!*\
  !*** ./src/logger.coffee ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extendable = _interopRequireDefault(__webpack_require__(/*! ./extendable.coffee */ "./src/extendable.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var Logger;
Logger = /*#__PURE__*/function (_Extendable) {
  _inherits(Logger, _Extendable);
  function Logger(dtf_options) {
    var _this;
    _classCallCheck(this, Logger);
    _this = _callSuper(this, Logger);
    _this.dtf_options = dtf_options;
    return _this;
  }
  _createClass(Logger, [{
    key: "log_delimiter",
    value: function log_delimiter() {
      return this.info('----------------------------------------');
    }
  }, {
    key: "info",
    value: function info(message) {
      if (this.dtf_options.debug_log != null && (this.dtf_options.debug_log === true || this.dtf_options.debug_log === 'true')) {
        return console.info("DatatableFactory : ".concat(message));
      }
    }
  }, {
    key: "warn",
    value: function warn(message) {
      return console.warn("DatatableFactory : ".concat(message));
    }
  }, {
    key: "error",
    value: function error(message) {
      return console.error("DatatableFactory : ".concat(message));
    }
  }, {
    key: "dump",
    value: function dump(message) {
      if (this.dtf_options.debug_dump != null && (this.dtf_options.debug_dump === true || this.dtf_options.debug_dump === 'true')) {
        return console.info(message);
      }
    }
  }]);
  return Logger;
}(_extendable["default"]);
var _default = exports["default"] = Logger;

/***/ }),

/***/ "./src/model/datatable_base.coffee":
/*!*****************************************!*\
  !*** ./src/model/datatable_base.coffee ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extendable = _interopRequireDefault(__webpack_require__(/*! ../extendable.coffee */ "./src/extendable.coffee"));
var _loader = _interopRequireDefault(__webpack_require__(/*! ../modules/loader.coffee */ "./src/modules/loader.coffee"));
var _with_logger = _interopRequireDefault(__webpack_require__(/*! ../modules/with_logger.coffee */ "./src/modules/with_logger.coffee"));
var _with_filters = _interopRequireDefault(__webpack_require__(/*! ../modules/with_filters.coffee */ "./src/modules/with_filters.coffee"));
var _with_check_boxes = _interopRequireDefault(__webpack_require__(/*! ../modules/with_check_boxes.coffee */ "./src/modules/with_check_boxes.coffee"));
var _with_buttons = _interopRequireDefault(__webpack_require__(/*! ../modules/with_buttons.coffee */ "./src/modules/with_buttons.coffee"));
var _with_context_menu = _interopRequireDefault(__webpack_require__(/*! ../modules/with_context_menu.coffee */ "./src/modules/with_context_menu.coffee"));
var _with_debug = _interopRequireDefault(__webpack_require__(/*! ../modules/with_debug.coffee */ "./src/modules/with_debug.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var DatatableBase;
DatatableBase = function () {
  var DatatableBase = /*#__PURE__*/function (_Extendable) {
    _inherits(DatatableBase, _Extendable);
    function DatatableBase(dt_class, dt_id, dt_options, dtf_options, logger) {
      var _this;
      _classCallCheck(this, DatatableBase);
      _this = _callSuper(this, DatatableBase);
      _this.dt_class = dt_class;
      _this.dt_id = dt_id;
      _this.dt_options = dt_options;
      _this.dtf_options = dtf_options;
      _this.logger = logger;
      // Extract some options
      _this.columns = _this.dt_options['columns'] || [];
      _this.buttons = _this.dt_options['buttons'] || [];
      _this.filters = _this.dt_options['filters'] || [];
      _this.filters_applied = _this.dt_options['filters_applied'] || [];
      // Don't polute jQuery Datatable options namespace
      _this.dt_options = _this._select(_this.dt_options, function (k, _v) {
        return k !== 'filters' && k !== 'filters_applied';
      });
      _this.dt_id_strip = _this.dt_id.substring(1);
      // Init callbacks hash
      _this.callbacks['ajax'] = [];
      _this.callbacks['createdRow'] = [];
      _this.callbacks['drawCallback'] = [];
      _this.callbacks['buttons'] = {};
      _this.callbacks['buttons']['select_all'] = {};
      _this.callbacks['buttons']['reset_selection'] = {};
      return _this;
    }

    //##########################
    // Public Instance methods #
    //##########################
    _createClass(DatatableBase, [{
      key: "load",
      value: function load() {
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
    }, {
      key: "destroy",
      value: function destroy() {
        this.datatable.destroy();
        return this.datatable = null;
      }
    }, {
      key: "before_init",
      value: function before_init() {
        this.info('Build config');
        this.info('Before init callbacks');
        // Load callbacks and buttons
        this.with_check_boxes_set_callbacks('before_init');
        this.with_context_menu_set_callbacks('before_init');
        this.with_debug_set_callbacks('before_init');
        return this.with_buttons_set_callbacks('before_init');
      }
    }, {
      key: "after_init",
      value: function after_init() {
        this.info('After init callbacks');
        // Load callbacks
        this.with_check_boxes_set_callbacks('after_init');
        this.with_context_menu_set_callbacks('after_init');
        this.with_debug_set_callbacks('after_init');
        return this.with_buttons_set_callbacks('after_init');
      }
    }, {
      key: "log_final_options",
      value: function log_final_options() {
        this.info('Final config');
        this.info('dt_options:');
        return this.dump(this.dt_options);
      }
    }, {
      key: "find_column_by_name",
      value: function find_column_by_name(column_name) {
        return this._find_column(this.columns, column_name);
      }

      //###########################
      // Private Instance methods #
      //###########################
    }, {
      key: "_find_column",
      value: function _find_column(columns, column_name) {
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
    }]);
    return DatatableBase;
  }(_extendable["default"]);
  ;
  DatatableBase.extend(_loader["default"].class_methods);
  DatatableBase.include(_loader["default"].instance_methods);
  DatatableBase.extend(_with_logger["default"].class_methods);
  DatatableBase.include(_with_logger["default"].instance_methods);
  DatatableBase.extend(_with_filters["default"].class_methods);
  DatatableBase.include(_with_filters["default"].instance_methods);
  DatatableBase.extend(_with_check_boxes["default"].class_methods);
  DatatableBase.include(_with_check_boxes["default"].instance_methods);
  DatatableBase.extend(_with_buttons["default"].class_methods);
  DatatableBase.include(_with_buttons["default"].instance_methods);
  DatatableBase.extend(_with_context_menu["default"].class_methods);
  DatatableBase.include(_with_context_menu["default"].instance_methods);
  DatatableBase.extend(_with_debug["default"].class_methods);
  DatatableBase.include(_with_debug["default"].instance_methods);

  //###################
  // Class attributes #
  //###################
  DatatableBase.instance = null;
  DatatableBase.dtf_options = null;

  //######################
  // Instance attributes #
  //######################
  DatatableBase.prototype.columns = [];
  DatatableBase.prototype.buttons = [];
  DatatableBase.prototype.filters = [];
  DatatableBase.prototype.filters_applied = [];
  DatatableBase.prototype.callbacks = {};
  return DatatableBase;
}.call(void 0);
var _default = exports["default"] = DatatableBase;

/***/ }),

/***/ "./src/model/datatable_filter.coffee":
/*!*******************************************!*\
  !*** ./src/model/datatable_filter.coffee ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extendable = _interopRequireDefault(__webpack_require__(/*! ../extendable.coffee */ "./src/extendable.coffee"));
var _with_logger = _interopRequireDefault(__webpack_require__(/*! ../modules/with_logger.coffee */ "./src/modules/with_logger.coffee"));
var _text_filter = _interopRequireDefault(__webpack_require__(/*! ./filters/text_filter.coffee */ "./src/model/filters/text_filter.coffee"));
var _range_date_filter = _interopRequireDefault(__webpack_require__(/*! ./filters/range_date_filter.coffee */ "./src/model/filters/range_date_filter.coffee"));
var _range_number_filter = _interopRequireDefault(__webpack_require__(/*! ./filters/range_number_filter.coffee */ "./src/model/filters/range_number_filter.coffee"));
var _select_filter = _interopRequireDefault(__webpack_require__(/*! ./filters/select_filter.coffee */ "./src/model/filters/select_filter.coffee"));
var _select_multi_filter = _interopRequireDefault(__webpack_require__(/*! ./filters/select_multi_filter.coffee */ "./src/model/filters/select_multi_filter.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var DatatableFilter, merge;
merge = __webpack_require__(/*! deepmerge */ "./node_modules/deepmerge/dist/cjs.js");
DatatableFilter = function () {
  var DatatableFilter = /*#__PURE__*/function (_Extendable) {
    _inherits(DatatableFilter, _Extendable);
    function DatatableFilter(datatable, filters, filters_applied, logger) {
      var _this;
      _classCallCheck(this, DatatableFilter);
      _this = _callSuper(this, DatatableFilter);
      _this.datatable = datatable;
      _this.filters = filters;
      _this.filters_applied = filters_applied;
      _this.logger = logger;
      // initialize loaded_filters
      _this.loaded_filters = {};
      // Set datatable instance
      _this.dt_id = _this.datatable.dt_id_strip;
      _this.dt_class = _this.datatable.dt_class;
      _this.instance = _this.datatable.datatable;
      return _this;
    }
    _createClass(DatatableFilter, [{
      key: "load",
      value: function load() {
        this._load_filters();
        return this._bind_datatable();
      }
    }, {
      key: "find_by_column_id",
      value: function find_by_column_id(column_id) {
        return this.loaded_filters[column_id];
      }
    }, {
      key: "save_state",
      value: function save_state(column_id, data) {
        var overwrite_merge, state, tmp;
        this.info("Save current filter state (".concat(column_id, ")"));
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
        overwrite_merge = function overwrite_merge(destinationArray, sourceArray, options) {
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
    }, {
      key: "has_state_for",
      value: function has_state_for(column_id) {
        var state;
        this.info("Get current filter state (".concat(column_id, ")"));
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
    }, {
      key: "set_search_value",
      value: function set_search_value(column_id, value) {
        this.info("Set search value (".concat(column_id, ")"));
        return this._set_search_value(column_id, value);
      }
    }, {
      key: "run_filter",
      value: function run_filter(column_id, value) {
        this.info("Run filter (".concat(column_id, ")"));
        return this._run_filter(column_id, value);
      }
    }, {
      key: "reset_filters",
      value: function reset_filters(event) {
        var _column_id, filter, ref;
        ref = this.loaded_filters;
        for (_column_id in ref) {
          filter = ref[_column_id];
          filter.reset(event);
        }
        return this._draw_instance();
      }
    }, {
      key: "apply_default_filters",
      value: function apply_default_filters(event) {
        this.info('Apply default filters');
        return this._apply_filters(event);
      }

      //##################
      // PRIVATE METHODS #
      //##################
    }, {
      key: "_load_filters",
      value: function _load_filters() {
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
    }, {
      key: "_load_filter",
      value: function _load_filter(filter) {
        switch (filter.filter_type) {
          case 'text':
            return _text_filter["default"].build(this, this.logger, filter);
          case 'range_number':
            return _range_number_filter["default"].build(this, this.logger, filter);
          case 'range_date':
            return _range_date_filter["default"].build(this, this.logger, filter);
          case 'select':
            return _select_filter["default"].build(this, this.logger, filter);
          case 'multi_select':
            return _select_multi_filter["default"].build(this, this.logger, filter);
          default:
            this.error("Unknown filter type: ".concat(filter.filter_type));
            this.dump(filter);
            return null;
        }
      }
    }, {
      key: "_bind_datatable",
      value: function _bind_datatable() {
        var _this2 = this;
        var ondraw_callback, onsave_callback;
        this.info("Bind datatable");
        // set onsave callback
        onsave_callback = function onsave_callback(event, settings, data) {
          _this2._dt_on_save(event, settings, data);
        };
        // This event allows modification of the state saving object prior to actually doing the save,
        // including addition or other state properties (for plug-ins) or modification of a DataTables core property.
        // See: https://datatables.net/reference/event/stateSaveParams
        $(this.datatable.dt_id).off('stateSaveParams.dt').on('stateSaveParams.dt', onsave_callback);
        // set ondraw callback
        ondraw_callback = function ondraw_callback(event, settings, json) {
          _this2._dt_on_draw(event, settings, json);
        };
        $(this.datatable.dt_id).off('xhr.dt').on('xhr.dt', ondraw_callback);
        // we need to make sure that the yadcf state will be saved after page reload
        return this._save_state();
      }
    }, {
      key: "_apply_filters",
      value: function _apply_filters(event) {
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
    }, {
      key: "_dt_on_save",
      value: function _dt_on_save(event, settings, data) {
        var state;
        this.info("Datatable has been saved");
        state = this._get_state();
        if (state != null) {
          return data['dt_filters_state'] = state['dt_filters_state'];
        }
      }
    }, {
      key: "_dt_on_draw",
      value: function _dt_on_draw(event, settings, json) {
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
          if (json["dt_filter_data_".concat(column_id)] != null) {
            this.info("Loading data for ".concat(filter.name()));
            filter.dropdown_data = json["dt_filter_data_".concat(column_id)];
            results.push(filter.reload(event));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    }, {
      key: "_instance_present_for",
      value: function _instance_present_for(method) {
        if (this.instance == null) {
          this.error("".concat(method, ": Datatable instance is null"));
          return false;
        } else {
          return true;
        }
      }
    }, {
      key: "_draw_instance",
      value: function _draw_instance() {
        return this.instance.draw();
      }
    }, {
      key: "_run_filter",
      value: function _run_filter(column_id, value) {
        return this.instance.columns(column_id).search(value).draw(false);
      }
    }, {
      key: "_set_search_value",
      value: function _set_search_value(column_id, value) {
        return this.instance.context[0].aoPreSearchCols[column_id].sSearch = value;
      }
    }, {
      key: "_get_state",
      value: function _get_state() {
        return this.instance.state.loaded();
      }
    }, {
      key: "_set_state",
      value: function _set_state(state) {
        return this.instance.context[0].oLoadedState = state;
      }
    }, {
      key: "_save_state",
      value: function _save_state() {
        return this.instance.state.save();
      }
    }]);
    return DatatableFilter;
  }(_extendable["default"]);
  ;
  DatatableFilter.extend(_with_logger["default"].class_methods);
  DatatableFilter.include(_with_logger["default"].instance_methods);
  return DatatableFilter;
}.call(void 0);
var _default = exports["default"] = DatatableFilter;

/***/ }),

/***/ "./src/model/filters/base_filter.coffee":
/*!**********************************************!*\
  !*** ./src/model/filters/base_filter.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _extendable = _interopRequireDefault(__webpack_require__(/*! ../../extendable.coffee */ "./src/extendable.coffee"));
var _with_logger = _interopRequireDefault(__webpack_require__(/*! ../../modules/with_logger.coffee */ "./src/modules/with_logger.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var BaseFilter;
BaseFilter = function () {
  var BaseFilter = /*#__PURE__*/function (_Extendable) {
    _inherits(BaseFilter, _Extendable);
    function BaseFilter(datatable_filter1, logger1, options1) {
      var _this;
      _classCallCheck(this, BaseFilter);
      _this = _callSuper(this, BaseFilter, arguments);
      _this.datatable_filter = datatable_filter1;
      _this.logger = logger1;
      _this.options = options1;
      // Get datatable JS class
      _this.dt_class = _this.datatable_filter.dt_class;
      // fetch mandatory data
      _this.column_id = _this.options.column_id;
      _this.filter_default_label = _this.options.filter_default_label;
      // fetch optional data
      _this.filter_css_class = _this.options.filter_css_class || '';
      _this.filter_reset_button = _this.options.filter_reset_button === false ? false : true;
      _this.filter_reset_button_text = _this.options.filter_reset_button_text || 'x';
      // build ids
      _this.container_id = "#".concat(_this.options.filter_container_id);
      return _this;
    }

    //#################
    // PUBLIC METHODS #
    //#################

    // loader
    _createClass(BaseFilter, [{
      key: "bind",
      value: function bind() {
        this.logger.info("* Loading '".concat(this.name(), "'"));
        if (this.options.debug === true) {
          this._debug_log();
        }
        this.create_html();
        this.bind_inputs();
        return this.restore_state();
      }
    }, {
      key: "name",
      value: function name() {
        return "".concat(this.dt_class, "/").concat(this.constructor.name, "#").concat(this.column_id);
      }

      // implementation (must be overriden)
    }, {
      key: "create_html",
      value: function create_html() {
        return this.logger.info("".concat(this.name(), " : create_html"));
      }
    }, {
      key: "bind_inputs",
      value: function bind_inputs() {
        return this.logger.info("".concat(this.name(), " : bind_inputs"));
      }
    }, {
      key: "restore_state",
      value: function restore_state() {
        return this.logger.info("".concat(this.name(), " : restore_state"));
      }
    }, {
      key: "set",
      value: function set(value) {
        this.logger.info("".concat(this.name(), " : set"));
        return this.logger.dump(value);
      }
    }, {
      key: "reset",
      value: function reset(event) {
        this.logger.info("".concat(this.name(), " : reset"));
        return this.logger.dump(event);
      }
    }, {
      key: "reload",
      value: function reload(event) {
        this.logger.info("".concat(this.name(), " : reload"));
        return this.logger.dump(event);
      }
    }, {
      key: "prevent_default_on_enter",
      value: function prevent_default_on_enter(event) {
        if (event.keyCode === 13) {
          if (event.preventDefault) {
            event.preventDefault();
          } else {
            event.returnValue = false;
          }
        }
      }
    }, {
      key: "stop_propagation",
      value: function stop_propagation(event) {
        if (event.stopPropagation != null) {
          event.stopPropagation();
        } else {
          event.cancelBubble = true;
        }
      }

      //##################
      // PRIVATE METHODS #
      //##################
    }, {
      key: "_html_wrapper",
      value: function _html_wrapper() {
        var options;
        options = {
          id: this.wrapper_id,
          "class": 'yadcf-filter-wrapper'
        };
        return $('<div/>', options);
      }
    }, {
      key: "_html_reset_button",
      value: function _html_reset_button() {
        var _this2 = this;
        var callback, options;
        callback = function callback(event) {
          return _this2.stop_propagation(event);
        };
        options = {
          type: 'button',
          id: this.reset_id,
          text: this.filter_reset_button_text,
          "class": 'yadcf-filter-reset-button'
        };
        return $('<button/>', options).on('mousedown', callback);
      }
    }, {
      key: "_reset_state",
      value: function _reset_state(column_id) {
        return this._save_state(column_id, void 0);
      }
    }, {
      key: "_save_state",
      value: function _save_state(column_id, data) {
        return this.datatable_filter.save_state(column_id, data);
      }
    }, {
      key: "_set_search_value",
      value: function _set_search_value(column_id, value) {
        return this.datatable_filter.set_search_value(column_id, value);
      }
    }, {
      key: "_run_filter",
      value: function _run_filter(column_id, value) {
        return this.datatable_filter.run_filter(column_id, value);
      }
    }, {
      key: "_debug_log",
      value: function _debug_log() {
        this.logger.info("".concat(this.name(), " : _debug_log"));
        this.logger.dump(this.options);
        return this.logger.info("column_id: ".concat(this.column_id));
      }
    }, {
      key: "_skip_key_codes",
      value: function _skip_key_codes() {
        return [37, 38, 39, 40];
      }
    }, {
      key: "_with_delay",
      value: function _with_delay(callback, ms) {
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
    }], [{
      key: "build",
      value: function build(datatable_filter, logger, options) {
        var object;
        object = new this(datatable_filter, logger, options);
        object.bind();
        return object;
      }
    }]);
    return BaseFilter;
  }(_extendable["default"]);
  ;
  BaseFilter.extend(_with_logger["default"].class_methods);
  BaseFilter.include(_with_logger["default"].instance_methods);
  return BaseFilter;
}.call(void 0);
var _default = exports["default"] = BaseFilter;

/***/ }),

/***/ "./src/model/filters/range_base.coffee":
/*!*********************************************!*\
  !*** ./src/model/filters/range_base.coffee ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _base_filter = _interopRequireDefault(__webpack_require__(/*! ./base_filter.coffee */ "./src/model/filters/base_filter.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var RangeBase;
RangeBase = /*#__PURE__*/function (_BaseFilter) {
  _inherits(RangeBase, _BaseFilter);
  function RangeBase(datatable_filter, logger, options1) {
    var _this;
    _classCallCheck(this, RangeBase);
    _this = _callSuper(this, RangeBase, arguments);
    _this.datatable_filter = datatable_filter;
    _this.logger = logger;
    _this.options = options1;
    // fetch mandatory data
    _this.from_placeholder = _this.filter_default_label[0];
    _this.to_placeholder = _this.filter_default_label[1];
    // fetch optional data
    _this.range_delimiter = _this.options.filter_range_delimiter || '-yadcf_delim-';
    // build ids
    _this.wrapper_outer_id = "yadcf-filter-wrapper-".concat(_this.datatable_filter.dt_id, "-").concat(_this.column_id);
    _this.wrapper_inner_id = "yadcf-filter-wrapper-inner-".concat(_this.datatable_filter.dt_id, "-").concat(_this.column_id);
    _this.from_id = "yadcf-filter-".concat(_this.datatable_filter.dt_id, "-from-").concat(_this.range_type, "-").concat(_this.column_id);
    _this.to_id = "yadcf-filter-".concat(_this.datatable_filter.dt_id, "-to-").concat(_this.range_type, "-").concat(_this.column_id);
    _this.reset_id = "yadcf-filter-".concat(_this.datatable_filter.dt_id, "-reset-").concat(_this.range_type, "-").concat(_this.column_id);
    return _this;
  }

  //#################
  // PUBLIC METHODS #
  //#################
  _createClass(RangeBase, [{
    key: "create_html",
    value: function create_html() {
      _get(_getPrototypeOf(RangeBase.prototype), "create_html", this).call(this);
      // add outer wrapper to hold both filter and reset button
      $("".concat(this.container_id)).append(this._html_wrapper_outer());
      // add inner wrapper to hold both filter and reset button
      $("".concat(this.container_id, " div.yadcf-filter-wrapper")).append(this._html_wrapper_inner());
      // add input fields
      $("".concat(this.container_id, " div.yadcf-filter-wrapper-inner")).append(this._html_range_start());
      $("".concat(this.container_id, " div.yadcf-filter-wrapper-inner")).append(this._html_range_separator());
      $("".concat(this.container_id, " div.yadcf-filter-wrapper-inner")).append(this._html_range_end());
      // add reset button
      if (this.filter_reset_button) {
        return $("".concat(this.container_id, " div.yadcf-filter-wrapper")).append(this._html_reset_button());
      }
    }
  }, {
    key: "bind_inputs",
    value: function bind_inputs() {
      var _this2 = this;
      var delay, onclick_callback, onkeyup_callback;
      _get(_getPrototypeOf(RangeBase.prototype), "bind_inputs", this).call(this);
      // bind input fields
      delay = this.options.filter_delay || 0;
      onkeyup_callback = function onkeyup_callback(event) {
        _this2._range_change(event);
      };
      $("#".concat(this.from_id)).on('keyup', this._with_delay(onkeyup_callback, delay));
      $("#".concat(this.to_id)).on('keyup', this._with_delay(onkeyup_callback, delay));
      // bind reset button
      onclick_callback = function onclick_callback(event) {
        _this2._range_clear(event);
      };
      return $("#".concat(this.reset_id)).on('click', onclick_callback);
    }
  }, {
    key: "restore_state",
    value: function restore_state() {
      var restored_from, restored_to, saved_state;
      _get(_getPrototypeOf(RangeBase.prototype), "restore_state", this).call(this);
      saved_state = this.datatable_filter.has_state_for(this.column_id);
      if (saved_state != null) {
        restored_from = saved_state.from;
        restored_to = saved_state.to;
        if (restored_from !== '') {
          $("#".concat(this.from_id)).val(restored_from);
          $("#".concat(this.from_id)).addClass('inuse');
        }
        if (restored_to !== '') {
          $("#".concat(this.to_id)).val(restored_to);
          return $("#".concat(this.to_id)).addClass('inuse');
        }
      }
    }
  }, {
    key: "reset",
    value: function reset(event) {
      _get(_getPrototypeOf(RangeBase.prototype), "reset", this).call(this, event);
      $("#".concat(this.from_id)).val('');
      $("#".concat(this.from_id)).removeClass('inuse');
      $("#".concat(this.to_id)).val('');
      $("#".concat(this.to_id)).removeClass('inuse');
      // set search value (datatable reload will be triggered later)
      this._set_search_value(this.column_id, '');
      // save current value
      return this._reset_state(this.column_id);
    }
  }, {
    key: "current_value",
    value: function current_value() {
      return {
        from: $("#".concat(this.from_id)).val(),
        to: $("#".concat(this.to_id)).val()
      };
    }

    //##################
    // PRIVATE METHODS #
    //##################
  }, {
    key: "_html_wrapper_outer",
    value: function _html_wrapper_outer() {
      var _this3 = this;
      var callback, options;
      callback = function callback(event) {
        return _this3.stop_propagation(event);
      };
      options = {
        id: this.wrapper_outer_id,
        "class": 'yadcf-filter-wrapper'
      };
      return $('<div/>', options).on('click', callback).on('mousedown', callback);
    }
  }, {
    key: "_html_wrapper_inner",
    value: function _html_wrapper_inner() {
      var options;
      options = {
        id: this.wrapper_inner_id,
        "class": 'yadcf-filter-wrapper-inner'
      };
      return $('<div/>', options);
    }
  }, {
    key: "_html_range_start",
    value: function _html_range_start() {
      var _this4 = this;
      var callback, options;
      callback = function callback(event) {
        return _this4.prevent_default_on_enter(event);
      };
      options = {
        id: this.from_id,
        "class": "yadcf-filter-range yadcf-filter-range-".concat(this.range_type, " yadcf-filter-range-start"),
        placeholder: this.from_placeholder
      };
      return $('<input/>', options).on('keydown', callback);
    }
  }, {
    key: "_html_range_end",
    value: function _html_range_end() {
      var _this5 = this;
      var callback, options;
      callback = function callback(event) {
        return _this5.prevent_default_on_enter(event);
      };
      options = {
        id: this.to_id,
        "class": "yadcf-filter-range yadcf-filter-range-".concat(this.range_type, " yadcf-filter-range-end"),
        placeholder: this.to_placeholder
      };
      return $('<input/>', options).on('keydown', callback);
    }
  }, {
    key: "_html_range_separator",
    value: function _html_range_separator() {
      var options;
      options = {
        "class": "yadcf-filter-range-".concat(this.range_type, "-seperator")
      };
      return $('<span/>', options);
    }
  }, {
    key: "_range_change",
    value: function _range_change(event) {
      this.logger.info("".concat(this.name(), " : _range_change"));
      return this.logger.dump(event);
    }
  }, {
    key: "_range_clear",
    value: function _range_clear(event) {
      var current_value;
      this.logger.info("".concat(this.name(), " : _range_clear"));
      this.logger.dump(event);
      current_value = this.current_value();
      if (current_value.from === '' && current_value.to === '') {
        return;
      }
      $("#".concat(this.from_id)).val('');
      $("#".concat(this.from_id)).removeClass('inuse');
      $("#".concat(this.to_id)).val('');
      $("#".concat(this.to_id)).removeClass('inuse');
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, this.range_delimiter);
      // save current value
      return this._save_state(this.column_id, {
        from: '',
        to: ''
      });
    }
  }, {
    key: "_debug_log",
    value: function _debug_log() {
      _get(_getPrototypeOf(RangeBase.prototype), "_debug_log", this).call(this);
      this.logger.info("container_id: ".concat(this.container_id));
      this.logger.info("wrapper_outer_id: ".concat(this.wrapper_outer_id));
      this.logger.info("wrapper_inner_id: ".concat(this.wrapper_inner_id));
      this.logger.info("from_id: ".concat(this.from_id));
      this.logger.info("to_id: ".concat(this.to_id));
      this.logger.info("from_placeholder: ".concat(this.from_placeholder));
      return this.logger.info("to_placeholder: ".concat(this.to_placeholder));
    }
  }]);
  return RangeBase;
}(_base_filter["default"]);
var _default = exports["default"] = RangeBase;

/***/ }),

/***/ "./src/model/filters/range_date_filter.coffee":
/*!****************************************************!*\
  !*** ./src/model/filters/range_date_filter.coffee ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _range_base = _interopRequireDefault(__webpack_require__(/*! ./range_base.coffee */ "./src/model/filters/range_base.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var RangeDateFilter,
  boundMethodCheck = function boundMethodCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new Error('Bound instance method accessed before binding');
    }
  };
RangeDateFilter = /*#__PURE__*/function (_RangeBase) {
  _inherits(RangeDateFilter, _RangeBase);
  function RangeDateFilter(datatable_filter, logger, options) {
    var _this;
    _classCallCheck(this, RangeDateFilter);
    _this = _callSuper(this, RangeDateFilter, arguments);
    //##################
    // PRIVATE METHODS #
    //##################
    _this._date_select = _this._date_select.bind(_assertThisInitialized(_this));
    _this.datatable_filter = datatable_filter;
    _this.logger = logger;
    _this.options = options;
    // customize class
    _this.range_type = 'date';
    // fetch datepicker data
    _this.filter_plugin = _this.options.filter_plugin;
    _this.filter_plugin_options = $.extend({}, {
      onSelect: _this._date_select
    }, _this.options.filter_plugin_options);
    return _this;
  }
  _createClass(RangeDateFilter, [{
    key: "bind_inputs",
    value: function bind_inputs() {
      _get(_getPrototypeOf(RangeDateFilter.prototype), "bind_inputs", this).call(this);
      // load datepicker with callbacks
      $("#".concat(this.from_id)).datepicker($.extend(this.filter_plugin_options, {
        onClose: function onClose(selected_date) {
          $("#".concat(this.to_id)).datepicker('option', 'minDate', selected_date);
        }
      }));
      return $("#".concat(this.to_id)).datepicker($.extend(this.filter_plugin_options, {
        onClose: function onClose(selected_date) {
          $("#".concat(this.from_id)).datepicker('option', 'maxDate', selected_date);
        }
      }));
    }
  }, {
    key: "_date_select",
    value: function _date_select(_date, _event) {
      var current_value, from, search_value, to;
      boundMethodCheck(this, RangeDateFilter);
      this.logger.info("".concat(this.name(), " : _date_select"));
      current_value = this.current_value();
      from = current_value.from;
      to = current_value.to;
      search_value = "".concat(from).concat(this.range_delimiter).concat(to);
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, search_value);
      // save current value
      return this._save_state(this.column_id, {
        from: from,
        to: to
      });
    }
  }, {
    key: "_range_change",
    value: function _range_change(event) {
      var current_value, date_from, date_to, from, search_value, to;
      _get(_getPrototypeOf(RangeDateFilter.prototype), "_range_change", this).call(this, event);
      if (this._skip_key_codes().includes(event.keyCode)) {
        return;
      }
      current_value = this.current_value();
      date_from = this._date_or_empty_string(current_value.from);
      date_to = this._date_or_empty_string(current_value.to);
      if (date_from instanceof Date) {
        $("#".concat(this.from_id)).addClass('inuse');
        from = current_value.from;
      } else {
        $("#".concat(this.from_id)).removeClass('inuse');
        from = '';
      }
      if (date_to instanceof Date) {
        $("#".concat(this.to_id)).addClass('inuse');
        to = current_value.to;
      } else {
        $("#".concat(this.to_id)).removeClass('inuse');
        to = '';
      }
      search_value = "".concat(from).concat(this.range_delimiter).concat(to);
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, search_value);
      // save current value
      return this._save_state(this.column_id, {
        from: from,
        to: to
      });
    }
  }, {
    key: "_date_or_empty_string",
    value: function _date_or_empty_string(value) {
      var date_format, e;
      if (value === '') {
        return '';
      }
      date_format = this.options.filter_plugin_options.dateFormat;
      try {
        return $.datepicker.parseDate(date_format, value);
      } catch (error) {
        e = error;
        this.logger.error("error while parsing date : ".concat(e));
        return '';
      }
    }
  }]);
  return RangeDateFilter;
}(_range_base["default"]);
var _default = exports["default"] = RangeDateFilter;

/***/ }),

/***/ "./src/model/filters/range_number_filter.coffee":
/*!******************************************************!*\
  !*** ./src/model/filters/range_number_filter.coffee ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _range_base = _interopRequireDefault(__webpack_require__(/*! ./range_base.coffee */ "./src/model/filters/range_base.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var RangeNumberFilter;
RangeNumberFilter = /*#__PURE__*/function (_RangeBase) {
  _inherits(RangeNumberFilter, _RangeBase);
  function RangeNumberFilter(datatable_filter, logger, options) {
    var _this;
    _classCallCheck(this, RangeNumberFilter);
    _this = _callSuper(this, RangeNumberFilter, arguments);
    _this.datatable_filter = datatable_filter;
    _this.logger = logger;
    _this.options = options;
    // customize class
    _this.range_type = 'number';
    return _this;
  }

  //##################
  // PRIVATE METHODS #
  //##################
  _createClass(RangeNumberFilter, [{
    key: "_range_change",
    value: function _range_change(event) {
      var current_value, max, min, search_value;
      _get(_getPrototypeOf(RangeNumberFilter.prototype), "_range_change", this).call(this, event);
      if (this._skip_key_codes().includes(event.keyCode)) {
        return;
      }
      current_value = this.current_value();
      min = this._int_or_empty_string(current_value.from);
      max = this._int_or_empty_string(current_value.to);
      if (min !== '') {
        $("#".concat(this.from_id)).addClass('inuse');
      } else {
        $("#".concat(this.from_id)).removeClass('inuse');
      }
      if (max !== '') {
        $("#".concat(this.to_id)).addClass('inuse');
      } else {
        $("#".concat(this.to_id)).removeClass('inuse');
      }
      search_value = "".concat(min).concat(this.range_delimiter).concat(max);
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, search_value);
      // save current value
      return this._save_state(this.column_id, {
        from: min,
        to: max
      });
    }
  }, {
    key: "_int_or_empty_string",
    value: function _int_or_empty_string(value) {
      value = value !== '' ? +value : value;
      if (isNaN(value)) {
        value = '';
      }
      return value;
    }
  }]);
  return RangeNumberFilter;
}(_range_base["default"]);
var _default = exports["default"] = RangeNumberFilter;

/***/ }),

/***/ "./src/model/filters/select_base.coffee":
/*!**********************************************!*\
  !*** ./src/model/filters/select_base.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _base_filter = _interopRequireDefault(__webpack_require__(/*! ./base_filter.coffee */ "./src/model/filters/base_filter.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var SelectBase;
SelectBase = function () {
  var SelectBase = /*#__PURE__*/function (_BaseFilter) {
    _inherits(SelectBase, _BaseFilter);
    function SelectBase(datatable_filter, logger, options1) {
      var _this;
      _classCallCheck(this, SelectBase);
      _this = _callSuper(this, SelectBase, arguments);
      _this.datatable_filter = datatable_filter;
      _this.logger = logger;
      _this.options = options1;
      // fetch select data
      _this.filter_plugin = _this.options.filter_plugin;
      _this.filter_plugin_options = _this.options.filter_plugin_options;
      // build ids
      _this.wrapper_id = "yadcf-filter-wrapper-".concat(_this.datatable_filter.dt_id, "-").concat(_this.column_id);
      _this.select_id = "yadcf-filter-".concat(_this.datatable_filter.dt_id, "-").concat(_this.column_id);
      _this.reset_id = "yadcf-filter-".concat(_this.datatable_filter.dt_id, "-reset-").concat(_this.column_id);
      return _this;
    }

    //#################
    // PUBLIC METHODS #
    //#################
    _createClass(SelectBase, [{
      key: "create_html",
      value: function create_html() {
        _get(_getPrototypeOf(SelectBase.prototype), "create_html", this).call(this);
        // add a wrapper to hold both filter and reset button
        $("".concat(this.container_id)).append(this._html_wrapper());
        // add input fields
        $("".concat(this.container_id, " div.yadcf-filter-wrapper")).append(this._html_input_field());
        // add reset button
        if (this.filter_reset_button) {
          return $("".concat(this.container_id, " div.yadcf-filter-wrapper")).append(this._html_reset_button());
        }
      }
    }, {
      key: "bind_inputs",
      value: function bind_inputs() {
        var _this2 = this;
        var onchange_callback, onclick_callback;
        _get(_getPrototypeOf(SelectBase.prototype), "bind_inputs", this).call(this);
        // bind select field
        onchange_callback = function onchange_callback(event) {
          _this2._select_change(event);
        };
        $("#".concat(this.select_id)).on('change', onchange_callback);
        // bind reset button
        onclick_callback = function onclick_callback(event) {
          _this2._select_clear(event);
        };
        $("#".concat(this.reset_id)).on('click', onclick_callback);
        return this._initialize_select_plugin();
      }
    }, {
      key: "restore_state",
      value: function restore_state() {
        var restored_value, saved_state;
        _get(_getPrototypeOf(SelectBase.prototype), "restore_state", this).call(this);
        saved_state = this.datatable_filter.has_state_for(this.column_id);
        if (saved_state != null) {
          restored_value = saved_state.value;
          $("#".concat(this.select_id)).val(restored_value);
          if (restored_value !== '-1') {
            return $("#".concat(this.select_id)).addClass('inuse');
          }
        }
      }
    }, {
      key: "reset",
      value: function reset(event) {
        _get(_getPrototypeOf(SelectBase.prototype), "reset", this).call(this, event);
        $("#".concat(this.select_id)).val('');
        $("#".concat(this.select_id)).removeClass('inuse');
        // set search value (datatable reload will be triggered later)
        this._set_search_value(this.column_id, '');
        // save current value
        return this._reset_state(this.column_id);
      }
    }, {
      key: "reload",
      value: function reload(event) {
        _get(_getPrototypeOf(SelectBase.prototype), "reload", this).call(this, event);
        $("#".concat(this.select_id)).empty();
        $("#".concat(this.select_id)).append(this._select_options());
        return this.restore_state();
      }

      //##################
      // PRIVATE METHODS #
      //##################
    }, {
      key: "_html_input_field",
      value: function _html_input_field() {
        var _this3 = this;
        var callback1, callback2, options;
        options = {
          id: this.select_id,
          "class": "yadcf-filter ".concat(this.filter_css_class)
        };
        callback1 = function callback1(event) {
          return _this3.stop_propagation(event);
        };
        callback2 = function callback2(event) {
          return _this3.prevent_default_on_enter(event);
        };
        return $('<select/>', options).on('click', callback1).on('keydown', callback2).on('mousedown', callback1);
      }
    }, {
      key: "_select_change",
      value: function _select_change(event) {
        this.logger.info("".concat(this.name(), " : _select_change"));
        return this.logger.dump(event);
      }
    }, {
      key: "_select_clear",
      value: function _select_clear(event) {
        var current_value;
        this.logger.info("".concat(this.name(), " : _select_clear"));
        this.logger.dump(event);
        current_value = this.current_value();
        if (this._empty_value(current_value)) {
          return;
        }
        $("#".concat(this.select_id)).val('-1');
        $("#".concat(this.select_id)).removeClass('inuse');
        // run filter (triggers a datatable reload)
        this._run_filter(this.column_id, '');
        // save current value
        return this._save_state(this.column_id, {
          value: '-1'
        });
      }
    }, {
      key: "_initialize_select_plugin",
      value: function _initialize_select_plugin() {
        var _this4 = this;
        var callback, select2;
        this.logger.info("".concat(this.name(), " : _initialize_select_plugin"));
        switch (this.filter_plugin) {
          case 'select2':
            $("#".concat(this.select_id)).select2(this.filter_plugin_options);
            select2 = $("#".concat(this.select_id)).next();
            if (select2 != null && select2.hasClass('select2-container')) {
              callback = function callback(event) {
                return _this4.stop_propagation(event);
              };
              return select2.on('click', callback).on('mousedown', callback);
            }
            break;
          default:
            return this.logger.error("Unknown select type: ".concat(this.filter_plugin));
        }
      }
    }, {
      key: "_debug_log",
      value: function _debug_log() {
        _get(_getPrototypeOf(SelectBase.prototype), "_debug_log", this).call(this);
        this.logger.info("container_id: ".concat(this.container_id));
        this.logger.info("wrapper_id: ".concat(this.wrapper_id));
        this.logger.info("select_id: ".concat(this.select_id));
        return this.logger.info("reset_id: ".concat(this.reset_id));
      }
    }]);
    return SelectBase;
  }(_base_filter["default"]);
  ;
  SelectBase.prototype.dropdown_data = null;
  return SelectBase;
}.call(void 0);
var _default = exports["default"] = SelectBase;

/***/ }),

/***/ "./src/model/filters/select_filter.coffee":
/*!************************************************!*\
  !*** ./src/model/filters/select_filter.coffee ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _select_base = _interopRequireDefault(__webpack_require__(/*! ./select_base.coffee */ "./src/model/filters/select_base.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var SelectFilter;
SelectFilter = /*#__PURE__*/function (_SelectBase) {
  _inherits(SelectFilter, _SelectBase);
  function SelectFilter() {
    _classCallCheck(this, SelectFilter);
    return _callSuper(this, SelectFilter, arguments);
  }
  _createClass(SelectFilter, [{
    key: "current_value",
    value:
    //#################
    // PUBLIC METHODS #
    //#################
    function current_value() {
      return $.trim($("#".concat(this.select_id)).find('option:selected').val());
    }
  }, {
    key: "set",
    value: function set(value) {
      _get(_getPrototypeOf(SelectFilter.prototype), "set", this).call(this, value);
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
  }, {
    key: "_select_options",
    value: function _select_options() {
      var data, i, len, options, ref;
      options = "<option value=\"-1\">".concat(this.filter_default_label, "</option>");
      if (this.dropdown_data != null) {
        ref = this.dropdown_data;
        for (i = 0, len = ref.length; i < len; i++) {
          data = ref[i];
          options += "<option value=\"".concat(data.value, "\" >").concat(data.label, "</option>");
        }
      }
      return options;
    }
  }, {
    key: "_empty_value",
    value: function _empty_value(value) {
      return value === '-1';
    }
  }, {
    key: "_select_change",
    value: function _select_change(event) {
      var current_value, search_value;
      _get(_getPrototypeOf(SelectFilter.prototype), "_select_change", this).call(this, event);
      current_value = this.current_value();
      if (this._empty_value(current_value)) {
        search_value = '';
        $("#".concat(this.select_id)).removeClass('inuse');
      } else {
        search_value = current_value;
        $("#".concat(this.select_id)).addClass('inuse');
      }
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, search_value);
      // save current value
      return this._save_state(this.column_id, {
        value: current_value
      });
    }
  }, {
    key: "_html_input_field",
    value: function _html_input_field() {
      var input;
      input = _get(_getPrototypeOf(SelectFilter.prototype), "_html_input_field", this).call(this);
      return $(input).attr('data-placeholder', this.filter_default_label);
    }
  }]);
  return SelectFilter;
}(_select_base["default"]);
var _default = exports["default"] = SelectFilter;

/***/ }),

/***/ "./src/model/filters/select_multi_filter.coffee":
/*!******************************************************!*\
  !*** ./src/model/filters/select_multi_filter.coffee ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _select_base = _interopRequireDefault(__webpack_require__(/*! ./select_base.coffee */ "./src/model/filters/select_base.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var SelectMultiFilter;
SelectMultiFilter = /*#__PURE__*/function (_SelectBase) {
  _inherits(SelectMultiFilter, _SelectBase);
  function SelectMultiFilter() {
    _classCallCheck(this, SelectMultiFilter);
    return _callSuper(this, SelectMultiFilter, arguments);
  }
  _createClass(SelectMultiFilter, [{
    key: "current_value",
    value:
    //#################
    // PUBLIC METHODS #
    //#################
    function current_value() {
      return $("#".concat(this.select_id)).val();
    }
  }, {
    key: "set",
    value: function set(value) {
      var search_value;
      _get(_getPrototypeOf(SelectMultiFilter.prototype), "set", this).call(this, value);
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
  }, {
    key: "_select_options",
    value: function _select_options() {
      var data, i, len, options, ref;
      options = '';
      if (this.dropdown_data != null) {
        ref = this.dropdown_data;
        for (i = 0, len = ref.length; i < len; i++) {
          data = ref[i];
          options += "<option value=\"".concat(data.value, "\" >").concat(data.label, "</option>");
        }
      }
      return options;
    }
  }, {
    key: "_empty_value",
    value: function _empty_value(value) {
      return value.length === 0;
    }
  }, {
    key: "_select_change",
    value: function _select_change(event) {
      var current_value, search_value;
      _get(_getPrototypeOf(SelectMultiFilter.prototype), "_select_change", this).call(this, event);
      current_value = this.current_value();
      if (this._empty_value(current_value)) {
        search_value = '';
        $("#".concat(this.select_id)).removeClass('inuse');
      } else {
        search_value = this._cast_value(current_value);
        $("#".concat(this.select_id)).addClass('inuse');
      }
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, search_value);
      // save current value
      return this._save_state(this.column_id, {
        value: current_value
      });
    }
  }, {
    key: "_html_input_field",
    value: function _html_input_field() {
      var input;
      input = _get(_getPrototypeOf(SelectMultiFilter.prototype), "_html_input_field", this).call(this);
      return $(input).attr('multiple', true).attr('data-placeholder', this.filter_default_label);
    }
  }, {
    key: "_cast_value",
    value: function _cast_value(value) {
      return value.join('|');
    }
  }]);
  return SelectMultiFilter;
}(_select_base["default"]);
var _default = exports["default"] = SelectMultiFilter;

/***/ }),

/***/ "./src/model/filters/text_filter.coffee":
/*!**********************************************!*\
  !*** ./src/model/filters/text_filter.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _base_filter = _interopRequireDefault(__webpack_require__(/*! ./base_filter.coffee */ "./src/model/filters/base_filter.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var TextFilter;
TextFilter = /*#__PURE__*/function (_BaseFilter) {
  _inherits(TextFilter, _BaseFilter);
  function TextFilter(datatable_filter, logger, options1) {
    var _this;
    _classCallCheck(this, TextFilter);
    _this = _callSuper(this, TextFilter, arguments);
    _this.datatable_filter = datatable_filter;
    _this.logger = logger;
    _this.options = options1;
    // build ids
    _this.wrapper_id = "yadcf-filter-wrapper-".concat(_this.datatable_filter.dt_id, "-").concat(_this.column_id);
    _this.input_id = "yadcf-filter-".concat(_this.datatable_filter.dt_id, "-").concat(_this.column_id);
    _this.reset_id = "yadcf-filter-".concat(_this.datatable_filter.dt_id, "-reset-").concat(_this.column_id);
    return _this;
  }
  _createClass(TextFilter, [{
    key: "create_html",
    value: function create_html() {
      _get(_getPrototypeOf(TextFilter.prototype), "create_html", this).call(this);
      // add a wrapper to hold both filter and reset button
      $("".concat(this.container_id)).append(this._html_wrapper());
      // add input fields
      $("".concat(this.container_id, " div.yadcf-filter-wrapper")).append(this._html_input_field());
      // add reset button
      if (this.filter_reset_button) {
        return $("".concat(this.container_id, " div.yadcf-filter-wrapper")).append(this._html_reset_button());
      }
    }

    //#################
    // PUBLIC METHODS #
    //#################
  }, {
    key: "bind_inputs",
    value: function bind_inputs() {
      var _this2 = this;
      var delay, onclick_callback, onkeyup_callback;
      _get(_getPrototypeOf(TextFilter.prototype), "bind_inputs", this).call(this);
      // bind input field
      delay = this.options.filter_delay || 0;
      onkeyup_callback = function onkeyup_callback(event) {
        _this2._text_change(event);
      };
      $("#".concat(this.input_id)).on('keyup', this._with_delay(onkeyup_callback, delay));
      // bind reset button
      onclick_callback = function onclick_callback(event) {
        _this2._text_clear(event);
      };
      return $("#".concat(this.reset_id)).on('click', onclick_callback);
    }
  }, {
    key: "restore_state",
    value: function restore_state() {
      var restored_value, saved_state;
      _get(_getPrototypeOf(TextFilter.prototype), "restore_state", this).call(this);
      saved_state = this.datatable_filter.has_state_for(this.column_id);
      if (saved_state != null) {
        restored_value = saved_state.value;
        $("#".concat(this.input_id)).val(restored_value);
        if (restored_value !== '') {
          return $("#".concat(this.input_id)).addClass('inuse');
        }
      }
    }
  }, {
    key: "reset",
    value: function reset(event) {
      _get(_getPrototypeOf(TextFilter.prototype), "reset", this).call(this, event);
      $("#".concat(this.input_id)).val('');
      $("#".concat(this.input_id)).removeClass('inuse');
      // set search value (datatable reload will be triggered later)
      this._set_search_value(this.column_id, '');
      // save current value
      return this._reset_state(this.column_id);
    }
  }, {
    key: "set",
    value: function set(value) {
      _get(_getPrototypeOf(TextFilter.prototype), "set", this).call(this, value);
      $("#".concat(this.input_id)).val(value);
      if (value !== '') {
        $("#".concat(this.input_id)).addClass('inuse');
      }
      // set search value (datatable reload will be triggered later)
      this._set_search_value(this.column_id, value);
      // save current value
      return this._save_state(this.column_id, {
        value: value
      });
    }
  }, {
    key: "current_value",
    value: function current_value() {
      return $.trim($("#".concat(this.input_id)).val());
    }

    //##################
    // PRIVATE METHODS #
    //##################
  }, {
    key: "_html_input_field",
    value: function _html_input_field() {
      var _this3 = this;
      var callback1, callback2, options;
      callback1 = function callback1(event) {
        return _this3.prevent_default_on_enter(event);
      };
      callback2 = function callback2(event) {
        return _this3.stop_propagation(event);
      };
      options = {
        type: 'text',
        id: this.input_id,
        "class": "yadcf-filter ".concat(this.filter_css_class),
        placeholder: this.filter_default_label
      };
      return $('<input/>', options).on('keydown', callback1).on('mousedown', callback2);
    }
  }, {
    key: "_empty_value",
    value: function _empty_value(value) {
      return value === '';
    }
  }, {
    key: "_text_change",
    value: function _text_change(event) {
      var current_value;
      this.logger.info("".concat(this.name(), " : _text_change"));
      this.logger.dump(event);
      if (this._skip_key_codes().includes(event.keyCode)) {
        return;
      }
      current_value = this.current_value();
      if (this._empty_value(current_value)) {
        $("#".concat(this.input_id)).removeClass('inuse');
      } else {
        $("#".concat(this.input_id)).addClass('inuse');
      }
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, current_value);
      // save current value
      return this._save_state(this.column_id, {
        value: current_value
      });
    }
  }, {
    key: "_text_clear",
    value: function _text_clear(event) {
      var current_value;
      this.logger.info("".concat(this.name(), " : _text_clear"));
      this.logger.dump(event);
      current_value = this.current_value();
      if (this._empty_value(current_value)) {
        return;
      }
      $("#".concat(this.input_id)).val('');
      $("#".concat(this.input_id)).removeClass('inuse');
      // run filter (triggers a datatable reload)
      this._run_filter(this.column_id, '');
      // save current value
      return this._save_state(this.column_id, {
        value: ''
      });
    }
  }]);
  return TextFilter;
}(_base_filter["default"]);
var _default = exports["default"] = TextFilter;

/***/ }),

/***/ "./src/modules/loader.coffee":
/*!***********************************!*\
  !*** ./src/modules/loader.coffee ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _logger = _interopRequireDefault(__webpack_require__(/*! ../logger.coffee */ "./src/logger.coffee"));
var _datatable_filter = _interopRequireDefault(__webpack_require__(/*! ../model/datatable_filter.coffee */ "./src/model/datatable_filter.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var Loader,
  dig,
  hasProp = {}.hasOwnProperty;
dig = __webpack_require__(/*! object-dig */ "./node_modules/object-dig/dist/index.js");
Loader = {};
Loader.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  ajax: function ajax(url, data, callback) {
    return $.ajax({
      url: url,
      type: 'POST',
      data: data,
      statusCode: {
        422: function _() {
          alert("Votre session a expiré, veuillez vous reconnecter.");
          return window.location.href = "/users/login/";
        }
      },
      success: function success(data, _textStatus, _jqXHR) {
        return callback(data);
      }
    });
  },
  load_datatables: function load_datatables() {
    return $('[data-toggle=datatable]').each(function () {
      var data, loader;
      data = $(this).data();
      loader = Loader.class_methods.extract_options(data, 'dtfLoader').loader;
      return Loader.class_methods.load(loader);
    });
  },
  load: function load(loader) {
    var klass, logger;
    logger = new _logger["default"](loader.dtf_options);
    logger.log_delimiter();
    logger.info('* Class loader received data:');
    logger.info("id: '".concat(loader.dt_id, "'"));
    logger.info("class: '".concat(loader.dt_class, "'"));
    logger.info('dt_options:');
    logger.dump(loader.dt_options);
    logger.info('dtf_options:');
    logger.dump(loader.dtf_options);
    // Find datatable class
    klass = Loader.class_methods.constantize(loader.dt_class);
    if (klass == null) {
      logger.error("Datatable '".concat(loader.dt_class, "' not found"));
      return false;
    }
    if (klass.instance != null) {
      logger.info("* Trigger full reloading of datatable '".concat(loader.dt_class, "'"));
      klass.instance.destroy();
      delete klass.instance;
    }
    logger.info("* Loading datatable '".concat(loader.dt_class, "'"));
    klass.instance = Loader.class_methods.create(klass, loader.dt_class, loader.dt_id, loader.dt_options, loader.dtf_options, logger);
    logger.info("* Loaded datatable '".concat(loader.dt_class, "'"));
    logger.log_delimiter();
    return klass;
  },
  create: function create(klass, dt_class, dt_id, dt_options, dtf_options, logger) {
    var table;
    table = new klass(dt_class, dt_id, dt_options, dtf_options, logger);
    table.load();
    return table;
  },
  extract_options: function extract_options(data, prefix) {
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
  constantize: function constantize(string) {
    var constant, path;
    path = string.split('.');
    constant = dig.apply(void 0, [window].concat(_toConsumableArray(path)));
    return constant;
  },
  to_underscore: function to_underscore(string) {
    return string.split(/(?=[A-Z])/).join('_').toLowerCase();
  }
};
Loader.instance_methods = {
  //##########################
  // Public Instance methods #
  //##########################
  init_datatable: function init_datatable() {
    var _this = this;
    this.info('Create Datatable');
    // create filters just after dt initialization
    $(this.dt_id).on('preInit.dt', function (event, settings) {
      _this.info('preInit.dt callback was called, set filters if exist');
      _this.datatable = new $.fn.dataTable.Api(settings);
      return _this.init_filters(event);
    });
    $(this.dt_id).DataTable(this.dt_options);
    return this.info('Datatable created');
  },
  init_filters: function init_filters(event) {
    var form;
    if (this.filters.length === 0) {
      return;
    }
    this.info('Load Datatable filters');
    this.datatable_filter = new _datatable_filter["default"](this, this.filters, this.filters_applied, this.logger);
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
  loader_load_callbacks: function loader_load_callbacks() {
    this._loader_load_ajax_callbacks();
    this._loader_load_created_row_callbacks();
    this._loader_load_draw_callbacks();
    return this._loader_load_buttons_callbacks();
  },
  //###########################
  // Private Instance methods #
  //###########################
  _loader_load_ajax_callbacks: function _loader_load_ajax_callbacks() {
    var local_opts;
    this.info('Build datatable callbacks options : ajax');
    if (this.callbacks['ajax'].length > 0) {
      local_opts = this._build_ajax_option_with_callbacks();
    } else {
      local_opts = this._build_ajax_option_without_callbacks();
    }
    return this.dt_options = $.extend({}, this.dt_options, local_opts);
  },
  _loader_load_created_row_callbacks: function _loader_load_created_row_callbacks() {
    var callbacks, local_opts;
    this.info('Build datatable callbacks options : createdRow');
    // Keep a local reference for the createdRow option
    callbacks = this.callbacks['createdRow'];
    local_opts = {
      createdRow: function createdRow(row, data, index, cells) {
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
  _loader_load_draw_callbacks: function _loader_load_draw_callbacks() {
    var callbacks, local_opts;
    this.info('Build datatable callbacks options : drawCallback');
    // Keep a local reference for the drawCallback option
    callbacks = this.callbacks['drawCallback'];
    local_opts = {
      drawCallback: function drawCallback(settings) {
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
  _loader_load_buttons_callbacks: function _loader_load_buttons_callbacks() {
    var _this2 = this;
    this.info('Build datatable callbacks options : buttons');
    this.callbacks['buttons']['select_all'] = {
      success: [function (_data, _status, _xhr) {
        return _this2.datatable.ajax.reload();
      }]
    };
    return this.callbacks['buttons']['reset_selection'] = {
      success: [function (_data, _status, _xhr) {
        return _this2.datatable.ajax.reload();
      }]
    };
  },
  _select: function _select(obj, predicate) {
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
  _build_ajax_option_with_callbacks: function _build_ajax_option_with_callbacks() {
    var callbacks, url;
    // Keep a local reference for the ajax option
    url = this.dt_options['source'];
    callbacks = this.callbacks['ajax'];
    return {
      ajax: function ajax(data, callback, _settings) {
        var c, i, len;
        for (i = 0, len = callbacks.length; i < len; i++) {
          c = callbacks[i];
          data = $.extend({}, data, c(data));
        }
        return Loader.class_methods.ajax(url, data, callback);
      }
    };
  },
  _build_ajax_option_without_callbacks: function _build_ajax_option_without_callbacks() {
    var url;
    url = this.dt_options['source'];
    return {
      ajax: function ajax(data, callback, _settings) {
        return Loader.class_methods.ajax(url, data, callback);
      }
    };
  }
};
var _default = exports["default"] = Loader;

/***/ }),

/***/ "./src/modules/with_buttons.coffee":
/*!*****************************************!*\
  !*** ./src/modules/with_buttons.coffee ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var WithButtons;
WithButtons = {};
WithButtons.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  reset_datatable_selection: function reset_datatable_selection() {
    return this.instance.reset_datatable_selection();
  }
};
WithButtons.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_buttons_set_callbacks: function with_buttons_set_callbacks(callback_type) {
    var _this = this;
    if (!this._buttons_enabled()) {
      return false;
    }
    switch (callback_type) {
      case 'before_init':
        this.info('Load buttons');
        this._load_button('select_all', function (_event, button) {
          return _this.select_all(button);
        });
        this._load_button('reset_selection', function (_event, button) {
          return _this.reset_selection(button);
        });
        this._load_button('reset_filters', function (event, _button) {
          return _this.reset_filters(event);
        });
        return this._load_button('apply_default_filters', function (event, _button) {
          return _this.apply_default_filters(event);
        });
    }
  },
  //##########################
  // Public Instance methods #
  //##########################
  reset_datatable_selection: function reset_datatable_selection() {
    var button;
    button = this.find_button_by_name('reset_selection');
    if (button != null) {
      return this.reset_selection(button[1]);
    }
  },
  find_button_by_name: function find_button_by_name(button_name) {
    return this._find_button(this.buttons, button_name);
  },
  reset_filters: function reset_filters(event) {
    return this.datatable_filter.reset_filters(event);
  },
  apply_default_filters: function apply_default_filters(event) {
    return this.datatable_filter.apply_default_filters(event);
  },
  select_all: function select_all(button) {
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
  reset_selection: function reset_selection(button) {
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
  _buttons_enabled: function _buttons_enabled() {
    return this.buttons.length > 0;
  },
  _find_button: function _find_button(buttons, button_name) {
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
  _load_button: function _load_button(button_name, callback) {
    var button;
    button = this.find_button_by_name(button_name);
    if (button != null) {
      return this._add_callback(button, callback);
    }
  },
  _add_callback: function _add_callback(button, callback) {
    var idx;
    idx = button[0];
    button = button[1];
    button.action = function (event, _dt, _node, _config) {
      return callback(event, button);
    };
    return this.buttons[idx] = button;
  },
  _build_ajax_options: function _build_ajax_options(button) {
    var callbacks, on_error, on_send, on_success;
    callbacks = this.callbacks['buttons'][button];
    on_send = callbacks.beforeSend != null ? callbacks.beforeSend : [];
    on_error = callbacks.error != null ? callbacks.error : [];
    on_success = callbacks.success != null ? callbacks.success : [];
    return {
      beforeSend: function beforeSend(xhr, settings) {
        var c, j, len1, results;
        results = [];
        for (j = 0, len1 = on_send.length; j < len1; j++) {
          c = on_send[j];
          results.push(c(xhr, settings));
        }
        return results;
      },
      error: function error(xhr, status, _error) {
        var c, j, len1, results;
        results = [];
        for (j = 0, len1 = on_error.length; j < len1; j++) {
          c = on_error[j];
          results.push(c(xhr, status, _error));
        }
        return results;
      },
      success: function success(data, status, xhr) {
        var c, j, len1, results;
        results = [];
        for (j = 0, len1 = on_success.length; j < len1; j++) {
          c = on_success[j];
          results.push(c(data, status, xhr));
        }
        return results;
      }
    };
  },
  _call_url: function _call_url(button, params, ajax_options) {
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
var _default = exports["default"] = WithButtons;

/***/ }),

/***/ "./src/modules/with_check_boxes.coffee":
/*!*********************************************!*\
  !*** ./src/modules/with_check_boxes.coffee ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var WithCheckBoxes;
WithCheckBoxes = {};
WithCheckBoxes.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  reload: function reload() {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var reset_paging = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return this.instance.reload(callback, reset_paging);
  }
};
WithCheckBoxes.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_check_boxes_set_callbacks: function with_check_boxes_set_callbacks(callback_type) {
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
  reload: function reload() {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var reset_paging = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return this.datatable.ajax.reload(callback, reset_paging);
  },
  get_selected_checkbox_ids: function get_selected_checkbox_ids() {
    return $(this.dt_id).find('tbody > tr.selected').map(function () {
      return this.id;
    }).toArray();
  },
  get_not_selected_checkbox_ids: function get_not_selected_checkbox_ids() {
    return $(this.dt_id).find('tbody > tr').not('.selected').map(function () {
      return this.id;
    }).toArray();
  },
  select_all_rows: function select_all_rows() {
    return this.datatable.rows({
      page: 'current'
    }).select();
  },
  unselect_all_rows: function unselect_all_rows() {
    return this.datatable.rows({
      page: 'current'
    }).deselect();
  },
  select_row: function select_row(tr) {
    return this.datatable.row('#' + tr.attr('id'), {
      page: 'current'
    }).select();
  },
  update_select_all_ctrl: function update_select_all_ctrl() {
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
  _check_boxes_callback_on_ajax: function _check_boxes_callback_on_ajax() {
    var _this = this;
    return function (d) {
      var e;
      e = {
        selected: _this.get_selected_checkbox_ids(),
        not_selected: _this.get_not_selected_checkbox_ids()
      };
      return $.extend({}, d, e);
    };
  },
  _check_boxes_callback_on_created_row: function _check_boxes_callback_on_created_row() {
    var _this2 = this;
    return function (row) {
      return _this2._add_row_if_checked($(row));
    };
  },
  _check_boxes_callback_on_draw: function _check_boxes_callback_on_draw() {
    var _this3 = this;
    return function () {
      return _this3.update_select_all_ctrl();
    };
  },
  _check_boxes_callback_on_xhr: function _check_boxes_callback_on_xhr() {
    var _this4 = this;
    return function (e, settings, json, _xhr) {
      if (json != null && json['records_selected'] != null) {
        return _this4._update_select_all_global_count(json['records_selected']);
      } else {
        return false;
      }
    };
  },
  _check_boxes_callback_on_select: function _check_boxes_callback_on_select() {
    var _this5 = this;
    return function (e, api, _type, _items) {
      if (e.type === 'select') {
        $('tr.selected input[type="checkbox"]', api.table().container()).prop('checked', true);
      } else {
        $('tr:not(.selected) input[type="checkbox"]', api.table().container()).prop('checked', false);
      }
      // Update state of "Select all" control
      return _this5.update_select_all_ctrl();
    };
  },
  _check_boxes_callback_checkbox_on_click: function _check_boxes_callback_checkbox_on_click() {
    var _this6 = this;
    return function (event) {
      event.stopPropagation();
      if (event.target.checked) {
        return _this6.select_all_rows();
      } else {
        return _this6.unselect_all_rows();
      }
    };
  },
  _check_boxes_callback_th_on_click: function _check_boxes_callback_th_on_click() {
    return function (_event) {
      return $('input[type="checkbox"]', this).trigger('click');
    };
  },
  //###########################
  // Private Instance methods #
  //###########################
  _check_boxes_enabled: function _check_boxes_enabled() {
    var column;
    column = this.find_column_by_name('check_box');
    return column != null;
  },
  _add_row_if_checked: function _add_row_if_checked(tr) {
    var checkbox;
    checkbox = $($(tr).find('input[type="checkbox"]')[0]);
    if (checkbox.is(':checked')) {
      return this.select_row(tr);
    }
  },
  _update_select_all_global_count: function _update_select_all_global_count(count) {
    return $("".concat(this.dt_id, "_wrapper .selected-count")).html("Nombre total d'éléments sélectionnés : ").append($('<span>').attr('id', 'selected-count-number').html(count));
  }
};
var _default = exports["default"] = WithCheckBoxes;

/***/ }),

/***/ "./src/modules/with_context_menu.coffee":
/*!**********************************************!*\
  !*** ./src/modules/with_context_menu.coffee ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _context_menu = _interopRequireDefault(__webpack_require__(/*! ../context_menu.coffee */ "./src/context_menu.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var WithContextMenu;
WithContextMenu = {};
WithContextMenu.class_methods = {
  //#######################
  // Public Class methods #
  //#######################
  clean_context_menu: function clean_context_menu(event) {
    var target;
    target = $(event.target);
    if (target.is('a') && target.hasClass('submenu')) {
      event.preventDefault();
      return;
    }
    return WithContextMenu.class_methods.context_menu_hide();
  },
  context_menu_hide: function context_menu_hide() {
    return $('#context-menu').hide();
  }
};
WithContextMenu.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_context_menu_set_callbacks: function with_context_menu_set_callbacks(callback_type) {
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
  _context_menu_callback_on_created_row: function _context_menu_callback_on_created_row() {
    var _this = this;
    return function (row) {
      return _this._enable_contextual_menu_for_row(row);
    };
  },
  _context_menu_callback_on_contextmenu: function _context_menu_callback_on_contextmenu() {
    var _this2 = this;
    return function (event) {
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
      _this2._handle_row_selection(tr);
      return _context_menu["default"].show(event);
    };
  },
  //###########################
  // Private Instance methods #
  //###########################
  _context_menu_enabled: function _context_menu_enabled() {
    return this.dtf_options.context_menu != null && (this.dtf_options.context_menu === true || this.dtf_options.context_menu === 'true');
  },
  _enable_contextual_menu_for_row: function _enable_contextual_menu_for_row(row) {
    return $(row).addClass('has-context-menu');
  },
  _handle_row_selection: function _handle_row_selection(row) {
    if (!row.hasClass('selected')) {
      this.unselect_all_rows();
      this.select_row(row);
      return this.update_select_all_ctrl();
    }
  }
};
var _default = exports["default"] = WithContextMenu;

/***/ }),

/***/ "./src/modules/with_debug.coffee":
/*!***************************************!*\
  !*** ./src/modules/with_debug.coffee ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var WithDebug;
WithDebug = {};
WithDebug.class_methods = {};
WithDebug.instance_methods = {
  //#########
  // LOADER #
  //#########
  with_debug_set_callbacks: function with_debug_set_callbacks(callback_type) {
    switch (callback_type) {
      case 'before_init':
        this.info('Add debug callbacks to : ajax');
        return this.callbacks['ajax'].push(this._debug_callback_on_ajax());
    }
  },
  //############
  // Callbacks #
  //############
  _debug_callback_on_ajax: function _debug_callback_on_ajax() {
    var _this = this;
    return function (d) {
      var debug_dump, debug_log, e;
      debug_log = !!_this._param('dtf_debug_log');
      debug_dump = !!_this._param('dtf_debug_dump');
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
  _param: function _param(name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
  }
};
var _default = exports["default"] = WithDebug;

/***/ }),

/***/ "./src/modules/with_filters.coffee":
/*!*****************************************!*\
  !*** ./src/modules/with_filters.coffee ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var WithFilters;
WithFilters = {};
WithFilters.class_methods = {};
WithFilters.instance_methods = {
  //##########################
  // Public Instance methods #
  //##########################
  find_filter_by_name: function find_filter_by_name(column_name) {
    var column;
    column = this.find_column_by_name(column_name);
    if (column != null) {
      return this._find_filter(this.filters, column[0]);
    }
  },
  //###########################
  // Private Instance methods #
  //###########################
  _find_filter: function _find_filter(filters, column_id) {
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
var _default = exports["default"] = WithFilters;

/***/ }),

/***/ "./src/modules/with_logger.coffee":
/*!****************************************!*\
  !*** ./src/modules/with_logger.coffee ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var WithLogger;
WithLogger = {};
WithLogger.class_methods = {};
WithLogger.instance_methods = {
  //##########################
  // Public Instance methods #
  //##########################
  info: function info(message) {
    return this.logger.info(this._format_message(message));
  },
  warn: function warn(message) {
    return this.logger.warn(this._format_message(message));
  },
  error: function error(message) {
    return this.logger.error(this._format_message(message));
  },
  dump: function dump(message) {
    return this.logger.dump(message);
  },
  _format_message: function _format_message(message) {
    return "".concat(this.dt_class, " : ").concat(message);
  }
};
var _default = exports["default"] = WithLogger;

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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./src/index.coffee ***!
  \**************************/


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "DatatableBase", ({
  enumerable: true,
  get: function get() {
    return _datatable_base["default"];
  }
}));
var _datatable_base = _interopRequireDefault(__webpack_require__(/*! ./model/datatable_base.coffee */ "./src/model/datatable_base.coffee"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});