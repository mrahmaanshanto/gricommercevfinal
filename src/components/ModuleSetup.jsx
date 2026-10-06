'use client';
// ModuleSetup — an area's setup checklist on its main page (lib/moduleSetup.js): "Set up Inventory · 1 of 3 done" with
// each step and a Start button, until every step is done. Then it folds into one line ("Inventory is set up") that
// opens the steps again. Hide puts it away for this area (kept in this browser). Read after mount, so the first
// render matches the server (nothing).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { currentEditionId } from '@/lib/edition';
import { setupFor, SETUP_REFRESH } from '@/lib/moduleSetup';

const HIDDEN = 'gc.setup.hidden';
const readHidden = () => { try { return JSON.parse(window.localStorage.getItem(HIDDEN)) || {}; } catch { return {}; } };

const CSS = `
.ms-card .ix-card__head span{font-size:var(--text-xs);color:var(--text-muted)}
.ms-bar{height:6px;margin-bottom:var(--space-2);border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.ms-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.ms-step{display:flex;align-items:center;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading)}
.ms-step:first-child{border-top:0}
.ms-step>svg{flex:none;color:var(--text-muted)}
.ms-step.is-done>svg{color:var(--text-success)}
.ms-step.is-done .ms-t{color:var(--text-muted);text-decoration:line-through}
.ms-t{flex:1;min-width:0}
.ms-done{display:flex;align-items:center;gap:var(--space-2);min-height:40px;padding:0 var(--space-4);font-size:var(--text-sm);color:var(--text-body)}
.ms-done>svg{color:var(--text-success);flex:none}
.ms-done button{margin-left:auto}
`;

export function ModuleSetup({ area }) {
  const [s, setS] = useState(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const read = () => { setS(setupFor(area, currentEditionId())); setHidden(!!readHidden()[area]); };
    read();
    SETUP_REFRESH.forEach((e) => window.addEventListener(e, read));
    return () => SETUP_REFRESH.forEach((e) => window.removeEventListener(e, read));
  }, [area]);
  if (!s || hidden) return null;
  const hide = () => { try { window.localStorage.setItem(HIDDEN, JSON.stringify({ ...readHidden(), [area]: true })); } catch { /* ignore */ } setHidden(true); };
  const all = s.done === s.total;
  if (all && !open) {
    return (
      <section className="ix-card ms-card" aria-label={`${s.title} setup`}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ms-done"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>{s.title} is set up · {s.total} of {s.total} steps</span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setOpen(true)}>Show</button><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={hide}>Hide</button></div>
      </section>
    );
  }
  return (
    <section className="ix-card ms-card" aria-labelledby={'ms-h-' + area}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="ix-card__head"><h2 id={'ms-h-' + area}>Set up {s.title}</h2><span>{s.done} of {s.total} done</span></header>
      <div className="ix-card__body">
        <div className="ms-bar" aria-hidden="true"><i style={{ width: `${Math.round((s.done / s.total) * 100)}%` }} /></div>
        <div>
          {s.steps.map((st) => (
            <div key={st.id} className={'ms-step' + (st.ok ? ' is-done' : '')}>
              <Icon name={st.ok ? 'circle-check' : 'circle'} width="18" height="18" aria-hidden="true" />
              <span className="ms-t">{st.label}{st.ok ? <span className="sr-only"> (done)</span> : null}</span>
              {st.ok ? null : <Link href={st.href} className="ix-btn ix-btn--sm">Start</Link>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {all ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setOpen(false)}>Fold</button> : null}
          <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={hide}>Hide</button>
        </div>
      </div>
    </section>
  );
}
