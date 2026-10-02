'use client';
// Settlements — "Payouts": money that payment gateways (bKash, Nagad, SSLCOMMERZ, EPS), the card machine
// and couriers (Pathao, Steadfast, RedX, Carrybee) collected for the shop and pay out later. Laid out like
// Shopify's Payouts (docs/shopify-style.md): the figures, then one card with four views:
//   Coming in     expected payouts by the working day they should arrive (late ones first), and wallets
//                 you withdraw from yourself (EPS). A row opens the payout: tick it off when it lands, or
//                 give the new date they promised; a different amount is explained with a reason.
//   Needs a look  payouts that arrived with a different amount
//   Paid out      payouts that arrived, with any difference
//   Partners      what each partner holds now, its payout rule and fee, the next and the last payout
// ?payout=<id> opens that payout · ?withdraw=<partner> opens its wallet · ?tab=coming|review|paid|partners
// Front end only: rules and items live in src/lib/settlements.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { getPartners, getPayouts, getWallets, heldBy, clockNow, startOfDay, closedBetween, ruleText, feeText, weekendText } from '@/lib/settlements';
import { AccPage, PayoutDialog, WithdrawDialog, useBooks, money, dayLabel, shortDate, daysText, accName } from './accShared';

const TABS = [['coming', 'Coming in'], ['review', 'Needs a look'], ['paid', 'Paid out'], ['partners', 'Partners']];
const ABOUT = 'Money that payment gateways, the card machine and couriers collected for you and pay out later. See what arrives when, and tick it off when it lands.';
const REASON = { fee: 'Higher fee', charge: 'Extra charge', later: 'Rest later' };
const CSS = `
.st-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.st-out{color:var(--text-danger)}
.st-in{color:var(--text-success)}
`;

/** Expected · Not yet (past its day, not late yet) · Overdue 2d · Delayed */
function statusOf(p, now) {
  if (p.late) return <StatusBadge tone="error">Overdue {Math.max(1, Math.round((startOfDay(now) - p.due) / 864e5))}d</StatusBadge>;
  if (p.status === 'delayed') return <StatusBadge tone="warning">Delayed</StatusBadge>;
  if (p.due < startOfDay(now)) return <StatusBadge tone="warning" icon="clock">Not yet</StatusBadge>;
  return <StatusBadge tone="info" icon="clock">Expected</StatusBadge>;
}

export default function Settlements() {
  const tick = useBooks();
  const [now, setNow] = useState(0);
  const [tab, setTab] = useState('coming');
  const [open, setOpen] = useState(null);      // { pay, mode }
  const [wallet, setWallet] = useState(null);

  const data = useMemo(() => {
    if (!tick) return { pays: [], wallets: [], partners: [] };
    const t = clockNow();
    return { pays: getPayouts(t), wallets: getWallets(), partners: getPartners(), t };
  }, [tick]);
  useEffect(() => { if (data.t) setNow(data.t); }, [data.t]);

  // ?payout=<id>, ?withdraw=<partner> and ?tab=, once the books are read
  const booted = useRef(false);
  useEffect(() => {
    if (!tick || booted.current) return;
    booted.current = true;
    const q = new URLSearchParams(window.location.search);
    const want = q.get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
    const id = q.get('payout');
    if (id) { const p = getPayouts().find((x) => x.id === id); if (p && p.status !== 'received') setOpen({ pay: p, mode: 'arrived' }); }
    const wd = q.get('withdraw');
    if (wd) { const w = getWallets().find((x) => x.partner === wd); if (w && w.net > 0) setWallet(w); }
  }, [tick]);
  const pickTab = (id) => {
    setTab(id);
    const u = new URL(window.location.href); u.searchParams.set('tab', id); u.searchParams.delete('payout'); u.searchParams.delete('withdraw');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };
  const clean = (key) => { const u = new URL(window.location.href); if (u.searchParams.has(key)) { u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search); } };

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
  const wallets = data.wallets.filter((w) => w.net > 0);
  const sum = (l) => l.reduce((a, p) => a + p.net, 0);
  const held = data.partners.reduce((a, p) => a + heldBy(p.id), 0);
  const todayList = upcoming.filter((p) => p.due === today);
  const walletNet = data.wallets.reduce((a, w) => a + w.net, 0);
  const counts = { coming: openPays.length + wallets.length, review: review.length, paid: received.length, partners: data.partners.length };
  const close = () => { setOpen(null); clean('payout'); };
  const closeWallet = () => { setWallet(null); clean('withdraw'); };
  const arrive = (p) => setOpen({ pay: p, mode: 'arrived' });
  const rowClick = (p) => (e) => { if (e.target.closest('a,button')) return; arrive(p); };

  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'st-tab-' + id, label, count: tick ? counts[id] : null, on: tab === id, onClick: () => pickTab(id) }));

  // ---- the four views: a table on a desktop and a two-line list on a phone ----
  const comingView = () => {
    if (!groups.length && !wallets.length) return <div className="ix-empty"><EmptyState icon="circle-check" title="Nothing on the way" body="Every payout has arrived." /></div>;
    return (<>
      <ul className="ix-plist" aria-label="Coming in">
        {groups.map((g) => (
          <React.Fragment key={g.key}>
            <li className="ac-plh">{g.label}<small>{g.sub} · {money(sum(g.list))}</small></li>
            {g.list.map((p) => (
              <li key={p.id}>
                <button type="button" className="ix-pitem" onClick={() => arrive(p)}>
                  <span className="ix-pitem__top"><b>{p.p.short}</b><span className="st-fig">{money(p.net)}</span></span>
                  <span className="ix-pitem__mid">into {accName(p.account)} · {p.items.length} payment{p.items.length === 1 ? '' : 's'}</span>
                  {p.late || p.status === 'delayed' || p.due < today ? <span className="ix-pitem__tags">{statusOf(p, now)}</span> : null}
                </button>
              </li>
            ))}
          </React.Fragment>
        ))}
        {wallets.length ? <li className="ac-plh">Withdraw yourself<small>{money(walletNet)}</small></li> : null}
        {wallets.map((w) => (
          <li key={w.partner}>
            <button type="button" className="ix-pitem" onClick={() => setWallet(w)}>
              <span className="ix-pitem__top"><b>{w.p.short} wallet</b><span className="st-fig">{money(w.net)}</span></span>
              <span className="ix-pitem__mid">{w.items.length} payments since {shortDate(w.since)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Payouts coming in, by the day they should arrive</caption>
          <thead><tr><th scope="col">Partner</th><th scope="col">Payments</th><th scope="col">Into</th><th scope="col">Status</th><th scope="col" className="ix-num">Amount</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          {groups.map((g) => (
            <tbody key={g.key}>
              <tr className="ac-grp"><th scope="rowgroup" colSpan={4}>{g.label}<small>{g.sub}{g.note ? ' · ' + g.note : ''}</small></th><td className="ix-num st-fig">{money(sum(g.list))}</td><td /></tr>
              {g.list.map((p) => (
                <tr key={p.id} onClick={rowClick(p)}>
                  <td><span className="ac-logo"><BrandLogo brand={p.p.brand} size={24} decorative /><span className="ix-strong">{p.p.short}</span></span></td>
                  <td className="ix-muted">{p.items.length} from {daysText(p.days)}</td>
                  <td className="ix-muted">{accName(p.account)}</td>
                  <td>{statusOf(p, now)}</td>
                  <td className="ix-num st-fig ix-strong">{money(p.net)}</td>
                  <td className="ac-act"><button type="button" className="ix-btn ix-btn--sm" onClick={() => arrive(p)} aria-label={`${p.p.short} ${money(p.net)} arrived`}>Arrived</button></td>
                </tr>
              ))}
            </tbody>
          ))}
          {wallets.length ? (
            <tbody>
              <tr className="ac-grp"><th scope="rowgroup" colSpan={4}>Withdraw yourself<small>This money stays in the partner’s wallet until you withdraw it</small></th><td className="ix-num st-fig">{money(walletNet)}</td><td /></tr>
              {wallets.map((w) => (
                <tr key={w.partner} onClick={(e) => { if (!e.target.closest('button')) setWallet(w); }}>
                  <td><span className="ac-logo"><BrandLogo brand={w.p.brand} size={24} decorative /><span className="ix-strong">{w.p.short} wallet</span></span></td>
                  <td className="ix-muted">{w.items.length} since {shortDate(w.since)}</td>
                  <td className="ix-muted">usually {accName(w.p.to)}</td>
                  <td><StatusBadge tone="warning" icon="wallet">To withdraw</StatusBadge></td>
                  <td className="ix-num st-fig ix-strong">{money(w.net)}</td>
                  <td className="ac-act"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setWallet(w)}>Withdraw</button></td>
                </tr>
              ))}
            </tbody>
          ) : null}
        </table>
      </div>
    </>);
  };

  const reviewView = () => (review.length ? (<>
    <ul className="ix-plist" aria-label="Needs a look">
      {review.map((p) => (
        <li key={p.id}>
          <button type="button" className="ix-pitem" onClick={() => arrive(p)}>
            <span className="ix-pitem__top"><b>{p.p.short} · {shortDate(p.due)}</b><span className="st-fig st-out">{p.net > p.received ? '−' : '+'}{money(p.net - p.received)}</span></span>
            <span className="ix-pitem__mid">Arrived {money(p.received)}, expected {money(p.net)}</span>
          </button>
        </li>
      ))}
    </ul>
    <div className="ix-table-wrap">
      <table className="ix-table gc-table--keep">
        <caption className="sr-only">Payouts that arrived with a different amount</caption>
        <thead><tr><th scope="col">Arrived</th><th scope="col">Partner</th><th scope="col">Into</th><th scope="col" className="ix-num">Expected</th><th scope="col" className="ix-num">Arrived</th><th scope="col" className="ix-num">Difference</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{review.map((p) => (
          <tr key={p.id} onClick={rowClick(p)}>
            <td>{shortDate(p.due)}</td>
            <td><span className="ac-logo"><BrandLogo brand={p.p.brand} size={24} decorative /><span className="ix-strong">{p.p.short}</span></span></td>
            <td className="ix-muted">{accName(p.account)}</td>
            <td className="ix-num st-fig">{money(p.net)}</td>
            <td className="ix-num st-fig ix-strong">{money(p.received)}</td>
            <td className="ix-num st-fig st-out">{p.net > p.received ? '−' : '+'}{money(p.net - p.received)}</td>
            <td className="ac-act"><button type="button" className="ix-btn ix-btn--sm" onClick={() => arrive(p)}>Explain</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </>) : <div className="ix-empty"><EmptyState icon="circle-check" title="Nothing to look at" body="Every payout that arrived matched, or has a reason." /></div>);

  const paidView = () => (received.length ? (<>
    <ul className="ix-plist" aria-label="Paid out">
      {received.map((p) => {
        const diff = Math.round((p.received - p.net) * 100) / 100;
        return (
          <li key={p.id}>
            <div className="ix-pitem">
              <span className="ix-pitem__top"><b>{p.p.short} · {shortDate(p.at || p.due)}</b><span className="st-fig">{money(p.received)}</span></span>
              <span className="ix-pitem__mid">into {accName(p.account)}{diff ? ` · ${diff < 0 ? '−' : '+'}${money(diff)}` : ''}</span>
            </div>
          </li>
        );
      })}
    </ul>
    <div className="ix-table-wrap">
      <table className="ix-table ix-table--static gc-table--keep">
        <caption className="sr-only">Payouts that arrived</caption>
        <thead><tr><th scope="col">Arrived</th><th scope="col">Partner</th><th scope="col">Into</th><th scope="col">Status</th><th scope="col" className="ix-num">Expected</th><th scope="col" className="ix-num">Arrived</th><th scope="col" className="ix-num">Difference</th></tr></thead>
        <tbody>{received.map((p) => {
          const diff = Math.round((p.received - p.net) * 100) / 100;
          return (
            <tr key={p.id} title={`${p.items.length} payment${p.items.length === 1 ? '' : 's'} from ${daysText(p.days)}`}>
              <td>{shortDate(p.at || p.due)}</td>
              <td><span className="ac-logo"><BrandLogo brand={p.p.brand} size={24} decorative /><span className="ix-strong">{p.p.short}</span></span></td>
              <td className="ix-muted">{accName(p.account)}</td>
              <td>{diff ? <StatusBadge tone="warning">{REASON[p.reason] || 'Difference'}</StatusBadge> : <StatusBadge tone="success">Matched</StatusBadge>}</td>
              <td className="ix-num st-fig">{money(p.net)}</td>
              <td className="ix-num st-fig ix-strong">{money(p.received)}</td>
              <td className={'ix-num st-fig' + (diff ? ' st-out' : ' ix-muted')}>{diff ? (diff < 0 ? '−' : '+') + money(diff) : '—'}</td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  </>) : <div className="ix-empty"><EmptyState icon="inbox" title="No payouts yet" body="Payouts you tick off as arrived show here." /></div>);

  const partnerRows = data.partners.map((p) => {
    const next = openPays.filter((x) => x.partner === p.id).sort((a, b) => a.due - b.due)[0];
    const last = received.find((x) => x.partner === p.id) || review.find((x) => x.partner === p.id);
    const w = data.wallets.find((x) => x.partner === p.id);
    const diff = last ? Math.round(((last.received ?? last.net) - last.net) * 100) / 100 : 0;
    return {
      p, held: heldBy(p.id),
      next: w ? (w.net > 0 ? `${money(w.net)} to withdraw` : 'Nothing waiting') : next ? `${money(next.net)} · ${dayLabel(next.due, now)}` : 'Nothing on the way',
      last: last ? <>{shortDate(last.due)} · {diff === 0 && last.status === 'received' ? <span className="st-in">matched</span> : <span className="st-out">{money(Math.abs(diff))} {diff < 0 ? 'short' : 'extra'}</span>}</> : '—',
    };
  });
  const partnersView = () => (<>
    <ul className="ix-plist" aria-label="Partners">
      {partnerRows.map((r) => (
        <li key={r.p.id}>
          <div className="ix-pitem">
            <span className="ix-pitem__top"><b>{r.p.short}</b><span className="st-fig">{money(r.held)}</span></span>
            <span className="ix-pitem__mid">{ruleText(r.p)} · {feeText(r.p)}</span>
          </div>
        </li>
      ))}
    </ul>
    <div className="ix-table-wrap">
      <table className="ix-table ix-table--static gc-table--keep">
        <caption className="sr-only">Payment partners</caption>
        <thead><tr><th scope="col">Partner</th><th scope="col">Pays out</th><th scope="col">Charges</th><th scope="col">Next</th><th scope="col">Last payout</th><th scope="col" className="ix-num">Holding for you</th></tr></thead>
        <tbody>{partnerRows.map((r) => (
          <tr key={r.p.id}>
            <td><span className="ac-logo"><BrandLogo brand={r.p.brand} size={24} decorative /><span><span className="ix-strong">{r.p.short}</span> <span className="ix-muted">{r.p.kind === 'Courier' ? 'Courier' : r.p.id === 'card' ? 'Card machine' : 'Gateway'}</span></span></span></td>
            <td title={`No payouts on ${weekendText(r.p.weekend)} and holidays`}>{ruleText(r.p)}</td>
            <td className="ix-muted">{feeText(r.p)}</td>
            <td>{r.next}</td>
            <td>{r.last}</td>
            <td className="ix-num st-fig ix-strong">{money(r.held)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </>);

  return (
    <AccPage screen="Settlements" active="acc-settle" page="Payouts" title="Payouts" css={CSS} icon="hourglass" about={ABOUT}
      secondary={[{ label: 'Payout rules', href: '/account-setup?tab=partners' }]}
      more={[{ label: 'Money', href: '/money' }, { label: 'Reports', href: '/account-reports' }]}
      primary={{ label: 'Check today’s payouts', onClick: () => window.dispatchEvent(new CustomEvent('gc:check')) }}>
      <MetricStrip label="Payouts" items={[
        { label: 'With partners now', value: money(held), sub: `${data.partners.length} partners` },
        { label: 'Arriving today', value: money(sum(todayList)), sub: `${todayList.length} payout${todayList.length === 1 ? '' : 's'}` },
        { label: 'Late', value: money(sum(late)), sub: `${late.length} payout${late.length === 1 ? '' : 's'}` },
        { label: 'Waiting to withdraw', value: money(walletNet), sub: wallets.map((w) => w.p.short).join(', ') || 'Nothing waiting' },
      ]} />

      <section className="ix-card" aria-label="Payouts">
        <div className="ix-bar">
          <IndexTabs tabs={tabs} label="Payouts" />
          {tab === 'coming' ? <span className="ix-tools"><InfoTip text="By the day it should reach your account. Friday, Saturday and holidays are skipped, so their money arrives on the next working day." /></span> : null}
        </div>
        <div role="tabpanel" aria-labelledby={'st-tab-' + tab}>
          {!tick ? <p className="ac-wait">Reading the books…</p>
            : tab === 'coming' ? comingView() : tab === 'review' ? reviewView() : tab === 'paid' ? paidView() : partnersView()}
        </div>
      </section>
      <LearnMore topic="payouts" />

      {open ? <PayoutDialog key={open.pay.id + open.mode} pay={open.pay} startWith={open.mode} onClose={close} /> : null}
      {wallet ? <WithdrawDialog wallet={wallet} onClose={closeWallet} /> : null}
    </AccPage>
  );
}
