'use client';
// Affiliates — Marketing › Affiliates (/affiliates?tab=; Batch B step 3, "Remaining work" item 5). People who promote
// the shop get a link and a code; orders through them earn a commission that becomes payable after delivery and the
// return window (lib/affiliates.js). Tabs: Affiliates (each opens /affiliate?id=), Applications (reviewed in a side
// panel: Approve / Reject with a reason), Commissions (every order that came through an affiliate and where it stands)
// and Settings (commission % or fixed, rates per category, link days, minimum payout, automatic or manual approval,
// return window, terms). Make payouts turns what is payable into money owed in Finances › Liabilities, where it is paid.
// Withdrawals (Batch C step 6): requests affiliates send from My account › Affiliate, reviewed in a side panel (Approve
// makes the Liabilities payout line; Reject needs a reason, sent to them); the rules (maximum per request, how often,
// automatic or manual approval, ways to pay) are in Settings › Withdrawal requests.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { getCategories } from '@/lib/productCategories';
import { currentUser } from '@/lib/team';
import {
  getAffiliates, getApplications, getCommissions, statsOf, commissionsOf, affSettings, saveAffSettings, approveApplication, rejectApplication,
  payoutPreview, makePayouts, rateText, COMMISSION_LABEL, AFF_EVENT, AFF_DEFAULTS,
  getWithdrawals, approveWithdrawal, rejectWithdrawal, WD_LABEL, PAYOUT_METHODS,
} from '@/lib/affiliates';
import { TeamPage } from '@/screens/team/teamShared';
import { Pic } from '@/components/ui/Pic';
import { accountOf } from '@/lib/storefront/account';

// The affiliate's profile picture from their store account (the list renders after mount).
const picOf = (phone) => { try { const a = accountOf(phone); return (a && a.avatar) || ''; } catch (e) { return ''; } };

const TABS = [['list', 'Affiliates'], ['apps', 'Applications'], ['wd', 'Withdrawals'], ['orders', 'Commissions'], ['settings', 'Settings']];
export const STATE_TONE = { pending: 'warning', approved: 'success', requested: 'info', owed: 'info', paid: 'neutral', cancelled: 'neutral' };
const WD_TONE = { pending: 'warning', approved: 'success', rejected: 'neutral' };
const EVERY = [[0, 'Any time'], [1, 'Once a day'], [7, 'Once a week'], [14, 'Every 2 weeks'], [30, 'Once a month']];
const CSS = `
.af-form{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-4)}
.af-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.af-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.af-fld small{font-size:var(--text-xs);color:var(--text-muted)}
.af-cats{display:flex;flex-direction:column;gap:var(--space-2)}
.af-cat{display:grid;grid-template-columns:minmax(0,1fr) 120px auto;gap:var(--space-2);align-items:center}
.af-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-heading)}
.af-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.af-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:0 var(--space-4) var(--space-4)}
.af-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.af-pay{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2);font-size:var(--text-sm)}
.af-pay li{display:flex;justify-content:space-between;gap:var(--space-3)}
.af-wd{display:flex;flex-direction:column;gap:var(--space-3);margin:0;padding:var(--space-4) 0 0;border:0;border-top:1px solid var(--border-subtle);min-width:0}
.af-wd legend{float:left;width:100%;margin-bottom:var(--space-1);font-weight:var(--weight-semibold);color:var(--text-heading)}
.af-ro{display:flex;flex-direction:column;justify-content:center;min-height:var(--control-height);font-size:var(--text-sm);font-family:var(--font-data);color:var(--text-heading)}
.af-ro small{font-family:var(--font-sans)}
.af-chk{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4);font-size:var(--text-sm)}
.af-chk label{display:inline-flex;align-items:center;gap:6px;min-height:36px;cursor:pointer}
.af-chk input{width:18px;height:18px;accent-color:var(--primary)}
@media (max-width:767px){.af-grid{grid-template-columns:minmax(0,1fr)}.af-cat{grid-template-columns:minmax(0,1fr) 96px auto}}
`;

function Settings() {
  const [d, setD] = useState(null);
  const [saved, setSaved] = useState('');
  const [cats, setCats] = useState([]);
  useEffect(() => { const s = affSettings(); setD(s); setSaved(JSON.stringify(s)); try { setCats(getCategories().map((c) => c.path)); } catch { setCats([]); } }, []);
  if (!d) return <div className="ix-card" style={{ minHeight: 300 }} aria-busy="true" />;
  const dirty = JSON.stringify(d) !== saved;
  const set = (k, v) => setD({ ...d, [k]: v });
  const save = () => { const s = saveAffSettings(d); setD(s); setSaved(JSON.stringify(s)); toast('Affiliate settings saved'); };
  return (
    <section className="ix-card" aria-label="Programme settings">
      <div className="af-form">
        <label className="af-sw"><span>Affiliate programme is open<small>Off: the “Become an affiliate” page is closed and links stop counting.</small></span><input type="checkbox" className="gc-switch" checked={d.on} onChange={(e) => set('on', e.target.checked)} /></label>
        <div className="af-grid">
          <div className="af-fld"><label className="gc-label" htmlFor="af-type">Commission</label><select id="af-type" className="gc-input gc-select" value={d.type} onChange={(e) => set('type', e.target.value)}><option value="percent">A % of each sale</option><option value="fixed">A fixed amount per order</option></select></div>
          {d.type === 'percent'
            ? <div className="af-fld"><label className="gc-label" htmlFor="af-rate">Commission (%)</label><input id="af-rate" className="gc-input" inputMode="decimal" value={d.rate} onChange={(e) => set('rate', e.target.value)} /><small>Of the items after discounts; delivery is not counted.</small></div>
            : <div className="af-fld"><label className="gc-label" htmlFor="af-fixed">Per order (৳)</label><input id="af-fixed" className="gc-input" inputMode="decimal" value={d.fixed} onChange={(e) => set('fixed', e.target.value)} /></div>}
          <div className="af-fld"><label className="gc-label" htmlFor="af-days">Link lasts (days)</label><input id="af-days" className="gc-input" inputMode="numeric" value={d.linkDays} onChange={(e) => set('linkDays', e.target.value)} /><small>An order within these days of the click counts.</small></div>
          <div className="af-fld"><label className="gc-label" htmlFor="af-min">Minimum payout (৳)</label><input id="af-min" className="gc-input" inputMode="decimal" value={d.minPayout} onChange={(e) => set('minPayout', e.target.value)} /></div>
          <div className="af-fld"><label className="gc-label" htmlFor="af-ret">Return window (days)</label><input id="af-ret" className="gc-input" inputMode="numeric" value={d.returnDays} onChange={(e) => set('returnDays', e.target.value)} /><small>Commission becomes payable this long after delivery.</small></div>
          <div className="af-fld"><label className="gc-label" htmlFor="af-appr">New affiliates</label><select id="af-appr" className="gc-input gc-select" value={d.approval} onChange={(e) => set('approval', e.target.value)}><option value="manual">We approve each one</option><option value="auto">Approved at once</option></select></div>
        </div>
        {d.type === 'percent' ? (
          <div className="af-cats">
            <span className="gc-label">Other rates for some categories</span>
            {d.cats.map((c, i) => (
              <div key={i} className="af-cat">
                <select className="gc-input gc-select" aria-label="Category" value={c.cat} onChange={(e) => set('cats', d.cats.map((x, j) => (j === i ? { ...x, cat: e.target.value } : x)))}><option value="">Choose a category</option>{cats.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                <input className="gc-input" inputMode="decimal" aria-label="Commission %" value={c.rate} onChange={(e) => set('cats', d.cats.map((x, j) => (j === i ? { ...x, rate: e.target.value } : x)))} />
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set('cats', d.cats.filter((x, j) => j !== i))}>Remove</button>
              </div>
            ))}
            <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => set('cats', [...d.cats, { cat: '', rate: 3 }])}>Add a category rate</button>
          </div>
        ) : null}
        <fieldset className="af-wd">
          <legend className="gc-label">Withdrawal requests</legend>
          <label className="af-sw"><span>Affiliates can ask to be paid<small>From My account › Affiliate, once at least the minimum payout is payable.</small></span><input type="checkbox" className="gc-switch" checked={d.wdOn} onChange={(e) => set('wdOn', e.target.checked)} /></label>
          {d.wdOn ? (<>
            <div className="af-grid">
              <div className="af-fld"><span className="gc-label">Minimum (৳)</span><span className="af-ro">{d.minPayout || 0}<small>Same as the minimum payout above</small></span></div>
              <div className="af-fld"><label className="gc-label" htmlFor="af-wmax">Most per request (৳)</label><input id="af-wmax" className="gc-input" inputMode="decimal" value={d.wdMax} onChange={(e) => set('wdMax', e.target.value)} /><small>0 = no limit</small></div>
              <div className="af-fld"><label className="gc-label" htmlFor="af-wev">How often</label><select id="af-wev" className="gc-input gc-select" value={d.wdEvery} onChange={(e) => set('wdEvery', Number(e.target.value))}>{EVERY.map(([k, l]) => <option key={k} value={k}>{l}</option>)}{EVERY.some(([k]) => k === Number(d.wdEvery)) ? null : <option value={d.wdEvery}>Every {d.wdEvery} days</option>}</select></div>
              <div className="af-fld"><label className="gc-label" htmlFor="af-wap">Approval</label><select id="af-wap" className="gc-input gc-select" value={d.wdApproval} onChange={(e) => set('wdApproval', e.target.value)}><option value="manual">We approve each request</option><option value="auto">Approved at once</option></select>{d.wdApproval === 'auto' ? <small>Each request goes straight to Liabilities to be paid.</small> : null}</div>
            </div>
            <div className="af-fld"><span className="gc-label">Ways we pay</span><span className="af-chk">{PAYOUT_METHODS.map(([k, l]) => <label key={k}><input type="checkbox" checked={(d.wdMethods || []).includes(k)} onChange={(e) => set('wdMethods', e.target.checked ? [...(d.wdMethods || []), k] : (d.wdMethods || []).filter((x) => x !== k))} />{l}</label>)}</span></div>
          </>) : null}
        </fieldset>
        <div className="af-fld"><label className="gc-label" htmlFor="af-terms">Terms affiliates agree to</label><textarea id="af-terms" className="gc-input" rows={4} style={{ height: 'auto', padding: 'var(--space-2) var(--space-3)' }} value={d.terms} onChange={(e) => set('terms', e.target.value)} /></div>
      </div>
      <div className="af-foot">
        <button type="button" className="ix-btn ix-btn--primary" disabled={!dirty} onClick={save}>Save settings</button>
        <button type="button" className="ix-btn" disabled={!dirty} onClick={() => setD(JSON.parse(saved))}>Discard</button>
        <button type="button" className="ix-btn ix-btn--plain" onClick={() => setD({ ...AFF_DEFAULTS })}>Use the defaults</button>
      </div>
    </section>
  );
}

export default function Affiliates() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('list');
  const [tick, setTick] = useState(0);
  const [app, setApp] = useState(null);
  const [reason, setReason] = useState('');
  const [pay, setPay] = useState(false);
  const [wd, setWd] = useState(null);
  const [wdWhy, setWdWhy] = useState('');
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t && TABS.some(([k]) => k === t)) setTab(t);
    setReady(true);
    const on = () => setTick((x) => x + 1);
    window.addEventListener(AFF_EVENT, on);
    window.addEventListener('gc:ledger', on);
    return () => { window.removeEventListener(AFF_EVENT, on); window.removeEventListener('gc:ledger', on); };
  }, []);
  const data = useMemo(() => {
    if (!ready) return null;
    const comm = getCommissions();
    const affs = getAffiliates().map((a) => ({ ...a, st: statsOf(a, commissionsOf(a.id, comm)) }));
    return { comm, affs, apps: getApplications(), s: affSettings(), preview: payoutPreview(comm), wds: getWithdrawals() };
  }, [ready, tick]);
  const go = (k) => { setTab(k); const u = new URL(window.location.href); u.searchParams.set('tab', k); window.history.replaceState(null, '', u); };
  const by = (currentUser() || {}).name || 'Staff';

  const body = () => {
    if (!data) return <div className="ix-card" style={{ minHeight: 300 }} aria-busy="true" />;
    const { comm, affs, apps, s, preview, wds } = data;
    const wdWaiting = wds.filter((x) => x.status === 'pending');
    const sum = (k) => affs.reduce((a, x) => a + x.st[k], 0);
    const waiting = apps.filter((x) => x.status === 'pending');
    const tabs = TABS.map(([k, l]) => ({ key: k, id: 'af-tab-' + k, label: l, on: tab === k, onClick: () => go(k), count: k === 'apps' && waiting.length ? waiting.length : k === 'wd' && wdWaiting.length ? wdWaiting.length : k === 'list' ? affs.length : undefined }));
    return (<>
      <MetricStrip label="Affiliates" items={[
        { label: 'Clicks', value: sum('clicks').toLocaleString('en-IN'), sub: 'on affiliate links' },
        { label: 'Orders', value: sum('orders').toLocaleString('en-IN'), sub: 'through affiliates' },
        { label: 'Pending', value: formatBDT(sum('pending')), sub: 'waiting for delivery or returns' },
        { label: 'Payable', value: formatBDT(sum('approved')), sub: preview.length ? `${preview.length} ready to pay` : `under ${formatBDT(s.minPayout)} each` },
        { label: 'Owed', value: formatBDT(sum('owed')), sub: 'in payouts', href: '/liabilities' },
      ]} />
      <section className="ix-card">
        <IndexTabs tabs={tabs} label="Affiliates" />
        {tab === 'list' ? (
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table">
              <caption className="sr-only">Affiliates</caption>
              <thead><tr><th scope="col">Affiliate</th><th scope="col">Code</th><th scope="col" className="ix-num">Clicks</th><th scope="col" className="ix-num">Orders</th><th scope="col" className="ix-num">Pending</th><th scope="col" className="ix-num">Payable</th><th scope="col" className="ix-num">Paid</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {affs.map((a) => (
                  <tr key={a.id} onClick={() => { window.location.href = '/affiliate?id=' + a.id; }} style={{ cursor: 'pointer' }}>
                    <td><span className="gc-picrow"><Pic src={picOf(a.phone)} name={a.name} kind="person" /><span><Link className="ix-strong" href={'/affiliate?id=' + a.id} onClick={(e) => e.stopPropagation()}>{a.name}</Link><span className="af-sub">{a.where} · {rateText(a, s)}</span></span></span></td>
                    <td><span className="ix-id">{a.code}</span></td>
                    <td className="ix-num">{a.st.clicks.toLocaleString('en-IN')}</td>
                    <td className="ix-num">{a.st.orders}</td>
                    <td className="ix-num">{formatBDT(a.st.pending)}</td>
                    <td className="ix-num">{formatBDT(a.st.approved)}</td>
                    <td className="ix-num">{formatBDT(a.st.paid)}</td>
                    <td><StatusBadge tone={a.status === 'active' ? 'success' : 'neutral'}>{a.status === 'active' ? 'Active' : 'Paused'}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {tab === 'apps' ? (!apps.length ? <EmptyState icon="user-plus" title="No applications yet" actionLabel="Open the sign-up page" onAction={() => window.open('/affiliate-program', '_blank')} /> : (
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table">
              <caption className="sr-only">Applications</caption>
              <thead><tr><th scope="col">Applicant</th><th scope="col">Where they share</th><th scope="col">Audience</th><th scope="col">Sent</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {apps.map((x) => (
                  <tr key={x.id} onClick={() => { setApp(x); setReason(''); }} style={{ cursor: 'pointer' }}>
                    <td><button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit' }} onClick={(e) => { e.stopPropagation(); setApp(x); setReason(''); }}>{x.name}</button><span className="af-sub">{x.person} · {x.phone}</span></td>
                    <td>{x.where}</td>
                    <td>{x.audience || '—'}</td>
                    <td>{formatDate(x.at)}</td>
                    <td><StatusBadge tone={x.status === 'pending' ? 'warning' : x.status === 'approved' ? 'success' : 'neutral'}>{x.status === 'pending' ? 'To review' : x.status === 'approved' ? 'Approved' : 'Rejected'}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )) : null}
        {tab === 'wd' ? (!wds.length ? <EmptyState icon="hand-coins" title={s.wdOn ? 'No withdrawal requests yet' : 'Withdrawal requests are off'} actionLabel={s.wdOn ? undefined : 'Turn them on'} onAction={s.wdOn ? undefined : () => go('settings')} /> : (
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table">
              <caption className="sr-only">Withdrawal requests</caption>
              <thead><tr><th scope="col">Request</th><th scope="col">Affiliate</th><th scope="col">Pay by</th><th scope="col" className="ix-num">Amount</th><th scope="col">Asked</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {wds.map((x) => (
                  <tr key={x.id} onClick={() => { setWd(x); setWdWhy(''); }} style={{ cursor: 'pointer' }}>
                    <td><button type="button" className="ix-strong ix-id" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit' }} onClick={(e) => { e.stopPropagation(); setWd(x); setWdWhy(''); }}>{x.id}</button><span className="af-sub">{x.orders.length} order{x.orders.length === 1 ? '' : 's'}</span></td>
                    <td>{x.name}<span className="af-sub">{x.code}</span></td>
                    <td>{(PAYOUT_METHODS.find(([k]) => k === x.method) || [0, x.method])[1]}<span className="af-sub">{x.number}</span></td>
                    <td className="ix-num">{formatBDT(x.amount)}</td>
                    <td>{formatDate(x.at)}</td>
                    <td><StatusBadge tone={WD_TONE[x.status]}>{WD_LABEL[x.status]}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )) : null}
        {tab === 'orders' ? (!comm.length ? <EmptyState icon="link" title="No orders through affiliates yet" /> : (
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table">
              <caption className="sr-only">Commissions</caption>
              <thead><tr><th scope="col">Order</th><th scope="col">Affiliate</th><th scope="col">Came by</th><th scope="col" className="ix-num">Sale</th><th scope="col" className="ix-num">Commission</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {comm.map((c) => {
                  const a = affs.find((x) => x.id === c.affiliate);
                  return (
                    <tr key={c.order}>
                      <td><Link className="ix-strong" href={'/order-detail?id=' + encodeURIComponent(c.order)}>{c.order}</Link><span className="af-sub">{formatDate(c.at)} · {c.customer}</span></td>
                      <td><Link href={'/affiliate?id=' + c.affiliate}>{a ? a.name : c.code}</Link></td>
                      <td>{c.via === 'code' ? 'Code ' + c.code : 'Link'}</td>
                      <td className="ix-num">{formatBDT(c.base)}</td>
                      <td className="ix-num">{formatBDT(c.amount)}</td>
                      <td><StatusBadge tone={STATE_TONE[c.state]}>{c.state === 'pending' || c.state === 'cancelled' || c.state === 'owed' ? c.label : COMMISSION_LABEL[c.state]}</StatusBadge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )) : null}
      </section>
      {tab === 'settings' ? <Settings /> : null}

      <Sheet open={!!app} title={app ? app.name : ''} onClose={() => setApp(null)}
        footer={app && app.status === 'pending' ? (<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { if (!reason.trim()) { toast('Write why, so we can tell them.', { tone: 'error' }); document.getElementById('af-why')?.focus(); return; } rejectApplication(app.id, reason, by); setApp(null); toast('Application rejected'); }}>Reject</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { const a = approveApplication(app.id, by); setApp(null); if (a) toast(`${a.name} is an affiliate. Their code is ${a.code}.`); }}>Approve</button>
        </>) : null}>
        {app ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <KV rows={[['Contact', app.person], ['Mobile', app.phone], ['Email', app.email || '—'], ['Where they share', app.where], ['Audience', app.audience || '—'], ['How', app.how || '—'], ['Sent', formatDate(app.at)], app.status !== 'pending' ? ['Decided', `${app.status === 'approved' ? 'Approved' : 'Rejected'} by ${app.by || 'Staff'}${app.reason ? ' · ' + app.reason : ''}`] : null].filter(Boolean)} />
            {app.status === 'pending' ? <div className="af-fld"><label className="gc-label" htmlFor="af-why">If you reject: why (sent to them)</label><input id="af-why" className="gc-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. We don't work with coupon websites" /></div> : null}
            {app.affiliate ? <Link className="ix-btn ix-btn--sm" href={'/affiliate?id=' + app.affiliate}>Open the affiliate</Link> : null}
          </div>
        ) : null}
      </Sheet>
      <Sheet open={!!wd} title={wd ? `Withdrawal ${wd.id}` : ''} onClose={() => setWd(null)}
        footer={wd && wd.status === 'pending' ? (<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { if (!wdWhy.trim()) { toast('Write why, so we can tell them.', { tone: 'error' }); document.getElementById('af-wwhy')?.focus(); return; } rejectWithdrawal(wd.id, wdWhy, by); setWd(null); toast(`${wd.id} rejected. The orders are payable again.`); }}>Reject</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { const r = approveWithdrawal(wd.id, by); setWd(null); if (r) toast(`${formatBDT(r.amount)} for ${r.name} is now owed in Finances › Liabilities (${r.liab}).`); }}>Approve</button>
        </>) : null}>
        {wd ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <KV rows={[['Affiliate', `${wd.name} · ${wd.code}`], ['Amount', formatBDT(wd.amount) + (wd.asked && wd.asked !== wd.amount ? ` (asked ${formatBDT(wd.asked)}; whole orders only)` : '')], ['Pay by', `${(PAYOUT_METHODS.find(([k]) => k === wd.method) || [0, wd.method])[1]} · ${wd.number}`], ['Orders', wd.orders.join(', ')], ['Asked on', formatDate(wd.at)], wd.status !== 'pending' ? ['Decided', `${WD_LABEL[wd.status]} by ${wd.by || 'Staff'}${wd.reason ? ' · ' + wd.reason : ''}`] : null].filter(Boolean)} />
            {wd.status === 'pending' ? <div className="af-fld"><label className="gc-label" htmlFor="af-wwhy">If you reject: why (sent to them)</label><input id="af-wwhy" className="gc-input" value={wdWhy} onChange={(e) => setWdWhy(e.target.value)} placeholder="e.g. Order #136742 is being returned" /></div> : null}
            {wd.status === 'pending' ? <p className="af-sub" style={{ margin: 0 }}>Approve adds {formatBDT(wd.amount)} to Finances › Liabilities, due in 3 days. You pay it there.</p> : null}
            {wd.liab ? <Link className="ix-btn ix-btn--sm" href="/liabilities">Open in Liabilities ({wd.liab})</Link> : null}
          </div>
        ) : null}
      </Sheet>
      <Sheet open={pay} title="Make payouts" onClose={() => setPay(false)}
        footer={data && data.preview.length ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setPay(false)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { const r = makePayouts(by); setPay(false); if (r) toast(`${formatBDT(r.liability.amount)} for ${r.rows.length} affiliate${r.rows.length === 1 ? '' : 's'} is now owed in Finances › Liabilities (${r.liability.id}).`); }}>Make payouts</button></> : null}>
        {data ? (data.preview.length ? (<>
          <ul className="af-pay">{data.preview.map((r) => <li key={r.affiliate.id}><span>{r.affiliate.name} <span className="af-sub">{r.orders.length} order{r.orders.length === 1 ? '' : 's'}</span></span><b>{formatBDT(r.amount)}</b></li>)}</ul>
          <p className="af-sub" style={{ marginTop: 'var(--space-4)' }}>This adds the money owed to Finances › Liabilities, due in 5 days. You pay it there, from the account you choose.</p>
        </>) : <p className="af-sub">Nothing is payable from the minimum payout ({formatBDT(data.s.minPayout)}) up yet. Commission becomes payable {data.s.returnDays} days after delivery.</p>) : null}
      </Sheet>
    </>);
  };

  return (
    <TeamPage screen="Affiliates" active="mkt-affiliates" crumb="Marketing" page="Affiliates" title="Affiliates" icon="share-2" css={CSS}
      about="People who promote your shop get a link and a code. Orders through them earn a commission, which becomes payable after delivery and the return window. Make payouts adds what is payable to Finances › Liabilities, where you pay it."
      more={[{ label: 'Open the sign-up page', href: '/affiliate-program' }, { label: 'Liabilities', href: '/liabilities' }]}
      primary={{ label: 'Make payouts', onClick: () => setPay(true) }}>
      {body()}
    </TeamPage>
  );
}
