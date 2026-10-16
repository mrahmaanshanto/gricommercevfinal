#!/usr/bin/env node
// Store kit checker — reads one or more `.gcstore.json` files and says, in plain words, what is wrong (errors stop an
// import) and what to look at (warnings). Uses the same rules as the app (src/lib/storefront/kit.js + schema.js).
//
//   node tools/store-kit/check.mjs my-store.gcstore.json [more.gcstore.json …]   exit 1 when a file has errors
//   node tools/store-kit/check.mjs --vocab                                       every allowed value, as Markdown
//   node tools/store-kit/check.mjs --json file.gcstore.json                      the result as JSON (for tools)
// Needs Node 22.12 or newer (it reads the app's own files directly).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// the app's files are ES modules in a package without "type": "module"; Node reads them fine but warns once
const emit = process.emitWarning;
process.emitWarning = function (w, ...rest) { if (String((w && w.message) || w).includes('Module type of')) return; return emit.call(process, w, ...rest); };

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
let kitLib; let schema;
try {
  kitLib = await import(pathToFileURL(path.join(root, 'src/lib/storefront/kit.js')).href);
  schema = await import(pathToFileURL(path.join(root, 'src/lib/storefront/schema.js')).href);
} catch (e) {
  console.error('Could not load the store kit rules (' + (e && e.message) + '). Use Node 22.12 or newer, from the repo folder.');
  process.exit(2);
}

const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log('Usage: node tools/store-kit/check.mjs <file.gcstore.json> … | --vocab | --json <file>');
  process.exit(args.length ? 0 : 1);
}

if (args.includes('--vocab')) {
  const S = schema;
  const L = [];
  const choices = (c) => (c || []).map((x) => (Array.isArray(x) ? x[0] : x.value)).join(' · ');
  L.push('# Store kit vocabulary', '', 'Generated from src/lib/storefront/schema.js by `node tools/store-kit/check.mjs --vocab`. Every value a kit may use.', '');
  L.push('## Theme settings (`theme`)', '', '| Option | Group | Type | Default | Allowed |', '| --- | --- | --- | --- | --- |');
  S.OPTIONS.forEach((o) => L.push(`| \`${o.key}\` | ${o.group} | ${o.type} | \`${JSON.stringify(o.default)}\` | ${o.type === 'choice' ? choices(o.choices) : o.type === 'number' ? `${o.min}–${o.max}` : o.type === 'color' ? '#rrggbb' : o.type === 'block' ? `a ${o.blockType} block id` : ''} |`));
  L.push('', '## Header elements (`headers[].desktop|mobile.top|main|bottom.left|center|right`)', '', 'Rows: ' + S.ROWS.map((r) => '`' + r[0] + '`').join(', ') + ' · row tones: ' + S.ROW_TONES.map((r) => r[0]).join(' · '), '', '| Element | Settings (default) |', '| --- | --- |');
  S.ELEMENTS.forEach((e) => L.push(`| \`${e.type}\` | ${e.settings.map(([k, , t, d, c]) => `\`${k}\` ${t}${c ? ' (' + choices(c) + ')' : ''} = ${JSON.stringify(d)}`).join('<br>') || '—'} |`));
  L.push('', 'Phone drawer items: ' + S.DRAWER_ITEMS.map((x) => x[0]).join(' · ') + ' · bottom bar items: ' + S.NAV_ITEMS.map((x) => x[0]).join(' · '));
  L.push('', 'Header switches (true / false on the header itself): ' + S.HEADER_SWITCHES.map(([k, l]) => '`' + k + '` (' + l + ')').join(', '));
  L.push('', '## Layouts (`layouts[]`)', '', '| Kind | Conditions (`when.type`) |', '| --- | --- |');
  S.KINDS.forEach((k) => L.push(`| \`${k.kind}\` | ${k.conds.join(' · ')} |`));
  L.push('', 'Section colours (`tone`): ' + S.SECTION_TONES.map((t) => t[0]).join(' · '), '', '| Section | Fields (type = default) |', '| --- | --- |');
  const fieldDoc = ([k, , ty, d, c]) => (ty === 'list' ? `\`${k}\` list of up to ${c.max} { ${c.of.map(([fk, , ft, fc]) => fk + ' ' + ft + (fc ? ' (' + choices(fc) + ')' : '')).join(', ')} }` : `\`${k}\` ${ty}${c ? ' (' + choices(c) + ')' : ''} = ${JSON.stringify(d)}`);
  S.SECTION_TYPES.forEach((t) => L.push(`| \`${t.type}\` | ${t.fields.map(fieldDoc).join('<br>')} |`));
  L.push('', 'Item icons (`icon`): ' + S.ITEM_ICONS.join(' · '));
  L.push('', 'Style presets (Customize › Style; set these theme options together): ' + S.STYLE_PRESETS.map((x) => '`' + x.id + '`').join(' · '));
  L.push('', 'Hero slide fields: ' + S.SLIDE_FIELDS.map((f) => '`' + f[0] + '`' + (f[3] ? ' (' + choices(f[3]) + ')' : '')).join(', '));
  L.push('', '## HTML blocks (`blocks[].type`)', '', S.BLOCK_KINDS.map((k) => `- \`${k.type}\`: ${k.hint}`).join('\n'));
  L.push('', '## Content blocks (`blocks[].content[]`, `pages[].content[]`)', '', '| Type | Fields |', '| --- | --- |');
  S.CONTENT_BLOCK_TYPES.forEach((t) => L.push(`| \`${t.type}\` | ${Object.entries(S.CONTENT_BLOCK_FIELDS[t.type]).map(([k, v]) => '`' + k + '` ' + (Array.isArray(v) ? v.join(' · ') : v)).join(', ') || '—'} |`));
  L.push('', 'Text may use **bold**, *italic* and [links](/offers).');
  L.push('', '## Menus (`menus[]`)', '', 'Places: ' + S.MENU_PLACES.map((x) => x[0]).join(' · ') + ' · link types: ' + S.LINK_TYPES.map((x) => x.type).join(' · '), '', 'Mega menu widths: ' + S.MEGA_WIDTHS.map((x) => x[0]).join(' · ') + ' · column kinds: ' + S.MEGA_KINDS.map((x) => x.kind).join(' · ') + ' (2–5 columns)');
  L.push('', '## Store notices (`notices[]`)', '', 'Places: ' + S.NOTICE_PLACES.map((x) => x[0]).join(' · ') + ' · tones: ' + S.NOTICE_TONES.map((x) => x[0]).join(' · ') + ' · `from`: ' + S.NOTICE_SOURCES.map((x) => '`' + (x[0] || '""') + '` ' + x[1]).join(', '), '', 'Fields: `id`, `text` (≤ 140), `textBn`, `from`, `button`, `link`, `code`, `countdown` (needs `end`), `tone`, `place`, `show`, `start`, `end` (ISO dates, e.g. 2026-10-20T09:00:00+06:00), `dismiss`, `on`.');
  L.push('', '## Block placements (`placements[].spot`)', '', S.SPOTS.map((s) => `- \`${s.spot}\`: ${s.label}`).join('\n'));
  L.push('', '## Who sees it (`show`)', '', 'pages: `"all"` or a list of ' + S.PAGE_KINDS.map((x) => '`' + x[0] + '`').join(', ') + ' · devices: ' + S.DEVICES.map((x) => '`' + x[0] + '`').join(', ') + ' · categories: [path] · products: [id]');
  L.push('', '## Shop details in text', '', kitLib.KIT_TOKENS.map(([t, l]) => `- \`{{${t}}}\`: ${l}`).join('\n'), '');
  console.log(L.join('\n'));
  process.exit(0);
}

const asJson = args.includes('--json');
const files = args.filter((a) => !a.startsWith('--'));
let bad = 0;
const results = [];
for (const f of files) {
  let text = '';
  try { text = fs.readFileSync(f, 'utf8'); } catch { console.error(`${f}: can't read the file.`); bad++; continue; }
  const r = kitLib.checkKit(text);
  results.push({ file: f, ok: r.ok, errors: r.errors, warnings: r.warnings, counts: r.counts });
  if (!r.ok) bad++;
  if (asJson) continue;
  const name = r.kit && r.kit.meta ? r.kit.meta.name : '';
  console.log(`\n${r.ok ? '✓' : '✗'} ${f}${name ? ' · ' + name : ''}`);
  if (r.ok) console.log('  ' + kitLib.kitSummary(r.kit));
  r.errors.forEach((e) => console.log(`  ERROR    ${e.path ? e.path + ': ' : ''}${e.text}`));
  r.warnings.forEach((w) => console.log(`  warning  ${w.path ? w.path + ': ' : ''}${w.text}`));
}
if (asJson) console.log(JSON.stringify(results, null, 2));
else console.log(bad ? `\n${bad} file(s) with errors.` : '\nAll good.');
process.exit(bad ? 1 : 0);
