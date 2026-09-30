'use client';
// Courier record for a customer's phone number: how many parcels they received and sent back.
// Shown as soon as a valid number is known, before the merchant commits to the order.
import { Icon } from '@/runtime/dc';
import { courierHistory } from '@/lib/orderLinks';

const CSS = `
.ch{margin-top:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.ch__head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ch__rate{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.ch__rate--good{background:var(--fill-success-soft);color:var(--text-success)}
.ch__rate--mid{background:var(--fill-warning-soft);color:var(--text-warning)}
.ch__rate--bad{background:var(--fill-error-soft);color:var(--text-danger)}
.ch__sum{margin:var(--space-2) 0 0;font-size:var(--text-sm);color:var(--text-heading)}
.ch__bar{display:flex;height:6px;margin-top:var(--space-2);border-radius:var(--radius-full);overflow:hidden;background:var(--slate-200)}
.ch__bar i{display:block;height:100%;background:var(--fill-success)}
.ch__rows{margin:var(--space-2) 0 0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-body)}
.ch__rows li{display:flex;justify-content:space-between;gap:var(--space-2);padding:2px 0}
.ch__none{margin:var(--space-2) 0 0;font-size:var(--text-sm);color:var(--text-body)}
`;

export function CourierHistory({ phone }) {
  const h = courierHistory(phone);
  if (!h) return null;
  const tone = h.rate == null ? 'mid' : h.rate >= 80 ? 'good' : h.rate >= 50 ? 'mid' : 'bad';
  const icon = tone === 'good' ? 'shield-check' : tone === 'bad' ? 'triangle-alert' : 'info';
  return (
    <div className="ch" role="status" aria-live="polite">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ch__head">
        <span>Courier history</span>
        <span className={'ch__rate ch__rate--' + tone}><Icon name={icon} width="12" height="12" aria-hidden="true" />{h.rate == null ? 'No record' : `${h.rate}% delivered`}</span>
      </div>
      {h.total === 0 ? (
        <p className="ch__none">No parcels found for this number with Pathao, Steadfast or RedX. Treat as a first-time buyer.</p>
      ) : (
        <>
          <p className="ch__sum">{h.delivered} of {h.total} parcels delivered · {h.returned} returned</p>
          <div className="ch__bar" aria-hidden="true"><i style={{ width: h.rate + '%' }} /></div>
          <ul className="ch__rows">
            {h.couriers.map((c) => <li key={c.name}><span>{c.name}</span><span>{c.delivered} delivered · {c.returned} returned</span></li>)}
          </ul>
        </>
      )}
    </div>
  );
}
