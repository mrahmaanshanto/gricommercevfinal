'use client';
// HR dashboard — the first screen for the owner or HR (UI/UX audit 2 Oct 2026: show a fact once, summarise before
// listing, details in a drawer). Date and four attendance counters · Needs attention (grouped, top five, View all) ·
// On duty now (one coverage row per place; Shift details drawer; hidden when no shift is scheduled) · Approvals (short
// rows, Review opens HrReview) · Payroll status · the next three dates. History, charts and headcount live on their pages.
// Data: src/lib/hr.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatDate, formatTime } from '@/lib/format';
import { Sheet } from '@/components/ui';
import { fromKey } from '@/lib/settlements';
import {
  todayKey, cellOf, staffBy, leaveType, leaveDaysOf, leaveWarnings, decideLeave, decideFix, t12, dayLabel, WEEKDAYS, dowOf,
  runTotal, runStatusLabel, payDateOf, monthLabel, RUN_STEPS, shiftBy, addDays, HR_PLACES, toMin, coverageOf, isClosedDay,
  punchesOn, profileIssues, loanLeft, gratuityOf, changePct, CHANGE_KINDS, enrolmentOf, hm,
} from '@/lib/hr';
import { HrPage, useHr, Avatar, money, profileHref } from './hrShared';
import { HrReview, reviewRow } from './HrReview';

const CSS = `
.hd-counts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:var(--space-3);align-items:stretch}
.hd-count{display:flex;flex-direction:column;gap:2px;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-decoration:none;color:inherit;min-width:0}
.hd-count:hover{border-color:var(--border-strong)}
.hd-count span{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.hd-count b{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.hd-count small{font-size:var(--text-xs);color:var(--text-muted)}
.hd-counts > a.hr-link{align-self:center;white-space:nowrap}
.hd-main{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,360px);gap:var(--space-5);align-items:start}
.hd-col{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.hd-rows{display:flex;flex-direction:column}
.hd-row{display:flex;align-items:center;gap:var(--space-3);min-height:60px;padding:var(--space-2) var(--space-5);border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;color:inherit;text-decoration:none;width:100%;cursor:pointer}
.hd-row:hover{background:var(--surface-subtle)}
.hd-row__icon{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-lg)}
.hd-row__text{display:flex;flex-direction:column;min-width:0;flex:1}
.hd-row__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-row__text small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-row__go{flex:none;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-link)}
.hd-more{display:block;padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-link);background:none;border-left:0;border-right:0;border-bottom:0;width:100%;text-align:left;cursor:pointer}
.tone-error{background:var(--fill-error-soft);color:var(--text-danger)}
.tone-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.tone-info{background:var(--fill-info-soft);color:var(--text-info)}
.tone-ok{background:var(--fill-success-soft);color:var(--text-success)}
.tone-primary{background:var(--fill-primary-soft);color:var(--primary)}
.hd-box{padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.hd-box h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-big{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
.hd-steps div{display:flex;flex-direction:column;gap:4px;font-size:var(--text-2xs);color:var(--text-muted);min-width:0}
.hd-steps i{height:6px;border-radius:var(--radius-full);background:var(--slate-200)}
.hd-up{display:flex;align-items:center;gap:var(--space-3);text-decoration:none;color:inherit}
.hd-date{flex:none;width:44px;text-align:center;border-radius:var(--radius-lg);background:var(--surface-subtle);padding:4px 0}
.hd-date b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.1}
.hd-date span{font-size:var(--text-2xs);color:var(--text-muted);text-transform:uppercase}
.hd-cov{flex:none;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.hd-people{display:flex;flex-direction:column}
.hd-person{display:flex;align-items:center;gap:var(--space-3);min-height:52px;border-top:1px solid var(--border-subtle);text-decoration:none;color:inherit}
.hd-person:first-child{border-top:0}
.hd-person span{display:flex;flex-direction:column;min-width:0;flex:1}
.hd-person b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hd-person small{font-size:var(--text-xs);color:var(--text-muted)}
.hd-sheet h3{margin:var(--space-2) 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:var(--tracking-wide)}
@media (max-width:1180px){.hd-main{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){.hd-counts{grid-template-columns:repeat(2,minmax(0,1fr))}.hd-counts > a.hr-link{grid-column:1 / -1;justify-self:start}}
@media (max-width:640px){.hd-row{padding:var(--space-2) var(--space-4)}.hd-box{padding:var(--space-4)}.hd-more{padding:var(--space-3) var(--space-4)}}
`;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WORKED = ['P', 'L', 'HD'];

/** Is a shift running at minute `m` of the day? */
const runningAt = (sh, m) => { const a = toMin(sh.start), b = toMin(sh.end); return b > a ? m >= a && m < b : m >= a || m < b; };

export default function HrDashboard() {
  const { S, ready } = useHr();
  const [review, setReview] = useState(null);   // { kind, id } for HrReview
  const [allNeeds, setAllNeeds] = useState(false);
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

  const step = run ? (run.status === 'paid' ? 6 : run.step || 1) : 0;
  const shown = needs.slice(0, 5);
  const needRow = (n, i) => (
    <Link key={i} href={n.href} className="hd-row">
      <span className={'hd-row__icon tone-' + n.tone}><Icon name={n.icon} width="16" height="16" aria-hidden="true" /></span>
      <span className="hd-row__text"><b>{n.t}</b>{n.s ? <small>{n.s}</small> : null}</span>
      <Icon name="chevron-right" width="16" height="16" aria-hidden="true" style={{ color: 'var(--text-muted)', flex: 'none' }} />
    </Link>
  );
  const offWhy = (c) => (c.code === 'S' ? 'Suspended' : c.code === 'W' ? 'Weekly off' : c.code === 'H' ? 'Holiday' : `${leaveType(S, (c.plan.leave || {}).type).name} leave`);

  return (
    <HrPage screen="HrDashboard" active="hr-home" page="HR dashboard" title="HR dashboard" css={CSS}
      description={`${WEEKDAYS[dowOf(today)]}, ${formatDate(fromKey(today))}`}
      actions={<Link href="/staff-create" className="gc-btn gc-btn--solid"><Icon name="user-plus" width="18" height="18" aria-hidden="true" /> Add staff</Link>}>
      <div className="hd-counts" aria-label="Attendance today">
        <Link href="/attendance" className="hd-count"><span>Present</span><b style={{ color: 'var(--text-success)' }}>{present}</b><small>of {expected.length}{late.length ? ` · ${late.length} late` : ''}</small></Link>
        <Link href="/attendance" className="hd-count"><span>Not in yet</span><b>{notIn.length}</b><small>{notIn.length ? 'shift not started or no punch' : 'everyone is in'}</small></Link>
        <Link href="/leave" className="hd-count"><span>On leave</span><b>{onLeave.length}</b><small>today</small></Link>
        <Link href="/attendance" className="hd-count"><span>Absent</span><b style={{ color: absent.length ? 'var(--text-danger)' : undefined }}>{absent.length}</b><small>no leave</small></Link>
        <Link href="/attendance" className="hr-link">View attendance</Link>
      </div>

      <div className="hd-main">
        <div className="hd-col">
          <section className="gc-card hr-card" aria-labelledby="hd-needs">
            <div className="hr-head"><h2 id="hd-needs">Needs attention</h2><span className={'gc-badge gc-badge--' + (needCount ? 'warning' : 'success')}>{needCount}</span></div>
            {shown.length ? <div className="hd-rows">{shown.map(needRow)}</div> : <p className="hr-sub" style={{ margin: 0, padding: '0 var(--space-5) var(--space-5)' }}>Nothing needs you right now.</p>}
            {needs.length > 5 ? <button type="button" className="hd-more" onClick={() => setAllNeeds(true)}>View all {needCount}</button> : null}
          </section>

          {onDuty.length ? (
            <section className="gc-card hr-card" aria-labelledby="hd-duty">
              <div className="hr-head"><h2 id="hd-duty">On duty now</h2><Link href="/shifts" className="hr-link">Shifts & roster</Link></div>
              <div className="hd-rows">
                {onDuty.map((d) => {
                  const short = d.need && d.inside.length < d.need;
                  return (
                    <button key={d.place} type="button" className="hd-row" onClick={() => setShiftOf(d.place)} aria-label={`${d.place}: ${d.inside.length} of ${d.planned.length} in. Shift details`}>
                      <span className={'hd-row__icon ' + (short ? 'tone-warn' : 'tone-ok')}><Icon name="store" width="16" height="16" aria-hidden="true" /></span>
                      <span className="hd-row__text"><b>{d.place}</b><small>{d.shifts.map((sh) => `${sh.name} ${t12(sh.start)}–${t12(sh.end)}`).join(' · ')}</small></span>
                      <span className={'hd-cov ' + (short ? 'hr-warn' : 'hr-in')}>{d.inside.length}/{d.planned.length}{short ? ` · need ${d.need}` : ''}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="gc-card hr-card" aria-labelledby="hd-approvals">
            <div className="hr-head"><h2 id="hd-approvals">Approvals</h2><span className={'gc-badge gc-badge--' + (approvals.length ? 'warning' : 'success')}>{approvals.length}</span></div>
            {approvals.length ? (
              <div className="hd-rows">
                {approvals.map((a) => {
                  const inner = <><span className={'hd-row__icon ' + a.tone}><Icon name={a.icon} width="16" height="16" aria-hidden="true" /></span><span className="hd-row__text"><b>{a.title}</b><small className={a.warn ? 'hr-warn' : ''}>{a.sub}</small></span><span className="hd-row__go">Review</span></>;
                  return a.href ? <Link key={a.id} href={a.href} className="hd-row">{inner}</Link>
                    : <button key={a.id} type="button" className="hd-row" onClick={() => setReview({ kind: a.kind, id: a.id })}>{inner}</button>;
                })}
              </div>
            ) : <p className="hr-sub" style={{ margin: 0, padding: '0 var(--space-5) var(--space-5)' }}>Nothing waiting.</p>}
          </section>
        </div>

        <div className="hd-col">
          {run ? (
            <section className="gc-card hd-box" aria-labelledby="hd-pay">
              <div className="hr-head" style={{ padding: 0 }}><h2 id="hd-pay">{run.title} payroll</h2><span className={'gc-badge gc-badge--' + (run.status === 'paid' ? 'success' : run.status === 'approved' ? 'info' : 'warning')}>{runStatusLabel(run)}</span></div>
              <div><span className="hd-big">{money(total)}</span><span className="hr-sub">{run.status === 'paid' ? `Paid ${formatDate(run.paidAt)}` : `Pay day ${formatDate(payDateOf(run.month, S.settings))}`}</span></div>
              <div className="hd-steps" aria-label={`Step ${step} of ${RUN_STEPS.length}`}>{RUN_STEPS.map(([l], i) => <div key={l}><i style={{ background: i + 1 < step ? 'var(--fill-success)' : i + 1 === step ? 'var(--fill-warning)' : undefined }} />{l.split(' ')[0]}</div>)}</div>
              <Link href="/payroll" className="gc-btn gc-btn--neutral gc-btn--block">{run.status === 'approved' ? 'Pay salaries' : run.status === 'paid' ? 'Payslips' : 'Review salary sheet'}</Link>
            </section>
          ) : null}

          <section className="gc-card hd-box" aria-labelledby="hd-up">
            <h2 id="hd-up">Coming up</h2>
            {upcoming.length ? upcoming.map(([k, icon, t, sub, href]) => {
              const d = new Date(fromKey(k));
              const body = <><span className="hd-date"><b>{d.getDate()}</b><span>{MON[d.getMonth()]}</span></span><span style={{ minWidth: 0 }}><span className="hr-strong" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={icon} width="14" height="14" aria-hidden="true" />{t}</span><span className="hr-sub">{sub}</span></span></>;
              return href ? <Link key={k + t} href={href} className="hd-up">{body}</Link> : <div key={k + t} className="hd-up">{body}</div>;
            }) : <p className="hr-sub" style={{ margin: 0 }}>Nothing in the next 30 days.</p>}
          </section>
        </div>
      </div>

      <Sheet open={allNeeds} title={`Needs attention · ${needCount}`} onClose={() => setAllNeeds(false)}>
        <div className="hd-rows" style={{ margin: '0 calc(var(--space-5) * -1)' }}>{needs.map(needRow)}</div>
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
