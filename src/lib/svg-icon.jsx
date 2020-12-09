let icons = {};
let notLoadedIcons = [];
let defaultWidth = '';
let defaultHeight = '';
let tagName = 'svg-icon';
let isStroke = false;
let isOriginalDefault = false;
const defaultIcon = {
  width: 1,
  height: 1,
  viewBox: '0 0 1 1',
  data: '<rect width="0" height="0"/>'
};

function register(data) {
  for (let name in data) {
    if (!icons[name]) {
      icons[name] = data[name];
    }
    notLoadedIcons = notLoadedIcons.filter((v) => {
      if (v.name === name) {
        v.component.$set(v.component, 'loaded', true);
      }
      return v.name !== name;
    })
  }
}

export default {
  data() {
    return {
      loaded: false,
      registerSvgData: {}
    }
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
      default: function() {
        return !isStroke
      }
    },
    color: String,
    original: {
      type: Boolean,
      default: function() {
        return isOriginalDefault
      }
    },
    title: String,
    svgData: Object
  },
  computed: {
    clazz() {
      let clazz = `svg-icon`;

      if (this.fill) {
        clazz += ` svg-fill`;
      }
      if (this.dir) {
        clazz += ` svg-icon-${this.dir}`
      }
      return clazz;
    },
    iconName() {
      const iconName = this.name || this.icon || '';
      const prefix = `${tagName}-`;
      return iconName.startsWith(prefix) ? iconName.replace(prefix, '') : iconName;
    },
    iconData() {
      let iconData = icons[this.iconName] || this.svgData || defaultIcon;
      if (iconData || this.loaded) {
        return iconData;
      }
      return null;
    },
    colors() {
      if (this.color) {
        return this.color.split(' ');
      }
      return [];
    },
    path() {
      let pathData = '';

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
    box() {
      let width = this.width;
      let height = this.width;

      if (this.iconData) {
        if (this.iconData.viewBox) {
          return this.iconData.viewBox;
        }
        return `0 0 ${this.iconData.width} ${this.iconData.height}`;
      }
      return `0 0 ${parseFloat(width)} ${parseFloat(height)}`;
    },
    style() {
      const rotate = Number(this.rotate) || 0;
      let digitReg = /^\d+$/;
      let scale = Number(this.scale);
      let width;
      let height;

      if (!isNaN(scale)) {
        if (this.iconData) {
          width = this.iconData.width;
          height = this.iconData.height;
        }
        width = Number(width) * scale + 'px';
        height = Number(height) * scale + 'px';
      } else {
        width = digitReg.test(this.width)
          ? this.width + 'px'
          : this.width || defaultWidth;
        height = digitReg.test(this.height)
          ? this.height + 'px'
          : this.height || defaultWidth;
      }

      let style = {};

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
        style.transform = `rotate(${ rotate }deg)`;
      }
      return style;
    }
  },
  created() {
    if (icons[this.iconName]) {
      this.loaded = true;
    }
  },
  methods: {
    addColor(data) {
      let reg = /<(path|rect|circle|polygon|line|polyline|ellipse)\s/gi;
      let i = 0;
      return data.replace(reg, match => {
        let color = this.colors[i++] || this.colors[this.colors.length - 1];
        let fill = this.fill;

        if (color && color === '_') {
          return match;
        }
        if (color && color.indexOf('r-') === 0) {
          fill = !fill;
          color = color.split('r-')[1];
        }

        let style = fill ? 'fill' : 'stroke';
        let reverseStyle = fill ? 'stroke' : 'fill';

        return match + `${style}="${color}" ${reverseStyle}="none" `;
      })
    },

    addOriginalColor(data) {
      let styleReg = /_fill="|_stroke="/gi;
      return data.replace(styleReg, styleName => {
        return styleName && styleName.slice(1);
      })
    },

    getValidPathData(pathData) {
      if (this.original && this.colors.length > 0) {
        let reg = /<(path|rect|circle|polygon|line|polyline|ellipse)(\sfill|\sstroke)([="\w\s\.\-\+#\$\&>]+)(fill|stroke)/gi;
        pathData = pathData.replace(reg, (match, p1, p2, p3, p4) => {
          return `<${p1}${p2}${p3}_${p4}`;
        })
      }

      return pathData;
    },

    setTitle(pathData) {
      if (this.title) {
        let title = this.title
          .replace(/\</gi, '&lt;')
          .replace(/>/gi, '&gt;')
          .replace(/&/g, '&amp;');
        return `<title>${title}</title>` + pathData;
      }
      return pathData;
    },

    onClick(e) {
      this.$emit('click', e);
    }
  },

  install(Vue, options = {}) {
    tagName = options.tagName;

    isStroke = !!options.isStroke;
    isOriginalDefault = !!options.isOriginalDefault;

    options.defaultWidth && (defaultWidth = options.defaultWidth);
    options.defaultHeight && (defaultHeight = options.defaultHeight);

    Vue.component(tagName, this);
  },
  register,
  render() {
    const { path, iconName, clazz, box, style, onClick, iconData } = this;
    const svgProps = {
      domProps: {
        innerHTML: path
      }
    };
    return path ?
      <svg
        {...svgProps}
        data-svg-icon={iconName}
        data-alias={iconData.alias}
        class={clazz}
        viewBox={box}
        style={style}
        onClick={onClick}>
      </svg> :
      null;
  }
}
