// proposalMarkdown — turns docs/proposal-vs-build.md into HTML for /dev/proposal/doc. Covers what that document uses:
// headings (ids the same as the document's own links and lib/proposal.js › slugOf), paragraphs, nested - and 1. lists,
// tables, block quotes, **bold**, *italic*, `code` and [links](…). The Status column of a table becomes a badge.
import { slugOf } from '@/lib/proposal';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plain = (s) => s.replace(/`([^`]*)`/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_]/g, '');

function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?![\w*])/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
}

const STATUS_TONE = [[/^not built/i, 'slate'], [/^partly/i, 'warning'], [/^built differently/i, 'info'], [/^built/i, 'success'], [/^n\/a/i, 'slate']];
const statusCell = (v) => {
  const tone = (STATUS_TONE.find(([re]) => re.test(v)) || [])[1];
  return tone ? `<span class="gc-badge gc-badge--${tone}">${inline(v)}</span>` : inline(v);
};

const cellsOf = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const LIST = /^(\s*)([-*]|(\d+)\.)\s+(.*)$/;
const isBlockStart = (l) => /^#{1,6}\s/.test(l) || /^\s*\|/.test(l) || /^>/.test(l) || LIST.test(l);

function buildList(items, at, indent) {
  const ordered = items[at].ordered;
  const start = ordered && items[at].n !== 1 ? ` start="${items[at].n}"` : '';
  let html = ordered ? `<ol${start}>` : '<ul>';
  let i = at;
  while (i < items.length && items[i].indent === indent) {
    html += '<li>' + inline(items[i].text);
    i++;
    if (i < items.length && items[i].indent > indent) {
      const kid = buildList(items, i, items[i].indent);
      html += kid.html;
      i = kid.next;
    }
    html += '</li>';
  }
  return { html: html + (ordered ? '</ol>' : '</ul>'), next: i };
}

/** { html, toc: [{ level, text, id }] } */
export function renderMarkdown(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  const toc = [];
  const seen = new Map();
  const idFor = (text) => { const base = slugOf(text); const n = seen.get(base) || 0; seen.set(base, n + 1); return n ? `${base}-${n}` : base; };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      const id = idFor(plain(text));
      if (level >= 2 && level <= 3) toc.push({ level, text: plain(text), id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }
    if (/^\s*\|/.test(line) && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || '')) {
      const head = cellsOf(line);
      const statusAt = head.findIndex((h) => /^status$/i.test(h));
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(cellsOf(lines[i])); i++; }
      out.push(`<div class="pd-tw"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, k) => `<td>${k === statusAt ? statusCell(c) : inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^>/.test(line)) {
      const body = [];
      while (i < lines.length && /^>/.test(lines[i])) { body.push(lines[i].replace(/^>\s?/, '')); i++; }
      const paras = body.join('\n').split(/\n\s*\n/).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean);
      out.push(`<blockquote>${paras.map((p) => `<p>${inline(p)}</p>`).join('')}</blockquote>`);
      continue;
    }
    if (LIST.test(line)) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        const li = LIST.exec(l);
        if (li) { items.push({ indent: li[1].length, ordered: !!li[3], n: Number(li[3] || 1), text: li[4] }); i++; continue; }
        if (l.trim() && /^\s+/.test(l) && items.length) { items[items.length - 1].text += ' ' + l.trim(); i++; continue; }
        if (!l.trim()) {
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && (LIST.test(lines[j]) && /^\s+/.test(lines[j]))) { i = j; continue; }
        }
        break;
      }
      // indents are relative to the list's own left edge
      const base = Math.min(...items.map((x) => x.indent));
      items.forEach((x) => { x.indent -= base; });
      let at = 0;
      while (at < items.length) { const r = buildList(items, at, items[at].indent); out.push(r.html); at = r.next; }
      continue;
    }
    if (/^-{3,}$/.test(line.trim())) { out.push('<hr>'); i++; continue; }
    const para = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) { para.push(lines[i].trim()); i++; }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc };
}
