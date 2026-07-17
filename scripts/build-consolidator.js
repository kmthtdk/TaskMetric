/*
 * build-consolidator.js — generate a standalone consolidator.html
 *
 * Embeds the current index.html (the report app) as a base64 blob inside the
 * consolidator UI template, so the merged file the consolidator exports always
 * matches the live report design. Re-run after changing index.html:
 *
 *     node scripts/build-consolidator.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'index.html');
const tplPath = path.join(root, 'scripts', 'consolidator.template.html');
const outPath = path.join(root, 'consolidator.html');

const app = fs.readFileSync(appPath, 'utf8');
const tpl = fs.readFileSync(tplPath, 'utf8');

const PLACEHOLDER = '__APP_B64__';
if (tpl.indexOf(PLACEHOLDER) < 0) {
  console.error('ERROR: placeholder ' + PLACEHOLDER + ' not found in template.');
  process.exit(1);
}
if (app.indexOf('<script id="savedData" type="application/json"></script>') < 0) {
  console.error('ERROR: index.html has no empty savedData slot to inject into.');
  process.exit(1);
}

const b64 = Buffer.from(app, 'utf8').toString('base64');
const out = tpl.replace(PLACEHOLDER, b64);

fs.writeFileSync(outPath, out, 'utf8');
const kb = n => Math.round(n / 1024);
console.log('Built consolidator.html');
console.log('  app template : ' + kb(Buffer.byteLength(app, 'utf8')) + ' KB');
console.log('  base64 blob  : ' + kb(b64.length) + ' KB');
console.log('  output       : ' + kb(Buffer.byteLength(out, 'utf8')) + ' KB  -> ' + outPath);
