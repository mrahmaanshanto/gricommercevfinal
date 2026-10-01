'use client';
// ExpiryPanel — stock that is expired or expires in the next 30 days (Damaged & expired page), from the expiry dates
// entered on purchases (src/lib/batches.js). Write off takes the pieces out of stock. Text stays short.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { expiryList, writeOffBatch, BATCH_EVENT } from '@/lib/batches';
import { isOnePlace } from '@/lib/stockSetup';

const CSS = `
.xp{overflow:hidden}
.xp-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.xp-head h2{display:flex;align-items:center;gap:8px;margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.xp-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.xp-rows{display:flex;flex-direction:column}
.xp-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;align-items:center;gap:var(--space-4);min-height:60px;padding:var(--space-2) var(--space-5);border-top:1px solid var(--border-subtle)}
.xp-main{display:flex;flex-direction:column;min-width:0}
.xp-main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.xp-main small{font-size:var(--text-xs);color:var(--text-muted)}
.xp-when{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.xp-when.is-gone{color:var(--text-danger)}.xp-when.is-soon{color:var(--text-warning)}
.xp-num{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading);text-align:right;white-space:nowrap}
.xp-num small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .xp-head{padding:var(--space-3) var(--space-4)}
  .xp-row{grid-template-columns:minmax(0,1fr) auto;row-gap:6px;padding:var(--space-3) var(--space-4)}
  .xp-row .xp-when{grid-column:1;grid-row:2}
  .xp-row .gc-btn{grid-column:2;grid-row:2;justify-self:end}
}
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

  return (
    <section className="gc-card xp" aria-labelledby="xp-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="xp-head">
        <div>
          <h2 id="xp-title"><Icon name="calendar-x" width="17" height="17" aria-hidden="true" />Expiry</h2>
          <p>{rows.length ? `${expired.length} expired · ${rows.length - expired.length} expire in 30 days · ${formatBDT(Math.round(value))} at cost` : 'Nothing expires in the next 30 days'}</p>
        </div>
      </div>
      {rows.length ? (
        <div className="xp-rows">
          {rows.map((r) => (
            <div key={r.id} className="xp-row">
              <span className="xp-main"><b>{r.name}</b><small>{[one ? '' : r.place, r.supplier, r.ref].filter(Boolean).join(' · ')}</small></span>
              <span className={'xp-when ' + (r.expired ? 'is-gone' : 'is-soon')}><Icon name={r.expired ? 'circle-x' : 'clock'} width="14" height="14" aria-hidden="true" />{r.expired ? `Expired ${formatDate(r.expiry)}` : r.daysLeft <= 1 ? 'Expires today' : `${r.daysLeft} days left`}</span>
              <span className="xp-num">{r.left} pcs<small>{formatBDT(Math.round(r.value))}</small></span>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => writeOff(r)}>Write off</button>
            </div>
          ))}
        </div>
      ) : <div style={{ padding: '0 var(--space-5) var(--space-5)' }}><EmptyState icon="calendar-check" title="Nothing expiring" body="Add expiry dates when you enter a purchase." /></div>}
    </section>
  );
}
