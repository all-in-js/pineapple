#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const SvgOptimize = require('./svgo');

/**
 * 如果outFile存在，并且格式没问题，则进行一次merge
 * 否在，生成新文件
 */

/**
 * prefix取文件所在目录的名称
 */
const cwd = process.cwd();
const svgo = new SvgOptimize();
const sourceDir = path.resolve(cwd, source[0]);
const outputFilePath = path.resolve(cwd, agrs.outFile);

if (!fs.existsSync(sourceDir)) {
  throw new Error(`no file or directory: '${sourceDir}'`);
}

const prefix = sourceDir.replace(/[\\\/]+$/, '').split(/[\\\/]/).slice(-1)[0] || 'svgs';

/**
 * 第一期支持一级目录
 */
module.exports = async function svg2js() {
  let result = {};
  const sourceFiles = fs.readdirSync(sourceDir);
  if (sourceFiles && sourceFiles.length) {
    for (const item of sourceFiles) {
      const filePath = path.join(sourceDir, item);
      if (fs.statSync(filePath).isFile()) {
        const fileName = item.replace(/\.svg$/, '');
        const fileContent = fs.readFileSync(filePath);
        const svgInfo = await svgo.build(fileName, fileContent);
        result[`${prefix}/${fileName}`] = svgInfo;
      }
    }
  }
  if (fs.existsSync(outputFilePath)) {
    // console.log(import(outputFilePath));
    // TODO: 创建临时文件，转换esmodule
    const tempFilepath = createTempEs2cjsFile(outputFilePath);
    let oldResult = require(tempFilepath) || {};
    fs.unlinkSync(tempFilepath);
    /**
     * merge old and new
     */
    if (oldResult && Object.keys(oldResult).length) {
      oldResult = {
        ...oldResult,
        ...result
      };
    }
    console.log('appended new icons:', Object.keys(result));
    fs.writeFileSync(outputFilePath, createOutputStr(oldResult));
  } else {
    fs.mkdirSync(outputFilePath.replace(/[^\/\\]+\.js$/, ''), { recursive: true });
    fs.writeFileSync(outputFilePath, createOutputStr(result));
  }

  console.log('outFile at:', outputFilePath);
  console.log('icon prefix:', `${prefix}/`);
  console.log('example:', `<icon name="${prefix}/close"></icon>`);
}

function createOutputStr(result) {
  return `// created by <pineapple> CLI，${new Date().toLocaleString()}
export default ${JSON.stringify(result)};
`;
}

function createTempEs2cjsFile(esfilepath) {
  if (!fs.existsSync(esfilepath)) {
    throw new Error('no file:', esfilepath);
  }
  const id = Math.random().toString(16).slice(2, 10);
  const esStr = fs.readFileSync(esfilepath).toString();
  const tempFilepath = path.resolve(__dirname, `${id}.js`);
  fs.writeFileSync(tempFilepath, esStr.replace('export default', 'module.exports ='));
  return tempFilepath;
}
/**
 * svg2js source --out all.js
 */