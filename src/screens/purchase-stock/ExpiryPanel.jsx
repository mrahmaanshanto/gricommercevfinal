'use client';
// ExpiryPanel — stock that is expired or expires in the next 30 days (Damaged & expired page), from the expiry dates
// entered on purchases (src/lib/batches.js). Write off takes the pieces out of stock. Text stays short.
// A Shopify-style card (components/ui/IndexKit.jsx): one line of totals under the title, then a compact table
// (product, supplier, place, expiry, qty, value at cost) with one small Write off per row; a list on phones.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { expiryList, writeOffBatch, BATCH_EVENT } from '@/lib/batches';
import { isOnePlace } from '@/lib/stockSetup';

const CSS = `
.xp-head{align-items:flex-start;padding-bottom:var(--space-3)}
.xp-when{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.xp-when.is-gone{color:var(--text-danger)}.xp-when.is-soon{color:var(--text-warning)}
.xp-cell{display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.xp-act{text-align:right}
.xp-pitem{cursor:default}
.xp-pitem__ctl{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
`;

export default function ExpiryPanel() {
  const [rows, setRows] = useState(null);
  const [one, setOne] = useState(false);
  useEffect(() => {
    const load = () => setRows(expiryList());
    load(); setOne(isOnePlace());
    window.addEventListener(BATCH_EVENT, load);
    return () => window.removeEventListener(BATCH_EVENT, load);
  }, []);
  if (!rows) return null;
  const expired = rows.filter((r) => r.expired);
  const value = rows.reduce((a, r) => a + r.value, 0);

  const writeOff = async (r) => {
    const ok = await confirmDialog({ title: `Write off ${r.left} × ${r.name}?`, body: 'They leave the stock.', confirmLabel: 'Write off', tone: 'danger' });
    if (!ok) return;
    writeOffBatch(r.id);
    setRows(expiryList());
    toast('Written off');
  };
  const when = (r) => (
    <span className={'xp-when ' + (r.expired ? 'is-gone' : 'is-soon')}><Icon name={r.expired ? 'circle-x' : 'clock'} width="14" height="14" aria-hidden="true" />{r.expired ? `Expired ${formatDate(r.expiry)}` : r.daysLeft <= 1 ? 'Expires today' : `${r.daysLeft} days left`}</span>
  );

  return (
    <section className="ix-card" aria-labelledby="xp-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-card__head xp-head">
        <div>
          <h2 id="xp-title">Expiry</h2>
          <p className="ix-card__sub">{rows.length ? `${expired.length} expired · ${rows.length - expired.length} expire in 30 days · ${formatBDT(Math.round(value))} at cost` : 'Nothing expires in the next 30 days'}</p>
        </div>
      </div>
      {rows.length ? (<>
        <ul className="ix-plist" aria-label="Expiry">
          {rows.map((r) => (
            <li key={r.id}>
              <div className="ix-pitem xp-pitem">
                <span className="ix-pitem__top"><b>{r.name}</b><span>{`${r.left} pcs`}</span></span>
                <span className="ix-pitem__mid">{[one ? '' : r.place, r.supplier, r.ref].filter(Boolean).join(' · ')}</span>
                <span className="xp-pitem__ctl">{when(r)}<button type="button" className="ix-btn ix-btn--sm" onClick={() => writeOff(r)}>Write off</button></span>
              </div>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table ix-table--static gc-table--keep">
            <caption className="sr-only">Expired and expiring stock</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Supplier</th>
                {one ? null : <th scope="col">Place</th>}
                <th scope="col">Expiry</th>
                <th scope="col" className="ix-num">Qty</th>
                <th scope="col" className="ix-num">Value at cost</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><span className="ix-strong xp-cell">{r.name}</span></td>
                  <td className="ix-muted"><span className="xp-cell">{[r.supplier, r.ref].filter(Boolean).join(' · ') || '—'}</span></td>
                  {one ? null : <td className="ix-muted">{r.place}</td>}
                  <td>{when(r)}</td>
                  <td className="ix-num">{r.left}</td>
                  <td className="ix-num">{formatBDT(Math.round(r.value))}</td>
                  <td className="xp-act"><button type="button" className="ix-btn ix-btn--sm" onClick={() => writeOff(r)}>Write off</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>) : <div className="ix-empty"><EmptyState icon="calendar-check" title="Nothing expiring" body="Add expiry dates when you enter a purchase." /></div>}
    </section>
  );
}
