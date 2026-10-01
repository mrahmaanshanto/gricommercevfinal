'use client';
// AdSpendDialog — record money paid for ads (date, platform, campaign, amount, paid from which account).
// Saving posts the Marketing expense to the ledger, and the Ad spend & ROAS report sets it against
// the online sales the campaign brought. Use: {open ? <AdSpendDialog onClose={(saved) => …} /> : null}

import React, { useState } from 'react';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { AccountSelect } from '@/screens/accounts/accShared';
import { AD_PLATFORMS, addAdSpend } from '@/lib/adSpend';
import { clockNow, dayKey, fromKey } from '@/lib/settlements';
import { formatBDT } from '@/lib/format';

export function AdSpendDialog({ onClose, by = 'Staff' }) {
  const [f, setF] = useState(() => ({ day: dayKey(clockNow()), platform: 'Facebook', campaign: '', amount: '', account: 'citybank', note: '' }));
  const [err, setErr] = useState({});
  const set = (patch) => { setF({ ...f, ...patch }); setErr({}); };
  const save = () => {
    const e = {};
    if (!f.campaign.trim()) e.campaign = 'Give the campaign a name.';
    if (!(Number(f.amount) > 0)) e.amount = 'Enter the amount paid.';
    if (!f.day) e.day = 'Pick the day it was paid.';
    if (Object.keys(e).length) { setErr(e); return; }
    // keep the time of day when it is today; a past day is booked at midday
    const today = dayKey(clockNow()) === f.day;
    const at = today ? clockNow() : fromKey(f.day) + 12 * 3600e3;
    const res = addAdSpend({ at, platform: f.platform, campaign: f.campaign, amount: Number(f.amount), account: f.account, note: f.note, by });
    if (res.error) { setErr({ form: res.error }); return; }
    toast(`Ad spend of ${formatBDT(res.row.amount)} recorded · added to Marketing expenses`);
    onClose(true);
  };
  const fieldErr = (k) => (err[k] ? <p id={'ad-err-' + k} className="gc-help gc-help--error" role="alert" style={{ margin: '4px 0 0' }}>{err[k]}</p> : null);
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' };
  return (
    <Dialog open title="Add ad spend" onClose={() => onClose(false)} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save ad spend</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={grid}>
          <div>
            <label className="gc-label" htmlFor="ad-day">Paid on</label>
            <input id="ad-day" type="date" className={'gc-input' + (err.day ? ' gc-input--error' : '')} value={f.day} max={dayKey(clockNow())} onChange={(e) => set({ day: e.target.value })} aria-invalid={!!err.day} aria-describedby={err.day ? 'ad-err-day' : undefined} />
            {fieldErr('day')}
          </div>
          <div>
            <label className="gc-label" htmlFor="ad-platform">Platform</label>
            <select id="ad-platform" className="gc-input gc-select" value={f.platform} onChange={(e) => set({ platform: e.target.value })}>
              {AD_PLATFORMS.map((p) => <option key={p} value={p}>{p === 'Other' ? 'Other (SMS, influencer, print…)' : p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="gc-label" htmlFor="ad-campaign">Campaign</label>
          <input id="ad-campaign" className={'gc-input' + (err.campaign ? ' gc-input--error' : '')} placeholder="e.g. Puja offer · Facebook feed" value={f.campaign} onChange={(e) => set({ campaign: e.target.value })} aria-invalid={!!err.campaign} aria-describedby={err.campaign ? 'ad-err-campaign' : undefined} data-autofocus />
          {fieldErr('campaign')}
        </div>
        <div style={grid}>
          <div>
            <label className="gc-label" htmlFor="ad-amount">Amount (৳)</label>
            <input id="ad-amount" type="number" inputMode="decimal" min="0" step="any" className={'gc-input' + (err.amount ? ' gc-input--error' : '')} style={{ fontFamily: 'var(--font-data)' }} value={f.amount} onChange={(e) => set({ amount: e.target.value })} aria-invalid={!!err.amount} aria-describedby={err.amount ? 'ad-err-amount' : undefined} />
            {fieldErr('amount')}
          </div>
          <AccountSelect id="ad-account" label="Paid from" value={f.account} onChange={(v) => set({ account: v })} />
        </div>
        <div>
          <label className="gc-label" htmlFor="ad-note">Note (optional)</label>
          <input id="ad-note" className="gc-input" placeholder="Audience, product, card used…" value={f.note} onChange={(e) => set({ note: e.target.value })} />
        </div>
        {err.form ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err.form}</p> : null}
        <p className="gc-help" style={{ margin: 0 }}>Saved as a Marketing expense from the chosen account. Facebook and Instagram ads are matched with orders that came from Facebook, Google ads with website orders.</p>
      </div>
    </Dialog>
  );
}

export default AdSpendDialog;
