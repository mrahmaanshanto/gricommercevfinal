'use client';
// OrderSettings — Orders › Order settings (/order-settings). Nayeem's Sales & Orders brief #4:
//   Custom statuses  the shop's own labels ("Waiting for size"), each tied to one real status. They show as a badge
//                    and a filter on Orders and as the sub-status on the order page; they never change the order.
//   Completion       an order is Completed when it is delivered, fully paid and the return window has passed.
// Saved in this browser (src/lib/orderRules.js). A settings form page (docs/shopify-style.md): RecordHeader + cards.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { getOrderRules, saveOrderRules, RETURN_WINDOWS, CUSTOM_TONES } from '@/lib/orderRules';

const CSS = `
.os-rows{display:flex;flex-direction:column}
.os-row{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) 112px 200px;gap:var(--space-3);align-items:end;padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.os-row:first-child{border-top:0;padding-top:0}
.os-prev{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:32px;min-width:0}
.os-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){
.os-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.os-row>:first-child,.os-prev{grid-column:1 / -1}
}
`;

const newRow = () => ({ id: '', label: '', base: 'onhold', tone: 'neutral', key: Math.random().toString(36).slice(2) });

export default function OrderSettings() {
  const [saved, setSaved] = useState(null);
  const [r, setR] = useState(null);
  useEffect(() => { const x = getOrderRules(); const withKeys = { ...x, custom: x.custom.map((c) => ({ ...c, key: c.id })) }; setSaved(withKeys); setR(withKeys); }, []);
  const dirty = useMemo(() => !!(r && saved && JSON.stringify(r) !== JSON.stringify(saved)), [r, saved]);

  const shell = (body) => (
    <div className="dc-screen ds" data-screen="OrderSettings">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-all" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Order settings" />
          <div className="gc-shell__content">{body}</div>
        </main>
      </div>
    </div>
  );
  if (!r) return shell(null);

  const setRow = (i, k) => (e) => { const custom = r.custom.slice(); custom[i] = { ...custom[i], [k]: e.target.value }; setR({ ...r, custom }); };
  const remove = (i) => setR({ ...r, custom: r.custom.filter((_, j) => j !== i) });
  const blank = r.custom.some((c) => !String(c.label || '').trim());
  const save = () => {
    if (blank) { toast('Give every status a name', { tone: 'error' }); return; }
    const clean = saveOrderRules(r);
    const next = { ...clean, custom: clean.custom.map((c) => ({ ...c, key: c.id })) };
    setSaved(next); setR(next);
    toast('Order settings saved');
  };
  const back = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes will be lost.', confirmLabel: 'Leave', cancelLabel: 'Keep editing', tone: 'danger' }))) return;
    navigate('/merchant-orders');
  };

  return shell(
    <div className="ix-page ix-page--narrow">
      <RecordHeader onBack={back} backLabel="Back to orders" title="Order settings"
        about="Your own sub-statuses for orders, and when an order counts as Completed."
        secondary={dirty ? [{ label: 'Discard', onClick: () => setR(saved) }] : []}
        primary={{ label: 'Save', onClick: save, disabled: !dirty }} />

      <section className="ix-card" aria-labelledby="os-custom">
        <header className="ix-card__head">
          <div><h2 id="os-custom">Custom statuses</h2><p className="ix-card__sub">Shown beside the status. They don’t change the order.</p></div>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => setR({ ...r, custom: [...r.custom, newRow()] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add status</button>
        </header>
        <div className="ix-card__body">
          {r.custom.length ? (
            <div className="os-rows">
              {r.custom.map((c, i) => (
                <div key={c.key || c.id} className="os-row">
                  <div><label className="gc-label" htmlFor={'os-l-' + i}>Name</label><input id={'os-l-' + i} className="gc-input" value={c.label} onChange={setRow(i, 'label')} placeholder="e.g. Waiting for size" aria-invalid={!String(c.label || '').trim()} /></div>
                  <div><label className="gc-label" htmlFor={'os-b-' + i}>While the order is</label><select id={'os-b-' + i} className="gc-input gc-select" value={c.base} onChange={setRow(i, 'base')}>{ORDER_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
                  <div><label className="gc-label" htmlFor={'os-t-' + i}>Colour</label><select id={'os-t-' + i} className="gc-input gc-select" value={c.tone} onChange={setRow(i, 'tone')}>{CUSTOM_TONES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                  <div className="os-prev">
                    {c.label ? <StatusBadge tone={c.tone} icon="tag">{c.label}</StatusBadge> : null}
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + (c.label || 'status')} onClick={() => remove(i)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="os-empty">No custom statuses yet.</p>}
        </div>
      </section>

      <section className="ix-card" aria-labelledby="os-done">
        <header className="ix-card__head"><div><h2 id="os-done">Completed orders</h2><p className="ix-card__sub">Delivered, fully paid and past the return window.</p></div></header>
        <div className="ix-card__body">
          <label className="gc-label" htmlFor="os-days">Return window</label>
          <select id="os-days" className="gc-input gc-select" style={{ maxWidth: 240 }} value={String(r.returnDays)} onChange={(e) => setR({ ...r, returnDays: Number(e.target.value) })}>
            {RETURN_WINDOWS.map((d) => <option key={d} value={String(d)}>{d ? `${d} days after delivery` : 'None: complete on delivery'}</option>)}
          </select>
        </div>
      </section>
    </div>
  );
}
