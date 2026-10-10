'use client';
// Shared parts of the GridAI admin pages (Training, Test chat, Behaviour, Performance), copied from the merchant
// panel's Grid AI screens (screens/gridai/gaShared.jsx) and adapted: the page CSS, a switch, a labelled field, the
// loading outline, the chat bubbles (the look of components/ui/GridAi.jsx), `useGridAi()` (the admin store, redrawn
// every second while something is indexing or crawling), `useTab()` (?tab= in the address) and the FAQ editor sheet.
// Data: lib/admin/gridai.js only — never the merchant panel's lib/gridai.

import React, { useEffect, useReducer, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sheet } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { useAdminStore } from '@/lib/admin/store';
import { gridai, isPending, saveFaq, FAQ_TOPICS } from '@/lib/admin/gridai';

export const GA_CSS = `
.ga-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.ga-field>.gc-label{margin:0}
.ga-field .gc-help{margin:0}
.ga-field .gc-input{width:100%;min-width:0}
.ga-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.ga-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.ga-area{min-height:84px;padding-top:10px;padding-bottom:10px;resize:vertical;line-height:1.5}
.ga-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:44px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading)}
.ga-sw:first-child{border-top:0}
.ga-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ga-body{display:grid;gap:var(--space-4);padding:var(--space-4)}
.ga-bn{font-family:var(--font-bn)}
.ga-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ga-skel{height:280px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:ga-sk 1.4s ease infinite}
.ga-skel--strip{height:72px}
@keyframes ga-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.ga-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.ga-name{padding:0;border:0;background:none;font:inherit;font-weight:var(--weight-medium);color:var(--text-heading);text-align:left;cursor:pointer}
.ga-name:hover{color:var(--primary);text-decoration:underline}
.ga-name:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.ga-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ga-ico{display:grid;flex:none;place-items:center;width:32px;height:32px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-body)}
.ga-src{display:flex;align-items:center;gap:10px;min-width:0;max-width:420px}
.ga-src>span:last-child{display:flex;flex-direction:column;min-width:0}
.ga-src .ga-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.ga-off td{color:var(--text-muted)}
.ga-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);width:100%}
.ga-foot>.ga-left{margin-right:auto}
.ga-note{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-body)}
.ga-note.is-error{background:var(--fill-error-soft);color:var(--text-danger)}
.ga-note.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.ga-badges{display:inline-flex;flex-wrap:wrap;gap:6px;align-items:center}
/* chat bubbles (the look of the GridAI panel) */
.ga-log{display:flex;flex-direction:column;gap:var(--space-2)}
.ga-msg{display:flex;flex-direction:column;gap:4px;max-width:85%}
.ga-msg--user{align-self:flex-end;align-items:flex-end}
.ga-msg--ai,.ga-msg--staff{align-self:flex-start}
.ga-bubble{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:var(--text-sm-lh);white-space:pre-wrap;overflow-wrap:anywhere}
.ga-msg--user .ga-bubble{background:var(--primary);color:#fff}
.ga-msg--ai .ga-bubble{background:var(--surface-subtle);color:var(--text-heading)}
.ga-msg--staff .ga-bubble{background:var(--fill-primary-soft);color:var(--text-heading)}
.ga-msg.is-wrong .ga-bubble{box-shadow:inset 0 0 0 1.5px var(--error)}
.ga-who{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.ga-who b{font-weight:var(--weight-medium);color:var(--text-body)}
@media (max-width:640px){.ga-row{grid-template-columns:minmax(0,1fr)}.ga-msg{max-width:92%}}
@media (prefers-reduced-motion:reduce){.ga-skel{animation:none}}
`;

/** The GridAI store in a component; ticks every second while a file is indexing or a site crawling. */
export function useGridAi() {
  const s = useAdminStore(gridai);
  const [, force] = useReducer((x) => x + 1, 0);
  const busy = s.live && isPending(s.data, s.t);
  useEffect(() => {
    if (!busy) return undefined;
    const id = window.setInterval(force, 1000);
    return () => window.clearInterval(id);
  }, [busy]);
  return s;
}

/** The page's view in ?tab= (read after mount, written with replaceState). */
export function useTab(def, keys) {
  const [tab, setTab] = useState(def);
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('tab');
    if (v && keys.includes(v)) setTab(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const set = (v) => {
    setTab(v);
    try {
      const u = new URL(window.location.href);
      if (v === def) u.searchParams.delete('tab'); else u.searchParams.set('tab', v);
      window.history.replaceState(window.history.state, '', u.pathname + u.search);
    } catch { /* ignore */ }
  };
  return [tab, set];
}

export function Switch({ on, onToggle, label, disabled }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" disabled={disabled} onClick={(e) => { e.stopPropagation(); onToggle(); }}><span className="gc-switch__knob" /></button>;
}

export function Field({ label, optional, help, children, htmlFor, error }) {
  return (
    <div className="ga-field">
      <label className="gc-label" htmlFor={htmlFor}>{label}{optional ? <span className="ga-opt"> (optional)</span> : null}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" role="alert">{error}</p> : help ? <p className="gc-help">{help}</p> : null}
    </div>
  );
}

export function Skeleton({ label }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label}>
      <div className="ga-skel ga-skel--strip" />
      <div className="ga-skel" />
    </div>
  );
}

export function ErrorCard({ text, onRetry }) {
  return (
    <section className="ix-card"><div className="ga-err" role="alert">
      <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
      <p style={{ margin: 0 }}>{text}</p>
      <button type="button" className="ix-btn" onClick={onRetry}>Try again</button>
    </div></section>
  );
}

/** Add or edit an FAQ, English and Bangla. `faq`: { id?, q, a, qBn, aBn, topic, fromUnanswered } or null (closed). */
export function FaqSheet({ faq, onClose, onSaved, title }) {
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});
  useEffect(() => { setF(faq ? { q: '', a: '', qBn: '', aBn: '', topic: 'Other', ...faq } : null); setErr({}); }, [faq]);
  const put = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErr({}); };
  const save = () => {
    const res = saveFaq(f);
    if (!res.ok) { setErr({ [res.field || 'q']: res.error }); return; }
    toast(f.id ? 'FAQ saved. GridAI uses it from the next message.' : 'FAQ added. GridAI uses it from the next message.');
    if (onSaved) onSaved(res.id);
    onClose();
  };
  return (
    <Sheet open={!!f} title={title || (f && f.id ? 'Edit FAQ' : 'Add FAQ')} onClose={onClose}
      footer={f ? <div className="ga-foot"><span className="ga-left" /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Save</button></div> : null}>
      {f ? (
        <div className="ga-body" style={{ padding: 0 }}>
          <Field label="Topic" htmlFor="faq-topic">
            <select id="faq-topic" className="gc-input gc-select" value={f.topic} onChange={put('topic')}>{FAQ_TOPICS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          </Field>
          <Field label="Question (English)" htmlFor="faq-q" error={err.q}>
            <input id="faq-q" className={'gc-input' + (err.q ? ' gc-input--error' : '')} value={f.q} onChange={put('q')} placeholder="For example: Can I take bKash payments?" autoFocus={!f.q} />
          </Field>
          <Field label="Answer (English)" htmlFor="faq-a" error={err.a}>
            <textarea id="faq-a" className={'gc-input ga-area' + (err.a ? ' gc-input--error' : '')} rows={4} value={f.a} onChange={put('a')} autoFocus={!!f.q} />
          </Field>
          <Field label="প্রশ্ন (Bangla question)" optional htmlFor="faq-qbn">
            <input id="faq-qbn" lang="bn" className="gc-input ga-bn" value={f.qBn} onChange={put('qBn')} />
          </Field>
          <Field label="উত্তর (Bangla answer)" optional htmlFor="faq-abn" error={err.aBn} help="GridAI answers in Bangla when the person writes in Bangla.">
            <textarea id="faq-abn" lang="bn" className={'gc-input ga-area ga-bn' + (err.aBn ? ' gc-input--error' : '')} rows={4} value={f.aBn} onChange={put('aBn')} />
          </Field>
        </div>
      ) : null}
    </Sheet>
  );
}

/** One chat message: { r: 'user' | 'ai' | 'staff', text, at }. */
export function Bubble({ m, name, time, wrong, children }) {
  return (
    <div className={'ga-msg ga-msg--' + m.r + (wrong ? ' is-wrong' : '')}>
      <span className="ga-who">{m.r === 'ai' ? <Icon name="sparkles" width="12" height="12" aria-hidden="true" /> : null}<b>{name}</b>{time ? <span>{time}</span> : null}</span>
      <p className="ga-bubble" lang={/[ঀ-৿]/.test(m.text) ? 'bn' : undefined}>{m.text}</p>
      {children}
    </div>
  );
}

export const pct = (x) => (x == null ? '—' : Math.round(x * 100) + '%');
