'use client';
// Communications › Overview (/admin/comms) — GridCommerce's own messaging to merchants and leads at a glance, laid out
// like the merchant Home: the title row (Send SMS, Compose email), five key figures for the period, what needs someone
// (at most five grouped rows: failures, bounces, low balances, domain records, a failing automation), messages per day
// by channel, calls and WhatsApp, provider health and the stores that use the most SMS.
// Data: lib/admin/comms.js (figures, series, attention, providerRows, merchantUsage). Worked out after mount.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { InfoTip } from '@/components/ui';
import { MetricStrip, ShopHeader } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { figures, series, attention, providerRows, merchantUsage } from '@/lib/admin/comms';
import { AdminShell } from '../AdminShell';
import { useComms, COMMS_CSS, Skel, LoadError, Card, Row, ComposeSheet, money, num, pct, short, delta, deltaText, plural } from './commsShared';

const PERIODS = [['7', 'Last 7 days'], ['30', 'Last 30 days']];
const SERIES = [
  { key: 'sms', name: 'SMS', color: 'var(--viz-1)' }, { key: 'email', name: 'Email', color: 'var(--viz-3)' },
  { key: 'wa', name: 'WhatsApp', color: 'var(--viz-4)' }, { key: 'calls', name: 'Calls', color: 'var(--viz-5)' },
];

const CSS = `
.co-grid{display:grid;gap:var(--space-4);align-items:start}
.co-grid--2{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
.co-grid--even{grid-template-columns:repeat(2,minmax(0,1fr))}
.co-alerts{display:flex;flex-direction:column;padding:var(--space-1) var(--space-2) var(--space-2)}
.co-alert{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-2);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.co-alert:hover{background:var(--surface-subtle)}
.co-alert__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--fill-warning-soft);color:var(--text-warning)}
.co-alert__ic--err{background:var(--fill-error-soft);color:var(--text-danger)}
.co-alert__txt{flex:1;min-width:0;display:flex;flex-direction:column}
.co-alert__txt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.co-alert__txt small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.co-alert>svg{flex:none;color:var(--text-muted)}
.co-mini{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2);margin-bottom:var(--space-3)}
.co-mini a{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page);color:inherit;text-decoration:none}
.co-mini a:hover{background:var(--surface-subtle)}
.co-mini span{font-size:var(--text-xs);color:var(--text-muted)}
.co-mini b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.co-mini small{font-size:var(--text-xs);color:var(--text-muted)}
.co-foot{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.co-foot b{margin-left:4px;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.co-ok{display:flex;align-items:center;gap:var(--space-2);margin:0;padding:var(--space-3) var(--space-4) var(--space-4);font-size:var(--text-sm);color:var(--text-body)}
.co-ok svg{color:var(--text-success)}
.co-sec{margin:var(--space-3) 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
@media (max-width:1100px){.co-grid--2,.co-grid--even{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.co-mini b{font-size:var(--text-sm)}}
`;

export default function CommsOverview() {
  const { data, t, live } = useComms();
  const [period, setPeriod] = useState('30');
  const [compose, setCompose] = useState(null);   // 'sms' | 'email'
  const [retry, setRetry] = useState(0);

  let x = null;
  if (live) {
    try {
      const days = Number(period);
      x = { f: figures(data, t, days), s: series(data, t, days), todo: attention(data, t), prov: providerRows(data, t), top: merchantUsage(t).slice(0, 5) };
    } catch (e) { x = { error: e, retry }; }
  }

  const header = (
    <ShopHeader icon="send" title="Communications"
      about="GridCommerce’s own SMS and email to merchants and leads: what went out, what failed and what it cost, the providers that carry it, and how much SMS each store sends from its own credits. Calls and WhatsApp conversations are counted here; they are handled in the Inbox."
      secondary={[{ label: 'Compose email', icon: 'mail', onClick: () => setCompose('email') }]}
      more={[{ label: 'Templates', href: '/admin/templates' }, { label: 'Automations', href: '/admin/automations' }]}
      primary={{ label: 'Send SMS', icon: 'message-square', onClick: () => setCompose('sms') }} />
  );

  let body;
  if (!x) body = <Skel label="Loading communications" />;
  else if (x.error) body = <LoadError text="The figures could not be worked out." onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const { f, s, todo, prov, top } = x;
    const prevSent = f.prev.sms.sent + f.prev.email.sent;
    const lead = (
      <select className="ix-pick" aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
        {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    );
    const chartData = s.map((d) => ({ label: d.label, title: d.title, values: SERIES.map((c) => d[c.key]) }));
    const every = Math.ceil(s.length / 10);
    const chart = chartData.map((d, i) => (s.length > 14 && i % every && i !== s.length - 1 ? { ...d, label: '' } : d));
    body = (
      <>
        <MetricStrip lead={lead} label={'Key figures, ' + PERIODS.find((p) => p[0] === period)[1].toLowerCase()} items={[
          { label: 'SMS sent', value: num(f.sms.sent), sub: prevSent ? deltaText(delta(f.sms.sent, f.prev.sms.sent)) : null, href: '/admin/sms', icon: 'message-square' },
          { label: 'Emails sent', value: num(f.email.sent), sub: prevSent ? deltaText(delta(f.email.sent, f.prev.email.sent)) : null, href: '/admin/email?tab=sent', icon: 'mail' },
          { label: 'Delivery rate', value: pct(f.rate), sub: 'SMS ' + pct(f.smsRate, 0) + ' · email ' + pct(f.emailRate, 0) },
          { label: 'Failed', value: num(f.failed), sub: 'bounced or not delivered', href: '/admin/sms?tab=history&status=Failed' },
          { label: 'Cost', value: money(f.cost), sub: prevSent ? deltaText(delta(f.cost, f.prevCost)) : null, icon: 'wallet' },
        ]} />

        <section className="ix-card" aria-label="Needs someone">
          <div className="ix-card__head"><h2>Needs someone</h2></div>
          {todo.length ? (
            <div className="co-alerts">
              {todo.map((r) => (
                <Link key={r.key} href={r.href} className="co-alert">
                  <span className={'co-alert__ic' + (r.tone === 'err' ? ' co-alert__ic--err' : '')} aria-hidden="true"><Icon name={r.tone === 'err' ? 'circle-alert' : 'triangle-alert'} width="16" height="16" /></span>
                  <span className="co-alert__txt"><b>{r.title}</b><small>{r.sub}</small></span>
                  <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : <p className="co-ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />Nothing is failing. Every provider is working.</p>}
        </section>

        <div className="co-grid co-grid--2">
          <Card title="Messages per day" action={<InfoTip text="SMS and email from automations, single and bulk sends, plus the team’s calls and WhatsApp conversations. Campaigns are counted in the figures above and on each channel’s Campaigns tab." />}>
            <ColumnChart key={period} label={`Messages per day by channel, ${PERIODS.find((p) => p[0] === period)[1].toLowerCase()}`} data={chart} series={SERIES.map((c) => ({ name: c.name, color: c.color }))} fmt={num} tickFmt={short} height={210} now={s.length - 1} />
            <div style={{ marginTop: 'var(--space-3)' }}><Legend items={SERIES.map((c) => ({ name: c.name, color: c.color, value: num(s.reduce((a, d) => a + d[c.key], 0)) }))} /></div>
          </Card>
          <Card title="Calls and WhatsApp" link={{ href: '/admin/inbox', label: 'Inbox' }}>
            <div className="co-mini">
              <Link href="/admin/calls"><span>Calls made</span><b>{num(f.calls)}</b><small>{num(f.callMinutes)} min</small></Link>
              <Link href="/admin/inbox"><span>WhatsApp chats</span><b>{num(f.wa)}</b><small>{pct((f.waReplied / Math.max(1, f.wa)) * 100, 0)} replied</small></Link>
            </div>
            <p className="co-sec">Email engagement</p>
            <div className="cm-rows">
              <Row title="Opened" end={<b className="cm-fig">{pct(f.email.delivered ? (f.email.opened / f.email.delivered) * 100 : null, 0)}</b>} sub={num(f.email.opened) + ' emails'} />
              <Row title="Clicked" end={<b className="cm-fig">{pct(f.email.delivered ? (f.email.clicked / f.email.delivered) * 100 : null, 0)}</b>} sub={num(f.email.clicked) + ' emails'} />
              <Row title="SMS links tapped" end={<b className="cm-fig">{num(f.sms.clicked)}</b>} sub="From campaign short links" />
            </div>
          </Card>
        </div>

        <div className="co-grid co-grid--even">
          <Card title="Providers" link={{ href: '/admin/sms?tab=provider', label: 'Manage' }}>
            <div className="cm-rows">
              {prov.map((p) => (
                <Row key={p.id} dot={!p.on ? 'off' : p.tone === 'success' ? 'ok' : 'warn'} href={p.ch === 'sms' ? '/admin/sms?tab=provider' : '/admin/email?tab=settings'}
                  title={`${p.name}${p.primary ? ' · main' : ''}`} sub={`${p.ch === 'sms' ? 'SMS' : 'Email'} · ${p.status} · ${pct(p.delivery)} delivered`}
                  end={<span className="cm-fig">{money(p.balance)}</span>} />
              ))}
            </div>
          </Card>
          <Card title="Most SMS this month" link={{ href: '/admin/sms?tab=usage', label: 'Merchant usage' }}>
            {top.length ? (
              <>
                <HBars Link={Link} rows={top.map((m) => ({ key: m.id, label: m.name, sub: `${m.plan} · credits ${money(m.balance)}`, value: m.sms, text: num(m.sms), color: 'var(--viz-1)', href: `/admin/merchant?id=${m.id}&tab=messaging` }))} />
                <div className="co-foot"><span>Their SMS cost<b>{money(top.reduce((a, m) => a + m.smsCost, 0))}</b></span><span>Low credits<b>{plural(top.filter((m) => m.low).length, 'store')}</b></span></div>
              </>
            ) : <p className="cm-empty">No store has sent SMS this month.</p>}
          </Card>
        </div>
      </>
    );
  }

  return (
    <AdminShell active="comms" title="Communications">
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      <ComposeSheet open={!!compose} ch={compose || 'sms'} data={data} t={t} onClose={() => setCompose(null)} />
    </AdminShell>
  );
}
