'use strict';

var Vue = require('vue');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Vue__default = /*#__PURE__*/_interopDefaultLegacy(Vue);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _extends() {
  return _extends = Object.assign || function (a) {
    for (var b, c = 1; c < arguments.length; c++) {
      for (var d in b = arguments[c], b) {
        Object.prototype.hasOwnProperty.call(b, d) && (a[d] = b[d]);
      }
    }

    return a;
  }, _extends.apply(this, arguments);
}

var normalMerge = ["attrs", "props", "domProps"],
    toArrayMerge = ["class", "style", "directives"],
    functionalMerge = ["on", "nativeOn"],
    mergeJsxProps = function mergeJsxProps(a) {
  return a.reduce(function (c, a) {
    for (var b in a) {
      if (!c[b]) c[b] = a[b];else if (-1 !== normalMerge.indexOf(b)) c[b] = _extends({}, c[b], a[b]);else if (-1 !== toArrayMerge.indexOf(b)) {
        var d = c[b] instanceof Array ? c[b] : [c[b]],
            e = a[b] instanceof Array ? a[b] : [a[b]];
        c[b] = d.concat(e);
      } else if (-1 !== functionalMerge.indexOf(b)) {
        for (var f in a[b]) {
          if (c[b][f]) {
            var g = c[b][f] instanceof Array ? c[b][f] : [c[b][f]],
                h = a[b][f] instanceof Array ? a[b][f] : [a[b][f]];
            c[b][f] = g.concat(h);
          } else c[b][f] = a[b][f];
        }
      } else if ("hook" == b) for (var i in a[b]) {
        c[b][i] = c[b][i] ? mergeFn(c[b][i], a[b][i]) : a[b][i];
      } else c[b] = a[b];
    }

    return c;
  }, {});
},
    mergeFn = function mergeFn(a, b) {
  return function () {
    a && a.apply(this, arguments), b && b.apply(this, arguments);
  };
};

var helper = mergeJsxProps;

var icons = {};
var notLoadedIcons = [];
var defaultWidth = '';
var defaultHeight = '';
var tagName = 'svg-icon';
var isStroke = false;
var isOriginalDefault = false;
var defaultIcon = {
  width: 1,
  height: 1,
  viewBox: '0 0 1 1',
  data: '<rect width="0" height="0"/>'
};

function register(data) {
  var _loop = function _loop(name) {
    if (!icons[name]) {
      icons[name] = data[name];
    }

    notLoadedIcons = notLoadedIcons.filter(function (v) {
      if (v.name === name) {
        v.component.$set(v.component, 'loaded', true);
      }

      return v.name !== name;
    });
  };

  for (var name in data) {
    _loop(name);
  }
}

var SvgIcon = {
  data: function data() {
    return {
      loaded: false,
      registerSvgData: {}
    };
  },
  props: {
    dir: String,
    rotate: Number,
    spin: Boolean,
    icon: String,
    name: String,
    width: {
      type: String,
      default: defaultWidth
    },
    height: {
      type: String,
      default: defaultHeight
    },
    size: {
      type: String,
      default: defaultWidth
    },
    scale: Number,
    fill: {
      type: Boolean,
      default: function _default() {
        return !isStroke;
      }
    },
    color: String,
    original: {
      type: Boolean,
      default: function _default() {
        return isOriginalDefault;
      }
    },
    title: String,
    svgData: Object
  },
  computed: {
    clazz: function clazz() {
      var clazz = "svg-icon";

      if (this.fill) {
        clazz += " svg-fill";
      }

      if (this.dir) {
        clazz += " svg-icon-".concat(this.dir);
      }

      return clazz;
    },
    iconName: function iconName() {
      var iconName = this.name || this.icon || '';
      var prefix = "".concat(tagName, "-");
      return iconName.startsWith(prefix) ? iconName.replace(prefix, '') : iconName;
    },
    iconData: function iconData() {
      var iconData = icons[this.iconName] || this.svgData || defaultIcon;

      if (iconData || this.loaded) {
        return iconData;
      }

      return null;
    },
    colors: function colors() {
      if (this.color) {
        return this.color.split(' ');
      }

      return [];
    },
    path: function path() {
      var pathData = '';

      if (this.iconData) {
        pathData = this.iconData.data;
        pathData = this.setTitle(pathData);

        if (this.original) {
          pathData = this.addOriginalColor(pathData);
        }

        if (this.colors.length > 0) {
          pathData = this.addColor(pathData);
        }
      } else {
        notLoadedIcons.push({
          name: this.iconName,
          component: this
        });
      }

      return this.getValidPathData(pathData);
    },
    box: function box() {
      var width = this.width;
      var height = this.width;

      if (this.iconData) {
        if (this.iconData.viewBox) {
          return this.iconData.viewBox;
        }

        return "0 0 ".concat(this.iconData.width, " ").concat(this.iconData.height);
      }

      return "0 0 ".concat(parseFloat(width), " ").concat(parseFloat(height));
    },
    style: function style() {
      var rotate = Number(this.rotate) || 0;
      var digitReg = /^\d+$/;
      var scale = Number(this.scale);
      var width;
      var height;

      if (!isNaN(scale)) {
        if (this.iconData) {
          width = this.iconData.width;
          height = this.iconData.height;
        }

        width = Number(width) * scale + 'px';
        height = Number(height) * scale + 'px';
      } else {
        width = digitReg.test(this.width) ? this.width + 'px' : this.width || defaultWidth;
        height = digitReg.test(this.height) ? this.height + 'px' : this.height || defaultWidth;
      }

      var style = {};

      if (width) {
        style.width = width;
      }

      if (height) {
        style.height = height;
      }

      if (this.spin) {
        style.animation = 'rotating 2s linear infinite';
      }

      if (rotate) {
        style.transform = "rotate(".concat(rotate, "deg)");
      }

      return style;
    }
  },
  created: function created() {
    if (icons[this.iconName]) {
      this.loaded = true;
    }
  },
  methods: {
    addColor: function addColor(data) {
      var _this = this;

      var reg = /<(path|rect|circle|polygon|line|polyline|ellipse)\s/gi;
      var i = 0;
      return data.replace(reg, function (match) {
        var color = _this.colors[i++] || _this.colors[_this.colors.length - 1];
        var fill = _this.fill;

        if (color && color === '_') {
          return match;
        }

        if (color && color.indexOf('r-') === 0) {
          fill = !fill;
          color = color.split('r-')[1];
        }

        var style = fill ? 'fill' : 'stroke';
        var reverseStyle = fill ? 'stroke' : 'fill';
        return match + "".concat(style, "=\"").concat(color, "\" ").concat(reverseStyle, "=\"none\" ");
      });
    },
    addOriginalColor: function addOriginalColor(data) {
      var styleReg = /_fill="|_stroke="/gi;
      return data.replace(styleReg, function (styleName) {
        return styleName && styleName.slice(1);
      });
    },
    getValidPathData: function getValidPathData(pathData) {
      if (this.original && this.colors.length > 0) {
        var reg = /<(path|rect|circle|polygon|line|polyline|ellipse)(\sfill|\sstroke)([="\w\s\.\-\+#\$\&>]+)(fill|stroke)/gi;
        pathData = pathData.replace(reg, function (match, p1, p2, p3, p4) {
          return "<".concat(p1).concat(p2).concat(p3, "_").concat(p4);
        });
      }

      return pathData;
    },
    setTitle: function setTitle(pathData) {
      if (this.title) {
        var title = this.title.replace(/\</gi, '&lt;').replace(/>/gi, '&gt;').replace(/&/g, '&amp;');
        return "<title>".concat(title, "</title>") + pathData;
      }

      return pathData;
    },
    onClick: function onClick(e) {
      this.$emit('click', e);
    }
  },
  install: function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    tagName = options.tagName;
    isStroke = !!options.isStroke;
    isOriginalDefault = !!options.isOriginalDefault;
    options.defaultWidth && (defaultWidth = options.defaultWidth);
    options.defaultHeight && (defaultHeight = options.defaultHeight);
    Vue.component(tagName, this);
  },
  register: register,
  render: function render() {
    var h = arguments[0];
    var path = this.path,
        iconName = this.iconName,
        clazz = this.clazz,
        box = this.box,
        style = this.style,
        onClick = this.onClick,
        iconData = this.iconData;
    var svgProps = {
      domProps: {
        innerHTML: path
      }
    };
    return path ? h("svg", helper([{}, svgProps, {
      "attrs": {
        "data-svg-icon": iconName,
        "data-alias": iconData.alias,
        "viewBox": box
      },
      "class": clazz,
      "style": style,
      "on": {
        "click": onClick
      }
    }])) : null;
  }
};

if (!Vue__default['default'].prototype.$isServer) {
  require('./svg-icon.css');
}

var SvgIconPlugin = {
  install: function install(Vue, opts) {
    if (!opts) opts = {};
    if (SvgIconPlugin.install.installed) return;
    /**
     * 注册所有的图标
     * svgIcons: {
     *  icon: {
     *      name: "icon",
     *      data: "<g><g>,
     *      viewBox: "0 0 78 78",
     *      width: 78,
     *      height: 78
     *   }
     * }
     */

    var ___ = {}; // this value will be replaced with loader

    var SvgIcons = ___;

    if (opts.svgIcons) {
      // local svg data
      SvgIcons = _objectSpread2(_objectSpread2({}, SvgIcons), opts.svgIcons);
    }

    SvgIcon.register(SvgIcons);
    Vue.use(SvgIcon, _objectSpread2({
      tagName: 'svg-icon'
    }, opts));
  }
};

module.exports = SvgIconPlugin;
