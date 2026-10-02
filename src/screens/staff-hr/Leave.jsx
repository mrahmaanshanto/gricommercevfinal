'use client';
// Leave — decide requests (each opens the review drawer with the balance and cover), apply on someone's behalf, see
// who is off in the month and keep balances right. One card with the views Pending · Approved · Rejected · All ·
// Calendar · Balances. Approved leave shows on the roster and in the attendance register by itself; unpaid leave is
// cut in payroll. Data: src/lib/hr.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { HrReview } from './HrReview';
import { formatDate } from '@/lib/format';
import {
  todayKey, staffBy, leaveType, leaveDaysOf, leaveBalance, leaveWarnings, applyLeave, decideLeave, dayLabel, dowOf, WEEKDAYS,
  keysOf, monthOf, addMonths, monthLabel, weekStartOf, addDays, isClosedDay,
} from '@/lib/hr';
import { HrPage, useHr, Person, rowGo } from './hrShared';

const CSS = `
.lv-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:var(--space-3) var(--space-4) var(--space-4)}
.lv-wd{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center;padding:4px}
.lv-day{min-height:80px;min-width:0;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:4px;display:flex;flex-direction:column;gap:3px;background:var(--surface-card)}
.lv-day.is-closed{background:var(--surface-subtle)}
.lv-day.is-today{border-color:var(--primary)}
.lv-day.is-out{border-color:transparent;background:transparent}
.lv-day > span{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.lv-ev{font-size:var(--text-xs);font-weight:var(--weight-medium);padding:1px 6px;border-radius:var(--radius-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lv-ev--wait{background:transparent!important;border:1px dashed currentColor}
.lv-legend{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-3);margin-left:auto;font-size:var(--text-xs);color:var(--text-body)}
.lv-legend span{display:inline-flex;align-items:center;gap:6px}
.lv-legend i{width:10px;height:10px;border-radius:var(--radius-sm)}
.lv-bal{display:flex;flex-direction:column;gap:3px;min-width:110px}
@media (max-width:640px){.lv-day{min-height:56px}.lv-ev{font-size:var(--text-2xs)}.lv-legend{margin-left:0}}
`;
const TONE = { casual: ['var(--fill-info-soft)', 'var(--text-info)'], sick: ['var(--fill-error-soft)', 'var(--text-danger)'], earned: ['var(--fill-success-soft)', 'var(--text-success)'], festival: ['var(--fill-secondary-soft)', 'var(--secondary)'], maternity: ['var(--fill-primary-soft)', 'var(--primary)'], paternity: ['var(--fill-primary-soft)', 'var(--primary)'], unpaid: ['var(--surface-subtle)', 'var(--text-body)'] };
const toneOf = (t) => TONE[t] || TONE.unpaid;
const STATUS = { wait: ['Pending', 'warning'], ok: ['Approved', 'success'], no: ['Rejected', 'error'] };
const range = (a, b) => (a === b ? `${WEEKDAYS[dowOf(a)]} ${dayLabel(a)}` : `${dayLabel(a)} – ${dayLabel(b)}`);

export default function Leave() {
  const { S } = useHr();
  const today = todayKey(S);
  const [tab, setTab] = useState('req');
  const [rf, setRf] = useState('wait');
  const [month, setMonth] = useState(null);
  const [apply, setApply] = useState(null);
  const [reject, setReject] = useState(null);
  const [review, setReview] = useState(null);
  useEffect(() => { const t = new URLSearchParams(window.location.search).get('tab'); if (['req', 'cal', 'bal'].includes(t)) setTab(t); }, []);
  const mon = month || monthOf(today);
  const reqs = [...S.leave.requests].sort((a, b) => (b.status === 'wait') - (a.status === 'wait') || (a.status === 'wait' ? a.from.localeCompare(b.from) : b.from.localeCompare(a.from)));
  const shown = reqs.filter((r) => rf === 'all' || r.status === rf);
  const waiting = reqs.filter((r) => r.status === 'wait');
  const oldest = waiting.reduce((m, r) => Math.min(m, r.at), Infinity);
  const offOn = (k) => S.leave.requests.filter((r) => r.status === 'ok' && r.from <= k && r.to >= k);
  const offToday = offOn(today);
  const wk = weekStartOf(today);
  const offWeek = [...new Set(Array.from({ length: 7 }, (_, i) => offOn(addDays(wk, i)).map((r) => r.code)).flat())];
  const year = today.slice(0, 4);
  const takenYear = S.staff.reduce((a, st) => { const b = leaveBalance(S, st.code); return a + Object.values(b).reduce((x, v) => x + v.taken, 0); }, 0);

  const approve = (r) => {
    const st = staffBy(S, r.code);
    decideLeave(r.id, 'ok');
    toast(`${st.name}’s leave approved. Roster, attendance and payroll updated.`, { undo: () => decideLeave(r.id, 'wait') });
  };
  const saveReject = (e) => {
    e.preventDefault();
    const st = staffBy(S, reject.r.code);
    decideLeave(reject.r.id, 'no', { why: reject.why.trim() });
    toast(`${st.name}’s leave rejected. ${st.name.split(' ')[0]} gets an SMS${reject.why.trim() ? ' with the reason' : ''} and stays on the roster.`, { tone: 'info' });
    setReject(null);
  };

  const reqTab = (k, l) => ({ key: k, id: 'lv-tab-' + k, label: l, count: k === 'wait' ? waiting.length : null, on: tab === 'req' && rf === k, onClick: () => { setTab('req'); setRf(k); } });
  const tabs = [reqTab('wait', 'Pending'), reqTab('ok', 'Approved'), reqTab('no', 'Rejected'), reqTab('all', 'All'),
    { key: 'cal', id: 'lv-tab-cal', label: 'Calendar', on: tab === 'cal', onClick: () => setTab('cal') },
    { key: 'bal', id: 'lv-tab-bal', label: 'Balances', on: tab === 'bal', onClick: () => setTab('bal') }];

  return (
    <HrPage screen="Leave" active="hr-leave" page="Leave" title="Leave" icon="plane" css={CSS}
      about="Requests, who is off, and balances. Open a request to see the balance and the cover on each day, then approve or deny it."
      more={[{ label: 'Leave policies', href: '/hr-setup?sec=leave' }, { label: 'Shifts & roster', href: '/shifts' }]}
      primary={{ label: 'Apply on behalf', onClick: () => setApply({ code: S.staff[0].code, type: 'casual', from: addDays(today, 1), to: addDays(today, 1), reason: '', approve: true }) }}>

      <MetricStrip label="Who is off" items={[
        { label: 'Off today', value: String(offToday.length), sub: offToday.map((r) => staffBy(S, r.code).name.split(' ')[0]).join(', ') || null },
        { label: 'Off this week', value: String(offWeek.length), sub: `${dayLabel(wk)} – ${dayLabel(addDays(wk, 6))}` },
        { label: `Days taken · ${year}`, value: String(takenYear), sub: `across ${S.staff.length} staff` },
        { label: 'Waiting for you', value: String(waiting.length), sub: waiting.length ? `oldest ${Math.max(0, Math.round((S.now - oldest) / 864e5))} days` : 'all decided' },
      ]} />

      <section className="ix-card" aria-label="Leave">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Leave views" /></div>

        {tab === 'req' ? (
          shown.length ? (
            <>
              <ul className="ix-plist" aria-label="Leave requests">
                {shown.map((r) => {
                  const st = staffBy(S, r.code) || { code: r.code, name: r.code };
                  const days = leaveDaysOf(S, r.code, r.from, r.to);
                  return (
                    <li key={r.id}>
                      <button type="button" className="ix-pitem" onClick={() => setReview({ kind: 'leave', id: r.id })}>
                        <span className="ix-pitem__top"><b>{st.name}</b><StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</StatusBadge></span>
                        <span className="ix-pitem__mid">{leaveType(S, r.type).name} · {range(r.from, r.to)} · {days} day{days === 1 ? '' : 's'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Leave requests</caption>
                  <thead><tr><th scope="col">Staff</th><th scope="col">Leave</th><th scope="col">Dates</th><th scope="col" className="ix-num">Days</th><th scope="col">Asked</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    {shown.map((r) => {
                      const st = staffBy(S, r.code) || { code: r.code, name: r.code };
                      const t = leaveType(S, r.type), [bg, fg] = toneOf(r.type);
                      const days = leaveDaysOf(S, r.code, r.from, r.to);
                      const warns = r.status === 'wait' ? leaveWarnings(S, r) : [];
                      return (
                        <tr key={r.id} onClick={rowGo(() => setReview({ kind: 'leave', id: r.id }))}>
                          <td><Person st={st} /></td>
                          <td><span className="hr-chip" style={{ background: bg, color: fg }}>{t.name}</span></td>
                          <td>{range(r.from, r.to)}{warns.length ? <span className="hr-warn"> · check cover</span> : null}</td>
                          <td className="ix-num">{days}</td>
                          <td className="ix-muted">{r.at ? formatDate(r.at) : '—'}</td>
                          <td>{r.status === 'wait' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setReview({ kind: 'leave', id: r.id })} aria-label={`Review ${st.name}’s ${t.name.toLowerCase()} leave, ${range(r.from, r.to)}`}>Review</button> : <StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</StatusBadge>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="ix-foot"><span>{shown.length === 1 ? '1 request' : `${shown.length} requests`}</span></div>
            </>
          ) : <div className="ix-empty"><EmptyState icon="plane" title="No leave requests in this list" /></div>
        ) : null}

        {tab === 'cal' ? (
          <>
            <div className="hr-sub2">
              <span className="hr-step">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Previous month" onClick={() => setMonth(addMonths(mon, -1))}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
                <b>{monthLabel(mon)}</b>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Next month" onClick={() => setMonth(addMonths(mon, 1))}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
              </span>
              <div className="lv-legend">
                {['casual', 'sick', 'earned', 'festival', 'unpaid'].map((k) => <span key={k}><i style={{ background: toneOf(k)[1] }} />{leaveType(S, k).name.split(' ')[0]}</span>)}
                <span><i style={{ border: '1px dashed var(--text-muted)' }} />Pending</span>
              </div>
            </div>
            <div className="lv-cal">
              {[6, 0, 1, 2, 3, 4, 5].map((d) => <div key={d} className="lv-wd">{WEEKDAYS[d]}</div>)}
              {Array.from({ length: (dowOf(`${mon}-01`) + 1) % 7 }).map((_, i) => <div key={'x' + i} className="lv-day is-out" aria-hidden="true" />)}
              {keysOf(mon).map((k) => {
                const evs = S.leave.requests.filter((r) => r.status !== 'no' && r.from <= k && r.to >= k && leaveDaysOf(S, r.code, k, k));
                return (
                  <div key={k} className={'lv-day' + (isClosedDay(S, k) ? ' is-closed' : '') + (k === today ? ' is-today' : '')}>
                    <span>{Number(k.slice(8))}{S.holidayMap[k] ? <span className="hr-sub" style={{ display: 'inline' }}> · {S.holidayMap[k]}</span> : null}</span>
                    {evs.map((r) => { const [bg, fg] = toneOf(r.type); return <button key={r.id} type="button" className={'lv-ev' + (r.status === 'wait' ? ' lv-ev--wait' : '')} style={{ background: bg, color: fg, border: 0, font: 'inherit', textAlign: 'left', cursor: 'pointer' }} title={`${staffBy(S, r.code).name} · ${leaveType(S, r.type).name}${r.status === 'wait' ? ' (waiting)' : ''}`} onClick={() => setReview({ kind: 'leave', id: r.id })}>{staffBy(S, r.code).name.split(' ')[0]} · {leaveType(S, r.type).name.split(' ')[0].toLowerCase()}</button>; })}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {tab === 'bal' ? (
          <>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table gc-table--keep ix-table--static">
                <caption className="sr-only">Leave balances {year}</caption>
                <thead><tr><th scope="col">Staff</th>{['casual', 'sick', 'earned', 'festival'].map((k) => { const t = leaveType(S, k); return <th key={k} scope="col">{t.name.split(' ')[0]}{t.days ? ` · ${t.days}` : ''}</th>; })}<th scope="col" className="ix-num">Unpaid</th><th scope="col" className="ix-num">Taken {year}</th></tr></thead>
                <tbody>
                  {S.staff.filter((s) => s.status !== 'left').map((st) => {
                    const b = leaveBalance(S, st.code);
                    return (
                      <tr key={st.code}>
                        <td><Person st={st} /></td>
                        {['casual', 'sick', 'earned', 'festival'].map((k) => {
                          const v = b[k] || {}, q = v.quota || 0, left = v.left ?? 0;
                          return <td key={k}>
                            <span className="lv-bal">
                              <span className="hr-bar-track" style={{ width: 80 }}><span className="hr-bar-fill" style={{ display: 'block', width: q ? `${Math.max(0, left) / q * 100}%` : 0, background: toneOf(k)[1] }} /></span>
                              <span className={'hr-sub hr-fig' + (left < 0 ? ' hr-out' : '')}>{q ? `${left} of ${q} left` : 'Not yet'}{v.pending ? ` · ${v.pending} asked` : ''}</span>
                            </span>
                          </td>;
                        })}
                        <td className="ix-num">{(b.unpaid || {}).taken || '—'}</td>
                        <td className="ix-num hr-strong">{Object.values(b).reduce((a, v) => a + v.taken, 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="ix-foot"><span>Days left of the yearly allowance <InfoTip text="Counts leave approved here and days taken earlier this year. Earned leave builds up at 1 day for every 18 days worked, after the first year. Weekly off days and public holidays inside a leave are not counted." /></span></div>
          </>
        ) : null}
      </section>
      <LearnMore topic="leave" />

      <HrReview S={S} req={review} onClose={() => setReview(null)} />
      <Dialog open={!!apply} title="Apply for leave" onClose={() => setApply(null)} width={600}
        footer={apply ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setApply(null)}>Cancel</button><button type="submit" form="lv-apply" className="gc-btn gc-btn--solid">{apply.approve ? 'Save and approve' : 'Save as request'}</button></> : null}>
        {apply ? (() => {
          const st = staffBy(S, apply.code), days = leaveDaysOf(S, apply.code, apply.from, apply.to), bal = leaveBalance(S, apply.code)[apply.type];
          const warns = apply.from && apply.to >= apply.from ? leaveWarnings(S, { ...apply, status: 'wait' }) : [];
          const submit = (e) => {
            e.preventDefault();
            if (!apply.from || apply.to < apply.from) { toast('Pick the dates — the last day can not be before the first', { tone: 'error' }); return; }
            if (!days) { toast('Those days are already off (weekly off or holiday)', { tone: 'error' }); return; }
            applyLeave({ ...apply, reason: apply.reason.trim() });
            toast(`${leaveType(S, apply.type).name} leave for ${st.name}, ${range(apply.from, apply.to)} (${days} day${days === 1 ? '' : 's'}) ${apply.approve ? 'approved. Roster and payroll updated.' : 'saved for approval.'}`);
            setApply(null);
          };
          return (
            <form id="lv-apply" className="hr-form" onSubmit={submit}>
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="la-staff">Staff</label><select id="la-staff" className="gc-input gc-select" value={apply.code} onChange={(e) => setApply({ ...apply, code: e.target.value })}>{S.staff.filter((s) => s.status === 'active' || s.status === 'probation').map((s) => <option key={s.code} value={s.code}>{s.name} · {s.branch}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="la-type">Leave type</label><select id="la-type" className="gc-input gc-select" value={apply.type} onChange={(e) => setApply({ ...apply, type: e.target.value })}>{S.settings.leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}{t.paid ? '' : ' (unpaid)'}</option>)}</select></div>
              </div>
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="la-from">From</label><input id="la-from" type="date" className="gc-input" value={apply.from} onChange={(e) => setApply({ ...apply, from: e.target.value, to: apply.to < e.target.value ? e.target.value : apply.to })} /></div>
                <div><label className="gc-label" htmlFor="la-to">To</label><input id="la-to" type="date" className="gc-input" value={apply.to} min={apply.from} onChange={(e) => setApply({ ...apply, to: e.target.value })} /></div>
              </div>
              <div><label className="gc-label" htmlFor="la-why">Reason</label><input id="la-why" className="gc-input" value={apply.reason} onChange={(e) => setApply({ ...apply, reason: e.target.value })} placeholder="Optional" /></div>
              <div className="hr-notes">
                <div className="hr-note hr-note--info"><Icon name="calendar-days" width="16" height="16" aria-hidden="true" /><span><b>{days} working day{days === 1 ? '' : 's'}</b>{bal && bal.left != null ? ` · ${bal.left} ${leaveType(S, apply.type).name.toLowerCase()} left now, ${bal.left - days} after` : ''}{!leaveType(S, apply.type).paid ? ' · cut from salary' : ''}.</span></div>
                {warns.map((w) => <div key={w} className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{w}</span></div>)}
              </div>
              <label className="hr-check"><input type="checkbox" checked={apply.approve} onChange={(e) => setApply({ ...apply, approve: e.target.checked })} />Approve it now</label>
            </form>
          );
        })() : null}
      </Dialog>

      <Dialog open={!!reject} title={reject ? `Reject ${staffBy(S, reject.r.code).name}’s leave?` : 'Reject leave'} onClose={() => setReject(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setReject(null)}>Cancel</button><button type="submit" form="lv-reject" className="gc-btn gc-btn--solid gc-btn--error">Reject leave</button></>}>
        {reject ? (
          <form id="lv-reject" className="hr-form" onSubmit={saveReject}>
            <p className="gc-help" style={{ margin: 0 }}>{leaveType(S, reject.r.type).name} leave, {range(reject.r.from, reject.r.to)}. They stay on the roster for these days.</p>
            <div><label className="gc-label" htmlFor="rj-why">Reason (sent by SMS)</label><input id="rj-why" className="gc-input" value={reject.why} onChange={(e) => setReject({ ...reject, why: e.target.value })} placeholder="For example: two others are off that day" data-autofocus /></div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
