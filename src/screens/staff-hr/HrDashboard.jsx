'use client';
// HR dashboard — today at a glance, what needs the owner, the payroll in progress and what is
// coming up. Every figure comes from src/lib/hr.js (attendance, leave, loans, payroll runs) and the
// sales book (staff cost against sales); approvals here act on the same data as their own pages.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatDate, toBnDigits } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { salesByChannel } from '@/lib/salesBook';
import {
  todayKey, cellOf, staffBy, leaveType, leaveDaysOf, leaveWarnings, decideLeave, decideFix, t12, dayLabel, WEEKDAYS, dowOf,
  runTotal, runStatusLabel, payDateOf, monthLabel, RUN_STEPS, shiftBy, addDays, HR_PLACES,
} from '@/lib/hr';
import { HrPage, useHr, Avatar, money } from './hrShared';

const CSS = `
.hd-hero{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-6);padding:var(--space-6);border-radius:var(--radius-xl);background:var(--brand-navy-deep);color:var(--text-inverse)}
.hd-hero__text{flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:var(--space-2)}
.hd-hero h2{margin:0;font-size:var(--text-2xl);font-weight:var(--weight-semibold)}
.hd-hero p{margin:0;font-size:var(--text-sm);color:var(--text-on-dark-muted)}
.hd-hero__links{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-2)}
.hd-hero__links a{background:rgba(255,255,255,.12);color:var(--text-inverse)}
.hd-hero__links a:hover{background:rgba(255,255,255,.2)}
.hd-nums{display:grid;grid-template-columns:repeat(4,minmax(64px,1fr));gap:var(--space-4)}
.hd-nums b{display:block;font-size:var(--text-3xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.hd-nums span{font-size:var(--text-xs);color:var(--text-on-dark-muted)}
.hd-main{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,380px);gap:var(--space-5);align-items:start}
.hd-col{display:flex;flex-direction:column;gap:var(--space-5)}
.hd-who{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3);padding:0 var(--space-5) var(--space-5)}
.hd-who__col{display:flex;flex-direction:column;gap:var(--space-2);min-width:0}
.hd-who__head{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.hd-dot{width:8px;height:8px;border-radius:var(--radius-full)}
.hd-person{display:flex;align-items:center;gap:var(--space-2);min-width:0;text-decoration:none}
.hd-person b{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-person .hr-av{width:30px;height:30px}
.hd-list{display:flex;flex-direction:column;gap:var(--space-2);padding:0 var(--space-5) var(--space-5)}
.hd-item{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.hd-tag{flex:none;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:var(--radius-lg)}
.hd-item__text{flex:1 1 200px;min-width:0}
.hd-item__text b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hd-box{padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.hd-box h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-big{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hd-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
.hd-steps div{display:flex;flex-direction:column;gap:4px;font-size:var(--text-2xs);color:var(--text-muted);min-width:0}
.hd-steps i{height:6px;border-radius:var(--radius-full);background:var(--slate-200)}
.hd-kv{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm)}
.hd-kv span:first-child{color:var(--text-muted)}
.hd-bar{display:grid;grid-template-columns:minmax(0,1fr) 90px 24px;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.hd-up{display:flex;align-items:center;gap:var(--space-3)}
.hd-date{flex:none;width:44px;text-align:center;border-radius:var(--radius-lg);background:var(--surface-subtle);padding:4px 0}
.hd-date b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.1}
.hd-date span{font-size:var(--text-2xs);color:var(--text-muted);text-transform:uppercase}
@media (max-width:1023px){.hd-main{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){.hd-who{grid-template-columns:repeat(2,minmax(0,1fr))}.hd-nums{grid-template-columns:repeat(2,minmax(64px,1fr))}}
`;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HrDashboard() {
  const { S, ready } = useHr();
  const today = todayKey(S);
  const staff = S.staff.filter((s) => s.status !== 'left');
  const cells = staff.map((st) => ({ st, c: cellOf(S, st.code, today) }));
  const group = (codes) => cells.filter((x) => codes.includes(x.c.code));
  const inNow = group(['P', 'HD']), late = group(['L']), onLeave = group(['V', 'U']), absent = group(['A']);
  const notIn = group(['wait', '?']);
  const working = cells.filter((x) => !['W', 'H', 'S', '·'].includes(x.c.code)).length;

  const run = [...S.runs].filter((r) => r.status !== 'paid').sort((a, b) => a.month.localeCompare(b.month))[0] || [...S.runs].sort((a, b) => b.month.localeCompare(a.month))[0];
  const prev = run ? [...S.runs].filter((r) => r.kind === 'salary' && r.status === 'paid' && r.month < run.month).sort((a, b) => b.month.localeCompare(a.month))[0] : null;
  const total = run ? runTotal(S, run) : 0;
  const [sales, setSales] = useState(null);
  useEffect(() => { if (!ready || !run) return; const [y, m] = run.month.split('-').map(Number); const s = salesByChannel(new Date(y, m - 1, 1).getTime(), new Date(y, m, 1).getTime()); setSales(s.all.revenue); }, [ready, run]);

  // what needs the owner
  const approvals = useMemo(() => {
    const out = [];
    S.leave.requests.filter((r) => r.status === 'wait').forEach((r) => {
      const st = staffBy(S, r.code), days = leaveDaysOf(S, r.code, r.from, r.to), w = leaveWarnings(S, r);
      out.push({ id: r.id, icon: 'plane', tone: ['var(--fill-info-soft)', 'var(--text-info)'], t: `${leaveType(S, r.type).name} leave · ${st.name}`, s: `${days} day${days === 1 ? '' : 's'} · ${r.from === r.to ? dayLabel(r.from) : `${dayLabel(r.from)}–${dayLabel(r.to)}`} · ${r.reason || 'no reason'}${w.length ? ` · ${w[0]}` : ''}`, yes: () => { decideLeave(r.id, 'ok'); toast(`${st.name}’s leave approved. Roster and payroll updated.`, { undo: () => decideLeave(r.id, 'wait') }); }, no: () => { decideLeave(r.id, 'no', { why: 'Not possible that day' }); toast(`${st.name}’s leave rejected. SMS sent.`, { tone: 'info', undo: () => decideLeave(r.id, 'wait') }); } });
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

  // coming up in the next 60 days
  const upcoming = useMemo(() => {
    const end = addDays(today, 60), year = Number(today.slice(0, 4)), out = [];
    const nextOf = (md) => { let k = `${year}-${md}`; if (k < today) k = `${year + 1}-${md}`; return k; };
    staff.forEach((st) => {
      if (st.born) { const k = nextOf(st.born); out.push([k, 'cake', `Birthday · ${st.name}`, `${st.designation} · ${st.branch}`]); }
      if (st.status !== 'suspended') { const k = nextOf(st.joined.slice(5)); const yrs = Number(k.slice(0, 4)) - Number(st.joined.slice(0, 4)); if (yrs > 0) out.push([k, 'award', `${yrs} year${yrs === 1 ? '' : 's'} · ${st.name}`, 'Work anniversary']); }
      if (st.status === 'probation' && st.probationEnd) out.push([st.probationEnd < today ? today : st.probationEnd, 'user-check', `Probation ${st.probationEnd < today ? 'ended' : 'ends'} · ${st.name}`, `${st.probationEnd < today ? `Ended ${dayLabel(st.probationEnd)} — ` : ''}confirm or extend on All staff`, '/all-staff']);
      if (st.contractEnd) out.push([st.contractEnd, 'file-signature', `Contract ends · ${st.name}`, `${st.designation} · renew or end it`]);
    });
    S.runs.filter((r) => r.status === 'approved').forEach((r) => out.push([todayKey({ now: payDateOf(r.month, S.settings) }), 'banknote', 'Pay day', `${r.title} · ${money(runTotal(S, r))} for ${r.count || (r.lines || []).length} staff`, '/payroll']));
    S.holidays.forEach(([k, n]) => out.push([k, 'calendar-heart', n, 'Public holiday · all places']));
    return out.filter(([k]) => k >= today && k <= end).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 7);
  }, [S, staff, today]);

  const hour = new Date(S.now).getHours();
  const places = HR_PLACES.map((p) => [p, staff.filter((s) => s.branch === p).length]).filter(([, n]) => n);
  const maxPlace = Math.max(1, ...places.map(([, n]) => n));
  const types = ['Full-time', 'Part-time', 'Contract', 'Probation'].map((t) => [t, staff.filter((s) => s.type === t).length]).filter(([, n]) => n);
  const step = run ? (run.status === 'paid' ? 6 : run.step || 1) : 0;
  const col = (title, color, list, msg) => (
    <div className="hd-who__col">
      <div className="hd-who__head"><span className="hd-dot" style={{ background: color }} />{title}<span className="gc-badge gc-badge--slate">{list.length}</span></div>
      {list.slice(0, 6).map(({ st, c }) => <Link key={st.code} href="/attendance" className="hd-person"><Avatar st={st} /><span style={{ minWidth: 0 }}><b>{st.name}</b><span className="hr-sub">{msg(st, c)}</span></span></Link>)}
      {list.length > 6 ? <Link href="/attendance" className="hr-link">+{list.length - 6} more</Link> : null}
    </div>
  );

  return (
    <HrPage screen="HrDashboard" active="hr-home" page="HR dashboard" title="HR dashboard" css={CSS}>
      <section className="hd-hero gc-on-dark">
        <div className="hd-hero__text">
          <p>{WEEKDAYS[dowOf(today)]}, {formatDate(fromKey(today))} · Asia/Dhaka</p>
          <h2>{hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}</h2>
          <p className="bn" style={{ fontFamily: 'var(--font-bn)' }}>আজ {toBnDigits(working)} জনের মধ্যে {toBnDigits(inNow.length + late.length)} জন কাজে এসেছেন।</p>
          <div className="hd-hero__links">
            <Link href="/attendance" className="gc-btn gc-btn--sm"><Icon name="calendar-check" width="16" height="16" aria-hidden="true" /> Open attendance</Link>
            <Link href="/payroll" className="gc-btn gc-btn--sm"><Icon name="banknote" width="16" height="16" aria-hidden="true" /> {run ? `${run.title} payroll` : 'Payroll'}</Link>
            <Link href="/all-staff" className="gc-btn gc-btn--sm"><Icon name="user-plus" width="16" height="16" aria-hidden="true" /> Add staff</Link>
          </div>
        </div>
        <div className="hd-nums">
          <div><b style={{ color: 'var(--text-success)' }}>{inNow.length + late.length}</b><span>Present</span></div>
          <div><b style={{ color: 'var(--text-warning)' }}>{late.length}</b><span>Late</span></div>
          <div><b style={{ color: 'var(--text-info)' }}>{onLeave.length}</b><span>On leave</span></div>
          <div><b style={{ color: 'var(--text-danger)' }}>{absent.length}</b><span>Absent</span></div>
        </div>
      </section>

      <div className="hd-main">
        <div className="hd-col">
          <section className="gc-card hr-card">
            <div className="hr-head"><div><h2>Who is in today</h2><p>From device punches, POS log-ins and the staff app</p></div><Link href="/attendance" className="hr-link">Full attendance</Link></div>
            <div className="hd-who">
              {col('Present', 'var(--fill-success)', inNow, (st, c) => `In ${t12(c.rec.in)}`)}
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
                  <div className="hd-item__text"><b>{a.t}</b><span className="hr-sub">{a.s}</span></div>
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
            <div className="hr-head" style={{ padding: 0 }}><h2>Headcount</h2><Link href="/all-staff" className="hr-link">All staff</Link></div>
            {places.map(([p, n]) => <div key={p} className="hd-bar"><span>{p}</span><div className="hr-bar-track"><div className="hr-bar-fill" style={{ width: `${n / maxPlace * 100}%` }} /></div><span className="hr-fig">{n}</span></div>)}
            <p className="hr-sub" style={{ margin: 0 }}>{types.map(([t, n]) => `${n} ${t.toLowerCase()}`).join(' · ')}{S.staff.some((s) => s.status === 'suspended') ? ` · ${S.staff.filter((s) => s.status === 'suspended').length} suspended` : ''}</p>
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
