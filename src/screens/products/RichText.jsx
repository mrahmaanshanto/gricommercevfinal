'use client';
// RichText — the Long description editor on Add / Edit product (the reference page's editor): a visual editor
// (contenteditable) with a toolbar (B I U H2 H3 lists Link Image Table), an `</> HTML` source mode and Expand. The value
// is HTML, kept in the product's `long` field. Older descriptions are plain text: they are shown as paragraphs and
// only become HTML once someone edits them. Everything shown or saved goes through sanitizeHtml (an allowlist).

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { readImage } from '@/screens/channels/chShared';

const TAGS = { P: 1, BR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, H2: 1, H3: 1, H4: 1, UL: 1, OL: 1, LI: 1, A: 1, IMG: 1, TABLE: 1, THEAD: 1, TBODY: 1, TR: 1, TH: 1, TD: 1, DIV: 1, SPAN: 1, BLOCKQUOTE: 1, HR: 1 };
const ATTRS = { A: ['href', 'title'], IMG: ['src', 'alt', 'width', 'height'], TD: ['colspan', 'rowspan'], TH: ['colspan', 'rowspan'] };
const safeUrl = (u, img) => { const s = String(u || '').trim(); return /^(https?:|mailto:|tel:|\/|#)/i.test(s) || (img && /^data:image\/(png|jpe?g|gif|webp);/i.test(s)) ? s : ''; };

/** Only the tags and attributes a product description needs; scripts, styles, handlers and odd URLs are dropped. */
export function sanitizeHtml(html) {
  if (typeof window === 'undefined' || !html) return '';
  const doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
  const clean = (node) => {
    Array.from(node.childNodes).forEach((ch) => {
      if (ch.nodeType === 3) return;
      if (ch.nodeType !== 1) { ch.remove(); return; }
      const tag = ch.tagName;
      if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|NOSCRIPT|TEMPLATE|LINK|META)$/.test(tag)) { ch.remove(); return; }
      clean(ch);
      if (!TAGS[tag]) { ch.replaceWith(...Array.from(ch.childNodes)); return; }
      const keep = ATTRS[tag] || [];
      Array.from(ch.attributes).forEach((a) => { if (keep.indexOf(a.name) < 0) ch.removeAttribute(a.name); });
      if (tag === 'A') { const h = safeUrl(ch.getAttribute('href')); if (h) { ch.setAttribute('href', h); ch.setAttribute('rel', 'noopener'); } else ch.removeAttribute('href'); }
      if (tag === 'IMG') { const s = safeUrl(ch.getAttribute('src'), true); if (s) ch.setAttribute('src', s); else ch.remove(); }
    });
  };
  const root = doc.body.firstChild;
  clean(root);
  return root.innerHTML;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const isHtml = (v) => /<\/?[a-z][\s\S]*>/i.test(String(v || ''));
/** A stored description as HTML: HTML is cleaned; plain text becomes paragraphs (blank line) and line breaks. */
export function toHtml(v) {
  const t = String(v || '');
  if (!t.trim()) return '';
  if (isHtml(t)) return sanitizeHtml(t);
  return t.split(/\n{2,}/).map((p) => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
}
/** The words of a description without its markup (search preview, counts). */
export function plainText(v) {
  const t = String(v || '');
  if (!isHtml(t)) return t;
  if (typeof window === 'undefined') return t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const d = new DOMParser().parseFromString(t, 'text/html');
  return (d.body.textContent || '').replace(/\s+/g, ' ').trim();
}

const TOOLS = [
  { k: 'bold', label: 'B', aria: 'Bold', cls: 'is-b' },
  { k: 'italic', label: 'I', aria: 'Italic', cls: 'is-i' },
  { k: 'underline', label: 'U', aria: 'Underline', cls: 'is-u' },
  { k: 'h2', label: 'H2', aria: 'Heading 2' },
  { k: 'h3', label: 'H3', aria: 'Heading 3' },
  { k: 'ul', label: '• List', aria: 'Bulleted list' },
  { k: 'ol', label: '1. List', aria: 'Numbered list' },
  { k: 'link', label: 'Link', aria: 'Link' },
  { k: 'image', label: 'Image', aria: 'Image' },
  { k: 'table', label: 'Table', aria: 'Table' },
];
const TABLE_HTML = '<table><thead><tr><th>Feature</th><th>Detail</th></tr></thead><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br></p>';

/**
 * props: id, value (HTML or plain text), onChange(html), labelledBy, aiOn (purple edge), extra (buttons on the right
 * of the toolbar, e.g. AI), onError(message)
 */
export default function RichText({ id, value, onChange, labelledBy, aiOn, extra, onError }) {
  const box = useRef(null);
  const file = useRef(null);
  const sent = useRef(null);          // the last HTML this editor sent up (so typing never resets the caret)
  const [mode, setMode] = useState('visual');
  const [big, setBig] = useState(false);
  const [src, setSrc] = useState('');

  // show the value in the visual editor when it changes from outside (load, AI, restore, undo)
  useEffect(() => {
    if (mode !== 'visual' || !box.current) return;
    if (value === sent.current) return;
    box.current.innerHTML = toHtml(value);
    sent.current = value;
  }, [value, mode]);

  const emit = () => {
    if (!box.current) return;
    let html = box.current.innerHTML;
    if (!box.current.textContent.trim() && !box.current.querySelector('img,table')) html = '';
    sent.current = html;
    onChange(html);
  };
  const run = (cmd, arg) => {
    if (box.current) box.current.focus();
    try { document.execCommand(cmd, false, arg); } catch { /* old browsers */ }
    emit();
  };
  const tool = (k) => {
    if (mode !== 'visual') return;
    if (k === 'bold' || k === 'italic' || k === 'underline') run(k);
    else if (k === 'h2' || k === 'h3') run('formatBlock', '<' + k + '>');
    else if (k === 'ul') run('insertUnorderedList');
    else if (k === 'ol') run('insertOrderedList');
    else if (k === 'link') {
      const url = window.prompt('Link address (https://…)', 'https://');
      const safe = safeUrl(url);
      if (safe && safe !== 'https://') run('createLink', safe);
    } else if (k === 'image') { if (file.current) file.current.click(); }
    else if (k === 'table') run('insertHTML', TABLE_HTML);
  };
  const pickImage = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    readImage(f, 800).then((url) => run('insertHTML', '<img src="' + url + '" alt="">'), (er) => { if (onError) onError(er.message); });
  };
  const toggleMode = () => {
    if (mode === 'visual') { setSrc(toHtml(value)); setMode('html'); return; }
    const html = sanitizeHtml(src);
    sent.current = null;               // the effect redraws the visual editor from the cleaned HTML
    onChange(html);
    setMode('visual');
  };

  return (
    <div className={'ap-rte' + (aiOn ? ' ap-ai-on' : '') + (big ? ' is-big' : '')} data-nodirty="">
      <div className="ap-rte__bar" role="toolbar" aria-label="Formatting">
        {TOOLS.map((t) => (
          <button key={t.k} type="button" className={'ap-rte__tool ' + (t.cls || '')} aria-label={t.aria} title={t.aria} disabled={mode !== 'visual'}
            onMouseDown={(e) => e.preventDefault()} onClick={() => tool(t.k)}>{t.label}</button>
        ))}
        <span className="ap-rte__push" />
        {extra}
        <button type="button" className="ap-rte__tool" aria-pressed={mode === 'html'} onClick={toggleMode}><Icon name="code-xml" width="14" height="14" aria-hidden="true" />HTML</button>
        <button type="button" className="ap-rte__tool" aria-pressed={big} onClick={() => setBig(!big)}>{big ? 'Collapse' : 'Expand'}</button>
      </div>
      {mode === 'visual' ? (
        <div ref={box} id={id} className="ap-rte__area" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
          aria-labelledby={labelledBy} onInput={emit} onBlur={emit} />
      ) : (
        <textarea id={id} className="ap-rte__src" value={src} onChange={(e) => setSrc(e.target.value)} aria-labelledby={labelledBy} spellCheck={false} />
      )}
      <input ref={file} type="file" accept="image/*" hidden onChange={pickImage} />
      <div className="ap-rte__foot">
        <span>Visual editor accepts formatted text, inline images and tables.</span>
        <span>HTML source is converted back to visual content when you switch modes.</span>
      </div>
    </div>
  );
}

export const RTE_CSS = `
.ap-rte{display:flex;flex-direction:column;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);overflow:hidden}
.ap-rte:focus-within{border-color:var(--border-field-focus)}
.ap-rte.ap-ai-on{border-color:var(--viz-7)}
.ap-rte__bar{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:4px 6px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle)}
.ap-rte__tool{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ap-rte__tool:hover:not(:disabled){background:var(--surface-quiet);color:var(--text-heading)}
.ap-rte__tool:disabled{opacity:.45;cursor:default}
.ap-rte__tool[aria-pressed="true"]{background:var(--fill-primary-soft);color:var(--primary)}
.ap-rte__tool.is-b{font-weight:var(--weight-semibold)}
.ap-rte__tool.is-i{font-style:italic}
.ap-rte__tool.is-u{text-decoration:underline}
.ap-rte__push{flex:1 1 auto}
.ap-rte__area,.ap-rte__src{min-height:220px;max-height:420px;overflow:auto;padding:var(--space-3);border:0;outline:none;font-family:var(--font-sans),var(--font-bn);font-size:var(--text-sm);line-height:1.6;color:var(--text-heading);overflow-wrap:anywhere}
.ap-rte.is-big .ap-rte__area,.ap-rte.is-big .ap-rte__src{min-height:480px;max-height:none}
.ap-rte__src{display:block;width:100%;resize:vertical;background:var(--surface-card);font-family:var(--font-code);font-size:var(--text-xs-plus)}
.ap-rte__area>*:first-child{margin-top:0}
.ap-rte__area p{margin:0 0 var(--space-2)}
.ap-rte__area h2{margin:var(--space-3) 0 var(--space-2);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold)}
.ap-rte__area h3{margin:var(--space-3) 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.ap-rte__area ul,.ap-rte__area ol{margin:0 0 var(--space-2);padding-left:var(--space-5)}
.ap-rte__area img{max-width:100%;height:auto;border-radius:var(--radius-md)}
.ap-rte__area table{width:100%;border-collapse:collapse;margin:0 0 var(--space-2)}
.ap-rte__area th,.ap-rte__area td{padding:6px 8px;border:1px solid var(--border-subtle);text-align:left;vertical-align:top}
.ap-rte__area th{background:var(--surface-subtle);font-weight:var(--weight-medium)}
.ap-rte__foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px var(--space-3);padding:6px var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .ap-rte__tool{height:36px;padding:0 10px}
  .ap-rte__area,.ap-rte__src{min-height:180px}
}
`;
