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
import { EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatDate, formatTime } from '@/lib/format';
import { getMembers, getRequests, rejectRequest, getWalletEntries, walletLiability, monthRange, WALLET_KIND } from '@/lib/loyalty';
import { clockNow } from '@/lib/settlements';
import { accName, accBrand } from '@/screens/accounts/accShared';
import { LoyPage, Kpi, WalletDialog, useLoyalty, money, plural } from './loyShared';

const TABS = [['in', 'Add-money requests'], ['out', 'Cash-out requests'], ['wallets', 'Wallets'], ['all', 'All money moves']];
const STATUS = { approved: ['Approved', 'success'], sent: ['Sent', 'success'], rejected: ['Rejected', 'error'], waiting: ['Pending', 'warning'] };
const METHOD_BRAND = { bkash: 'bkash', nagad: 'nagad', rocket: 'rocket', bank: 'dbbl' };
const when = (t) => `${formatDate(t)} · ${formatTime(t)}`;

export default function Wallet() {
  const tick = useLoyalty();
  const [tab, setTab] = useState('in');
  const [q, setQ] = useState('');
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

  const requestTable = (type) => {
    const list = data.requests.filter((r) => r.type === type && hit(r.name, r.phone)).sort((a, b) => (a.status === 'waiting' ? 0 : 1) - (b.status === 'waiting' ? 0 : 1) || b.at - a.at);
    if (!list.length) return <EmptyState icon="circle-check" title="All done" body="No requests waiting." />;
    return (
      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact gc-table--hoverable">
          <thead><tr><th scope="col">Customer</th><th scope="col">Method</th><th scope="col">{type === 'in' ? 'Transaction ID' : 'Send to'}</th><th scope="col" className="ac-num">Amount</th><th scope="col">When</th><th scope="col"><span className="sr-only">Action</span></th></tr></thead>
          <tbody>
            {list.map((r) => {
              const bal = (data.members.find((m) => m.phone === r.phone) || {}).wallet || 0;
              const tooMuch = type === 'out' && r.status === 'waiting' && r.amount > bal + 0.001;
              return (
                <tr key={r.id}>
                  <td><div className="ly-who"><span className="ly-ava" aria-hidden="true">{r.name.charAt(0)}</span><span><b>{r.name}</b><small>{r.phone} · wallet {money(bal)}</small></span></div></td>
                  <td><span className="ac-who"><BrandLogo brand={METHOD_BRAND[String(r.method).toLowerCase()] || 'cash'} size={24} decorative />{r.method}</span></td>
                  <td><span className="ac-fig">{r.ref}</span><span className="ac-sub">{r.refSub}</span></td>
                  <td className={'ac-num ac-fig ac-strong ' + (type === 'in' ? 'ly-in' : 'ly-out')}>{type === 'in' ? '+' : '−'}{money(r.amount)}</td>
                  <td>{when(r.at)}</td>
                  <td>
                    {r.status === 'waiting' ? (
                      <div className="ac-row-actions">
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => reject(r)} aria-label={`Reject ${r.name}`}>Reject</button>
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={tooMuch} title={tooMuch ? `Only ${money(bal)} in the wallet` : undefined} onClick={() => setDialog({ mode: type === 'in' ? 'topup' : 'refund', request: r })}>{type === 'in' ? 'Approve' : 'Mark as sent'}</button>
                      </div>
                    ) : (
                      <div className="ac-row-actions"><span className={'gc-badge gc-badge--' + STATUS[r.status][1]}>{STATUS[r.status][0]}</span>{r.account ? <span className="ac-sub" style={{ display: 'inline' }}>{accName(r.account)}</span> : null}</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const walletsTable = () => {
    const list = data.liab.customers.filter((c) => hit(c.name, c.phone));
    if (!list.length) return <EmptyState icon="wallet" title="No money held" body="Customers with money in their wallet show here." actionLabel="Add money" onAction={() => setDialog({ mode: 'topup' })} />;
    return (
      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact gc-table--hoverable">
          <thead><tr><th scope="col">Customer</th><th scope="col" className="ac-num">Wallet</th><th scope="col" className="ac-num">Advance on invoices</th><th scope="col" className="ac-num">Held in all</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {list.map((c) => {
              const member = data.members.some((m) => m.phone === c.phone);
              return (
                <tr key={c.phone}>
                  <td><div className="ly-who"><span className="ly-ava" aria-hidden="true">{c.name.charAt(0)}</span><span><b>{c.name}</b><small>{c.phone}</small></span></div></td>
                  <td className="ac-num ac-fig">{c.wallet ? money(c.wallet) : '—'}</td>
                  <td className="ac-num ac-fig">{c.advance ? money(c.advance) : '—'}</td>
                  <td className="ac-num ac-fig ac-strong">{money(c.total)}</td>
                  <td>
                    <div className="ac-row-actions">
                      {member ? <>
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setDialog({ mode: 'topup', phone: c.phone })}>Add</button>
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!c.wallet} onClick={() => setDialog({ mode: 'refund', phone: c.phone })}>Pay back</button>
                        <Link href={`/member-detail?phone=${c.phone}`} className="gc-btn gc-btn--sm gc-btn--soft">Open</Link>
                      </> : <Link href={`/customer-statement?phone=${c.phone}`} className="gc-btn gc-btn--sm gc-btn--soft">Statement</Link>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const movesTable = () => {
    const list = data.entries.filter((e) => hit(data.names[e.phone] || '', e.phone));
    if (!list.length) return <EmptyState icon="history" title="No money moves" body="Top-ups, payments from wallets, pay-backs and credit show here." />;
    return (
      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact gc-table--hoverable">
          <thead><tr><th scope="col">Customer</th><th scope="col">What</th><th scope="col">Account</th><th scope="col" className="ac-num">Amount</th><th scope="col">When</th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td><span className="ac-strong">{data.names[e.phone] || e.phone}</span><span className="ac-sub ac-fig">{e.phone}</span></td>
                <td><span className="ac-strong">{e.what}</span><span className="ac-sub">{[WALLET_KIND[e.kind], e.sub].filter(Boolean).join(' · ')}</span></td>
                <td>{e.account ? <span className="ac-who"><BrandLogo brand={accBrand(e.account)} size={20} decorative />{accName(e.account)}</span> : <span className="ac-sub" style={{ display: 'inline' }}>{e.kind === 'reward' ? `No money moved · ${e.channel} cost` : 'No money moved'}</span>}</td>
                <td className={'ac-num ac-fig ac-strong ' + (e.amount > 0 ? 'ly-in' : 'ly-out')}>{e.amount > 0 ? '+' : '−'}{money(e.amount)}</td>
                <td>{when(e.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <LoyPage screen="Wallet" active="loy-wallet" title="Customer wallet"
      description="Customers can keep money with you and pay from it. It stays theirs until they spend it or take it back. Check each request in your bKash, Nagad or bank app before you approve."
      actions={<>
        <Link href="/loyalty" className="gc-btn gc-btn--neutral"><Icon name="settings" width="18" height="18" aria-hidden="true" /> Wallet settings</Link>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDialog({ mode: 'reward' })}><Icon name="gift" width="18" height="18" aria-hidden="true" /> Give credit</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => setDialog({ mode: 'topup' })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add money</button>
      </>}>
      <div className="gc-kpis gc-kpis--tight">
        <Kpi icon="wallet" label="Money in customer wallets" value={data ? money(data.liab.wallets) : '—'} sub={data ? `${plural(counts.wallets, 'customer')} keep money with you` : ''} />
        <Kpi icon="arrow-down-left" tone="success" label="Add-money requests" value={data ? money(sum(data.inWait)) : '—'} sub={data ? `${data.inWait.length} waiting · check the TrxID` : ''} />
        <Kpi icon="arrow-up-right" tone="warning" label="Cash-out requests" value={data ? money(sum(data.outWait)) : '—'} sub={data ? `${data.outWait.length} waiting` : ''} />
        <Kpi icon="shopping-bag" tone="info" label="Paid from wallets" value={data ? money(data.spentMonth) : '—'} sub={data ? `for orders this month · ${data.lastLabel} ${money(data.spentLast)}` : ''} />
      </div>

      <section className="gc-card ly-card" aria-label="Wallet">
        <div className="ly-bar">
          <div className="gc-tabs" role="tablist" aria-label="Wallet">
            {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab ly-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => pickTab(id)}>{label}<b>{data ? counts[id] : ''}</b></button>)}
          </div>
        </div>
        <div className="ly-tools"><input className="gc-input" type="search" placeholder="Search name or phone" aria-label="Search customers" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div role="tabpanel">
          {!data ? <EmptyState icon="loader" title="Reading wallets" /> : tab === 'in' ? requestTable('in') : tab === 'out' ? requestTable('out') : tab === 'wallets' ? walletsTable() : movesTable()}
        </div>
      </section>

      {dialog ? <WalletDialog key={(dialog.request ? dialog.request.id : dialog.phone || '') + dialog.mode} mode={dialog.mode} phone={dialog.phone || ''} request={dialog.request || null} onClose={() => setDialog(null)} /> : null}
    </LoyPage>
  );
}
