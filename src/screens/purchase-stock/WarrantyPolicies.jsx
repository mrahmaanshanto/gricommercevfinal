'use client';
// Warranty policies — Products › Warranty policies (/warranty-policies), laid out like Shopify (docs/shopify-style.md):
// the list of policies first; a policy opens as a record on this page (basics, coverage, claim process and terms on the
// left; what it applies to, the customer's view and the versions on the right), with Publish in its header.
// The policies are the one list in lib/warranty.js (Catalog setup, the product form, invoices and receipts read it):
// New policy makes a draft, Save draft keeps changes without showing them to customers, Publish makes the next version,
// Archive stops offering it for new products. ?key=<policy> opens one, ?new=1 starts a new one.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, RecordHeader, LearnMore } from '@/components/ui/IndexKit';
import { QrCode } from '@/components/QrCode';
import { toast, confirmDialog } from '@/runtime/ui';
import { formatDate, toBnDigits } from '@/lib/format';
import { allProducts } from '@/lib/products';
import { currentUser } from '@/lib/team';
import { getPolicies, policyBy, newPolicy, saveDraft, discardDraft, publishPolicy, archivePolicy, restorePolicy, setDefault, versionsOf, productsUsing, periodText, lineOf,
  TYPES as W_TYPES, PROVIDERS as W_PROVIDERS, STARTS as W_STARTS, REMEDIES as W_REMEDIES, PROOFS as W_PROOFS, UNITS as W_UNITS, POLICIES_EVENT, removeDraftPolicy } from '@/lib/warranty';

// ---- styles ----

const CSS = `
.wp-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.wp-field .gc-label{margin:0}
.wp-lbl{display:flex;align-items:center;gap:6px}
.wp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.wp-body{display:flex;flex-direction:column;gap:var(--space-4)}
.wp-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.wp-row>.gc-input{flex:1 1 140px;min-width:0}
.wp-sub{margin:0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.wp-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.wp-readonly{display:flex;align-items:center;background:var(--surface-subtle);color:var(--text-body)}
.wp-switch{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.wp-switch>span{display:flex;flex:1;align-items:center;gap:6px;min-width:0}
.wp-parts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2)}
.wp-part{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.wp-part>span{font-size:var(--text-xs);color:var(--text-muted)}
.wp-part>b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wp-list{display:flex;flex-direction:column;gap:6px}
.wp-item{display:flex;align-items:center;gap:var(--space-2);min-height:32px;padding:2px 2px 2px 10px;border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.wp-item>span:nth-child(2){flex:1;min-width:0}
.wp-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full)}
.wp-dot--ok{background:var(--success)}.wp-dot--no{background:var(--error)}
.wp-rem{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 2px 0 8px;border:1px solid var(--primary);border-radius:var(--radius-lg);background:var(--fill-primary-soft);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--primary)}
.wp-rem.is-off{border-color:var(--border-subtle);background:var(--surface-subtle);color:var(--text-muted)}
.wp-rem>i{display:grid;place-items:center;width:20px;height:20px;border-radius:var(--radius-full);background:var(--primary);color:#fff;font-size:var(--text-xs);font-style:normal}
.wp-rem.is-off>i{background:var(--slate-400)}
.wp-chip{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:var(--radius-full);background:var(--fill-error-soft);color:var(--text-danger);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);border:0;font-family:inherit;cursor:pointer}
.wp-checks{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4);font-size:var(--text-sm)}
.wp-checks label{display:flex;align-items:center;gap:var(--space-2);cursor:pointer}
.wp-checks--col{flex-direction:column}
.wp-terms{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.wp-terms__bar{display:flex;gap:2px;padding:4px 6px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);color:var(--text-muted)}
.wp-terms__bar>span{display:grid;place-items:center;width:28px;height:24px}
.wp-terms__text{min-height:140px;padding:var(--space-3);font-size:var(--text-sm);line-height:22px;color:var(--text-body)}
.wp-apply{display:flex;flex-direction:column}
.wp-apply>div{display:flex;align-items:center;gap:var(--space-2);padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.wp-apply>div:first-child{border-top:0;padding-top:0}
.wp-apply span{width:76px;flex:none;font-size:var(--text-xs-plus);color:var(--text-muted)}
.wp-apply b{flex:1;min-width:0;font-weight:var(--weight-medium);color:var(--text-heading)}
.wp-snip{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.wp-snip>b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wp-snip>span{font-size:var(--text-xs-plus);color:var(--text-body)}
.wp-snip>em{margin-top:4px;font-size:var(--text-xs-plus);font-style:normal;font-weight:var(--weight-medium);color:var(--text-link)}
.wp-card{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.wp-card__head{display:flex;align-items:center;gap:var(--space-2);padding:6px var(--space-3);background:var(--brand-navy-deep);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label)}
.wp-card__body{display:flex;gap:var(--space-3);padding:var(--space-3);font-size:var(--text-xs-plus)}
.wp-card__body>div{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.wp-vers{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.wp-vers li{display:flex;gap:var(--space-2)}
.wp-vers li>i{width:8px;height:8px;flex:none;margin-top:6px;border-radius:var(--radius-full);background:var(--slate-300)}
.wp-vers li>i.is-live{background:var(--success)}
.wp-vers b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.wp-vers small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.wp-note{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs-plus);color:var(--text-heading)}
@media (max-width:640px){
  .wp-grid{grid-template-columns:minmax(0,1fr)}
  .wp-parts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .wp-chip{height:36px}
}
`;

// ---- markup ----

const Switch = ({ on, onClick, label }) => (
  <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" onClick={onClick}><span className="gc-switch__knob" /></button>
);
const ST = { published: ['Published', 'success'], draft: ['Draft', 'info'], archived: ['Archived', 'neutral'] };
const METHODS = [['shop', 'Drop-off at shop'], ['courier', 'Courier pickup'], ['visit', 'On-site visit']];
const SHIPPING = ['Shop pays both ways', 'Customer pays to send, shop pays return', 'Customer pays both ways'];
const UPDATES = ['SMS + WhatsApp at every step', 'SMS only', 'WhatsApp only'];
const PRINT_ON = [['invoice', 'Invoice and receipt'], ['card', 'Warranty card with QR'], ['message', 'Order confirmation message'], ['account', 'Customer account, per order']];
const DEFAULTS = { methods: ['shop', 'courier'], shipping: SHIPPING[0], updates: UPDATES[0], printOn: ['invoice', 'card', 'message', 'account'] };

/** Full terms written from the fields (English and Bangla), for "Write from the fields above". */
function termsFrom(d) {
  const per = periodText(d), start = (W_STARTS[d.start] || 'Delivery date').toLowerCase();
  const rem = (d.remedies || []).map((k) => W_REMEDIES[k].toLowerCase());
  const en = [
    `1. This ${String(W_TYPES[d.type] || 'warranty').toLowerCase()} lasts ${per} from the ${start}.`,
    d.cover.length ? `2. It covers: ${d.cover.join(', ').toLowerCase()}.` : '2. It covers faults that are not caused by the customer.',
    `3. Bring the item with ${(d.proof || []).map((k) => W_PROOFS[k].toLowerCase()).join(' and ') || 'the invoice'} to ${d.centre || d.claim}${(d.methods || []).includes('courier') ? ', or book a courier pickup' : ''}.`,
    rem.length ? `4. We offer ${rem.join(', then ')}.` : '',
    d.not.length || d.voids.length ? `5. Not covered: ${[...d.not, ...d.voids].join(', ').toLowerCase()}.` : '',
  ].filter(Boolean).join('\n');
  const bn = [
    `১. এই ওয়ারেন্টি ${d.start === 'purchase' ? 'কেনার' : 'ডেলিভারির'} তারিখ থেকে ${toBnDigits(String(d.n))} ${d.unit === 'days' ? 'দিন' : d.unit === 'years' ? 'বছর' : 'মাস'} পর্যন্ত।`,
    `২. ইনভয়েস সহ পণ্যটি ${d.centre || d.claim}-এ আনুন।`,
    '৩. ভাঙা বা পানিতে নষ্ট হলে, অন্য কোথাও খোলা হলে ওয়ারেন্টি থাকবে না।',
  ].join('\n');
  return { en, bn };
}

export default function WarrantyPoliciesScreen() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [key, setKey] = useState('');          // the policy open as a record ('' = the list)
  const [d, setD] = useState(null);            // its fields while editing
  const [dirty, setDirty] = useState(false);
  const [showArch, setShowArch] = useState(false);
  const [lang, setLang] = useState('en');
  const [inp, setInp] = useState({ cov: '', not: '', voids: '' });
  const [note, setNote] = useState('');
  const [today, setToday] = useState(0);
  const [fresh, setFresh] = useState('');      // a new policy not saved yet: dropped again on Back
  useEffect(() => {
    setReady(true); setToday(Date.now());
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('new')) { const k = newPolicy({}, currentUser().name); setFresh(k); openKey(k); }
    else if (qs.get('key') && policyBy(qs.get('key'))) openKey(qs.get('key'));
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(POLICIES_EVENT, bump);
    return () => window.removeEventListener(POLICIES_EVENT, bump);
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const products = useMemo(() => (ready ? allProducts().filter((p) => p.st !== 'deleted') : []), [ready, tick]);
  const list = useMemo(() => { void tick; return ready ? getPolicies({ all: true }) : []; }, [ready, tick]);   // browser storage: after mount
  const rec = key ? list.find((x) => x.key === key) || null : null;

  function openKey(k) {
    const p = policyBy(k);
    if (!p) return;
    setKey(k); setD({ ...DEFAULTS, ...p }); setDirty(false); setNote(''); setInp({ cov: '', not: '', voids: '' });
    window.history.replaceState(null, '', window.location.pathname + '?key=' + encodeURIComponent(k));
  }
  const back = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this policy are not saved.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    if (fresh && fresh === key) { removeDraftPolicy(key); setFresh(''); }
    setKey(''); setD(null); setDirty(false);
    window.history.replaceState(null, '', window.location.pathname);
  };
  const set = (patch) => { setD({ ...d, ...patch }); setDirty(true); };
  const fieldsOf = (x) => { const { key: k0, status, isDefault, v, publishedAt, hasDraft, live, label, ...f } = x; void k0; void status; void isDefault; void v; void publishedAt; void hasDraft; void live; void label; return f; };
  const saveIt = () => { saveDraft(key, fieldsOf(d)); setDirty(false); setFresh(''); toast(rec && rec.status === 'published' ? 'Draft saved. Customers still see the published version.' : 'Draft saved'); };
  const publish = () => {
    saveDraft(key, fieldsOf(d));
    const r = publishPolicy(key, { by: currentUser().name, note });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    setFresh(''); setDirty(false); setNote(''); setD({ ...DEFAULTS, ...r.policy });
    toast(`${r.policy.label} published as v${r.v}. New sales use it from now on.`);
  };
  const archive = async () => {
    const n = productsUsing(key, products);
    if (!(await confirmDialog({ title: `Archive ${d.name || 'this policy'}?`, body: n ? `It is no longer offered for new products. ${n} product${n === 1 ? ' keeps' : 's keep'} it until you change them, and every sold unit keeps its cover.` : 'It is no longer offered for new products. Sold units keep their cover.', confirmLabel: 'Archive', tone: 'danger' }))) return;
    archivePolicy(key); toast('Policy archived');
  };
  const newOne = () => { const k = newPolicy({}, currentUser().name); setFresh(k); openKey(k); };

  // ---- the list ----
  if (!key || !d) {
    const rows = list.filter((p) => showArch || p.status !== 'archived');
    const archived = list.filter((p) => p.status === 'archived').length;
    return (
      <div className="dc-screen ds" data-screen="WarrantyPolicies">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="stock-wpol" />
          <main className="gc-shell__main">
            <Topbar crumb="Products" page="Warranty policies" placeholder="Search policy, product or brand" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="shield-check" title="Warranty policies"
                  about="One list of warranty policies. Products pick one; invoices, receipts and warranty cards print it. Orders keep the version they were sold under, so changing a policy never changes an old customer’s warranty."
                  secondary={[{ label: 'Claims & serial numbers', href: '/warranty-claims' }]}
                  more={archived ? [{ label: showArch ? 'Hide archived' : `Show archived (${archived})`, onClick: () => setShowArch(!showArch) }] : []}
                  primary={{ label: 'New policy', onClick: newOne }} />
                <section className="ix-card" aria-label="Warranty policies">
                  <ul className="ix-plist" aria-label="Warranty policies">
                    {rows.map((pl) => (
                      <li key={pl.key}>
                        <button type="button" className="ix-pitem" onClick={() => openKey(pl.key)}>
                          <span className="ix-pitem__top"><b>{pl.label}</b><StatusBadge tone={ST[pl.status][1]}>{ST[pl.status][0]}</StatusBadge></span>
                          <span className="ix-pitem__mid">{W_TYPES[pl.type]} · {periodText(pl)} · {ready ? ((n) => n + (n === 1 ? ' product' : ' products'))(productsUsing(pl.key, products)) : '—'}{pl.isDefault ? ' · Store default' : ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table">
                      <caption className="sr-only">Warranty policies</caption>
                      <thead><tr><th scope="col">Policy</th><th scope="col">Type</th><th scope="col">Period</th><th scope="col" className="ix-num">Products</th><th scope="col">Version</th><th scope="col">Status</th></tr></thead>
                      <tbody>
                        {rows.map((pl) => (
                          <tr key={pl.key} onClick={() => openKey(pl.key)}>
                            <td>
                              <button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); openKey(pl.key); }}>{pl.label}</button>
                              {pl.isDefault ? <span className="ix-muted"> · Store default</span> : null}
                            </td>
                            <td className="ix-muted">{W_TYPES[pl.type]}</td>
                            <td>{periodText(pl)}</td>
                            <td className="ix-num">{ready ? productsUsing(pl.key, products) : '—'}</td>
                            <td className="ix-muted">{pl.v ? 'v' + pl.v + (pl.hasDraft ? ' · changes not published' : '') : 'Not published'}</td>
                            <td><StatusBadge tone={ST[pl.status][1]}>{ST[pl.status][0]}</StatusBadge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="ix-foot"><span>{rows.length === 1 ? '1 policy' : rows.length + ' policies'}</span></div>
                </section>
                <LearnMore topic="warranty policies" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ---- one policy as a record ----
  const st = ST[(rec && rec.status) || 'draft'];
  const meta = !rec || !rec.v ? 'Draft, not published yet' : `v${rec.v} live since ${formatDate(rec.publishedAt)}${rec.hasDraft || dirty ? ' · changes not published' : ''}`;
  const used = productsUsing(key, products);
  const vers = versionsOf(key);
  const proofTxt = (d.proof || []).map((k) => (k === 'imei' ? 'IMEI' : W_PROOFS[k])).join(' + ') || 'Nothing';
  const remOn = d.remedies || [];
  const remAll = [...remOn, ...Object.keys(W_REMEDIES).filter((k) => !remOn.includes(k))];
  const end = (() => { if (!today) return '—'; const x = new Date(today); const n = Number(d.n) || 0; if (d.unit === 'days') x.setDate(x.getDate() + n); else if (d.unit === 'years') x.setFullYear(x.getFullYear() + n); else x.setMonth(x.getMonth() + n); return formatDate(x.getTime()); })();
  const listEditor = (k, label, dot) => (
    <div className="wp-list">
      <p className="wp-sub">{label}</p>
      {d[k].map((t, i) => (
        <div key={i} className="wp-item"><span className={'wp-dot wp-dot--' + dot} /><span>{t}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={() => set({ [k]: d[k].filter((_, j) => j !== i) })} aria-label={'Remove: ' + t}><Icon name="x" width="14" height="14" aria-hidden="true" /></button></div>
      ))}
      <form className="wp-row" onSubmit={(e) => { e.preventDefault(); const t = inp[k === 'cover' ? 'cov' : 'not'].trim(); if (!t) return; set({ [k]: [...d[k], t] }); setInp({ ...inp, [k === 'cover' ? 'cov' : 'not']: '' }); }}>
        <input className="gc-input" value={inp[k === 'cover' ? 'cov' : 'not']} onChange={(e) => setInp({ ...inp, [k === 'cover' ? 'cov' : 'not']: e.target.value })} placeholder={'Add: ' + label.toLowerCase()} aria-label={'Add: ' + label.toLowerCase()} />
        <button type="submit" className="ix-btn">Add</button>
      </form>
    </div>
  );
  return (
    <div className="dc-screen ds" data-screen="WarrantyPolicies">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-wpol" />
        <main className="gc-shell__main">
          <Topbar crumb="Products" page="Warranty policies" placeholder="Search policy, product or brand" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <RecordHeader onBack={back} title={d.name || 'New warranty policy'} badges={<StatusBadge tone={st[1]}>{st[0]}</StatusBadge>} meta={meta}
                secondary={[{ label: 'Save draft', onClick: saveIt }]}
                more={[
                  rec && rec.status === 'archived' ? { label: 'Restore', onClick: () => { restorePolicy(key); toast('Policy restored'); } } : { label: 'Archive', onClick: archive },
                  rec && rec.status === 'published' && !rec.isDefault ? { label: 'Make store default', onClick: () => { setDefault(key); toast(`${d.name} is the store default`); } } : null,
                  rec && rec.hasDraft && rec.v ? { label: 'Discard draft', onClick: () => { discardDraft(key); openKey(key); toast('Draft discarded'); } } : null,
                ].filter(Boolean)}
                primary={{ label: rec && rec.v ? 'Publish new version' : 'Publish policy', onClick: publish }} />

              <div className="ix-record">
                <div className="ix-main">
                  <section className="ix-card" aria-labelledby="wp-h-basics">
                    <div className="ix-card__head"><h2 id="wp-h-basics">Policy basics</h2></div>
                    <div className="ix-card__body wp-body">
                      <div className="wp-grid">
                        <label className="wp-field"><span className="gc-label">Policy name</span><input className="gc-input" value={d.name} onChange={(e) => set({ name: e.target.value })} data-autofocus="" /></label>
                        <label className="wp-field"><span className="gc-label">Type</span>
                          <select className="gc-input gc-select" value={d.type} onChange={(e) => set({ type: e.target.value })}>{Object.entries(W_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                        </label>
                        <label className="wp-field"><span className="gc-label">Provided by</span>
                          <select className="gc-input gc-select" value={d.provider} onChange={(e) => set({ provider: e.target.value })}>{Object.entries(W_PROVIDERS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                        </label>
                        <div className="wp-field">
                          <span className="gc-label">Period</span>
                          <div className="wp-row" style={{ flexWrap: 'nowrap' }}>
                            <input className="gc-input" inputMode="numeric" value={d.n} onChange={(e) => set({ n: e.target.value.replace(/\D/g, '') })} aria-label="Period" style={{ flex: '0 0 72px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
                            <select className="gc-input gc-select" value={d.unit} onChange={(e) => set({ unit: e.target.value })} aria-label="Period unit">{W_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
                          </div>
                        </div>
                        <label className="wp-field"><span className="gc-label">Starts from</span>
                          <select className="gc-input gc-select" value={d.start} onChange={(e) => set({ start: e.target.value })}>{Object.entries(W_STARTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                        </label>
                        <div className="wp-field">
                          <div className="wp-lbl"><span className="gc-label">Proof needed</span><InfoTip text="Pick below in Claim process" /></div>
                          <div className="gc-input wp-readonly">{proofTxt}</div>
                        </div>
                      </div>
                      <label className="wp-field"><span className="gc-label">Line on the product page</span><input className="gc-input" value={d.text} onChange={(e) => set({ text: e.target.value })} placeholder={lineOf(d)} /></label>
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="wp-h-cover">
                    <div className="ix-card__head"><h2 id="wp-h-cover">Covered / not covered</h2></div>
                    <div className="ix-card__body wp-body">
                      <div className="wp-grid">{listEditor('cover', 'Covered', 'ok')}{listEditor('not', 'Not covered', 'no')}</div>
                      <div className="wp-field">
                        <p className="wp-sub">Remedy — offered in this order</p>
                        <div className="wp-row">
                          {remAll.map((k) => {
                            const off = !remOn.includes(k), i = remOn.indexOf(k), l = W_REMEDIES[k];
                            return (
                              <span key={k} className={'wp-rem' + (off ? ' is-off' : '')}>
                                <i>{off ? '–' : i + 1}</i>{l}
                                {!off && i > 0 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={() => { const r = remOn.slice(); r[i] = r[i - 1]; r[i - 1] = k; set({ remedies: r }); }} aria-label={'Move ' + l + ' earlier'}><Icon name="chevron-left" width="14" height="14" aria-hidden="true" /></button> : null}
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={() => set({ remedies: off ? [...remOn, k] : remOn.filter((x) => x !== k) })} aria-label={(off ? 'Turn on ' : 'Turn off ') + l} style={{ marginLeft: '-6px' }}><Icon name={off ? 'plus' : 'x'} width="14" height="14" aria-hidden="true" /></button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="wp-field">
                        <p className="wp-sub">Conditions that void the warranty</p>
                        <div className="wp-row">
                          {d.voids.map((t, i) => <button key={i} type="button" className="wp-chip" onClick={() => set({ voids: d.voids.filter((_, j) => j !== i) })} aria-label={'Remove: ' + t}>{t} ×</button>)}
                        </div>
                        <form className="wp-row" onSubmit={(e) => { e.preventDefault(); const t = inp.voids.trim(); if (!t) return; set({ voids: [...d.voids, t] }); setInp({ ...inp, voids: '' }); }}>
                          <input className="gc-input" value={inp.voids} onChange={(e) => setInp({ ...inp, voids: e.target.value })} placeholder="Add a condition" aria-label="Add a condition" />
                          <button type="submit" className="ix-btn">Add</button>
                        </form>
                      </div>
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="wp-h-claim">
                    <div className="ix-card__head"><h2 id="wp-h-claim">Claim process</h2></div>
                    <div className="ix-card__body wp-body">
                      <div className="wp-field">
                        <p className="wp-sub">How customers claim</p>
                        <div className="wp-checks">
                          {METHODS.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" checked={(d.methods || []).includes(k)} onChange={(e) => set({ methods: e.target.checked ? [...(d.methods || []), k] : (d.methods || []).filter((x) => x !== k) })} />{l}</label>)}
                        </div>
                      </div>
                      <div className="wp-grid">
                        <label className="wp-field"><span className="gc-label">Claim at</span><input className="gc-input" value={d.claim} onChange={(e) => set({ claim: e.target.value })} placeholder="Our shop" /></label>
                        <label className="wp-field"><span className="gc-label">Service centre address</span><input className="gc-input" value={d.centre} onChange={(e) => set({ centre: e.target.value })} /></label>
                        <label className="wp-field"><span className="gc-label">Hours</span><input className="gc-input" value={d.hours} onChange={(e) => set({ hours: e.target.value })} /></label>
                      </div>
                      <div className="wp-field">
                        <p className="wp-sub">Proof the customer must show</p>
                        <div className="ix-chips">
                          {Object.entries(W_PROOFS).map(([k, l]) => { const on = (d.proof || []).includes(k); return <button key={k} type="button" className="ix-chip" onClick={() => set({ proof: on ? d.proof.filter((x) => x !== k) : [...(d.proof || []), k] })} aria-pressed={on}>{l}</button>; })}
                        </div>
                      </div>
                      <div className="wp-grid">
                        <div className="wp-field">
                          <span className="gc-label">Turnaround</span>
                          <div className="wp-row" style={{ flexWrap: 'nowrap', fontSize: 'var(--text-sm)' }}>
                            <input className="gc-input" inputMode="numeric" value={(d.turnaround || [])[0] || ''} onChange={(e) => set({ turnaround: [e.target.value.replace(/\D/g, ''), (d.turnaround || [])[1] || ''] })} aria-label="From days" style={{ flex: '0 0 64px', textAlign: 'center' }} />
                            <span>to</span>
                            <input className="gc-input" inputMode="numeric" value={(d.turnaround || [])[1] || ''} onChange={(e) => set({ turnaround: [(d.turnaround || [])[0] || '', e.target.value.replace(/\D/g, '')] })} aria-label="To days" style={{ flex: '0 0 64px', textAlign: 'center' }} />
                            <span>days</span>
                          </div>
                        </div>
                        <label className="wp-field"><span className="gc-label">Delivery cost during a claim</span>
                          <select className="gc-input gc-select" value={d.shipping} onChange={(e) => set({ shipping: e.target.value })}>{SHIPPING.map((x) => <option key={x}>{x}</option>)}</select>
                        </label>
                        <label className="wp-field"><span className="gc-label">Claim updates to the customer</span>
                          <select className="gc-input gc-select" value={d.updates} onChange={(e) => set({ updates: e.target.value })}>{UPDATES.map((x) => <option key={x}>{x}</option>)}</select>
                        </label>
                      </div>
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="wp-h-terms">
                    <div className="ix-card__head">
                      <h2 id="wp-h-terms">Full terms <InfoTip text="Shown on the full policy page of your website. Write both languages — customers pick one." /></h2>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { set({ terms: termsFrom(d) }); toast('Terms written from the fields above. Check them before you publish.'); }}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />Write from the fields above</button>
                    </div>
                    <div className="ix-card__body wp-body">
                      <div className="gc-seg" role="group" aria-label="Language">
                        {[['en', 'English'], ['bn', 'বাংলা']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (lang === k ? ' gc-seg__btn--active' : '')} aria-pressed={lang === k} onClick={() => setLang(k)}>{l}</button>)}
                      </div>
                      <textarea className="gc-input wp-terms__text" rows={6} aria-label={'Full terms, ' + (lang === 'bn' ? 'Bangla' : 'English')} value={(d.terms || {})[lang] || ''} onChange={(e) => set({ terms: { ...(d.terms || {}), [lang]: e.target.value } })} style={lang === 'bn' ? { fontFamily: 'var(--font-bn)' } : undefined} />
                    </div>
                  </section>
                </div>

                <aside className="ix-side">
                  <section className="ix-card" aria-labelledby="wp-h-apply">
                    <div className="ix-card__head"><h2 id="wp-h-apply">Applies to</h2></div>
                    <div className="ix-card__body wp-body">
                      <div className="wp-apply">
                        <div><span>Products</span><b>{used === 1 ? '1 product' : used + ' products'}</b><Link href="/all-products" className="ix-btn ix-btn--sm ix-btn--plain">View</Link></div>
                      </div>
                      <div className="wp-switch">
                        <span>Store default policy<InfoTip text="Used when a product is marked Warranty but has no policy of its own. A product’s own choice always wins." /></span>
                        <Switch on={rec && rec.isDefault} label="Store default policy" onClick={() => { if (!rec || rec.status !== 'published') { toast('Publish the policy first', { tone: 'info' }); return; } if (rec.isDefault) { toast('Make another policy the default to change it', { tone: 'info' }); return; } setDefault(key); toast(`${d.name} is the store default`); }} />
                      </div>
                      <p className="wp-help">Pick it on a product in Add product › Warranty.</p>
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="wp-h-cust">
                    <div className="ix-card__head"><h2 id="wp-h-cust">As the customer sees it</h2></div>
                    <div className="ix-card__body wp-body">
                      <div className="wp-snip">
                        <b>{lineOf(d)}</b>
                        <span>{d.cover.length ? 'Covers ' + d.cover[0].toLowerCase() + (d.cover.length > 1 ? ' and more' : '') : 'See what is covered'}</span>
                        <em>See full warranty policy ›</em>
                      </div>
                      <div className="wp-card">
                        <div className="wp-card__head gc-on-dark"><Icon name="shield-check" width="14" height="14" aria-hidden="true" />WARRANTY CARD</div>
                        <div className="wp-card__body">
                          <div>
                            <b style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>Sample product</b>
                            <span style={{ fontFamily: 'var(--font-data)', color: 'var(--text-body)' }}>IMEI 350912118845201</span>
                            <span>Starts <b>{today ? formatDate(today) : '—'}</b></span>
                            <span>Ends <b>{end}</b></span>
                          </div>
                          <QrCode text="https://dazzleshop.com.bd/warranty" size={76} label="QR code" />
                        </div>
                      </div>
                      <div className="wp-field">
                        <p className="wp-sub">Also printed on</p>
                        <div className="wp-checks wp-checks--col">
                          {PRINT_ON.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" checked={(d.printOn || []).includes(k)} onChange={(e) => set({ printOn: e.target.checked ? [...(d.printOn || []), k] : (d.printOn || []).filter((x) => x !== k) })} />{l}</label>)}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="wp-h-vers">
                    <div className="ix-card__head"><h2 id="wp-h-vers">Version history</h2></div>
                    <div className="ix-card__body wp-body">
                      {vers.length ? (
                        <ul className="wp-vers">
                          {vers.map((vr, i) => <li key={vr.v}><i className={i === 0 ? 'is-live' : ''} /><span><b>v{vr.v} <span className="ix-muted">· {formatDate(vr.at)}</span></b><small>{vr.note}{vr.by ? ' · ' + vr.by : ''}</small></span></li>)}
                        </ul>
                      ) : <p className="wp-help">Not published yet.</p>}
                      <label className="wp-field"><span className="gc-label">What changed (for the next version)</span><input className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: courier pickup added" /></label>
                      <p className="wp-note">Orders keep the version they were sold under. Changing the policy never changes an old customer’s warranty.</p>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
