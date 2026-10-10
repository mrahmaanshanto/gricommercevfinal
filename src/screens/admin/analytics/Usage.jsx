'use client';
// Usage (/admin/analytics/usage) — what every store uses this month, added up: API requests, SMS, AI (replies and product
// credits), messaging (WhatsApp, email, call minutes) and storage. Five key figures, then one card per measure (tabs):
// 12 months of trend and the stores that use the most (each opens its merchant page), what messaging cost the stores,
// and the stores close to a limit (at most five).
// Data: lib/admin/analytics › usage (sums lib/admin/merchants › usageOf over the live stores; earlier months follow each
// store's pace back through the months it was live). ?m (the measure) lives in the address.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { monthLong } from '@/lib/platform/util';
import { usage } from '@/lib/admin/analytics';
import { AdminShell } from '../AdminShell';
import { AN_CSS, useAnalytics, useQuery, AnHeader, Card, Loading, ErrorCard, attempt, money, num, pct, tick, deltaText } from './anShared';

const MEASURES = [
  { key: 'api', label: 'API requests', unit: 'requests', color: 'var(--viz-1)', icon: 'plug' },
  { key: 'sms', label: 'SMS', unit: 'messages', color: 'var(--viz-2)', icon: 'message-square' },
  { key: 'ai', label: 'AI', unit: 'replies and credits', color: 'var(--viz-7)', icon: 'sparkles' },
  { key: 'messaging', label: 'WhatsApp, email & calls', short: 'Messaging', unit: 'messages and minutes', color: 'var(--viz-3)', icon: 'messages-square' },
  { key: 'storage', label: 'Storage', unit: 'GB', color: 'var(--viz-4)', icon: 'hard-drive' },
];
const CSS = `
.us-name{display:flex;flex-direction:column;min-width:0}
.us-name small{margin-left:0!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.us-badges{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px}
`;
const gb = (n) => (n == null ? '—' : (Math.round(n * 10) / 10).toLocaleString('en-IN') + ' GB');
const val = (key, n) => (key === 'storage' ? gb(n) : num(n));
const detail = (key, s) => {
  if (key === 'api') return `${pct(s.api / Math.max(1, s.apiLimit), 0)} of ${num(s.apiLimit)}`;
  if (key === 'sms') return s.smsIncluded ? `${num(s.smsIncluded)} included` : 'none included';
  if (key === 'ai') return `${num(s.aiReplies)} replies · ${num(s.aiCredits)} credits`;
  if (key === 'messaging') return `${num(s.whatsapp)} WhatsApp · ${num(s.email)} email · ${num(s.calls)} min`;
  return s.storageLimit ? `of ${s.storageLimit} GB` : 'no limit';
};

export default function Usage() {
  const { db, t, live } = useAnalytics();
  const [q, setQ] = useQuery({ m: 'api' });
  const [retry, setRetry] = useState(0);
  const minute = Math.floor(t / 60000);
  const measure = MEASURES.find((m) => m.key === q.m) || MEASURES[0];

  const res = useMemo(() => (live ? attempt(() => usage(db, t)) : null), [live, retry, minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const u = res && res.value;

  const exportCsv = () => {
    if (!u) return;
    downloadCsv(`gridcommerce-usage-${monthLong(t).toLowerCase()}.csv`, [
      ['GridCommerce · Usage across all stores', monthLong(t) + ' so far'], [],
      ['Store ID', 'Store', 'Package', 'API requests', 'SMS', 'WhatsApp', 'Email', 'AI replies', 'AI credits', 'Call minutes', 'Storage (GB)', 'Messaging cost (BDT)'],
      ...u.stores.map((s) => ['#' + s.id, s.name, s.packageName, s.api, s.sms, s.whatsapp, s.email, s.aiReplies, s.aiCredits, s.calls, s.storage, s.cost]),
      ['', 'Total', '', u.totals.api, u.totals.sms, u.totals.whatsapp, u.totals.email, u.totals.aiReplies, u.totals.aiCredits, u.totals.calls, u.totals.storage, u.totals.cost],
      [], ['Month', 'API requests', 'SMS', 'AI', 'Messaging', 'Storage (GB)'], ...u.trend.map((m) => [m.title, m.api, m.sms, m.ai, m.messaging, m.storage]),
    ]);
    toast('Usage exported');
  };

  let body;
  if (!res) body = <Loading cards={2} label="Loading usage" />;
  else if (res.error) body = <ErrorCard onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const T = u.totals;
    const last = u.trend[10];
    const pace = (k) => (k === 'storage' ? T.storage : Math.round((T[k] * 30) / u.day));
    const top = u.stores.slice().sort((a, b) => b[measure.key] - a[measure.key]).filter((s) => s[measure.key] > 0).slice(0, 10);
    const total = T[measure.key] || 1;
    const near = u.stores.map((s) => {
      const parts = [];
      if (s.apiLimit && s.api / s.apiLimit >= 0.8) parts.push(['API', s.api / s.apiLimit]);
      if (s.smsIncluded && s.sms / s.smsIncluded >= 0.9) parts.push(['SMS', s.sms / s.smsIncluded]);
      if (s.storageLimit && s.storage / s.storageLimit >= 0.7) parts.push(['Storage', s.storage / s.storageLimit]);
      return parts.length ? { ...s, parts, worst: Math.max(...parts.map((p) => p[1])) } : null;
    }).filter(Boolean).sort((a, b) => b.worst - a.worst);
    const services = [
      ['SMS', T.sms, 0.35], ['WhatsApp', T.whatsapp, 0.9], ['Email', T.email, 0.05], ['AI replies', T.aiReplies, 2], ['Call minutes', T.calls, 1.2],
    ].map(([label, n, price]) => ({ label, n, cost: Math.round(n * price) }));
    body = (
      <>
        <MetricStrip label={'This month across all stores, ' + monthLong(t)} items={MEASURES.map((m) => ({
          label: m.short || m.label, value: val(m.key, T[m.key]), icon: m.icon, on: m.key === measure.key, onClick: () => setQ({ m: m.key }),
          sub: m.key === 'storage' ? `${u.stores.length} stores` : `≈ ${tick(pace(m.key))} by month end`,
        }))} />

        <section className="ix-card" aria-label={measure.label}>
          <div className="ix-card__head"><h2>{measure.label}</h2><span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Pick a figure above to switch</span></div>
          <div className="an-grid an-grid--21" style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)' }}>
            <div>
              <p className="an-big">{val(measure.key, T[measure.key])}<small>{measure.key === 'storage' ? `in use now${last ? ' · ' + deltaText(T.storage, last.storage) + ' on ' + last.label : ''}` : `${measure.unit} this month so far${last ? ' · ' + deltaText(pace(measure.key), last[measure.key]) + ' on ' + last.label + ' at this pace' : ''}`}</small></p>
              <ColumnChart key={measure.key} label={`${measure.label} across all stores, last 12 months`} data={u.trend.map((m) => ({ label: m.label, title: m.title, values: [m[measure.key]] }))}
                series={[{ name: measure.label, color: measure.color }]} fmt={(n) => val(measure.key, n)} tickFmt={measure.key === 'storage' ? (n) => tick(n) : tick} height={220} now={11} />
            </div>
            <div>
              <p className="an-sub">Stores that use the most</p>
              {top.length ? (
                <div className="an-rows">
                  {top.map((s) => (
                    <Link key={s.id} className="an-row" href={'/admin/merchant?id=' + s.id + '&tab=' + (measure.key === 'api' || measure.key === 'storage' ? 'resources' : 'messaging')}>
                      <span className="us-name">{s.name}<small>{detail(measure.key, s)}</small></span>
                      <b>{val(measure.key, s[measure.key])}<small>{pct(s[measure.key] / total, 0)}</small></b>
                    </Link>
                  ))}
                </div>
              ) : <p className="an-empty">No store has used this yet this month.</p>}
            </div>
          </div>
        </section>

        <div className="an-grid an-grid--2">
          <Card title="Messaging this month" tip="Messages and minutes the stores sent, at the price GridCommerce charges from their prepaid credits." link={{ href: '/admin/credits', label: 'Credits' }}>
            <p className="an-big">{money(T.cost)}<small>charged to store credits</small></p>
            <HBars rows={services.map((s) => ({ key: s.label, label: s.label, sub: num(s.n) + (s.label === 'Call minutes' ? ' minutes' : ' sent'), value: s.cost, text: money(s.cost), color: 'var(--viz-3)' }))} />
          </Card>
          <Card title="Close to a limit" tip="Stores at 80% or more of their API requests, 90% of the SMS their package includes, or 70% of their storage. Offer an upgrade or a credit pack." link={{ href: '/admin/merchants', label: 'Merchants' }}>
            {near.length ? (
              <div className="an-rows">
                {near.slice(0, 5).map((s) => (
                  <Link key={s.id} className="an-row" href={'/admin/merchant?id=' + s.id + '&tab=resources'}>
                    <span className="us-name">{s.name}<small>{s.packageName}</small></span>
                    <span className="us-badges">{s.parts.map(([l, x]) => <StatusBadge key={l} tone={x >= 1 ? 'error' : 'warning'}>{l} {pct(x, 0)}</StatusBadge>)}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="an-empty">No store is close to a limit.</p>}
            {near.length > 5 ? <div className="an-foot"><span>{near.length - 5} more</span><Link href="/admin/reports/view?id=api-storage">See all</Link></div> : null}
          </Card>
        </div>
      </>
    );
  }

  return (
    <AdminShell active="analytics-usage" title="Usage">
      <style dangerouslySetInnerHTML={{ __html: AN_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        <AnHeader icon="gauge" title="Usage"
          about="What the stores use this month, added up across every live store: API requests, SMS, AI replies and product credits, WhatsApp, email and call minutes, and storage. Pick a measure to see 12 months of trend and the stores that use the most; stores close to a limit are listed so someone can offer an upgrade.">
          <button type="button" className="ix-btn" onClick={exportCsv} disabled={!u}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
        </AnHeader>
        {live ? <p className="an-meta" aria-live="polite">{monthLong(t)} so far · {u ? u.stores.length : 0} live stores</p> : null}
        {body}
      </div>
    </AdminShell>
  );
}
