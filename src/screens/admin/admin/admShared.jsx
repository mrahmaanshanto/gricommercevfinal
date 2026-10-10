'use client';
// Shared parts of the Administration pages (Activity log, Roles & permissions, Security, Settings): the page CSS, a
// switch, a labelled field, a card head, the loading outline, a person chip, the unsaved-changes bar, `useAdmin()`
// (platform data + the `admin` store, ready once both have loaded) and `useTab()` (?tab= in the address).
// Data: lib/admin/admin.js and lib/platform (read only here).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { useAdminStore } from '@/lib/admin/store';
import { admin } from '@/lib/admin/admin';
import { usePlatform } from '../AdminShell';

export const ADX_CSS = `
.adx-body{display:grid;gap:var(--space-4);padding:var(--space-4)}
.adx-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.adx-field>.gc-label{margin:0}
.adx-field .gc-help{margin:0}
.adx-field .gc-input{width:100%;min-width:0}
.adx-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.adx-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.adx-row--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.adx-area{min-height:72px;padding-top:10px;padding-bottom:10px;resize:vertical;line-height:1.5}
.adx-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:44px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading)}
.adx-sw:first-child{border-top:0}
.adx-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.adx-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.adx-head h2{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.adx-head__acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.adx-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.adx-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.adx-skel{height:300px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:adx-sk 1.4s ease infinite}
.adx-skel--strip{height:64px}
@keyframes adx-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.adx-skel{animation:none}}
.adx-person{display:inline-flex;align-items:center;gap:8px;min-width:0}
.adx-av{display:grid;flex:none;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.adx-person>span:last-child{display:flex;flex-direction:column;min-width:0}
.adx-person b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.adx-person small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.adx-note{display:flex;align-items:flex-start;gap:8px;margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);line-height:1.5;color:var(--text-body)}
.adx-note svg{flex:none;margin-top:1px;color:var(--text-muted)}
.adx-note.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.adx-note.is-warn svg{color:currentColor}
.adx-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.adx-list>li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.adx-list>li:first-child{border-top:0}
.adx-list>li>span{flex:1;min-width:0}
.adx-list small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.adx-save{position:sticky;bottom:calc(12px + var(--host-badge, 0px));z-index:20;display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3) var(--space-2) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg);font-size:var(--text-sm);color:var(--text-heading)}
.adx-save>span{margin-right:auto;display:flex;align-items:center;gap:8px}
.adx-form{display:flex;flex-direction:column;gap:var(--space-3)}
.adx-form p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.adx-link{padding:0;border:0;background:none;font:inherit;font-weight:var(--weight-medium);color:var(--text-heading);text-align:left;cursor:pointer}
.adx-link:hover{color:var(--primary);text-decoration:underline}
.adx-link:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.adx-chips{display:flex;flex-wrap:wrap;gap:6px}
.adx-chips button{min-height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.adx-chips button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.adx-chips button:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.ix-table tbody tr.adx-click{cursor:pointer}
.ix-table tbody tr.adx-click:focus-visible td{background:var(--surface-subtle)}
.ix-table tbody tr.adx-click:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
@media (max-width:767px){.adx-row,.adx-row--3{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.adx-chips button{min-height:36px}.adx-body{padding:var(--space-3)}}
`;

/** Platform data and the admin store; `live` once both are loaded in the browser. */
export function useAdmin() {
  const p = usePlatform();
  const s = useAdminStore(admin);
  return { pdb: p.db, d: s.data, t: p.t, live: p.live && s.live };
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
    <div className="adx-field">
      <label className="gc-label" htmlFor={htmlFor}>{label}{optional ? <span className="adx-opt"> (optional)</span> : null}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" role="alert">{error}</p> : help ? <p className="gc-help">{help}</p> : null}
    </div>
  );
}

export function CardHead({ id, title, tip, children }) {
  return <div className="adx-head"><h2 id={id}>{title}{tip}</h2>{children ? <div className="adx-head__acts">{children}</div> : null}</div>;
}

export function Skeleton({ label }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label}>
      <div className="adx-skel adx-skel--strip" />
      <div className="adx-skel" />
    </div>
  );
}

export function Person({ p, sub }) {
  if (!p) return <span className="ix-muted">—</span>;
  return (
    <span className="adx-person">
      <span className="adx-av" style={{ background: p.color || 'var(--slate-500)' }} aria-hidden="true">{p.ini}</span>
      <span><b>{p.name}</b>{sub ? <small>{sub}</small> : null}</span>
    </span>
  );
}

export function Note({ warn, children }) {
  return <p className={'adx-note' + (warn ? ' is-warn' : '')}><Icon name={warn ? 'triangle-alert' : 'info'} width="14" height="14" aria-hidden="true" /><span>{children}</span></p>;
}

export function SaveBar({ onSave, onDiscard, label = 'Unsaved changes' }) {
  return (
    <div className="adx-save" role="region" aria-label={label}>
      <span><Icon name="circle-dot" width="14" height="14" aria-hidden="true" />{label}</span>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onDiscard}>Discard</button>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onSave}>Save</button>
    </div>
  );
}

export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
export const clone = (x) => JSON.parse(JSON.stringify(x));
