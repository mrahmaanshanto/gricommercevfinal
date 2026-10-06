'use client';
// Shared bits of the Grid AI pages (Knowledge, Behaviour, Test agent, Approvals, Activity): the page frame, a switch,
// a labelled field, and `useLive(read, events)` — read browser data after mount (so the first render matches the
// server) and again when one of the events fires.

import React, { useEffect, useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';

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
.ga-locked{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.ga-row{grid-template-columns:minmax(0,1fr)}}
`;

export function GaFrame({ screen, active, page, css = '', children, after = null }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: GA_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb="Grid AI" page={page} />
          <div className="gc-shell__content"><div className="ix-page">{children}</div></div>
        </main>
      </div>
      {after}
    </div>
  );
}

export function Switch({ on, onToggle, label, disabled }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" disabled={disabled} onClick={(e) => { e.stopPropagation(); onToggle(); }}><span className="gc-switch__knob" /></button>;
}

export function Field({ label, optional, help, children, htmlFor }) {
  return (
    <div className="ga-field">
      <label className="gc-label" htmlFor={htmlFor}>{label}{optional ? <span className="ga-opt"> (optional)</span> : null}</label>
      {children}
      {help ? <p className="gc-help">{help}</p> : null}
    </div>
  );
}

/** Read browser data after mount and again on `events`; `tick` ms re-reads on a timer (processing states). */
export function useLive(read, events = [], tick = 0) {
  const [state, setState] = useState(null);
  useEffect(() => {
    const load = () => setState(read());
    load();
    events.forEach((e) => window.addEventListener(e, load));
    const t = tick ? window.setInterval(load, tick) : null;
    return () => { events.forEach((e) => window.removeEventListener(e, load)); if (t) window.clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}
