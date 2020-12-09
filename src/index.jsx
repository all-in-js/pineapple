import Vue from 'vue';
import SvgIcon from './lib/svg-icon';

if (!Vue.prototype.$isServer) {
  require('./svg-icon.css');
}

const SvgIconPlugin = {
  install(Vue, opts) {
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
    const ___ = {}; // this value will be replaced with loader
    let SvgIcons = ___;

    if (opts.svgIcons) {
      // local svg data
      SvgIcons = {
        ...SvgIcons,
        ...opts.svgIcons
      };
    }

    SvgIcon.register(SvgIcons);

    Vue.use(SvgIcon, {
      tagName: 'svg-icon',
      ...opts
    });
  }
}

export default SvgIconPlugin;