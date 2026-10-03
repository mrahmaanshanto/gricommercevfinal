'use client';
// OrderJobs — the progress strip for bulk work running in the background (src/lib/orderJobs.js): courier booking and
// label printing. It works the queue on a timer while it is on screen, shows each job's progress, then the result per
// order: failures with the reason and Retry, ready labels with Print. A job stays until it is dismissed.
// Used on Orders (/merchant-orders) and Order work (/order-work). `onChange` runs when an order changed.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { getJobs, tickJobs, retryItem, retryFailed, dismissJob, labelsPrinted, jobSummary, JOB_EVENT } from '@/lib/orderJobs';
import { findOrder, orderHref } from '@/lib/orders';
import { prepOf } from '@/lib/orderFlow';
import { formatBDT } from '@/lib/format';
import { printNode } from '@/lib/printNode';
import { MERCHANT } from '@/lib/merchant';

const CSS = `
.oj{display:flex;flex-direction:column;gap:var(--space-2)}
.oj-job{padding:var(--space-3) var(--space-4)}
.oj-row{display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap}
.oj-ic{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.oj-ic.is-run{color:var(--primary);background:var(--fill-primary-soft)}
.oj-ic.is-bad{color:var(--text-danger);background:var(--fill-error-soft)}
.oj-ic.is-ok{color:var(--text-success);background:var(--fill-success-soft)}
.oj-text{display:flex;flex-direction:column;min-width:0;flex:1}
.oj-text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.oj-text span{font-size:var(--text-xs);color:var(--text-muted)}
.oj-acts{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap}
.oj-bar{height:4px;margin-top:var(--space-2);border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden;display:flex}
.oj-bar i{display:block;height:100%;background:var(--fill-success);transition:width 300ms ease}
.oj-bar i.is-bad{background:var(--fill-danger)}
.oj-list{margin:var(--space-2) 0 0;padding:0;list-style:none;border-top:1px solid var(--border-subtle)}
.oj-list li{display:grid;grid-template-columns:96px minmax(0,1fr) auto;gap:var(--space-3);align-items:center;min-height:40px;padding:4px 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.oj-list li:last-child{border-bottom:0}
.oj-list .ix-id{color:var(--text-heading)}
.oj-err{color:var(--text-danger)}
.oj-ok{color:var(--text-body)}
.oj-sheet{display:none}
@media (max-width:640px){
.oj-list li{grid-template-columns:minmax(0,1fr) auto}
.oj-list li>span:nth-child(2){grid-column:1 / -1;grid-row:2}
}
`;

const TITLE = {
  courier: { run: 'Booking couriers', done: 'Courier booking done', icon: 'truck', ok: 'booked' },
  print: { run: 'Preparing labels', done: 'Labels ready', icon: 'printer', ok: 'ready' },
};

/** One label (100 × 150 mm), the same facts as the order page's slip. */
function Label({ o }) {
  const cod = o.codAmount != null ? o.codAmount : Math.max(0, o.amount - (o.paid || 0));
  return (
    <div className="oj-label" style={{ fontFamily: 'var(--font-sans)', color: '#0f172a', padding: '4mm', display: 'flex', flexDirection: 'column', gap: '3mm', pageBreakAfter: 'always' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f172a', paddingBottom: '2mm' }}><b>{prepOf(o).courier || 'Courier'}</b><span>{MERCHANT.name}</span></div>
      <div><div style={{ fontSize: 'var(--text-xs)' }}>Order</div><b style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-data)' }}>{o.id}</b></div>
      <div><div style={{ fontSize: 'var(--text-xs)' }}>To</div><b>{o.customer}</b><div>{o.phone}</div><div>{o.address}</div><div>{o.zone}</div></div>
      <div style={{ border: '2px solid #0f172a', borderRadius: 'var(--radius-lg)', padding: '2mm 3mm', display: 'flex', justifyContent: 'space-between' }}><span>COD</span><b style={{ fontSize: 'var(--text-xl)' }}>{formatBDT(cod)}</b></div>
      <div style={{ fontSize: 'var(--text-xs)' }}>{o.units} {o.units === 1 ? 'item' : 'items'} · From {MERCHANT.name}, {MERCHANT.phone}</div>
    </div>
  );
}

export function OrderJobs({ onChange, kind }) {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState({});
  const sheets = useRef({});
  useEffect(() => {
    const read = () => setJobs(getJobs().filter((j) => !kind || j.kind === kind));
    read();
    const tick = () => { if (tickJobs()) { read(); if (onChange) onChange(); } };
    tick();
    const t = window.setInterval(tick, 400);
    window.addEventListener(JOB_EVENT, read);
    window.addEventListener('storage', read);
    return () => { window.clearInterval(t); window.removeEventListener(JOB_EVENT, read); window.removeEventListener('storage', read); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
  if (!jobs.length) return null;

  const print = (job) => {
    const node = sheets.current[job.id];
    if (!node) return;
    printNode(node, { title: 'Labels', css: '@page{size:100mm 150mm;margin:4mm} .oj-sheet{display:block!important}' });
    labelsPrinted(job.id);
    if (onChange) onChange();
    toast('Labels sent to the printer');
  };

  return (
    <div className="oj" aria-live="polite">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {jobs.map((job) => {
        const s = jobSummary(job);
        const t = TITLE[job.kind] || TITLE.courier;
        const worked = s.done + s.failed;
        const failed = job.items.filter((it) => it.state === 'failed');
        const done = job.items.filter((it) => it.state === 'done');
        const show = open[job.id] != null ? open[job.id] : failed.length > 0 && !s.running;
        const readyLabels = job.kind === 'print' ? done.map((it) => findOrder(it.id)).filter(Boolean) : [];
        return (
          <section key={job.id} className="ix-card oj-job" aria-label={s.running ? t.run : t.done}>
            <div className="oj-row">
              <span className={'oj-ic' + (s.running ? ' is-run' : s.failed ? ' is-bad' : ' is-ok')} aria-hidden="true"><Icon name={s.running ? 'loader' : s.failed ? 'circle-alert' : t.icon} width="16" height="16" /></span>
              <span className="oj-text">
                <b>{s.running ? `${t.run} · ${worked} of ${s.total}` : t.done}</b>
                <span>{[s.done ? `${s.done} ${t.ok}` : '', s.failed ? `${s.failed} failed` : '', s.queued ? `${s.queued} waiting` : ''].filter(Boolean).join(' · ') || 'Starting…'}</span>
              </span>
              <span className="oj-acts">
                {!s.running && s.retryable ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { retryFailed(job.id); toast('Trying again'); }}>Retry failed</button> : null}
                {job.kind === 'print' && !s.running && readyLabels.length ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => print(job)}><Icon name="printer" width="16" height="16" aria-hidden="true" />{job.printedAt ? 'Print again' : `Print ${readyLabels.length} ${readyLabels.length === 1 ? 'label' : 'labels'}`}</button> : null}
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" aria-expanded={show} onClick={() => setOpen({ ...open, [job.id]: !show })}>{show ? 'Hide' : 'Details'}</button>
                {!s.running ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Dismiss" onClick={() => dismissJob(job.id)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button> : null}
              </span>
            </div>
            <div className="oj-bar" role="progressbar" aria-valuemin={0} aria-valuemax={s.total} aria-valuenow={worked} aria-label={t.run}>
              <i style={{ width: `${(s.done / Math.max(1, s.total)) * 100}%` }} />
              <i className="is-bad" style={{ width: `${(s.failed / Math.max(1, s.total)) * 100}%` }} />
            </div>
            {show ? (
              <ul className="oj-list">
                {[...failed, ...job.items.filter((it) => it.state === 'queued'), ...done].map((it) => (
                  <li key={it.id}>
                    <Link href={orderHref(it.id)} className="ix-id">{it.id}</Link>
                    <span className={it.state === 'failed' ? 'oj-err' : 'oj-ok'}>{it.state === 'failed' ? it.error : it.state === 'queued' ? 'Waiting' : it.result}</span>
                    <span>{it.state === 'failed' && it.retry !== false && !s.running ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => retryItem(job.id, it.id)}>Retry</button> : null}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {job.kind === 'print' ? (
              <div className="oj-sheet" aria-hidden="true"><div ref={(n) => { sheets.current[job.id] = n; }}>{readyLabels.map((o) => <Label key={o.id} o={o} />)}</div></div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export default OrderJobs;
