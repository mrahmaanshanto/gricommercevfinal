'use client';
// Grid AI › Usage & billing — what the AI costs: this month against the budget (and what happens at the limit), the
// forecast for the month, spend by day, by model and by agent, the plan's AI allowance, and the latest AI turns made in
// this browser (model, tokens, cost, outcome). AI is paid from the prepaid GridCommerce credits like SMS and WhatsApp
// (lib/platformCosts.js). Data: lib/gridai/usage.js, models.js. Worked out after mount.

import React from 'react';
import Link from 'next/link';
import { StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, CHART_CSS } from '@/components/charts/DashCharts';
import { formatBDT, formatDateTime } from '@/lib/format';
import { currentPlan } from '@/lib/plans';
import { days, sumDays, budgetState, getRuns, USAGE_EVENT } from '@/lib/gridai/usage';
import { getModels, modelFor, TIERS, MODELS_EVENT } from '@/lib/gridai/models';
import { AGENTS } from '@/lib/gridai/agents';
import { GaFrame, useLive } from './gaShared';

const CSS = CHART_CSS + `
.us-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.us-card{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.us-card h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.us-bar{height:10px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden;position:relative}
.us-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.us-bar b{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--text-heading);opacity:.5}
.us-bar.is-warn i{background:var(--warning)}.us-bar.is-over i{background:var(--error)}
.us-kv{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--space-3);margin:0;font-size:var(--text-sm)}
.us-kv dt{color:var(--text-muted)}
.us-kv dd{margin:0;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);text-align:right;font-variant-numeric:tabular-nums}
.us-note{margin:0;font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
@media (max-width:1023px){.us-grid{grid-template-columns:minmax(0,1fr)}}
`;
const OUT = { auto: ['Sent by GridAI', 'success'], suggest: ['Suggested', 'info'], accepted: ['Accepted', 'success'], edited: ['Edited', 'info'], dismissed: ['Dismissed', 'neutral'], person: ['Handed over', 'warning'], answered: ['Answered', 'success'], denied: ['Refused', 'warning'] };
// AI allowance included in each plan (taka a month); the rest comes from credits
const PLAN_AI = { starter: 1500, growth: 6000, business: 20000 };

export default function Usage() {
  const data = useLive(() => {
    const now = Date.now();
    const d = new Date(now);
    const first = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const n = Math.floor((now - first) / 864e5) + 1;
    const month = days(n, now);
    const inMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const s = sumDays(month);
    const plan = (() => { try { return currentPlan(); } catch { return { id: 'growth', name: 'Growth' }; } })();
    return { month, s, b: budgetState(now), forecast: Math.round((s.cost / Math.max(1, n - 1 + (now - startOf(now)) / 864e5)) * inMonth), m: getModels(), runs: getRuns().slice(0, 25), plan, inMonth };
  }, [USAGE_EVENT, MODELS_EVENT]);
  const ready = !!data;
  const allowance = ready ? PLAN_AI[data.plan.id] || 6000 : 0;
  const tierCost = ready ? TIERS.filter((t) => t.tier).map((t) => ({ t, model: modelFor(t.tier, data.m), turns: data.s.byTier[t.tier] || 0 })) : [];

  return (
    <GaFrame screen="AiUsage" active="ai-usage" page="Usage & billing" css={CSS}>
      <ShopHeader icon="wallet" title="Usage & billing"
        about="Grid AI is paid from your prepaid GridCommerce credits, like SMS and WhatsApp, and shows in Income & expenses as one line a month. Your plan includes an AI allowance; past it, credits are used. Set a monthly budget in Models & limits: at the alert you are warned, at the limit Autopilot stops and Copilot drafts go on."
        secondary={[{ label: 'Models & limits', href: '/ai-models' }]}
        more={[{ label: 'Top up credits', href: '/credit-wallet' }, { label: 'Subscription', href: '/subscription' }]} />
      <MetricStrip label="This month" items={[
        { label: 'Spent this month', value: ready ? formatBDT(data.b.spent) : '—', sub: ready ? data.b.pct + '% of the budget' : '', icon: 'wallet' },
        { label: 'Forecast for the month', value: ready ? formatBDT(data.forecast) : '—', sub: ready ? (data.forecast > data.b.budget ? 'over the budget' : 'within the budget') : '', icon: 'trending-up' },
        { label: 'AI turns', value: ready ? data.s.turns.toLocaleString('en-IN') : '—', sub: ready ? '৳' + (data.s.cost / Math.max(1, data.s.turns)).toFixed(2) + ' each' : '', icon: 'bot' },
        { label: 'Cost per conversation', value: ready ? '৳' + (data.s.cost / Math.max(1, data.s.convs)).toFixed(2) : '—', icon: 'message-square' },
      ]} />
      <div className="us-grid">
        <section className="ix-card us-card" aria-labelledby="us-day-h">
          <h2 id="us-day-h">Spend by day</h2>
          {ready ? <ColumnChart data={data.month.map((d) => ({ label: String(new Date(d.at).getDate()), values: [d.cost] }))} series={[{ name: 'AI cost', color: 'var(--viz-1)' }]} fmt={(v) => '৳' + Math.round(v)} label="AI cost by day" height={200} /> : <div style={{ minHeight: 220 }} aria-busy="true" />}
        </section>
        <section className="ix-card us-card" aria-labelledby="us-b-h">
          <h2 id="us-b-h">Budget</h2>
          {ready ? <>
            <div className={'us-bar' + (data.b.state === 'warn' ? ' is-warn' : data.b.state === 'over' ? ' is-over' : '')} role="progressbar" aria-label="Budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(100, data.b.pct)}><i style={{ width: Math.min(100, data.b.pct) + '%' }} /><b style={{ left: data.m.alertAt + '%' }} aria-hidden="true" /></div>
            <dl className="us-kv">
              <dt>Monthly budget</dt><dd>{formatBDT(data.b.budget)}</dd>
              <dt>Alert at</dt><dd>{data.m.alertAt}%</dd>
              <dt>At the limit</dt><dd style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-medium)' }}>{data.m.atLimit === 'copilot' ? 'Copilot only' : 'AI stops'}</dd>
              <dt>{data.plan.name} plan allowance</dt><dd>{formatBDT(allowance)}</dd>
              <dt>From credits this month</dt><dd>{formatBDT(Math.max(0, data.b.spent - allowance))}</dd>
            </dl>
            <Link className="ix-btn ix-btn--sm" href="/ai-models" style={{ alignSelf: 'flex-start' }}>Change the budget</Link>
          </> : null}
        </section>
      </div>
      <div className="us-grid">
        <section className="ix-card" aria-labelledby="us-m-h">
          <div className="ix-card__head"><h2 id="us-m-h">By model</h2></div>
          {ready ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static">
                <caption className="sr-only">Cost by model tier</caption>
                <thead><tr><th scope="col">Tier</th><th scope="col">Model now</th><th scope="col" className="ix-num">Turns</th><th scope="col" className="ix-num">Price in / out (per 1M)</th></tr></thead>
                <tbody>
                  <tr><td>0 · Rules</td><td className="ix-muted">No model</td><td className="ix-num">{(data.s.byTier[0] || 0).toLocaleString('en-IN')}</td><td className="ix-num">Free</td></tr>
                  {tierCost.map(({ t, model, turns }) => <tr key={t.tier}><td>{t.tier} · {t.name}</td><td>{model.name}{model.fallback ? <small className="ix-muted"> (fallback)</small> : null}</td><td className="ix-num">{turns.toLocaleString('en-IN')}</td><td className="ix-num">${model.in} / ${model.out}</td></tr>)}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
        <section className="ix-card us-card" aria-labelledby="us-a-h">
          <h2 id="us-a-h">By agent this month</h2>
          {ready ? <dl className="us-kv">{AGENTS.map((a) => <React.Fragment key={a.id}><dt>{a.name}</dt><dd>{formatBDT(Math.round(data.s.byAgent[a.id] || 0))}</dd></React.Fragment>)}</dl> : null}
        </section>
      </div>
      <section className="ix-card" aria-labelledby="us-r-h">
        <div className="ix-card__head"><h2 id="us-r-h">Latest AI turns in this browser</h2></div>
        {!ready ? null : !data.runs.length ? <div className="ix-empty"><EmptyState icon="bot" title="No AI turns yet" body="Open a chat in the Inbox or ask the assistant; each turn shows here with its cost." /></div> : (
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static">
              <caption className="sr-only">Latest AI turns</caption>
              <thead><tr><th scope="col">When</th><th scope="col">Agent</th><th scope="col">Model</th><th scope="col" className="ix-num">Tokens in / out</th><th scope="col" className="ix-num">Cost</th><th scope="col">Outcome</th></tr></thead>
              <tbody>{data.runs.map((r) => (
                <tr key={r.id}><td className="ix-muted">{formatDateTime(new Date(r.at))}</td><td>{(AGENTS.find((a) => a.id === r.agent) || { name: r.agent }).name}</td><td className="ix-muted">{r.model}</td><td className="ix-num">{(r.tokensIn || 0).toLocaleString('en-IN')} / {r.tokensOut || 0}</td><td className="ix-num">৳{Number(r.cost || 0).toFixed(2)}</td><td><StatusBadge tone={(OUT[r.outcome] || ['', 'neutral'])[1]}>{(OUT[r.outcome] || [r.outcome])[0]}</StatusBadge></td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
        <p className="us-note" style={{ padding: 'var(--space-3) var(--space-4)' }}>Test AI turns are not billed and don’t show here.</p>
      </section>
    </GaFrame>
  );
}
const startOf = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
