'use client';
// LeavingDialog — someone resigns, is let go or their contract ends: the final settlement (salary to the last day,
// earned leave cashed in, gratuity, less loans still owed) becomes a liability in Accounts › Liabilities, and the
// person is marked Left from the day after (src/lib/hr.js › finalSettlementOf / settleLeaving).

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { AccountSelect } from '@/screens/accounts/accShared';
import { finalSettlementOf, settleLeaving, staffBy, todayKey, serviceOf } from '@/lib/hr';
import { money } from './hrShared';

const REASONS = ['Resigned', 'Contract ended', 'Let go', 'Retired', 'Other'];

export function LeavingDialog({ S, code, onClose }) {
  const st = staffBy(S, code);
  const [f, setF] = useState({ lastDay: todayKey(S), reason: 'Resigned', note: '', account: st ? st.payAccount : 'brac' });
  if (!st) return null;
  const fs = finalSettlementOf(S, code, f.lastDay || todayKey(S));
  const sv = serviceOf(st, f.lastDay || todayKey(S));
  const save = (e) => {
    e.preventDefault();
    if (!f.lastDay || f.lastDay < st.joined) { toast('Choose the last working day', { tone: 'error' }); return; }
    const { liability } = settleLeaving(code, { lastDay: f.lastDay, reason: `${f.reason}${f.note ? ' · ' + f.note : ''}`, account: f.account });
    toast(liability ? `${st.name} leaves after ${formatDate(fromKey(f.lastDay))}. ${money(fs.net)} final settlement is in Accounts › Liabilities (${liability.id}).` : `${st.name} leaves after ${formatDate(fromKey(f.lastDay))}. Nothing is owed.`);
    onClose(true);
  };
  return (
    <Dialog open title={`Leaving · ${st.name}`} onClose={() => onClose(false)} width={600}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="lv-form" className="gc-btn gc-btn--solid gc-btn--error">Mark as left</button></>}>
      <form id="lv-form" className="hr-form" onSubmit={save}>
        <div className="hr-two">
          <div><label className="gc-label" htmlFor="lv-day">Last working day</label><input id="lv-day" type="date" className="gc-input" min={st.joined} value={f.lastDay} onChange={(e) => setF({ ...f, lastDay: e.target.value })} data-autofocus /><span className="gc-help">Service {sv.text}</span></div>
          <div><label className="gc-label" htmlFor="lv-why">Why</label><select id="lv-why" className="gc-input gc-select" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
        </div>
        <div><label className="gc-label" htmlFor="lv-note">Note</label><input id="lv-note" className="gc-input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="e.g. Resignation letter received 1 Oct, one month notice served" /></div>
        <div className="gc-table-wrap" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <table className="gc-table gc-table--compact">
            <thead><tr><th scope="col">Final settlement</th><th scope="col" className="hr-num">Amount</th></tr></thead>
            <tbody>
              {fs.lines.length ? fs.lines.map((l) => <tr key={l.key}><td>{l.label}</td><td className={'hr-num hr-fig' + (l.amount < 0 ? ' hr-out' : '')}>{l.amount < 0 ? '−' : ''}{money(l.amount)}</td></tr>) : <tr><td colSpan={2} className="hr-sub">Nothing to pay — this month’s salary is already in a payroll run.</td></tr>}
              <tr><th scope="row">To pay</th><td className="hr-num hr-fig hr-strong">{money(Math.max(0, fs.net))}</td></tr>
            </tbody>
          </table>
        </div>
        {!fs.gratuity.eligible ? <p className="gc-help" style={{ margin: 0 }}>No gratuity: {sv.years} full year{sv.years === 1 ? '' : 's'} of service, it starts after {S.settings.gratuity.after}.</p> : null}
        {fs.net < 0 ? <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{st.name.split(' ')[0]} still owes {money(-fs.net)} after the settlement. Collect it in Loans & advances.</span></div> : null}
        {fs.net > 0 ? <AccountSelect id="lv-acc" label="Pay it from" value={f.account} onChange={(v) => setF({ ...f, account: v })} /> : null}
        <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>They drop off the roster, attendance and payroll from the day after. Their login stops and their record, payslips and documents are kept.</span></div>
      </form>
    </Dialog>
  );
}
