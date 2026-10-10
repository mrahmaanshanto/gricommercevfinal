'use client';
// ReviewDrawer — the one review drawer for GridCommerce staff requests (leave and attendance fixes), copied from the
// merchant panel's staff-hr/HrReview.jsx: the person, the summary first, then the facts (reason, balance, the change),
// the cover by day for leave, and Approve / Deny in the footer. Deny asks for a reason. Closing it decides nothing.
// Used by Leave, Attendance and the employee page. Data: lib/admin/people.js (decideLeave, decideFix, reopenLeave).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { dmy } from '@/lib/platform/util';
import {
  empBy, LEAVE_TYPES, REQ_STATUS, leaveDays, balanceOf, coverOf, decideLeave, decideFix, reopenLeave, cellOf, dayLong, rangeLabel, tm, OFFICE,
} from '@/lib/admin/people';
import { Avatar, meName, plural } from './peopleShared';

const CSS = `
.rv{display:flex;flex-direction:column;gap:var(--space-4)}
.rv-who{display:flex;align-items:center;gap:var(--space-3)}
.rv-who b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rv-who small{font-size:var(--text-xs);color:var(--text-muted)}
.rv-sum{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.rv-sum b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rv-sum span{font-size:var(--text-sm);color:var(--text-body)}
.rv-sum small{font-size:var(--text-xs);color:var(--text-muted)}
.rv h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.rv-kv{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.rv-kv dt{color:var(--text-muted)}
.rv-kv dd{margin:0;text-align:right;color:var(--text-heading);font-variant-numeric:tabular-nums}
.rv-days{display:flex;flex-direction:column}
.rv-day{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:36px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.rv-day:first-child{border-top:0}
.rv-day small{display:block;font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.rv-ok{color:var(--text-success)}
.rv-short{color:var(--text-warning);font-weight:var(--weight-medium)}
.rv-mute{color:var(--text-muted)}
.rv-quote{margin:0;padding:var(--space-2) var(--space-3);border-left:3px solid var(--border-strong);background:var(--surface-card);font-size:var(--text-sm);color:var(--text-body)}
.rv-done{display:flex;flex-direction:column;gap:4px;font-size:var(--text-sm);color:var(--text-body)}
`;

/** A short row for a list: { title, sub }. */
export function reviewRow(D, kind, x) {
  const e = empBy(D, x.emp) || { name: x.emp };
  if (kind === 'leave') {
    const n = leaveDays(x.from, x.to);
    return { title: `${LEAVE_TYPES[x.type].label} leave · ${e.name}`, sub: `${rangeLabel(x.from, x.to)} · ${plural(n, 'day')}` };
  }
  return { title: `Attendance fix · ${e.name}`, sub: dayLong(x.key) };
}

/** The drawer. `req` = { kind: 'leave' | 'fix', id } or null. */
export function ReviewDrawer({ D, t, req, onClose }) {
  const [deny, setDeny] = useState(null);   // the reason being written, or null
  const [err, setErr] = useState('');
  useEffect(() => { setDeny(null); setErr(''); }, [req && req.id]);
  const item = !req ? null : req.kind === 'leave' ? D.leave.find((x) => x.id === req.id) : D.fixes.find((x) => x.id === req.id);
  if (!req || !item) return null;
  const e = empBy(D, item.emp) || { id: item.emp, name: item.emp, designation: '', dept: '' };
  const first = e.name.split(' ')[0];
  const me = meName();
  const pending = item.status === 'wait';
  const st = REQ_STATUS[item.status];
  let title = '', body = null;

  if (req.kind === 'leave') {
    const lt = LEAVE_TYPES[item.type];
    const n = leaveDays(item.from, item.to);
    const bal = balanceOf(D, item.emp, t)[item.type];
    const leftNow = pending ? bal.left : bal.left + (item.status === 'ok' ? n : 0);
    const cover = coverOf(D, item);
    const short = cover.filter((c) => c.tone === 'short').length;
    const past = D.leave.filter((x) => x.emp === item.emp && x.id !== item.id && x.status === 'ok' && x.from.slice(0, 4) === item.from.slice(0, 4));
    title = 'Leave request';
    body = (<>
      <div className="rv-sum"><b>{lt.label} leave · {plural(n, 'working day')}</b><span>{rangeLabel(item.from, item.to)}</span><small>Asked {dmy(item.at)}{item.addedBy ? ` · added by ${item.addedBy}` : ''}</small></div>
      <div><h3>Reason</h3>{item.reason ? <p className="rv-quote">{item.reason}</p> : <p className="rv-mute" style={{ margin: 0 }}>No reason given.</p>}</div>
      <div><h3>Balance · {item.from.slice(0, 4)}</h3>
        <dl className="rv-kv">
          <dt>{lt.label} left {pending ? 'now' : 'before this'}</dt><dd>{leftNow} of {bal.quota}</dd>
          <dt>Left after this</dt><dd className={leftNow - n < 0 ? 'rv-short' : ''}>{leftNow - n}</dd>
          <dt>Other leave taken this year</dt><dd>{past.length ? plural(past.reduce((a, x) => a + leaveDays(x.from, x.to), 0), 'day') : 'None'}</dd>
        </dl>
      </div>
      <div><h3>Cover in {e.dept}</h3>
        <div className="rv-days">{cover.map((c) => (
          <div key={c.key} className="rv-day"><span>{dayLong(c.key)}</span>
            <span className={c.tone === 'short' ? 'rv-short' : c.tone === 'ok' ? 'rv-ok' : 'rv-mute'}>{c.text}{c.off && c.off.length ? <small>Also off: {c.off.join(', ')}</small> : null}</span>
          </div>
        ))}</div>
      </div>
      {pending && short ? <div className="pp-note pp-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{e.dept} would be short on {plural(short, 'day')}. Check who covers before approving.</span></div> : null}
      {pending && leftNow - n < 0 ? <div className="pp-note pp-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>Not enough {lt.label.toLowerCase()} leave left. Deny it, or ask {first} to change the type.</span></div> : null}
    </>);
  } else {
    const c = cellOf(D, e, item.key, t) || {};
    const rec = (D.att[item.key] || {})[item.emp] || {};
    title = 'Attendance fix';
    body = (<>
      <div className="rv-sum"><b>{dayLong(item.key)}</b><span>Office hours {tm(OFFICE.start)}–{tm(OFFICE.end)} · late after {tm(OFFICE.late)}</span><small>Asked {dmy(item.at)}</small></div>
      <div><h3>What {first} says</h3><p className="rv-quote">{item.text}</p></div>
      <div><h3>Change</h3>
        <dl className="rv-kv">
          <dt>In</dt><dd>{pending ? tm(rec.in) : tm(c.in)}{pending && item.patch.in != null ? <> → <b>{tm(item.patch.in)}</b></> : null}</dd>
          <dt>Out</dt><dd>{pending ? (rec.out == null ? 'Missing' : tm(rec.out)) : (c.out == null ? 'Missing' : tm(c.out))}{pending && item.patch.out != null ? <> → <b>{tm(item.patch.out)}</b></> : null}</dd>
          <dt>Recorded by</dt><dd>{rec.src === 'app' ? 'Staff app' : rec.src === 'card' ? 'Office card reader' : rec.src === 'fix' ? 'Approved fix' : rec.src === 'hand' ? 'Typed by HR' : 'Nothing recorded'}</dd>
        </dl>
      </div>
    </>);
  }

  const done = (msg, opts) => { toast(msg, opts); onClose(); };
  const approve = () => {
    const res = req.kind === 'leave' ? decideLeave(item.id, true, '', me) : decideFix(item.id, true, '', me);
    if (!res.ok) { setErr(res.error); return; }
    if (req.kind === 'leave') done(`${e.name}’s leave approved. It shows on the calendar and in attendance.`, { undo: () => reopenLeave(item.id) });
    else done(`${e.name}’s ${dayLong(item.key)} updated.`);
  };
  const sendDeny = (ev) => {
    if (ev) ev.preventDefault();
    const why = (deny || '').trim();
    if (!why) { setErr('Write a reason — they see it.'); return; }
    const res = req.kind === 'leave' ? decideLeave(item.id, false, why, me) : decideFix(item.id, false, why, me);
    if (!res.ok) { setErr(res.error); return; }
    done(`Denied. ${first} gets an email with the reason.`, { tone: 'info' });
  };

  return (
    <Sheet open title={title} onClose={onClose}
      footer={!pending ? <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
        : deny != null ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setDeny(null); setErr(''); }}>Back</button><button type="submit" form="rv-deny" className="gc-btn gc-btn--solid gc-btn--error">Deny</button></>
          : <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setDeny(''); setErr(''); }}>Deny</button><button type="button" className="gc-btn gc-btn--solid" onClick={approve}>Approve</button></>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rv">
        <div className="rv-who"><Avatar e={e} /><span><b>{e.name}</b><small>{[e.designation, e.dept].filter(Boolean).join(' · ')}</small></span></div>
        {!pending ? (
          <div className="rv-done">
            <span><StatusBadge tone={st.tone}>{st.label}</StatusBadge>{item.by ? ` by ${item.by}` : ''}{item.decidedAt ? `, ${dmy(item.decidedAt)}` : ''}</span>
            {item.why ? <p className="rv-quote">{item.why}</p> : null}
          </div>
        ) : null}
        {body}
        {deny != null ? (
          <form id="rv-deny" className="pp-form" onSubmit={sendDeny}>
            <div>
              <label className="gc-label" htmlFor="rv-why">Reason</label>
              <textarea id="rv-why" className={'gc-input' + (err ? ' gc-input--error' : '')} rows={3} value={deny} onChange={(ev) => { setDeny(ev.target.value); setErr(''); }}
                style={{ minHeight: 80 }} placeholder={`${first} sees this in the email`} aria-invalid={err ? true : undefined} autoFocus />
            </div>
          </form>
        ) : null}
        {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
      </div>
    </Sheet>
  );
}
