// Quick syntax check for screen files without a full build: node scripts/check-jsx.mjs <file> [file …]
// Parses each file as a JSX module (the same parser family Next uses) and reports the first error with its line.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parse } = require('next/dist/compiled/babel/parser');
let bad = 0;
for (const file of process.argv.slice(2)) {
  try {
    parse(readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    console.log('ok   ' + file);
  } catch (e) {
    bad += 1;
    console.log('FAIL ' + file + ': ' + e.message);
  }
}
process.exit(bad ? 1 : 0);
