'use client';
// Shifts & roster — define shifts (time, break, grace, colour, where they run, minimum staff), plan
// the week person by person, and see cover per shift per day. Each person follows their usual shift
// and weekly off (HR setup) unless the roster changes a day; approved leave and public holidays
// (src/lib/settlements.js › holidaysOf) show by themselves. Warnings: leave clashes, double or
// overlapping shifts, cover under the minimum, weeks over 48 hours. Data: src/lib/hr.js.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatDate } from '@/lib/format';
import {
  todayKey, weekStartOf, weekKeys, addDays, dayLabel, dowOf, WEEKDAYS, dayPlan, shiftBy, shiftHours, shiftTime, t12,
  coverageOf, weekWarnings, isClosedDay, setRoster, copyWeek, publishWeek, saveShift, removeShift, SHIFT_COLORS, HR_PLACES, leaveType, staffBy,
} from '@/lib/hr';
import { HrPage, useHr, Avatar, profileHref } from './hrShared';

const CSS = `
.sf-shifts{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:var(--space-3)}
.sf-shift{display:flex;flex-direction:column;gap:6px;min-width:0;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-top-width:4px;border-radius:var(--radius-xl);background:var(--surface-card);text-align:left;font:inherit;cursor:pointer}
.sf-shift:hover{box-shadow:var(--shadow-sm)}
.sf-shift b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sf-shift__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.sf-add{align-items:center;justify-content:center;border-style:dashed;border-top-width:1px;color:var(--text-muted);min-height:96px}
.sf-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.sf-nav{display:inline-flex;align-items:center;gap:var(--space-1)}
.sf-nav span{font-weight:var(--weight-semibold);color:var(--text-heading);font-size:var(--text-sm);white-space:nowrap}
.sf-place{width:auto;min-width:190px;margin-left:auto}
.sf-grid th.sf-day{text-align:center;min-width:84px}
.sf-grid .sf-cell small{white-space:normal;line-height:1.25;text-align:center}
.sf-grid th:first-child,.sf-grid td:first-child{min-width:170px;max-width:210px;white-space:normal}
.sf-grid th.sf-day.is-today{color:var(--primary)}
.sf-grid td.sf-td{padding:4px 3px!important}
.sf-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;min-height:44px;padding:4px;border:1px solid transparent;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1.2;cursor:pointer;text-align:center}
.sf-cell small{font-size:var(--text-2xs);font-weight:var(--weight-regular);opacity:.9}
.sf-cell--off{border:1px dashed var(--border-strong);background:transparent;color:var(--text-muted)}
.sf-cell--bad{box-shadow:inset 0 0 0 2px var(--text-danger)}
.sf-cell--set{box-shadow:inset 0 -2px 0 currentColor}
.sf-cov{display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:28px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.sf-warns{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.sf-places{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.sf-swatches{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.sf-swatch{width:32px;height:32px;border-radius:var(--radius-full);border:2px solid transparent;cursor:pointer;padding:0}
.sf-swatch[aria-pressed="true"]{border-color:var(--text-heading)}
@media (max-width:640px){.sf-place{margin-left:0;width:100%}}
`;
const EMPTY_SHIFT = { name: '', start: '10:00', end: '18:00', breakMin: '60', graceMin: '10', color: 'pink', places: ['Dhanmondi branch'], minStaff: '1' };

export default function Shifts() {
  const { S } = useHr();
  const today = todayKey(S);
  const [start, setStart] = useState(null);
  const [place, setPlace] = useState('');
  const [view, setView] = useState('roster');
  const [cell, setCell] = useState(null);    // { code, key, shifts }
  const [form, setForm] = useState(null);    // shift being edited
  const wk = start || weekStartOf(today);
  const keys = weekKeys(wk);
  const staff = S.staff.filter((st) => st.status !== 'left' && (!place || st.branch === place));
  const warns = weekWarnings(S, wk, place);
  const published = (S.roster.published || {})[wk];
  const holidays = keys.filter((k) => S.holidayMap[k]).map((k) => `${S.holidayMap[k]} (${WEEKDAYS[dowOf(k)]} ${dayLabel(k)})`);

  const cellView = (st, k) => {
    const p = dayPlan(S, st, k);
    if (p.kind === 'work') {
      const shs = p.shifts.map((id) => shiftBy(S, id)).filter(Boolean);
      if (!shs.length) return { l: 'No shift', cls: 'sf-cell--off' };
      const [bg, fg] = SHIFT_COLORS[shs[0].color] || SHIFT_COLORS.slate;
      return { l: shs.map((x) => x.name).join(' + '), t: shs.length > 1 ? 'Double shift' : `${t12(shs[0].start)}–${t12(shs[0].end)}`, bg, fg, bad: shs.length > 1, set: p.set };
    }
    if (p.kind === 'leave') return { l: `${leaveType(S, p.leave.type).name} leave`, t: p.conflict ? 'Also on roster' : '', bg: 'var(--fill-info-soft)', fg: 'var(--text-info)', bad: !!p.conflict, leave: true };
    if (p.kind === 'holiday') return { l: 'Holiday', t: p.holiday, bg: 'var(--fill-secondary-soft)', fg: 'var(--secondary)' };
    if (p.kind === 'suspended') return { l: 'Suspended', bg: 'var(--surface-subtle)', fg: 'var(--text-danger)', locked: true };
    if (p.kind === 'none') return { l: '—', cls: 'sf-cell--off', locked: true };
    return { l: 'Off', t: p.set ? 'Changed' : 'Weekly off', cls: 'sf-cell--off' };
  };
  const hoursOf = (st) => keys.reduce((a, k) => { const p = dayPlan(S, st, k); return a + (p.kind === 'work' ? p.shifts.reduce((b, id) => b + shiftHours(shiftBy(S, id)), 0) : 0); }, 0);
  const openCell = (st, k) => {
    const p = dayPlan(S, st, k);
    if (p.kind === 'suspended' || p.kind === 'none') { toast(p.kind === 'suspended' ? `${st.name} is suspended — no shifts until reactivated on All staff.` : `${st.name} had not joined yet.`, { tone: 'info' }); return; }
    setCell({ code: st.code, key: k, shifts: p.kind === 'work' ? [...p.shifts] : [], leave: p.kind === 'leave' ? p.leave : null, set: !!p.set });
  };
  const saveCell = (e) => {
    e.preventDefault();
    const st = staffBy(S, cell.code);
    setRoster(cell.key, cell.code, cell.shifts);
    toast(cell.shifts.length ? `${st.name} · ${WEEKDAYS[dowOf(cell.key)]} ${dayLabel(cell.key)}: ${cell.shifts.map((id) => shiftBy(S, id).name).join(' + ')}${cell.shifts.length > 1 ? ' (double shift)' : ''}.` : `${st.name} is off on ${WEEKDAYS[dowOf(cell.key)]} ${dayLabel(cell.key)}.`);
    setCell(null);
  };
  const doCopy = () => {
    const from = addDays(wk, -7);
    const changed = S.staff.some((st) => keys.some((k) => ((S.roster.days || {})[k] || {})[st.code]));
    const go = () => { copyWeek(from, wk); toast(`Week of ${dayLabel(from)} copied onto ${dayLabel(wk)} – ${dayLabel(addDays(wk, 6))}. Approved leave is kept.`); };
    if (changed) confirmDialog({ title: 'Replace this week’s changes?', body: 'This week already has changes on the roster. Copying last week replaces them.', confirmLabel: 'Copy last week' }).then((ok) => ok && go());
    else go();
  };
  const doPublish = () => {
    const n = S.staff.filter((st) => keys.some((k) => dayPlan(S, st, k).kind === 'work')).length;
    const bad = warns.filter((w) => w.tone === 'error').length;
    const go = () => { publishWeek(wk); toast(`Roster for ${dayLabel(wk)} – ${dayLabel(addDays(wk, 6))} published. ${n} staff get their week by SMS.`); };
    if (bad) confirmDialog({ title: `Publish with ${bad} clash${bad === 1 ? '' : 'es'}?`, body: warns.filter((w) => w.tone === 'error').map((w) => w.text).join(' '), confirmLabel: 'Publish anyway' }).then((ok) => ok && go());
    else go();
  };
  const saveForm = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Give the shift a name', { tone: 'error' }); return; }
    if (!form.places.length) { toast('Pick at least one place', { tone: 'error' }); return; }
    const row = saveShift({ ...form, name: form.name.trim() });
    toast(`${row.name} shift saved. It shows in the roster.`);
    setForm(null);
  };
  const delShift = () => {
    confirmDialog({ title: `Delete the ${form.name} shift?`, body: 'Days on the roster that use it become days off.', confirmLabel: 'Delete shift', tone: 'danger' }).then((ok) => {
      if (!ok) return;
      const users = removeShift(form.id);
      if (users.length) { toast(`${users.map((u) => u.name).join(', ')} still ${users.length === 1 ? 'has' : 'have'} it as the usual shift. Change that on All staff first.`, { tone: 'error' }); return; }
      toast('Shift deleted.', { tone: 'info' });
      setForm(null);
    });
  };

  return (
    <HrPage screen="Shifts" active="hr-shifts" page="Shifts & roster" title="Shifts & roster" css={CSS}
      description="Set your shifts once, then plan the week. Staff get the roster by SMS when you publish it."
      actions={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={doCopy}><Icon name="copy" width="18" height="18" aria-hidden="true" /> Copy last week</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={doPublish}><Icon name="send" width="18" height="18" aria-hidden="true" /> Publish roster</button>
      </>}>

      <div className="sf-shifts">
        {S.shifts.map((sh) => {
          const [bg, fg] = SHIFT_COLORS[sh.color] || SHIFT_COLORS.slate;
          return (
            <button key={sh.id} type="button" className="sf-shift" style={{ borderTopColor: fg }} onClick={() => setForm({ ...sh, breakMin: String(sh.breakMin), graceMin: String(sh.graceMin), minStaff: String(sh.minStaff) })} aria-label={`Edit the ${sh.name} shift`}>
              <span className="sf-shift__top"><b>{sh.name}</b><span className="hr-chip" style={{ background: bg, color: fg }}>{S.staff.filter((s) => s.shift === sh.id && s.status !== 'left').length} staff</span></span>
              <span className="hr-fig hr-strong" style={{ color: fg }}>{shiftTime(sh)}</span>
              <span className="hr-sub">{sh.breakMin ? `Break ${sh.breakMin} min` : 'No break'} · grace {sh.graceMin} min · {shiftHours(sh)} h</span>
              <span className="hr-sub">{sh.places.join(', ')} · at least {sh.minStaff}</span>
            </button>
          );
        })}
        <button type="button" className="sf-shift sf-add" onClick={() => setForm({ ...EMPTY_SHIFT, graceMin: String(S.settings.graceMin) })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New shift</button>
      </div>

      <section className="gc-card hr-card">
        <div className="sf-tools">
          <div className="sf-nav">
            <button type="button" className="gc-iconbtn" aria-label="Previous week" onClick={() => setStart(addDays(wk, -7))}><Icon name="chevron-left" width="18" height="18" /></button>
            <span>Week of {dayLabel(wk)} – {dayLabel(addDays(wk, 6), true)}</span>
            <button type="button" className="gc-iconbtn" aria-label="Next week" onClick={() => setStart(addDays(wk, 7))}><Icon name="chevron-right" width="18" height="18" /></button>
            {wk !== weekStartOf(today) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setStart(null)}>This week</button> : null}
          </div>
          <span className={'gc-badge gc-badge--' + (published ? 'success' : 'warning')}>{published ? `Published ${formatDate(published)}` : 'Not published'}</span>
          <div className="hr-seg" role="group" aria-label="View">
            <button type="button" aria-pressed={view === 'roster'} onClick={() => setView('roster')}>Roster</button>
            <button type="button" aria-pressed={view === 'plan'} onClick={() => setView('plan')}>Cover per shift</button>
          </div>
          <select className="gc-input gc-select sf-place" aria-label="Location" value={place} onChange={(e) => setPlace(e.target.value)}>
            <option value="">All locations</option>
            {HR_PLACES.filter((p) => S.staff.some((s) => s.branch === p)).map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        {view === 'roster' ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact sf-grid">
              <thead><tr>
                <th scope="col">Staff</th>
                {keys.map((k) => <th key={k} scope="col" className={'sf-day' + (k === today ? ' is-today' : '')}>{WEEKDAYS[dowOf(k)]}<span className="hr-sub" style={{ fontWeight: 'var(--weight-regular)' }}>{dayLabel(k)}</span></th>)}
                <th scope="col" className="hr-num">Hours</th>
              </tr></thead>
              <tbody>
                {staff.map((st) => {
                  const h = hoursOf(st);
                  return (
                    <tr key={st.code}>
                      <td><div className="hr-who"><Avatar st={st} /><span><Link href={profileHref(st.code)}>{st.name}</Link><span className="hr-sub">{st.designation} · {st.branch.replace(' branch', '')}</span></span></div></td>
                      {keys.map((k) => {
                        const c = cellView(st, k);
                        return (
                          <td key={k} className="sf-td">
                            <button type="button" className={'sf-cell ' + (c.cls || '') + (c.bad ? ' sf-cell--bad' : '') + (c.set ? ' sf-cell--set' : '')} style={c.bg ? { background: c.bg, color: c.fg } : undefined} onClick={() => openCell(st, k)} aria-label={`${st.name}, ${WEEKDAYS[dowOf(k)]} ${dayLabel(k)}: ${c.l}${c.t ? ', ' + c.t : ''}`}>
                              {c.l}{c.t ? <small>{c.t}</small> : null}
                            </button>
                          </td>
                        );
                      })}
                      <td className={'hr-num hr-strong' + (h > 48 ? ' hr-out' : '')}>{Math.round(h * 10) / 10} h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Shift · place</th>{keys.map((k) => <th key={k} scope="col" style={{ textAlign: 'center' }}>{WEEKDAYS[dowOf(k)]}<span className="hr-sub" style={{ fontWeight: 'var(--weight-regular)' }}>{dayLabel(k)}</span></th>)}</tr></thead>
              <tbody>
                {(() => {
                  const byDay = Object.fromEntries(keys.map((k) => [k, coverageOf(S, k)]));
                  const combos = [];
                  keys.forEach((k) => byDay[k].forEach((r) => { if ((!place || r.place === place) && !combos.some((c) => c.shift.id === r.shift.id && c.place === r.place)) combos.push({ shift: r.shift, place: r.place }); }));
                  return combos.map(({ shift, place: pl }) => (
                    <tr key={shift.id + pl}>
                      <td><span className="hr-strong">{shift.name}</span><span className="hr-sub">{pl} · {shiftTime(shift)}</span></td>
                      {keys.map((k) => {
                        const r = byDay[k].find((x) => x.shift.id === shift.id && x.place === pl) || { n: 0, min: 0, names: [] };
                        const closed = isClosedDay(S, k) && !r.n;
                        const short = !closed && r.n < r.min;
                        return <td key={k} style={{ textAlign: 'center' }} title={r.names.join(', ') || 'Nobody'}>
                          {closed ? <span className="hr-sub">Closed</span> : <span className="sf-cov" style={{ background: short ? 'var(--fill-error-soft)' : r.n ? 'var(--fill-success-soft)' : 'var(--surface-subtle)', color: short ? 'var(--text-danger)' : r.n ? 'var(--text-success)' : 'var(--text-muted)' }}>{r.n} / {r.min}</span>}
                          {r.names.length ? <span className="hr-sub">{r.names.map((n) => n.split(' ')[0]).join(', ')}</span> : null}
                        </td>;
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}

        <div className="sf-warns">
          {warns.length ? warns.map((w, i) => <div key={i} className={'hr-note hr-note--' + (w.tone === 'error' ? 'error' : 'warn')}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{w.text}</span></div>)
            : <div className="hr-note hr-note--ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>No clashes this week: every shift has its minimum and nobody is over 48 hours.</span></div>}
          <p className="hr-sub" style={{ margin: 0 }}>
            Weekly off: {S.settings.weeklyOff.map((d) => WEEKDAYS[d]).join(', ') || 'by roster'} (<Link href="/hr-setup?sec=att" className="hr-link">HR setup</Link>) · {holidays.length ? `Holiday this week: ${holidays.join(', ')}` : 'No public holiday this week'} · Leave comes from the <Link href="/leave" className="hr-link">Leave</Link> page. A line under a cell means it was changed from the usual pattern.
          </p>
        </div>
      </section>

      <Dialog open={!!cell} title={cell ? `${staffBy(S, cell.code).name} · ${WEEKDAYS[dowOf(cell.key)]} ${dayLabel(cell.key, true)}` : 'Day'} onClose={() => setCell(null)} width={520}
        footer={cell ? <>{cell.set ? <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => { setRoster(cell.key, cell.code, null); toast('Back to the usual shift for that day.', { tone: 'info' }); setCell(null); }}>Back to usual</button> : null}<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCell(null)}>Cancel</button><button type="submit" form="sf-cell" className="gc-btn gc-btn--solid">Save day</button></> : null}>
        {cell ? (
          <form id="sf-cell" className="hr-form" onSubmit={saveCell}>
            {cell.leave ? <div className="hr-note hr-note--info"><Icon name="plane" width="16" height="16" aria-hidden="true" /><span>On approved {leaveType(S, cell.leave.type).name.toLowerCase()} leave {dayLabel(cell.leave.from)} – {dayLabel(cell.leave.to)}. Leave wins over the roster; change it on the <Link href="/leave" className="hr-link">Leave</Link> page.</span></div> : null}
            {S.holidayMap[cell.key] ? <div className="hr-note hr-note--info"><Icon name="calendar-heart" width="16" height="16" aria-hidden="true" /><span>{S.holidayMap[cell.key]} is a public holiday. Put a shift only if they work that day.</span></div> : null}
            <div className="hr-opts">
              {S.shifts.map((sh) => {
                const on = cell.shifts.includes(sh.id), st = staffBy(S, cell.code);
                return (
                  <label key={sh.id} className={'hr-opt' + (on ? ' is-on' : '')}>
                    <input type="checkbox" checked={on} onChange={() => setCell({ ...cell, shifts: on ? cell.shifts.filter((x) => x !== sh.id) : [...cell.shifts, sh.id] })} />
                    <span><b>{sh.name} · {shiftTime(sh)}</b><small>{sh.places.join(', ')}{!sh.places.includes(st.branch) ? ` — ${st.name.split(' ')[0]} works at ${st.branch}` : ''}{st.shift === sh.id ? ' · usual shift' : ''}</small></span>
                  </label>
                );
              })}
            </div>
            {cell.shifts.length > 1 ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span><b>Double shift.</b> Hours above the shift are paid as overtime when attendance shows them.</span></div> : null}
            {!cell.shifts.length ? <p className="gc-help" style={{ margin: 0 }}>No shift ticked = a day off.</p> : null}
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!form} title={form && form.id ? `Edit shift · ${form.name}` : 'New shift'} onClose={() => setForm(null)} width={640}
        footer={form ? <>{form.id ? <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={delShift}>Delete</button> : null}<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" form="sf-form" className="gc-btn gc-btn--solid">Save shift</button></> : null}>
        {form ? (
          <form id="sf-form" className="hr-form" onSubmit={saveForm}>
            <div className="hr-three">
              <div style={{ gridColumn: 'span 1' }}><label className="gc-label" htmlFor="sf-name">Name</label><input id="sf-name" className="gc-input" placeholder="e.g. Friday half day" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-autofocus /></div>
              <div><label className="gc-label" htmlFor="sf-start">Starts</label><input id="sf-start" type="time" className="gc-input" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="sf-end">Ends</label><input id="sf-end" type="time" className="gc-input" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
            </div>
            <div className="hr-three">
              <div><label className="gc-label" htmlFor="sf-break">Break (min)</label><input id="sf-break" className="gc-input" inputMode="numeric" value={form.breakMin} onChange={(e) => setForm({ ...form, breakMin: e.target.value.replace(/[^\d]/g, '') })} /></div>
              <div><label className="gc-label" htmlFor="sf-grace">Grace before late (min)</label><input id="sf-grace" className="gc-input" inputMode="numeric" value={form.graceMin} onChange={(e) => setForm({ ...form, graceMin: e.target.value.replace(/[^\d]/g, '') })} /></div>
              <div><label className="gc-label" htmlFor="sf-min">Minimum staff</label><input id="sf-min" className="gc-input" inputMode="numeric" value={form.minStaff} onChange={(e) => setForm({ ...form, minStaff: e.target.value.replace(/[^\d]/g, '') })} /></div>
            </div>
            <div>
              <span className="gc-label">Runs at</span>
              <div className="sf-places">
                {HR_PLACES.map((p) => <label key={p} className="hr-check"><input type="checkbox" checked={form.places.includes(p)} onChange={() => setForm({ ...form, places: form.places.includes(p) ? form.places.filter((x) => x !== p) : [...form.places, p] })} />{p}</label>)}
              </div>
              <span className="gc-help">Minimum staff is checked at each of these places, every day the shop is open.</span>
            </div>
            <div>
              <span className="gc-label">Colour</span>
              <div className="sf-swatches" role="group" aria-label="Colour">
                {Object.entries(SHIFT_COLORS).map(([k, [bg, fg, l]]) => <button key={k} type="button" className="sf-swatch" style={{ background: bg, boxShadow: `inset 0 0 0 6px ${bg}, inset 0 0 0 16px ${fg}` }} aria-pressed={form.color === k} aria-label={l} onClick={() => setForm({ ...form, color: k })} />)}
              </div>
            </div>
            <p className="gc-help" style={{ margin: 0 }}>{shiftHours({ ...form, breakMin: Number(form.breakMin) || 0 })} working hours{toMinSafe(form.end) <= toMinSafe(form.start) ? ' · ends the next morning' : ''}.</p>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
const toMinSafe = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
