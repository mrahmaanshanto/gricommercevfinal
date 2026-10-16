'use client';
// Vendor portal › Money (/vendor-money?tab=; Batch E): the vendor's statement (gridShop.vendorStatement). Figures: the
// balance (delivered parcels not yet paid, less monthly fees due), on the way (parcels not yet delivered), paid out, next
// payout day. Tabs: Parcels (each delivered parcel: price, commission, discount the vendor paid, fee, you get, owed / in a
// payout / paid) · Monthly fees · Payouts. Request payout asks GridCommerce to pay the balance (Finance pays it to the
// payout account in Profile).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ShopHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { EmptyState, StatusBadge } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { vendorStatement, requestPayout } from '@/lib/platform/gridShop';
import { bankText } from '@/lib/platform/services';
import { VendorFrame, useVendor, tk, qp, dShort, say, picOf } from './vendorShared';

const TABS = [['parcels', 'Parcels'], ['fees', 'Monthly fees'], ['payouts', 'Payouts']];
const PAY = { owed: ['Owed', 'warning'], paid: ['Paid', 'success'], unpaid: ['Not delivered', 'neutral'] };

function Body({ v }) {
  const { tick } = useVendor();
  const [tab, setTab] = useState('parcels');
  useEffect(() => { const t = qp('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);
  const st = useMemo(() => vendorStatement(v.id), [v.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const T = st.totals;
  const can = !st.open && T.balance > 0;
  const ask = async () => {
    if (!(await confirmDialog({ title: `Request ${tk(T.balance)}?`, body: `${tk(T.owedParcels)} for ${st.delivered.filter((p) => p.pay === 'owed' && !p.payoutId).length} delivered parcels${T.feesDue ? `, less ${tk(T.feesDue)} monthly fees` : ''}. GridCommerce pays it to ${bankText(v.bank)}.`, confirmLabel: 'Request payout' }))) return;
    say(toast, requestPayout(v.id, v.contact || v.name), 'Payout requested');
  };
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'vm-' + k, label: l, count: k === 'parcels' ? st.delivered.length : k === 'fees' ? st.fees.length : st.payouts.length, on: tab === k, onClick: () => setTab(k) }));
  const payWord = (p) => (p.pay === 'owed' && p.payoutId ? ['In payout ' + p.payoutId, 'info'] : PAY[p.pay] || [p.pay, 'neutral']);
  return (<>
    <ShopHeader icon="wallet" title="Money" about="What Grid Shop owes you. A parcel is owed to you once it is delivered: what the store paid for your items, less our commission (markup pricing: your own price), any store discount you pay for and your fee per parcel. Monthly fees come off your next payout when your balance covers them. Payouts go to the account in your profile."
      primary={{ label: 'Request payout', icon: 'hand-coins', onClick: () => (can ? ask() : toast(st.open ? `Payout ${st.open.id} is already requested.` : T.feesDue > T.owedParcels && T.owedParcels > 0 ? 'Your fees are more than what is owed; they come off your next sales.' : 'Nothing to pay out yet. Parcels are owed once delivered.', { tone: 'error' })) }} />
    <MetricStrip items={[
      { label: 'Balance', value: tk(T.balance), sub: T.feesDue ? `after ${tk(T.feesDue)} fees` : 'owed to you', icon: 'wallet' },
      { label: 'Not delivered yet', value: tk(T.onTheWay), sub: 'owed once delivered', icon: 'truck' },
      st.open ? { label: 'Requested', value: tk(st.open.amount), sub: st.open.id, icon: 'hourglass' } : null,
      { label: 'Paid out', value: tk(T.paid), sub: st.payouts.filter((p) => p.status === 'paid').length + ' payouts', icon: 'banknote' },
      { label: 'Next payout', value: dShort(st.nextPayoutAt), sub: `every ${v.payoutEvery} days`, icon: 'calendar' },
    ]} />
    {st.open ? <p className="vd-note"><Icon name="hourglass" width="16" height="16" aria-hidden="true" />Payout {st.open.id} of {tk(st.open.amount)} requested {dShort(st.open.at)}. GridCommerce pays it within two working days to {bankText(st.open.to || v.bank)}.</p> : null}
    <section className="ix-card" aria-label="Statement">
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Statement" /></div>
      {tab === 'parcels' ? (st.delivered.length ? (<>
        <ul className="ix-plist">{st.delivered.map((p) => { const [w, tone] = payWord(p); return <li key={p.key}><Link href={`/vendor-order?id=${p.orderId}&s=${p.shipmentId}`} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={picOf(p.lines[0])} name={p.lines[0].name} kind="item" /></span><span className="ix-pitem__top"><b>{p.shopName} · {tk(p.youGet)}</b><span><StatusBadge tone={tone}>{w}</StatusBadge></span></span><span className="ix-pitem__mid">{p.orderId} · {dShort(p.at)} · {p.items}</span></Link></li>; })}</ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Delivered parcels</caption>
            <thead><tr><th scope="col">Parcel</th><th scope="col">Delivered</th><th scope="col" className="ix-num">Store paid</th><th scope="col" className="ix-num">Commission</th><th scope="col" className="ix-num">Discount you paid</th><th scope="col" className="ix-num">Fee</th><th scope="col" className="ix-num">You get</th><th scope="col">Status</th></tr></thead>
            <tbody>{st.delivered.map((p) => { const [w, tone] = payWord(p); return (
              <tr key={p.key}>
                <td><span className="gc-picrow"><Pic src={picOf(p.lines[0])} name={p.lines[0].name} kind="item" size={32} /><span><Link href={`/vendor-order?id=${p.orderId}&s=${p.shipmentId}`} className="ix-strong">{p.shopName}</Link><span className="vd-sub">{p.orderId} · {p.lines.reduce((a, l) => a + l.qty, 0)} item{p.lines.reduce((a, l) => a + l.qty, 0) === 1 ? '' : 's'}</span></span></span></td>
                <td>{dShort(p.at)}</td>
                <td className="ix-num">{tk(p.sales)}</td>
                <td className="ix-num">{p.commission ? '−' + tk(p.commission) : '—'}</td>
                <td className="ix-num">{p.discountFunded ? '−' + tk(p.discountFunded) : '—'}</td>
                <td className="ix-num">{p.fee ? '−' + tk(p.fee) : '—'}</td>
                <td className="ix-num">{tk(p.youGet)}</td>
                <td><StatusBadge tone={tone}>{w}</StatusBadge></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </>) : <div className="ix-empty"><EmptyState icon="receipt" title="No delivered parcels yet" body="A parcel shows here once it is delivered." /></div>) : null}
      {tab === 'fees' ? (st.fees.length ? (
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table">
            <caption className="sr-only">Monthly fees</caption>
            <thead><tr><th scope="col">Month</th><th scope="col">Charged</th><th scope="col" className="ix-num">Amount</th><th scope="col">Status</th></tr></thead>
            <tbody>{st.fees.slice().reverse().map((f) => <tr key={f.id}><td>{new Date(f.at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</td><td>{dShort(f.at)}</td><td className="ix-num">{tk(f.amount)}</td><td><StatusBadge tone={f.settled ? 'success' : f.payoutId ? 'info' : 'warning'}>{f.settled ? 'Taken in ' + f.payoutId : f.payoutId ? 'In ' + f.payoutId : 'Due'}</StatusBadge></td></tr>)}</tbody>
          </table>
        </div>
      ) : <div className="ix-empty"><EmptyState icon="calendar" title="No monthly fees" body={v.monthlyFee ? `${tk(v.monthlyFee)} is charged on the 1st of each month.` : 'Your plan has no monthly fee.'} /></div>) : null}
      {tab === 'payouts' ? (st.payouts.length ? (
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table">
            <caption className="sr-only">Payouts</caption>
            <thead><tr><th scope="col">Payout</th><th scope="col">Date</th><th scope="col" className="ix-num">Parcels</th><th scope="col" className="ix-num">Fees</th><th scope="col" className="ix-num">Paid to you</th><th scope="col">Status</th></tr></thead>
            <tbody>{st.payouts.map((p) => <tr key={p.id}><td><b className="ix-strong">{p.id}</b><span className="vd-sub">{bankText(p.to || v.bank)}</span></td><td>{dShort(p.paidAt || p.at)}</td><td className="ix-num">{tk(p.gross)}<span className="vd-sub">{p.parcels.length} parcel{p.parcels.length === 1 ? '' : 's'}</span></td><td className="ix-num">{p.feeTotal ? '−' + tk(p.feeTotal) : '—'}</td><td className="ix-num">{tk(p.amount)}</td><td><StatusBadge tone={p.status === 'paid' ? 'success' : 'info'}>{p.status === 'paid' ? 'Paid' + (p.ref ? ' · ' + p.ref : '') : 'Requested'}</StatusBadge></td></tr>)}</tbody>
          </table>
        </div>
      ) : <div className="ix-empty"><EmptyState icon="hand-coins" title="No payouts yet" body="Request one when your balance is above zero." /></div>) : null}
    </section>
  </>);
}

export default function VendorMoney() {
  return <VendorFrame active="money" screen="VendorMoney">{(v) => <Body v={v} />}</VendorFrame>;
}
