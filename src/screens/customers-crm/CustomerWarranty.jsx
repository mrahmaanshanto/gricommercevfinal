'use client';
// CustomerWarranty — the Warranty card on a customer's profile: every item they bought (online or at the counter) that
// comes with a warranty, with the days of cover left, until when, the IMEI / serial number and where to claim
// (lib/customerWarranty.js). Covered items come first, ending soon (30 days or less) at the top; ended ones after.
// "Log service" records a warranty service request for an item; it shows on the order page under the item.
// `limit` keeps the card short (Overview); without it every item is listed (Orders area).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { warrantyItems, requestService, getClaims, CLAIMS_EVENT } from '@/lib/customerWarranty';

const TONE = { active: 'success', ending: 'warning', expired: 'neutral' };
const STATE = { active: 'Covered', ending: 'Ending soon', expired: 'Ended' };

const CSS = `
.cw-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column}
.cw-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px var(--space-3);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.cw-item:first-child{border-top:0;padding-top:0}
.cw-name{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cw-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cw-id{font-family:var(--font-data)}
.cw-days{text-align:right}
.cw-days b{display:block;font-family:var(--font-data);font-size:var(--text-md,var(--text-sm));font-weight:var(--weight-semibold);color:var(--text-heading)}
.cw-bar{grid-column:1/-1;height:4px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.cw-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--success)}
.cw-bar.is-ending i{background:var(--warning)}
.cw-acts{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.cw-form{grid-column:1/-1;display:flex;flex-direction:column;gap:var(--space-2)}
`;

export default function CustomerWarranty({ phones = [], name = '', limit }) {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [ask, setAsk] = useState(null);   // { key, problem }
  useEffect(() => {
    setReady(true);
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(CLAIMS_EVENT, bump);
    return () => window.removeEventListener(CLAIMS_EVENT, bump);
  }, []);
  if (!ready) return null;
  void tick;
  // every number the customer has; an item is listed once
  const seen = new Set();
  const all = phones.flatMap((p) => warrantyItems(p)).filter((x) => (seen.has(x.key) ? false : seen.add(x.key)));
  if (!all.length) return null;
  const covered = all.filter((x) => x.state !== 'expired');
  const shown = limit ? covered.slice(0, limit) : all;
  const claims = getClaims();
  const log = (it) => {
    if (!ask.problem.trim()) { toast('Write what is wrong with it', { tone: 'error' }); return; }
    const c = requestService(it, { problem: ask.problem, phone: phones[0], name });
    setAsk(null);
    toast(`Warranty service ${c.id} logged for ${it.name}`);
  };

  return (
    <section className="ix-card" aria-labelledby="cw-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="ix-card__head"><h2 id="cw-h">Warranty</h2><span className="cw-sub">{covered.length} covered{all.length > covered.length ? ` · ${all.length - covered.length} ended` : ''}</span></header>
      <div className="ix-card__body">
        {!shown.length ? <p className="cw-sub" style={{ margin: 0 }}>No item is under warranty now.</p> : (
          <ul className="cw-list">
            {shown.map((it) => {
              const left = it.total ? Math.max(0, Math.min(100, Math.round((it.days / it.total) * 100))) : 0;
              const asked = claims.find((c) => c.order === it.order && c.item === it.name);
              return (
                <li key={it.key} className="cw-item">
                  <div style={{ minWidth: 0 }}>
                    <span className="cw-name">{it.name}{it.qty > 1 ? ` × ${it.qty}` : ''}</span>
                    <span className="cw-sub">{it.label} · bought {formatDate(it.start)} · <Link href={'/order-detail?id=' + encodeURIComponent(it.order)} className="cw-id">{it.order}</Link></span>
                    {it.serials.length ? <span className="cw-sub cw-id">{(it.serials.every((x) => /^\d{15}$/.test(x)) ? 'IMEI ' : 'Serial ') + it.serials.join(', ')}</span> : null}
                  </div>
                  <div className="cw-days">
                    <b>{it.state === 'expired' ? 'Ended' : `${it.days} ${it.days === 1 ? 'day' : 'days'} left`}</b>
                    <span className="cw-sub">{it.state === 'expired' ? formatDate(it.until) : 'until ' + formatDate(it.until)}</span>
                  </div>
                  {it.state !== 'expired' ? <div className={'cw-bar' + (it.state === 'ending' ? ' is-ending' : '')} aria-hidden="true"><i style={{ width: left + '%' }} /></div> : null}
                  <div className="cw-acts">
                    <StatusBadge tone={TONE[it.state]}>{STATE[it.state]}</StatusBadge>
                    <span className="cw-sub">Claim at {it.claim}</span>
                    {asked ? <StatusBadge tone="warning" icon="wrench">Service logged {formatDate(asked.at)}</StatusBadge>
                      : it.state !== 'expired' && !(ask && ask.key === it.key) ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setAsk({ key: it.key, problem: '' })}><Icon name="wrench" width="16" height="16" aria-hidden="true" />Log service</button> : null}
                  </div>
                  {ask && ask.key === it.key ? (
                    <div className="cw-form">
                      <label className="gc-label" htmlFor={'cw-p-' + it.key}>What is wrong with it?</label>
                      <textarea id={'cw-p-' + it.key} className="gc-input" rows={2} value={ask.problem} onChange={(e) => setAsk({ ...ask, problem: e.target.value })} placeholder="For example: the screen flickers" />
                      <span style={{ display: 'flex', gap: 'var(--space-2)' }}><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => log(it)}>Log service</button><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setAsk(null)}>Cancel</button></span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
