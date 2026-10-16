'use client';
// The editor for one section field (Online Store › Layouts › a section's Content tab, and the tweak panel on the store):
// text · area · number · bool · choice · category · block · image · video · icon · product · products · list (repeating
// items with their own fields) · slides · banners · faq · offer · custom + values (a custom section and its settings,
// Nayeem's Batch A) · pins (Shop the look: click the picture to drop a pin
// on a product; drag-free, each pin keeps x / y in % of the picture). A field is [key, label, type, default, choices,
// when(s), sub-fields]. FIELDS_CSS is its styling (the panel's own look, not the theme's).

import React, { useRef } from 'react';
import { Icon } from '@/runtime/dc';
import { ICONS, slide } from '@/lib/storefront/layouts';
import { sfId } from '@/lib/storefront/store';
import { flashSales, storeProducts } from '@/lib/storefront/catalog';
import { ImageField } from '@/components/files/FilePicker';
import { FileImg } from '@/components/files/FileParts';
import { BlockPick, CatPick, ProductPick } from './sfShared';
import { getCustoms, getCustom } from '@/lib/storefront/customs';

/** Pins on a picture: click the picture to add one, then pick its product. */
function PinsField({ f, k, set, locked }) {
  const box = useRef(null);
  const pins = f[k] || [];
  const all = storeProducts();
  const setPin = (i, patch) => set({ [k]: pins.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const add = (e) => {
    if (locked || pins.length >= 8) return;
    const r = box.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    set({ [k]: [...pins, { id: sfId('pin'), product: '', x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) }] });
  };
  if (!f.image) return <p className="sfb-muted">Add the picture first, then click on it to place a pin on each product.</p>;
  return (
    <div className="sfb-fields">
      <span className="gc-label">Pins</span>
      <p className="sfb-muted">Click the picture where a product is. Up to 8 pins.</p>
      <div ref={box} className="fx-pins" role="button" tabIndex={0} aria-label="Click to add a pin" onClick={add} onKeyDown={(e) => { if (e.key === 'Enter') { const r = box.current.getBoundingClientRect(); add({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }); } }}>
        <FileImg src={f.image} size="md" alt="" />
        {pins.map((x, i) => <span key={x.id || i} className="fx-pin" style={{ left: x.x + '%', top: x.y + '%' }}>{i + 1}</span>)}
      </div>
      {pins.map((x, i) => (
        <div key={x.id || i} className="le-sub">
          <div className="le-subhead"><span>Pin {i + 1}{x.product ? ' · ' + ((all.find((p) => p.id === x.product) || {}).name || 'Not on sale any more') : ''}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" disabled={locked} onClick={() => set({ [k]: pins.filter((_, j) => j !== i) })}>Remove</button></div>
          <ProductPick id={'fx-pin-' + i} value={x.product || ''} onChange={(v) => setPin(i, { product: v })} />
          <div className="sfb-two">
            <div className="sfb-field"><label className="gc-label" htmlFor={'fx-px-' + i}>Across (%)</label><input id={'fx-px-' + i} type="number" min={0} max={100} className="gc-input" value={x.x} onChange={(e) => setPin(i, { x: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></div>
            <div className="sfb-field"><label className="gc-label" htmlFor={'fx-py-' + i}>Down (%)</label><input id={'fx-py-' + i} type="number" min={0} max={100} className="gc-input" value={x.y} onChange={(e) => setPin(i, { y: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function IconPick({ id, value, onChange }) {
  return (
    <span className="le-iconpick">
      <span className="le-iconpick__now" aria-hidden="true"><Icon name={value || 'circle'} width="18" height="18" /></span>
      <select id={id} className="gc-input gc-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose an icon…</option>
        {ICONS.map((x) => <option key={x} value={x}>{x.replace(/-/g, ' ')}</option>)}
      </select>
    </span>
  );
}

// ---- Content tab: one field ------------------------------------------------------------------------------------------
export function Field({ fd, f, set, locked, variant }) {
  const [k, l, type, , ch] = fd;
  const id = 'le-' + k;
  if (type === 'text') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} className="gc-input" value={f[k] || ''} disabled={locked} onChange={(e) => set({ [k]: e.target.value })} /></div>;
  if (type === 'area') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><textarea id={id} className="gc-input" rows={3} value={f[k] || ''} disabled={locked} onChange={(e) => set({ [k]: e.target.value })} /></div>;
  if (type === 'number') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} type="number" min={1} max={24} className="gc-input" value={f[k]} disabled={locked} onChange={(e) => set({ [k]: Math.max(1, Math.min(24, Number(e.target.value) || 1)) })} /></div>;
  if (type === 'bool') return <div className="le-sw"><span id={id + '-l'}>{l}</span><button type="button" role="switch" className="gc-switch" aria-checked={!!f[k]} aria-labelledby={id + '-l'} disabled={locked} onClick={() => set({ [k]: !f[k] })}><span className="gc-switch__knob" /></button></div>;
  if (type === 'choice') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><select id={id} className="gc-input gc-select" value={f[k]} disabled={locked} onChange={(e) => set({ [k]: e.target.value })}>{ch.map(([v, x]) => <option key={v} value={v}>{x}</option>)}</select></div>;
  if (type === 'category') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><CatPick id={id} value={f[k]} onChange={(x) => set({ [k]: x })} /></div>;
  if (type === 'block') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><BlockPick id={id} value={f[k]} onChange={(x) => set({ [k]: x })} /></div>;
  if (type === 'custom') {
    const list = getCustoms();
    return (
      <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label>
        <select id={id} className="gc-input gc-select" value={f[k] || ''} disabled={locked} onChange={(e) => set({ [k]: e.target.value, values: {} })}><option value="">Choose a custom section…</option>{list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <p className="sfb-muted">{list.length ? <a href="/html-blocks?view=custom">Manage custom sections</a> : <>None yet: make one in <a href="/html-blocks?view=custom">HTML blocks › Custom sections</a>.</>}</p>
      </div>
    );
  }
  if (type === 'values') {
    const c = getCustom(f.custom);
    if (!c || !(c.fields || []).length) return null;
    const vals = f[k] || {};
    const setVal = (key, v) => set({ [k]: { ...vals, [key]: v } });
    return (
      <div className="sfb-fields">
        {c.fields.map((x) => {
          const fid = `le-v-${x.key}`;
          const v = vals[x.key] != null ? vals[x.key] : x.default;
          if (x.type === 'image') return <div key={x.key} className="sfb-field"><span className="gc-label">{x.label || x.key}</span><ImageField id={fid} value={v} label={(x.label || x.key).toLowerCase()} onChange={(nv) => setVal(x.key, nv)} /></div>;
          if (x.type === 'area') return <div key={x.key} className="sfb-field"><label className="gc-label" htmlFor={fid}>{x.label || x.key}</label><textarea id={fid} className="gc-input" rows={3} value={v} onChange={(e) => setVal(x.key, e.target.value)} /></div>;
          if (x.type === 'color') return <div key={x.key} className="sfb-field"><label className="gc-label" htmlFor={fid}>{x.label || x.key}</label><input id={fid} type="color" className="gc-input" value={/^#[0-9a-f]{6}$/i.test(v) ? v : '#000000'} onChange={(e) => setVal(x.key, e.target.value)} style={{ width: 64, padding: 4 }} /></div>;
          return <div key={x.key} className="sfb-field"><label className="gc-label" htmlFor={fid}>{x.label || x.key}</label><input id={fid} className="gc-input" inputMode={x.type === 'number' ? 'decimal' : undefined} placeholder={x.type === 'link' ? '/offers or https://…' : ''} value={v} onChange={(e) => setVal(x.key, e.target.value)} /></div>;
        })}
      </div>
    );
  }
  if (type === 'image') return <div className="sfb-field"><span className="gc-label">{l}</span><ImageField id={id} value={f[k]} label={l.toLowerCase()} onChange={(x) => set({ [k]: x })} /></div>;
  if (type === 'video') {
    return (
      <div className="sfb-field">
        <span className="gc-label">{l}</span>
        <ImageField id={id} accept="video" value={/^gcfile:|\.(mp4|webm)(\?|$)/i.test(f[k] || '') ? f[k] : ''} label="video" onChange={(x) => set({ [k]: x })} />
        <input className="gc-input" aria-label="Or a YouTube link" placeholder="Or a YouTube link" value={/youtu/.test(f[k] || '') ? f[k] : ''} onChange={(e) => set({ [k]: e.target.value.trim() })} />
        <p className="sfb-muted">Plays muted and on repeat. Phones that save data, and people who turn motion off, see the still picture.</p>
      </div>
    );
  }
  if (type === 'pins') return <PinsField f={f} k={k} set={set} locked={locked} />;
  if (type === 'icon') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><IconPick id={id} value={f[k]} onChange={(x) => set({ [k]: x })} /></div>;
  if (type === 'product') return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><ProductPick id={id} value={f[k] || ''} onChange={(x) => set({ [k]: x })} /></div>;
  if (type === 'list') {
    const sub = fd[6] || [];
    const items = f[k] || [];
    const setIt = (i, patch) => set({ [k]: items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
    const moveIt = (i, d) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = items.slice(); [n[i], n[j]] = [n[j], n[i]]; set({ [k]: n }); };
    return (
      <div className="sfb-fields">
        <span className="gc-label">{l}</span>
        {items.map((x, i) => (
          <div key={x.id || i} className="le-sub">
            <div className="le-subhead"><span>{(x.title || x.name || '').slice(0, 28) || l.replace(/s$/, '') + ' ' + (i + 1)}</span>
              <span>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move up" disabled={i === 0} onClick={() => moveIt(i, -1)}><Icon name="arrow-up" width="14" height="14" /></button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move down" disabled={i === items.length - 1} onClick={() => moveIt(i, 1)}><Icon name="arrow-down" width="14" height="14" /></button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ [k]: items.filter((_, j) => j !== i) })}>Remove</button>
              </span>
            </div>
            {sub.map((sf) => <Field key={sf[0]} fd={[sf[0], sf[1], sf[2], '', sf[3]]} f={x} set={(patch) => setIt(i, patch)} locked={locked} />)}
          </div>
        ))}
        {items.length < 12 ? <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ [k]: [...items, { id: sfId('it') }] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add</button> : null}
      </div>
    );
  }
  if (type === 'offer') {
    const sales = flashSales();
    return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><select id={id} className="gc-input gc-select" value={f[k] || ''} onChange={(e) => set({ [k]: e.target.value })}><option value="">The live flash sale (from Marketing)</option>{sales.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>{!sales.length ? <p className="sfb-muted">No flash sale yet: the section stays hidden until Marketing › Flash sales has one.</p> : null}</div>;
  }
  if (type === 'products') {
    const all = storeProducts();
    const picked = f.picked || [];
    return (
      <div className="sfb-field">
        <span className="gc-label">{l}</span>
        <ul className="le-picked">{picked.map((pid) => { const p = all.find((x) => x.id === pid); return <li key={pid}><span>{p ? p.name : 'Not on sale any more'}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove" onClick={() => set({ picked: picked.filter((x) => x !== pid) })}><Icon name="x" width="16" height="16" /></button></li>; })}</ul>
        <ProductPick id={id} value="" onChange={(x) => { if (x && !picked.includes(x)) set({ picked: [...picked, x] }); }} />
      </div>
    );
  }
  if (type === 'slides') {
    const slides = f.slides || [];
    const setSl = (i, patch) => set({ slides: slides.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
    const max = variant === 'video' ? 1 : 5;
    return (
      <div className="sfb-fields">
        {slides.slice(0, max).map((x, i) => (
          <div key={x.id || i} className="le-sub">
            <div className="le-subhead"><span>{variant === 'video' ? 'Text over the video' : 'Slide ' + (i + 1)}</span>{slides.length > 1 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" disabled={locked} onClick={() => set({ slides: slides.filter((_, j) => j !== i) })}>Remove</button> : null}</div>
            <div className="sfb-field"><label className="gc-label" htmlFor={`le-s${i}t`}>Title</label><input id={`le-s${i}t`} className="gc-input" value={x.title} disabled={locked} onChange={(e) => setSl(i, { title: e.target.value })} /></div>
            <div className="sfb-field"><label className="gc-label" htmlFor={`le-s${i}x`}>Text</label><input id={`le-s${i}x`} className="gc-input" value={x.text} disabled={locked} onChange={(e) => setSl(i, { text: e.target.value })} /></div>
            <div className="sfb-two">
              <div className="sfb-field"><label className="gc-label" htmlFor={`le-s${i}b`}>Button</label><input id={`le-s${i}b`} className="gc-input" value={x.button} disabled={locked} onChange={(e) => setSl(i, { button: e.target.value })} /></div>
              <div className="sfb-field"><label className="gc-label" htmlFor={`le-s${i}h`}>Link</label><input id={`le-s${i}h`} className="gc-input" value={x.href} disabled={locked} onChange={(e) => setSl(i, { href: e.target.value })} /></div>
            </div>
            {variant !== 'video' ? <div className="sfb-field"><span className="gc-label">Picture</span><ImageField id={`le-s${i}i`} value={x.image} onChange={(v) => setSl(i, { image: v })} /></div> : null}
            {variant !== 'video' ? <div className="sfb-field"><label className="gc-label" htmlFor={`le-s${i}c`}>Colours</label><select id={`le-s${i}c`} className="gc-input gc-select" value={x.tone} disabled={locked} onChange={(e) => setSl(i, { tone: e.target.value })}><option value="primary">Primary colour</option><option value="dark">Dark</option><option value="soft">Soft</option></select></div> : null}
          </div>
        ))}
        {slides.length < max && !locked ? <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ slides: [...slides, slide('New slide', '', 'Shop now', '/store')] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add a slide</button> : null}
      </div>
    );
  }
  if (type === 'banners') {
    const list = (f.side || []).slice(0, 2);
    const setB = (i, patch) => set({ side: list.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
    return (
      <div className="sfb-fields">
        {list.map((x, i) => (
          <div key={x.id || i} className="le-sub">
            <div className="le-subhead"><span>Banner {i + 1}</span></div>
            <div className="sfb-two">
              <div className="sfb-field"><label className="gc-label" htmlFor={`le-b${i}t`}>Title</label><input id={`le-b${i}t`} className="gc-input" value={x.title || ''} onChange={(e) => setB(i, { title: e.target.value })} /></div>
              <div className="sfb-field"><label className="gc-label" htmlFor={`le-b${i}h`}>Link</label><input id={`le-b${i}h`} className="gc-input" value={x.href || ''} onChange={(e) => setB(i, { href: e.target.value })} /></div>
            </div>
            <div className="sfb-field"><label className="gc-label" htmlFor={`le-b${i}x`}>Short line</label><input id={`le-b${i}x`} className="gc-input" value={x.text || ''} onChange={(e) => setB(i, { text: e.target.value })} /></div>
            <div className="sfb-field"><span className="gc-label">Picture</span><ImageField id={`le-b${i}i`} value={x.image} onChange={(v) => setB(i, { image: v })} /></div>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'faq') {
    const items = f.items || [];
    const setIt = (i, patch) => set({ items: items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
    return (
      <div className="sfb-fields">
        {items.map((x, i) => (
          <div key={i} className="le-sub">
            <div className="le-subhead"><span>Question {i + 1}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>Remove</button></div>
            {variant === 'topics' ? <input className="gc-input" aria-label={`Topic of question ${i + 1}`} value={x.topic || ''} placeholder="Topic, e.g. Delivery" onChange={(e) => setIt(i, { topic: e.target.value })} /> : null}
            <input className="gc-input" aria-label={`Question ${i + 1}`} value={x.q} placeholder="Question" onChange={(e) => setIt(i, { q: e.target.value })} />
            <textarea className="gc-input" aria-label={`Answer ${i + 1}`} rows={2} value={x.a} placeholder="Answer" onChange={(e) => setIt(i, { a: e.target.value })} />
          </div>
        ))}
        <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ items: [...items, { q: '', a: '', topic: variant === 'topics' && items.length ? items[items.length - 1].topic || '' : '' }] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add a question</button>
      </div>
    );
  }
  return null;
}


export const FIELDS_CSS = `
.le-sub{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.le-subhead{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.le-picked{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:var(--text-sm)}
.le-picked li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.le-iconpick{display:flex;align-items:center;gap:8px}
.le-iconpick__now{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--primary)}
.le-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:36px;font-size:var(--text-sm);color:var(--text-heading)}
.fx-pins{position:relative;display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);border-radius:var(--radius-lg);overflow:hidden;cursor:crosshair}
.fx-pins img{width:100%;height:auto;display:block}
.fx-pin{position:absolute;display:grid;place-items:center;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:var(--primary);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-semibold);box-shadow:0 0 0 3px #fff;pointer-events:none}
`;
