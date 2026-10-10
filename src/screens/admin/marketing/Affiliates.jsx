'use client';
// Affiliates (/admin/affiliates?view=all|Pending|Active|Paused|Rejected) — people and agencies who bring stores to
// GridCommerce for a commission. Adapted from the merchant panel's Referrals (screens/loyalty-promo/Referrals.jsx) and
// the affiliate payouts in Liabilities. Title row (Commission rules, Export, Add affiliate), the line of five figures
// (active, pending approvals, referrals, paid conversions, commission pending), the directory with its status tabs
// (Approve / Reject right on a pending row), then Payouts: To approve · To pay · Paid · Rejected; a payout opens its
// side panel (approve: Finance or an admin, never the person who asked; pay with a transaction ID used once).
// A row opens the affiliate (/admin/affiliates/view?id=). Data: lib/admin/marketing2.js › affRows, affSummary,
// payoutRows, approveAffiliate, rejectAffiliate (+ AffShared.jsx side panels).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import { AFF_STATUS, PAYOUT_STATUS, affRows, affSummary, payoutRows, ruleText, approveAffiliate, rejectAffiliate } from '@/lib/admin/marketing2';
import { AdminShell } from '../AdminShell';
import { MK_CSS, useMk2, Skeleton, ReasonDialog, money, num, plural, copyText, dayTime } from './mk2Shared';
import { AFF_CSS, AffFormSheet, RulesSheet, PayoutSheet } from './AffShared';

const VIEWS = [['all', 'All'], ['Pending', 'Pending'], ['Active', 'Active'], ['Paused', 'Paused'], ['Rejected', 'Rejected']];
const PVIEWS = [['Pending', 'To approve'], ['Approved', 'To pay'], ['Paid', 'Paid'], ['Rejected', 'Rejected']];
const PAGE = 20;
const ABOUT = 'Affiliates are YouTubers, agencies, trainers and community admins who bring shops to GridCommerce with their own referral code and links. They earn a commission when a referred store pays, by the rule they are on (a percent, a fixed amount, a percent for some months, or a campaign amount). Commission waits 30 days (the refund window), then is due; a payout is asked for, approved by Finance or an admin who did not ask for it, and paid by bKash, Nagad or bank with the transaction ID.';

const CSS = `
.af-tools{display:flex;align-items:center;gap:var(--space-2);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.af-tools .ix-search{flex:1 1 220px;max-width:320px}
.af-code{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:none;font:inherit;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);cursor:pointer}
.af-code svg{color:var(--text-muted)}
.af-code:hover,.af-code:hover svg{color:var(--primary)}
.af-acts{display:inline-flex;gap:var(--space-1)}
`;

export default function Affiliates() {
  const router = useRouter();
  const { data, t, live } = useMk2();
  const [view, setView] = useState('all');
  const [pview, setPview] = useState('Pending');
  const [s, setS] = useState('');
  const [page, setPage] = useState(0);
  const [ppage, setPpage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [rules, setRules] = useState(false);
  const [payout, setPayout] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (VIEWS.some(([k]) => k === p.get('view'))) setView(p.get('view'));
    if (p.get('payout')) setPayout(p.get('payout'));
    if (p.get('rules') === '1') setRules(true);
  }, []);
  useEffect(() => { setPage(0); }, [view, s]);
  const pick = (k) => { setView(k); const p = new URLSearchParams(); if (k !== 'all') p.set('view', k); window.history.replaceState(window.history.state, '', window.location.pathname + (p.toString() ? '?' + p : '')); };

  if (!live) return <AdminShell active="affiliates" title="Affiliates"><style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} /><Skeleton label="Loading affiliates" /></AdminShell>;

  const rows = affRows(data, t);
  const sum = affSummary(data, t);
  const needle = s.trim().toLowerCase();
  const digits = needle.replace(/\D/g, '');
  const list = rows.filter((a) => (view === 'all' || a.status === view) && (!needle || (a.name + ' ' + a.org + ' ' + a.id + ' ' + a.code + ' ' + a.email + ' ' + a.district).toLowerCase().includes(needle) || (digits.length >= 3 && a.phone.replace(/\D/g, '').includes(digits))))
    .sort((a, b) => (b.status === 'Pending') - (a.status === 'Pending') || b.earned - a.earned || b.appliedAt - a.appliedAt);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = list.slice(pg * PAGE, pg * PAGE + PAGE);
  const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'af-tab-' + k, label, count: k === 'all' ? rows.length : rows.filter((a) => a.status === k).length, on: view === k, onClick: () => pick(k) }));

  const pays = payoutRows(data);
  const plist = pays.filter((p) => p.status === pview);
  const ppages = Math.max(1, Math.ceil(plist.length / 10));
  const ppg = Math.min(ppage, ppages - 1);
  const pshown = plist.slice(ppg * 10, ppg * 10 + 10);
  const ptabs = PVIEWS.map(([k, label]) => ({ key: k, id: 'po-tab-' + k, label, count: pays.filter((p) => p.status === k).length, on: pview === k, onClick: () => { setPview(k); setPpage(0); } }));

  const approve = (a, e) => { if (e) e.stopPropagation(); const r = approveAffiliate(a.id); toast(r.ok ? `${a.name} approved · referral link made` : r.error, r.ok ? undefined : { tone: 'error' }); };
  const exportCsv = () => {
    downloadCsv('gridcommerce-affiliates.csv', [
      ['Affiliate ID', 'Name', 'Channel or agency', 'Type', 'District', 'Mobile', 'Email', 'Referral code', 'Commission rule', 'Referrals', 'Paid conversions', 'Earned (BDT)', 'Paid out (BDT)', 'Unpaid (BDT)', 'Status', 'Applied'],
      ...list.map((a) => [a.id, a.name, a.org, a.kind, a.district, a.phone, a.email, a.code, a.ruleObj ? a.ruleObj.name : a.rule, a.referrals, a.conversions, a.earned, a.paid, a.pending, a.status, dmy(a.appliedAt)]),
    ]);
    toast(plural(list.length, 'affiliate') + ' exported');
  };
  const open = (id) => router.push('/admin/affiliates/view?id=' + id);

  return (
    <AdminShell active="affiliates" title="Affiliates">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + AFF_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="handshake" title="Affiliates" about={ABOUT}
          secondary={[{ label: 'Commission rules', icon: 'percent', onClick: () => setRules(true) }, { label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'Promotions', href: '/admin/promotions' }]}
          primary={{ label: 'Add affiliate', icon: 'plus', onClick: () => setAdding(true) }} />

        <MetricStrip label="Affiliates at a glance" items={[
          { label: 'Active affiliates', value: num(sum.active), icon: 'users' },
          { label: 'Pending approvals', value: num(sum.pending), icon: 'user-plus', onClick: () => pick('Pending') },
          { label: 'Referrals', value: num(sum.referrals), sub: `${num(sum.referrals30)} in 30 days`, icon: 'link' },
          { label: 'Paid conversions', value: num(sum.conversions), icon: 'store' },
          { label: 'Commission pending', value: money(sum.commissionPending), sub: sum.toApprove ? `${sum.toApprove} to approve` : undefined },
        ]} />

        <section className="ix-card" aria-label="Affiliates">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Affiliates by status" /></div>
          <div className="af-tools"><SearchField value={s} onChange={(e) => setS(e.target.value)} placeholder="Search name, code, ID or mobile" /></div>
          {!list.length ? (
            <div className="ix-empty">{needle ? <EmptyState title="No affiliates match." actionLabel="Clear search" onAction={() => setS('')} /> : <EmptyState icon="handshake" title={view === 'Pending' ? 'No applications waiting.' : 'No affiliates here.'} actionLabel="Add affiliate" onAction={() => setAdding(true)} />}</div>
          ) : (<>
            <ul className="ix-plist" aria-label="Affiliates">
              {shown.map((a) => (
                <li key={a.id}><Link href={'/admin/affiliates/view?id=' + a.id} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{a.name}</b><StatusBadge tone={AFF_STATUS[a.status]}>{a.status}</StatusBadge></span>
                  <span className="ix-pitem__mid">{a.org || a.kind} · {a.code}</span>
                  <span className="ix-pitem__mid">{plural(a.referrals, 'referral')} · {num(a.conversions)} paid · {money(a.earned)} earned</span>
                </Link></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Affiliates</caption>
                <thead><tr>
                  <th scope="col">Affiliate</th><th scope="col">Contact</th><th scope="col">Code</th><th scope="col" className="ix-num">Referrals</th><th scope="col" className="ix-num">Paid</th>
                  <th scope="col">Commission</th><th scope="col" className="ix-num">Earned</th><th scope="col">Status</th>
                </tr></thead>
                <tbody>
                  {shown.map((a) => (
                    <tr key={a.id} tabIndex={0} onClick={() => open(a.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(a.id); }}>
                      <td><span className="mk-cell"><Link href={'/admin/affiliates/view?id=' + a.id} className="ix-strong" onClick={(e) => e.stopPropagation()}>{a.name}</Link><span className="mk-sub"><span className="mk-data">{a.id}</span> · {a.org || a.kind}</span></span></td>
                      <td><span className="mk-cell"><span className="mk-data">{a.phone}</span><span className="mk-sub">{a.email || '—'}</span></span></td>
                      <td><button type="button" className="af-code" onClick={(e) => { e.stopPropagation(); copyText(a.code, `${a.code} copied`); }} aria-label={'Copy code ' + a.code}>{a.code}<Icon name="copy" width="14" height="14" aria-hidden="true" /></button></td>
                      <td className="ix-num mk-data">{num(a.referrals)}</td>
                      <td className="ix-num mk-data">{num(a.conversions)}</td>
                      <td><span className="mk-cell" style={{ maxWidth: 220 }}><span className="mk-sub" style={{ color: 'var(--text-body)' }} title={ruleText(a.ruleObj)}>{ruleText(a.ruleObj)}</span></span></td>
                      <td className="ix-num"><span className="mk-cell" style={{ alignItems: 'flex-end' }}><span className="mk-fig">{money(a.earned)}</span>{a.pending ? <span className="mk-sub">{money(a.pending)} unpaid</span> : null}</span></td>
                      <td>{a.status === 'Pending' ? (
                        <span className="af-acts">
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={(e) => approve(a, e)}>Approve</button>
                          <button type="button" className="ix-btn ix-btn--sm" onClick={(e) => { e.stopPropagation(); setRejecting(a); }}>Reject</button>
                        </span>
                      ) : <StatusBadge tone={AFF_STATUS[a.status]}>{a.status}</StatusBadge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>)}
          <Pager label={list.length ? `${pg * PAGE + 1}–${pg * PAGE + shown.length} of ${list.length}` : '0 affiliates'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        </section>

        <section className="ix-card" aria-labelledby="af-payouts">
          <header className="ix-card__head"><div><h2 id="af-payouts">Payouts</h2><p className="ix-card__sub">Asked for → approved by someone else → paid</p></div></header>
          <div className="ix-bar"><IndexTabs tabs={ptabs} label="Payouts by step" /></div>
          {!plist.length ? <div className="ix-empty"><EmptyState icon="wallet" title={pview === 'Pending' ? 'No payouts waiting for approval.' : pview === 'Approved' ? 'Nothing waiting to be paid.' : 'None yet.'} actionLabel={pview !== 'Paid' ? 'Show paid' : undefined} onAction={() => setPview('Paid')} /></div> : (<>
            <ul className="ix-plist" aria-label="Payouts">
              {pshown.map((p) => (
                <li key={p.id}><button type="button" className="ix-pitem" onClick={() => setPayout(p.id)}>
                  <span className="ix-pitem__top"><b>{p.affiliate ? p.affiliate.name : p.aff}</b><span className="mk-fig">{money(p.amount)}</span></span>
                  <span className="ix-pitem__mid">{p.id} · {p.method} · asked by {p.requestedBy} {dayTime(p.requestedAt)}</span>
                </button></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Payouts</caption>
                <thead><tr><th scope="col">Payout</th><th scope="col">Affiliate</th><th scope="col" className="ix-num">Amount</th><th scope="col">Send by</th><th scope="col">Asked by</th><th scope="col">{pview === 'Paid' ? 'Paid' : pview === 'Approved' ? 'Approved by' : 'Status'}</th></tr></thead>
                <tbody>
                  {pshown.map((p) => (
                    <tr key={p.id} tabIndex={0} onClick={() => setPayout(p.id)} onKeyDown={(e) => { if (e.key === 'Enter') setPayout(p.id); }}>
                      <td className="mk-data">{p.id}</td>
                      <td>{p.affiliate ? p.affiliate.name : p.aff}</td>
                      <td className="ix-num mk-fig">{money(p.amount)}</td>
                      <td><span className="mk-cell"><span>{p.method}</span><span className="mk-sub mk-data">{p.to}</span></span></td>
                      <td><span className="mk-cell"><span>{p.requestedBy}</span><span className="mk-sub">{dayTime(p.requestedAt)}</span></span></td>
                      <td>{pview === 'Paid' ? <span className="mk-cell"><span className="mk-data">{p.txn}</span><span className="mk-sub">{dayTime(p.paidAt)}</span></span>
                        : pview === 'Approved' ? <span className="mk-cell"><span>{p.approvedBy}</span><span className="mk-sub">{dayTime(p.approvedAt)}</span></span>
                          : <StatusBadge tone={PAYOUT_STATUS[p.status]}>{p.status === 'Pending' ? 'To approve' : p.status}</StatusBadge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>)}
          <Pager label={`${plural(plist.length, 'payout')} · ${money(plist.reduce((a, p) => a + p.amount, 0))}`} atStart={ppg === 0} atEnd={ppg >= ppages - 1} prev={() => setPpage(ppg - 1)} next={() => setPpage(ppg + 1)} />
        </section>
      </div>

      <AffFormSheet open={adding} data={data} onClose={() => setAdding(false)} onDone={(id) => open(id)} />
      <RulesSheet open={rules} data={data} onClose={() => setRules(false)} />
      <PayoutSheet id={payout} data={data} t={t} onClose={() => setPayout(null)} />
      <ReasonDialog open={!!rejecting} title={rejecting ? `Reject ${rejecting.name}?` : ''} body="They are told by email that the application was not accepted." confirmLabel="Reject" danger onClose={() => setRejecting(null)}
        onConfirm={(reason) => { const r = rejectAffiliate(rejecting.id, reason); if (r.ok) { toast(`${rejecting.name} rejected`); setRejecting(null); } return r; }} />
    </AdminShell>
  );
}
