'use client';
// Settlements — money that payment gateways (bKash, Nagad, SSLCOMMERZ, EPS), the card machine and
// couriers (Pathao, Steadfast, RedX, Carrybee) collected for the shop and pay out later.
//   Coming in   expected payouts by the working day they should arrive (late ones first), and
//               wallets you withdraw from yourself (EPS). Tick a payout off when it lands, or give
//               the new date they promised; a different amount is explained with a reason.
//   Partners    what each partner holds now, its payout rule and fee
//   Paid out    payouts that arrived, with any difference
//   Needs a look  payouts that arrived with a different amount
// ?payout=<id> opens that payout · ?tab=partners|paid|review
// Front end only: rules and items live in src/lib/settlements.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { getPartners, getPayouts, getWallets, heldBy, clockNow, startOfDay, closedBetween, ruleText, feeText, weekendText } from '@/lib/settlements';
import { AccPage, PayoutDialog, WithdrawDialog, useBooks, money, dayLabel, dayWords, shortDate, daysText, accName, accBrand } from './accShared';

const TABS = [['partners', 'Partners'], ['paid', 'Paid out'], ['review', 'Needs a look']];
const CSS = `
.st-group + .st-group{border-top:1px solid var(--border-subtle)}
.st-ghead{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-5);background:var(--surface-subtle)}
.st-ghead h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.st-ghead span{font-size:var(--text-xs);color:var(--text-muted)}
.st-ghead .st-gsum{margin-left:auto;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.st-ghead.is-late{background:var(--fill-error-soft)}
.st-ghead.is-late h3{color:var(--text-danger)}
.st-row{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) auto auto;align-items:center;gap:var(--space-4);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.st-ghead + .st-row{border-top:0}
.st-name{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.st-name b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.st-name small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.st-into{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-body);min-width:0}
.st-into span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-amt{text-align:right;font-family:var(--font-data);font-variant-numeric:tabular-nums;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.st-amt small{display:block;font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.st-acts{display:flex;gap:var(--space-2);justify-content:flex-end}
.st-badges{display:inline-flex;gap:6px;margin-left:6px;vertical-align:middle}
.st-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4)}
.st-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.st-partners{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-5)}
.st-pcard{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.st-pcard dl{display:grid;grid-template-columns:auto 1fr;gap:4px var(--space-3);margin:0;font-size:var(--text-xs)}
.st-pcard dt{color:var(--text-muted)}
.st-pcard dd{margin:0;text-align:right;color:var(--text-heading);font-weight:var(--weight-medium)}
.st-held{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.st-empty{padding:var(--space-6) var(--space-5);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:900px){.st-row{grid-template-columns:minmax(0,1fr) auto;row-gap:var(--space-2)}.st-into{grid-column:1}.st-acts{grid-column:1 / -1;justify-content:flex-start}}
`;

function statusBadges(p, now) {
  const out = [];
  if (p.late) out.push(<span key="late" className="gc-badge gc-badge--error">Overdue {Math.max(1, Math.round((startOfDay(now) - p.due) / 864e5))}d</span>);
  if (p.status === 'delayed') out.push(<span key="del" className="gc-badge gc-badge--warning">Delayed · was {shortDate(p.date)}</span>);
  return out.length ? <span className="st-badges">{out}</span> : null;
}

export default function Settlements() {
  const tick = useBooks();
  const [now, setNow] = useState(0);
  const [tab, setTab] = useState('partners');
  const [open, setOpen] = useState(null);      // { pay, mode }
  const [wallet, setWallet] = useState(null);

  const data = useMemo(() => {
    if (!tick) return { pays: [], wallets: [], partners: [] };
    const t = clockNow();
    return { pays: getPayouts(t), wallets: getWallets(), partners: getPartners(), t };
  }, [tick]);
  useEffect(() => { if (data.t) setNow(data.t); }, [data.t]);

  // ?payout=<id> and ?tab=, once the books are read
  const booted = useRef(false);
  useEffect(() => {
    if (!tick || booted.current) return;
    booted.current = true;
    const q = new URLSearchParams(window.location.search);
    const want = q.get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
    const id = q.get('payout');
    if (id) { const p = getPayouts().find((x) => x.id === id); if (p && p.status !== 'received') setOpen({ pay: p, mode: 'arrived' }); }
  }, [tick]);
  const pickTab = (id) => {
    setTab(id);
    const u = new URL(window.location.href); u.searchParams.set('tab', id); u.searchParams.delete('payout');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const today = startOfDay(now || Date.now());
  const openPays = data.pays.filter((p) => p.status === 'expected' || p.status === 'delayed');
  const late = openPays.filter((p) => p.late || p.due < today);
  const upcoming = openPays.filter((p) => !(p.late || p.due < today));
  const groups = [];
  if (late.length) groups.push({ key: 'late', label: 'Overdue', sub: 'Should have arrived already', list: late });
  upcoming.forEach((p) => {
    let g = groups.find((x) => x.key === p.due);
    if (!g) { g = { key: p.due, label: dayLabel(p.due, now), sub: shortDate(p.due), list: [] }; groups.push(g); }
    g.list.push(p);
  });
  groups.forEach((g) => {
    if (g.key === 'late' || g.key <= today) return;
    const closed = closedBetween(today, g.key);
    if (closed.length) g.note = 'no payouts on ' + [...new Set(closed.map((c) => c[1]))].join(' or ');
  });
  const received = data.pays.filter((p) => p.status === 'received').sort((a, b) => (b.at || b.due) - (a.at || a.due));
  const review = data.pays.filter((p) => p.status === 'review');
  const sum = (l) => l.reduce((a, p) => a + p.net, 0);
  const held = data.partners.reduce((a, p) => a + heldBy(p.id), 0);
  const todayList = upcoming.filter((p) => p.due === today);
  const walletNet = data.wallets.reduce((a, w) => a + w.net, 0);
  const counts = { partners: data.partners.length, paid: received.length, review: review.length };
  const close = () => { setOpen(null); const u = new URL(window.location.href); if (u.searchParams.has('payout')) { u.searchParams.delete('payout'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } };

  const row = (p) => (
    <div key={p.id} className="st-row">
      <div className="st-name">
        <BrandLogo brand={p.p.brand} size={40} />
        <span><b>{p.p.short}{statusBadges(p, now)}</b><small>{p.items.length} payment{p.items.length === 1 ? '' : 's'} from {daysText(p.days)}{p.status === 'delayed' ? ' · they said ' + dayWords(p.due, now) : ''}</small></span>
      </div>
      <div className="st-into"><BrandLogo brand={accBrand(p.account)} size={24} decorative /><span>into {accName(p.account)}</span></div>
      <div className="st-amt">{money(p.net)}<small>{money(p.gross)} − {money(p.fee + p.charge)}</small></div>
      <div className="st-acts">
        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setOpen({ pay: p, mode: 'arrived' })} aria-label={`${p.p.short} ${money(p.net)} arrived`}><Icon name="check" width="16" height="16" aria-hidden="true" /> Arrived</button>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setOpen({ pay: p, mode: 'later' })} aria-label={`${p.p.short} ${money(p.net)} not arrived yet`}>Not yet</button>
      </div>
    </div>
  );

  return (
    <AccPage screen="Settlements" active="acc-settle" page="Payouts" title="Payouts" css={CSS}
      description="Money that payment gateways, the card machine and couriers collected for you and pay out later. See what arrives when, and tick it off when it lands."
      actions={<>
        <Link href="/account-setup?tab=partners" className="gc-btn gc-btn--neutral"><Icon name="sliders-horizontal" width="18" height="18" aria-hidden="true" /> Payout rules</Link>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => window.dispatchEvent(new CustomEvent('gc:check'))}><Icon name="list-checks" width="18" height="18" aria-hidden="true" /> Check today’s payouts</button>
      </>}>
      <div className="gc-kpis gc-kpis--tight">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="hourglass" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">With partners now</p><p className="gc-kpi__value">{money(held)}<small>{data.partners.length} partners</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="arrow-down-to-line" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Arriving today</p><p className="gc-kpi__value">{money(sum(todayList))}<small>{todayList.length} payout{todayList.length === 1 ? '' : 's'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="clock-alert" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Late</p><p className="gc-kpi__value">{money(sum(late))}<small>{late.length} payout{late.length === 1 ? '' : 's'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="wallet" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Waiting to withdraw</p><p className="gc-kpi__value">{money(walletNet)}<small>{data.wallets.filter((w) => w.net > 0).map((w) => w.p.short).join(', ') || 'Nothing waiting'}</small></p></div></div>
      </div>

      <section className="gc-card ac-card" aria-labelledby="st-coming">
        <div className="ac-head"><div><h2 id="st-coming">Coming in</h2><p>By the day it should reach your account. Friday, Saturday and holidays are skipped, so their money arrives on the next working day.</p></div></div>
        {groups.length === 0 && !data.wallets.some((w) => w.net > 0) ? <EmptyState icon="circle-check" title="Nothing on the way" body="Every payout has arrived. New online payments and delivered COD parcels show here." /> : null}
        {groups.map((g) => (
          <div key={g.key} className="st-group">
            <div className={'st-ghead' + (g.key === 'late' ? ' is-late' : '')}><h3>{g.label}</h3><span>{g.sub}{g.note ? ' · ' + g.note : ''}</span><span className="st-gsum">{money(sum(g.list))}</span></div>
            {g.list.map(row)}
          </div>
        ))}
        {data.wallets.filter((w) => w.net > 0).length ? (
          <div className="st-group">
            <div className="st-ghead"><h3>Withdraw yourself</h3><span>This money stays in the partner’s wallet until you withdraw it</span><span className="st-gsum">{money(walletNet)}</span></div>
            {data.wallets.filter((w) => w.net > 0).map((w) => (
              <div key={w.partner} className="st-row">
                <div className="st-name"><BrandLogo brand={w.p.brand} size={40} /><span><b>{w.p.short} wallet</b><small>{w.items.length} payments since {shortDate(w.since)} · {feeText(w.p)}</small></span></div>
                <div className="st-into"><BrandLogo brand={accBrand(w.p.to)} size={24} decorative /><span>usually to {accName(w.p.to)}</span></div>
                <div className="st-amt">{money(w.net)}<small>{money(w.gross)} − {money(w.fee)}</small></div>
                <div className="st-acts"><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setWallet(w)}><Icon name="arrow-down-to-line" width="16" height="16" aria-hidden="true" /> Withdraw</button></div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="gc-card ac-card" aria-label="Partners and past payouts">
        <div className="st-bar">
          <div className="gc-tabs" role="tablist" aria-label="Settlements" style={{ borderBottom: 0, overflow: 'visible', flexWrap: 'wrap' }}>
            {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab st-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => pickTab(id)}>{label}<b>{counts[id]}</b></button>)}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} role="tabpanel">
          {tab === 'partners' ? (
            <div className="st-partners">
              {data.partners.map((p) => {
                const next = openPays.filter((x) => x.partner === p.id).sort((a, b) => a.due - b.due)[0];
                const last = received.find((x) => x.partner === p.id) || review.find((x) => x.partner === p.id);
                const w = data.wallets.find((x) => x.partner === p.id);
                const diff = last ? Math.round(((last.received ?? last.net) - last.net) * 100) / 100 : 0;
                return (
                  <article key={p.id} className="st-pcard">
                    <div className="ac-logo-line"><BrandLogo brand={p.brand} size={40} /><span><b>{p.short}</b><small>{p.kind === 'Courier' ? 'Courier · cash on delivery' : p.id === 'card' ? 'Card machine' : 'Payment gateway'}</small></span></div>
                    <div><span className="ac-sub">Holding for you</span><span className="st-held">{money(heldBy(p.id))}</span></div>
                    <dl>
                      <dt>Pays out</dt><dd>{ruleText(p)}</dd>
                      <dt>Charges</dt><dd>{feeText(p)}</dd>
                      <dt>No payouts on</dt><dd>{weekendText(p.weekend)} and holidays</dd>
                      <dt>Next</dt><dd>{w ? (w.net > 0 ? `${money(w.net)} to withdraw` : 'Nothing waiting') : next ? `${money(next.net)} · ${dayLabel(next.due, now)}` : 'Nothing on the way'}</dd>
                      <dt>Last payout</dt><dd>{last ? <>{shortDate(last.due)} · {diff === 0 && last.status === 'received' ? <span className="ac-in">matched</span> : <span className="ac-out">{money(Math.abs(diff))} {diff < 0 ? 'short' : 'extra'}</span>}</> : '—'}</dd>
                    </dl>
                  </article>
                );
              })}
            </div>
          ) : null}
          {tab === 'paid' ? (received.length ? (
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--hoverable">
                <thead><tr><th scope="col">Arrived</th><th scope="col">Partner</th><th scope="col" className="ac-num">Expected</th><th scope="col" className="ac-num">Arrived</th><th scope="col" className="ac-num">Difference</th><th scope="col">Into</th><th scope="col">Status</th></tr></thead>
                <tbody>{received.map((p) => {
                  const diff = Math.round((p.received - p.net) * 100) / 100;
                  return (
                    <tr key={p.id}>
                      <td>{shortDate(p.at || p.due)}<span className="ac-sub">payments {daysText(p.days)}</span></td>
                      <td><div className="ac-who"><BrandLogo brand={p.p.brand} size={28} /><span><span className="ac-strong">{p.p.short}</span><span className="ac-sub">{p.items.length} payment{p.items.length === 1 ? '' : 's'}</span></span></div></td>
                      <td className="ac-num">{money(p.net)}</td>
                      <td className="ac-num ac-strong">{money(p.received)}</td>
                      <td className={'ac-num ' + (diff ? 'ac-out' : '')}>{diff ? (diff < 0 ? '−' : '+') + money(diff) : '—'}</td>
                      <td>{accName(p.account)}</td>
                      <td>{diff ? <span className="gc-badge gc-badge--warning">{p.reason === 'fee' ? 'Higher fee' : p.reason === 'charge' ? 'Extra charge' : p.reason === 'later' ? 'Rest later' : 'Difference'}</span> : <span className="gc-badge gc-badge--success">Matched</span>}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          ) : <EmptyState icon="inbox" title="No payouts yet" body="Payouts you tick off as arrived show here." />) : null}
          {tab === 'review' ? (review.length ? review.map((p) => (
            <div key={p.id} className="st-row">
              <div className="st-name"><BrandLogo brand={p.p.brand} size={40} /><span><b>{p.p.short} · {shortDate(p.due)}</b><small>Arrived {money(p.received)}, expected {money(p.net)}</small></span></div>
              <div className="st-into"><BrandLogo brand={accBrand(p.account)} size={24} decorative /><span>into {accName(p.account)}</span></div>
              <div className="st-amt ac-out">−{money(p.net - p.received)}<small>{p.net > p.received ? 'came short' : 'came extra'}</small></div>
              <div className="st-acts"><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setOpen({ pay: p, mode: 'arrived' })}>Explain</button></div>
            </div>
          )) : <EmptyState icon="circle-check" title="Nothing to look at" body="Every payout that arrived matched, or has a reason." />) : null}
        </div>
      </section>

      {open ? <PayoutDialog key={open.pay.id + open.mode} pay={open.pay} startWith={open.mode} onClose={close} /> : null}
      {wallet ? <WithdrawDialog wallet={wallet} onClose={() => setWallet(null)} /> : null}
    </AccPage>
  );
}
