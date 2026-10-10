'use client';
// Grid AI › Analytics — how the AI is doing, from lib/gridai/usage.js (the demo history plus this browser's turns).
//   Conversations  AI vs people per day, resolution, hand-overs, first reply time, channels
//   Sales          leads, AI orders and revenue, follow-ups that turned into orders
//   Quality        drafts accepted / edited / dismissed, errors, safety incidents
//   Cost           by agent and by model tier, cost per conversation and per AI order
// Shop-wide sales and order reports stay in Reports; this page is about the AI. Worked out after mount.

import React, { useState } from 'react';
import Link from 'next/link';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, Donut, StackBar, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { formatBDT } from '@/lib/format';
import { days, sumDays, USAGE_EVENT } from '@/lib/gridai/usage';
import { AGENTS } from '@/lib/gridai/agents';
import { TIERS } from '@/lib/gridai/models';
import { GaFrame, useLive } from './gaShared';

const CSS = CHART_CSS + `
.an-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4)}
.an-card{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.an-card h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.an-card p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.an-row{display:flex;align-items:center;gap:var(--space-4);flex-wrap:wrap}
.an-kv{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--space-3);margin:0;font-size:var(--text-sm)}
.an-kv dt{color:var(--text-muted)}
.an-kv dd{margin:0;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);text-align:right;font-variant-numeric:tabular-nums}
.an-span{grid-column:1 / -1}
@media (max-width:1023px){.an-grid{grid-template-columns:minmax(0,1fr)}}
`;
const CH = { facebook: ['Messenger', 'var(--viz-1)'], whatsapp: ['WhatsApp', 'var(--viz-2)'], instagram: ['Instagram', 'var(--viz-3)'], comments: ['Comments', 'var(--viz-4)'], web: ['Website chat', 'var(--viz-5)'] };
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const short = (t) => { const d = new Date(t); return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]; };

export default function Analytics() {
  const [span, setSpan] = useState(30);
  const data = useLive(() => ({ d30: days(30), d60: days(60) }), [USAGE_EVENT]);
  const ready = !!data;
  const list = ready ? data.d30.slice(-span) : [];
  const prevList = ready ? data.d60.slice(-2 * span, -span) : [];
  const s = ready ? sumDays(list) : null;
  const p = ready ? sumDays(prevList) : null;
  const delta = (a, b) => { if (!b) return ''; const v = Math.round(((a - b) / b) * 100); return (v >= 0 ? '+' : '') + v + '% on the previous ' + span + ' days'; };
  const chart = list.map((d) => ({ label: short(d.at), values: [d.aiHandled, d.human], line: d.aiOrders }));

  return (
    <GaFrame screen="AiAnalytics" active="ai-analytics" page="Analytics" css={CSS}>
      <ShopHeader icon="chart-column" title="AI analytics"
        about="How Grid AI is doing: the conversations it handles, the orders and leads it brings, how often the team accepts its drafts, safety and what it costs. Shop-wide sales, orders and customers stay in Reports."
        more={[{ label: 'Reports', href: '/reports-centre' }, { label: 'Usage & billing', href: '/ai-usage' }]}
        middle={<div className="gc-seg" role="group" aria-label="Period">{[7, 30].map((n) => <button key={n} type="button" className={'gc-seg__btn' + (span === n ? ' gc-seg__btn--active' : '')} aria-pressed={span === n} onClick={() => setSpan(n)}>{n} days</button>)}</div>} />
      <MetricStrip label={'Last ' + span + ' days'} items={[
        { label: 'AI-assisted conversations', value: ready ? (s.aiHandled + Math.round(s.accepted / 1.7)).toLocaleString('en-IN') : '—', sub: ready ? delta(s.aiHandled, p.aiHandled) : '', icon: 'bot' },
        { label: 'Resolved by GridAI', value: ready ? pct(s.aiHandled - s.escalations, s.convs) + '%' : '—', sub: ready ? 'Hand-over rate ' + pct(s.escalations, s.aiHandled) + '%' : '', icon: 'circle-check' },
        { label: 'AI orders', value: ready ? s.aiOrders.toLocaleString('en-IN') : '—', sub: ready ? formatBDT(s.aiRevenue) : '', icon: 'shopping-bag' },
        { label: 'Cost per conversation', value: ready ? '৳' + (s.cost / Math.max(1, s.convs)).toFixed(2) : '—', sub: ready ? formatBDT(s.cost) + ' in all' : '', icon: 'wallet' },
      ]} />

      <div className="an-grid">
        <section className="ix-card an-card an-span" aria-labelledby="an-c-h">
          <h2 id="an-c-h">Conversations: GridAI and people</h2>
          {ready ? <>
            <ColumnChart data={chart} series={[{ name: 'Handled by GridAI', color: 'var(--viz-1)' }, { name: 'Handled by people', color: 'var(--viz-6)' }]} line={{ name: 'AI orders', color: 'var(--viz-3)' }} label="Conversations by day" height={220} />
            <Legend items={[{ name: 'Handled by GridAI', color: 'var(--viz-1)' }, { name: 'Handled by people', color: 'var(--viz-6)' }, { name: 'AI orders', color: 'var(--viz-3)', kind: 'line' }]} />
          </> : <div style={{ minHeight: 240 }} aria-busy="true" />}
        </section>

        <section className="ix-card an-card" aria-labelledby="an-ch-h">
          <h2 id="an-ch-h">By channel</h2>
          {ready ? <div className="an-row">
            <Donut parts={Object.entries(s.byChannel).map(([k, v]) => ({ name: CH[k][0], value: v, color: CH[k][1] }))} total={s.convs.toLocaleString('en-IN')} totalLabel="conversations" label="Conversations by channel" />
            <Legend items={Object.entries(s.byChannel).map(([k, v]) => ({ name: CH[k][0], color: CH[k][1], value: pct(v, s.convs) + '%' }))} />
          </div> : null}
        </section>

        <section className="ix-card an-card" aria-labelledby="an-q-h">
          <h2 id="an-q-h">Copilot drafts</h2>
          {ready ? <>
            <StackBar parts={[{ name: 'Sent as written', value: s.accepted, color: 'var(--viz-1)' }, { name: 'Edited, then sent', value: s.edited, color: 'var(--viz-2)' }, { name: 'Dismissed', value: s.rejected, color: 'var(--viz-6)' }]} label="Copilot drafts" />
            <Legend items={[{ name: 'Sent as written', color: 'var(--viz-1)', value: pct(s.accepted, s.drafts) + '%' }, { name: 'Edited', color: 'var(--viz-2)', value: pct(s.edited, s.drafts) + '%' }, { name: 'Dismissed', color: 'var(--viz-6)', value: pct(s.rejected, s.drafts) + '%' }]} />
            <dl className="an-kv"><dt>Drafts written</dt><dd>{s.drafts.toLocaleString('en-IN')}</dd><dt>First reply, GridAI</dt><dd>{s.firstReply} s</dd><dt>First reply, people</dt><dd>{Math.round(s.humanReply / 60)} min</dd></dl>
          </> : null}
        </section>

        <section className="ix-card an-card" aria-labelledby="an-s-h">
          <h2 id="an-s-h">Conversational sales</h2>
          {ready ? <dl className="an-kv">
            <dt>Leads spotted</dt><dd>{s.leads.toLocaleString('en-IN')}</dd>
            <dt>Orders from chats</dt><dd>{s.aiOrders.toLocaleString('en-IN')}</dd>
            <dt>Chat to order</dt><dd>{pct(s.aiOrders, s.convs)}%</dd>
            <dt>Revenue from chats</dt><dd>{formatBDT(s.aiRevenue)}</dd>
            <dt>Follow-ups sent</dt><dd>{s.followups.toLocaleString('en-IN')}</dd>
            <dt>Follow-ups that ordered</dt><dd>{s.followConv} ({pct(s.followConv, s.followups)}%)</dd>
            <dt>AI cost per order</dt><dd>৳{(s.cost / Math.max(1, s.aiOrders)).toFixed(2)}</dd>
          </dl> : null}
        </section>

        <section className="ix-card an-card" aria-labelledby="an-o-h">
          <h2 id="an-o-h">Operations and safety</h2>
          {ready ? <dl className="an-kv">
            <dt>AI turns</dt><dd>{s.turns.toLocaleString('en-IN')}</dd>
            <dt>Tool calls</dt><dd>{s.toolCalls.toLocaleString('en-IN')}</dd>
            <dt>Average answer time</dt><dd>{(s.latency / 1000).toFixed(1)} s</dd>
            <dt>Model or tool errors</dt><dd>{s.errors}</dd>
            <dt>Hand-overs to people</dt><dd>{s.escalations.toLocaleString('en-IN')}</dd>
            <dt>Safety incidents</dt><dd>{s.unsafe}</dd>
          </dl> : null}
          <p><Link href="/ai-activity">Activity &amp; approvals</Link> has every action and hand-over.</p>
        </section>

        <section className="ix-card an-card" aria-labelledby="an-a-h">
          <h2 id="an-a-h">Cost by agent</h2>
          {ready ? <HBars rows={AGENTS.map((a, i) => ({ key: a.id, label: a.name, value: s.byAgent[a.id] || 0, text: formatBDT(Math.round(s.byAgent[a.id] || 0)), color: 'var(--viz-' + ((i % 8) + 1) + ')' })).sort((x, y) => y.value - x.value)} /> : null}
        </section>

        <section className="ix-card an-card" aria-labelledby="an-t-h">
          <h2 id="an-t-h">Turns by model tier</h2>
          {ready ? <>
            <StackBar parts={TIERS.map((t, i) => ({ name: t.tier + ' · ' + t.name, value: s.byTier[t.tier] || 0, color: 'var(--viz-' + (i + 1) + ')' }))} label="AI turns by model tier" />
            <Legend items={TIERS.map((t, i) => ({ name: t.tier + ' · ' + t.name, color: 'var(--viz-' + (i + 1) + ')', value: pct(s.byTier[t.tier] || 0, s.turns) + '%' }))} />
            <p>Most turns run on rules and the efficient tier; the reasoning tier is kept for business questions and hard complaints.</p>
          </> : null}
        </section>
      </div>
    </GaFrame>
  );
}
