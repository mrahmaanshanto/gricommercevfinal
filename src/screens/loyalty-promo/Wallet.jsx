'use client';
// Wallet — Store credit (Nayeem's brief #9, "Wallet → Store Credit"). Credit the shop gives a customer to spend on a
// later order: for a return or refund, as a sorry gift, an offer, a loyalty or an invite reward. It is never topped
// up and never paid out in cash, and a balance is never edited: a correction is its own row, approved by a manager.
//   Balances      every customer with store credit (and an advance kept on invoices, which Accounts holds too)
//   All changes   every row: added, used, expired, reversed, corrected; rows from the old wallet (top-ups and
//                 pay-backs before the change) stay readable as they were
// Store credit is still a balance the shop owes the customer (Accounts › Liabilities). ?tab=balances|all.
// Front end only: src/lib/storeCredit.js (rows live with the old wallet rows in src/lib/loyalty.js).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { useRouter } from 'next/navigation';
import { EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { getMembers, walletLiability, monthRange, getLoyaltySettings } from '@/lib/loyalty';
import { allCredit, creditSummary, expireCredit, SOURCES } from '@/lib/storeCredit';
import { clockNow } from '@/lib/settlements';
import { LoyPage, CreditDialog, useLoyalty, money, plural } from './loyShared';

const TABS = [['balances', 'Balances'], ['all', 'All changes']];
const KIND_TONE = { issue: 'success', redeem: 'neutral', expire: 'warning', reverse: 'error', adjust: 'info', deposit: 'neutral', payout: 'neutral' };
const when = (t) => `${formatDate(t)} · ${formatTime(t)}`;

export default function Wallet() {
  const tick = useLoyalty();
  const [tab, setTab] = useState('balances');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const router = useRouter();
  const [dialog, setDialog] = useState(null);   // 'give' | 'adjust'

  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
  }, []);
  const pickTab = (id) => {
    setTab(id);
    const u = new URL(window.location.href); u.searchParams.set('tab', id);
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const data = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const members = getMembers({ now });
    const [m0, m1] = monthRange(now);
    return { members, liab: walletLiability(members), rows: allCredit(), month: creditSummary(m0, m1), all: creditSummary(), expiry: getLoyaltySettings().creditExpiryMonths };
  }, [tick]);

  const needle = q.trim().toLowerCase().replace(/[-\s]/g, '');
  const hit = (name, phone) => !needle || (String(name).toLowerCase().replace(/\s/g, '') + phone).includes(needle);
  const counts = data ? { balances: data.liab.customers.length, all: data.rows.length } : {};
  const go = (href) => (e) => { if (e.target.closest('a,button,input,label,select')) return; router.push(href); };
  const empty = (node) => <div className="ix-empty">{node}</div>;
  const runExpiry = async () => {
    if (!(await confirmDialog({ title: 'Expire old store credit?', body: `Credit not used within ${data.expiry} months runs out now, oldest first.`, confirmLabel: 'Expire' }))) return;
    const r = expireCredit(clockNow());
    toast(r.amount ? `${money(r.amount)} expired for ${plural(r.members, 'customer')}` : 'Nothing to expire');
  };

  const balancesTable = () => {
    const list = data.liab.customers.filter((c) => hit(c.name, c.phone));
    if (!list.length) return empty(<EmptyState icon="wallet" title="No store credit" body="Customers with store credit show here." actionLabel="Give credit" onAction={() => setDialog('give')} />);
    const hrefOf = (c) => (data.members.some((m) => m.phone === c.phone) ? `/member-detail?phone=${c.phone}` : `/customer-statement?phone=${c.phone}`);
    return (<>
      <ul className="ix-plist" aria-label="Balances">
        {list.map((c) => (
          <li key={c.phone}><Link href={hrefOf(c)} className="ix-pitem"><span className="ix-pitem__top"><b>{c.name}</b><span>{money(c.total)}</span></span><span className="ix-pitem__mid">Store credit {c.wallet ? money(c.wallet) : '—'} · advance {c.advance ? money(c.advance) : '—'}</span></Link></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <thead><tr><th scope="col">Customer</th><th scope="col" className="ix-num">Store credit</th><th scope="col" className="ix-num">Advance on invoices</th><th scope="col" className="ix-num">Held in all</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.phone} onClick={go(hrefOf(c))}>
                <td><Link href={hrefOf(c)} className="ix-strong">{c.name}</Link></td>
                <td className="ix-num">{c.wallet ? money(c.wallet) : '—'}</td>
                <td className="ix-num">{c.advance ? money(c.advance) : '—'}</td>
                <td className="ix-num ix-strong">{money(c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>);
  };

  const changesTable = () => {
    const list = data.rows.filter((e) => hit(e.name, e.phone));
    if (!list.length) return empty(<EmptyState icon="history" title="No changes" body="Credit added, used, expired and corrected shows here." />);
    return (<>
      <ul className="ix-plist" aria-label="All changes">
        {list.map((e) => (
          <li key={e.id} className="ix-pitem"><span className="ix-pitem__top"><b>{e.name}</b><span className={e.amount > 0 ? 'ly-in' : 'ly-out'}>{e.amount > 0 ? '+' : '−'}{money(e.amount)}</span></span><span className="ix-pitem__mid">{e.label}{e.source ? ' · ' + (SOURCES[e.source] || e.source) : ''} · {when(e.at)}</span></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table ix-table--static gc-table--keep">
          <thead><tr><th scope="col">Customer</th><th scope="col">What</th><th scope="col">Change</th><th scope="col" className="ix-num">Amount</th><th scope="col">When</th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td><span className="ix-strong">{e.name}</span></td>
                <td>{e.what}{e.sub ? <span className="ly-sub">{e.sub}</span> : null}</td>
                <td><StatusBadge tone={KIND_TONE[e.ckind] || 'neutral'}>{e.label}</StatusBadge></td>
                <td className={'ix-num ix-strong ' + (e.amount > 0 ? 'ly-in' : 'ly-out')}>{e.amount > 0 ? '+' : '−'}{money(e.amount)}</td>
                <td className="ix-muted">{when(e.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>);
  };

  const searching = find || !!q;
  const closeFind = () => { setFind(false); setQ(''); };

  return (
    <LoyPage screen="Wallet" active="loy-wallet" title="Store credit" icon="wallet"
      about="Credit you give customers to spend on a later order: for a return, a refund, as a sorry gift, an offer or a reward. Customers use it online or at the counter. It can’t be topped up or paid out in cash, and a balance is only corrected with a manager’s approval."
      secondary={[{ label: 'Correct a balance', onClick: () => setDialog('adjust') }]}
      more={[data && data.expiry ? { label: 'Expire old credit', onClick: runExpiry } : null, { label: 'Store credit settings', href: '/loyalty' }].filter(Boolean)}
      primary={{ label: 'Give credit', onClick: () => setDialog('give') }}>
      <MetricStrip items={[
        { label: 'Store credit held', value: data ? money(data.liab.wallets) : '—', sub: data ? plural(data.all.customers, 'customer') : '' },
        { label: 'Added this month', value: data ? money(data.month.issued) : '—' },
        { label: 'Used this month', value: data ? money(data.month.used) : '—' },
        { label: 'Expired or reversed', value: data ? money(data.month.expired + data.month.reversed) : '—', sub: 'this month' },
      ]} />

      <section className="ix-card" aria-label="Store credit">
        <div className="ix-bar">
          {searching ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={TABS.map(([id, label]) => ({ key: id, id: 'wl-tab-' + id, label, count: data ? counts[id] : null, on: tab === id, onClick: () => pickTab(id) }))} label="Store credit" />
            <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
          </>)}
        </div>
        <div role="tabpanel">
          {!data ? empty(<EmptyState icon="loader" title="Reading store credit" />) : tab === 'balances' ? balancesTable() : changesTable()}
        </div>
      </section>
      <LearnMore topic="store credit" />

      {dialog ? <CreditDialog key={dialog} mode={dialog} onClose={() => setDialog(null)} /> : null}
    </LoyPage>
  );
}
