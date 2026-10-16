'use client';
// EmailStudio — the designed-email editor (Batch B step 1), shared by the shop (/email-editor) and super admin
// (/admin/email-editor). Left: language (English / Bangla), subject, preview line and the email's parts (heading, text,
// button, order table, product cards, coupon, tracking box, details, picture, divider, space): add, pick, change, move,
// remove; the {{variables}} go into the field you were typing in. Right: the email as it will look, on a computer
// (600 px) or a phone, light or dark, filled with sample values (lib/email/emailKit.js › renderEmail).
//   props: value { en: { subject, preheader, blocks }, bn: { … } } · onChange(value) · design · vars [[key, label, sample]]
//          sample { key: value } · data (order lines, products) · kind 'service' | 'offer' · locked (read only)

import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { BLOCK_TYPES, blockType, newBlock, renderEmail, previewHtml, emailProblem, SAMPLE_DATA } from '@/lib/email/emailKit';

export const EMAIL_STUDIO_CSS = `
.es{display:grid;grid-template-columns:minmax(320px,400px) minmax(0,1fr);gap:var(--space-3);min-height:0;flex:1}
.es-panel{display:flex;flex-direction:column;min-height:0;border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.es-scroll{flex:1;min-height:0;overflow-y:auto;padding:var(--space-3) var(--space-4) var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)}
.es-langs{display:flex;gap:4px;padding:var(--space-2) var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.es-langs button{min-height:40px;padding:0 var(--space-3);border:0;border-bottom:2px solid transparent;background:none;color:var(--text-muted);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.es-langs button[aria-selected="true"]{color:var(--primary);border-bottom-color:var(--primary)}
.es-field{display:flex;flex-direction:column;gap:4px}
.es-blocks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.es-blk{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:2px var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.es-blk.is-on{border-color:var(--primary);background:var(--primary-50)}
.es-blk>button.es-blk__b{display:flex;align-items:center;gap:var(--space-2);flex:1;min-width:0;min-height:40px;padding:0;border:0;background:none;font:inherit;text-align:left;color:var(--text-heading);cursor:pointer}
.es-blk__b span{display:flex;flex-direction:column;min-width:0}
.es-blk__b b{font-size:var(--text-sm);font-weight:var(--weight-medium)}
.es-blk__b small{font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.es-ico{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.es-add{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.es-add button{display:flex;align-items:center;gap:6px;min-height:40px;padding:0 var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);cursor:pointer}
.es-add button:hover{border-color:var(--primary)}
.es-sub{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.es-vars{display:flex;flex-wrap:wrap;gap:4px}
.es-vars button{min-height:32px;padding:0 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.es-edit{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--primary);border-radius:var(--radius-lg)}
.es-edit__head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.es-view{display:flex;flex-direction:column;min-height:0;gap:var(--space-2)}
.es-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.es-subj{flex:1;min-width:200px;font-size:var(--text-sm);color:var(--text-body);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.es-subj b{color:var(--text-heading)}
.es-frame{flex:1;min-height:480px;display:flex;justify-content:center;overflow:auto;border-radius:var(--radius-xl);background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.es-frame iframe{border:0;background:#fff;height:100%;min-height:640px}
.es-problem{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
@media (max-width:1023px){.es{grid-template-columns:minmax(0,1fr)}.es-frame{min-height:560px}}
`;

const summary = (b) => {
  if (b.type === 'heading' || b.type === 'text') return String(b.text || '').split('\n')[0];
  if (b.type === 'button') return b.label + ' → ' + b.url;
  if (b.type === 'order' || b.type === 'products' || b.type === 'coupon') return b.title || b.code || '';
  if (b.type === 'info') return String(b.rows || '').split('\n').join(' · ');
  if (b.type === 'image') return b.src || 'No picture yet';
  if (b.type === 'tracking') return 'Courier, tracking ID' + (b.url ? ', link' : '');
  return '';
};

export function EmailStudio({ value, onChange, design, vars = [], sample = {}, data = SAMPLE_DATA, kind = 'service', locked = false }) {
  const [lang, setLang] = useState('en');
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [device, setDevice] = useState('computer');
  const [dark, setDark] = useState(false);
  const focus = useRef({ id: '', key: '', el: null });
  const cur = value[lang] || { subject: '', preheader: '', blocks: [] };
  const set = (patch) => onChange({ ...value, [lang]: { ...cur, ...patch } });
  const setBlocks = (blocks) => set({ blocks });
  const blk = cur.blocks.find((b) => b.id === sel) || null;
  const patchBlock = (p) => setBlocks(cur.blocks.map((b) => (b.id === sel ? { ...b, ...p } : b)));
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= cur.blocks.length) return; const l = cur.blocks.slice(); [l[i], l[j]] = [l[j], l[i]]; setBlocks(l); };
  const add = (type) => { const b = newBlock(type); const at = blk ? cur.blocks.indexOf(blk) + 1 : cur.blocks.length; const l = cur.blocks.slice(); l.splice(at, 0, b); setBlocks(l); setSel(b.id); setAdding(false); };
  const insert = (k) => {
    const f = focus.current;
    const tok = `{{${k}}}`;
    if (f.id === '__subject' || f.id === '__pre') {
      const key = f.id === '__subject' ? 'subject' : 'preheader';
      const v = cur[key] || ''; const at = f.el && f.el.selectionStart != null ? f.el.selectionStart : v.length;
      set({ [key]: v.slice(0, at) + tok + v.slice(at) }); return;
    }
    let b = cur.blocks.find((x) => x.id === f.id);
    let key = f.key; let el = f.el;
    // nothing typed in yet: the picked part's first text field, at its end
    if (!b && blk) { const tf = (blockType(blk.type) || { fields: [] }).fields.find((x) => x[2] === 'text' || x[2] === 'area'); if (tf) { b = blk; key = tf[0]; el = null; } }
    if (!b || !key) return;
    const v = String(b[key] || ''); const at = el && el.selectionStart != null ? el.selectionStart : v.length;
    setBlocks(cur.blocks.map((x) => (x.id === b.id ? { ...x, [key]: v.slice(0, at) + (at && v[at - 1] !== ' ' && !el ? ' ' : '') + tok + v.slice(at) } : x)));
  };
  const onFocus = (id, key) => (e) => { focus.current = { id, key, el: e.target }; };
  const html = useMemo(() => previewHtml(renderEmail({ design, blocks: cur.blocks, vars: sample, data, lang, dark, preheader: cur.preheader, subject: cur.subject, kind }), dark), [design, cur, sample, data, lang, dark, kind]);
  const subjectShown = String(cur.subject || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (sample[k] != null ? sample[k] : m));
  const problem = emailProblem(cur);
  const T = blk ? blockType(blk.type) : null;

  return (
    <div className="es">
      <aside className="es-panel" aria-label="Email content">
        <div className="es-langs" role="tablist" aria-label="Language">
          {[['en', 'English'], ['bn', 'বাংলা']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={lang === k} onClick={() => { setLang(k); setSel(null); }}>{l}</button>)}
        </div>
        <div className="es-scroll">
          <div className="es-field"><label className="gc-label" htmlFor="es-subj">Subject</label><input id="es-subj" className="gc-input" value={cur.subject} readOnly={locked} onFocus={onFocus('__subject', 'subject')} onChange={(e) => set({ subject: e.target.value })} /></div>
          <div className="es-field"><label className="gc-label" htmlFor="es-pre">Preview line <small className="sfb-muted">shown after the subject in the inbox</small></label><input id="es-pre" className="gc-input" value={cur.preheader || ''} readOnly={locked} onFocus={onFocus('__pre', 'preheader')} onChange={(e) => set({ preheader: e.target.value })} /></div>
          {problem ? <p className="es-problem" role="status">{problem}</p> : null}
          {lang === 'bn' && !locked ? <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => onChange({ ...value, bn: JSON.parse(JSON.stringify(value.en)) })}>Copy the English version here</button> : null}

          <p className="es-sub">Parts of the email</p>
          <ul className="es-blocks">
            {cur.blocks.map((b, i) => { const t = blockType(b.type) || { label: b.type, icon: 'square' }; return (
              <li key={b.id} className={'es-blk' + (sel === b.id ? ' is-on' : '')}>
                <button type="button" className="es-blk__b" onClick={() => { setSel(sel === b.id ? null : b.id); setAdding(false); }}><span className="es-ico" aria-hidden="true"><Icon name={t.icon} width="16" height="16" /></span><span><b>{t.label}</b><small>{summary(b)}</small></span></button>
                {!locked ? <>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move ${t.label} up`} disabled={!i} onClick={() => move(i, -1)}><Icon name="arrow-up" width="16" height="16" /></button>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move ${t.label} down`} disabled={i === cur.blocks.length - 1} onClick={() => move(i, 1)}><Icon name="arrow-down" width="16" height="16" /></button>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${t.label}`} onClick={() => { setBlocks(cur.blocks.filter((x) => x.id !== b.id)); if (sel === b.id) setSel(null); }}><Icon name="trash-2" width="16" height="16" /></button>
                </> : null}
              </li>
            ); })}
          </ul>
          {blk && T ? (
            <div className="es-edit">
              <div className="es-edit__head"><span>{T.label}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setSel(null)}>Done</button></div>
              {!T.fields.length ? <p className="sfb-muted" style={{ margin: 0 }}>Nothing to set.</p> : null}
              {T.fields.map(([k, l, kind2, , ch]) => {
                const id = `es-${blk.id}-${k}`;
                if (kind2 === 'bool') return <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-sm)' }}><input type="checkbox" className="gc-check" checked={!!blk[k]} disabled={locked} onChange={(e) => patchBlock({ [k]: e.target.checked })} />{l}</label>;
                if (kind2 === 'choice') return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><select id={id} className="gc-input gc-select" value={blk[k]} disabled={locked} onChange={(e) => patchBlock({ [k]: e.target.value })}>{ch.map(([v, x]) => <option key={v} value={v}>{x}</option>)}</select></div>;
                if (kind2 === 'area') return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><textarea id={id} className="gc-input" rows={4} value={blk[k] || ''} readOnly={locked} onFocus={onFocus(blk.id, k)} onChange={(e) => patchBlock({ [k]: e.target.value })} /></div>;
                if (kind2 === 'number') return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} className="gc-input" type="number" value={blk[k]} readOnly={locked} onChange={(e) => patchBlock({ [k]: Number(e.target.value) || 0 })} /></div>;
                return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} className="gc-input" value={blk[k] || ''} readOnly={locked} onFocus={onFocus(blk.id, k)} onChange={(e) => patchBlock({ [k]: e.target.value })} /></div>;
              })}
              {['heading', 'text'].includes(blk.type) ? <p className="sfb-muted" style={{ margin: 0 }}>**bold** and [a link](https://…) work in text.</p> : null}
            </div>
          ) : null}
          {!locked ? (adding ? (
            <div className="es-add" role="group" aria-label="Add a part">{BLOCK_TYPES.map((t) => <button key={t.type} type="button" onClick={() => add(t.type)}><Icon name={t.icon} width="16" height="16" aria-hidden="true" />{t.label}</button>)}<button type="button" onClick={() => setAdding(false)}>Cancel</button></div>
          ) : <button type="button" className="ix-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setAdding(true)}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add a part{blk ? ' after this one' : ''}</button>) : null}

          <p className="es-sub">Variables <small>(tap one to put it where you are typing)</small></p>
          <div className="es-vars">{vars.map(([k, l]) => <button key={k} type="button" title={l} disabled={locked} onMouseDown={(e) => e.preventDefault()} onClick={() => insert(k)}>{`{{${k}}}`}</button>)}</div>
        </div>
      </aside>
      <section className="es-view" aria-label="Email preview">
        <div className="es-bar">
          <span className="es-subj" title={subjectShown}><b>{subjectShown || 'No subject'}</b></span>
          <div className="gc-seg" role="group" aria-label="Screen">
            <button type="button" className={'gc-seg__btn' + (device === 'computer' ? ' gc-seg__btn--active' : '')} aria-pressed={device === 'computer'} onClick={() => setDevice('computer')}>Computer</button>
            <button type="button" className={'gc-seg__btn' + (device === 'phone' ? ' gc-seg__btn--active' : '')} aria-pressed={device === 'phone'} onClick={() => setDevice('phone')}>Phone</button>
          </div>
          <div className="gc-seg" role="group" aria-label="Colours">
            <button type="button" className={'gc-seg__btn' + (!dark ? ' gc-seg__btn--active' : '')} aria-pressed={!dark} onClick={() => setDark(false)}>Light</button>
            <button type="button" className={'gc-seg__btn' + (dark ? ' gc-seg__btn--active' : '')} aria-pressed={dark} onClick={() => setDark(true)}>Dark</button>
          </div>
        </div>
        <div className="es-frame"><iframe title="Email preview" srcDoc={html} sandbox="" style={{ width: device === 'phone' ? 375 : 680 }} /></div>
      </section>
    </div>
  );
}
