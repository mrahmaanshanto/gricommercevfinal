'use client';
// Merchant AI › Usage & credits (/admin/merchant-ai) — every store's Grid AI this month: AI turns, what it cost
// GridCommerce, the allowance (plan + credits), how much is used, the rule at the limit, and the status (active, trial,
// over allowance, suspended). A row opens the store: give credits, change the limit rule or the rate limit, suspend or
// restore its AI, and its history. Data: lib/admin/merchantAi.js over lib/platform's stores. Worked out after loading.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ShopHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { useAdminStore } from '@/lib/admin/store';
import { merchantAi, usageRows, totals, grantCredits, setPolicy, setRate, suspendAi, restoreAi, POLICIES, POLICY_WORD, STATUS_TONE } from '@/lib/admin/merchantAi';
import { taka, num, dmy } from '@/lib/platform/util';
import { AdminShell, usePlatform } from '../AdminShell';
import { MAI_CSS } from './maiShared';

const TABS = [['all', 'All'], ['over', 'Over allowance'], ['trial', 'Trial'], ['suspended', 'Suspended']];
const inTab = (r, tab) => tab === 'all' || (tab === 'over' ? r.over : tab === 'trial' ? r.trial : r.status === 'Suspended');

export default function MaiUsage() {
  const { db, t, live } = usePlatform();
  const s = useAdminStore(merchantAi);
  const ready = live && s.live;
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ credits: '', reason: '', rate: '', suspend: '' });
  const rows = ready ? usageRows(db, t, s.data) : [];
  const tot = ready ? totals(rows) : null;
  const shown = rows.filter((r) => inTab(r, tab) && (!q || r.name.toLowerCase().includes(q.toLowerCase())));
  const row = open ? rows.find((r) => r.id === open) : null;
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'mai-tab-' + k, label: l, count: ready ? rows.filter((r) => inTab(r, k)).length : null, on: tab === k, onClick: () => setTab(k) }));
  const done = (res, msg) => { if (!res.ok) { toast(res.error, { tone: 'error' }); return false; } toast(msg); return true; };
  const openRow = (r) => { setOpen(r.id); setForm({ credits: '', reason: '', rate: String(r.rate), suspend: '' }); };

  return (
    <AdminShell active="mai-usage" title="Merchant AI usage">
      <style dangerouslySetInnerHTML={{ __html: MAI_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="bot" title="Usage & credits"
          about="Every store's Grid AI this month: AI turns, what the providers charged GridCommerce, the store's allowance (its plan's AI allowance plus any credits given), how much is used and what happens at the limit. Give credits, change the rule at the limit or the rate limit, or suspend a store's AI from the store's row. Stores see the result in Grid AI › Usage & billing."
          secondary={[{ label: 'AI plans & limits', href: '/admin/merchant-ai/plans' }]}
          more={[{ label: 'Models & cost', href: '/admin/merchant-ai/models' }, { label: 'Credits & adjustments', href: '/admin/credits' }]} />
        {ready ? <MetricStrip label="This month" items={[
          { label: 'Stores using Grid AI', value: num(tot.stores), sub: tot.trial + ' on trial', icon: 'store' },
          { label: 'AI turns', value: num(tot.turns), sub: num(tot.orders) + ' orders from chats', icon: 'bot' },
          { label: 'Provider cost', value: taka(tot.cost), sub: taka(Math.round(tot.cost / Math.max(1, tot.stores))) + ' a store', icon: 'cpu' },
          { label: 'Over allowance', value: num(tot.over), sub: taka(tot.overage) + ' overage billed', icon: 'gauge', onClick: () => setTab('over'), on: tab === 'over' },
          { label: 'AI suspended', value: num(tot.suspended), icon: 'ban', onClick: () => setTab('suspended'), on: tab === 'suspended' },
        ]} /> : <div className="mai-skel mai-skel--strip" aria-hidden="true" />}

        <section className="ix-card" aria-label="Stores">
          <div className="ix-bar">
            <IndexTabs tabs={tabs} label="Stores" />
            <span className="ix-tools"><span className="ix-search" style={{ minWidth: 200 }}><Icon name="search" width="16" height="16" aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stores" aria-label="Search stores" /></span></span>
          </div>
          {!ready ? <div className="mai-skel" aria-busy="true" /> : !shown.length ? <div className="ix-empty"><EmptyState icon="bot" title="No stores here" /></div> : (<>
            <ul className="ix-plist" aria-label="Stores">{shown.slice(0, 60).map((r) => (
              <li key={r.id}><button type="button" className="ix-pitem" onClick={() => openRow(r)}>
                <span className="ix-pitem__top"><b>{r.name}</b><StatusBadge tone={STATUS_TONE[r.status]}>{r.status}</StatusBadge></span>
                <span className="ix-pitem__mid">{r.plan} · {taka(r.cost)} of {taka(r.allowance)} ({r.used}%)</span>
              </button></li>
            ))}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Stores and their AI use</caption>
                <thead><tr><th scope="col">Store</th><th scope="col">Plan</th><th scope="col" className="ix-num">AI turns</th><th scope="col" className="ix-num">Cost</th><th scope="col">Allowance used</th><th scope="col">At the limit</th><th scope="col">Status</th></tr></thead>
                <tbody>{shown.slice(0, 60).map((r) => (
                  <tr key={r.id} onClick={() => openRow(r)}>
                    <td><button type="button" className="ga-name" onClick={() => openRow(r)}>{r.name}</button><span className="mai-sub">{r.id}</span></td>
                    <td>{r.plan}{r.trial ? <span className="mai-sub">Trial</span> : null}</td>
                    <td className="ix-num">{num(r.turns)}</td>
                    <td className="ix-num">{taka(r.cost)}</td>
                    <td><span className="mai-use"><span className={'mai-bar' + (r.used >= 100 ? ' is-over' : r.used >= 80 ? ' is-warn' : '')} aria-hidden="true"><i style={{ width: Math.min(100, r.used) + '%' }} /></span><span className="mai-n">{r.used}% of {taka(r.allowance)}</span></span></td>
                    <td className="ix-muted">{POLICY_WORD[r.policy]}</td>
                    <td><StatusBadge tone={STATUS_TONE[r.status]}>{r.status}</StatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{ready ? (shown.length > 60 ? 'First 60 of ' + shown.length : shown.length) + ' stores' : ''}</span></div>
        </section>
      </div>

      <Sheet open={!!row} title={row ? row.name : ''} onClose={() => setOpen(null)}
        footer={row ? <div className="mai-foot">{row.status === 'Suspended' && row.reason !== 'Store suspended'
          ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => done(restoreAi(row.id), 'AI restored for ' + row.name)}>Restore AI</button>
          : row.reason === 'Store suspended' ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>The whole store is suspended (Licences).</span>
            : <button type="button" className="gc-btn gc-btn--sm gc-btn--error" onClick={() => { if (done(suspendAi(row.id, form.suspend), 'AI suspended for ' + row.name)) setForm({ ...form, suspend: '' }); }}>Suspend AI</button>}
          <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={'/admin/merchant?id=' + row.id}>Open the store</Link></div> : null}>
        {row ? (
          <div className="mai-body">
            <div className="mai-badges"><StatusBadge tone={STATUS_TONE[row.status]}>{row.status}</StatusBadge><span className="ix-muted">{row.plan} · {row.state}</span></div>
            {row.reason ? <p className="mai-note is-error">{row.reason}</p> : null}
            <KV rows={[['AI turns this month', num(row.turns)], ['Conversations', num(row.convs)], ['Orders from chats', num(row.orders)], ['Provider cost', taka(row.cost)], ['Allowance', taka(row.allowance) + (row.credits ? ' (' + taka(row.credits) + ' credits)' : '')], ['Used', row.used + '%'], ['Overage billed', row.overage ? taka(row.overage) : '—'], ['Autopilot in plan', row.autopilot ? 'Yes' : 'No'], ['Rate limit', row.rate + ' AI replies a minute']]} />
            <div className="mai-group">
              <h3>Give AI credits</h3>
              <div className="mai-row"><input className="gc-input" inputMode="numeric" placeholder="Amount (৳)" aria-label="Credits in taka" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} /><input className="gc-input" placeholder="Why (the store sees it)" aria-label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { if (done(grantCredits(row.id, form.credits, form.reason), taka(Number(form.credits)) + ' credits given')) setForm({ ...form, credits: '', reason: '' }); }}>Give</button></div>
            </div>
            <div className="mai-group">
              <h3>At the allowance</h3>
              <select className="gc-input gc-select" aria-label="At the allowance" value={row.policy} onChange={(e) => done(setPolicy(row.id, e.target.value), 'Saved: ' + POLICY_WORD[e.target.value])}>{POLICIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </div>
            <div className="mai-group">
              <h3>Rate limit</h3>
              <div className="mai-row"><input className="gc-input" inputMode="numeric" aria-label="AI replies a minute" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /><span className="ix-muted">AI replies a minute</span><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => done(setRate(row.id, form.rate), 'Rate limit saved')}>Save</button></div>
            </div>
            {row.status !== 'Suspended' ? (
              <div className="mai-group">
                <h3>Suspend this store’s AI</h3>
                <input className="gc-input" placeholder="Reason (the store owner sees it)" aria-label="Reason for suspending" value={form.suspend} onChange={(e) => setForm({ ...form, suspend: e.target.value })} />
                <p className="gc-help" style={{ margin: 0 }}>Autopilot, Copilot and the assistant stop for this store. Its data and settings stay.</p>
              </div>
            ) : null}
            {row.history.length ? (
              <div className="mai-group"><h3>History</h3><ul className="mai-hist">{row.history.map((h, i) => <li key={i}><b>{h.text}</b><span>{h.by} · {dmy(h.at)}</span></li>)}</ul></div>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
