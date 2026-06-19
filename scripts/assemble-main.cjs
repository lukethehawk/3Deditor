const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const partsDir = path.join(root, 'src', 'main.parts');
const target = path.join(root, 'src', 'main.js');

const parts = fs
  .readdirSync(partsDir)
  .filter((name) => /^main\.part\d+\.js$/.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (!parts.length) {
  throw new Error(`No main.js parts found in ${partsDir}`);
}

const content = parts
  .map((name) => fs.readFileSync(path.join(partsDir, name), 'utf8'))
  .join('');

fs.writeFileSync(target, content);
console.log(`Assembled src/main.js from ${parts.length} parts`);
