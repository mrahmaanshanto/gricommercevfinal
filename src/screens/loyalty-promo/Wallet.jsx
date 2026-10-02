'use client';
// Wallet — money customers keep with the shop. It is theirs: the total is a liability (Accounts ›
// Liabilities › Held for customers), not income.
//   Add-money requests  customers who sent money by bKash, Nagad or bank: check it, then approve and
//                       say which account it came into (ledger 'wallet top-up', +) or reject it.
//   Cash-out requests   customers who want their money back: send it, then mark it sent from an
//                       account (ledger 'wallet refund', −). Never more than the balance.
//   Wallets             every balance, with add money / pay back / give credit (a reward: no money
//                       moves, counted as a channel cost).
//   All money moves     the whole wallet history.
// ?tab=in|out|wallets|all. Front end only: src/lib/loyalty.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { useRouter } from 'next/navigation';
import { EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, Menu, LearnMore } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { formatDate, formatTime } from '@/lib/format';
import { getMembers, getRequests, rejectRequest, getWalletEntries, walletLiability, monthRange, WALLET_KIND } from '@/lib/loyalty';
import { clockNow } from '@/lib/settlements';
import { accName, accBrand } from '@/screens/accounts/accShared';
import { LoyPage, WalletDialog, useLoyalty, money, plural } from './loyShared';

const TABS = [['in', 'Add-money requests'], ['out', 'Cash-out requests'], ['wallets', 'Wallets'], ['all', 'All money moves']];
const STATUS = { approved: ['Approved', 'success'], sent: ['Sent', 'success'], rejected: ['Rejected', 'error'], waiting: ['Pending', 'warning'] };
const METHOD_BRAND = { bkash: 'bkash', nagad: 'nagad', rocket: 'rocket', bank: 'dbbl' };
const when = (t) => `${formatDate(t)} · ${formatTime(t)}`;
const CSS = `
.wl-method{display:inline-flex;align-items:center;gap:var(--space-2)}
.wl-acts{display:flex;justify-content:flex-end;gap:4px}
.wl-check{margin:0;padding:8px 12px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function Wallet() {
  const tick = useLoyalty();
  const [tab, setTab] = useState('in');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const router = useRouter();
  const [dialog, setDialog] = useState(null);   // { mode, phone?, request? }

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
    const requests = getRequests();
    const entries = getWalletEntries();
    const [m0, m1] = monthRange(now);
    const [l0, l1] = monthRange(now, -1);
    const spent = (a, b) => -entries.filter((e) => e.kind === 'spend' && e.at >= a && e.at < b).reduce((s, e) => s + e.amount, 0);
    const waiting = (type) => requests.filter((r) => r.type === type && r.status === 'waiting');
    return {
      members, requests, entries, liab: walletLiability(members),
      inWait: waiting('in'), outWait: waiting('out'),
      spentMonth: spent(m0, m1), spentLast: spent(l0, l1), lastLabel: new Date(l0).toLocaleString('en', { month: 'long' }),
      names: Object.fromEntries(members.map((m) => [m.phone, m.name])),
    };
  }, [tick]);

  const needle = q.trim().toLowerCase().replace(/[-\s]/g, '');
  const hit = (name, phone) => !needle || (String(name).toLowerCase().replace(/\s/g, '') + phone).includes(needle);
  const sum = (l) => l.reduce((a, r) => a + r.amount, 0);
  const counts = data ? { in: data.inWait.length, out: data.outWait.length, wallets: data.members.filter((m) => m.wallet > 0).length, all: data.entries.length } : {};

  const reject = async (r) => {
    if (!(await confirmDialog({ title: `Reject ${money(r.amount)} from ${r.name}?`, body: r.type === 'in' ? 'Nothing is added to the wallet. The customer gets an SMS to contact you.' : 'The money stays in the wallet. The customer gets an SMS to contact you.', confirmLabel: 'Reject', tone: 'danger' }))) return;
    rejectRequest(r.id);
    toast(`Rejected · ${r.name} gets an SMS to contact you`, { tone: 'info' });
  };

  const go = (href) => (e) => { if (e.target.closest('a,button,input,label,select')) return; router.push(href); };
  const empty = (node) => <div className="ix-empty">{node}</div>;

  const requestTable = (type) => {
    const list = data.requests.filter((r) => r.type === type && hit(r.name, r.phone)).sort((a, b) => (a.status === 'waiting' ? 0 : 1) - (b.status === 'waiting' ? 0 : 1) || b.at - a.at);
    if (!list.length) return empty(<EmptyState icon="circle-check" title="All done" body="No requests waiting." />);
    const rows = list.map((r) => {
      const bal = (data.members.find((m) => m.phone === r.phone) || {}).wallet || 0;
      const tooMuch = type === 'out' && r.status === 'waiting' && r.amount > bal + 0.001;
      const act = r.status === 'waiting' ? (
        <span className="wl-acts">
          <button type="button" className="ix-btn ix-btn--sm" disabled={tooMuch} title={tooMuch ? `Only ${money(bal)} in the wallet` : undefined} onClick={() => setDialog({ mode: type === 'in' ? 'topup' : 'refund', request: r })}>{type === 'in' ? 'Approve' : 'Mark as sent'}</button>
          <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Reject', onClick: () => reject(r), tone: 'danger', aria: `Reject ${r.name}` }]} />
        </span>
      ) : <StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</StatusBadge>;
      return { r, bal, act };
    });
    return (<>
      <p className="wl-check">Check each request in your bKash, Nagad or bank app before you approve.</p>
      <ul className="ix-plist" aria-label={type === 'in' ? 'Add-money requests' : 'Cash-out requests'}>
        {rows.map(({ r, act }) => (
          <li key={r.id} className="ix-pitem">
            <span className="ix-pitem__top"><b>{r.name}</b><span className={type === 'in' ? 'ly-in' : 'ly-out'}>{type === 'in' ? '+' : '−'}{money(r.amount)}</span></span>
            <span className="ix-pitem__mid">{r.method} · {r.ref} · {when(r.at)}</span>
            <span className="ix-pitem__tags">{act}</span>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table ix-table--static gc-table--keep">
          <thead><tr><th scope="col">Customer</th><th scope="col">Method</th><th scope="col">{type === 'in' ? 'Transaction ID' : 'Send to'}</th><th scope="col" className="ix-num">Amount</th><th scope="col">When</th><th scope="col"><span className="sr-only">Action</span></th></tr></thead>
          <tbody>
            {rows.map(({ r, bal, act }) => (
              <tr key={r.id}>
                <td><span className="ix-strong">{r.name}</span><span className="ly-sub">wallet {money(bal)}</span></td>
                <td><span className="wl-method"><BrandLogo brand={METHOD_BRAND[String(r.method).toLowerCase()] || 'cash'} size={16} decorative />{r.method}</span></td>
                <td><span className="ly-fig">{r.ref}</span>{r.refSub ? <span className="ly-sub">{r.refSub}</span> : null}</td>
                <td className={'ix-num ix-strong ' + (type === 'in' ? 'ly-in' : 'ly-out')}>{type === 'in' ? '+' : '−'}{money(r.amount)}</td>
                <td className="ix-muted">{when(r.at)}</td>
                <td className="ix-num">{act}{r.status !== 'waiting' && r.account ? <span className="ly-sub">{accName(r.account)}</span> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>);
  };

  const walletsTable = () => {
    const list = data.liab.customers.filter((c) => hit(c.name, c.phone));
    if (!list.length) return empty(<EmptyState icon="wallet" title="No money held" body="Customers with money in their wallet show here." actionLabel="Add money" onAction={() => setDialog({ mode: 'topup' })} />);
    const hrefOf = (c) => (data.members.some((m) => m.phone === c.phone) ? `/member-detail?phone=${c.phone}` : `/customer-statement?phone=${c.phone}`);
    return (<>
      <ul className="ix-plist" aria-label="Wallets">
        {list.map((c) => (
          <li key={c.phone}><Link href={hrefOf(c)} className="ix-pitem"><span className="ix-pitem__top"><b>{c.name}</b><span>{money(c.total)}</span></span><span className="ix-pitem__mid">Wallet {c.wallet ? money(c.wallet) : '—'} · advance {c.advance ? money(c.advance) : '—'}</span></Link></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <thead><tr><th scope="col">Customer</th><th scope="col" className="ix-num">Wallet</th><th scope="col" className="ix-num">Advance on invoices</th><th scope="col" className="ix-num">Held in all</th></tr></thead>
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

  const movesTable = () => {
    const list = data.entries.filter((e) => hit(data.names[e.phone] || '', e.phone));
    if (!list.length) return empty(<EmptyState icon="history" title="No money moves" body="Top-ups, payments from wallets, pay-backs and credit show here." />);
    return (<>
      <ul className="ix-plist" aria-label="All money moves">
        {list.map((e) => (
          <li key={e.id} className="ix-pitem"><span className="ix-pitem__top"><b>{data.names[e.phone] || e.phone}</b><span className={e.amount > 0 ? 'ly-in' : 'ly-out'}>{e.amount > 0 ? '+' : '−'}{money(e.amount)}</span></span><span className="ix-pitem__mid">{e.what} · {when(e.at)}</span></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table ix-table--static gc-table--keep">
          <thead><tr><th scope="col">Customer</th><th scope="col">What</th><th scope="col">Account</th><th scope="col" className="ix-num">Amount</th><th scope="col">When</th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td><span className="ix-strong">{data.names[e.phone] || e.phone}</span></td>
                <td>{e.what}<span className="ly-sub">{[WALLET_KIND[e.kind], e.sub].filter(Boolean).join(' · ')}</span></td>
                <td className="ix-muted">{e.account ? <span className="wl-method"><BrandLogo brand={accBrand(e.account)} size={16} decorative />{accName(e.account)}</span> : (e.kind === 'reward' ? `No money moved · ${e.channel} cost` : 'No money moved')}</td>
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
    <LoyPage screen="Wallet" active="loy-wallet" title="Customer wallet" icon="wallet" css={CSS}
      about="Customers can keep money with you and pay from it. It stays theirs until they spend it or take it back. Check each request in your bKash, Nagad or bank app before you approve."
      secondary={[{ label: 'Give credit', onClick: () => setDialog({ mode: 'reward' }) }]}
      more={[{ label: 'Wallet settings', href: '/loyalty' }]}
      primary={{ label: 'Add money', onClick: () => setDialog({ mode: 'topup' }) }}>
      <MetricStrip items={[
        { label: 'Money in customer wallets', value: data ? money(data.liab.wallets) : '—', sub: data ? plural(counts.wallets, 'customer') : '' },
        { label: 'Add-money requests', value: data ? money(sum(data.inWait)) : '—', sub: data ? `${data.inWait.length} waiting` : '', on: tab === 'in', onClick: () => pickTab('in') },
        { label: 'Cash-out requests', value: data ? money(sum(data.outWait)) : '—', sub: data ? `${data.outWait.length} waiting` : '', on: tab === 'out', onClick: () => pickTab('out') },
        { label: 'Paid from wallets', value: data ? money(data.spentMonth) : '—', sub: 'this month' },
      ]} />

      <section className="ix-card" aria-label="Wallet">
        <div className="ix-bar">
          {searching ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={TABS.map(([id, label]) => ({ key: id, id: 'wl-tab-' + id, label, count: data ? counts[id] : null, on: tab === id, onClick: () => pickTab(id) }))} label="Wallet" />
            <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
          </>)}
        </div>
        <div role="tabpanel">
          {!data ? empty(<EmptyState icon="loader" title="Reading wallets" />) : tab === 'in' ? requestTable('in') : tab === 'out' ? requestTable('out') : tab === 'wallets' ? walletsTable() : movesTable()}
        </div>
      </section>
      <LearnMore topic="customer wallets" />

      {dialog ? <WalletDialog key={(dialog.request ? dialog.request.id : dialog.phone || '') + dialog.mode} mode={dialog.mode} phone={dialog.phone || ''} request={dialog.request || null} onClose={() => setDialog(null)} /> : null}
    </LoyPage>
  );
}
