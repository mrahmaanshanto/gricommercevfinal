'use client';
// Grid Partners › Settings (/admin/partners/settings; Batch E): the minimum standards a creator must meet before approval
// (followers by type, number of samples, phone checked with a code, ID checked, a rate card), the niches and cities
// creators pick from, and a link to who may use Grid Partners (Services › Access?m=partners). Data: lib/platform/partners.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { settings, saveSettings, TYPES } from '@/lib/platform/partners';
import { AdminShell } from '../AdminShell';
import { usePartners, PT_CSS, say } from '@/screens/partners/partnerShared';
import { PTA_CSS } from './ptAdmin';

function ListEditor({ id, label, items, onChange }) {
  const [v, setV] = useState('');
  const add = () => { const x = v.trim(); if (!x) return; if (items.includes(x)) { toast('Already in the list', { tone: 'error' }); return; } onChange([...items, x]); setV(''); };
  return (
    <div className="pts-list">
      <span className="gc-label" id={id}>{label}</span>
      <div className="pt-chips" role="list" aria-labelledby={id}>
        {items.map((x) => <span key={x} className="gc-chip" role="listitem">{x}<button type="button" className="pts-x" aria-label={'Remove ' + x} onClick={() => onChange(items.filter((y) => y !== x))}><Icon name="x" width="12" height="12" /></button></span>)}
      </div>
      <div className="pt-share__link">
        <input className="gc-input" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="Add one" aria-label={'Add to ' + label} />
        <button type="button" className="ix-btn" onClick={add}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add</button>
      </div>
    </div>
  );
}

const CSS = `
.pts-x{display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:var(--radius-full);background:none;color:inherit;cursor:pointer}
.pts-x:hover{background:var(--surface-card)}
.pts-list{display:flex;flex-direction:column;gap:var(--space-2)}
.pts-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.pts-row>span{display:flex;flex-direction:column;gap:2px;min-width:0}
.pts-row b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pts-row small{font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function PtSettings() {
  const { ready } = usePartners();
  const [f, setF] = useState(null);
  useEffect(() => { if (ready && !f) setF(JSON.parse(JSON.stringify(settings()))); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = f && f.standards;
  const setS = (patch) => setF((x) => ({ ...x, standards: { ...x.standards, ...patch } }));
  const save = () => say(saveSettings(f), 'Settings saved');
  const sw = (key, label, sub) => (
    <div className="pts-row" key={key}>
      <span><b>{label}</b><small>{sub}</small></span>
      <button type="button" role="switch" className="gc-switch" aria-checked={!!s[key]} aria-label={label} onClick={() => setS({ [key]: !s[key] })}><span className="gc-switch__knob" /></button>
    </div>
  );
  return (
    <AdminShell active="pt-settings" title="Grid Partners settings">
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + PTA_CSS + CSS }} />
      <div className="ix-page ix-page--narrow">
        <ShopHeader icon="settings-2" title="Settings"
          about="The minimum standards for approving a creator (the Applications checklist and the creators' Join page read them), the niches and cities creators choose from, and who may use Grid Partners."
          secondary={[{ label: 'Who can use it', href: '/admin/services/access?m=partners' }]}
          primary={f ? { label: 'Save', icon: 'check', onClick: save } : null} />
        {!f ? <div className="ix-card" style={{ minHeight: 300 }} aria-busy="true" /> : (<>
          <section className="ix-card pt-pad" aria-labelledby="pts-std">
            <h2 id="pts-std">Minimum standards</h2>
            <div className="pt-grid2">
              {Object.entries(TYPES).map(([k, t]) => (
                <div key={k}><label className="gc-label" htmlFor={'pts-f-' + k}>Followers: {t.plural.toLowerCase()}</label><input id={'pts-f-' + k} className="gc-input" inputMode="numeric" value={s.minFollowers[k]} onChange={(e) => setS({ minFollowers: { ...s.minFollowers, [k]: e.target.value } })} /></div>
              ))}
              <div><label className="gc-label" htmlFor="pts-smp">Samples of work, at least</label><input id="pts-smp" className="gc-input" inputMode="numeric" value={s.minSamples} onChange={(e) => setS({ minSamples: e.target.value })} /></div>
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Followers count on the creator’s biggest platform.</p>
            <div>
              {sw('phoneVerified', 'Phone checked with a code', 'The creator types the code sent to their mobile.')}
              {sw('idChecked', 'ID checked', 'National ID or passport; the name must match the profile.')}
              {sw('rateCard', 'A rate card', 'At least one package with a price.')}
            </div>
          </section>
          <section className="ix-card pt-pad" aria-labelledby="pts-lists">
            <h2 id="pts-lists">Choices for creators</h2>
            <ListEditor id="pts-niches" label="Niches" items={f.niches} onChange={(v) => setF({ ...f, niches: v })} />
            <ListEditor id="pts-cities" label="Cities" items={f.cities} onChange={(v) => setF({ ...f, cities: v })} />
          </section>
          <section className="ix-card pt-pad" aria-labelledby="pts-acc">
            <h2 id="pts-acc">Who can use Grid Partners</h2>
            <p className="pt-muted">Turn it on or off for every store, open it to chosen stores only, or block a store with a reason.</p>
            <div><Link href="/admin/services/access?m=partners" className="ix-btn"><Icon name="shield-check" width="16" height="16" aria-hidden="true" />Open Access</Link></div>
          </section>
          <div><button type="button" className="ix-btn ix-btn--primary" onClick={save}><Icon name="check" width="16" height="16" aria-hidden="true" />Save settings</button></div>
        </>)}
      </div>
    </AdminShell>
  );
}
