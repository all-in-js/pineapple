const path = require('path');
const Svgo = require('svgo');

const setSvgoConfig = require('svgo/lib/svgo/config');

module.exports = class SvgOptimize extends Svgo {
  constructor(option) {
    const svgoOption = getSvgoConfig(option);
    super(svgoOption);
    const CONFIG = setSvgoConfig(svgoOption);
    if (!CONFIG.idSP) CONFIG.idSP = '_';
    if (!CONFIG.viewSize) CONFIG.viewSize = {
      width: 16,
      height: 16
    };
    this.config = CONFIG;
  }
  async build(name, svgContent) {
    const { width, height } = (this.config).viewSize;
    let viewBox = `0 0 ${width} ${height}`;
    let {
      data: svgData,
      info
    } = await super.optimize(svgContent);
    /**
     * match viewbox
     */
    const svgTag = svgData.match(/<svg.*?>/) || [];
    if (svgTag.length) {
      [, viewBox] = svgTag[0].match(/viewBox="([-\d\.]+\s[-\d\.]+\s[-\d\.]+\s[-\d\.]+)"/) || [];
      if (viewBox) {
        [info.height, info.width] = viewBox.split(/\s+/).reverse();
      }
    }

    let data = svgData.replace(/<svg[^>]+>/gi, '').replace(/<\/svg>/gi, '');
    if (!viewBox) {
      viewBox = `0 0 ${info.width || width} ${info.height || height}`;
    }
    data = addPid(data);
    data = renameStyle(data);
    data = changeId(data, name, (this.config).idSP);
    data = data.replace(/\'/g, "\\'");

    return {
      name,
      data,
      viewBox,
      width: parseFloat(info.width) || width,
      height: parseFloat(info.height) || height
    }
  }
}

// get svgo config
function getSvgoConfig(option) {
  if (!option) {
    return require('./svgo.config');
  } else if (typeof option === 'string') {
    return require(path.join(process.cwd(), option));
  } else {
    return option;
  }
}

function addPid(content) {
  let shapeReg = /<(path|rect|circle|polygon|line|polyline|ellipse)\s/gi;
  let id = 0;
  content = content.replace(shapeReg, function(match) {
    return match + `pid="${id++}" `;
  });

  return content;
}

function renameStyle(content) {
  let styleShaeReg = /<(path|rect|circle|polygon|line|polyline|g|ellipse).+>/gi;
  let styleReg = /fill=\"|stroke="/gi;
  content = content.replace(styleShaeReg, function(shape) {
    return shape.replace(styleReg, function(styleName) {
      return '_' + styleName
    });
  });

  return content;
}

function changeId(
    content,
    name,
    idSep = '_'
) {
  let idReg = /svgicon(\w+)/g;
  content = content.replace(idReg, function(match, elId) {
    return `svgicon${idSep}${name}${idSep}${elId}`;
  });

  return content;
}
