'use client';
// Gratuity & leaving (/gratuity) — the gratuity rule (HR setup › settings.gratuity: days of basic per full year,
// after how many years), what each person has built up and could take if they left today, who becomes eligible
// soon, and the people who left with their final settlement (src/lib/hr.js › gratuityOf, settleLeaving).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, InfoTip } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { gratuityOf, serviceOf, todayKey, saveSettings, addDays } from '@/lib/hr';
import { HrPage, useHr, Person, money } from './hrShared';
import { LeavingDialog } from './LeavingDialog';
import { FORM_CSS, Seg } from '@/screens/staff-profile/staffForm';

const CSS = `
.gr-rule{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3) var(--space-5);padding:var(--space-4) var(--space-5)}
.gr-rule > div{display:flex;flex-direction:column}
.gr-rule b{font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gr-rule span{font-size:var(--text-xs);color:var(--text-muted)}
.gr-prog{display:block;width:120px;margin-top:6px}
@media (max-width:640px){
  /* the rule reads as a plain two-column list of facts; the lone icon goes */
  .gr-rule{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
  .gr-rule > .rp-tile{display:none}
  .gr-rule > .hr-sub{grid-column:1 / -1;margin-left:0!important;max-width:none!important}
}
`;

export default function Gratuity() {
  const { S } = useHr();
  const g = S.settings.gratuity || {};
  const today = todayKey(S);
  const [rule, setRule] = useState(null);
  const [leaving, setLeaving] = useState('');
  const active = S.staff.filter((s) => s.status !== 'left');
  const rows = active.map((s) => ({ s, gr: gratuityOf(S, s) })).sort((a, b) => b.gr.service.total - a.gr.service.total);
  const built = rows.reduce((a, r) => a + r.gr.provision, 0);
  const payable = rows.reduce((a, r) => a + r.gr.amount, 0);
  const soon = rows.filter((r) => !r.gr.eligible && r.gr.eligibleOn <= addDays(today, 365));
  const monthly = Math.round(active.reduce((a, s) => { const x = gratuityOf(S, s); return a + (x.daily * (g.days || 30)) / 12; }, 0));
  const left = S.staff.filter((s) => s.status === 'left').sort((a, b) => String(b.lastDay).localeCompare(String(a.lastDay)));

  const saveRule = (e) => {
    e.preventDefault();
    const n = (v) => Math.max(0, Math.round(Number(v) || 0));
    saveSettings({ gratuity: { ...g, ...rule, after: n(rule.after), days: n(rule.days), daysAfter10: n(rule.daysAfter10) } });
    toast('Gratuity rule saved. Every figure here follows it.');
    setRule(null);
  };

  return (
    <HrPage screen="Gratuity" active="hr-gratuity" page="Gratuity & leaving" title="Gratuity & leaving" css={FORM_CSS + CSS}
      about="What each person has built up, who can take it, and the final settlement when someone leaves."
      actions={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRule({ ...g })}><Icon name="settings-2" width="18" height="18" aria-hidden="true" /> Gratuity rule</button>}>
      <section className="gc-card">
        <div className="gr-rule">
          <span className="rp-tile"><Icon name="award" width="18" height="18" aria-hidden="true" /></span>
          {g.on ? <>
            <div><b>{g.days} days’ {g.base === 'gross' ? 'gross' : 'basic'}</b><span>for each full year of service</span></div>
            {g.daysAfter10 && g.daysAfter10 !== g.days ? <div><b>{g.daysAfter10} days</b><span>a year once past 10 years</span></div> : null}
            <div><b>After {g.after} years</b><span>before that nothing is paid</span></div>
            <div><b>{g.encashEarned ? 'Yes' : 'No'}</b><span>earned leave cashed in on leaving</span></div>
          </> : <div><b>Gratuity is off</b><span>Only salary to the last day is paid when someone leaves.</span></div>}
          <span style={{ marginLeft: 'auto' }}><InfoTip text="Bangladesh Labour Act 2006, s.2(10): at least 30 days’ wages for each completed year, 45 days after 10 years." /></span>
        </div>
      </section>

      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="piggy-bank" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Built up so far</p><p className="gc-kpi__value">{money(built)}<small>for {active.length} people</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="hand-coins" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Payable if they left today</p><p className="gc-kpi__value">{money(payable)}<small>{rows.filter((r) => r.gr.eligible).length} eligible now</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="calendar-clock" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Eligible within a year</p><p className="gc-kpi__value">{soon.length}<small>{soon.map((r) => r.s.name.split(' ')[0]).join(', ') || 'nobody'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="landmark" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Set aside each month</p><p className="gc-kpi__value">{money(monthly)}<small>keeps the fund level</small></p></div></div>
      </div>

      <section className="gc-card hr-card">
        <div className="hr-head"><div><h2>Everyone <InfoTip text="Longest service first. Built up counts part years; payable counts full years once eligible." /></h2></div></div>
        {rows.length ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Staff</th><th scope="col">Service</th><th scope="col" className="hr-num">Basic</th><th scope="col">Eligible</th><th scope="col" className="hr-num">Built up</th><th scope="col" className="hr-num">Payable today</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{rows.map(({ s, gr }) => {
                const pct = Math.min(100, (gr.service.total / ((g.after || 5) * 12)) * 100);
                return (
                  <tr key={s.code}>
                    <td><Person st={s} sub={`${s.code} · ${s.designation}`} /></td>
                    <td>{gr.service.text}<span className="hr-sub">since {formatDate(fromKey(s.joined))}</span></td>
                    <td className="hr-num hr-fig">{money(gr.basic)}</td>
                    <td>{gr.eligible ? <span className="gc-badge gc-badge--success">Eligible</span> : <><span className="hr-sub">from {formatDate(fromKey(gr.eligibleOn))}</span><span className="gc-progress gr-prog" aria-hidden="true"><span className="gc-progress__fill" style={{ width: pct + '%', display: 'block' }} /></span></>}</td>
                    <td className="hr-num hr-fig">{money(gr.provision)}</td>
                    <td className="hr-num hr-fig hr-strong">{gr.amount ? money(gr.amount) : '—'}</td>
                    <td><div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setLeaving(s.code)}>Leaving…</button></div></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : <EmptyState icon="users" title="No staff" body="Add staff to see their gratuity." />}
      </section>

      <section className="gc-card hr-card">
        <div className="hr-head"><div><h2>People who left</h2><p>Their final settlement is a liability in Accounts until paid.</p></div><Link href="/liabilities" className="gc-btn gc-btn--sm gc-btn--neutral">Liabilities</Link></div>
        {left.length ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Staff</th><th scope="col">Last day</th><th scope="col">Why</th><th scope="col" className="hr-num">Service</th><th scope="col" className="hr-num">Gratuity</th><th scope="col" className="hr-num">Settlement</th></tr></thead>
              <tbody>{left.map((s) => <tr key={s.code}><td><Person st={s} sub={`${s.code} · ${s.designation}`} /></td><td>{s.lastDay ? formatDate(fromKey(s.lastDay)) : '—'}</td><td>{s.leftReason || '—'}</td><td className="hr-num">{s.lastDay ? serviceOf(s, s.lastDay).text : '—'}</td><td className="hr-num hr-fig">{s.settlement && s.settlement.gratuity ? money(s.settlement.gratuity) : '—'}</td><td className="hr-num hr-fig hr-strong">{s.settlement ? money(s.settlement.net) : '—'}{s.settlement && s.settlement.liabilityId ? <span className="hr-sub">{s.settlement.liabilityId}</span> : null}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="hr-sub" style={{ margin: 0, padding: '0 var(--space-5) var(--space-5)' }}>Nobody has left since records started here.</p>}
      </section>

      {leaving ? <LeavingDialog S={S} code={leaving} onClose={() => setLeaving('')} /> : null}
      <Dialog open={!!rule} title="Gratuity rule" onClose={() => setRule(null)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRule(null)}>Cancel</button><button type="submit" form="gr-form" className="gc-btn gc-btn--solid">Save</button></>}>
        {rule ? (
          <form id="gr-form" className="hr-form" onSubmit={saveRule}>
            <div><label className="gc-label" htmlFor="gr-on">Gratuity</label><Seg label="Gratuity" value={!!rule.on} options={[[true, 'On'], [false, 'Off']]} onChange={(v) => setRule({ ...rule, on: v })} /></div>
            <div className="hr-three">
              <div><label className="gc-label" htmlFor="gr-days">Days a year</label><input id="gr-days" className="gc-input hr-fig" inputMode="numeric" value={rule.days} onChange={(e) => setRule({ ...rule, days: e.target.value.replace(/\D/g, '') })} /></div>
              <div><label className="gc-label" htmlFor="gr-10">After 10 years</label><input id="gr-10" className="gc-input hr-fig" inputMode="numeric" value={rule.daysAfter10} onChange={(e) => setRule({ ...rule, daysAfter10: e.target.value.replace(/\D/g, '') })} /></div>
              <div><label className="gc-label" htmlFor="gr-after">Paid after (years)</label><input id="gr-after" className="gc-input hr-fig" inputMode="numeric" value={rule.after} onChange={(e) => setRule({ ...rule, after: e.target.value.replace(/\D/g, '') })} /></div>
            </div>
            <div><label className="gc-label" htmlFor="gr-base">Counted on</label><Seg label="Counted on" value={rule.base || 'basic'} options={[['basic', 'Basic salary'], ['gross', 'Gross salary']]} onChange={(v) => setRule({ ...rule, base: v })} /></div>
            <div><label className="gc-label" htmlFor="gr-enc">Earned leave left over</label><Seg label="Earned leave" value={!!rule.encashEarned} options={[[true, 'Cash it in on leaving'], [false, 'Do not pay']]} onChange={(v) => setRule({ ...rule, encashEarned: v })} /></div>
            <p className="gc-help" style={{ margin: 0 }}>The law sets the floor. A day’s pay is a month’s {rule.base === 'gross' ? 'gross' : 'basic'} ÷ 30.</p>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
