#!/usr/bin/env node

const url = require('url');
const { fse, resolve, fetch, chalk, log, spinner } = require('@all-in-js/utils');

const requestUri = 'http://localhost:3100/svg/pullSvgIcons';
const fileTemp = data => `// created by <pineapple> CLI，${new Date().toLocaleString()}
export default ${JSON.stringify(data)}
`;

export async function pullSvgs(projects, outFile = 'svg-icons.js') {
  spinner.step('pulling icons...');
  try {
    const hasQuery = url.parse(requestUri).query;
    const uri = requestUri + (hasQuery ? '&' : '?') + `projects=${projects}`;
    const { data } = await fetch(uri).then((res) => res.json());
    outFile = resolve(__dirname, outFile);
    fse.ensureFileSync(outFile);
    fse.writeFileSync(outFile, fileTemp(data || {}));
    spinner.stop();
    log.done('created svg icons at ' + chalk.green(outFile));
  } catch (e) {
    console.log(e);
    spinner.stop();
    log.error(e);
  }
}
