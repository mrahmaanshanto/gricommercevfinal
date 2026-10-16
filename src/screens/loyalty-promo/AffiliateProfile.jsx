'use client';
// AffiliateProfile — one affiliate (/affiliate?id=; Marketing › Affiliates, Batch B step 3): their link and code (with a
// QR to share), clicks, orders and earnings (pending, payable, owed in a payout, paid), every order that came through
// them, their payouts (Finances › Liabilities lines) and details (contact, where they share, payout method). Edit
// changes the code, their own commission rate and the payout method; Pause stops the link and code counting.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, KV } from '@/components/ui/IndexKit';
import { QrCode } from '@/components/QrCode';
import { formatBDT, formatDate } from '@/lib/format';
import { affiliateBy, updateAffiliate, commissionsOf, statsOf, payoutsOf, affLink, affSettings, rateText, COMMISSION_LABEL, PAYOUT_METHODS, AFF_EVENT } from '@/lib/affiliates';
import { TeamPage } from '@/screens/team/teamShared';
import { STATE_TONE } from './Affiliates';

const CSS = `
.afp-link{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.afp-url{display:flex;gap:var(--space-2);align-items:center}
.afp-url code{flex:1;min-width:0;padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-sm);overflow-wrap:anywhere}
.afp-qr{display:flex;align-items:center;gap:var(--space-3)}
.afp-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.afp-h{margin:0;padding:var(--space-3) var(--space-4) 0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.afp-form{display:flex;flex-direction:column;gap:var(--space-3)}
.af-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
`;

export default function AffiliateProfile() {
  const [id, setId] = useState('');
  const [tick, setTick] = useState(0);
  const [edit, setEdit] = useState(null);
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get('id') || '-');
    setOrigin(window.location.origin);
    const on = () => setTick((x) => x + 1);
    window.addEventListener(AFF_EVENT, on);
    window.addEventListener('gc:ledger', on);
    return () => { window.removeEventListener(AFF_EVENT, on); window.removeEventListener('gc:ledger', on); };
  }, []);
  const d = useMemo(() => {
    if (!id) return null;
    const a = affiliateBy(id);
    if (!a) return { a: null };
    const comm = commissionsOf(a.id);
    return { a, comm, st: statsOf(a, comm), pays: payoutsOf(a), s: affSettings() };
  }, [id, tick]);

  const page = (props, children) => <TeamPage screen="AffiliateProfile" active="mkt-affiliates" crumb="Marketing" page="Affiliates" back="/affiliates" css={CSS} {...props}>{children}</TeamPage>;
  if (!d) return page({ title: 'Affiliate', meta: ' ' }, <div className="ix-card" style={{ minHeight: 300 }} aria-busy="true" />);
  if (!d.a) return page({ title: 'Affiliate not found', meta: ' ' }, <section className="ix-card ix-card--pad"><EmptyState icon="user-x" title="No affiliate with this ID." actionLabel="All affiliates" onAction={() => { window.location.href = '/affiliates'; }} /></section>);
  const { a, comm, st, pays, s } = d;
  const link = affLink(a, origin);
  const copy = async (t, what) => { try { await navigator.clipboard.writeText(t); toast(what + ' copied'); } catch { toast(t); } };
  const pause = async () => {
    if (a.status === 'active' && !(await confirmDialog({ title: `Pause ${a.name}?`, body: 'Their link and code stop counting new orders. Orders already made keep their commission.', confirmLabel: 'Pause' }))) return;
    updateAffiliate(a.id, { status: a.status === 'active' ? 'paused' : 'active' });
    toast(a.status === 'active' ? 'Paused' : 'Active again');
  };
  const saveEdit = () => {
    const r = updateAffiliate(a.id, { code: edit.code, rate: edit.rate === '' ? null : Math.max(0, Math.min(90, Number(edit.rate) || 0)), payout: { method: edit.method, number: edit.number.trim() } });
    if (r && r.error) { toast(r.error, { tone: 'error' }); return; }
    setEdit(null); toast('Affiliate saved');
  };

  return page({
    title: a.name,
    badges: <StatusBadge tone={a.status === 'active' ? 'success' : 'neutral'}>{a.status === 'active' ? 'Active' : 'Paused'}</StatusBadge>,
    meta: [a.code, rateText(a, s), a.where, 'since ' + formatDate(a.joined)].join(' · '),
    about: 'One affiliate: their link and code, what came through them and what they earned. Commission is payable after delivery and the return window; payouts are paid in Finances › Liabilities.',
    secondary: [{ label: 'Copy link', onClick: () => copy(link, 'Link') }],
    more: [{ label: a.status === 'active' ? 'Pause' : 'Make active again', onClick: pause }, { label: 'Liabilities', href: '/liabilities' }],
    primary: { label: 'Edit', onClick: () => setEdit({ code: a.code, rate: a.rate == null ? '' : String(a.rate), method: (a.payout || {}).method || 'bkash', number: (a.payout || {}).number || '' }) },
  }, (<>
    <MetricStrip label="Results" items={[
      { label: 'Clicks', value: st.clicks.toLocaleString('en-IN') },
      { label: 'Orders', value: String(st.orders), sub: st.clicks ? ((st.orders / st.clicks) * 100).toFixed(1) + '% of clicks' : '' },
      { label: 'Pending', value: formatBDT(st.pending) },
      { label: 'Payable', value: formatBDT(st.approved) },
      { label: 'Owed', value: formatBDT(st.owed), sub: 'in payouts' },
      { label: 'Paid', value: formatBDT(st.paid) },
    ]} />
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card" aria-labelledby="afp-o">
          <h2 className="afp-h" id="afp-o">Orders through {a.name}</h2>
          {!comm.length ? <EmptyState icon="link" title="No orders through this affiliate yet" /> : (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table">
                <caption className="sr-only">Orders</caption>
                <thead><tr><th scope="col">Order</th><th scope="col">Came by</th><th scope="col" className="ix-num">Sale</th><th scope="col" className="ix-num">Commission</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {comm.map((c) => (
                    <tr key={c.order}>
                      <td><Link className="ix-strong" href={'/order-detail?id=' + encodeURIComponent(c.order)}>{c.order}</Link><span className="afp-sub">{formatDate(c.at)} · {c.customer}</span></td>
                      <td>{c.via === 'code' ? 'Code' : 'Link'}</td>
                      <td className="ix-num">{formatBDT(c.base)}</td>
                      <td className="ix-num">{formatBDT(c.amount)}</td>
                      <td><StatusBadge tone={STATE_TONE[c.state]}>{c.state === 'approved' || c.state === 'paid' ? COMMISSION_LABEL[c.state] : c.label}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="ix-card" aria-labelledby="afp-p">
          <h2 className="afp-h" id="afp-p">Payouts</h2>
          {!pays.length ? <EmptyState icon="wallet" title="No payouts yet" /> : (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table">
                <caption className="sr-only">Payouts</caption>
                <thead><tr><th scope="col">Payout</th><th scope="col">Due</th><th scope="col" className="ix-num">Amount</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {pays.map((p) => (
                    <tr key={p.liab}>
                      <td><Link className="ix-strong" href="/liabilities">{p.title}</Link><span className="afp-sub">{p.liab}{p.note ? ' · ' + p.note : ''}</span></td>
                      <td>{formatDate(p.due)}</td>
                      <td className="ix-num">{formatBDT(p.amount)}</td>
                      <td><StatusBadge tone={p.paid >= p.amount ? 'success' : p.paid > 0 ? 'warning' : 'info'}>{p.paid >= p.amount ? 'Paid' : p.paid > 0 ? 'Partly paid' : 'Owed'}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <aside className="ix-side">
        <section className="ix-card" aria-labelledby="afp-l">
          <h2 className="afp-h" id="afp-l">Link and code</h2>
          <div className="afp-link">
            <div className="afp-url"><code>{link}</code><button type="button" className="ix-btn ix-btn--sm" onClick={() => copy(link, 'Link')}>Copy</button></div>
            <div className="afp-qr"><QrCode text={link} size={96} label={'QR code for ' + a.name + "'s link"} /><span className="afp-sub">Code at checkout: <b className="ix-id">{a.code}</b><br />An order within {s.linkDays} days of a click counts.</span></div>
          </div>
        </section>
        <section className="ix-card ix-card--pad" aria-label="Details">
          <KV rows={[['Contact', a.person], ['Mobile', a.phone], ['Email', a.email], ['Where they share', a.where], ['Audience', a.audience], ['Commission', rateText(a, s) + (a.rate == null ? ' (programme rate)' : '')], ['Paid by', ((PAYOUT_METHODS.find(([k]) => k === (a.payout || {}).method) || [])[1] || '—') + ((a.payout || {}).number ? ' · ' + a.payout.number : '')]]} />
        </section>
      </aside>
    </div>
    <Sheet open={!!edit} title={'Edit ' + a.name} onClose={() => setEdit(null)} footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveEdit}>Save</button></>}>
      {edit ? (
        <div className="afp-form">
          <div className="af-fld"><label className="gc-label" htmlFor="afp-code">Code</label><input id="afp-code" className="gc-input" value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} /><span className="afp-sub">Changing it changes the link. Old links stop counting.</span></div>
          {s.type === 'percent' ? <div className="af-fld"><label className="gc-label" htmlFor="afp-rate">Their commission (%)</label><input id="afp-rate" className="gc-input" inputMode="decimal" value={edit.rate} placeholder={String(s.rate) + ' (programme rate)'} onChange={(e) => setEdit({ ...edit, rate: e.target.value })} /><span className="afp-sub">Empty = the programme rate. Category rates still apply.</span></div> : null}
          <div className="af-fld"><label className="gc-label" htmlFor="afp-m">Paid by</label><select id="afp-m" className="gc-input gc-select" value={edit.method} onChange={(e) => setEdit({ ...edit, method: e.target.value })}>{PAYOUT_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div className="af-fld"><label className="gc-label" htmlFor="afp-n">{edit.method === 'bank' ? 'Bank and account number' : 'Number'}</label><input id="afp-n" className="gc-input" value={edit.number} onChange={(e) => setEdit({ ...edit, number: e.target.value })} /></div>
        </div>
      ) : null}
    </Sheet>
  </>));
}
