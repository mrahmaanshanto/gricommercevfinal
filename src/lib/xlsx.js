// xlsx — read the first sheet of an Excel .xlsx file in the browser, with no library: the file is a zip of XML parts;
// the zip's central directory gives each part, deflated parts are opened with the browser's DecompressionStream, and
// the XML is read with DOMParser.
//   readXlsx(arrayBuffer) → Promise<rows of cells (strings)>   (empty rows dropped; dates stay Excel day numbers)
// Old .xls files (not a zip) are refused with a plain message. Browser only.

const td = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;

function entries(buf) {
  const v = new DataView(buf);
  let end = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) { if (v.getUint32(i, true) === 0x06054b50) { end = i; break; } }
  if (end < 0) throw new Error('not-zip');
  const count = v.getUint16(end + 10, true);
  let p = v.getUint32(end + 16, true);
  const out = {};
  for (let k = 0; k < count; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const method = v.getUint16(p + 10, true), size = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true), extra = v.getUint16(p + 30, true), comment = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const name = td.decode(new Uint8Array(buf, p + 46, nameLen));
    out[name] = { method, size, local };
    p += 46 + nameLen + extra + comment;
  }
  return out;
}
async function part(buf, e) {
  if (!e) return '';
  const v = new DataView(buf);
  const start = e.local + 30 + v.getUint16(e.local + 26, true) + v.getUint16(e.local + 28, true);
  const bytes = new Uint8Array(buf, start, e.size);
  if (e.method === 0) return td.decode(bytes);
  if (e.method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('unsupported');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return td.decode(await new Response(stream).arrayBuffer());
}
const xml = (text) => new DOMParser().parseFromString(text, 'application/xml');
const byTag = (node, tag) => Array.from(node.getElementsByTagNameNS('*', tag));
const colIndex = (ref) => { const m = /^([A-Z]+)/.exec(ref || ''); if (!m) return -1; let n = 0; for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };

/** The first sheet as rows of strings. */
export async function readXlsx(buf) {
  let list;
  try { list = entries(buf); } catch { throw new Error('This isn’t an .xlsx file. In Excel: File › Save as › Excel workbook (.xlsx) or CSV.'); }
  // the first sheet in the workbook's order
  let sheet = 'xl/worksheets/sheet1.xml';
  try {
    const wb = xml(await part(buf, list['xl/workbook.xml']));
    const first = byTag(wb, 'sheet')[0];
    const rid = first && (first.getAttribute('r:id') || first.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
    const rels = xml(await part(buf, list['xl/_rels/workbook.xml.rels']));
    const rel = byTag(rels, 'Relationship').find((r) => r.getAttribute('Id') === rid);
    if (rel) { const t = rel.getAttribute('Target').replace(/^\//, ''); sheet = t.indexOf('xl/') === 0 ? t : 'xl/' + t; }
  } catch { /* fall back to sheet1 */ }
  if (!list[sheet]) throw new Error('The workbook has no sheet we can read.');
  const shared = list['xl/sharedStrings.xml'] ? byTag(xml(await part(buf, list['xl/sharedStrings.xml'])), 'si').map((si) => byTag(si, 't').map((t) => t.textContent).join('')) : [];
  const doc = xml(await part(buf, list[sheet]));
  const rows = [];
  byTag(doc, 'row').forEach((r) => {
    const row = [];
    byTag(r, 'c').forEach((c) => {
      const i = colIndex(c.getAttribute('r'));
      const t = c.getAttribute('t');
      const vEl = byTag(c, 'v')[0];
      let val = '';
      if (t === 's') val = shared[Number(vEl ? vEl.textContent : -1)] || '';
      else if (t === 'inlineStr') val = byTag(c, 't').map((x) => x.textContent).join('');
      else if (t === 'b') val = vEl && vEl.textContent === '1' ? 'TRUE' : 'FALSE';
      else val = vEl ? vEl.textContent : '';
      row[i >= 0 ? i : row.length] = val;
    });
    for (let k = 0; k < row.length; k++) if (row[k] == null) row[k] = '';
    if (row.some((x) => String(x).trim() !== '')) rows.push(row);
  });
  return rows;
}
