'use client';
// GridAI › Performance (/admin/gridai/performance) — how GridCommerce's own assistant is doing with leads and merchants.
//   Figures (5)     AI conversations, resolution rate, human escalations, failed responses, estimated cost
//   Charts          conversations per day (resolved / handed to a person / failed), feedback (thumbs) trend
//   Lists           top unanswered questions (at most five, each "Add FAQ"), cost by channel, recent conversations
//                   with their rating — a row opens the read-only transcript in a side panel
// Period: last 7 or 30 days, compared with the period before. Data: lib/admin/gridai.js › performance() (one summary
// row per day, ~2,000 conversations in 30 days; recent conversations with transcripts). Worked out after the data loads.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip, KV, Pager } from '@/components/ui/IndexKit';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ColumnChart, Sparkline, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { formatBDT } from '@/lib/format';
import { performance, channelLabel, OUTCOME_WORD, OUTCOME_TONE } from '@/lib/admin/gridai';
import { ago, dm, dmy, hm, num } from '@/lib/platform/util';
import { AdminShell } from '../AdminShell';
import { GA_CSS, useGridAi, Skeleton, ErrorCard, Bubble, FaqSheet, pct } from './gridaiShared';

const CSS = `
.pf-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pf-top .ix-head{flex:1 1 auto}
.pf-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.pf-grid--even{grid-template-columns:repeat(2,minmax(0,1fr))}
.pf-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.pf-big{display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--space-2);margin:0 0 var(--space-3);font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pf-big small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.pf-foot{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.pf-foot b{margin-left:4px;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pf-q{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.pf-q li{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px 0;border-top:1px solid var(--border-subtle)}
.pf-q li:first-child{border-top:0}
.pf-q li>span{flex:1;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.pf-q small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pf-n{flex:none;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pf-thumb{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs)}
.pf-thumb.is-up{color:var(--text-success)}
.pf-thumb.is-down{color:var(--text-danger)}
.pf-tx{display:flex;flex-direction:column;gap:var(--space-4)}
.pf-tx .ga-log{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
button.ix-pitem{width:100%;border:0;border-bottom:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;cursor:pointer}
.ix-plist>li:last-child>button.ix-pitem{border-bottom:0}
.ix-table tbody tr{cursor:pointer}
@media (max-width:1023px){.pf-grid,.pf-grid--even{grid-template-columns:minmax(0,1fr)}}
`;

const PERIODS = [[7, 'Last 7 days'], [30, 'Last 30 days']];
const PAGE = 10;
const money = (n) => formatBDT(Math.round(n || 0));
const change = (x) => (x == null ? null : (x >= 0 ? '▲ ' : '▼ ') + Math.abs(x * 100).toFixed(1) + '%');
const points = (x) => (x == null ? null : (x >= 0 ? '▲ ' : '▼ ') + Math.abs(x * 100).toFixed(1) + ' pts');
const Thumb = ({ r }) => (r === 'up' ? <span className="pf-thumb is-up"><Icon name="thumbs-up" width="14" height="14" aria-hidden="true" />Good</span>
  : r === 'down' ? <span className="pf-thumb is-down"><Icon name="thumbs-down" width="14" height="14" aria-hidden="true" />Bad</span> : <span className="ix-muted">Not rated</span>);

function Card({ title, tip, link, children }) {
  return (
    <section className="ix-card" aria-label={title}>
      <div className="ix-card__head"><h2>{title}{tip ? <> <InfoTip text={tip} /></> : null}</h2>{link ? <Link href={link.href}>{link.label}</Link> : null}</div>
      <div className="pf-body">{children}</div>
    </section>
  );
}

export default function AiPerformance() {
  const { data: d, t, live } = useGridAi();
  const [n, setN] = useState(30);
  const [page, setPage] = useState(0);
  const [rate, setRate] = useState('all');
  const [open, setOpen] = useState(null);
  const [faq, setFaq] = useState(null);
  const [retry, setRetry] = useState(0);

  let p = null, failed = false;
  if (live) { try { p = performance(d, t, n); } catch { failed = true; } }

  const exportCsv = () => {
    if (!p) return;
    downloadCsv(`gridai-performance-${n}-days.csv`, [
      ['GridAI performance', PERIODS.find((x) => x[0] === n)[1]], [],
      ['Day', 'Conversations', 'Resolved by AI', 'Handed to a person', 'Failed', 'Thumbs up', 'Thumbs down', 'Tokens', 'Cost (BDT)', 'Inbox', 'Website chat', 'WhatsApp'],
      ...p.perDay.map((x) => [dmy(x.day), x.total, x.resolved, x.escalated, x.failed, x.up, x.down, x.tokens, x.cost.toFixed(2), x.channels.inbox, x.channels.web, x.channels.whatsapp]),
    ]);
    toast('Performance exported');
  };

  const header = (
    <div className="pf-top">
      <header className="ix-head">
        <h1 className="ix-head__title"><Icon name="chart-no-axes-combined" width="18" height="18" aria-hidden="true" /><span>Performance</span></h1>
        <span className="gc-pagehead__about" hidden>How GridAI is doing with leads and merchants: conversations, how many it solved by itself, how many went to a person, failed answers, cost, feedback, the questions it could not answer and every recent conversation with its transcript.</span>
      </header>
      <div className="ix-head__actions">
        <select className="ix-pick" aria-label="Period" value={n} onChange={(e) => { setN(+e.target.value); setPage(0); }}>{PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <button type="button" className="ix-btn" onClick={exportCsv} disabled={!p}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
      </div>
    </div>
  );

  let body;
  if (!live) body = <Skeleton label="Loading GridAI performance" />;
  else if (failed || !p) body = <ErrorCard text="The figures could not be worked out." onRetry={() => setRetry(retry + 1)} />;
  else {
    const f = p.figs;
    const days = p.perDay.map((x) => ({ label: dm(x.day), title: dmy(x.day), values: [x.resolved, x.escalated, x.failed] }));
    const sat = p.perDay.map((x) => (x.up + x.down ? Math.round((x.up / (x.up + x.down)) * 100) : 0));
    const recent = p.recent.filter((c) => rate === 'all' || (rate === 'none' ? !c.rating : c.rating === rate));
    const pages = Math.max(1, Math.ceil(recent.length / PAGE));
    const at = Math.min(page, pages - 1);
    const rows = recent.slice(at * PAGE, at * PAGE + PAGE);
    body = (<>
      <MetricStrip label={'Key figures, last ' + n + ' days'} items={[
        { label: 'AI conversations', value: num(f.total), sub: change(f.change.total), icon: 'messages-square' },
        { label: 'Resolution rate', value: pct(f.rate), sub: points(f.change.rate), icon: 'circle-check' },
        { label: 'Human escalations', value: num(f.escalated), sub: change(f.change.escalated), icon: 'user-round' },
        { label: 'Failed responses', value: num(f.failed), sub: change(f.change.failed) },
        { label: 'Estimated cost', value: money(f.cost), sub: change(f.change.cost) },
      ]} />

      <div className="pf-grid">
        <Card title="Conversations per day" tip="Resolved: GridAI answered and nobody needed a person. Handed to a person: a handoff rule or an approval. Failed: no useful answer and no handoff.">
          <ColumnChart key={'cv' + n} label={'GridAI conversations per day, last ' + n + ' days'} data={days} height={220}
            series={[{ name: 'Resolved by AI', color: 'var(--viz-1)' }, { name: 'Handed to a person', color: 'var(--viz-4)' }, { name: 'Failed', color: 'var(--viz-8)' }]} now={days.length - 1} />
          <div style={{ marginTop: 'var(--space-3)' }}><Legend items={[{ name: 'Resolved by AI', color: 'var(--viz-1)', value: num(f.resolved) }, { name: 'Handed to a person', color: 'var(--viz-4)', value: num(f.escalated) }, { name: 'Failed', color: 'var(--viz-8)', value: num(f.failed) }]} /></div>
        </Card>
        <Card title="Feedback" tip="People rate an answer with a thumb up or down at the end of a chat.">
          <p className="pf-big">{pct(f.satisfaction)}<small>rated good</small></p>
          <Sparkline key={'sat' + n} label="Rated good, % per day" values={sat} labels={p.perDay.map((x) => dmy(x.day))} fmt={(v) => v + '%'} height={64} color="var(--viz-3)" />
          <div className="pf-foot">
            <span><Icon name="thumbs-up" width="12" height="12" aria-hidden="true" /> Good<b>{num(f.up)}</b></span>
            <span><Icon name="thumbs-down" width="12" height="12" aria-hidden="true" /> Bad<b>{num(f.down)}</b></span>
            <span>Rated<b>{pct(f.total ? (f.up + f.down) / f.total : 0)}</b></span>
          </div>
        </Card>
      </div>

      <div className="pf-grid pf-grid--even">
        <Card title="Top unanswered questions" link={{ href: '/admin/gridai?tab=faqs', label: 'FAQs' }}>
          {!p.unanswered.length ? <p className="ix-muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>GridAI had an answer for everything asked.</p> : (
            <ul className="pf-q">
              {p.unanswered.map((u) => (
                <li key={u.id}>
                  <span>{u.q}<small>Last asked {ago(u.last, t)}</small></span>
                  <span className="pf-n" aria-label={u.count + ' times'}>{u.count}×</span>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => setFaq({ q: u.q, a: '', topic: 'Other', fromUnanswered: u.id })}>Add FAQ</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Cost by channel" tip="Estimated from the tokens each conversation used.">
          <HBars rows={p.channels.map((c, i) => ({ key: c.key, label: c.label, sub: num(c.conv) + ' conversations', value: c.cost, text: money(c.cost), color: ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)'][i] }))} />
          <div className="pf-foot">
            <span>Tokens<b>{(f.tokens / 1e6).toFixed(2)} M</b></span>
            <span>Per conversation<b>৳{f.perConv.toFixed(2)}</b></span>
          </div>
        </Card>
      </div>

      <section className="ix-card" aria-label="Recent conversations">
        <div className="ix-bar">
          <h2 style={{ flex: 1, margin: '0 0 0 6px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>Recent conversations</h2>
          <span className="ix-tools">
            <select className="ix-pick" aria-label="Rating" value={rate} onChange={(e) => { setRate(e.target.value); setPage(0); }}>
              <option value="all">All ratings</option><option value="up">Rated good</option><option value="down">Rated bad</option><option value="none">Not rated</option>
            </select>
          </span>
        </div>
        {!rows.length ? <div className="ix-empty"><EmptyState icon="messages-square" title="No conversations with this rating" actionLabel="Show all" onAction={() => setRate('all')} /></div> : (<>
          <ul className="ix-plist" aria-label="Recent conversations">
            {rows.map((c) => (
              <li key={c.id}><button type="button" className="ix-pitem" onClick={() => setOpen(c.id)}>
                <span className="ix-pitem__top"><b>{c.who}{c.shop ? ' · ' + c.shop : ''}</b><StatusBadge tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_WORD[c.outcome]}</StatusBadge></span>
                <span className="ix-pitem__mid">{c.topic} · {channelLabel(c.channel)} · {ago(c.at, t)}{c.rating ? ' · rated ' + (c.rating === 'up' ? 'good' : 'bad') : ''}</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Recent GridAI conversations</caption>
              <thead><tr><th scope="col">Person</th><th scope="col">Topic</th><th scope="col">Channel</th><th scope="col">Outcome</th><th scope="col">Rating</th><th scope="col">When</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} onClick={(e) => { if (!e.target.closest('a,button')) setOpen(c.id); }}>
                    <td><button type="button" className="ga-name" onClick={() => setOpen(c.id)}>{c.who}</button><small className="ga-sub">{c.shop || 'Lead'}</small></td>
                    <td>{c.topic}</td>
                    <td>{channelLabel(c.channel)}</td>
                    <td><StatusBadge tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_WORD[c.outcome]}</StatusBadge></td>
                    <td><Thumb r={c.rating} /></td>
                    <td className="ix-muted">{ago(c.at, t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <Pager label={recent.length ? `${at * PAGE + 1}–${Math.min(recent.length, at * PAGE + PAGE)} of ${recent.length}` : '0'} atStart={at === 0} atEnd={at >= pages - 1} prev={() => setPage(at - 1)} next={() => setPage(at + 1)} />
      </section>
    </>);
  }

  const c = open && live ? d.recent.find((x) => x.id === open) : null;
  return (
    <AdminShell active="ai-performance">
      <style dangerouslySetInnerHTML={{ __html: GA_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!c} title={c ? 'Conversation with ' + c.who : ''} onClose={() => setOpen(null)}>
        {c ? (
          <div className="pf-tx">
            <KV rows={[
              ['Person', c.shopId ? <Link key="m" href={'/admin/merchant?id=' + c.shopId}>{c.who} · {c.shop}</Link> : c.who + ' · lead'],
              ['Channel', channelLabel(c.channel)], ['When', dmy(c.at) + ' · ' + hm(c.at)],
              ['Outcome', <StatusBadge key="o" tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_WORD[c.outcome]}</StatusBadge>],
              ['Rating', <Thumb key="r" r={c.rating} />], ['Answered from', c.source], c.staff ? ['Taken over by', c.staff] : null,
              ['Tokens · cost', num(c.tokens) + ' · ৳' + c.cost.toFixed(2)],
            ]} />
            <div className="ga-log" aria-label="Transcript">
              {c.messages.map((m, i) => <Bubble key={i} m={m} name={m.r === 'ai' ? 'GridAI' : m.r === 'staff' ? c.staff || 'Staff' : c.who} time={hm(m.at)} />)}
            </div>
          </div>
        ) : null}
      </Sheet>
      <FaqSheet faq={faq} onClose={() => setFaq(null)} />
    </AdminShell>
  );
}
