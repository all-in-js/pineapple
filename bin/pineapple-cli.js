#!/usr/bin/env node

const {
  _: [command],
  ...argv
} = require('yargs-parser')(process.argv.slice(2));
const svg2js = require('../scripts/svg2js');
const pullSvgs = require('../scripts/pull-remote-svg');
const integrateSvg = require('../scripts/integrate-svg');

if (command === 'svg2js') {
  let { source, outFile } = argv;

  if (!outFile) {
    outFile = `svgs.js`;
  }
  if (!outFile.endsWith('.js')) {
    throw new Error(`'outFile' expected endsWith .js`);
  }
  
  svg2js(source, outFile);
}

if (command === 'pull') {
  let { projects, outFile } = argv;
  
  if (!outFile) {
    outFile = 'svg-icons.js';
  }

  pullSvgs(projects, outFile);
}

if (command === 'integrate') {
  const { projects } = argv;

  integrateSvg(projects);
}