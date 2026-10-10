'use client';
// Shared Grid AI pieces: the trace of one AI turn ("Why this answer": understood → agent → knowledge → tools → policy →
// model → decision), the run's meta line (model, tier, cost, time), product cards from the live catalogue, the order
// summary card, and the merchant assistant's answer blocks (text, figures, table, list, action).
// Used by the Inbox Copilot, Test AI, Activity and the assistant.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { formatBDT } from '@/lib/format';

export const GAI_CSS = `
.gx-trace{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.gx-trace li{position:relative;display:grid;grid-template-columns:24px minmax(0,1fr);column-gap:10px;padding:0 0 12px}
.gx-trace li:last-child{padding-bottom:0}
.gx-trace li:not(:last-child)::before{content:'';position:absolute;left:11px;top:24px;bottom:2px;width:2px;background:var(--border-subtle)}
.gx-trace__dot{display:grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.gx-trace__dot.is-tool{background:var(--fill-primary-soft);color:var(--primary)}
.gx-trace__dot.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.gx-trace__dot.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.gx-trace b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);line-height:24px}
.gx-trace span{display:block;font-size:var(--text-xs);color:var(--text-muted);line-height:1.5;overflow-wrap:anywhere}
.gx-risk{display:inline-block;margin-left:6px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.gx-meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:var(--text-xs);color:var(--text-muted)}
.gx-meta b{font-weight:var(--weight-medium);color:var(--text-body)}
.gx-cards{display:flex;gap:var(--space-2);overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.gx-cards::-webkit-scrollbar{display:none}
.gx-card{flex:0 0 172px;display:flex;flex-direction:column;gap:4px;padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.gx-card__img{display:grid;place-items:center;height:72px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.gx-card b{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gx-card__row{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:var(--text-xs)}
.gx-card__price{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gx-stock{font-size:var(--text-xs);color:var(--text-success)}.gx-stock.is-low{color:var(--text-warning)}.gx-stock.is-out{color:var(--text-danger)}
.gx-cards--mini .gx-card{flex:0 0 auto;flex-direction:row;align-items:center;gap:var(--space-2);max-width:260px;padding:6px 8px}
.gx-cards--mini .gx-card__img{width:32px;height:32px;flex:none}
.gx-cards--mini .gx-card>span:nth-child(2){display:flex;flex-direction:column;min-width:0}
.gx-cards--mini .gx-card b{-webkit-line-clamp:1}
.gx-cards--mini .ix-btn{flex:none}
.gx-oline{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-body)}
.gx-oline b{font-weight:var(--weight-medium);color:var(--text-heading)}
.gx-oline button{margin-left:auto;height:28px;padding:0 8px;border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);color:var(--primary);cursor:pointer}
.gx-order{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-sm)}
.gx-order__row{display:flex;justify-content:space-between;gap:var(--space-3)}
.gx-order__row span:first-child{color:var(--text-muted)}
.gx-order__row b{font-weight:var(--weight-medium);color:var(--text-heading);text-align:right}
.gx-order__miss{font-size:var(--text-xs);color:var(--text-warning)}
.gx-blocks{display:flex;flex-direction:column;gap:var(--space-2)}
.gx-text{margin:0;font-size:var(--text-sm);line-height:1.55;color:var(--text-body);white-space:pre-wrap}
.gx-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:var(--space-2)}
.gx-fig{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.gx-fig span{font-size:var(--text-xs);color:var(--text-muted)}
.gx-fig b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.gx-blocks h4{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gx-tbl{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.gx-tbl th{padding:6px 8px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);font-weight:var(--weight-medium);color:var(--text-body);text-align:left}
.gx-tbl td{padding:6px 8px;border-bottom:1px solid var(--border-subtle);color:var(--text-heading)}
.gx-tbl tr:last-child td{border-bottom:0}
.gx-tbl td:not(:first-child),.gx-tbl th:not(:first-child){text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.gx-tblwrap{overflow-x:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.gx-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.gx-list li+li{border-top:1px solid var(--border-subtle)}
.gx-list a{display:flex;flex-direction:column;gap:1px;padding:8px 10px;color:inherit;text-decoration:none}
.gx-list a:hover{background:var(--surface-subtle)}
.gx-list b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gx-list span{font-size:var(--text-xs);color:var(--text-muted)}
.gx-more{font-size:var(--text-xs);color:var(--text-muted)}
`;

const STEP_ICON = { input: 'message-square', understand: 'scan-search', agent: 'bot', knowledge: 'book-open', tool: 'wrench', policy: 'shield-check', model: 'cpu', decision: 'git-branch' };
/** The steps of one AI turn. */
export function Trace({ run }) {
  if (!run) return null;
  return (
    <ol className="gx-trace" aria-label="How GridAI got this answer">
      {run.steps.map((s, i) => (
        <li key={i}>
          <span className={'gx-trace__dot' + (s.kind === 'tool' ? ' is-tool' : '') + (s.ok === false ? ' is-bad' : s.kind === 'decision' ? ' is-ok' : '')} aria-hidden="true"><Icon name={s.ok === false ? 'circle-alert' : STEP_ICON[s.kind] || 'dot'} width="13" height="13" /></span>
          <div><b>{s.label}{s.risk ? <span className="gx-risk" style={{ display: 'inline-block' }}>Level {s.risk}</span> : null}</b><span>{s.detail}</span></div>
        </li>
      ))}
    </ol>
  );
}
/** Model, tier, tokens, cost and time of a turn. */
export function RunMeta({ run }) {
  if (!run) return null;
  return (
    <p className="gx-meta" style={{ margin: 0 }}>
      <span>Agent <b>{run.agentName || run.agent}</b></span>
      <span>Model <b>{run.model}</b></span>
      <span>Tier <b>{run.tier}</b></span>
      <span>Cost <b>৳{Number(run.cost || 0).toFixed(2)}</b></span>
      <span>Time <b>{(run.ms / 1000).toFixed(1)} s</b></span>
    </p>
  );
}
const STOCK = { in: ['In stock', ''], low: ['Few left', ' is-low'], out: ['Out of stock', ' is-out'] };
/** Product cards from the live catalogue (public fields only). */
export function ProductCards({ products, onSend, mini = false }) {
  if (!products || !products.length) return null;
  if (mini) {
    return (
      <div className="gx-cards gx-cards--mini" role="list" aria-label="Suggested products">
        {products.map((p) => (
          <div key={p.sku} className="gx-card" role="listitem">
            <span className="gx-card__img" aria-hidden="true"><Icon name="package" width="16" height="16" /></span>
            <span><b>{p.name}</b><span className="gx-card__row"><span className="gx-card__price">{formatBDT(p.price)}</span><span className={'gx-stock' + STOCK[p.stock][1]}>{STOCK[p.stock][0]}</span></span></span>
            {onSend ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" onClick={() => onSend(p)} aria-label={'Send the ' + p.name + ' card'} title="Send card"><Icon name="send" width="14" height="14" /></button> : null}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="gx-cards" role="list" aria-label="Suggested products">
      {products.map((p) => (
        <div key={p.sku} className="gx-card" role="listitem">
          <span className="gx-card__img" aria-hidden="true"><Icon name="package" width="22" height="22" /></span>
          <b>{p.name}</b>
          <span className="gx-card__row"><span className="gx-card__price">{formatBDT(p.price)}</span><span className={'gx-stock' + STOCK[p.stock][1]}>{STOCK[p.stock][0]}</span></span>
          {onSend ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onSend(p)}><Icon name="send" width="14" height="14" aria-hidden="true" />Send card</button> : null}
        </div>
      ))}
    </div>
  );
}
/** One line for an order being collected; Details opens the full summary. */
export function OrderLine({ order, open, onToggle }) {
  if (!order) return null;
  return (
    <div className="gx-oline" aria-label="Order draft">
      <Icon name="shopping-bag" width="14" height="14" aria-hidden="true" />
      <b>Order draft</b>
      <span>{order.item ? order.item.name + ' · ' + formatBDT(order.total) : 'No product yet'}</span>
      <span style={{ color: order.missing.length ? 'var(--text-warning)' : 'var(--text-success)' }}>{order.missing.length ? 'needs ' + order.missing.join(', ') : 'ready, waits for a yes'}</span>
      <button type="button" aria-expanded={open} onClick={onToggle}>{open ? 'Hide' : 'Details'}</button>
    </div>
  );
}
/** An order the AI is collecting. */
export function OrderSummary({ order }) {
  if (!order) return null;
  const row = (k, v) => <div className="gx-order__row"><span>{k}</span><b>{v || '—'}</b></div>;
  return (
    <div className="gx-order" aria-label="Order draft">
      {row('Product', order.item ? order.item.name + ' × ' + order.qty : '')}
      {row('Name', order.name)}
      {row('Phone', order.phone)}
      {row('Address', order.address)}
      {row('Delivery', order.zone + ' · ' + formatBDT(order.delivery))}
      {row('Payment', order.payment)}
      {row('Total', order.total ? formatBDT(order.total) : '')}
      {order.missing.length ? <span className="gx-order__miss">Still needed: {order.missing.join(', ')}</span> : <span className="gx-order__miss" style={{ color: 'var(--text-success)' }}>Complete · waits for the customer’s yes</span>}
    </div>
  );
}
/** The merchant assistant's answer. onAction(block) for action blocks that ask for approval. */
export function Blocks({ blocks, onAction }) {
  return (
    <div className="gx-blocks">
      {blocks.map((b, i) => {
        if (b.type === 'text') return <p key={i} className="gx-text">{b.text}</p>;
        if (b.type === 'figures') return <div key={i}>{b.title ? <h4 style={{ marginBottom: 6 }}>{b.title}</h4> : null}<div className="gx-figs">{b.items.map(([k, v]) => <div key={k} className="gx-fig"><span>{k}</span><b>{v}</b></div>)}</div></div>;
        if (b.type === 'table') return <div key={i}>{b.title ? <h4 style={{ marginBottom: 6 }}>{b.title}</h4> : null}<div className="gx-tblwrap"><table className="gx-tbl"><thead><tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody></table></div></div>;
        if (b.type === 'list') return <div key={i}><ul className="gx-list">{b.items.map((it, j) => <li key={j}><Link href={it.href}><b>{it.title}</b><span>{it.sub}</span></Link></li>)}</ul>{b.more ? <span className="gx-more">and {b.more} more</span> : null}</div>;
        if (b.type === 'action') return b.href
          ? <Link key={i} href={b.href} className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }}>{b.label}<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></Link>
          : <button key={i} type="button" className="ix-btn ix-btn--sm ix-btn--primary" style={{ alignSelf: 'flex-start' }} onClick={() => onAction && onAction(b)}><Icon name="shield-check" width="14" height="14" aria-hidden="true" />{b.label}</button>;
        return null;
      })}
    </div>
  );
}
