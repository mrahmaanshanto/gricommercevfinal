'use client';
// editBridge — the store editor's hands inside the preview frame (Online Store › Editor, /store-editor; Batch A step 7).
// Only with ?preview=1&edit=1: hovering a section outlines it with its name, a click picks it (the editor opens its
// settings) instead of following links, and the editor can point at a section (scroll + outline). Messages:
//   frame → editor  { gcSfPick: '<section id>' | 'header' }
//   editor → frame  { gcSfFocus: '<section id>' | 'header' | '' }
// Sections carry data-sec-id / data-sec-label (sections.jsx); the header area carries data-sec-id="header".

import React, { useEffect, useState } from 'react';
import { isPreview } from '@/lib/storefront/store';

const editing = () => { try { return isPreview() && new URLSearchParams(window.location.search).get('edit') === '1'; } catch { return false; } };
/** The box around an element (display:contents boxes use their children). */
function boxOf(el) {
  if (!el) return null;
  let r = el.getBoundingClientRect();
  if (!r.width && !r.height) {
    const kids = [...el.children].map((c) => c.getBoundingClientRect()).filter((x) => x.width || x.height);
    if (!kids.length) return null;
    const top = Math.min(...kids.map((x) => x.top)); const left = Math.min(...kids.map((x) => x.left));
    const bottom = Math.max(...kids.map((x) => x.bottom)); const right = Math.max(...kids.map((x) => x.right));
    r = { top, left, width: right - left, height: bottom - top };
  }
  return { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
}

export function EditBridge() {
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState(null);   // { box, label }
  const [sel, setSel] = useState(null);
  useEffect(() => { setOn(editing()); }, []);
  useEffect(() => {
    if (!on) return undefined;
    const target = (e) => (e.target && e.target.closest ? e.target.closest('[data-sec-id]') : null);
    const over = (e) => { const t = target(e); setHover(t ? { box: boxOf(t), label: t.getAttribute('data-sec-label') || '', id: t.getAttribute('data-sec-id') } : null); };
    const click = (e) => {
      const t = target(e);
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      const id = t.getAttribute('data-sec-id');
      setSel({ id, box: boxOf(t) });
      try { window.parent.postMessage({ gcSfPick: id, gcSfSelect: id }, window.location.origin); } catch { /* ignore */ }
    };
    const msg = (e) => {
      if (e.origin !== window.location.origin || !e.data || !('gcSfFocus' in e.data)) return;
      const id = e.data.gcSfFocus;
      const el = id ? document.querySelector(`[data-sec-id="${CSS.escape(id)}"]`) : null;
      if (!el) { setSel(null); return; }
      const b = boxOf(el);
      setSel({ id, box: b });
      if (b) window.scrollTo({ top: Math.max(0, b.top - 80), behavior: 'smooth' });
    };
    // boxes follow the page when it reflows (pictures loading, a section changing)
    const refresh = () => {
      setSel((s) => (s ? { ...s, box: boxOf(document.querySelector(`[data-sec-id="${CSS.escape(s.id)}"]`)) } : s));
      setHover(null);
    };
    document.addEventListener('mouseover', over);
    document.addEventListener('click', click, true);
    window.addEventListener('message', msg);
    window.addEventListener('resize', refresh);
    const t = setInterval(refresh, 1200);
    return () => { document.removeEventListener('mouseover', over); document.removeEventListener('click', click, true); window.removeEventListener('message', msg); window.removeEventListener('resize', refresh); clearInterval(t); };
  }, [on]);
  if (!on) return null;
  const B = (b, cls, label) => (b ? <div className={'sfe-box ' + cls} style={{ top: b.top, left: b.left, width: b.width, height: b.height }} aria-hidden="true">{label ? <span>{label}</span> : null}</div> : null);
  return (
    <>
      <style>{`.sfe-box{position:absolute;z-index:2147483000;pointer-events:none;border:2px solid #2563eb;border-radius:var(--radius-sm)}
.sfe-box.is-hover{border-style:dashed;border-color:#60a5fa}
.sfe-box span{position:absolute;left:-2px;top:-24px;padding:2px 8px;border-radius:var(--radius-sm) var(--radius-sm) 0 0;background:#2563eb;color:#fff;font:500 12px/20px system-ui,sans-serif;white-space:nowrap}
.sfe-box.is-hover span{background:#60a5fa}
[data-sec-id]{cursor:pointer}`}</style>
      {hover && (!sel || hover.id !== sel.id) ? B(hover.box, 'is-hover', hover.label) : null}
      {sel ? B(sel.box, 'is-sel', '') : null}
    </>
  );
}
