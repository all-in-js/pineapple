const chalk = require('chalk');
const path = require('path');
const url = require('url');
const fetch = require('node-fetch');
const t = require('@babel/types');
const loaderUtils = require('loader-utils');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const { parse } = require('@babel/parser');
const pkg = require('../package.json');

const prefix = chalk.gray(`[${pkg.name}]: `);
let cachedResponse;

const VUE_SVG_SCOPE = pkg.name.split('/')[0];
const VUE_SVG_CJS_FILENAME = 'svg-icon.common.js';

function genObjectProperties(svgIcons) {
  return Object.keys(svgIcons || {}).map((item) => {
    return t.objectProperty(t.stringLiteral(item), genIconProperties(svgIcons[item]));
  });
}

function genIconProperties(iconInfo) {
  return t.objectExpression(Object.keys(iconInfo || {}).map((item) => {
    return t.objectProperty(t.stringLiteral(item), t.stringLiteral(iconInfo[item].toString()));
  }));
}

async function pullSvgIcons(source) {
  const { resourcePath } = this;
  const fileName = path.basename(resourcePath);
  if (fileName === VUE_SVG_CJS_FILENAME && resourcePath.indexOf(VUE_SVG_SCOPE) !== -1) {
    /**
     * start when file is target pkg
     */
    const option = loaderUtils.getOptions(this);
    const {
      requestUri, // 拉取图标的接口地址
      projects, // 项目alias
      cacheResponse = true // 缓存数据
    } = option;
    /**
     * _svgIcons: {
     *  iconA: {
     *      name: "icon3",
     *      data: "<g fill="none" fill-rule="evenodd"><g><rect pid="0" fill="#0E57A2",
     *      viewBox: "0 0 78 78",
     *      width: 78,
     *      height: 78
     *   }
     * }
     */

    if (typeof requestUri !== 'string') {
      console.log(`${prefix + chalk.yellow(`'requestUri' of option is expected.`)}`);
      return source;
    }

    if (cacheResponse && cachedResponse) {
      // nothing to do
    } else {
      try {
        const hasQuery = url.parse(requestUri).query;
        const uri = requestUri + (hasQuery ? '&' : '?') + `projects=${projects}`;
        cachedResponse = await fetch(uri).then((res) => res.json());
      } catch (e) {
        console.log(`${prefix + chalk.red(e)}`);
        return source;
      }
    }
    const svgIcons = cachedResponse.data || {};
    const codes = traverseSource(source, svgIcons);
    return codes;
  } else {
    return source;
  }
};

function traverseSource(source, datas) {
  const ast = parse(source);
  traverse(ast, {
    VariableDeclarator(path) {
      const node = path.node;
      const { id, init } = node;
      if (id.name === '___' && datas && typeof datas === 'object') {
        const { properties } = init;
        const newProps = genObjectProperties(datas);
        init.properties = properties.concat(newProps);
      }
    }
  });
  const { code } = generate(ast, { }, source);
  return code;
}

module.exports = pullSvgIcons;
