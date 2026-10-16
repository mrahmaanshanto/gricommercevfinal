'use client';
// gsAdmin — what the super admin's Grid Shop pages share (Batch D; vendors Batch E): useGs() (lib/platform/gridShop.js after
// mount, re-read on change and from other tabs), the order status badge, a product's approval badge, the price breakdown
// table (Breakdown: what the store pays, what the vendor gets, what GridCommerce keeps and who pays a discount), the
// product picture helper and the CSS. Money and time words come from services' svcAdmin.

import React, { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui';
import { read, GS_EVENT, GS_KEY, ORDER_STATUS, statusOf, reviewOf, REVIEW, productById } from '@/lib/platform/gridShop';
import { productPic } from '@/lib/pictures';

const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
/** The picture of a product or an order line. */
export const gsPic = (x) => productPic(x && x.productId ? productById(x.productId) || x : x);
/** A vendor product's approval: Waiting for approval · Rejected · Draft (nothing for approved ones unless a change waits). */
export function ReviewBadge({ p, always }) {
  if (!p.vendorId) return null;
  const r = reviewOf(p);
  if (r === 'live') return p.pendingChange ? <StatusBadge tone="warning">Change waiting</StatusBadge> : always ? <StatusBadge tone="success">Approved</StatusBadge> : null;
  return <StatusBadge tone={REVIEW[r].tone}>{REVIEW[r].label}</StatusBadge>;
}
/** A price breakdown (gridShop.priceFor) as rows. qty shows totals for the quantity too. */
export function Breakdown({ b, qty = 1, vendor }) {
  const q = qty || 1;
  const rows = [
    [b.model === 'own' ? 'Our price' : 'Vendor’s price', tk(b.listPrice)],
    b.model === 'commission' ? ['Our commission', '−' + tk(b.commission) + ' (from the vendor)'] : null,
    b.markup ? ['Markup', '+' + tk(b.markup)] : null,
    ['Store price', tk(b.storeUnit)],
    b.discount ? ['Discount', `−${tk(b.discount)} · ${b.discountPct}% · paid by ${b.fundedBy === 'vendor' ? (vendor || 'the vendor') : 'GridCommerce'}`] : null,
    ['Store pays a unit', tk(b.storeUnitNet)],
    q > 1 ? [`Store pays for ${q}`, tk(b.storeUnitNet * q)] : null,
    b.platformFee ? ['Platform fee (this line)', '+' + tk(b.platformFee)] : null,
    b.model === 'own' ? ['Our cost', tk(b.cost)] : [`${vendor || 'Vendor'} gets`, tk(b.vendorGets) + (q > 1 ? ` · ${tk(b.vendorGets * q)} for ${q}` : '')],
    ['GridCommerce keeps', tk(b.gcKeeps) + (q > 1 ? ` · ${tk(b.gcKeeps * q + (b.platformFee || 0))} for ${q}${b.platformFee ? ' with the fee' : ''}` : b.platformFee ? ` + ${tk(b.platformFee)} fee` : '')],
  ].filter(Boolean);
  return (
    <dl className="gsa-break">
      {rows.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}
    </dl>
  );
}

export function useGs() {
  const [s, set] = useState({ ready: false, tick: 0 });
  useEffect(() => {
    const load = () => { read(); set((x) => ({ ready: true, tick: x.tick + 1 })); };
    load();
    const onStorage = (e) => { if (!e.key || e.key === GS_KEY) load(); };
    window.addEventListener(GS_EVENT, load); window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(GS_EVENT, load); window.removeEventListener('storage', onStorage); };
  }, []);
  return s;
}
export function GsOrderStatus({ o }) {
  const x = ORDER_STATUS[statusOf(o)] || { label: '—', tone: 'neutral' };
  return <StatusBadge tone={x.tone}>{x.label}</StatusBadge>;
}
export const GSA_CSS = `
.gsa-thumb{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:var(--radius-lg);border:1px solid var(--border-subtle);background:var(--surface-subtle) center/cover no-repeat;color:var(--primary)}
.gsa-name{display:flex;align-items:center;gap:var(--space-3)}
.gsa-name>span{display:flex;flex-direction:column;min-width:0}
.gsa-ship{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.gsa-ship header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px}
.gsa-ship header b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gsa-ship ul{margin:0;padding-left:18px;font-size:var(--text-sm)}
.gsa-ship small{font-size:var(--text-xs);color:var(--text-muted)}
.gsa-low{color:var(--text-warning)}
.gsa-break{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--space-3);margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.gsa-break dt{color:var(--text-body)}
.gsa-break dd{margin:0;font-family:var(--font-data);text-align:right;color:var(--text-heading)}
.gsa-break dt:nth-last-of-type(-n+2),.gsa-break dd:nth-last-of-type(-n+2){font-weight:var(--weight-semibold)}
.gsa-change{display:flex;flex-direction:column;gap:2px;min-width:200px;max-width:300px;white-space:normal;font-size:var(--text-xs);color:var(--text-muted)}
.gsa-change b{font-weight:var(--weight-medium);color:var(--text-heading)}
.gsa-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--text-sm)}
`;
