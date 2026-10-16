'use client';
// Shared pieces of the storefront builder screens (Online Store › Theme, Theme editor, Header builder, HTML blocks,
// Layouts; Module A): the data hook, the live preview frame (desktop / phone, sends the editor's unsaved copy to the
// store page inside it — lib/storefront/store.js › sendPreview), pickers (image, HTML block, category, product), the
// draft / published badge, the "locked" note and the CSS (classes sfb-*). Front end only.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { StatusBadge, Sheet } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { read, SF_EVENT, sendPreview, docStatus, DOC_STATUS } from '@/lib/storefront/store';
import { ImageField } from '@/components/files/FilePicker';
import { blocksOfType, kindOf } from '@/lib/storefront/blocks';
import { getCategories } from '@/lib/productCategories';
import { allProducts } from '@/lib/products';
import { kitPreviewParts } from '@/lib/storefront/kitStore';

/** The storefront store after mount; re-read on every change. */
export function useSf() {
  const [st, setSt] = useState({ ready: false, d: null, n: 0 });
  useEffect(() => {
    const load = () => setSt((s) => ({ ready: true, d: read(), n: s.n + 1 }));
    load();
    window.addEventListener(SF_EVENT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(SF_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  return st;
}

export const when = (ms) => (ms ? `${formatDate(ms)}, ${formatTime(ms)}` : '—');

export function DocBadge({ doc }) {
  const s = DOC_STATUS[docStatus(doc)];
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}

export function LockNote({ text }) {
  if (!text) return null;
  return <p className="sfb-lock"><Icon name="lock" width="14" height="14" aria-hidden="true" /><span>{text}</span></p>;
}

/** Computer / phone switch (tablet too with `tablet`). */
export function DeviceSwitch({ device, onChange, tablet, compact }) {
  const list = [['desktop', 'monitor', 'Computer'], tablet ? ['tablet', 'tablet', 'Tablet'] : null, ['phone', 'smartphone', 'Phone']].filter(Boolean);
  return (
    <div className="gc-seg" role="group" aria-label="Preview size">
      {list.map(([k, ic, l]) => <button key={k} type="button" className={'gc-seg__btn' + (device === k ? ' gc-seg__btn--active' : '')} aria-pressed={device === k} aria-label={compact ? l : undefined} title={compact ? l : undefined} onClick={() => onChange(k)}><Icon name={ic} width="16" height="16" aria-hidden="true" />{compact ? null : ' ' + l}</button>)}
    </div>
  );
}

/** A small drawing of a section style (thumbnails in the section library and the style picker). */
export function StyleSketch({ sketch, label }) {
  const parts = sketch || [];
  return (
    <svg className="sfb-sketch" viewBox="0 0 100 62" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="100" height="62" rx="4" className="k-bg" />
      {parts.map(([x, y, w, h, k], i) => {
        if (k === 'img') return <g key={i}><rect x={x} y={y} width={w} height={h} rx="2" className="k-img" /><path d={`M${x + w * 0.18} ${y + h * 0.78} l${w * 0.2} ${-h * 0.28} l${w * 0.14} ${h * 0.16} l${w * 0.16} ${-h * 0.24} l${w * 0.18} ${h * 0.36}`} className="k-mtn" /></g>;
        if (k === 'box') return <rect key={i} x={x} y={y} width={w} height={h} rx="2" className="k-box" />;
        if (k === 'txt') return <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" className="k-txt" />;
        if (k === 'line') return <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" className="k-line" />;
        if (k === 'btn') return <rect key={i} x={x} y={y} width={w} height={h} rx="2" className="k-btn" />;
        if (k === 'tab') return <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} className="k-btn" />;
        if (k === 'chip') return <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} className="k-chip" />;
        if (k === 'circ') return <circle key={i} cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} className="k-img" />;
        if (k === 'card') return <g key={i}><rect x={x} y={y} width={w} height={h} rx="2" className="k-card" /><rect x={x + 3} y={y + h / 2 - 3} width={6} height={6} rx="1.5" className="k-img" /><rect x={x + 12} y={y + h / 2 - 2} width={w - 16} height={3} rx="1.5" className="k-txt" /></g>;
        if (k === 'row') return <g key={i}><rect x={x} y={y} width={w} height={h} rx="2" className="k-card" /><rect x={x + 3} y={y + h / 2 - 1.5} width={w * 0.55} height={3} rx="1.5" className="k-txt" /><path d={`M${x + w - 8} ${y + h / 2 - 1.5} l2 2 l2 -2`} className="k-chev" /></g>;
        if (k === 'play') return <g key={i}><circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} className="k-play" /><path d={`M${x + w / 2 - 1.8} ${y + h / 2 - 3} l5 3 l-5 3 z`} className="k-playi" /></g>;
        if (k === 'dots') return <g key={i}>{[0, 1, 2].map((j) => <circle key={j} cx={x + j * 4 + 2} cy={y + h / 2} r={j ? 1.2 : 1.6} className="k-dot" />)}</g>;
        return null;
      })}
    </svg>
  );
}

/**
 * A store page in a frame, scaled to fit: 1280 px wide for a computer, 390 px for a phone. parts: [[part, value]] —
 * the editor's unsaved copies, sent whenever they change and whenever the page inside (re)loads. height: px or 'fill'.
 */
export function PreviewFrame({ src, device = 'desktop', parts = [], height = 640, title = 'Store preview', onMessage }) {
  const box = useRef(null);
  const frame = useRef(null);
  const [w, setW] = useState(0);
  const [fillH, setFillH] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const fit = () => { setW(el.clientWidth); setFillH(el.clientHeight); };
    fit();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const key = JSON.stringify(parts);
  const send = useCallback(() => { (parts || []).forEach(([part, value]) => sendPreview(frame.current, part, value)); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { send(); }, [send]);
  useEffect(() => {
    const on = (e) => {
      if (e.origin !== window.location.origin || !e.data || !frame.current || e.source !== frame.current.contentWindow) return;
      if (e.data.gcSfReady) send();
      else if (onMessage) onMessage(e.data);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [send, onMessage]);
  const base = device === 'phone' ? 390 : device === 'tablet' ? 820 : 1280;
  const scale = w ? Math.min(1, w / base) : 1;
  const fill = height === 'fill';
  const h = fill ? fillH || 600 : typeof height === 'number' ? height : 640;
  return (
    <div ref={box} className={'sfb-frame' + (device === 'phone' || device === 'tablet' ? ' is-phone' : '')} style={{ height: fill ? '100%' : h }}>
      {w ? <iframe ref={frame} src={src} title={title} onLoad={send} style={{ width: base + 'px', height: Math.round(h / scale) + 'px', transform: `scale(${scale})` }} /> : null}
    </div>
  );
}

/** A store design file (a kit) live over the shop's own products, in a side panel. footer: the panel's buttons. */
export function KitPreviewSheet({ kit, title, onClose, footer, note }) {
  const [device, setDevice] = useState('desktop');
  const [page, setPage] = useState('/store');
  const parts = useMemo(() => kitPreviewParts(kit), [kit]);
  return (
    <Sheet open title={title} onClose={onClose} footer={footer}>
      <style>{SFB_CSS}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <select className="gc-input gc-select" aria-label="Page to preview" value={page} onChange={(e) => setPage(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="/store">Home</option>
          <option value="/category?handle=phones">Category page</option>
          <option value="/product?handle=galaxy-a15-6-128gb">Product page</option>
          <option value="/cart">Cart</option>
        </select>
        <DeviceSwitch device={device} onChange={setDevice} />
      </div>
      <PreviewFrame src={page + (page.includes('?') ? '&' : '?') + 'preview=1'} device={device} parts={parts} height={560} title={title} />
      {note ? <p className="sfb-muted" style={{ marginTop: 8 }}>{note}</p> : null}
    </Sheet>
  );
}

// ---- pickers ------------------------------------------------------------------------------------------------------
/** A picture from Settings › Files (upload, the library or a web address). Same props as before. */
export function ImagePick({ id, value, onChange, allowNone = true, folder = 'sections' }) {
  return <ImageField id={id} value={value} onChange={onChange} allowNone={allowNone} folder={folder} />;
}
export function BlockPick({ id, value, onChange, type }) {
  const list = blocksOfType(type);
  return (
    <select id={id} className="gc-input gc-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose a block…</option>
      {list.map((b) => <option key={b.id} value={b.id}>{b.name} · {kindOf(b.type).label}</option>)}
    </select>
  );
}
export function CatPick({ id, value, onChange, top }) {
  let cats = [];
  try { cats = getCategories(); } catch { cats = []; }
  return (
    <select id={id} className="gc-input gc-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose a category…</option>
      {cats.filter((c) => !top || c.lv === 0).map((c) => <option key={c.id} value={c.path}>{c.path}</option>)}
    </select>
  );
}
export function ProductPick({ id, value, onChange }) {
  let list = [];
  try { list = allProducts().filter((p) => p.st === 'active'); } catch { list = []; }
  return (
    <select id={id} className="gc-input gc-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose a product…</option>
      {list.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}

export const SFB_CSS = `
.sfb-lock{display:flex;align-items:flex-start;gap:6px;margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-muted);font-size:var(--text-xs)}
.sfb-lock svg{flex:none;margin-top:2px}
.sfb-frame{position:relative;width:100%;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.sfb-frame iframe{display:block;border:0;transform-origin:top left;background:#fff}
.sfb-frame.is-phone{display:flex;justify-content:center}
.sfb-frame.is-phone iframe{transform-origin:top center;flex:none;border-left:1px solid var(--border-subtle);border-right:1px solid var(--border-subtle)}
.sfb-imgpick{display:flex;flex-direction:column;gap:var(--space-2)}
.sfb-thumb{width:120px;height:72px;object-fit:cover;border-radius:var(--radius-lg);border:1px solid var(--border-subtle)}
.sfb-field{display:flex;flex-direction:column;gap:6px}
.sfb-fields{display:flex;flex-direction:column;gap:var(--space-4)}
.sfb-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:36px}
.sfb-row>label,.sfb-row>span{font-size:var(--text-sm);color:var(--text-heading)}
.sfb-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-3)}
.sfb-muted{color:var(--text-muted);font-size:var(--text-xs);margin:0}
.sfb-swatch{display:flex;align-items:center;gap:var(--space-2)}
.sfb-swatch input[type="color"]{width:40px;height:32px;padding:0;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:none;cursor:pointer}
.sfb-swatch .gc-input{font-family:var(--font-data);max-width:120px}
.sfb-warn{display:flex;gap:6px;align-items:flex-start;margin:0;font-size:var(--text-xs);color:var(--text-warning)}
.sfb-warn svg{flex:none;margin-top:2px}
.sfb-sketch{display:block;width:100%;height:auto}
.sfb-sketch .k-bg{fill:var(--surface-card)}
.sfb-sketch .k-img{fill:color-mix(in srgb,var(--primary) 22%,var(--surface-card))}
.sfb-sketch .k-mtn{fill:none;stroke:color-mix(in srgb,var(--primary) 45%,var(--surface-card));stroke-width:1.4;stroke-linejoin:round}
.sfb-sketch .k-box{fill:color-mix(in srgb,var(--primary) 8%,var(--surface-card))}
.sfb-sketch .k-txt{fill:var(--text-heading);opacity:.75}
.sfb-sketch .k-line{fill:var(--text-muted);opacity:.45}
.sfb-sketch .k-btn{fill:var(--primary)}
.sfb-sketch .k-chip{fill:none;stroke:var(--text-muted);stroke-width:.8;opacity:.7}
.sfb-sketch .k-card{fill:var(--surface-card);stroke:var(--border-strong);stroke-width:.6}
.sfb-sketch .k-chev{fill:none;stroke:var(--text-muted);stroke-width:.9}
.sfb-sketch .k-play{fill:var(--primary)}
.sfb-sketch .k-playi{fill:var(--surface-card)}
.sfb-sketch .k-dot{fill:var(--surface-card)}
@media (max-width:640px){.sfb-two{grid-template-columns:minmax(0,1fr)}}
`;
