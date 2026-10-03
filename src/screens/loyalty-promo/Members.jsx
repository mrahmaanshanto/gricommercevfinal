'use client';
// Members — every loyalty member with points, their ৳ value, store credit and buying. A member is a CRM customer
// with a loyalty account (loyalty.js › getMembers carries customerId); Add member also adds them to the customer book.
//   Top      points customers hold (and their ৳ value), points expiring within a month, new members,
//            store credit held.
//   List     level tabs, search by name or phone and a filter (IndexKit); a row opens the member.
//   Add      a member by mobile number; Download saves the list as a CSV file.
// Front end only: src/lib/loyalty.js (POS points included).

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { useRouter } from 'next/navigation';
import { Dialog, EmptyState } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, Pager, LearnMore } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { getMembers, pointsLiability, walletLiability, getLoyaltySettings, addMember, monthRange } from '@/lib/loyalty';
import { clockNow } from '@/lib/settlements';
import { LoyPage, TierBadge, useLoyalty, money, pts, plural } from './loyShared';

const FILTERS = [['any', 'Any'], ['exp', 'Points expiring soon'], ['idle', 'Not bought in 30 days'], ['wallet', 'Has store credit']];
const PAGE = 20;

export default function Members() {
  const tick = useLoyalty();
  const [tab, setTab] = useState('all');
  const [filter, setFilter] = useState('any');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [find, setFind] = useState(false);
  const router = useRouter();

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
    const head = ['Name', 'Phone', 'Level', 'Points', 'Points value (BDT)', 'Store credit (BDT)', 'Total bought (BDT)', 'Earned', 'Used', 'Last buy'];
    const lines = [head, ...shown.map((m) => [m.name, m.phone, m.tierObj.name, m.points, m.value, m.wallet, m.bought, m.earned, m.used, m.last ? formatDate(m.last) : ''])]
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','));
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'loyalty-members.csv'; document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`${plural(shown.length, 'member')} saved to loyalty-members.csv`);
  };

  const tabs = [['all', 'All'], ...tiers.slice().reverse().map((t) => [t.k, t.name])].map(([k, label]) => ({ key: k, id: 'mb-tab-' + k, label, count: counts[k] || 0, on: tab === k, onClick: () => { setTab(k); setPage(0); } }));
  const searching = find || !!q || filter !== 'any';
  const closeFind = () => { setFind(false); setQ(''); setFilter('any'); setPage(0); };
  const open = (m) => (e) => { if (e.target.closest('a,button,input,label,select')) return; router.push(`/member-detail?phone=${m.phone}`); };

  return (
    <LoyPage screen="Members" active="loy-members" title="Members" icon="users"
      about="Every customer who buys becomes a member. Find a customer by name or phone to see or change their points and store credit."
      secondary={[{ label: 'Download list', onClick: download, disabled: !data }]}
      more={[{ label: 'Loyalty rules', href: '/loyalty' }, { label: 'Store credit', href: '/wallet' }]}
      primary={{ label: 'Add member', onClick: () => setAdding(true) }}>
      <MetricStrip items={[
        { label: 'Points customers hold', value: data ? pts(data.liab.points) : '—', sub: data ? `worth ${money(data.liab.value)}` : '' },
        { label: 'Expiring in 30 days', value: data ? (data.s.expireOn ? pts(expiring) : 'Off') : '—', sub: data && data.s.expireOn ? plural(members.filter((m) => m.expiring > 0).length, 'customer') : '', on: filter === 'exp', onClick: data && data.s.expireOn ? () => { setFilter(filter === 'exp' ? 'any' : 'exp'); setPage(0); } : undefined },
        { label: 'New members', value: data ? pts(data.joined) : '—', sub: 'this month' },
        { label: 'Store credit', value: data ? money(data.wallets.wallets) : '—', sub: data ? plural(members.filter((m) => m.wallet > 0).length, 'customer') : '', href: '/wallet' },
      ]} />

      <section className="ix-card" aria-label="Members">
        <div className="ix-bar">
          {searching ? (<>
            <SearchField value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Phone number or name" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Level" />
            <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
          </>)}
        </div>
        {searching ? (
          <div className="ix-filters" role="group" aria-label="Filters">
            <select aria-label="Filter" className={'ix-filter' + (filter !== 'any' ? ' is-set' : '')} value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }}>
              {FILTERS.map(([k, label]) => <option key={k} value={k}>{k === 'any' ? 'Filter' : label}</option>)}
            </select>
            {filter !== 'any' || q ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setFilter('any'); setPage(0); }}>Clear all</button> : null}
          </div>
        ) : null}
        {!data ? <div className="ix-empty"><EmptyState icon="loader" title="Reading members" /></div> : rows.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="users" title="No members here" body={q ? 'No member matches this name or phone.' : 'Nobody matches this filter yet.'} actionLabel="Add member" onAction={() => setAdding(true)} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Members">
            {rows.map((m) => (
              <li key={m.phone}>
                <Link href={`/member-detail?phone=${m.phone}`} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{m.name}</b><span>{pts(m.points)} points</span></span>
                  <span className="ix-pitem__mid">{m.tierObj.name} · {m.wallet ? 'credit ' + money(m.wallet) : 'bought ' + money(m.bought)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Members, {shown.length} shown</caption>
              <thead><tr><th scope="col">Customer</th><th scope="col">Level</th><th scope="col" className="ix-num">Points now</th><th scope="col" className="ix-num">Store credit</th><th scope="col" className="ix-num">Total bought</th><th scope="col">Last buy</th></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.phone} onClick={open(m)}>
                    <td><Link href={`/member-detail?phone=${m.phone}`} className="ix-strong">{m.name}</Link></td>
                    <td><TierBadge m={m} /></td>
                    <td className="ix-num">{pts(m.points)}{m.expiring ? <span className="ix-warn"> · {pts(m.expiring)} expire soon</span> : null}</td>
                    <td className="ix-num">{m.wallet ? money(m.wallet) : '—'}</td>
                    <td className="ix-num">{money(m.bought)}</td>
                    <td className="ix-muted">{m.last ? formatDate(m.last) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        {data && shown.length > PAGE
          ? <Pager label={`${cur * PAGE + 1}–${Math.min(shown.length, cur * PAGE + PAGE)} of ${pts(shown.length)}`} atStart={cur === 0} atEnd={cur >= pages - 1} prev={() => setPage(cur - 1)} next={() => setPage(cur + 1)} />
          : <div className="ix-foot"><span>{plural(shown.length, 'member')}</span></div>}
      </section>
      <LearnMore topic="members" />

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
