#!/usr/bin/env node

const url = require('url');
const { fse, fetch, log, spinner, resolve } = require('@all-in-js/utils');
const { parse } = require('@babel/parser');
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;

const requestUri = 'http://localhost:3100/svg/pullSvgIcons';
const sourceFile = resolve(__dirname, '../dist/svg-icon.common.js');

module.exports = async function updateIcon(projects) {
  spinner.step('pulling icons...');
  try {
    const hasQuery = url.parse(requestUri).query;
    const uri = requestUri + (hasQuery ? '&' : '?') + `projects=${projects}`;
    const { data } = await fetch(uri).then((res) => res.json());
    const sourceCode = fse.readFileSync(sourceFile).toString();
    const codes = traverseSource(sourceCode, data || {});
    fse.writeFileSync(sourceFile, codes);
    spinner.stop();
    log.info('icons updated.');
  } catch (e) {
    console.log(e);
    spinner.stop();
    log.error(e);
  }
}

function traverseSource(source, datas) {
  const ast = parse(source);
  traverse(ast, {
    // const $$$ = {};
    VariableDeclarator(path) {
      const node = path.node;
      const { id, init } = node;
      if (id.name === '$$$' && datas && typeof datas === 'object') {
        const { properties } = init;
        const newProps = genObjectProperties(datas);
        init.properties = properties.concat(newProps);
      }
    }
  });
  const { code } = generate(ast, { }, source);
  return code;
}

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
