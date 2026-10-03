'use client';
// ActionPills — a page's to-do as short pills, read from lib/actionItems.js (brief #10). Each pill opens the page where
// the work is done; its ⋯ snoozes it (an hour, or until tomorrow) or dismisses it. The most urgent `max` show; "View all"
// opens every open item with its age and owner, and the snoozed and dismissed ones (Restore).
// Used by the Homes; other overviews can use it too:
//   const rows = trackItems('finance', [{ key, label, n, href, severity, owner, since, area }]);
//   <ActionPills rows={rows} source="finance" />           (re-run trackItems on ACTIONS_EVENT)

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { Menu } from '@/components/ui/IndexKit';
import { formatTime, formatDate } from '@/lib/format';
import { resolveItem, reopenItem, listItems, snoozeUntil, ageOf, ageText, SEVERITY } from '@/lib/actionItems';
import { ROLES } from '@/lib/team';

export const PILLS_CSS = `
.ap{display:flex;flex-wrap:wrap;justify-content:center;gap:var(--space-2);max-width:760px}
.ap--start{justify-content:flex-start}
.ap-pill{display:inline-flex;align-items:center;height:32px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-xs);transition:var(--transition-colors)}
.ap-pill:hover,.ap-pill:focus-within{border-color:var(--primary)}
.ap-pill>a{display:inline-flex;align-items:center;gap:var(--space-2);height:100%;padding:0 2px 0 12px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;white-space:nowrap}
.ap-pill>a:hover{color:var(--primary)}
.ap-pill b,.ap-all b{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-dot{width:6px;height:6px;flex:none;border-radius:var(--radius-full);background:var(--text-info)}
.ap-dot--critical{background:var(--text-danger)}
.ap-dot--high{background:var(--text-warning)}
.ap-dot--low{background:var(--text-muted)}
.ap-more{display:grid;place-items:center;width:28px;height:28px;margin-right:2px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.ap-more:hover,.ap-more[aria-expanded="true"]{background:var(--surface-subtle);color:var(--text-heading)}
.ap-all{display:inline-flex;align-items:center;gap:var(--space-2);height:32px;padding:0 5px 0 12px;border:1px dashed var(--border-strong);border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ap-all:hover{border-color:var(--primary);color:var(--primary)}
.ap-all:not(:has(b)){padding-right:12px}
.ap-list{display:flex;flex-direction:column;text-align:left}
.ap-h,.ap-empty{text-align:left}
.ap-row{display:flex;align-items:center;gap:var(--space-3);padding:10px 0;border-top:1px solid var(--border-subtle)}
.ap-row:first-child{border-top:0}
.ap-row__main{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.ap-row__main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ap-row__main small{font-size:var(--text-xs);color:var(--text-muted)}
.ap-row__acts{display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:4px}
.ap-h{margin:var(--space-5) 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.ap-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.ap-doneline{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:var(--space-3)}
.ap-done{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-success)}
@media (max-width:640px){.ap-pill{height:40px}.ap-more{width:36px;height:36px}.ap-all{height:40px}.ap-row{flex-wrap:wrap}}
`;

const owners = (r) => (r && r.owner && r.owner.length ? r.owner.map((o) => (ROLES[o] ? ROLES[o].title : o)).join(', ') : '');
const sev = (r) => SEVERITY[(r && r.severity) || 'normal'] || SEVERITY.normal;

function snooze(row, kind) {
  resolveItem(row.key, 'snoozed', { until: snoozeUntil(kind) });
  toast(kind === 'tomorrow' ? 'Snoozed until tomorrow' : 'Snoozed for an hour', { undo: () => reopenItem(row.key) });
}
function dismiss(row) {
  resolveItem(row.key, 'dismissed');
  toast('Dismissed', { undo: () => reopenItem(row.key) });
}
const menuFor = (row) => [
  { label: 'Snooze 1 hour', icon: 'alarm-clock', onClick: () => snooze(row, 'hour') },
  { label: 'Snooze until tomorrow', icon: 'sunrise', onClick: () => snooze(row, 'tomorrow') },
  { label: 'Dismiss', icon: 'x', onClick: () => dismiss(row) },
];

/** rows: trackItems() output ({ key, label, n, href, severity, item }). */
export function ActionPills({ rows, max = 5, source, align = 'center', label = 'To do', doneText = 'Nothing is waiting for you.' }) {
  const [all, setAll] = useState(false);
  const list = rows || [];
  const shown = list.slice(0, max);
  const parked = listItems({ source, all: true }).filter((r) => r.resolution && r.resolution.state !== 'done');
  return (
    <>
      {!list.length ? (
        <span className="ap-doneline">
          <span className="ap-done"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />{doneText}</span>
          {parked.length ? <button type="button" className="ap-all" onClick={() => setAll(true)}>View all</button> : null}
        </span>
      ) : (
      <nav className={'ap' + (align === 'start' ? ' ap--start' : '')} aria-label={label}>
        {shown.map((r) => (
          <span key={r.key} className="ap-pill">
            <Link href={r.href} title={r.item ? `${sev(r.item).label} · waiting ${ageText(ageOf(r.item))}` : undefined}>
              <i className={'ap-dot ap-dot--' + (r.severity || 'normal')} aria-hidden="true" />{r.label}{r.n != null && r.n !== '' ? <b>{r.n}</b> : null}
            </Link>
            <Menu label="" icon="ellipsis" cls="ap-more" items={menuFor(r)} />
          </span>
        ))}
        <button type="button" className="ap-all" onClick={() => setAll(true)}>View all{list.length > max ? <b>{list.length}</b> : null}</button>
      </nav>
      )}
      <Sheet open={all} title={label} onClose={() => setAll(false)}>
        {list.length ? (
          <div className="ap-list">
            {list.map((r) => (
              <div key={r.key} className="ap-row">
                <span className="ap-row__main">
                  <b>{r.label}{r.n != null && r.n !== '' ? ` · ${r.n}` : ''}</b>
                  <small>{[r.item ? 'Waiting ' + ageText(ageOf(r.item)) : '', owners(r.item || r)].filter(Boolean).join(' · ')}</small>
                </span>
                <StatusBadge tone={sev(r).tone}>{sev(r).label}</StatusBadge>
                <span className="ap-row__acts">
                  <Link href={r.href} className="ix-btn ix-btn--sm" onClick={() => setAll(false)}>Open</Link>
                  <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={menuFor(r)} />
                </span>
              </div>
            ))}
          </div>
        ) : <p className="ap-empty">Nothing is waiting for you.</p>}
        {parked.length ? (
          <>
            <h3 className="ap-h">Snoozed and dismissed</h3>
            <div className="ap-list">
              {parked.map((r) => (
                <div key={r.key} className="ap-row">
                  <span className="ap-row__main">
                    <b>{r.label}{r.n != null && r.n !== '' ? ` · ${r.n}` : ''}</b>
                    <small>{r.resolution.state === 'snoozed' ? `Snoozed until ${formatDate(r.resolution.until)}, ${formatTime(r.resolution.until)}` : 'Dismissed'} by {r.resolution.byName}</small>
                  </span>
                  <span className="ap-row__acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => reopenItem(r.key)}><Icon name="rotate-ccw" width="14" height="14" aria-hidden="true" />Restore</button></span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Sheet>
    </>
  );
}
