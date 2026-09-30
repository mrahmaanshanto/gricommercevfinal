// Guard for the design pattern: fails when a screen brings back a literal the tokens replace.
//   node scripts/check-screens.mjs        (npm run check:screens)
import fs from 'node:fs';
import path from 'node:path';

const RULES = [
  ['literal font size (use var(--text-*))', /(?:font-size:\s*|fontSize:\s*")(?:9|1\d|2\d|3\d)(?:\.\d+)?px/],
  ['numeric font weight (use var(--weight-*))', /(?:font-weight:\s*|fontWeight:\s*")[1-9]00\b/],
  ['literal corner radius (use var(--radius-*))', /(?:border-radius:\s*|borderRadius:\s*")(?:[4-9]|1\d|2[0-4]|99+)px/],
  ['slate-400 text (use var(--text-muted))', /(?<![-a-zA-Z])color:\s*"?#94a3b8/i],
  ['font family literal (use var(--font-*))', /(?:font-family:\s*|fontFamily:\s*")'?(?:Poppins|Hind Siliguri|JetBrains Mono|Arial|ui-monospace)/],
  ['fixed 1440px board width', /width:\s*"1440px"/],
];
// design references, not product screens
const SKIP = /\/screens\/(console|app|dev-reference|core-backend|site-map)\/|PosRegister\.jsx|SettingsConsole\.jsx|Structure\.jsx/;

let bad = 0;
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { walk(p); continue; }
    if (!p.endsWith('.jsx') || SKIP.test(p)) continue;
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const [name, re] of RULES) {
        if (!re.test(line)) continue;
        bad++;
        if (bad <= 40) console.log(`${p}:${i + 1}  ${name}`);
      }
    });
  }
})('src/screens');

if (bad) { console.log(`\n${bad} problem(s). Run "npm run pattern" to snap literals onto the tokens.`); process.exit(1); }
console.log('Screens follow the pattern.');
