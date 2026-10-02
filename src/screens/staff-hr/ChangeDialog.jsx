'use client';
// ChangeDialog — record an increment, promotion, confirmation (end of probation), transfer or pay cut for one
// person (src/lib/hr.js › saveChange). This month or earlier changes them now; a later month is planned and applies
// when that month starts. ChangeLetter prints the letter that goes to the person (A4, the shop's letterhead).

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { MERCHANT } from '@/lib/merchant';
import { formatDate } from '@/lib/format';
import {
  saveChange, staffBy, positionOf, gradeOf, gradeLabel, CHANGE_KINDS, HR_PLACES, STAFF_TYPES, monthLabel, monthOf, addMonths, todayKey, takaWords, changePct,
} from '@/lib/hr';
import { printNode } from '@/lib/printNode';
import { money } from './hrShared';

export const LETTER_CSS = `
.ltr{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-sm);line-height:1.6;color:var(--text-body)}
.ltr__head{display:flex;justify-content:space-between;gap:var(--space-3);padding-bottom:var(--space-3);border-bottom:2px solid var(--primary)}
.ltr__head b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ltr__head small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ltr p{margin:0}
.ltr__subj{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ltr table{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ltr th,.ltr td{padding:6px 8px;border:1px solid var(--border-subtle);text-align:left}
.ltr th{background:var(--surface-subtle);font-weight:var(--weight-medium);font-size:var(--text-xs);color:var(--text-muted)}
.ltr__sign{display:flex;justify-content:space-between;gap:var(--space-5);margin-top:var(--space-6)}
.ltr__sign span{min-width:160px;border-top:1px solid var(--text-body);padding-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
`;
export const LETTER_PRINT = '@page{size:A4 portrait;margin:18mm 16mm}.ltr{border:0!important;padding:0!important;font-size:11pt}';

const thisMonth = (S) => monthOf(todayKey(S));

export function ChangeDialog({ S, code, kind: startKind = 'increment', onClose }) {
  const active = S.staff.filter((s) => s.status !== 'left');
  const [who, setWho] = useState(code || '');
  const st = staffBy(S, who);
  const [kind, setKind] = useState(startKind);
  const [f, setF] = useState(() => ({ effective: addMonths(thisMonth(S), 1), gross: '', pct: '', designation: '', branch: '', type: 'Full-time', reason: '' }));
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const pos = positionOf(S, kind === 'promotion' ? f.designation : st ? st.designation : '');
  const newGross = Number(f.gross) || (st ? st.gross : 0);
  const pct = st && st.gross ? Math.round(((newGross - st.gross) / st.gross) * 1000) / 10 : 0;
  const kinds = Object.entries(CHANGE_KINDS).filter(([k]) => k !== 'confirmation' || (st && st.status === 'probation'));

  const setPct = (v) => { const p = v.replace(/[^\d.]/g, ''); set({ pct: p, gross: st && p ? String(Math.ceil(Math.round(st.gross * (1 + Number(p) / 100)) / 100) * 100) : '' }); };
  const setGross = (v) => { const g = v.replace(/\D/g, ''); set({ gross: g, pct: st && g ? String(Math.round(((Number(g) - st.gross) / st.gross) * 1000) / 10) : '' }); };

  const save = (e) => {
    e.preventDefault();
    if (!st) { toast('Choose who this is for', { tone: 'error' }); return; }
    if (!/^\d{4}-\d{2}$/.test(f.effective)) { toast('Choose the month it starts', { tone: 'error' }); return; }
    const to = {};
    if (kind === 'increment') { if (!(newGross > st.gross)) { toast('The new salary must be higher', { tone: 'error' }); return; } to.gross = newGross; }
    if (kind === 'decrease') { if (!(newGross < st.gross)) { toast('The new salary must be lower', { tone: 'error' }); return; } if (!f.reason.trim()) { toast('A pay cut needs a reason on record', { tone: 'error' }); return; } to.gross = newGross; }
    if (kind === 'promotion') {
      const p = positionOf(S, f.designation);
      if (!p || f.designation === st.designation) { toast('Choose the new position', { tone: 'error' }); return; }
      to.designation = p.title; to.department = p.department; to.grade = p.grade;
      if (newGross !== st.gross) to.gross = newGross;
    }
    if (kind === 'transfer') { if (!f.branch || f.branch === st.branch) { toast('Choose the new place', { tone: 'error' }); return; } to.branch = f.branch; }
    if (kind === 'confirmation') { to.type = f.type; if (newGross !== st.gross) to.gross = newGross; }
    const row = saveChange({ code: st.code, kind, effective: f.effective, to, reason: f.reason.trim() });
    toast(row.status === 'done' ? `${CHANGE_KINDS[kind][0]} for ${st.name} done from ${monthLabel(f.effective)}.` : `${CHANGE_KINDS[kind][0]} for ${st.name} planned — it applies on 1 ${monthLabel(f.effective)}.`);
    onClose(row);
  };

  const band = pos ? (newGross < pos.min ? `Below the ${pos.title} band (${money(pos.min)} – ${money(pos.max)}).` : newGross > pos.max ? `Above the ${pos.title} band (${money(pos.min)} – ${money(pos.max)}).` : '') : '';
  const diff = st ? newGross - st.gross : 0;
  return (
    <Dialog open title={st ? `${CHANGE_KINDS[kind][0]} · ${st.name}` : 'Increment or promotion'} onClose={() => onClose(null)} width={620}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(null)}>Cancel</button><button type="submit" form="ch-form" className="gc-btn gc-btn--solid">{f.effective > thisMonth(S) ? 'Plan it' : 'Save'}</button></>}>
      <form id="ch-form" className="hr-form" onSubmit={save}>
        {!code ? (
          <div><label className="gc-label" htmlFor="ch-who">Staff</label><select id="ch-who" className="gc-input gc-select" value={who} onChange={(e) => setWho(e.target.value)} data-autofocus><option value="">Choose…</option>{active.map((s) => <option key={s.code} value={s.code}>{s.name} · {s.designation} · {money(s.gross)}</option>)}</select></div>
        ) : null}
        <div className="sf-seg" role="group" aria-label="What changes">
          {kinds.map(([k, [l]]) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{l}</button>)}
        </div>
        {st ? (
          <>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="ch-eff">From the month of</label><input id="ch-eff" type="month" className="gc-input" value={f.effective} onChange={(e) => set({ effective: e.target.value })} /><span className="gc-help">{f.effective > thisMonth(S) ? `Planned — applies on 1 ${monthLabel(f.effective)}` : `Changes ${st.name.split(' ')[0]}’s record now`}</span></div>
              {kind === 'promotion' ? (
                <div><label className="gc-label" htmlFor="ch-pos">New position</label><select id="ch-pos" className="gc-input gc-select" value={f.designation} onChange={(e) => { const p = positionOf(S, e.target.value); set({ designation: e.target.value }); if (p && st.gross < p.min) setGross(String(p.min)); }}><option value="">Choose…</option>{S.settings.departments.map((d) => <optgroup key={d.name} label={d.name}>{S.settings.positions.filter((p) => p.department === d.name && p.title !== st.designation).map((p) => <option key={p.id} value={p.title}>{p.title} · {p.grade}</option>)}</optgroup>)}</select></div>
              ) : kind === 'transfer' ? (
                <div><label className="gc-label" htmlFor="ch-place">Move to</label><select id="ch-place" className="gc-input gc-select" value={f.branch} onChange={(e) => set({ branch: e.target.value })}><option value="">Choose…</option>{HR_PLACES.filter((p) => p !== st.branch).map((p) => <option key={p}>{p}</option>)}</select></div>
              ) : kind === 'confirmation' ? (
                <div><label className="gc-label" htmlFor="ch-type">Confirmed as</label><select id="ch-type" className="gc-input gc-select" value={f.type} onChange={(e) => set({ type: e.target.value })}>{STAFF_TYPES.filter((t) => t !== 'Probation').map((t) => <option key={t}>{t}</option>)}</select></div>
              ) : <div />}
            </div>
            {kind !== 'transfer' ? (
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="ch-gross">New gross a month (৳)</label><input id="ch-gross" className="gc-input hr-fig" inputMode="numeric" placeholder={String(st.gross)} value={f.gross} onChange={(e) => setGross(e.target.value)} /><span className="gc-help">Now {money(st.gross)}{kind === 'promotion' || kind === 'confirmation' ? ' · leave empty to keep it' : ''}</span></div>
                <div><label className="gc-label" htmlFor="ch-pct">{kind === 'decrease' ? 'Cut by (%)' : 'Raise by (%)'}</label><input id="ch-pct" className="gc-input hr-fig" inputMode="decimal" value={f.pct.replace('-', '')} onChange={(e) => setPct((kind === 'decrease' ? '-' : '') + e.target.value)} /><span className="gc-help">Rounded up to the next ৳100</span></div>
              </div>
            ) : null}
            <div><label className="gc-label" htmlFor="ch-why">Reason</label><input id="ch-why" className="gc-input" value={f.reason} onChange={(e) => set({ reason: e.target.value })} placeholder={kind === 'increment' ? 'e.g. Yearly review — met sales target' : kind === 'promotion' ? 'e.g. Runs the counter well, trained two new cashiers' : ''} /></div>
            <dl className="hr-sum">
              <div><dt>Position</dt><dd style={{ fontFamily: 'var(--font-sans)' }}>{kind === 'promotion' && f.designation ? f.designation : st.designation}</dd></div>
              <div><dt>Grade</dt><dd style={{ fontFamily: 'var(--font-sans)' }}>{kind === 'promotion' && pos ? pos.grade : gradeOf(S, st) || '—'}</dd></div>
              <div className={diff ? 'is-key' : ''}><dt>Gross a month</dt><dd>{money(newGross)}{diff ? ` (${diff > 0 ? '+' : '−'}${pct.toString().replace('-', '')}%)` : ''}</dd></div>
              <div><dt>Cost a year</dt><dd>{diff ? `${diff > 0 ? '+' : '−'}${money(Math.abs(diff) * 12)}` : '—'}</dd></div>
            </dl>
            {band ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{band} Fine if agreed — it shows on their profile.</span></div> : null}
          </>
        ) : null}
      </form>
    </Dialog>
  );
}

/** The letter for one change, ready to print. */
export function ChangeLetter({ S, change }) {
  const st = staffBy(S, change.code);
  if (!st) return null;
  const [kind] = CHANGE_KINDS[change.kind] || CHANGE_KINDS.increment;
  const p = changePct(change);
  const issued = change.at ? formatDate(change.at) : formatDate(Date.now());
  const rows = [];
  if (change.to.designation) rows.push(['Position', change.from.designation, change.to.designation]);
  if (change.to.grade) rows.push(['Grade', gradeLabel(S, change.from.grade), gradeLabel(S, change.to.grade)]);
  if (change.to.branch) rows.push(['Place of work', change.from.branch, change.to.branch]);
  if (change.to.type) rows.push(['Employment', 'Probation', change.to.type]);
  if (change.to.gross != null) rows.push(['Gross salary a month', money(change.from.gross), money(change.to.gross) + (p != null ? ` (${p > 0 ? '+' : ''}${p}%)` : '')]);
  const subject = change.kind === 'increment' ? 'Salary increment' : change.kind === 'promotion' ? 'Promotion' : change.kind === 'confirmation' ? 'Confirmation of employment' : change.kind === 'transfer' ? 'Transfer' : 'Change of salary';
  return (
    <div className="ltr">
      <div className="ltr__head">
        <div><b>{MERCHANT.name}</b><small>{MERCHANT.address}</small><small>{MERCHANT.phone} · {MERCHANT.web}</small></div>
        <div style={{ textAlign: 'right' }}><small>Ref. {MERCHANT.name.slice(0, 2).toUpperCase()}/HR/{change.id}</small><small>{issued}</small></div>
      </div>
      <p>To<br /><b>{st.name}</b><br />{change.from.designation || st.designation}, {st.code}<br />{change.from.branch || st.branch}</p>
      <p className="ltr__subj">Subject: {subject}</p>
      <p>Dear {st.name.split(' ')[0]},</p>
      <p>
        {change.kind === 'increment' ? `We are pleased to tell you that your salary has been increased from ${monthLabel(change.effective)}.`
          : change.kind === 'promotion' ? `We are pleased to promote you to ${change.to.designation} from ${monthLabel(change.effective)}.`
            : change.kind === 'confirmation' ? `You have completed your probation. Your employment is confirmed as ${change.to.type} from ${monthLabel(change.effective)}.`
              : change.kind === 'transfer' ? `You are transferred to ${change.to.branch} from ${monthLabel(change.effective)}.`
                : `Your salary changes from ${monthLabel(change.effective)}.`}
        {change.reason ? ` ${change.reason.replace(/\.$/, '')}.` : ''}
      </p>
      <table><thead><tr><th scope="col" /><th scope="col">Before</th><th scope="col">From {monthLabel(change.effective)}</th></tr></thead><tbody>{rows.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a || '—'}</td><td><b>{b}</b></td></tr>)}</tbody></table>
      {change.to.gross != null ? <p>Your new gross salary is {money(change.to.gross)} ({takaWords(change.to.gross)}) a month. Other terms of your employment stay the same.</p> : <p>Other terms of your employment stay the same.</p>}
      <p>We thank you for your work and wish you well.</p>
      <div className="ltr__sign"><span>For {MERCHANT.name} · Owner</span><span>Received by {st.name}</span></div>
    </div>
  );
}

/** A dialog showing a letter with a Print button. onCancel (a planned change only) adds "Cancel change". */
export function LetterDialog({ S, change, onClose, onCancel }) {
  if (!change) return null;
  return (
    <Dialog open title="Letter" onClose={onClose} width={720}
      footer={<>{onCancel && change.status === 'planned' ? <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto', color: 'var(--text-danger)' }} onClick={() => onCancel(change)}>Cancel change</button> : null}<button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => printNode(document.querySelector('.ltr-print'), { title: `${(staffBy(S, change.code) || {}).name} - ${(CHANGE_KINDS[change.kind] || [''])[0]} letter`, css: LETTER_CSS + LETTER_PRINT })}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print letter</button></>}>
      <div className="ltr-print"><ChangeLetter S={S} change={change} /></div>
    </Dialog>
  );
}
