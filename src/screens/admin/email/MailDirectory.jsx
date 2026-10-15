'use client';
// Business email › Directory (/admin/email?tab=) — every store's mail domain: DNS health (MX, SPF, DKIM, DMARC), mailboxes
// used of paid, storage, last sign-in, plan, what it earns a month against the provider's cost. Tabs: All · Problems
// (DNS failing, near quota, complaints) · Suspended. Usage alerts on top (near quota, DNS failing for 3+ days). A row opens
// the domain: its mailboxes, suspend a mailbox or the whole domain with a reason (logged, the owner sees it), restore.
// Data: lib/platform/mail.js (shared with the merchants' Settings › Business email).

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from '@/runtime/ui';
import { ShopHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { staff as currentStaff } from '@/lib/platform/store';
import { read, EVENT, KEY, stateOf, mailboxesOf, address, RECORDS, alerts, suspendDomain, restoreDomain, suspendMailbox, updateMailbox, logOf } from '@/lib/platform/mail';
import { AdminShell } from '../AdminShell';

const CSS = `
.md-dns{display:inline-flex;gap:4px}
.md-dns span{padding:1px 6px;border-radius:var(--radius-full);font-family:var(--font-data);font-size:var(--text-xs);background:var(--fill-success-soft,var(--surface-subtle));color:var(--text-success)}
.md-dns span.is-bad{background:var(--fill-error-soft,var(--surface-subtle));color:var(--text-danger)}
.md-dns span.is-wait{background:var(--surface-subtle);color:var(--text-muted)}
.md-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.md-alerts{display:flex;flex-direction:column;gap:6px;margin:0;padding:var(--space-3) var(--space-4);list-style:none}
.md-alerts li{display:flex;gap:8px;align-items:center;font-size:var(--text-sm)}
.md-pad{display:flex;flex-direction:column;gap:var(--space-3)}
.md-pad h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.md-box{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.md-box small{color:var(--text-muted);font-size:var(--text-xs)}
.md-box .gc-btn{margin-left:auto}
`;
const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
const gb = (mb) => (mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : Math.round(mb) + ' MB');
const ago = (ms) => { if (!ms) return 'never'; const d = Math.floor((Date.now() - ms) / 864e5); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; };

function useMailData() {
  const [s, set] = useState({ ready: false, tick: 0 });
  useEffect(() => {
    const load = () => set((x) => ({ ready: true, tick: x.tick + 1 }));
    load();
    const onStorage = (e) => { if (!e.key || e.key === KEY) load(); };
    window.addEventListener(EVENT, load); window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(EVENT, load); window.removeEventListener('storage', onStorage); };
  }, []);
  return s;
}

export default function MailDirectory() {
  const { ready, tick } = useMailData();
  const me = currentStaff();
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState(null);
  const [why, setWhy] = useState('');
  const rows = useMemo(() => (ready ? read().domains.filter((d) => d.state !== 'setup' || d.verify).map((d) => ({ d, st: stateOf(d), boxes: mailboxesOf(d.id) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const problem = (x) => x.st.dnsFailingDays > 0 || !x.st.dnsOk || x.st.nearQuota.length > 0 || (x.d.complaints || []).length > 0;
  const shown = rows.filter((x) => (tab === 'all' ? true : tab === 'problems' ? problem(x) && x.d.state !== 'suspended' : x.d.state === 'suspended'));
  const tabs = [['all', 'All'], ['problems', 'Problems'], ['suspended', 'Suspended']].map(([k, l]) => ({ key: k, id: 'md-tab-' + k, label: l, count: ready ? rows.filter((x) => (k === 'all' ? true : k === 'problems' ? problem(x) && x.d.state !== 'suspended' : x.d.state === 'suspended')).length : null, on: tab === k, onClick: () => setTab(k) }));
  const active = rows.filter((x) => x.d.state === 'active');
  const revenue = active.reduce((a, x) => a + x.st.monthly, 0);
  const cost = active.reduce((a, x) => a + x.st.cost, 0);
  const seats = active.reduce((a, x) => a + x.st.seatsUsed, 0);
  const al = ready ? alerts() : [];
  const row = open ? rows.find((x) => x.d.id === open) : null;
  const say = (r, ok) => { if (!r.ok) { toast(r.error, { tone: 'error' }); return false; } toast(ok); return true; };
  const dns = (st) => <span className="md-dns">{RECORDS.map((k) => <span key={k} className={st.dns[k] === 'ok' ? '' : st.dns[k] === 'failed' ? 'is-bad' : 'is-wait'} title={k.toUpperCase() + ': ' + st.dns[k]}>{k.toUpperCase()}</span>)}</span>;

  return (
    <AdminShell active="mail-directory" title="Business email">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page">
        <ShopHeader icon="mail" title="Business email"
          about="Every store's mail domain and mailboxes: DNS health, storage, sign-ins, what it earns against what the provider costs, and the alerts to act on. Suspend a mailbox or a domain for abuse; the owner sees the reason."
          secondary={[{ label: 'Plans & provider', href: '/admin/email/plans' }]} more={[{ label: 'Abuse & limits', href: '/admin/email/abuse' }]} />
        {ready ? <MetricStrip label="This month" items={[
          { label: 'Mail revenue', value: tk(revenue), sub: active.length + ' domains · ' + seats + ' mailboxes', icon: 'banknote' },
          { label: 'Provider cost', value: tk(cost), sub: seats ? tk(Math.round(cost / seats)) + ' a mailbox' : '', icon: 'server' },
          { label: 'Margin', value: revenue ? Math.round(((revenue - cost) / revenue) * 100) + '%' : '—', icon: 'trending-up' },
        ]} /> : null}
        {al.length ? (
          <section className="ix-card" aria-label="Alerts"><div className="ix-card__head"><h2>Alerts</h2></div>
            <ul className="md-alerts">{al.map((a, i) => <li key={i}><StatusBadge tone={a.tone}>{a.tone === 'error' ? 'DNS' : a.tone === 'warning' ? 'Quota' : 'Suspended'}</StatusBadge><button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left', color: 'inherit' }} onClick={() => setOpen(a.domainId)}>{a.text}</button></li>)}</ul>
          </section>
        ) : null}
        <section className="ix-card" aria-label="Mail domains">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Mail domains" /></div>
          {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : shown.length ? (<>
            <ul className="ix-plist">{shown.map((x) => <li key={x.d.id}><button type="button" className="ix-pitem" onClick={() => setOpen(x.d.id)}><span className="ix-pitem__top"><b>{x.d.domain}</b><StatusBadge tone={x.d.state === 'active' ? (problem(x) ? 'warning' : 'success') : x.d.state === 'suspended' ? 'error' : 'neutral'}>{x.d.state === 'active' ? (problem(x) ? 'Needs a look' : 'Healthy') : x.d.state === 'suspended' ? 'Suspended' : 'Setting up'}</StatusBadge></span><span className="ix-pitem__mid">{x.d.shopName} · {x.st.seatsUsed}/{x.d.seats} mailboxes · {tk(x.st.monthly)}/mo</span></button></li>)}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Mail domains</caption>
                <thead><tr><th scope="col">Domain</th><th scope="col">DNS</th><th scope="col">Mailboxes</th><th scope="col">Storage</th><th scope="col">Last sign-in</th><th scope="col" className="ix-num">A month</th><th scope="col">Status</th></tr></thead>
                <tbody>{shown.map((x) => (
                  <tr key={x.d.id} onClick={() => setOpen(x.d.id)}>
                    <td><b className="ix-strong">{x.d.domain}</b><span className="md-sub">{x.d.shopName} · #{x.d.shopId}</span></td>
                    <td>{dns(x.st)}{x.st.dnsFailingDays ? <span className="md-sub" style={{ color: 'var(--text-danger)' }}>failing {x.st.dnsFailingDays} days</span> : null}</td>
                    <td>{x.st.seatsUsed} of {x.d.seats}<span className="md-sub">{x.st.plan.name}{x.d.cycle === 'yearly' ? ' · yearly' : ''}</span></td>
                    <td>{gb(x.st.usedMB)} / {x.st.storageGB} GB{x.st.nearQuota.length ? <span className="md-sub" style={{ color: 'var(--text-warning)' }}>{x.st.nearQuota.length} near full</span> : null}</td>
                    <td className="ix-muted">{ago(Math.max(0, ...x.boxes.map((m) => m.lastSignIn || 0)))}</td>
                    <td className="ix-num">{tk(x.st.monthly)}<span className="md-sub">cost {tk(x.st.cost)}</span></td>
                    <td><StatusBadge tone={x.d.state === 'active' ? (problem(x) ? 'warning' : 'success') : x.d.state === 'suspended' ? 'error' : 'neutral'}>{x.d.state === 'active' ? (problem(x) ? 'Needs a look' : 'Healthy') : x.d.state === 'suspended' ? 'Suspended' : 'Setting up'}</StatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="mail" title="Nothing here" /></div>}
          <div className="ix-foot"><span>{shown.length} domains</span></div>
        </section>
      </div>
      <Sheet open={!!row} title={row ? row.d.domain : ''} onClose={() => { setOpen(null); setWhy(''); }} footer={row ? (row.d.state === 'suspended'
        ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => say(restoreDomain(row.d.id, me.name), 'Domain restored')}>Restore the domain</button>
        : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={() => { if (say(suspendDomain(row.d.id, why, me.name), 'Domain suspended · the owner is told why')) setWhy(''); }}>Suspend the whole domain</button>) : null}>
        {row ? (
          <div className="md-pad">
            <KV rows={[['Store', `${row.d.shopName} (#${row.d.shopId})`], ['Plan', `${row.st.plan.name} · ${row.d.seats} mailboxes · ${row.d.cycle}`], ['Earns', `${tk(row.st.monthly)} a month · provider cost ${tk(row.st.cost)}`], ['DNS', row.st.dnsOk ? 'All four working' : RECORDS.filter((k) => row.st.dns[k] !== 'ok').map((k) => k.toUpperCase() + ' ' + row.st.dns[k]).join(', ')], ['Shop emails', row.st.shopSending ? 'From its own domain' : 'From GridCommerce'], row.d.suspended ? ['Suspended', `${row.d.suspended.reason} · ${row.d.suspended.by}`] : null].filter(Boolean)} />
            {(row.d.complaints || []).length ? <><h3>Spam complaints</h3>{row.d.complaints.map((c, i) => <div key={i} className="md-box"><b>{c.count} complaints</b><small>{new Date(c.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{c.note ? ' · ' + c.note : ''}</small></div>)}</> : null}
            <h3>Mailboxes</h3>
            {row.boxes.map((m) => (
              <div key={m.id} className="md-box">
                <span><b style={{ fontWeight: 'var(--weight-medium)' }}>{address(row.d, m.local)}</b><small style={{ display: 'block' }}>{m.name} · {gb(m.usedMB)} of {m.storageGB} GB · signed in {ago(m.lastSignIn)}{m.status === 'suspended' ? ' · suspended' + (m.suspendReason ? ': ' + m.suspendReason : '') : ''}</small></span>
                {m.status === 'suspended' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(updateMailbox(m.id, { status: 'active', suspendReason: '', suspendedBy: '' }, 'Restored by GridCommerce'), 'Mailbox restored')}>Restore</button>
                  : <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(suspendMailbox(m.id, why, me.name), 'Mailbox suspended · the owner is told why')}>Suspend</button>}
              </div>
            ))}
            {row.d.state !== 'suspended' ? <div><label className="gc-label" htmlFor="md-why">Reason (needed to suspend; the owner sees it)</label><input id="md-why" className="gc-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. 46 spam complaints in a day" /></div> : null}
            <h3>History</h3>
            {logOf(row.d.shopId).slice(0, 8).map((x, i) => <div key={i} className="md-box"><span>{x.text}<small style={{ display: 'block' }}>{new Date(x.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {x.by}</small></span></div>)}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
