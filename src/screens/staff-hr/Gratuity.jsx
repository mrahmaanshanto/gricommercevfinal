'use client';
// Gratuity & leaving (/gratuity) — the gratuity rule (HR setup › settings.gratuity: days of basic per full year,
// after how many years), what each person has built up and could take if they left today, who becomes eligible
// soon, and the people who left with their final settlement (src/lib/hr.js › gratuityOf, settleLeaving). The rule is
// the title's meta line; a person opens their profile's salary tab, where Leaving (final settlement) is.

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { MetricStrip, LearnMore } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { gratuityOf, serviceOf, todayKey, saveSettings, addDays } from '@/lib/hr';
import { HrPage, useHr, Person, money, profileHref, rowGo } from './hrShared';
import { FORM_CSS, Seg } from '@/screens/staff-profile/staffForm';

const CSS = `
.gr-prog{display:block;width:110px;margin-top:4px}
`;

export default function Gratuity() {
  const { S } = useHr();
  const g = S.settings.gratuity || {};
  const today = todayKey(S);
  const [rule, setRule] = useState(null);
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

  const ruleText = g.on
    ? <>{g.days} days’ {g.base === 'gross' ? 'gross' : 'basic'} <span>for each full year</span>{g.daysAfter10 && g.daysAfter10 !== g.days ? <> · {g.daysAfter10} days <span>a year once past 10 years</span></> : null} · After {g.after} years{g.encashEarned ? <> · <span>earned leave cashed in on leaving</span></> : null}</>
    : <><span>Gratuity is off</span> · <span>Only salary to the last day is paid when someone leaves.</span></>;

  return (
    <HrPage screen="Gratuity" active="hr-gratuity" page="Gratuity & leaving" title="Gratuity & leaving" css={FORM_CSS + CSS}
      meta={ruleText}
      about="What each person has built up, who can take it, and the final settlement when someone leaves. Bangladesh Labour Act 2006, s.2(10): at least 30 days’ wages for each completed year, 45 days after 10 years."
      secondary={[{ label: 'Gratuity rule', onClick: () => setRule({ ...g }) }]}
      more={[{ label: 'Liabilities', href: '/liabilities' }]}>

      <MetricStrip label="Gratuity" items={[
        { label: 'Built up so far', value: money(built), sub: `for ${active.length} people` },
        { label: 'Payable if they left today', value: money(payable), sub: `${rows.filter((r) => r.gr.eligible).length} eligible now` },
        { label: 'Eligible within a year', value: String(soon.length), sub: soon.map((r) => r.s.name.split(' ')[0]).join(', ') || 'nobody' },
        { label: 'Set aside each month', value: money(monthly) },
      ]} />

      <section className="ix-card" aria-labelledby="gr-all">
        <header className="ix-card__head"><h2 id="gr-all">Everyone <InfoTip text="Longest service first. Built up counts part years; payable counts full years once eligible. Bangladesh Labour Act 2006, s.2(10): at least 30 days’ wages for each completed year, 45 days after 10 years." /></h2></header>
        {rows.length ? (
          <>
            <ul className="ix-plist" aria-label="Everyone">
              {rows.map(({ s, gr }) => (
                <li key={s.code}>
                  <button type="button" className="ix-pitem" onClick={() => navigate(profileHref(s.code, 'salary'))}>
                    <span className="ix-pitem__top"><b>{s.name}</b><span>{gr.amount ? money(gr.amount) : money(gr.provision)}</span></span>
                    <span className="ix-pitem__mid">{gr.service.text} · {gr.eligible ? 'Eligible' : `from ${formatDate(fromKey(gr.eligibleOn))}`}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap" style={{ marginTop: 'var(--space-2)' }}>
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Gratuity for everyone</caption>
                <thead><tr><th scope="col">Staff</th><th scope="col">Service</th><th scope="col" className="ix-num">Basic</th><th scope="col">Eligible</th><th scope="col" className="ix-num">Built up</th><th scope="col" className="ix-num">Payable today</th></tr></thead>
                <tbody>{rows.map(({ s, gr }) => {
                  const pct = Math.min(100, (gr.service.total / ((g.after || 5) * 12)) * 100);
                  return (
                    <tr key={s.code} onClick={rowGo(() => navigate(profileHref(s.code, 'salary')))}>
                      <td><Person st={s} /></td>
                      <td>{gr.service.text}<span className="hr-sub">since {formatDate(fromKey(s.joined))}</span></td>
                      <td className="ix-num hr-fig">{money(gr.basic)}</td>
                      <td>{gr.eligible ? <StatusBadge tone="success">Eligible</StatusBadge> : <><span className="hr-sub">from {formatDate(fromKey(gr.eligibleOn))}</span><span className="gc-progress gr-prog" aria-hidden="true"><span className="gc-progress__fill" style={{ width: pct + '%', display: 'block' }} /></span></>}</td>
                      <td className="ix-num hr-fig">{money(gr.provision)}</td>
                      <td className="ix-num hr-fig hr-strong">{gr.amount ? money(gr.amount) : '—'}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </>
        ) : <div className="ix-empty"><EmptyState icon="users" title="No staff" /></div>}
      </section>

      <section className="ix-card" aria-labelledby="gr-left">
        <header className="ix-card__head"><h2 id="gr-left">People who left <InfoTip text="Their final settlement is a liability in Accounts until paid." /></h2><Link href="/liabilities">Liabilities</Link></header>
        {left.length ? (
          <div className="ix-table-wrap ix-table-wrap--show" style={{ marginTop: 'var(--space-2)' }}>
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">People who left</caption>
              <thead><tr><th scope="col">Staff</th><th scope="col">Last day</th><th scope="col">Why</th><th scope="col" className="ix-num">Service</th><th scope="col" className="ix-num">Gratuity</th><th scope="col" className="ix-num">Settlement</th></tr></thead>
              <tbody>{left.map((s) => <tr key={s.code} onClick={rowGo(() => navigate(profileHref(s.code)))}><td><Person st={s} /></td><td className="ix-muted">{s.lastDay ? formatDate(fromKey(s.lastDay)) : '—'}</td><td>{s.leftReason || '—'}</td><td className="ix-num">{s.lastDay ? serviceOf(s, s.lastDay).text : '—'}</td><td className="ix-num hr-fig">{s.settlement && s.settlement.gratuity ? money(s.settlement.gratuity) : '—'}</td><td className="ix-num hr-fig hr-strong">{s.settlement ? money(s.settlement.net) : '—'}{s.settlement && s.settlement.liabilityId ? <span className="hr-sub">{s.settlement.liabilityId}</span> : null}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="hr-empty">Nobody has left since records started here.</p>}
      </section>
      <LearnMore topic="gratuity" />

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
