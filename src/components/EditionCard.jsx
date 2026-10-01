'use client';
// EditionCard — Settings › Subscription & billing: which edition this site is, the modules it includes and the
// ones it doesn't (with the editions that have them). On the full site it also previews an edition
// (src/lib/edition.js › ?edition=); an edition's own site cannot be switched.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { EDITIONS, EDITION_IDS, MODULES, currentEditionId, editionsWith, LOCKED, EDITION_EVENT } from '@/lib/edition';

const CSS = `
.ed-card{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.ed-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:var(--space-3)}
.ed-head h2{margin:0;font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ed-head p{margin:4px 0 0;font-size:var(--text-sm);color:var(--text-muted)}
.ed-mods{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-2)}
.ed-mod{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ed-mod b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ed-mod small{display:block;margin-top:2px;font-size:var(--text-xs);line-height:1.45;color:var(--text-muted)}
.ed-mod.is-off{background:var(--surface-subtle);border-style:dashed}
.ed-mod.is-off b{color:var(--text-muted)}
.ed-ic{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-full);background:var(--fill-success-soft);color:var(--text-success)}
.ed-mod.is-off .ed-ic{background:var(--surface-card);color:var(--text-muted)}
.ed-h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ed-pick{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ed-pick button{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ed-pick button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
@media (max-width:640px){.ed-card{padding:var(--space-4)}.ed-mods{grid-template-columns:minmax(0,1fr)}.ed-pick{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.ed-pick button{flex:none}}
`;

export function EditionCard() {
  const [ed, setEd] = useState(() => (LOCKED ? currentEditionId() : 'full'));
  useEffect(() => { const on = () => setEd(currentEditionId()); on(); window.addEventListener(EDITION_EVENT, on); return () => window.removeEventListener(EDITION_EVENT, on); }, []);
  const E = EDITIONS[ed];
  const inc = E.modules;
  const out = Object.keys(MODULES).filter((k) => !inc.includes(k));
  const preview = (id) => window.location.assign('/merchant-overview?edition=' + id);
  return (
    <section className="ed-card" aria-labelledby="ed-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ed-head">
        <div>
          <h2 id="ed-title">Your edition: {E.short}</h2>
          <p>{E.name} · sells through {E.channels.join(', ')} · {inc.length} of {Object.keys(MODULES).length} modules</p>
        </div>
      </div>
      <h3 className="ed-h3">Included</h3>
      <div className="ed-mods">
        {inc.map((k) => (
          <div key={k} className="ed-mod"><span className="ed-ic"><Icon name="check" width="16" height="16" aria-hidden="true" /></span><span><b>{MODULES[k].label}</b><small>{MODULES[k].desc}</small></span></div>
        ))}
      </div>
      {out.length ? (<>
        <h3 className="ed-h3">Not in this edition</h3>
        <div className="ed-mods">
          {out.map((k) => (
            <div key={k} className="ed-mod is-off"><span className="ed-ic"><Icon name="lock" width="14" height="14" aria-hidden="true" /></span><span><b>{MODULES[k].label}</b><small>In {editionsWith(k).map((e) => EDITIONS[e].short).join(', ')}</small></span></div>
          ))}
        </div>
      </>) : null}
      {!LOCKED ? (<>
        <h3 className="ed-h3">Preview an edition</h3>
        <div className="ed-pick" role="group" aria-label="Preview an edition">
          {EDITION_IDS.map((id) => <button key={id} type="button" aria-pressed={ed === id} onClick={() => preview(id)}>{EDITIONS[id].short}</button>)}
        </div>
      </>) : null}
    </section>
  );
}

/** A small tag with the edition's name (nothing on the full product). `dark` for use on a dark panel. */
export function EditionTag({ dark = false }) {
  const [ed, setEd] = useState(() => (LOCKED ? currentEditionId() : 'full'));
  useEffect(() => { setEd(currentEditionId()); }, []);
  if (ed === 'full') return null;
  return (
    <span style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', height: 26, marginTop: 'var(--space-2)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', background: dark ? 'rgba(255,255,255,.14)' : 'var(--fill-primary-soft)', color: dark ? 'var(--text-on-dark)' : 'var(--primary)' }}>
      {EDITIONS[ed].short}
    </span>
  );
}
