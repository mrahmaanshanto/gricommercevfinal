'use client';
// Vendor portal › Profile (/vendor-profile; Batch E): the company (name, logo, what it sells), the contact person, phone and
// email, the payout account (bank, bKash or Nagad) and the return and warranty terms stores see on each product. The
// pricing model and charges are agreed with GridCommerce, so they are shown read-only with today's rates (a pricing rule
// that replaces one says until when). Data: lib/platform/gridShop.js › saveVendorProfile, vendorRates.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { Pic } from '@/components/ui/Pic';
import { saveVendorProfile, vendorRates, MODELS, ruleValueText } from '@/lib/platform/gridShop';
import { BANK_METHODS } from '@/lib/platform/services';
import { PicturePicker, MEDIA_CSS } from '../admin/services/SvcMedia';
import { VendorFrame, tk, dShort } from './vendorShared';

function Body({ v }) {
  const [f, setF] = useState(null);
  const [pick, setPick] = useState(false);
  const [err, setErr] = useState({});
  useEffect(() => { setF(JSON.parse(JSON.stringify({ ...v, bank: v.bank || { method: 'bank', name: '', account: '', branch: '' }, terms: v.terms || { returns: '', warranty: '' } }))); }, [v.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!f) return <div style={{ minHeight: 400 }} aria-busy="true" />;
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const setB = (patch) => set({ bank: { ...f.bank, ...patch } });
  const setT = (patch) => set({ terms: { ...f.terms, ...patch } });
  const save = () => { const r = saveVendorProfile(v.id, f); if (!r.ok) { setErr(r.field ? { [r.field]: r.error } : {}); toast(r.error, { tone: 'error' }); return; } setErr({}); toast('Profile saved'); };
  const r = vendorRates(v.id);
  const rate = (x) => `${x.unit === '%' ? x.value + '%' : tk(x.value)}${x.rule ? ` (${x.rule.name}${x.rule.to ? ', until ' + dShort(x.rule.to) : ''})` : ''}`;
  return (<>
    <RecordHeader title="Profile" meta={`On Grid Shop since ${dShort(v.joinedAt)}`} primary={{ label: 'Save', icon: 'check', onClick: save }} />
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card vd-pad" aria-labelledby="vf-co">
          <h2 id="vf-co">Company</h2>
          <div className="vd-row">
            <Pic src={f.logo} name={f.name} kind="logo" size={56} />
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick(true)}><Icon name="image" width="14" height="14" aria-hidden="true" />{f.logo ? 'Change logo' : 'Add logo'}</button>
            {f.logo ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ logo: '' })}>Remove</button> : null}
          </div>
          <div><label className="gc-label" htmlFor="vf-n">Company name</label><input id="vf-n" className="gc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} />{err.name ? <p className="gc-help gc-help--error" role="alert">{err.name}</p> : null}</div>
          <div><label className="gc-label" htmlFor="vf-a">What you sell</label><input id="vf-a" className="gc-input" value={f.about || ''} onChange={(e) => set({ about: e.target.value })} placeholder="Computers, POS machines and office equipment" /></div>
          <div className="vd-grid2">
            <div><label className="gc-label" htmlFor="vf-c">Contact person</label><input id="vf-c" className="gc-input" value={f.contact || ''} onChange={(e) => set({ contact: e.target.value })} autoComplete="name" /></div>
            <div><label className="gc-label" htmlFor="vf-p">Phone</label><input id="vf-p" className="gc-input" inputMode="tel" value={f.phone || ''} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" /></div>
            <div><label className="gc-label" htmlFor="vf-e">Email</label><input id="vf-e" className="gc-input" inputMode="email" value={f.email || ''} onChange={(e) => set({ email: e.target.value })} autoComplete="email" /></div>
            <div><label className="gc-label" htmlFor="vf-d">Usual days to deliver</label><input id="vf-d" className="gc-input" inputMode="numeric" value={f.days} onChange={(e) => set({ days: e.target.value })} /></div>
          </div>
        </section>
        <section className="ix-card vd-pad" aria-labelledby="vf-pay">
          <h2 id="vf-pay">Payout account</h2>
          <div className="vd-grid2">
            <div><label className="gc-label" htmlFor="vf-m">Paid by</label><select id="vf-m" className="gc-input gc-select" value={f.bank.method} onChange={(e) => setB({ method: e.target.value })}>{BANK_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            {f.bank.method === 'bank' ? <div><label className="gc-label" htmlFor="vf-b">Bank</label><input id="vf-b" className="gc-input" value={f.bank.name || ''} onChange={(e) => setB({ name: e.target.value })} /></div> : null}
            <div><label className="gc-label" htmlFor="vf-ac">{f.bank.method === 'bank' ? 'Account number' : 'Number'}</label><input id="vf-ac" className="gc-input" value={f.bank.account || ''} onChange={(e) => setB({ account: e.target.value })} /></div>
            {f.bank.method === 'bank' ? <div><label className="gc-label" htmlFor="vf-br">Branch</label><input id="vf-br" className="gc-input" value={f.bank.branch || ''} onChange={(e) => setB({ branch: e.target.value })} /></div> : null}
          </div>
          <span className="vd-sub">Check it twice: GridCommerce pays every payout to this account.</span>
        </section>
        <section className="ix-card vd-pad" aria-labelledby="vf-terms">
          <h2 id="vf-terms">Returns and warranty</h2>
          <div><label className="gc-label" htmlFor="vf-r">Returns (stores see it on each product)</label><input id="vf-r" className="gc-input" value={f.terms.returns} onChange={(e) => setT({ returns: e.target.value })} placeholder="Unused items in the sealed box within 7 days" /></div>
          <div><label className="gc-label" htmlFor="vf-w">Warranty</label><input id="vf-w" className="gc-input" value={f.terms.warranty} onChange={(e) => setT({ warranty: e.target.value })} placeholder="1 year service warranty" /></div>
        </section>
      </div>
      <aside className="ix-side" aria-label="Pricing">
        <section className="ix-card vd-pad">
          <h2>Pricing with GridCommerce</h2>
          <p className="gc-help" style={{ margin: 0 }}>{MODELS[v.model]}.</p>
          {r ? <KV rows={[
            v.model === 'markup' ? ['Our markup', rate(r.markup)] : ['Our commission', rate(r.commission)],
            ['Fee per parcel', rate(r.feePerOrder)],
            ['Monthly fee', rate(r.monthlyFee)],
            ['Paid every', v.payoutEvery + ' days'],
            r.discounts.length ? ['Store discounts', r.discounts.map((x) => `${x.name}: ${ruleValueText(x)}${x.fundedBy === 'vendor' ? ', you pay it' : ', we pay it'}`).join('; ')] : null,
          ]} /> : null}
          <span className="vd-sub">Rates are agreed with GridCommerce. To change them, write to vendors@gridcommerce.net.</span>
        </section>
      </aside>
    </div>
    <PicturePicker open={pick} title="Your logo" onPick={({ src }) => { set({ logo: src }); setPick(false); }} onClose={() => setPick(false)} />
  </>);
}

export default function VendorProfile() {
  return <VendorFrame active="profile" screen="VendorProfile" css={MEDIA_CSS}>{(v) => <Body v={v} />}</VendorFrame>;
}
