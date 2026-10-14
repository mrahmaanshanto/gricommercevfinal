'use client';
// Business email › Plans & provider (/admin/email/plans) — what stores pay: mailbox plans (name, storage, price a month),
// storage add-ons, mailboxes each GridCommerce plan includes for free, the yearly discount; and the provider (a
// placeholder until the partners and the backend choose: own servers or a reseller such as Zoho Mail, Google Workspace,
// Titan or Mailcow) with its cost per mailbox and per GB, which the directory's margin uses.

import React, { useEffect, useState } from 'react';
import { toast } from '@/runtime/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { read, EVENT, saveMailSettings } from '@/lib/platform/mail';
import { AdminShell } from '../AdminShell';

const CSS = `.mp-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}.mp-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}.mp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-3)}.mp-row{display:grid;grid-template-columns:minmax(0,2fr) repeat(2,minmax(0,1fr));gap:var(--space-2)}.mp-pad .gc-label{margin-bottom:4px}`;

export default function MailPlans() {
  const [s, setS] = useState(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { const load = () => { setS(JSON.parse(JSON.stringify(read().settings))); setDirty(false); }; load(); window.addEventListener(EVENT, load); return () => window.removeEventListener(EVENT, load); }, []);
  if (!s) return <AdminShell active="mail-plans" title="Mail plans"><div style={{ minHeight: 300 }} aria-busy="true" /></AdminShell>;
  const set = (patch) => { setS({ ...s, ...patch }); setDirty(true); };
  const save = () => { const r = saveMailSettings(s); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast('Saved · stores see the new prices'); setDirty(false); };
  return (
    <AdminShell active="mail-plans" title="Mail plans">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page ix-page--narrow">
        <ShopHeader icon="badge-dollar-sign" title="Mail plans & provider" about="Prices stores pay for Business email, what each GridCommerce plan includes, and the mail provider." secondary={[{ label: 'Directory', href: '/admin/email' }]} primary={{ label: 'Save', onClick: save, disabled: !dirty }} />
        <section className="ix-card mp-pad" aria-labelledby="mp-plans">
          <h2 id="mp-plans">Mailbox plans (a mailbox a month)</h2>
          {s.plans.map((p, i) => (
            <div key={p.id} className="mp-row">
              <div><label className="gc-label" htmlFor={'mp-n' + i}>Name</label><input id={'mp-n' + i} className="gc-input" value={p.name} onChange={(e) => set({ plans: s.plans.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} /></div>
              <div><label className="gc-label" htmlFor={'mp-g' + i}>Storage (GB)</label><input id={'mp-g' + i} className="gc-input" inputMode="numeric" value={p.storageGB} onChange={(e) => set({ plans: s.plans.map((x, j) => (j === i ? { ...x, storageGB: e.target.value } : x)) })} /></div>
              <div><label className="gc-label" htmlFor={'mp-p' + i}>Price (৳)</label><input id={'mp-p' + i} className="gc-input" inputMode="numeric" value={p.price} onChange={(e) => set({ plans: s.plans.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })} /></div>
            </div>
          ))}
          <h2>Storage add-ons (a month)</h2>
          <div className="mp-grid">{s.storageAddons.map((a, i) => <div key={a.id}><label className="gc-label" htmlFor={'mp-a' + i}>{a.gb} GB · price (৳)</label><input id={'mp-a' + i} className="gc-input" inputMode="numeric" value={a.price} onChange={(e) => set({ storageAddons: s.storageAddons.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })} /></div>)}</div>
          <h2>Included with the GridCommerce plan</h2>
          <div className="mp-grid">{['starter', 'growth', 'business'].map((k) => <div key={k}><label className="gc-label" htmlFor={'mp-i' + k}>{k[0].toUpperCase() + k.slice(1)} (mailboxes)</label><input id={'mp-i' + k} className="gc-input" inputMode="numeric" value={s.included[k]} onChange={(e) => set({ included: { ...s.included, [k]: Number(e.target.value.replace(/\D/g, '')) || 0 } })} /></div>)}
            <div><label className="gc-label" htmlFor="mp-y">Yearly discount (%)</label><input id="mp-y" className="gc-input" inputMode="numeric" value={s.yearlyDiscount} onChange={(e) => set({ yearlyDiscount: e.target.value })} /></div></div>
        </section>
        <section className="ix-card mp-pad" aria-labelledby="mp-prov">
          <h2 id="mp-prov">Provider</h2>
          <p className="gc-help" style={{ margin: 0 }}>{s.provider.note}</p>
          <div className="mp-grid">
            <div><label className="gc-label" htmlFor="mp-pn">Provider</label><select id="mp-pn" className="gc-input gc-select" value={s.provider.name} onChange={(e) => set({ provider: { ...s.provider, name: e.target.value } })}>{['Not chosen yet', 'Own servers (Mailcow)', 'Zoho Mail (reseller)', 'Google Workspace (reseller)', 'Titan (reseller)'].map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="mp-cs">Cost a mailbox (৳/mo)</label><input id="mp-cs" className="gc-input" inputMode="numeric" value={s.cost.perSeat} onChange={(e) => set({ cost: { ...s.cost, perSeat: Number(e.target.value.replace(/\D/g, '')) || 0 } })} /></div>
            <div><label className="gc-label" htmlFor="mp-cg">Cost a GB (৳/mo)</label><input id="mp-cg" className="gc-input" inputMode="numeric" value={s.cost.perGB} onChange={(e) => set({ cost: { ...s.cost, perGB: Number(e.target.value.replace(/\D/g, '')) || 0 } })} /></div>
          </div>
          <p className="gc-help" style={{ margin: 0 }}>Connection settings (API keys, admin account) come with the backend; nothing here talks to a provider yet.</p>
        </section>
      </div>
    </AdminShell>
  );
}
