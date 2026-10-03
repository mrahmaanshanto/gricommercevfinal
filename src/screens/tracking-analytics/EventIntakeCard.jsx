'use client';
// EventIntakeCard — Event health › Health: the shop's own event intake (lib/events.js). Every event has one shape
// (name, time, source, order or customer, value, event ID); the intake drops an event ID it already received (the same
// order event from the browser and the server is counted once) and rejects events that don't fit the shape. Shows the
// last 7 days: received, accepted, duplicates dropped, rejected (with why), by source, and the latest events.
// "Send test events" sends one event twice and one broken event, so the counts can be watched.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge, InfoTip } from '@/components/ui';
import { syncDemoEvents, sendTestEvents, eventHealth, EVENT_LABEL, SOURCE_LABEL, SCHEMA_VERSION, EVENTS_EVENT } from '@/lib/events';

const CSS = `
.ei-figs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--border-subtle)}
.ei-fig{display:flex;flex-direction:column;gap:2px;padding:12px 16px;border-left:1px solid var(--border-subtle)}
.ei-fig:first-child{border-left:0}
.ei-fig span{font-size:var(--text-xs);color:var(--text-muted)}
.ei-fig b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ei-row{display:flex;flex-wrap:wrap;gap:6px 16px;padding:10px 16px;border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-body)}
.ei-row b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ei-log{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.ei-log th,.ei-log td{padding:7px 16px;border-top:1px solid var(--border-subtle);text-align:left;white-space:nowrap}
.ei-log thead th{color:var(--text-muted);font-weight:var(--weight-medium);background:var(--surface-subtle)}
.ei-log td.ei-id{font-family:var(--font-data);color:var(--text-body)}
@media (max-width:640px){.ei-figs{grid-template-columns:repeat(2,minmax(0,1fr))}.ei-fig:nth-child(3){border-left:0}.ei-fig:nth-child(n+3){border-top:1px solid var(--border-subtle)}}
`;
const DAY = 864e5;
const STATUS = { accepted: ['Accepted', 'success'], duplicate: ['Duplicate dropped', 'info'], rejected: ['Rejected', 'error'] };
const time = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function EventIntakeCard() {
  const [h, setH] = useState(null);
  useEffect(() => {
    const read = () => { const now = Date.now(); setH(eventHealth({ from: now - 7 * DAY, to: now + 1 })); };
    try { syncDemoEvents(); } catch { /* ignore */ }
    read();
    window.addEventListener(EVENTS_EVENT, read);
    return () => window.removeEventListener(EVENTS_EVENT, read);
  }, []);
  const test = () => {
    const r = sendTestEvents();
    toast(`${r.accepted.length} accepted · ${r.duplicates.length} duplicate dropped · ${r.rejected.length} rejected`);
  };
  if (!h) return null;
  const reasons = Object.entries(h.reasons);
  return (
    <section className="ix-card" aria-label="Event intake">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="ix-card__head">
        <h2>Event intake <InfoTip text={`Every event has one shape (schema v${SCHEMA_VERSION}): name, time, source, order or customer, value and an event ID. An event ID already received is dropped, so the same order event from the browser and the server counts once.`} /></h2>
        <button type="button" className="ix-btn ix-btn--sm" onClick={test}><Icon name="send" width="14" height="14" aria-hidden="true" />Send test events</button>
      </header>
      <div className="ei-figs">
        <div className="ei-fig"><span>Received, 7 days</span><b>{h.received.toLocaleString('en-IN')}</b></div>
        <div className="ei-fig"><span>Accepted</span><b>{h.accepted.toLocaleString('en-IN')}</b></div>
        <div className="ei-fig"><span>Duplicates dropped</span><b>{h.deduped.toLocaleString('en-IN')} <span>({Math.round(h.dedupRate * 100)}%)</span></b></div>
        <div className="ei-fig"><span>Rejected</span><b>{h.rejected.toLocaleString('en-IN')}</b></div>
      </div>
      <div className="ei-row">
        {Object.entries(h.bySource).map(([s, n]) => <span key={s}>{SOURCE_LABEL[s] || s} <b>{n.toLocaleString('en-IN')}</b></span>)}
        <span>Browser and server both sent <b>{h.both.toLocaleString('en-IN')}</b>, counted once</span>
      </div>
      {reasons.length ? <div className="ei-row">{reasons.map(([r, n]) => <span key={r}>Rejected: {r} <b>{n}</b></span>)}</div> : null}
      <div className="gc-table-wrap">
        <table className="ei-log gc-table--keep">
          <caption className="sr-only">Latest events</caption>
          <thead><tr><th scope="col">Time</th><th scope="col">Event</th><th scope="col">From</th><th scope="col">Order</th><th scope="col">Event ID</th><th scope="col">Result</th></tr></thead>
          <tbody>
            {h.log.slice(0, 8).map((r, i) => (
              <tr key={r.id + i}>
                <td>{time(r.at)}</td>
                <td>{EVENT_LABEL[r.name] || r.name}</td>
                <td>{SOURCE_LABEL[r.source] || r.source}</td>
                <td>{r.order || '—'}</td>
                <td className="ei-id">{r.id}</td>
                <td><StatusBadge tone={(STATUS[r.status] || STATUS.accepted)[1]}>{(STATUS[r.status] || STATUS.accepted)[0]}</StatusBadge>{r.reason ? <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>{r.reason}</span> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
