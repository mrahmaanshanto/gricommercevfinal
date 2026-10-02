'use client';
// HrReview — the one review drawer for staff requests: leave, salary advances and loans, attendance fixes. Lists show a
// short row (`Casual leave · Rafi Ahmed` / `7–8 Oct · 2 days` / Review); the drawer shows the summary first, then the
// facts, the impact (cover by day, balance, money) and history, with Approve / Deny in the footer. Closing it decides
// nothing. Used by the HR dashboard, Leave, Loans & advances and Attendance. Data: src/lib/hr.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { balanceOf } from '@/lib/ledger';
import { AccountSelect, accName } from '@/screens/accounts/accShared';
import {
  staffBy, leaveType, leaveDaysOf, leaveBalance, leaveWarnings, decideLeave, decideFix, decideLoan, coverageOf, dayPlan, isClosedDay,
  addDays, dayLabel, WEEKDAYS, dowOf, t12, shiftBy, loanLeft, advanceLimitOf, monthLabel, addMonths, monthOf, todayKey,
} from '@/lib/hr';
import { Avatar, money } from './hrShared';

const CSS = `
.rv{display:flex;flex-direction:column;gap:var(--space-4)}
.rv-who{display:flex;align-items:center;gap:var(--space-3)}
.rv-who b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rv-who small{font-size:var(--text-xs);color:var(--text-muted)}
.rv-sum{display:flex;flex-direction:column;gap:2px;padding:var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.rv-sum b{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rv-sum span{font-size:var(--text-sm);color:var(--text-body)}
.rv h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:var(--tracking-wide)}
.rv-kv{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.rv-kv dt{color:var(--text-muted)}
.rv-kv dd{margin:0;text-align:right;color:var(--text-heading);font-variant-numeric:tabular-nums}
.rv-days{display:flex;flex-direction:column}
.rv-day{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.rv-day:first-child{border-top:0}
.rv-day small{font-size:var(--text-xs);color:var(--text-muted)}
.rv-ok{color:var(--text-success)}
.rv-short{color:var(--text-warning);font-weight:var(--weight-medium)}
.rv-quote{margin:0;padding:var(--space-3) var(--space-4);border-left:3px solid var(--border-strong);background:var(--surface-card);font-size:var(--text-sm);color:var(--text-body)}
`;

const range = (a, b) => (a === b ? `${WEEKDAYS[dowOf(a)]} ${dayLabel(a)}` : `${dayLabel(a)} – ${dayLabel(b)}`);

/** A short row for a list: { title, sub, warn }. */
export function reviewRow(S, kind, x) {
  if (kind === 'leave') {
    const st = staffBy(S, x.code) || { name: x.code };
    const days = leaveDaysOf(S, x.code, x.from, x.to);
    return { title: `${leaveType(S, x.type).name} leave · ${st.name}`, sub: `${range(x.from, x.to)} · ${days} day${days === 1 ? '' : 's'}`, warn: leaveWarnings(S, x).length > 0 };
  }
  if (kind === 'loan') {
    const st = staffBy(S, x.code) || { name: x.code };
    return { title: `Salary ${x.type} · ${st.name}`, sub: `${money(x.amount)} · ${x.months} part${x.months === 1 ? '' : 's'}`, warn: false };
  }
  const st = staffBy(S, x.code) || { name: x.code };
  return { title: `Attendance fix · ${st.name}`, sub: `${WEEKDAYS[dowOf(x.key)]} ${dayLabel(x.key)}`, warn: false };
}

/** The drawer. `req` = { kind: 'leave' | 'loan' | 'fix', id } or null. */
export function HrReview({ S, req, onClose }) {
  const [deny, setDeny] = useState(null);         // reason being written
  const [pay, setPay] = useState({ account: 'cash-shop', months: '', start: '' });
  useEffect(() => { setDeny(null); }, [req && req.id]);
  const item = !req ? null : req.kind === 'leave' ? S.leave.requests.find((r) => r.id === req.id) : req.kind === 'loan' ? S.loans.find((l) => l.id === req.id) : S.fixes.find((f) => f.id === req.id);
  useEffect(() => {
    if (!req || req.kind !== 'loan' || !item) return;
    const who = staffBy(S, item.code) || {};
    setPay({ account: (S.settings.payAccounts || {})[who.payMethod] || 'cash-shop', months: String(item.months), start: item.start });
  }, [req && req.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!req || !item) return null;
  const st = staffBy(S, item.code) || { code: item.code, name: item.code, branch: '', designation: '' };
  const first = st.name.split(' ')[0];
  const done = (msg, opts) => { toast(msg, opts); onClose(); };

  // ---- leave ---------------------------------------------------------------------------------------------
  let title = '', body = null, approve = null, denyNeedsWhy = false;
  if (req.kind === 'leave') {
    const t = leaveType(S, item.type);
    const days = leaveDaysOf(S, item.code, item.from, item.to);
    const bal = leaveBalance(S, item.code)[item.type] || {};
    // cover shortfalls show in the cover rows below; the notes keep only what is not shown there (show a fact once)
    const warns = leaveWarnings(S, item).filter((w) => !/would have \d+ of \d+ people/.test(w));
    const Sx = { ...S, leave: { ...S.leave, requests: S.leave.requests.map((r) => (r.id === item.id ? { ...r, status: 'ok' } : r)) } };
    const cover = [];
    for (let k = item.from; k <= item.to; k = addDays(k, 1)) {
      const plan = dayPlan(S, st, k, true);
      if (isClosedDay(S, k)) { cover.push({ k, text: S.holidayMap[k] ? `Holiday · ${S.holidayMap[k]}` : 'Shop closed', tone: '' }); continue; }
      if (plan.kind !== 'work') { cover.push({ k, text: 'Weekly off · not counted', tone: '' }); continue; }
      const rows = coverageOf(Sx, k).filter((r) => r.place === st.branch && plan.shifts.includes(r.shift.id));
      if (!rows.length) { cover.push({ k, text: 'No shift', tone: '' }); continue; }
      rows.forEach((r) => cover.push({ k, text: `${r.shift.name} · ${r.n} of ${r.min || r.n} people`, tone: r.min && r.n < r.min ? 'short' : 'ok' }));
    }
    const past = S.leave.requests.filter((r) => r.code === item.code && r.id !== item.id && r.status === 'ok' && r.from.slice(0, 4) === item.from.slice(0, 4));
    title = 'Leave request';
    body = (<>
      <div className="rv-sum"><b>{t.name} leave · {days} day{days === 1 ? '' : 's'}</b><span>{range(item.from, item.to)}{!t.paid ? ' · unpaid' : ''}</span><span className="hr-sub">Asked {formatDate(item.at)}</span></div>
      <div><h3>Reason</h3>{item.reason ? <p className="rv-quote">{item.reason}</p> : <p className="hr-sub" style={{ margin: 0 }}>No reason given.</p>}</div>
      <div><h3>Balance</h3>
        <dl className="rv-kv">
          <dt>{t.name} left now</dt><dd>{bal.left == null ? 'No limit' : `${bal.left} of ${bal.quota}`}</dd>
          {bal.left != null ? <><dt>Left after this</dt><dd className={bal.left - days < 0 ? 'rv-short' : ''}>{bal.left - days}</dd></> : null}
          <dt>Taken this year</dt><dd>{past.length ? `${past.reduce((a, r) => a + leaveDaysOf(S, r.code, r.from, r.to), 0)} days` : 'None'}</dd>
        </dl>
      </div>
      <div><h3>Cover at {st.branch}</h3>
        <div className="rv-days">{cover.map((c, i) => <div key={i} className="rv-day"><span>{WEEKDAYS[dowOf(c.k)]} {dayLabel(c.k)}</span><span className={c.tone === 'short' ? 'rv-short' : c.tone === 'ok' ? 'rv-ok' : 'hr-sub'}>{c.text}</span></div>)}</div>
      </div>
      {warns.length ? <div className="hr-notes">{warns.map((w) => <div key={w} className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{w}</span></div>)}</div> : null}
    </>);
    approve = () => { decideLeave(item.id, 'ok'); done(`${st.name}’s leave approved. Roster and payroll updated.`, { undo: () => decideLeave(item.id, 'wait') }); };
    if (deny != null) approve = null;
  }

  // ---- advances and loans ------------------------------------------------------------------------------------
  if (req.kind === 'loan') {
    const lim = advanceLimitOf(S, st);
    const running = S.loans.filter((l) => l.code === item.code && l.status === 'run');
    const owed = running.reduce((a, l) => a + loanLeft(l), 0);
    const months = Number(pay.months || item.months);
    const emi = Math.ceil(item.amount / months);
    const bal = balanceOf(pay.account);
    const now = monthOf(todayKey(S));
    denyNeedsWhy = true;
    title = item.type === 'loan' ? 'Loan request' : 'Advance request';
    body = (<>
      <div className="rv-sum"><b>{money(item.amount)}</b><span>Salary {item.type} · back in {item.months} part{item.months === 1 ? '' : 's'} from {monthLabel(item.start)}</span><span className="hr-sub">Asked {formatDate(item.at)}</span></div>
      <div><h3>Reason</h3>{item.reason ? <p className="rv-quote">{item.reason}</p> : <p className="hr-sub" style={{ margin: 0 }}>No reason given.</p>}</div>
      <div><h3>Facts</h3>
        <dl className="rv-kv">
          <dt>Monthly gross</dt><dd>{money(st.gross || 0)}</dd>
          {item.type === 'advance' && lim != null ? <><dt>Advance limit</dt><dd className={item.amount > lim ? 'rv-short' : ''}>{money(lim)}</dd></> : null}
          <dt>Still owed</dt><dd>{owed ? `${money(owed)} on ${running.length}` : 'Nothing'}</dd>
          <dt>Cut each month</dt><dd>{money(emi)}</dd>
        </dl>
      </div>
      {deny == null ? (
        <div className="hr-form">
          <div className="hr-two">
            <div><label className="gc-label" htmlFor="rv-months">Pay back in</label><select id="rv-months" className="gc-input gc-select" value={pay.months} onChange={(e) => setPay({ ...pay, months: e.target.value })}>{[1, 2, 3, 4, 6, 9, 12].map((n) => <option key={n} value={n}>{n} month{n === 1 ? '' : 's'}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="rv-start">First cut from</label><select id="rv-start" className="gc-input gc-select" value={pay.start} onChange={(e) => setPay({ ...pay, start: e.target.value })}>{[0, 1, 2].map((n) => { const m = addMonths(now, n); return <option key={m} value={m}>{monthLabel(m)}</option>; })}{[0, 1, 2].some((n) => addMonths(now, n) === item.start) ? null : <option value={item.start}>{monthLabel(item.start)}</option>}</select></div>
          </div>
          <AccountSelect id="rv-acc" label="Pay it from" value={pay.account} onChange={(v) => setPay({ ...pay, account: v })} />
          {bal < item.amount ? <div className="hr-note hr-note--warn" role="status"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{accName(pay.account)} has only {money(bal)}.</span></div> : null}
        </div>
      ) : null}
    </>);
    approve = deny != null ? null : () => { decideLoan(item.id, true, { account: pay.account, months: pay.months, start: pay.start }); done(`${money(item.amount)} paid to ${st.name} from ${accName(pay.account)}.`); };
  }

  // ---- attendance fixes --------------------------------------------------------------------------------------
  if (req.kind === 'fix') {
    const rec = (S.att[item.key] || {})[item.code] || null;
    const plan = dayPlan(S, st, item.key);
    const sh = shiftBy(S, plan.shifts[0] || st.shift);
    title = 'Attendance fix';
    body = (<>
      <div className="rv-sum"><b>{WEEKDAYS[dowOf(item.key)]} {dayLabel(item.key)}</b><span>{sh ? `${sh.name} · ${t12(sh.start)}–${t12(sh.end)}` : 'No shift'}</span><span className="hr-sub">Asked {formatDate(item.at)}</span></div>
      <div><h3>What they say</h3><p className="rv-quote">{item.text}</p></div>
      <div><h3>Change</h3>
        <dl className="rv-kv">
          <dt>In</dt><dd>{rec && rec.in ? t12(rec.in) : '—'}{item.patch && item.patch.in ? <> → <b>{t12(item.patch.in)}</b></> : null}</dd>
          <dt>Out</dt><dd>{rec && rec.out ? t12(rec.out) : '—'}{item.patch && item.patch.out ? <> → <b>{t12(item.patch.out)}</b></> : null}</dd>
          <dt>Recorded by</dt><dd>{rec && rec.src ? rec.src : 'Nothing recorded'}</dd>
        </dl>
      </div>
    </>);
    approve = deny != null ? null : () => { decideFix(item.id, true); done(`${st.name}’s ${dayLabel(item.key)} updated.`); };
  }

  const pending = req.kind === 'leave' ? item.status === 'wait' : req.kind === 'loan' ? item.status === 'req' : item.status === 'wait';
  const sendDeny = (e) => {
    if (e) e.preventDefault();
    const why = (deny || '').trim();
    if (denyNeedsWhy && !why) { toast('Write a reason — they see it', { tone: 'error' }); return; }
    if (req.kind === 'leave') decideLeave(item.id, 'no', { why });
    else if (req.kind === 'loan') decideLoan(item.id, false, { why });
    else decideFix(item.id, false);
    done(`Denied. ${first} gets an SMS${why ? ' with the reason' : ''}.`, { tone: 'info' });
  };

  return (
    <Sheet open title={title} onClose={onClose}
      footer={!pending ? <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
        : deny != null ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDeny(null)}>Back</button><button type="submit" form="rv-deny" className="gc-btn gc-btn--error">Deny</button></>
          : <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDeny('')}>Deny</button><button type="button" className="gc-btn gc-btn--solid" onClick={approve}>{req.kind === 'loan' ? `Approve and pay ${money(item.amount)}` : 'Approve'}</button></>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rv">
        <div className="rv-who"><Avatar st={st} large /><span><b>{st.name}</b><small>{[st.designation, st.branch].filter(Boolean).join(' · ')}</small></span></div>
        {body}
        {deny != null ? (
          <form id="rv-deny" className="hr-form" onSubmit={sendDeny}>
            <div><label className="gc-label" htmlFor="rv-why">Reason {denyNeedsWhy ? '' : '(optional)'}</label><textarea id="rv-why" className="gc-input" rows={3} value={deny} onChange={(e) => setDeny(e.target.value)} style={{ minHeight: 80 }} placeholder={`${first} sees this in an SMS`} autoFocus /></div>
          </form>
        ) : null}
      </div>
    </Sheet>
  );
}
