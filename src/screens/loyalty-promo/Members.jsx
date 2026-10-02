'use client';
// Members — every loyalty member with points, their ৳ value, wallet money and buying.
//   Top      points customers hold (and their ৳ value), points expiring within a month, new members,
//            money in wallets.
//   List     level tabs, search by name or phone, quick filters; Open goes to the member.
//   Add      a member by mobile number; Download saves the list as a CSV file.
// Front end only: src/lib/loyalty.js (POS points included).

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { getMembers, pointsLiability, walletLiability, getLoyaltySettings, addMember, monthRange } from '@/lib/loyalty';
import { clockNow } from '@/lib/settlements';
import { LoyPage, Kpi, TierBadge, useLoyalty, money, pts, plural } from './loyShared';

const FILTERS = [['any', 'Any'], ['exp', 'Points expiring soon'], ['idle', 'Not bought in 30 days'], ['wallet', 'Has wallet money']];
const PAGE = 20;

export default function Members() {
  const tick = useLoyalty();
  const [tab, setTab] = useState('all');
  const [filter, setFilter] = useState('any');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);

  const data = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const members = getMembers({ now });
    const [m0] = monthRange(now);
    return { now, members, s: getLoyaltySettings(), liab: pointsLiability(members), wallets: walletLiability(members), joined: members.filter((m) => m.joined >= m0).length };
  }, [tick]);

  const members = data ? data.members : [];
  const tiers = data ? data.s.tiers : [];
  const counts = { all: members.length };
  tiers.forEach((t) => { counts[t.k] = members.filter((m) => m.tier === t.k).length; });
  const needle = q.trim().toLowerCase().replace(/[-\s]/g, '');
  const shown = members.filter((m) => (tab === 'all' || m.tier === tab)
    && (!needle || (m.name.toLowerCase().replace(/\s/g, '') + m.phone).includes(needle))
    && (filter === 'any' || (filter === 'exp' ? m.expiring > 0 : filter === 'idle' ? data.now - m.last > 30 * 864e5 : m.wallet > 0)));
  const pages = Math.max(1, Math.ceil(shown.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const rows = shown.slice(cur * PAGE, cur * PAGE + PAGE);
  const expiring = members.reduce((a, m) => a + m.expiring, 0);

  const download = () => {
    const head = ['Name', 'Phone', 'Level', 'Points', 'Points value (BDT)', 'Wallet (BDT)', 'Total bought (BDT)', 'Earned', 'Used', 'Last buy'];
    const lines = [head, ...shown.map((m) => [m.name, m.phone, m.tierObj.name, m.points, m.value, m.wallet, m.bought, m.earned, m.used, m.last ? formatDate(m.last) : ''])]
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'loyalty-members.csv'; document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`${plural(shown.length, 'member')} saved to loyalty-members.csv`);
  };

  return (
    <LoyPage screen="Members" active="loy-members" title="Members"
      about="Every customer who buys becomes a member. Find a customer by name or phone to see or change their points and wallet."
      actions={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={download} disabled={!data}><Icon name="download" width="18" height="18" aria-hidden="true" /> Download list</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => setAdding(true)}><Icon name="user-plus" width="18" height="18" aria-hidden="true" /> Add member</button>
      </>}>
      <div className="gc-kpis gc-kpis--tight">
        <Kpi icon="star" label="Points customers hold" value={data ? pts(data.liab.points) : '—'} sub={data ? `worth ${money(data.liab.value)} as discount` : ''} />
        <Kpi icon="clock-alert" tone="warning" label="Expiring in 30 days" value={data ? (data.s.expireOn ? pts(expiring) : 'Off') : '—'} sub={data ? (data.s.expireOn ? `in ${plural(members.filter((m) => m.expiring > 0).length, 'customer')}` : 'points do not expire') : ''} />
        <Kpi icon="user-plus" tone="success" label="New members" value={data ? pts(data.joined) : '—'} sub="this month" />
        <Kpi icon="wallet" tone="info" label="Money in wallets" value={data ? money(data.wallets.wallets) : '—'} sub={data ? plural(members.filter((m) => m.wallet > 0).length, 'customer') : ''} />
      </div>

      <section className="gc-card ly-card" aria-label="Members">
        <div className="ly-bar">
          <div className="gc-tabs" role="tablist" aria-label="Level">
            {[['all', 'All'], ...tiers.slice().reverse().map((t) => [t.k, t.name])].map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={'gc-tab ly-tab' + (tab === k ? ' gc-tab--active' : '')} onClick={() => { setTab(k); setPage(0); }}>{label}<b>{counts[k] || 0}</b></button>
            ))}
          </div>
        </div>
        <div className="ly-tools">
          <input className="gc-input" type="search" placeholder="Phone number or name" aria-label="Search members" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
          <div className="ly-chips" role="group" aria-label="Filter">
            {FILTERS.map(([k, label]) => <button key={k} type="button" className="ly-chip" aria-pressed={filter === k} onClick={() => { setFilter(k); setPage(0); }}>{label}</button>)}
          </div>
        </div>
        {!data ? <EmptyState icon="loader" title="Reading members" /> : rows.length === 0 ? (
          <EmptyState icon="users" title="No members here" body={q ? 'No member matches this name or phone.' : 'Nobody matches this filter yet.'} actionLabel="Add member" onAction={() => setAdding(true)} />
        ) : (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr><th scope="col">Customer</th><th scope="col">Level</th><th scope="col" className="ac-num">Points now</th><th scope="col" className="ac-num">Wallet</th><th scope="col" className="ac-num">Total bought</th><th scope="col" className="ac-num">Earned</th><th scope="col" className="ac-num">Used</th><th scope="col">Last buy</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.phone}>
                    <td><div className="ly-who"><span className="ly-ava" aria-hidden="true">{m.name.charAt(0)}</span><span><b>{m.name}</b><small>{m.phone}</small></span></div></td>
                    <td><TierBadge m={m} /></td>
                    <td className="ac-num"><span className="ac-fig ac-strong">{pts(m.points)}</span><span className={'ac-sub' + (m.expiring ? ' ly-out' : '')}>{m.expiring ? `${pts(m.expiring)} expire soon` : '= ' + money(m.value)}</span></td>
                    <td className="ac-num ac-fig">{m.wallet ? money(m.wallet) : '—'}</td>
                    <td className="ac-num ac-fig">{money(m.bought)}</td>
                    <td className="ac-num ac-fig ly-in">+{pts(m.earned)}</td>
                    <td className="ac-num ac-fig">−{pts(m.used)}</td>
                    <td>{m.last ? formatDate(m.last) : '—'}</td>
                    <td><div className="ac-row-actions"><Link href={`/member-detail?phone=${m.phone}`} className="gc-btn gc-btn--sm gc-btn--soft" aria-label={`Open ${m.name}`}>Open</Link></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && shown.length > PAGE ? (
          <div className="ac-head" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ margin: 0 }}>{cur * PAGE + 1}–{Math.min(shown.length, cur * PAGE + PAGE)} of {pts(shown.length)}</p>
            <div className="ac-row-actions">
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Back</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</button>
            </div>
          </div>
        ) : null}
      </section>

      {adding ? <AddMemberDialog onClose={() => setAdding(false)} /> : null}
    </LoyPage>
  );
}

function AddMemberDialog({ onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const save = (e) => {
    e.preventDefault();
    const row = addMember({ name, phone });
    if (!row) { toast('Enter a mobile number like 01712-345678', { tone: 'error' }); return; }
    toast(`${row.name} is a member · points start with the first order`);
    onClose();
  };
  return (
    <Dialog open title="Add member" onClose={onClose} width={480}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="ly-add-member" className="gc-btn gc-btn--solid">Add member</button></>}>
      <form id="ly-add-member" className="ac-form" onSubmit={save} noValidate>
        <div><label className="gc-label" htmlFor="ly-am-phone">Mobile number *</label><input id="ly-am-phone" className="gc-input ac-fig" inputMode="tel" placeholder="01712-345678" value={phone} onChange={(e) => setPhone(e.target.value)} aria-required="true" data-autofocus /></div>
        <div><label className="gc-label" htmlFor="ly-am-name">Name</label><input id="ly-am-name" className="gc-input" placeholder="Customer’s name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <p className="gc-help" style={{ margin: 0 }}>A customer already in the list is not added twice.</p>
      </form>
    </Dialog>
  );
}
