'use client';
// HR dashboard — the day for the owner or manager, from src/lib/hr.js:
//   hero: who is in, late, on leave, absent, not in yet · today needs (missing people, short cover, machines offline,
//   repeated lates, missing bank details, probation / contracts) · on duty now by place · live punches ·
//   approvals (leave, advances, attendance fixes, payroll) · last 14 days of attendance · payroll and staff cost ·
//   money (loans, gratuity) · headcount and openings · coming up (birthdays, anniversaries, pay day, increments, holidays).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatDate, formatTime, toBnDigits } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { salesByChannel } from '@/lib/salesBook';
import {
  todayKey, cellOf, staffBy, leaveType, leaveDaysOf, leaveWarnings, decideLeave, decideFix, t12, dayLabel, WEEKDAYS, dowOf,
  runTotal, runStatusLabel, payDateOf, monthLabel, RUN_STEPS, shiftBy, addDays, HR_PLACES, toMin, coverageOf, isClosedDay,
  punchesOn, profileIssues, loanLeft, gratuityOf, changePct, CHANGE_KINDS, enrolmentOf, hm,
} from '@/lib/hr';
import { HrPage, useHr, Avatar, money, profileHref } from './hrShared';

const CSS = `
.hd-hero{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-5) var(--space-6);padding:var(--space-5) var(--space-6);border-radius:var(--radius-xl);background:var(--brand-navy-deep, var(--primary));color:var(--text-inverse)}
.hd-hero__text{flex:1 1 340px;min-width:0;display:flex;flex-direction:column;gap:6px}
.hd-hero__text > p{margin:0;font-size:var(--text-sm);color:var(--text-on-dark-muted)}
.hd-hero h2{margin:0;font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-inverse)}
.hd-hero__links{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-2)}
.hd-hero__links a{background:rgba(255,255,255,.12);color:var(--text-inverse);border-color:rgba(255,255,255,.2)}
.hd-hero__links a:hover{background:rgba(255,255,255,.2)}
.hd-nums{display:grid;grid-template-columns:repeat(5,minmax(68px,1fr));gap:var(--space-2)}
.hd-nums > a{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:rgba(255,255,255,.08);text-decoration:none;color:inherit}
.hd-nums > a:hover{background:rgba(255,255,255,.14)}
.hd-nums b{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);line-height:1.1}
.hd-nums span{font-size:var(--text-xs);color:var(--text-on-dark-muted)}
.hd-rate{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-on-dark-muted)}
.hd-rate i{display:block;flex:1;height:6px;max-width:240px;border-radius:var(--radius-full);background:rgba(255,255,255,.18);overflow:hidden}
.hd-rate i b{display:block;height:100%;background:var(--text-inverse)}
.hd-main{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,380px);gap:var(--space-5);align-items:start}
.hd-col{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.hd-needs{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));gap:var(--space-2);padding:0 var(--space-5) var(--space-5)}
.hd-need{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);text-decoration:none;font-size:var(--text-sm);line-height:1.45}
.hd-need b{display:block;font-weight:var(--weight-semibold)}
.hd-need span{display:block;font-size:var(--text-xs);opacity:.9}
.hd-need svg{flex:none;margin-top:2px}
.hd-need--error{background:var(--fill-error-soft);color:var(--text-danger)}
.hd-need--warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.hd-need--info{background:var(--fill-info-soft);color:var(--text-info)}
.hd-need:hover{filter:brightness(.97)}
.hd-duty{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));gap:var(--space-3);padding:0 var(--space-5) var(--space-5)}
.hd-place{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.hd-place > header{display:flex;justify-content:space-between;align-items:baseline;gap:var(--space-2)}
.hd-place > header b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-place .gc-progress{height:6px}
.hd-faces{display:flex;flex-wrap:wrap;gap:4px}
.hd-faces a{line-height:0;border-radius:var(--radius-full)}
.hd-faces .hr-av{width:28px;height:28px;font-size:var(--text-2xs)}
.hd-faces .is-out .hr-av{opacity:.35}
.hd-who{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3);padding:0 var(--space-5) var(--space-5)}
.hd-who__col{display:flex;flex-direction:column;gap:var(--space-2);min-width:0}
.hd-who__head{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.hd-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full)}
.hd-person{display:flex;align-items:center;gap:var(--space-2);min-width:0;text-decoration:none}
.hd-person b{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-person .hr-av{width:30px;height:30px}
.hd-list{display:flex;flex-direction:column;gap:var(--space-2);padding:0 var(--space-5) var(--space-5)}
.hd-item{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.hd-tag{flex:none;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:var(--radius-lg)}
.hd-item__text{flex:1 1 200px;min-width:0}
.hd-item__text b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hd-log{display:flex;flex-direction:column;padding:0 var(--space-5) var(--space-4)}
.hd-log > div{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.hd-log > div:last-child{border-bottom:0}
.hd-log time{width:64px;flex:none;font-family:var(--font-data);color:var(--text-heading)}
.hd-box{padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.hd-box h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-big{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
.hd-steps div{display:flex;flex-direction:column;gap:4px;font-size:var(--text-2xs);color:var(--text-muted);min-width:0}
.hd-steps i{height:6px;border-radius:var(--radius-full);background:var(--slate-200)}
.hd-kv{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm)}
.hd-kv > span:first-child{color:var(--text-muted)}
.hd-bar{display:grid;grid-template-columns:minmax(0,1fr) 90px 24px;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.hd-track{height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.hd-track i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.hd-trend{display:flex;align-items:flex-end;gap:4px;height:96px}
.hd-trend > div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;min-width:0;height:100%}
.hd-trend i{display:block;width:100%;max-width:22px;border-radius:var(--radius-sm, 3px) var(--radius-sm, 3px) 0 0;background:var(--primary)}
.hd-trend i.is-low{background:var(--warning)}
.hd-trend i.is-off{background:var(--surface-subtle)}
.hd-trend small{font-size:var(--text-2xs);color:var(--text-muted);font-family:var(--font-data)}
.hd-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.hd-stat{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.hd-stat b{display:block;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-stat span{font-size:var(--text-xs);color:var(--text-muted)}
.hd-up{display:flex;align-items:center;gap:var(--space-3)}
.hd-date{flex:none;width:44px;text-align:center;border-radius:var(--radius-lg);background:var(--surface-subtle);padding:4px 0}
.hd-date b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.1}
.hd-date span{font-size:var(--text-2xs);color:var(--text-muted);text-transform:uppercase}
@media (max-width:1180px){.hd-main{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){.hd-who{grid-template-columns:repeat(2,minmax(0,1fr))}.hd-nums{grid-template-columns:repeat(3,minmax(64px,1fr))}.hd-hero{padding:var(--space-4)}}
`;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WORKED = ['P', 'L', 'HD'];

/** Is a shift running at minute `m` of the day? */
const runningAt = (sh, m) => { const a = toMin(sh.start), b = toMin(sh.end); return b > a ? m >= a && m < b : m >= a || m < b; };

export default function HrDashboard() {
  const { S, ready } = useHr();
  const today = todayKey(S);
  const nowMin = new Date(S.now).getHours() * 60 + new Date(S.now).getMinutes();
  const staff = S.staff.filter((s) => s.status !== 'left');
  const cells = staff.map((st) => ({ st, c: cellOf(S, st.code, today) }));
  const group = (codes) => cells.filter((x) => codes.includes(x.c.code));
  const inNow = group(['P', 'HD']), late = group(['L']), onLeave = group(['V', 'U']), absent = group(['A']);
  const notIn = group(['wait', '?']);
  const expected = cells.filter((x) => [...WORKED, 'A', 'wait', '?'].includes(x.c.code));
  const present = inNow.length + late.length;
  const rate = expected.length ? Math.round((present / expected.length) * 100) : 0;

  const run = [...S.runs].filter((r) => r.status !== 'paid').sort((a, b) => a.month.localeCompare(b.month))[0] || [...S.runs].sort((a, b) => b.month.localeCompare(a.month))[0];
  const prev = run ? [...S.runs].filter((r) => r.kind === 'salary' && r.status === 'paid' && r.month < run.month).sort((a, b) => b.month.localeCompare(a.month))[0] : null;
  const total = run ? runTotal(S, run) : 0;
  const [sales, setSales] = useState(null);
  useEffect(() => { if (!ready || !run) return; const [y, m] = run.month.split('-').map(Number); const s = salesByChannel(new Date(y, m - 1, 1).getTime(), new Date(y, m, 1).getTime()); setSales(s.all.revenue); }, [ready, run]);

  // ---- today needs ------------------------------------------------------------------------------
  const last30 = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(today, i - 30)), [today]);
  const needs = useMemo(() => {
    const out = [];
    notIn.forEach(({ st, c }) => {
      const sh = shiftBy(S, c.plan.shifts[0]);
      if (!sh || !runningAt(sh, nowMin)) return;
      const since = (nowMin - toMin(sh.start) + 1440) % 1440;
      if (since > (sh.graceMin || 10) + 30) out.push({ tone: 'error', icon: 'user-x', t: `${st.name} is not in`, s: `${sh.name} started ${t12(sh.start)} (${hm(since)} ago) · no leave, no punch — call ${st.phone}`, href: profileHref(st.code, 'attendance') });
    });
    absent.forEach(({ st }) => out.push({ tone: 'error', icon: 'user-x', t: `${st.name} is absent`, s: 'Marked absent today without leave', href: profileHref(st.code, 'attendance') }));
    (S.devices || []).filter((d) => d.status !== 'online').forEach((d) => out.push({ tone: 'error', icon: 'wifi-off', t: `${d.name} is offline`, s: `No reply since ${formatDate(d.lastSync)} ${formatTime(d.lastSync)} — punches at ${d.place} are not coming in`, href: '/attendance-devices' }));
    if (!isClosedDay(S, today)) {
      coverageOf(S, today).filter((r) => runningAt(r.shift, nowMin)).forEach((r) => {
        const inside = staff.filter((st) => st.branch === r.place && WORKED.includes(cellOf(S, st.code, today).code) && cellOf(S, st.code, today).plan.shifts.includes(r.shift.id)).length;
        if (r.min && inside < r.min) out.push({ tone: 'warn', icon: 'users', t: `${r.place} is short`, s: `${r.shift.name}: ${inside} in of the ${r.min} needed${r.n > inside ? ` (${r.n - inside} planned not in)` : ''}`, href: '/shifts' });
      });
    }
    const yest = addDays(today, -1);
    Object.entries(S.att[yest] || {}).forEach(([code, rec]) => { const st = staffBy(S, code); const sh = st && shiftBy(S, st.shift); if (st && rec.in && !rec.out && sh && toMin(sh.end) > toMin(sh.start)) out.push({ tone: 'warn', icon: 'log-out', t: `${st.name} did not punch out yesterday`, s: `In at ${t12(rec.in)} · fix the out time or overtime is lost`, href: profileHref(code, 'attendance') }); });
    staff.forEach((st) => {
      const lates = last30.filter((k) => cellOf(S, st.code, k).code === 'L').length;
      if (lates >= (S.settings.latesPerCut || 3)) out.push({ tone: 'warn', icon: 'alarm-clock', t: `${st.name} was late ${lates} times`, s: `In the last 30 days · every ${S.settings.latesPerCut} lates cut a day’s pay`, href: profileHref(st.code, 'attendance') });
      profileIssues(S, st).filter((x) => x.tone === 'error' || /Probation|Contract/.test(x.text)).forEach((x) => out.push({ tone: x.tone === 'error' ? 'error' : 'warn', icon: /Probation/.test(x.text) ? 'user-check' : /Contract/.test(x.text) ? 'file-signature' : 'landmark', t: st.name, s: x.text, href: profileHref(st.code, x.tab) }));
    });
    const notEnrolled = staff.filter((st) => { const en = enrolmentOf(S, st); return en.device && !en.ok && ['Fingerprint', 'Face', undefined].includes(st.checkIn); });
    if (notEnrolled.length) out.push({ tone: 'info', icon: 'fingerprint', t: `${notEnrolled.length} not enrolled on a machine`, s: notEnrolled.map((s) => s.name).join(', '), href: '/attendance-devices' });
    if (run && run.status === 'approved' && payDateOf(run.month, S.settings) <= S.now + 864e5) out.push({ tone: 'info', icon: 'banknote', t: `${run.title} salaries are due ${payDateOf(run.month, S.settings) <= S.now ? 'today' : 'tomorrow'}`, s: `${money(total)} approved, not paid yet`, href: '/payroll' });
    return out;
  }, [S, notIn, absent, staff, today, nowMin, last30, run, total]);

  // ---- on duty now ------------------------------------------------------------------------------
  const duty = HR_PLACES.map((place) => {
    const here = cells.filter(({ st }) => st.branch === place);
    if (!here.length) return null;
    const shifts = S.shifts.filter((sh) => (sh.places || []).includes(place) && runningAt(sh, nowMin));
    const planned = here.filter(({ c }) => c.plan.kind === 'work' && c.plan.shifts.some((id) => shifts.some((sh) => sh.id === id)));
    const inside = planned.filter(({ c }) => WORKED.includes(c.code));
    const need = shifts.reduce((a, sh) => a + (sh.minStaff || 0), 0);
    const next = S.shifts.filter((sh) => (sh.places || []).includes(place) && toMin(sh.start) > nowMin).sort((a, b) => toMin(a.start) - toMin(b.start))[0];
    return { place, shifts, planned, inside, need, next, off: here.filter(({ c }) => ['V', 'U', 'W', 'H', 'S'].includes(c.code)) };
  }).filter(Boolean);

  // ---- approvals -----------------------------------------------------------------------------------
  const approvals = useMemo(() => {
    const out = [];
    S.leave.requests.filter((r) => r.status === 'wait').forEach((r) => {
      const st = staffBy(S, r.code), days = leaveDaysOf(S, r.code, r.from, r.to), w = leaveWarnings(S, r);
      out.push({ id: r.id, icon: 'plane', tone: ['var(--fill-info-soft)', 'var(--text-info)'], t: `${leaveType(S, r.type).name} leave · ${st.name}`, s: `${days} day${days === 1 ? '' : 's'} · ${r.from === r.to ? dayLabel(r.from) : `${dayLabel(r.from)}–${dayLabel(r.to)}`} · ${r.reason || 'no reason'}${w.length ? ` · ${w[0]}` : ''}`, warn: !!w.length, yes: () => { decideLeave(r.id, 'ok'); toast(`${st.name}’s leave approved. Roster and payroll updated.`, { undo: () => decideLeave(r.id, 'wait') }); }, no: () => { decideLeave(r.id, 'no', { why: 'Not possible that day' }); toast(`${st.name}’s leave rejected. SMS sent.`, { tone: 'info', undo: () => decideLeave(r.id, 'wait') }); } });
    });
    S.loans.filter((l) => l.status === 'req').forEach((l) => {
      const st = staffBy(S, l.code);
      out.push({ id: l.id, icon: 'hand-coins', tone: ['var(--fill-warning-soft)', 'var(--text-warning)'], t: `Salary ${l.type} · ${st.name}`, s: `${money(l.amount)} · back from ${monthLabel(l.start)} in ${l.months} part${l.months === 1 ? '' : 's'}${l.reason ? ` · ${l.reason}` : ''}`, href: `/loans-advances?id=${l.id}`, hrefLabel: 'Review' });
    });
    S.fixes.filter((f) => f.status === 'wait').forEach((f) => {
      const st = staffBy(S, f.code);
      out.push({ id: f.id, icon: 'fingerprint', tone: ['var(--fill-success-soft)', 'var(--text-success)'], t: `Attendance fix · ${st.name}`, s: `${WEEKDAYS[dowOf(f.key)]} ${dayLabel(f.key)} · ${f.text}`, yes: () => { decideFix(f.id, true); toast(`${st.name}’s ${dayLabel(f.key)} updated.`); }, no: () => { decideFix(f.id, false); toast('Fix rejected. SMS sent.', { tone: 'info' }); } });
    });
    if (run && run.status === 'draft' && run.step === 3) out.push({ id: run.id, icon: 'banknote', tone: ['var(--fill-primary-soft)', 'var(--primary)'], t: `${run.title} payroll · waiting for you`, s: `${money(total)} for ${(run.lines || []).length || 'all'} staff`, href: '/payroll', hrefLabel: 'Review' });
    return out;
  }, [S, run, total]);

  // ---- last 14 days and 30-day stats ------------------------------------------------------------------
  const trend = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i - 13)).map((k) => {
    const day = staff.map((st) => cellOf(S, st.code, k).code);
    const exp = day.filter((c) => [...WORKED, 'A', '?', 'wait'].includes(c)).length;
    const got = day.filter((c) => WORKED.includes(c)).length;
    return { k, exp, got, pct: exp ? Math.round((got / exp) * 100) : null };
  }), [S, staff, today]);
  const stats30 = useMemo(() => {
    let lates = 0, absents = 0, leaveDays = 0, otMin = 0, otCost = 0;
    staff.forEach((st) => last30.forEach((k) => {
      const c = cellOf(S, st.code, k);
      if (c.code === 'L') lates++;
      if (c.code === 'A') absents++;
      if (c.code === 'V' || c.code === 'U') leaveDays++;
      if (c.rec && c.rec.ot) { otMin += c.rec.ot; otCost += (c.rec.ot / 60) * (st.gross / (30 * S.settings.hoursPerDay)) * S.settings.otRate; }
    }));
    return { lates, absents, leaveDays, otH: Math.round(otMin / 6) / 10, otCost: Math.round(otCost / 10) * 10 };
  }, [S, staff, last30]);

  // ---- money ----------------------------------------------------------------------------------------
  const loansLeft = S.loans.filter((l) => l.status === 'run').reduce((a, l) => a + loanLeft(l), 0);
  const asked = S.loans.filter((l) => l.status === 'req').reduce((a, l) => a + l.amount, 0);
  const gratuity = staff.reduce((a, st) => a + gratuityOf(S, st).provision, 0);
  const monthlyGross = staff.filter((s) => s.status !== 'suspended').reduce((a, s) => a + s.gross, 0);

  // ---- coming up in the next 60 days -----------------------------------------------------------------
  const upcoming = useMemo(() => {
    const end = addDays(today, 60), year = Number(today.slice(0, 4)), out = [];
    const nextOf = (md) => { let k = `${year}-${md}`; if (k < today) k = `${year + 1}-${md}`; return k; };
    staff.forEach((st) => {
      const md = st.dob ? st.dob.slice(5) : st.born;
      if (md) { const k = nextOf(md); out.push([k, 'cake', `Birthday · ${st.name}`, `${st.designation} · ${st.branch}`, profileHref(st.code)]); }
      if (st.status !== 'suspended') { const k = nextOf(st.joined.slice(5)); const yrs = Number(k.slice(0, 4)) - Number(st.joined.slice(0, 4)); if (yrs > 0) out.push([k, 'award', `${yrs} year${yrs === 1 ? '' : 's'} · ${st.name}`, 'Work anniversary', profileHref(st.code)]); }
      if (st.status === 'probation' && st.probationEnd) out.push([st.probationEnd < today ? today : st.probationEnd, 'user-check', `Probation ${st.probationEnd < today ? 'ended' : 'ends'} · ${st.name}`, `${st.probationEnd < today ? `Ended ${dayLabel(st.probationEnd)} — ` : ''}confirm or extend`, '/pay-changes']);
      if (st.contractEnd) out.push([st.contractEnd, 'file-signature', `Contract ends · ${st.name}`, `${st.designation} · renew or end it`, profileHref(st.code, 'job')]);
      const g = gratuityOf(S, st);
      if (!g.eligible && S.settings.gratuity.on) out.push([g.eligibleOn, 'piggy-bank', `Gratuity starts · ${st.name}`, `${S.settings.gratuity.after} years of service`, '/gratuity']);
    });
    (S.changes || []).filter((c) => c.status === 'planned').forEach((c) => { const st = staffBy(S, c.code); const p = changePct(c); out.push([`${c.effective}-01`, CHANGE_KINDS[c.kind][1], `${CHANGE_KINDS[c.kind][0]} · ${st ? st.name : c.code}`, `${p != null ? `${p > 0 ? '+' : ''}${p}% · ` : ''}${c.reason || 'planned'}`, '/pay-changes']); });
    S.runs.filter((r) => r.status === 'approved').forEach((r) => out.push([todayKey({ now: payDateOf(r.month, S.settings) }), 'banknote', 'Pay day', `${r.title} · ${money(runTotal(S, r))} for ${r.count || (r.lines || []).length} staff`, '/payroll']));
    S.holidays.forEach(([k, n]) => out.push([k, 'calendar-heart', n, 'Public holiday · all places']));
    return out.filter(([k]) => k >= today && k <= end).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 8);
  }, [S, staff, today]);

  // off today and in the next 7 days
  const offSoon = useMemo(() => S.leave.requests.filter((r) => r.status === 'ok' && r.to >= today && r.from <= addDays(today, 7)).sort((a, b) => a.from.localeCompare(b.from)), [S, today]);

  const hour = new Date(S.now).getHours();
  const places = HR_PLACES.map((p) => [p, staff.filter((s) => s.branch === p).length]).filter(([, n]) => n);
  const maxPlace = Math.max(1, ...places.map(([, n]) => n));
  const types = ['Full-time', 'Part-time', 'Contract', 'Probation'].map((t) => [t, staff.filter((s) => s.type === t).length]).filter(([, n]) => n);
  const openings = (S.settings.positions || []).filter((p) => p.openings);
  const step = run ? (run.status === 'paid' ? 6 : run.step || 1) : 0;
  const punches = punchesOn(S, today).slice(0, 8);
  const col = (title, color, list, msg) => (
    <div className="hd-who__col">
      <div className="hd-who__head"><span className="hd-dot" style={{ background: color }} />{title}<span className="gc-badge gc-badge--slate">{list.length}</span></div>
      {list.slice(0, 6).map(({ st, c }) => <Link key={st.code} href={profileHref(st.code)} className="hd-person"><Avatar st={st} /><span style={{ minWidth: 0 }}><b>{st.name}</b><span className="hr-sub">{msg(st, c)}</span></span></Link>)}
      {list.length > 6 ? <Link href="/attendance" className="hr-link">+{list.length - 6} more</Link> : null}
      {!list.length ? <span className="hr-sub">Nobody</span> : null}
    </div>
  );
  const needTone = { error: 'hd-need--error', warn: 'hd-need--warn', info: 'hd-need--info' };

  return (
    <HrPage screen="HrDashboard" active="hr-home" page="HR dashboard" title="HR dashboard" css={CSS}>
      <section className="hd-hero gc-on-dark" aria-label="Today">
        <div className="hd-hero__text">
          <p>{WEEKDAYS[dowOf(today)]}, {formatDate(fromKey(today))} · {formatTime(S.now)} · Asia/Dhaka</p>
          <h2>{hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}</h2>
          <p>{present} of {expected.length} expected are in{late.length ? `, ${late.length} late` : ''}{notIn.length ? `, ${notIn.length} not in yet` : ''}{onLeave.length ? ` · ${onLeave.length} on leave` : ''}. {needs.length ? `${needs.length} thing${needs.length === 1 ? '' : 's'} need you today.` : 'Nothing needs you right now.'}</p>
          <p lang="bn" style={{ fontFamily: 'var(--font-bn)' }}>আজ {toBnDigits(expected.length)} জনের মধ্যে {toBnDigits(present)} জন কাজে এসেছেন।</p>
          <div className="hd-rate" aria-label={`${rate}% of expected staff are in`}><i><b style={{ width: rate + '%' }} /></i>{rate}% in</div>
          <div className="hd-hero__links">
            <Link href="/staff-create" className="gc-btn gc-btn--sm"><Icon name="user-plus" width="16" height="16" aria-hidden="true" /> Add staff</Link>
            <Link href="/attendance" className="gc-btn gc-btn--sm"><Icon name="calendar-check" width="16" height="16" aria-hidden="true" /> Attendance</Link>
            <Link href="/payroll" className="gc-btn gc-btn--sm"><Icon name="banknote" width="16" height="16" aria-hidden="true" /> {run ? `${run.title} payroll` : 'Payroll'}</Link>
            <Link href="/id-cards" className="gc-btn gc-btn--sm"><Icon name="id-card" width="16" height="16" aria-hidden="true" /> ID cards</Link>
          </div>
        </div>
        <div className="hd-nums">
          <Link href="/attendance"><b style={{ color: 'var(--text-on-dark)' }}>{present}</b><span>Present</span></Link>
          <Link href="/attendance"><b style={{ color: 'var(--warning)' }}>{late.length}</b><span>Late</span></Link>
          <Link href="/leave"><b style={{ color: 'var(--accent-light, var(--text-on-dark))' }}>{onLeave.length}</b><span>On leave</span></Link>
          <Link href="/attendance"><b>{notIn.length}</b><span>Not in yet</span></Link>
          <Link href="/attendance"><b style={{ color: absent.length ? 'var(--error, var(--text-on-dark))' : undefined }}>{absent.length}</b><span>Absent</span></Link>
        </div>
      </section>

      {needs.length ? (
        <section className="gc-card hr-card" aria-labelledby="hd-needs">
          <div className="hr-head"><div><h2 id="hd-needs">Today needs you</h2><p>People missing, cover, machines, lates and records that will stop pay day.</p></div><span className="gc-badge gc-badge--warning">{needs.length}</span></div>
          <div className="hd-needs">{needs.map((n, i) => <Link key={i} href={n.href} className={'hd-need ' + needTone[n.tone]}><Icon name={n.icon} width="16" height="16" aria-hidden="true" /><span><b>{n.t}</b><span>{n.s}</span></span></Link>)}</div>
        </section>
      ) : null}

      <div className="hd-main">
        <div className="hd-col">
          <section className="gc-card hr-card">
            <div className="hr-head"><div><h2>On duty now · {t12(`${String(Math.floor(nowMin / 60)).padStart(2, '0')}:${String(nowMin % 60).padStart(2, '0')}`)}</h2><p>Shifts running at each place, who is in and who is still missing.</p></div><Link href="/shifts" className="hr-link">Shifts & roster</Link></div>
            <div className="hd-duty">
              {duty.map((d) => {
                const short = d.need && d.inside.length < d.need;
                return (
                  <div key={d.place} className="hd-place">
                    <header><b>{d.place}</b><span className={'hr-fig ' + (short ? 'hr-warn' : 'hr-in')}>{d.inside.length}/{d.planned.length || 0}{d.need ? ` · need ${d.need}` : ''}</span></header>
                    <span className="hr-sub">{d.shifts.length ? d.shifts.map((sh) => `${sh.name} ${t12(sh.start)}–${t12(sh.end)}`).join(' · ') : d.next ? `Closed now · ${d.next.name} starts ${t12(d.next.start)}` : 'No shift running'}</span>
                    {d.planned.length ? <div className="gc-progress"><div className="gc-progress__fill" style={{ width: `${(d.inside.length / d.planned.length) * 100}%`, background: short ? 'var(--warning)' : undefined }} /></div> : null}
                    <div className="hd-faces">{d.planned.map(({ st, c }) => <Link key={st.code} href={profileHref(st.code)} className={WORKED.includes(c.code) ? '' : 'is-out'} title={`${st.name} · ${WORKED.includes(c.code) ? `in ${t12(c.rec.in)}` : 'not in'}`} aria-label={`${st.name}, ${WORKED.includes(c.code) ? 'in' : 'not in'}`}><Avatar st={st} /></Link>)}</div>
                    {d.off.length ? <span className="hr-sub">Off: {d.off.map(({ st, c }) => `${st.name.split(' ')[0]} (${c.code === 'S' ? 'suspended' : c.code === 'W' ? 'weekly off' : c.code === 'H' ? 'holiday' : 'leave'})`).join(', ')}</span> : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="gc-card hr-card">
            <div className="hr-head"><div><h2>Who is in today</h2><p>From the machines, POS log-ins and the staff app</p></div><Link href="/attendance" className="hr-link">Full attendance</Link></div>
            <div className="hd-who">
              {col('Present', 'var(--fill-success)', inNow, (st, c) => `In ${t12(c.rec.in)} · ${c.rec.src}`)}
              {col('Late', 'var(--fill-warning)', late, (st, c) => `${t12(c.rec.in)} · ${c.rec.late} min late`)}
              {col('On leave', 'var(--fill-info)', onLeave, (st, c) => `${leaveType(S, c.plan.leave.type).name} · till ${dayLabel(c.plan.leave.to)}`)}
              {col('Not in yet', 'var(--slate-400)', notIn, (st, c) => { const sh = shiftBy(S, c.plan.shifts[0]); return sh ? `${sh.name} · starts ${t12(sh.start)}` : 'Not marked'; })}
            </div>
          </section>

          <section className="gc-card hr-card">
            <div className="hr-head"><div><h2>Needs your approval</h2><p>Leave, advances and attendance fixes from the staff app</p></div><span className="gc-badge gc-badge--warning">{approvals.length}</span></div>
            <div className="hd-list">
              {approvals.length ? approvals.map((a) => (
                <div key={a.id} className="hd-item">
                  <span className="hd-tag" style={{ background: a.tone[0], color: a.tone[1] }}><Icon name={a.icon} width="18" height="18" aria-hidden="true" /></span>
                  <div className="hd-item__text"><b>{a.t}</b><span className={'hr-sub' + (a.warn ? ' hr-warn' : '')}>{a.s}</span></div>
                  <div className="hr-actions">
                    {a.href ? <Link href={a.href} className="gc-btn gc-btn--sm gc-btn--solid">{a.hrefLabel}</Link> : <>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={a.no} aria-label={`Reject: ${a.t}`}>Reject</button>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={a.yes} aria-label={`Approve: ${a.t}`}>Approve</button>
                    </>}
                  </div>
                </div>
              )) : <p className="hr-sub" style={{ margin: 0 }}>Nothing waiting. Well done.</p>}
            </div>
          </section>

          <section className="gc-card hr-card">
            <div className="hr-head"><div><h2>Latest punches</h2><p>As they come in from the machines, POS and staff app.</p></div><Link href="/attendance-devices" className="hr-link">Devices</Link></div>
            {punches.length ? (
              <div className="hd-log">
                {punches.map((p, i) => (
                  <div key={i}>
                    <time>{t12(p.time)}</time>
                    <Icon name={p.kind === 'in' ? 'log-in' : 'log-out'} width="16" height="16" aria-hidden="true" style={{ color: p.kind === 'in' ? 'var(--text-success)' : 'var(--text-muted)', flex: 'none' }} />
                    <span style={{ flex: 1, minWidth: 0 }}><Link href={profileHref(p.st.code)} className="hr-strong" style={{ textDecoration: 'none' }}>{p.st.name}</Link><span className="hr-sub">{p.kind === 'in' ? 'In' : 'Out'} · {p.device ? p.device.name : p.src} · {p.st.branch}</span></span>
                  </div>
                ))}
              </div>
            ) : <p className="hr-sub" style={{ margin: 0, padding: '0 var(--space-5) var(--space-5)' }}>No punches yet today.</p>}
          </section>
        </div>

        <div className="hd-col">
          {run ? (
            <section className="gc-card hd-box">
              <div className="hr-head" style={{ padding: 0 }}><h2>{run.title} payroll</h2><span className={'gc-badge gc-badge--' + (run.status === 'paid' ? 'success' : run.status === 'approved' ? 'info' : 'warning')}>{runStatusLabel(run)}</span></div>
              <div><span className="hd-big">{money(total)}</span><span className="hr-sub">{run.status === 'paid' ? `paid ${formatDate(run.paidAt)}` : `${run.status === 'approved' ? 'approved' : 'so far'} · pay day ${formatDate(payDateOf(run.month, S.settings))}`}</span></div>
              <div className="hd-steps">{RUN_STEPS.map(([l], i) => <div key={l}><i style={{ background: i + 1 < step ? 'var(--fill-success)' : i + 1 === step ? 'var(--fill-warning)' : undefined }} />{l.split(' ')[0]}</div>)}</div>
              {prev ? <div className="hd-kv"><span>{monthLabel(prev.month)} (paid)</span><span className="hr-fig">{money(runTotal(S, prev))}</span></div> : null}
              <div className="hd-kv"><span>Staff cost / sales</span><span className="hr-fig hr-strong">{sales ? `${(total / sales * 100).toFixed(1)}%` : '—'}</span></div>
              <Link href="/payroll" className="gc-btn gc-btn--neutral gc-btn--block">{run.status === 'approved' ? 'Pay salaries' : run.status === 'paid' ? 'Payslips' : 'Review salary sheet'}</Link>
            </section>
          ) : null}

          <section className="gc-card hd-box">
            <div className="hr-head" style={{ padding: 0 }}><h2>Last 14 days</h2><span className="hr-sub">share of expected staff in</span></div>
            <div className="hd-trend" role="img" aria-label={`Attendance over the last 14 days, ${trend.filter((t) => t.pct != null).map((t) => `${dayLabel(t.k)} ${t.pct}%`).join(', ')}`}>
              {trend.map((t) => <div key={t.k} title={`${WEEKDAYS[dowOf(t.k)]} ${dayLabel(t.k)} · ${t.pct == null ? 'shut' : `${t.got} of ${t.exp} in`}`}><i className={t.pct == null ? 'is-off' : t.pct < 85 ? 'is-low' : ''} style={{ height: t.pct == null ? 6 : `${Math.max(6, t.pct * 0.7)}px` }} /><small>{WEEKDAYS[dowOf(t.k)][0]}</small></div>)}
            </div>
            <div className="hd-stats">
              <div className="hd-stat"><b>{stats30.lates}</b><span>Lates · 30 days</span></div>
              <div className="hd-stat"><b>{stats30.absents}</b><span>Absences · 30 days</span></div>
              <div className="hd-stat"><b>{stats30.otH} h</b><span>Overtime · ≈{money(stats30.otCost)}</span></div>
              <div className="hd-stat"><b>{stats30.leaveDays}</b><span>Leave days · 30 days</span></div>
            </div>
          </section>

          {offSoon.length ? (
            <section className="gc-card hd-box">
              <div className="hr-head" style={{ padding: 0 }}><h2>Off this week</h2><Link href="/leave" className="hr-link">Leave</Link></div>
              {offSoon.map((r) => { const st = staffBy(S, r.code); return <div key={r.id} className="hd-up"><Avatar st={st} /><span style={{ minWidth: 0 }}><span className="hr-strong">{st.name}</span><span className="hr-sub">{leaveType(S, r.type).name} · {dayLabel(r.from)}{r.to !== r.from ? `–${dayLabel(r.to)}` : ''} · {st.branch}</span></span></div>; })}
            </section>
          ) : null}

          <section className="gc-card hd-box">
            <div className="hr-head" style={{ padding: 0 }}><h2>Money</h2><Link href="/salary-statements" className="hr-link">Statements</Link></div>
            <div className="hd-kv"><span>Monthly gross</span><span className="hr-fig hr-strong">{money(monthlyGross)}</span></div>
            <div className="hd-kv"><span>Loans and advances out</span><Link href="/loans-advances" className="hr-fig">{money(loansLeft)}</Link></div>
            {asked ? <div className="hd-kv"><span>Advances asked</span><span className="hr-fig hr-warn">{money(asked)}</span></div> : null}
            <div className="hd-kv"><span>Gratuity built up</span><Link href="/gratuity" className="hr-fig">{money(gratuity)}</Link></div>
          </section>

          <section className="gc-card hd-box">
            <div className="hr-head" style={{ padding: 0 }}><h2>Headcount</h2><Link href="/positions" className="hr-link">Positions</Link></div>
            {places.map(([p, n]) => <div key={p} className="hd-bar"><span>{p}</span><div className="hd-track"><i style={{ width: `${n / maxPlace * 100}%` }} /></div><span className="hr-fig">{n}</span></div>)}
            <p className="hr-sub" style={{ margin: 0 }}>{types.map(([t, n]) => `${n} ${t.toLowerCase()}`).join(' · ')}{S.staff.some((s) => s.status === 'suspended') ? ` · ${S.staff.filter((s) => s.status === 'suspended').length} suspended` : ''}</p>
            {openings.length ? <Link href="/positions" className="hd-need hd-need--info"><Icon name="user-search" width="16" height="16" aria-hidden="true" /><span><b>{openings.reduce((a, p) => a + p.openings, 0)} to hire</b><span>{openings.map((p) => `${p.openings} ${p.title.toLowerCase()}`).join(', ')}</span></span></Link> : null}
          </section>

          <section className="gc-card hd-box">
            <h2>Coming up</h2>
            {upcoming.length ? upcoming.map(([k, icon, t, s, href]) => {
              const d = new Date(fromKey(k));
              const body = <><span className="hd-date"><b>{d.getDate()}</b><span>{MON[d.getMonth()]}</span></span><span style={{ minWidth: 0 }}><span className="hr-strong" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={icon} width="14" height="14" aria-hidden="true" />{t}</span><span className="hr-sub">{s}</span></span></>;
              return href ? <Link key={k + t} href={href} className="hd-up" style={{ textDecoration: 'none' }}>{body}</Link> : <div key={k + t} className="hd-up">{body}</div>;
            }) : <p className="hr-sub" style={{ margin: 0 }}>Nothing in the next 60 days.</p>}
          </section>
        </div>
      </div>
    </HrPage>
  );
}
