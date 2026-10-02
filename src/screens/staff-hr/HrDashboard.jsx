'use client';
// HR dashboard — the first screen for the owner or HR, laid out like Home (docs/shopify-style.md): the day's key
// figures (attendance today and the open payroll), what needs you as short pills (top five, grouped; View all opens
// the full list), then the work: approvals (Review opens HrReview), who is on duty per place (Shift details drawer)
// and the next three dates. History, charts and headcount live on their pages. Data: src/lib/hr.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { formatDate, formatTime } from '@/lib/format';
import { Sheet } from '@/components/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { fromKey } from '@/lib/settlements';
import {
  todayKey, cellOf, staffBy, leaveType, t12, WEEKDAYS, dowOf, runTotal, runStatusLabel, payDateOf, shiftBy, addDays, HR_PLACES, toMin,
  coverageOf, isClosedDay, profileIssues, changePct, CHANGE_KINDS, enrolmentOf,
} from '@/lib/hr';
import { HrPage, useHr, Avatar, money, profileHref } from './hrShared';
import { HrReview, reviewRow } from './HrReview';

const CSS = `
.hd-todo{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.hd-todo a,.hd-todo button{display:inline-flex;align-items:center;gap:var(--space-2);height:32px;padding:0 5px 0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;white-space:nowrap;cursor:pointer;transition:var(--transition-colors)}
.hd-todo a:not(:has(b)),.hd-todo button:not(:has(b)){padding-right:12px}
.hd-todo a:hover,.hd-todo button:hover{border-color:var(--primary);color:var(--primary)}
.hd-todo a>span{max-width:340px;overflow:hidden;text-overflow:ellipsis}
.hd-todo i{width:6px;height:6px;flex:none;border-radius:var(--radius-full);background:var(--text-warning)}
.hd-todo .is-error i{background:var(--text-danger)}
.hd-todo .is-info i{background:var(--text-info)}
.hd-todo b{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-done{display:inline-flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);color:var(--text-success)}
.hd-cards{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.hd-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.hd-rows{display:flex;flex-direction:column}
.hd-row{display:flex;align-items:center;gap:var(--space-3);width:100%;min-height:44px;padding:6px var(--space-4);border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;color:inherit;text-decoration:none;cursor:pointer}
.hd-rows>.hd-row:first-child{border-top:0}
.hd-row:hover{background:var(--surface-subtle)}
.hd-row__text{display:flex;flex-direction:column;flex:1;min-width:0}
.hd-row__text b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.hd-row__text small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.hd-row__go{flex:none;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-link)}
.hd-cov{flex:none;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.hd-up{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px var(--space-4);border-top:1px solid var(--border-subtle);text-decoration:none;color:inherit}
.hd-rows>.hd-up:first-child{border-top:0}
a.hd-up:hover{background:var(--surface-subtle)}
.hd-date{flex:none;width:36px;padding:2px 0;border-radius:var(--radius-md);background:var(--surface-subtle);text-align:center}
.hd-date b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);line-height:1.2;color:var(--text-heading)}
.hd-date span{font-size:var(--text-2xs);color:var(--text-muted)}
.hd-people{display:flex;flex-direction:column}
.hd-person{display:flex;align-items:center;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle);text-decoration:none;color:inherit}
.hd-person:first-child{border-top:0}
.hd-person span{display:flex;flex-direction:column;flex:1;min-width:0}
.hd-person b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hd-person small{font-size:var(--text-xs);color:var(--text-muted)}
.hd-sheet h3{margin:var(--space-3) 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
@media (max-width:1023px){.hd-cards{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.hd-todo a>span{max-width:240px}}
`;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WORKED = ['P', 'L', 'HD'];

/** Is a shift running at minute `m` of the day? */
const runningAt = (sh, m) => { const a = toMin(sh.start), b = toMin(sh.end); return b > a ? m >= a && m < b : m >= a || m < b; };

export default function HrDashboard() {
  const { S, ready } = useHr();
  const [review, setReview] = useState(null);   // { kind, id } for HrReview
  const [allNeeds, setAllNeeds] = useState(false);
  const [allApprovals, setAllApprovals] = useState(false);
  const [shiftOf, setShiftOf] = useState(null);  // place in the Shift details drawer
  const today = todayKey(S);
  const nowMin = new Date(S.now).getHours() * 60 + new Date(S.now).getMinutes();
  const staff = S.staff.filter((s) => s.status !== 'left');
  const cells = staff.map((st) => ({ st, c: cellOf(S, st.code, today) }));
  const group = (codes) => cells.filter((x) => codes.includes(x.c.code));
  const inNow = group(['P', 'HD']), late = group(['L']), onLeave = group(['V', 'U']), absent = group(['A']);
  const notIn = group(['wait', '?']);
  const expected = cells.filter((x) => [...WORKED, 'A', 'wait', '?'].includes(x.c.code));
  const present = inNow.length + late.length;

  const run = [...S.runs].filter((r) => r.status !== 'paid').sort((a, b) => a.month.localeCompare(b.month))[0] || [...S.runs].sort((a, b) => b.month.localeCompare(a.month))[0];
  const total = run ? runTotal(S, run) : 0;
  void ready;

  // ---- needs attention: one row per problem, similar ones grouped ----------------------------------------
  const last30 = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(today, i - 30)), [today]);
  const needs = useMemo(() => {
    const out = [];
    notIn.forEach(({ st, c }) => {
      const sh = shiftBy(S, c.plan.shifts[0]);
      if (!sh || !runningAt(sh, nowMin)) return;
      const since = (nowMin - toMin(sh.start) + 1440) % 1440;
      if (since > (sh.graceMin || 10) + 30) out.push({ tone: 'error', icon: 'user-x', t: `${st.name} is not in`, s: `${sh.name} started ${t12(sh.start)} · no leave, no punch`, href: profileHref(st.code, 'attendance'), g: 'notin', gl: 'people not in', gh: '/attendance' });
    });
    absent.forEach(({ st }) => out.push({ tone: 'error', icon: 'user-x', t: `${st.name} is absent`, s: 'No leave today', href: profileHref(st.code, 'attendance'), g: 'absent', gl: 'absent without leave', gh: '/attendance' }));
    (S.devices || []).filter((d) => d.status !== 'online').forEach((d) => out.push({ tone: 'error', icon: 'wifi-off', t: `${d.name} is offline`, s: `Since ${formatDate(d.lastSync)} ${formatTime(d.lastSync)}`, href: '/attendance-devices', g: 'device', gl: 'machines offline', gh: '/attendance-devices' }));
    if (!isClosedDay(S, today)) {
      // a shift nobody is rostered for (weekly off) is not short — it is not scheduled
      coverageOf(S, today).filter((r) => r.n > 0 && runningAt(r.shift, nowMin)).forEach((r) => {
        const inside = staff.filter((st) => st.branch === r.place && WORKED.includes(cellOf(S, st.code, today).code) && cellOf(S, st.code, today).plan.shifts.includes(r.shift.id)).length;
        if (r.min && inside < r.min) out.push({ tone: 'warn', icon: 'users', t: `${r.place} is short`, s: `${r.shift.name} · ${inside} of ${r.min} in`, href: '/shifts' });
      });
    }
    const yest = addDays(today, -1);
    Object.entries(S.att[yest] || {}).forEach(([code, rec]) => { const st = staffBy(S, code); const sh = st && shiftBy(S, st.shift); if (st && rec.in && !rec.out && sh && toMin(sh.end) > toMin(sh.start)) out.push({ tone: 'warn', icon: 'log-out', t: `${st.name} did not punch out`, s: `Yesterday · in at ${t12(rec.in)}`, href: profileHref(code, 'attendance'), g: 'punchout', gl: 'missing punch-outs', gh: '/attendance' }); });
    staff.forEach((st) => {
      const lates = last30.filter((k) => cellOf(S, st.code, k).code === 'L').length;
      if (lates >= (S.settings.latesPerCut || 3)) out.push({ tone: 'warn', icon: 'alarm-clock', t: `${st.name} late ${lates} times`, s: 'Last 30 days', href: profileHref(st.code, 'attendance'), g: 'lates', gl: 'people late often', gh: '/attendance' });
      profileIssues(S, st).filter((x) => x.tone === 'error' || /Probation|Contract/.test(x.text)).forEach((x) => out.push({ tone: x.tone === 'error' ? 'error' : 'warn', icon: /Probation/.test(x.text) ? 'user-check' : /Contract/.test(x.text) ? 'file-signature' : 'landmark', t: `${st.name} · ${x.text}`, s: st.designation || '', href: profileHref(st.code, x.tab), g: 'pi:' + x.text, gl: x.text.toLowerCase(), gh: '/all-staff' }));
    });
    const notEnrolled = staff.filter((st) => { const en = enrolmentOf(S, st); return en.device && !en.ok && ['Fingerprint', 'Face', undefined].includes(st.checkIn); });
    if (notEnrolled.length) out.push({ tone: 'info', icon: 'fingerprint', t: `${notEnrolled.length} not enrolled on a machine`, s: notEnrolled.map((x) => x.name).join(', '), href: '/attendance-devices' });
    if (run && run.status === 'approved' && payDateOf(run.month, S.settings) <= S.now + 864e5) out.push({ tone: 'info', icon: 'banknote', t: `Salaries due ${payDateOf(run.month, S.settings) <= S.now ? 'today' : 'tomorrow'}`, s: `${money(total)} approved, not paid`, href: '/payroll' });
    // group: two or more of a kind become one row
    const grouped = [];
    out.forEach((n) => {
      if (!n.g) { grouped.push(n); return; }
      const same = out.filter((x) => x.g === n.g);
      if (same.length < 2) { grouped.push(n); return; }
      if (same[0] !== n) return;
      const names = same.map((x) => x.t.split(/ (is|did|late|·)/)[0]);
      grouped.push({ ...n, t: `${same.length} ${n.gl}`, s: names.slice(0, 3).join(', ') + (names.length > 3 ? ` and ${names.length - 3} more` : ''), href: n.gh || n.href, n: same.length });
    });
    const rank = { error: 0, warn: 1, info: 2 };
    return grouped.sort((a, b) => rank[a.tone] - rank[b.tone]);
  }, [S, notIn, absent, staff, today, nowMin, last30, run, total]);
  const needCount = needs.reduce((a, n) => a + (n.n || 1), 0);

  // ---- on duty now: one coverage row per place with a shift running ------------------------------------------
  const duty = HR_PLACES.map((place) => {
    const here = cells.filter(({ st }) => st.branch === place);
    if (!here.length) return null;
    const shifts = S.shifts.filter((sh) => (sh.places || []).includes(place) && runningAt(sh, nowMin));
    const planned = here.filter(({ c }) => c.plan.kind === 'work' && c.plan.shifts.some((id) => shifts.some((sh) => sh.id === id)));
    const inside = planned.filter(({ c }) => WORKED.includes(c.code));
    const need = planned.length ? shifts.reduce((a, sh) => a + (sh.minStaff || 0), 0) : 0;
    return { place, shifts, planned, inside, need, off: here.filter(({ c }) => ['V', 'U', 'W', 'H', 'S'].includes(c.code)) };
  }).filter(Boolean);
  const onDuty = duty.filter((d) => d.planned.length);
  const shiftPlace = shiftOf ? duty.find((d) => d.place === shiftOf) : null;

  // ---- approvals: short rows, Review opens the drawer ------------------------------------------------------------
  const approvals = useMemo(() => {
    const out = [];
    S.leave.requests.filter((r) => r.status === 'wait').forEach((r) => out.push({ id: r.id, kind: 'leave', icon: 'plane', tone: 'tone-info', ...reviewRow(S, 'leave', r) }));
    S.loans.filter((l) => l.status === 'req').forEach((l) => out.push({ id: l.id, kind: 'loan', icon: 'hand-coins', tone: 'tone-warn', ...reviewRow(S, 'loan', l) }));
    S.fixes.filter((f) => f.status === 'wait').forEach((f) => out.push({ id: f.id, kind: 'fix', icon: 'fingerprint', tone: 'tone-ok', ...reviewRow(S, 'fix', f) }));
    if (run && run.status === 'draft' && run.step === 3) out.push({ id: run.id, kind: 'payroll', icon: 'banknote', tone: 'tone-primary', title: `${run.title} payroll`, sub: `${money(total)} · waiting for you`, href: '/payroll' });
    return out;
  }, [S, run, total]);

  // ---- the next three dates that need doing something ------------------------------------------------------------
  const upcoming = useMemo(() => {
    const end = addDays(today, 30), out = [];
    staff.forEach((st) => {
      if (st.status === 'probation' && st.probationEnd) out.push([st.probationEnd < today ? today : st.probationEnd, 'user-check', `Probation ${st.probationEnd < today ? 'ended' : 'ends'} · ${st.name}`, 'Confirm or extend', '/pay-changes']);
      if (st.contractEnd) out.push([st.contractEnd, 'file-signature', `Contract ends · ${st.name}`, 'Renew or end it', profileHref(st.code, 'job')]);
    });
    (S.changes || []).filter((c) => c.status === 'planned').forEach((c) => { const st = staffBy(S, c.code); const p = changePct(c); out.push([`${c.effective}-01`, CHANGE_KINDS[c.kind][1], `${CHANGE_KINDS[c.kind][0]} · ${st ? st.name : c.code}`, p != null ? `${p > 0 ? '+' : ''}${p}%` : 'Planned', '/pay-changes']); });
    S.runs.filter((r) => r.status === 'approved').forEach((r) => out.push([todayKey({ now: payDateOf(r.month, S.settings) }), 'banknote', 'Pay day', `${r.title} · ${money(runTotal(S, r))}`, '/payroll']));
    S.holidays.forEach(([k, n]) => out.push([k, 'calendar-heart', n, 'Public holiday']));
    return out.filter(([k]) => k >= today && k <= end).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 3);
  }, [S, staff, today]);

  const shown = needs.slice(0, 5);
  const needRow = (n, i) => (
    <Link key={i} href={n.href} className="hd-row">
      <span className="hd-row__text"><b className={n.tone === 'error' ? 'hr-out' : ''}>{n.t}</b>{n.s ? <small>{n.s}</small> : null}</span>
      <Icon name="chevron-right" width="16" height="16" aria-hidden="true" style={{ color: 'var(--text-muted)', flex: 'none' }} />
    </Link>
  );
  // a pill: grouped problems carry their count ("Missing punch-outs 3"); a single one reads as it is
  const pill = (n, i) => {
    const label = n.n ? n.gl.charAt(0).toUpperCase() + n.gl.slice(1) : n.t;
    return <Link key={i} href={n.href} className={'is-' + n.tone} title={n.s || undefined}><i aria-hidden="true" /><span>{label}</span>{n.n ? <b>{n.n}</b> : null}</Link>;
  };
  const approvalRow = (a) => {
    const inner = <><span className="hd-row__text"><b>{a.title}</b><small className={a.warn ? 'hr-warn' : ''}>{a.sub}</small></span><span className="hd-row__go">Review</span></>;
    return a.href ? <Link key={a.id} href={a.href} className="hd-row">{inner}</Link>
      : <button key={a.id} type="button" className="hd-row" onClick={() => { setAllApprovals(false); setReview({ kind: a.kind, id: a.id }); }}>{inner}</button>;
  };
  const offWhy = (c) => (c.code === 'S' ? 'Suspended' : c.code === 'W' ? 'Weekly off' : c.code === 'H' ? 'Holiday' : `${leaveType(S, (c.plan.leave || {}).type).name} leave`);
  const runStatus = run ? runStatusLabel(run) : '';

  return (
    <HrPage screen="HrDashboard" active="hr-home" page="HR dashboard" title="HR dashboard" css={CSS} narrow
      meta={`${WEEKDAYS[dowOf(today)]}, ${formatDate(fromKey(today))}`}
      about="Today at a glance: who is in, what needs you, requests to decide and the next dates. Tap a figure or a task to open its page."
      more={[{ label: 'Attendance', href: '/attendance' }, { label: 'Shifts & roster', href: '/shifts' }, { label: 'Leave', href: '/leave' }, { label: 'Payroll', href: '/payroll' }]}
      primary={{ label: 'Add staff', href: '/staff-create' }}>
      <MetricStrip label="Attendance today" items={[
        { label: 'Present', value: String(present), sub: `of ${expected.length}${late.length ? ` · ${late.length} late` : ''}`, href: '/attendance' },
        { label: 'Not in yet', value: String(notIn.length), href: '/attendance' },
        { label: 'On leave', value: String(onLeave.length), href: '/leave?tab=cal' },
        { label: 'Absent', value: String(absent.length), sub: absent.length ? 'no leave' : null, href: '/attendance' },
        run ? { label: `${run.title} payroll`, value: money(total), sub: runStatus, href: '/payroll' } : null,
      ]} />

      <section aria-label="Needs attention">
        {shown.length ? (
          <nav className="hd-todo" aria-label="Needs attention">
            {shown.map(pill)}
            {needs.length > 5 ? <button type="button" onClick={() => setAllNeeds(true)}>View all<b>{needCount}</b></button> : null}
          </nav>
        ) : <p className="hd-done"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />Nothing needs you right now.</p>}
      </section>

      <div className="hd-cards">
        <div className="hd-col">
          <section className="ix-card" aria-labelledby="hd-approvals">
            <header className="ix-card__head"><h2 id="hd-approvals">Approvals</h2>{approvals.length > 5 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAllApprovals(true)}>View all</button> : null}</header>
            {approvals.length ? <div className="hd-rows" style={{ paddingTop: 'var(--space-2)' }}>{approvals.slice(0, 5).map(approvalRow)}</div> : <p className="hr-empty">Nothing waiting.</p>}
          </section>
        </div>

        <div className="hd-col">
          {onDuty.length ? (
            <section className="ix-card" aria-labelledby="hd-duty">
              <header className="ix-card__head"><h2 id="hd-duty">On duty now</h2><Link href="/shifts">Roster</Link></header>
              <div className="hd-rows" style={{ paddingTop: 'var(--space-2)' }}>
                {onDuty.map((d) => {
                  const short = d.need && d.inside.length < d.need;
                  return (
                    <button key={d.place} type="button" className="hd-row" onClick={() => setShiftOf(d.place)} aria-label={`${d.place}: ${d.inside.length} of ${d.planned.length} in. Shift details`}>
                      <span className="hd-row__text"><b>{d.place}</b><small>{d.shifts.map((sh) => `${sh.name} ${t12(sh.start)}–${t12(sh.end)}`).join(' · ')}</small></span>
                      <span className={'hd-cov ' + (short ? 'hr-warn' : 'hr-in')}>{d.inside.length}/{d.planned.length}{short ? ` · need ${d.need}` : ''}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="ix-card" aria-labelledby="hd-up">
            <header className="ix-card__head"><h2 id="hd-up">Coming up</h2></header>
            {upcoming.length ? (
              <div className="hd-rows" style={{ paddingTop: 'var(--space-2)' }}>
                {upcoming.map(([k, , t, sub, href]) => {
                  const d = new Date(fromKey(k));
                  const body = <><span className="hd-date"><b>{d.getDate()}</b><span>{MON[d.getMonth()]}</span></span><span className="hd-row__text"><b>{t}</b><small>{sub}</small></span></>;
                  return href ? <Link key={k + t} href={href} className="hd-up">{body}</Link> : <div key={k + t} className="hd-up">{body}</div>;
                })}
              </div>
            ) : <p className="hr-empty">Nothing in the next 30 days.</p>}
          </section>
        </div>
      </div>

      <Sheet open={allNeeds} title={`Needs attention · ${needCount}`} onClose={() => setAllNeeds(false)}>
        <div className="hd-rows" style={{ margin: '0 calc(var(--space-5) * -1)' }}>{needs.map(needRow)}</div>
      </Sheet>

      <Sheet open={allApprovals} title={`Approvals · ${approvals.length}`} onClose={() => setAllApprovals(false)}>
        <div className="hd-rows" style={{ margin: '0 calc(var(--space-5) * -1)' }}>{approvals.map(approvalRow)}</div>
      </Sheet>

      <Sheet open={!!shiftPlace} title={shiftPlace ? `Shift details · ${shiftPlace.place}` : ''} onClose={() => setShiftOf(null)}>
        {shiftPlace ? (
          <div className="hd-sheet">
            <p className="hr-sub" style={{ margin: 0 }}>{shiftPlace.shifts.map((sh) => `${sh.name} ${t12(sh.start)}–${t12(sh.end)}`).join(' · ')}{shiftPlace.need ? ` · needs ${shiftPlace.need}` : ''}</p>
            <h3>On the roster · {shiftPlace.inside.length} of {shiftPlace.planned.length} in</h3>
            <div className="hd-people">
              {shiftPlace.planned.map(({ st, c }) => (
                <Link key={st.code} href={profileHref(st.code, 'attendance')} className="hd-person"><Avatar st={st} /><span><b>{st.name}</b><small className={c.code === 'L' ? 'hr-warn' : WORKED.includes(c.code) ? 'hr-in' : c.code === 'A' ? 'hr-out' : ''}>{c.code === 'L' ? `Late · in ${t12(c.rec.in)}` : WORKED.includes(c.code) ? `In ${t12(c.rec.in)}` : c.code === 'A' ? 'Absent' : 'Not in yet'}</small></span></Link>
              ))}
            </div>
            {shiftPlace.off.length ? (<>
              <h3>Off today</h3>
              <div className="hd-people">{shiftPlace.off.map(({ st, c }) => <div key={st.code} className="hd-person"><Avatar st={st} /><span><b>{st.name}</b><small>{offWhy(c)}</small></span></div>)}</div>
            </>) : null}
          </div>
        ) : null}
      </Sheet>

      <HrReview S={S} req={review} onClose={() => setReview(null)} />
    </HrPage>
  );
}
