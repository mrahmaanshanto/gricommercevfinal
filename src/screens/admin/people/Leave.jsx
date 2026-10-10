'use client';
// Leave (/admin/leave) — GridCommerce staff leave, copied from the merchant panel's staff-hr/Leave.jsx: requests
// (waiting ones first, each opens the review drawer with the balance and the department's cover by day, Approve / Deny
// with a reason), the month calendar, balances per person (casual 10, sick 14, annual 18 working days a year) and
// the history of decisions. "Add leave" records leave for someone (?new=1&emp=GC-E011 opens it).
// Data: lib/admin/people.js (addLeave, decideLeave via ReviewDrawer). ?tab= stays in the address.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, MetricStrip } from '@/components/ui/IndexKit';
import { dmy } from '@/lib/platform/util';
import {
  empBy, current, LEAVE_TYPES, REQ_STATUS, HOLIDAYS, leaveList, leaveDays, balanceOf, addLeave, keyOf, addDays, dowOf, isWorkday, isWeekend,
  rangeLabel, periodOfKey, addPeriod, periodLabel, daysOfPeriod, WEEKDAYS,
} from '@/lib/admin/people';
import { AdminShell } from '../AdminShell';
import { ReviewDrawer } from './ReviewDrawer';
import { PEOPLE_CSS, usePeople, meName, plural, Person, Skeleton, rowGo, setParam, Field, ctl } from './peopleShared';

const CSS = `
.lv-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:var(--space-3) var(--space-4) var(--space-4)}
.lv-wd{padding:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center}
.lv-day{display:flex;flex-direction:column;gap:3px;min-width:0;min-height:84px;padding:4px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-card)}
.lv-day.is-off{background:var(--surface-subtle)}
.lv-day.is-today{border-color:var(--primary)}
.lv-day.is-out{border-color:transparent;background:transparent}
.lv-day>span{overflow:hidden;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);text-overflow:ellipsis;white-space:nowrap}
.lv-ev{display:block;width:100%;overflow:hidden;padding:1px 6px;border:0;border-radius:var(--radius-sm);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
.lv-ev--wait{background:transparent!important;outline:1px dashed currentColor;outline-offset:-1px}
.lv-ev:focus-visible{outline:2px solid var(--primary)}
.lv-bal{display:flex;flex-direction:column;gap:3px;min-width:120px}
.lv-group{padding:8px 12px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
@media (max-width:640px){.lv-cal{gap:2px;padding:var(--space-2)}.lv-day{min-height:56px;padding:2px}.lv-ev{padding:0 3px;font-size:var(--text-2xs)}}
`;
const TONE = { casual: ['var(--fill-info-soft)', 'var(--text-info)'], sick: ['var(--fill-error-soft)', 'var(--text-danger)'], annual: ['var(--fill-success-soft)', 'var(--text-success)'] };
const TABS = [['req', 'Requests'], ['cal', 'Calendar'], ['bal', 'Balances'], ['hist', 'History']];

function TypeChip({ type }) {
  const [bg, fg] = TONE[type];
  return <span className="pp-chip" style={{ background: bg, color: fg }}>{LEAVE_TYPES[type].label}</span>;
}

/** The "Add leave" side panel. */
export function AddLeave({ D, t, open, emp, onClose }) {
  const tomorrow = (() => { let k = addDays(keyOf(t), 1); while (!isWorkday(k)) k = addDays(k, 1); return k; })();
  const blank = () => ({ emp: emp || '', type: 'casual', from: tomorrow, to: tomorrow, reason: '', approve: true, error: '' });
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank()); }, [open, emp]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  const n = leaveDays(f.from, f.to);
  const bal = f.emp ? balanceOf(D, f.emp, t)[f.type] : null;
  const set = (k) => (ev) => { const v = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value; setF((o) => ({ ...o, [k]: v, ...(k === 'from' && o.to < v ? { to: v } : {}), error: '' })); };
  const save = (ev) => {
    ev.preventDefault();
    const res = addLeave(f, meName());
    if (!res.ok) { setF((o) => ({ ...o, error: res.error })); return; }
    const e = empBy(D, f.emp);
    toast(`${LEAVE_TYPES[f.type].label} leave for ${e.name}, ${rangeLabel(f.from, f.to)} · ${plural(res.days, 'day')} ${f.approve ? 'approved' : 'saved for a decision'}`);
    onClose();
  };
  return (
    <Sheet open title="Add leave" onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="submit" form="lv-add" className="gc-btn gc-btn--solid">{f.approve ? 'Save and approve' : 'Save as request'}</button>
      </>}>
      <form id="lv-add" className="pp-form" onSubmit={save} noValidate>
        <Field id="la-emp" label="Employee">
          <select id="la-emp" {...ctl(null, true)} value={f.emp} onChange={set('emp')} data-autofocus>
            <option value="">Choose a person</option>
            {current(D).map((e) => <option key={e.id} value={e.id}>{e.name} · {e.dept}</option>)}
          </select>
        </Field>
        <Field id="la-type" label="Leave type">
          <select id="la-type" {...ctl(null, true)} value={f.type} onChange={set('type')}>{Object.entries(LEAVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label} · {v.days} days a year</option>)}</select>
        </Field>
        <div className="pp-two">
          <Field id="la-from" label="From"><input id="la-from" type="date" {...ctl()} value={f.from} onChange={set('from')} /></Field>
          <Field id="la-to" label="To"><input id="la-to" type="date" {...ctl()} value={f.to} min={f.from} onChange={set('to')} /></Field>
        </div>
        <Field id="la-why" label="Reason (optional)"><input id="la-why" {...ctl()} value={f.reason} onChange={set('reason')} /></Field>
        <div className="pp-note pp-note--info"><Icon name="calendar-days" width="16" height="16" aria-hidden="true" />
          <span><b>{plural(n, 'working day')}</b>{bal ? ` · ${bal.left} ${LEAVE_TYPES[f.type].label.toLowerCase()} left now, ${bal.left - n} after` : ''}. Weekends and holidays are not counted.</span>
        </div>
        <label className="gc-check" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
          <input type="checkbox" checked={f.approve} onChange={set('approve')} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />Approve it now
        </label>
        {f.error ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{f.error}</p> : null}
      </form>
    </Sheet>
  );
}

export default function Leave() {
  const { D, t, live } = usePeople();
  const [tab, setTab] = useState('req');
  const [month, setMonth] = useState(null);
  const [review, setReview] = useState(null);
  const [adding, setAdding] = useState(null);   // { emp } while open

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (p.get('new') === '1') setAdding({ emp: p.get('emp') || '' });
    if (p.get('req')) setReview({ kind: 'leave', id: p.get('req') });
  }, []);
  const go = (k) => { setTab(k); setParam('tab', k === 'req' ? '' : k); };

  const today = keyOf(t);
  const mon = month || periodOfKey(today);
  const all = leaveList(D);
  const waiting = all.filter((x) => x.status === 'wait');
  const coming = all.filter((x) => x.status === 'ok' && x.to >= today).sort((a, b) => a.from.localeCompare(b.from));
  const decided = D.leave.filter((x) => x.status !== 'wait').sort((a, b) => (b.decidedAt || 0) - (a.decidedAt || 0));
  const offOn = (k) => D.leave.filter((x) => x.status === 'ok' && x.from <= k && x.to >= k && isWorkday(k));
  const offToday = offOn(today);
  let wk = today; while (dowOf(wk) !== 6) wk = addDays(wk, -1);   // the week starts on Saturday
  const offWeek = [...new Set(Array.from({ length: 7 }, (_, i) => offOn(addDays(wk, i)).map((x) => x.emp)).flat())];
  const year = today.slice(0, 4);
  const takenYear = current(D).reduce((a, e) => a + Object.values(balanceOf(D, e.id, t)).reduce((x, b) => x + b.taken, 0), 0);
  const name = (id) => (empBy(D, id) || { name: id }).name;

  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'lv-tab-' + k, label: l, count: k === 'req' && live ? waiting.length : null, on: tab === k, onClick: () => go(k) }));

  const reqRows = (list, label) => (<>
    <div className="lv-group">{label}</div>
    <ul className="ix-plist" aria-label={label}>
      {list.map((x) => { const e = empBy(D, x.emp) || { name: x.emp }; const n = leaveDays(x.from, x.to); return (
        <li key={x.id}><button type="button" className="ix-pitem" onClick={() => setReview({ kind: 'leave', id: x.id })}>
          <span className="ix-pitem__top"><b>{e.name}</b><StatusBadge tone={REQ_STATUS[x.status].tone}>{REQ_STATUS[x.status].label}</StatusBadge></span>
          <span className="ix-pitem__mid">{LEAVE_TYPES[x.type].label} · {rangeLabel(x.from, x.to)} · {plural(n, 'day')}</span>
        </button></li>
      ); })}
    </ul>
    <div className="ix-table-wrap">
      <table className="ix-table gc-table--keep">
        <caption className="sr-only">{label}</caption>
        <thead><tr><th scope="col">Employee</th><th scope="col">Leave</th><th scope="col">Dates</th><th scope="col" className="ix-num">Days</th><th scope="col">Asked</th><th scope="col">Status</th></tr></thead>
        <tbody>
          {list.map((x) => { const e = empBy(D, x.emp) || { id: x.emp, name: x.emp }; const n = leaveDays(x.from, x.to); return (
            <tr key={x.id} onClick={rowGo(() => setReview({ kind: 'leave', id: x.id }))}>
              <td><Person e={e} sub={e.dept} tab="leave" /></td>
              <td><TypeChip type={x.type} /></td>
              <td>{rangeLabel(x.from, x.to)}</td>
              <td className="ix-num">{n}</td>
              <td className="ix-muted">{dmy(x.at)}</td>
              <td>{x.status === 'wait'
                ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setReview({ kind: 'leave', id: x.id })} aria-label={`Review ${e.name}’s ${LEAVE_TYPES[x.type].label.toLowerCase()} leave, ${rangeLabel(x.from, x.to)}`}>Review</button>
                : <StatusBadge tone={REQ_STATUS[x.status].tone}>{REQ_STATUS[x.status].label}</StatusBadge>}</td>
            </tr>
          ); })}
        </tbody>
      </table>
    </div>
  </>);

  let body = null;
  if (tab === 'req') {
    body = waiting.length || coming.length ? (<>
      {waiting.length ? reqRows(waiting, `Waiting for a decision · ${waiting.length}`) : <div className="lv-group">Nothing waiting for a decision</div>}
      {coming.length ? reqRows(coming, `Approved, coming up · ${coming.length}`) : null}
      <div className="ix-foot"><span>Oldest first; a row opens the request</span></div>
    </>) : <div className="ix-empty"><EmptyState icon="plane" title="No leave waiting or coming up." actionLabel="Add leave" onAction={() => setAdding({ emp: '' })} /></div>;
  }
  if (tab === 'hist') {
    body = decided.length ? (<>
      <ul className="ix-plist" aria-label="Decisions">
        {decided.map((x) => (
          <li key={x.id}><button type="button" className="ix-pitem" onClick={() => setReview({ kind: 'leave', id: x.id })}>
            <span className="ix-pitem__top"><b>{name(x.emp)}</b><StatusBadge tone={REQ_STATUS[x.status].tone}>{REQ_STATUS[x.status].label}</StatusBadge></span>
            <span className="ix-pitem__mid">{LEAVE_TYPES[x.type].label} · {rangeLabel(x.from, x.to)} · {x.by || '—'}</span>
          </button></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Leave decisions</caption>
          <thead><tr><th scope="col">Employee</th><th scope="col">Leave</th><th scope="col">Dates</th><th scope="col" className="ix-num">Days</th><th scope="col">Decision</th><th scope="col">By</th><th scope="col">On</th></tr></thead>
          <tbody>
            {decided.map((x) => { const e = empBy(D, x.emp) || { id: x.emp, name: x.emp }; return (
              <tr key={x.id} onClick={rowGo(() => setReview({ kind: 'leave', id: x.id }))}>
                <td><Person e={e} sub={e.dept} tab="leave" /></td>
                <td><TypeChip type={x.type} /></td>
                <td>{rangeLabel(x.from, x.to)}{x.from.slice(0, 4) !== year ? ' ' + x.from.slice(0, 4) : ''}</td>
                <td className="ix-num">{leaveDays(x.from, x.to)}</td>
                <td><StatusBadge tone={REQ_STATUS[x.status].tone}>{REQ_STATUS[x.status].label}</StatusBadge></td>
                <td>{x.by || '—'}</td>
                <td className="ix-muted">{x.decidedAt ? dmy(x.decidedAt) : '—'}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>{plural(decided.length, 'decision')}, newest first</span></div>
    </>) : <div className="ix-empty"><EmptyState icon="history" title="No decisions yet." /></div>;
  }
  if (tab === 'cal') {
    const keys = daysOfPeriod(mon);
    const lead = (dowOf(keys[0]) + 1) % 7;   // Saturday first
    body = (<>
      <div className="pp-sub2">
        <span className="pp-step">
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Previous month" onClick={() => setMonth(addPeriod(mon, -1))}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
          <b>{periodLabel(mon)}</b>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Next month" onClick={() => setMonth(addPeriod(mon, 1))}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
        </span>
        <div className="pp-legend">
          {Object.keys(LEAVE_TYPES).map((k) => <span key={k}><i style={{ background: TONE[k][1] }} />{LEAVE_TYPES[k].label}</span>)}
          <span><i style={{ border: '1px dashed var(--text-muted)' }} />Pending</span>
        </div>
      </div>
      <div className="lv-cal">
        {[6, 0, 1, 2, 3, 4, 5].map((d) => <div key={d} className="lv-wd">{WEEKDAYS[d]}</div>)}
        {Array.from({ length: lead }).map((_, i) => <div key={'x' + i} className="lv-day is-out" aria-hidden="true" />)}
        {keys.map((k) => {
          const evs = isWorkday(k) ? D.leave.filter((x) => x.status !== 'no' && x.from <= k && x.to >= k) : [];
          return (
            <div key={k} className={'lv-day' + (!isWorkday(k) ? ' is-off' : '') + (k === today ? ' is-today' : '')}>
              <span title={HOLIDAYS[k] || undefined}>{Number(k.slice(8))}{HOLIDAYS[k] ? ` · ${HOLIDAYS[k]}` : ''}</span>
              {evs.map((x) => { const [bg, fg] = TONE[x.type]; const nm = name(x.emp); return (
                <button key={x.id} type="button" className={'lv-ev' + (x.status === 'wait' ? ' lv-ev--wait' : '')} style={{ background: bg, color: fg }}
                  title={`${nm} · ${LEAVE_TYPES[x.type].label}${x.status === 'wait' ? ' (pending)' : ''}`} onClick={() => setReview({ kind: 'leave', id: x.id })}>{nm.split(' ')[0]}</button>
              ); })}
            </div>
          );
        })}
      </div>
    </>);
  }
  if (tab === 'bal') {
    body = (<>
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table gc-table--keep gc-table--scroll ix-table--static">
          <caption className="sr-only">Leave balances {year}</caption>
          <thead><tr><th scope="col">Employee</th>{Object.entries(LEAVE_TYPES).map(([k, v]) => <th key={k} scope="col">{v.label} · {v.days}</th>)}<th scope="col" className="ix-num">Taken {year}</th></tr></thead>
          <tbody>
            {current(D).map((e) => {
              const b = balanceOf(D, e.id, t);
              return (
                <tr key={e.id}>
                  <td><Person e={e} sub={e.dept} tab="leave" /></td>
                  {Object.keys(LEAVE_TYPES).map((k) => { const v = b[k]; return (
                    <td key={k}><span className="lv-bal">
                      <span className="pp-bar" style={{ width: 96 }}><i style={{ width: `${Math.max(0, v.left) / v.quota * 100}%`, background: TONE[k][1] }} /></span>
                      <span className={'pp-sub pp-fig' + (v.left < 0 ? ' pp-bad' : '')}>{v.left} of {v.quota} left{v.pending ? ` · ${v.pending} asked` : ''}</span>
                    </span></td>
                  ); })}
                  <td className="ix-num ix-strong">{Object.values(b).reduce((a, v) => a + v.taken, 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>Working days left of the yearly allowance <InfoTip text="Counts approved leave from 1 January. Weekends (Friday and Saturday) and public holidays inside a leave are not counted. Unused leave does not carry over." /></span></div>
    </>);
  }

  return (
    <AdminShell active="leave" title="Leave">
      <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="plane" title="Leave"
          about="Who is off and who asked. Open a request to see the balance and how many of the department are in on each day, then approve or deny it with a reason."
          primary={{ label: 'Add leave', icon: 'plus', onClick: () => setAdding({ emp: '' }) }} />
        {!live ? <Skeleton label="Loading leave" /> : (<>
          <MetricStrip label="Who is off" items={[
            { label: 'Off today', value: String(offToday.length), sub: offToday.map((x) => name(x.emp).split(' ')[0]).join(', ') || (isWeekend(today) ? 'weekend' : null), icon: 'plane' },
            { label: 'Off this week', value: String(offWeek.length), sub: rangeLabel(wk, addDays(wk, 6)), icon: 'calendar-days' },
            { label: `Days taken · ${year}`, value: String(takenYear), sub: `across ${plural(current(D).length, 'person', 'people')}`, icon: 'calendar-check' },
          ]} />
          <section className="ix-card" aria-label="Leave">
            <div className="ix-bar"><IndexTabs tabs={tabs} label="Leave views" /></div>
            {body}
          </section>
        </>)}
      </div>
      {live ? <ReviewDrawer D={D} t={t} req={review} onClose={() => setReview(null)} /> : null}
      {live ? <AddLeave D={D} t={t} open={!!adding} emp={adding && adding.emp} onClose={() => setAdding(null)} /> : null}
    </AdminShell>
  );
}
