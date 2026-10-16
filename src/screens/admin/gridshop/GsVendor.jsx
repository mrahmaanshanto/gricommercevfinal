'use client';
// Grid Shop › a vendor (/admin/grid-shop/vendor?id=&tab=; Batch E): the vendor's record in four tabs —
//   Profile & pricing  company, contact, logo, days, payout account, return / warranty terms; the pricing model
//                      (commission or markup) and its rate, fee per parcel, monthly fee, payout every n days (editable),
//                      and the pricing rules that change them now
//   Products           every product with its approval: Approve / Reject (with a reason) new ones and changes (old → new)
//   Parcels            every parcel the vendor has to ship or shipped, with what the vendor gets
//   Money              the statement (delivered parcels, monthly fees, payouts), what is owed now and Pay (marks the
//                      payout paid; lib/admin/gridShopSync.js books it in Finance)
// Pause stops stores seeing the vendor's products. Data: lib/platform/gridShop.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { RecordHeader, IndexTabs, MetricStrip, KV } from '@/components/ui/IndexKit';
import { EmptyState, StatusBadge, Sheet } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { staff } from '@/lib/platform/store';
import { vendorById, saveVendor, setVendorStatus, getProducts, reviewOf, vendorParcels, vendorStatement, payVendor, priceFor, vendorRates, approveProduct, approveChange, MODELS, SHIP_STATUS, ruleValueText } from '@/lib/platform/gridShop';
import { bankText, BANK_METHODS } from '@/lib/platform/services';
import { AdminShell } from '../AdminShell';
import { tk, dShort, qp, SVA_CSS } from '../services/svcAdmin';
import { PicturePicker, MEDIA_CSS } from '../services/SvcMedia';
import { useGs, GSA_CSS, ReviewBadge, gsPic } from './gsAdmin';
import { RejectSheet, ChangeLines } from './GsProducts';

const TABS = [['profile', 'Profile and pricing'], ['products', 'Products'], ['parcels', 'Parcels'], ['money', 'Money']];
const say = (r, ok) => { if (r && r.ok === false) { toast(r.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };

function Profile({ v }) {
  const [f, setF] = useState(() => JSON.parse(JSON.stringify({ ...v, bank: v.bank || { method: 'bank', name: '', account: '', branch: '' }, terms: v.terms || { returns: '', warranty: '' } })));
  const [pick, setPick] = useState(false);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const r = vendorRates(v.id);
  const save = () => say(saveVendor(f), 'Saved');
  return (
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card sva-pad" aria-labelledby="gv-co">
          <h2 id="gv-co">Company</h2>
          <div className="sva-row"><Pic src={f.logo} name={f.name} kind="logo" size={48} /><button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick(true)}><Icon name="image" width="14" height="14" aria-hidden="true" />{f.logo ? 'Change logo' : 'Add logo'}</button>{f.logo ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ logo: '' })}>Remove</button> : null}</div>
          <div className="sva-grid2">
            <div><label className="gc-label" htmlFor="gv-n">Name</label><input id="gv-n" className="gc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gv-a">What they sell</label><input id="gv-a" className="gc-input" value={f.about || ''} onChange={(e) => set({ about: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gv-c">Contact person</label><input id="gv-c" className="gc-input" value={f.contact || ''} onChange={(e) => set({ contact: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gv-p">Phone</label><input id="gv-p" className="gc-input" value={f.phone || ''} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gv-e">Email</label><input id="gv-e" className="gc-input" value={f.email || ''} onChange={(e) => set({ email: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gv-d">Usual days to the store</label><input id="gv-d" className="gc-input" inputMode="numeric" value={f.days} onChange={(e) => set({ days: e.target.value })} /></div>
          </div>
          <div className="sva-grid2">
            <div><label className="gc-label" htmlFor="gv-r">Returns</label><input id="gv-r" className="gc-input" value={f.terms.returns} onChange={(e) => set({ terms: { ...f.terms, returns: e.target.value } })} /></div>
            <div><label className="gc-label" htmlFor="gv-w">Warranty</label><input id="gv-w" className="gc-input" value={f.terms.warranty} onChange={(e) => set({ terms: { ...f.terms, warranty: e.target.value } })} /></div>
          </div>
        </section>
        <section className="ix-card sva-pad" aria-labelledby="gv-pr">
          <h2 id="gv-pr">Pricing and charges</h2>
          <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <legend className="gc-label">Pricing model</legend>
            {Object.entries(MODELS).map(([k, l]) => <label key={k} className="sva-chk" style={{ whiteSpace: 'normal' }}><input type="radio" name="gv-m" className="gc-check gc-check--radio" checked={f.model === k} onChange={() => set({ model: k })} />{l}</label>)}
          </fieldset>
          <div className="sva-grid2">
            {f.model === 'markup' ? <div><label className="gc-label" htmlFor="gv-mk">Markup on the vendor’s price (%)</label><input id="gv-mk" className="gc-input" inputMode="decimal" value={f.markupPct} onChange={(e) => set({ markupPct: e.target.value })} /></div>
              : <div><label className="gc-label" htmlFor="gv-cm">Commission (%)</label><input id="gv-cm" className="gc-input" inputMode="decimal" value={f.commissionPct} onChange={(e) => set({ commissionPct: e.target.value })} /></div>}
            <div><label className="gc-label" htmlFor="gv-fp">Fee per parcel (৳)</label><input id="gv-fp" className="gc-input" inputMode="numeric" value={f.feePerOrder} onChange={(e) => set({ feePerOrder: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gv-mf">Monthly fee (৳)</label><input id="gv-mf" className="gc-input" inputMode="numeric" value={f.monthlyFee} onChange={(e) => set({ monthlyFee: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gv-pe">Pay out every (days)</label><input id="gv-pe" className="gc-input" inputMode="numeric" value={f.payoutEvery} onChange={(e) => set({ payoutEvery: e.target.value })} /></div>
          </div>
          <p className="gc-help" style={{ margin: 0 }}>A pricing rule for this vendor replaces these while it runs.</p>
        </section>
        <section className="ix-card sva-pad" aria-labelledby="gv-bank">
          <h2 id="gv-bank">Payout account</h2>
          <div className="sva-grid2">
            <div><label className="gc-label" htmlFor="gv-bm">Paid by</label><select id="gv-bm" className="gc-input gc-select" value={f.bank.method} onChange={(e) => set({ bank: { ...f.bank, method: e.target.value } })}>{BANK_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            {f.bank.method === 'bank' ? <div><label className="gc-label" htmlFor="gv-bn">Bank</label><input id="gv-bn" className="gc-input" value={f.bank.name || ''} onChange={(e) => set({ bank: { ...f.bank, name: e.target.value } })} /></div> : null}
            <div><label className="gc-label" htmlFor="gv-ba">{f.bank.method === 'bank' ? 'Account number' : 'Number'}</label><input id="gv-ba" className="gc-input" value={f.bank.account || ''} onChange={(e) => set({ bank: { ...f.bank, account: e.target.value } })} /></div>
            {f.bank.method === 'bank' ? <div><label className="gc-label" htmlFor="gv-bb">Branch</label><input id="gv-bb" className="gc-input" value={f.bank.branch || ''} onChange={(e) => set({ bank: { ...f.bank, branch: e.target.value } })} /></div> : null}
          </div>
        </section>
        <div><button type="button" className="ix-btn ix-btn--primary" onClick={save}><Icon name="check" width="16" height="16" aria-hidden="true" />Save</button></div>
      </div>
      <aside className="ix-side" aria-label="Rates now">
        <section className="ix-card sva-pad">
          <h2>Rates now</h2>
          {r ? <KV rows={[
            v.model === 'markup' ? ['Markup', r.markup.rule ? `${ruleValueText(r.markup.rule)} · rule` : r.markup.value + '%'] : ['Commission', r.commission.rule ? `${ruleValueText(r.commission.rule)} · rule until ${dShort(r.commission.rule.to)}` : r.commission.value + '%'],
            ['Fee per parcel', tk(r.feePerOrder.value) + (r.feePerOrder.rule ? ' · rule' : '')],
            ['Monthly fee', tk(r.monthlyFee.value) + (r.monthlyFee.rule ? ' · rule' : '')],
            ['Joined', dShort(v.joinedAt)],
          ]} /> : null}
          {r && r.discounts.length ? <ul className="sva-files">{r.discounts.map((x) => <li key={x.id}><span>{x.name}<span className="sva-sub">{ruleValueText(x)} off for stores · paid by {x.fundedBy === 'vendor' ? v.name : 'GridCommerce'}{x.to ? ' · until ' + dShort(x.to) : ''}</span></span></li>)}</ul> : null}
          <Link href="/admin/grid-shop/pricing" className="bl-link" style={{ fontSize: 'var(--text-sm)' }}>Pricing rules</Link>
        </section>
      </aside>
      <PicturePicker open={pick} title="Vendor logo" onPick={({ src }) => { set({ logo: src }); setPick(false); }} onClose={() => setPick(false)} />
    </div>
  );
}

function Products({ v, by }) {
  const [rej, setRej] = useState(null);
  const rows = getProducts().filter((p) => p.vendorId === v.id);
  if (!rows.length) return <section className="ix-card ix-empty"><EmptyState icon="package" title="No products yet" body="The vendor adds them in their portal." /></section>;
  return (
    <section className="ix-card" aria-label="Products">
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table">
          <caption className="sr-only">The vendor’s products</caption>
          <thead><tr><th scope="col">Product</th><th scope="col">Approval</th><th scope="col" className="ix-num">Vendor’s price</th><th scope="col" className="ix-num">Store pays</th><th scope="col" className="ix-num">We keep</th><th scope="col" className="ix-num">Stock</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{rows.map((p) => { const b = priceFor(p, '', 1); const r = reviewOf(p); return (
            <tr key={p.id}>
              <td><span className="gc-picrow"><Pic src={gsPic(p)} name={p.name} kind="item" size={32} /><span><Link href={'/admin/grid-shop/product?id=' + p.id} className="ix-strong">{p.name}</Link><span className="sva-sub">{p.status === 'live' ? 'On sale' : 'Paused'} by the vendor</span></span></span></td>
              <td><ReviewBadge p={p} always />{r === 'rejected' ? <span className="sva-sub">{p.review.reason}</span> : null}{p.pendingChange ? <ChangeLines p={p} /> : null}</td>
              <td className="ix-num">{tk(p.price)}</td>
              <td className="ix-num">{tk(b.storeUnitNet)}</td>
              <td className="ix-num">{tk(b.gcKeeps)}</td>
              <td className="ix-num">{p.madeToOrder ? 'Made to order' : p.stock}</td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                {r === 'pending' ? <><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => say(approveProduct(p.id, by), 'Approved: stores see it now')}>Approve</button>{' '}<button type="button" className="ix-btn ix-btn--sm" onClick={() => setRej({ p, kind: 'product' })}>Reject</button></> : null}
                {p.pendingChange ? <><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => say(approveChange(p.id, by), 'Change approved')}>Approve change</button>{' '}<button type="button" className="ix-btn ix-btn--sm" onClick={() => setRej({ p, kind: 'change' })}>Reject</button></> : null}
              </td>
            </tr>
          ); })}</tbody>
        </table>
      </div>
      <RejectSheet rej={rej} by={by} onClose={() => setRej(null)} />
    </section>
  );
}

function Parcels({ v }) {
  const rows = vendorParcels(v.id);
  if (!rows.length) return <section className="ix-card ix-empty"><EmptyState icon="truck" title="No parcels yet" /></section>;
  return (
    <section className="ix-card" aria-label="Parcels">
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table">
          <caption className="sr-only">The vendor’s parcels</caption>
          <thead><tr><th scope="col">Parcel</th><th scope="col">Items</th><th scope="col">Status</th><th scope="col" className="ix-num">Store paid</th><th scope="col" className="ix-num">Vendor gets</th></tr></thead>
          <tbody>{rows.map((x) => (
            <tr key={x.o.id + x.s.id}>
              <td><span className="gc-picrow"><Pic src={gsPic(x.lines[0])} name={x.lines[0].name} kind="item" size={32} /><span><Link href={'/admin/grid-shop/order?id=' + x.o.id} className="ix-strong">{x.o.shopName}</Link><span className="sva-sub">{x.o.id}/{x.s.id} · {dShort(x.o.paid.at)}</span></span></span></td>
              <td className="ix-muted" style={{ maxWidth: 320 }}>{x.lines.map((l) => `${l.qty} × ${l.name}`).join(', ')}</td>
              <td><StatusBadge tone={x.state === 'done' ? 'success' : x.state === 'way' ? 'primary' : 'warning'}>{x.s.status === 'sent' ? 'Not accepted yet' : SHIP_STATUS[x.s.status]}</StatusBadge>{x.s.tracking ? <span className="sva-sub">{x.s.courier} · {x.s.tracking}</span> : null}</td>
              <td className="ix-num">{tk(x.sales)}</td>
              <td className="ix-num">{tk(x.amount)}<span className="sva-sub">{x.s.pay ? (x.s.pay.status === 'unpaid' ? 'when delivered' : x.s.pay.status === 'paid' ? 'paid' : x.s.pay.payoutId ? 'in ' + x.s.pay.payoutId : 'owed') : ''}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

function Money({ v, by }) {
  const [pay, setPay] = useState(null);
  const st = vendorStatement(v.id);
  const T = st.totals;
  const amount = st.open ? st.open.amount : T.balance;
  const go = () => { if (say(payVendor(v.id, { ref: pay.ref, by }), `Paid ${tk(amount)} to ${v.name}`)) setPay(null); };
  return (<>
    <MetricStrip items={[
      { label: 'Owed now', value: tk(T.owedParcels), sub: 'delivered parcels', icon: 'hand-coins' },
      { label: 'Fees due', value: tk(T.feesDue), sub: 'monthly, unpaid', icon: 'receipt' },
      { label: 'To pay', value: tk(amount), sub: st.open ? 'requested ' + dShort(st.open.at) : 'after fees', icon: 'wallet' },
      { label: 'Not delivered yet', value: tk(T.onTheWay), icon: 'truck' },
      { label: 'Paid', value: tk(T.paid), sub: st.payouts.filter((p) => p.status === 'paid').length + ' payouts', icon: 'banknote' },
    ]} />
    <section className="ix-card sva-pad" aria-labelledby="gv-pay">
      <h2 id="gv-pay">Pay {v.name}</h2>
      {amount > 0 ? <p className="gc-help" style={{ margin: 0 }}>{st.open ? `${v.name} asked for payout ${st.open.id} on ${dShort(st.open.at)}.` : `${T.owedParcels ? tk(T.owedParcels) + ' for delivered parcels' : ''}${T.feesDue ? ', less ' + tk(T.feesDue) + ' monthly fees' : ''}.`} To {bankText(v.bank)}. Finance books it as paid.</p>
        : <p className="gc-help" style={{ margin: 0 }}>{T.feesDue > T.owedParcels && T.owedParcels ? 'The fees due are more than what is owed; they come off the next sales.' : 'Nothing owed right now.'}</p>}
      <div><button type="button" className="ix-btn ix-btn--primary" disabled={!(amount > 0)} onClick={() => setPay({ ref: '' })}><Icon name="hand-coins" width="16" height="16" aria-hidden="true" />Pay {tk(amount)}</button></div>
    </section>
    <section className="ix-card" aria-label="Statement">
      <div className="ix-card__head" style={{ padding: 'var(--space-3) var(--space-4) 0' }}><h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Delivered parcels</h2></div>
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table">
          <caption className="sr-only">Delivered parcels</caption>
          <thead><tr><th scope="col">Parcel</th><th scope="col">Delivered</th><th scope="col" className="ix-num">Store paid</th><th scope="col" className="ix-num">Commission</th><th scope="col" className="ix-num">Discount they paid</th><th scope="col" className="ix-num">Fee</th><th scope="col" className="ix-num">Vendor gets</th><th scope="col">Status</th></tr></thead>
          <tbody>{st.delivered.length ? st.delivered.map((p) => (
            <tr key={p.key}>
              <td><span className="gc-picrow"><Pic src={gsPic(p.lines[0])} name={p.lines[0].name} kind="item" size={32} /><span><Link href={'/admin/grid-shop/order?id=' + p.orderId} className="ix-strong">{p.shopName}</Link><span className="sva-sub">{p.key}</span></span></span></td>
              <td>{dShort(p.at)}</td>
              <td className="ix-num">{tk(p.sales)}</td>
              <td className="ix-num">{p.commission ? tk(p.commission) : '—'}</td>
              <td className="ix-num">{p.discountFunded ? tk(p.discountFunded) : '—'}</td>
              <td className="ix-num">{p.fee ? tk(p.fee) : '—'}</td>
              <td className="ix-num">{tk(p.youGet)}</td>
              <td><StatusBadge tone={p.pay === 'paid' ? 'success' : p.payoutId ? 'info' : 'warning'}>{p.pay === 'paid' ? 'Paid' : p.payoutId ? 'Requested' : 'Owed'}</StatusBadge></td>
            </tr>
          )) : <tr><td colSpan={8} className="ix-muted">No delivered parcels yet.</td></tr>}</tbody>
        </table>
      </div>
    </section>
    <section className="ix-card" aria-label="Payouts and fees">
      <div className="ix-card__head" style={{ padding: 'var(--space-3) var(--space-4) 0' }}><h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Payouts and monthly fees</h2></div>
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table">
          <caption className="sr-only">Payouts and monthly fees</caption>
          <thead><tr><th scope="col">What</th><th scope="col">Date</th><th scope="col" className="ix-num">Amount</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {st.payouts.map((p) => <tr key={p.id}><td><b className="ix-strong">Payout {p.id}</b><span className="sva-sub">{p.parcels.length} parcel{p.parcels.length === 1 ? '' : 's'} {tk(p.gross)}{p.feeTotal ? ' − fees ' + tk(p.feeTotal) : ''} · {bankText(p.to || v.bank)}</span></td><td>{dShort(p.paidAt || p.at)}</td><td className="ix-num">{tk(p.amount)}</td><td><StatusBadge tone={p.status === 'paid' ? 'success' : 'info'}>{p.status === 'paid' ? 'Paid' + (p.ref ? ' · ' + p.ref : '') : 'Requested'}</StatusBadge></td></tr>)}
            {st.fees.slice().reverse().map((x) => <tr key={x.id}><td>Monthly fee · {new Date(x.at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</td><td>{dShort(x.at)}</td><td className="ix-num">{tk(x.amount)}</td><td><StatusBadge tone={x.settled ? 'success' : 'warning'}>{x.settled ? 'Taken in ' + x.payoutId : 'Due'}</StatusBadge></td></tr>)}
            {!st.payouts.length && !st.fees.length ? <tr><td colSpan={4} className="ix-muted">No payouts or fees yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
    <Sheet open={!!pay} title={`Pay ${v.name} ${tk(amount)}`} onClose={() => setPay(null)} footer={pay ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setPay(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={go}>Mark paid</button></> : null}>
      {pay ? <form className="sva-form" onSubmit={(e) => { e.preventDefault(); go(); }}>
        <p className="gc-help" style={{ margin: 0 }}>Send {tk(amount)} to {bankText(v.bank)} first, then mark it paid here. Finance › Expenses records it with the same reference.</p>
        <div><label className="gc-label" htmlFor="gv-ref">Transfer reference</label><input id="gv-ref" className="gc-input" value={pay.ref} onChange={(e) => setPay({ ref: e.target.value })} placeholder="e.g. DBBL-55120" /></div>
      </form> : null}
    </Sheet>
  </>);
}

export default function GsVendor() {
  const { ready, tick } = useGs();
  const [tab, setTab] = useState('profile');
  useEffect(() => { const t = qp('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);
  const by = (() => { try { return staff().name; } catch { return 'Staff'; } })();
  const v = useMemo(() => (ready ? vendorById(qp('id')) : null), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <AdminShell active="gshop-vendor" title="Vendor"><div style={{ minHeight: 400 }} aria-busy="true" /></AdminShell>;
  if (!v) return <AdminShell active="gshop-vendor" title="Vendor"><div className="ix-page"><RecordHeader back="/admin/grid-shop/vendors" backLabel="Vendors" title="Vendor not found" /><section className="ix-card ix-empty"><EmptyState icon="store" title="This vendor is not here" /></section></div></AdminShell>;
  const waiting = getProducts().filter((p) => p.vendorId === v.id && (reviewOf(p) === 'pending' || p.pendingChange)).length;
  const st = vendorStatement(v.id);
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'gvt-' + k, label: l, count: k === 'products' ? waiting || null : k === 'parcels' ? vendorParcels(v.id).filter((x) => x.state === 'ship').length || null : null, on: tab === k, onClick: () => setTab(k) }));
  const pause = async () => {
    if (v.status === 'paused') { say(setVendorStatus(v.id, 'active'), 'Active: stores see their products again'); return; }
    if (await confirmDialog({ title: `Pause ${v.name}?`, body: 'Stores stop seeing their products at once. Parcels already ordered still need shipping, and what we owe them stays owed.', confirmLabel: 'Pause vendor', tone: 'danger' })) say(setVendorStatus(v.id, 'paused'), 'Paused');
  };
  return (
    <AdminShell active="gshop-vendor" title={v.name}>
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + MEDIA_CSS + GSA_CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/grid-shop/vendors" backLabel="Vendors" title={<span className="gc-picrow"><Pic src={v.logo} name={v.name} kind="logo" size={32} /><span>{v.name}</span></span>}
          badges={<StatusBadge tone={v.status === 'paused' ? 'neutral' : 'success'}>{v.status === 'paused' ? 'Paused' : 'Active'}</StatusBadge>}
          meta={<>{v.model === 'markup' ? `Markup ${v.markupPct}%` : `Commission ${v.commissionPct}%`} · owed {tk(st.totals.owedParcels)} · joined {dShort(v.joinedAt)}</>}
          secondary={[{ label: v.status === 'paused' ? 'Activate' : 'Pause', onClick: pause }]}
          more={[{ label: 'Email ' + v.contact, href: 'mailto:' + v.email }, { label: 'Pricing rules', href: '/admin/grid-shop/pricing' }]}
          primary={st.totals.balance > 0 || st.open ? { label: 'Pay', icon: 'hand-coins', onClick: () => setTab('money') } : null} />
        <div className="ix-card" style={{ padding: '0 var(--space-2)' }}><div className="ix-bar" style={{ borderBottom: 0 }}><IndexTabs tabs={tabs} label="Vendor" /></div></div>
        {tab === 'profile' ? <Profile key={v.id} v={v} /> : null}
        {tab === 'products' ? <Products v={v} by={by} /> : null}
        {tab === 'parcels' ? <Parcels v={v} /> : null}
        {tab === 'money' ? <Money v={v} by={by} /> : null}
      </div>
    </AdminShell>
  );
}
