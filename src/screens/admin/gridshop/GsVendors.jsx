'use client';
// Grid Shop › Vendors (/admin/grid-shop/vendors; was Suppliers, Batch D → vendors Batch E): the companies that sell on
// Grid Shop and ship straight to stores (Star Tech, Dhaka Pack House …): logo, contact, pricing (commission or markup and
// their charges), products on sale and waiting for approval, what we owe them now and what was paid, status. A row opens
// the vendor's record (/admin/grid-shop/vendor?id=). Add vendor in a side panel. Data: lib/platform/gridShop.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Sheet, StatusBadge } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { getVendors, getProducts, reviewOf, vendorStatement, saveVendor, MODELS } from '@/lib/platform/gridShop';
import { AdminShell } from '../AdminShell';
import { tk, SVA_CSS } from '../services/svcAdmin';
import { useGs, GSA_CSS } from './gsAdmin';

export const pricingText = (v) => (v.model === 'markup' ? `Markup ${v.markupPct}%` : `Commission ${v.commissionPct}%`) + (v.feePerOrder ? ` · ${tk(v.feePerOrder)} a parcel` : '') + (v.monthlyFee ? ` · ${tk(v.monthlyFee)} a month` : '');

export default function GsVendors() {
  const { ready, tick } = useGs();
  const router = useRouter();
  const [ed, setEd] = useState(null);
  const rows = useMemo(() => {
    if (!ready) return [];
    const ps = getProducts();
    return getVendors().map((v) => {
      const mine = ps.filter((p) => p.vendorId === v.id);
      const st = vendorStatement(v.id);
      return { v, live: mine.filter((p) => reviewOf(p) === 'live' && p.status === 'live').length, waiting: mine.filter((p) => reviewOf(p) === 'pending' || p.pendingChange).length, owed: st.totals.owedParcels, balance: st.totals.balance, requested: st.totals.requested, paid: st.totals.paid };
    });
  }, [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const add = () => { const r = saveVendor({ ...ed, status: 'active' }); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast('Vendor added'); setEd(null); router.push('/admin/grid-shop/vendor?id=' + r.vendor.id); };
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  return (
    <AdminShell active="gshop-suppliers" title="Grid Shop vendors">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + GSA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="store" title="Vendors" about="Companies that sell on Grid Shop and ship straight to stores. Each has a pricing model: commission (the vendor sets the store price; we take a %) or markup (the vendor sets what they get; we add a %), plus an optional fee per parcel and monthly fee. Pricing rules can change these for a time. A vendor's parcel is owed to them once delivered and paid in a payout (Finance books it)."
          secondary={[{ label: 'Pricing rules', href: '/admin/grid-shop/pricing' }]} more={[{ label: 'Vendor portal (demo)', href: '/vendor-sign-in' }, { label: 'Products', href: '/admin/grid-shop/products' }]}
          primary={{ label: 'Add vendor', onClick: () => setEd({ name: '', contact: '', phone: '', email: '', model: 'commission', commissionPct: 10, markupPct: 12 }) }} />
        {ready ? <MetricStrip items={[
          { label: 'Vendors', value: String(rows.filter((r) => r.v.status !== 'paused').length), sub: rows.some((r) => r.v.status === 'paused') ? rows.filter((r) => r.v.status === 'paused').length + ' paused' : 'active', icon: 'store' },
          { label: 'Waiting for approval', value: String(sum('waiting')), href: '/admin/grid-shop/products?view=review', icon: 'hourglass' },
          { label: 'Owed to vendors', value: tk(sum('owed')), sub: 'delivered, not paid', icon: 'hand-coins' },
          { label: 'Paid to vendors', value: tk(sum('paid')), icon: 'banknote' },
        ]} /> : null}
        <section className="ix-card" aria-label="Vendors">
          {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : (<>
            <ul className="ix-plist">{rows.map((x) => <li key={x.v.id}><Link href={'/admin/grid-shop/vendor?id=' + x.v.id} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={x.v.logo} name={x.v.name} kind="logo" /></span><span className="ix-pitem__top"><b>{x.v.name}</b><StatusBadge tone={x.v.status === 'paused' ? 'neutral' : 'success'}>{x.v.status === 'paused' ? 'Paused' : 'Active'}</StatusBadge></span><span className="ix-pitem__mid">{pricingText(x.v)} · owed {tk(x.owed)}{x.waiting ? ` · ${x.waiting} to approve` : ''}</span></Link></li>)}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Vendors</caption>
                <thead><tr><th scope="col">Vendor</th><th scope="col">Pricing</th><th scope="col" className="ix-num">On sale</th><th scope="col" className="ix-num">To approve</th><th scope="col" className="ix-num">Owed now</th><th scope="col" className="ix-num">Paid</th><th scope="col">Status</th></tr></thead>
                <tbody>{rows.map((x) => (
                  <tr key={x.v.id} onClick={(e) => { if (!e.target.closest('a,button')) router.push('/admin/grid-shop/vendor?id=' + x.v.id); }}>
                    <td><span className="gc-picrow"><Pic src={x.v.logo} name={x.v.name} kind="logo" size={32} /><span><Link href={'/admin/grid-shop/vendor?id=' + x.v.id} className="ix-strong">{x.v.name}</Link><span className="sva-sub">{x.v.contact} · {x.v.phone}</span></span></span></td>
                    <td>{x.v.model === 'markup' ? 'Markup' : 'Commission'} {x.v.model === 'markup' ? x.v.markupPct : x.v.commissionPct}%<span className="sva-sub">{x.v.feePerOrder ? tk(x.v.feePerOrder) + ' a parcel' : 'No parcel fee'}{x.v.monthlyFee ? ' · ' + tk(x.v.monthlyFee) + ' a month' : ''}</span></td>
                    <td className="ix-num">{x.live}</td>
                    <td className="ix-num">{x.waiting ? <span className="gsa-low">{x.waiting}</span> : 0}</td>
                    <td className="ix-num">{tk(x.owed)}{x.requested ? <span className="sva-sub">{tk(x.requested)} requested</span> : null}</td>
                    <td className="ix-num">{tk(x.paid)}</td>
                    <td><StatusBadge tone={x.v.status === 'paused' ? 'neutral' : 'success'}>{x.v.status === 'paused' ? 'Paused' : 'Active'}</StatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{rows.length} vendors</span></div>
        </section>
      </div>
      <Sheet open={!!ed} title="Add vendor" onClose={() => setEd(null)} footer={ed ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEd(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={add}>Add vendor</button></> : null}>
        {ed ? (
          <form className="sva-form" onSubmit={(e) => { e.preventDefault(); add(); }}>
            <div><label className="gc-label" htmlFor="gv-n">Company name</label><input id="gv-n" className="gc-input" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} /></div>
            <div className="sva-grid2">
              <div><label className="gc-label" htmlFor="gv-c">Contact person</label><input id="gv-c" className="gc-input" value={ed.contact} onChange={(e) => setEd({ ...ed, contact: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="gv-p">Phone</label><input id="gv-p" className="gc-input" value={ed.phone} onChange={(e) => setEd({ ...ed, phone: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="gv-e">Email</label><input id="gv-e" className="gc-input" value={ed.email} onChange={(e) => setEd({ ...ed, email: e.target.value })} /></div>
            </div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <legend className="gc-label">Pricing model</legend>
              {Object.entries(MODELS).map(([k, l]) => <label key={k} className="sva-chk" style={{ whiteSpace: 'normal' }}><input type="radio" name="gv-m" className="gc-check gc-check--radio" checked={ed.model === k} onChange={() => setEd({ ...ed, model: k })} />{l}</label>)}
            </fieldset>
            <div className="sva-grid2">
              {ed.model === 'markup' ? <div><label className="gc-label" htmlFor="gv-mk">Markup %</label><input id="gv-mk" className="gc-input" inputMode="decimal" value={ed.markupPct} onChange={(e) => setEd({ ...ed, markupPct: e.target.value })} /></div>
                : <div><label className="gc-label" htmlFor="gv-cm">Commission %</label><input id="gv-cm" className="gc-input" inputMode="decimal" value={ed.commissionPct} onChange={(e) => setEd({ ...ed, commissionPct: e.target.value })} /></div>}
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Fees, payout account and terms are on the vendor’s page after you add it.</p>
          </form>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
