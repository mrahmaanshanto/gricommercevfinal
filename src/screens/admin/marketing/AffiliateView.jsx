'use client';
// Affiliate (/admin/affiliates/view?id=AF-1001&tab=overview) — one affiliate on one page, laid out like the lead and
// merchant records: RecordHeader (status, Call / Email, the next step as the main button: Approve, Request payout or
// Resume; the rest under More), then the tabs Overview · Referral links · Referrals · Commissions · Payouts · Payment info ·
// Materials · Notes. Referrals that became stores link to /admin/merchant?id= and read the store's live state.
// Data: lib/admin/marketing2.js (approveAffiliate, rejectAffiliate, pauseAffiliate, resumeAffiliate, setAffiliateRule,
// addLink, addAffNote, sendMaterial, adjustCommission, requestPayout) + AffShared.jsx side panels.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge, EmptyState, Sheet } from '@/components/ui';
import { RecordHeader, IndexTabs, KV } from '@/components/ui/IndexKit';
import { dmy, dm } from '@/lib/platform/util';
import {
  AFF_STATUS, COM_STATUS, PAYOUT_STATUS, MATERIALS, MIN_PAYOUT, HOLD_DAYS, affRow, refRows, comRows, payoutRows, ruleText,
  approveAffiliate, rejectAffiliate, pauseAffiliate, resumeAffiliate, setAffiliateRule, addLink, addAffNote, sendMaterial, requestPayout,
} from '@/lib/admin/marketing2';
import { AdminShell } from '../AdminShell';
import { MK_CSS, useMk2, Skeleton, ReasonDialog, Field, ctl, money, num, plural, copyText, dayTime } from './mk2Shared';
import { AFF_CSS, AffFormSheet, RulesSheet, PayoutSheet, AdjustSheet, storeLabel } from './AffShared';

const TABS = [['overview', 'Overview'], ['links', 'Referral links'], ['referrals', 'Referrals'], ['commissions', 'Commissions'], ['payouts', 'Payouts'], ['payment', 'Payment info'], ['materials', 'Materials'], ['notes', 'Notes']];
const TAB_KEYS = TABS.map((x) => x[0]);
const PAGES = [['https://gridcommerce.net/', 'Home page'], ['https://gridcommerce.net/pricing', 'Pricing'], ['https://gridcommerce.net/start', 'Start free trial'], ['https://gridcommerce.net/features/pos', 'POS'], ['https://gridcommerce.net/webinar', 'Webinar']];
const ABOUT = 'One affiliate on one page: contact and audience, the commission rule, referral links with clicks, every store they referred and its state, commission line by line (held for 30 days after each payment, then due), payouts, payment details, the materials sent to them and notes.';

const CSS = `
.av-figs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--space-2)}
.av-figs div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.av-figs span{font-size:var(--text-xs);color:var(--text-muted)}
.av-figs b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.av-link{display:flex;flex-direction:column;gap:6px;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.av-links>.av-link:first-child{border-top:0}
.av-link__top{display:flex;align-items:center;gap:var(--space-2)}
.av-link__top b{flex:1;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.av-url{display:block;padding:6px 8px;border-radius:var(--radius-md);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);overflow-wrap:anywhere}
.av-note{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle)}
.av-note p{margin:0;font-size:var(--text-sm);color:var(--text-heading);white-space:pre-line}
.av-note small{font-size:var(--text-xs);color:var(--text-muted)}
.av-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.av-foot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:1023px){.av-figs{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:640px){.av-figs{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

export default function AffiliateView() {
  const { data, t, live } = useMk2();
  const [q, setQ] = useState(null);
  const [sheet, setSheet] = useState(null);   // 'edit' | 'rules' | 'adjust' | 'rule' | 'link' | 'material'
  const [payout, setPayout] = useState(null);
  const [ask, setAsk] = useState(null);       // 'reject' | 'pause'

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const raw = (p.get('id') || '').trim().toUpperCase();
    setQ({ id: /^\d+$/.test(raw) ? 'AF-' + raw : raw, tab: TAB_KEYS.includes(p.get('tab')) ? p.get('tab') : 'overview' });
  }, []);
  const go = (tab) => {
    setQ((x) => ({ ...x, tab }));
    const p = new URLSearchParams(window.location.search);
    p.set('id', q.id); p.set('tab', tab);
    window.history.replaceState(window.history.state, '', window.location.pathname + '?' + p.toString());
  };

  if (!live || !q) return <AdminShell active="affiliates" title="Affiliate"><style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} /><Skeleton label="Loading the affiliate" /></AdminShell>;
  const base = data.affiliates.find((x) => x.id === q.id);
  if (!base) {
    return (
      <AdminShell active="affiliates" title="Affiliate">
        <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/affiliates" backLabel="Back to affiliates" title="Affiliate" />
          <section className="ix-card ix-empty"><EmptyState icon="handshake" title={q.id ? `No affiliate with the ID ${q.id}.` : 'No affiliate picked.'} actionLabel="Back to affiliates" onAction={() => { window.location.href = '/admin/affiliates'; }} /></section>
        </div>
      </AdminShell>
    );
  }

  const refs = refRows(data, t, base.id);
  const a = affRow(base, data, t, refs);
  const coms = comRows(data, t, a.id);
  const pays = payoutRows(data, a.id);
  const openPay = pays.find((p) => p.status === 'Pending' || p.status === 'Approved');

  const run = (r, msg) => { if (r.ok) toast(msg); else toast(r.error, { tone: 'error' }); return r; };
  const approve = () => run(approveAffiliate(a.id), `${a.name} approved · referral link made`);
  const resume = () => run(resumeAffiliate(a.id), `${a.name} is active again`);
  const askPayout = async () => {
    if (openPay) { setPayout(openPay.id); return; }
    if (a.due < MIN_PAYOUT) { toast(a.due ? `${money(a.due)} is due; payouts start at ${money(MIN_PAYOUT)}.` : `Nothing is due yet. Commission waits ${HOLD_DAYS} days after the store pays.`, { tone: 'error' }); return; }
    if (!(await confirmDialog({ title: `Ask to pay ${money(a.due)} to ${a.name}?`, body: `It goes to Finance for approval, then by ${a.pay.method}. Someone other than you must approve it.`, confirmLabel: 'Request payout' }))) return;
    const r = requestPayout(a.id);
    if (r.ok) { toast(`Payout of ${money(r.amount)} asked for`); setPayout(r.id); go('payouts'); } else toast(r.error, { tone: 'error' });
  };
  const primary = a.status === 'Pending' ? { label: 'Approve affiliate', icon: 'check', onClick: approve }
    : a.status === 'Paused' ? { label: 'Resume', icon: 'play', onClick: resume }
      : a.status === 'Active' ? (openPay ? { label: 'Open payout', icon: 'wallet', onClick: () => setPayout(openPay.id) } : { label: 'Request payout', icon: 'wallet', onClick: askPayout }) : null;
  const more = [
    { label: 'Edit details', onClick: () => setSheet('edit') },
    a.status !== 'Rejected' ? { label: 'Change commission rule', onClick: () => setSheet('rule') } : null,
    a.status !== 'Rejected' ? { label: 'Manual adjustment', onClick: () => setSheet('adjust') } : null,
    a.status === 'Active' ? { label: 'Add referral link', onClick: () => { go('links'); setSheet('link'); } } : null,
    a.status === 'Active' ? { label: 'Send material', onClick: () => { go('materials'); setSheet('material'); } } : null,
    { label: 'Commission rules', onClick: () => setSheet('rules') },
    a.status === 'Active' ? { label: 'Pause', onClick: () => setAsk('pause'), tone: 'danger' } : null,
    a.status === 'Pending' ? { label: 'Reject', onClick: () => setAsk('reject'), tone: 'danger' } : null,
  ].filter(Boolean);
  const counts = { links: a.links.length || null, referrals: refs.length || null, commissions: coms.length || null, payouts: pays.length || null, materials: a.materials.length || null, notes: a.notes.length || null };
  const ctx = { a, refs, coms, pays, data, t, go, setSheet, setPayout, askPayout };
  const Tab = { overview: Overview, links: Links, referrals: Referrals, commissions: Commissions, payouts: Payouts, payment: Payment, materials: Materials, notes: Notes }[q.tab];

  return (
    <AdminShell active="affiliates" title={a.name}>
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + AFF_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/affiliates" backLabel="Back to affiliates" title={a.name} about={ABOUT}
          badges={<StatusBadge tone={AFF_STATUS[a.status]}>{a.status}</StatusBadge>}
          meta={<><span className="mk-data">{a.id}</span> · code <span className="mk-data">{a.code}</span> · {a.org || a.kind} · {a.district}</>}
          secondary={[{ label: 'Call', icon: 'phone', onClick: () => { window.location.href = 'tel:' + a.phone.replace(/\D/g, ''); } }, { label: 'Email', icon: 'mail', onClick: () => { if (a.email) window.location.href = 'mailto:' + a.email; else toast('No email on file'); } }]}
          more={more} primary={primary} />

        {a.status === 'Pending' ? (
          <div className="mk-banner mk-banner--warn" role="status"><Icon name="user-plus" width="18" height="18" aria-hidden="true" /><p>Applied {dayTime(a.appliedAt)}. {a.channel ? a.channel + '. ' : ''}Check the audience, then approve or reject.</p>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setAsk('reject')}>Reject</button><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={approve}>Approve</button></div>
        ) : a.status === 'Paused' ? (
          <div className="mk-banner mk-banner--warn" role="status"><Icon name="pause" width="18" height="18" aria-hidden="true" /><p>Paused: {a.pausedReason}. Links don’t earn while paused.</p><button type="button" className="ix-btn ix-btn--sm" onClick={resume}>Resume</button></div>
        ) : a.status === 'Rejected' ? (
          <div className="mk-banner mk-banner--err" role="status"><Icon name="circle-x" width="18" height="18" aria-hidden="true" /><p>Rejected: {a.rejectedReason}</p></div>
        ) : null}

        <section className="ix-card mk-tabs" aria-label="Sections">
          <IndexTabs label="Affiliate sections" tabs={TABS.map(([k, label]) => ({ key: k, id: 'av-tab-' + k, label, count: counts[k], on: q.tab === k, onClick: () => go(k) }))} />
        </section>
        <div role="tabpanel" aria-labelledby={'av-tab-' + q.tab} className="ix-page">
          <Tab ctx={ctx} />
        </div>
      </div>

      <AffFormSheet open={sheet === 'edit'} a={a} data={data} onClose={() => setSheet(null)} />
      <RulesSheet open={sheet === 'rules' || sheet === 'rule'} data={data} onClose={() => setSheet(null)}
        pick={sheet === 'rule' ? (rid) => { const r = setAffiliateRule(a.id, rid); run(r, 'Commission rule changed · applies to new referrals'); if (r.ok) setSheet(null); } : null} />
      <AdjustSheet open={sheet === 'adjust'} a={a} onClose={() => setSheet(null)} />
      <LinkSheet open={sheet === 'link'} a={a} onClose={() => setSheet(null)} />
      <MaterialSheet open={sheet === 'material'} a={a} onClose={() => setSheet(null)} />
      <PayoutSheet id={payout} data={data} t={t} onClose={() => setPayout(null)} />
      <ReasonDialog open={!!ask} title={ask === 'reject' ? `Reject ${a.name}?` : `Pause ${a.name}?`}
        body={ask === 'reject' ? 'They are told by email that the application was not accepted.' : 'Their links stop earning until you resume them. Commission already earned stays.'}
        confirmLabel={ask === 'reject' ? 'Reject' : 'Pause'} danger onClose={() => setAsk(null)}
        onConfirm={(reason) => { const r = ask === 'reject' ? rejectAffiliate(a.id, reason) : pauseAffiliate(a.id, reason); if (r.ok) { toast(ask === 'reject' ? 'Application rejected' : 'Affiliate paused'); setAsk(null); } return r; }} />
    </AdminShell>
  );
}

// ---- tabs ------------------------------------------------------------------------------------------------------------
function Overview({ ctx }) {
  const { a, refs, go } = ctx;
  return (
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card" aria-label="Figures">
          <div className="mk-body">
            <div className="av-figs">
              <div><span>Link clicks</span><b>{num(a.clicks)}</b></div>
              <div><span>Referrals</span><b>{num(a.referrals)}</b></div>
              <div><span>Paid stores</span><b>{num(a.conversions)}</b></div>
              <div><span>Earned</span><b>{money(a.earned)}</b></div>
              <div><span>Paid out</span><b>{money(a.paid)}</b></div>
              <div><span>Unpaid</span><b>{money(a.pending)}</b></div>
            </div>
            {a.pending ? <p className="mk-note">Unpaid: {money(a.held)} held (refund window) · {money(a.due)} due · {money(a.inPayout)} in a payout.</p> : null}
          </div>
        </section>
        <section className="ix-card" aria-labelledby="av-recent">
          <header className="ix-card__head"><h2 id="av-recent">Latest referrals</h2>{refs.length > 5 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => go('referrals')}>View all {refs.length}</button> : null}</header>
          {refs.length ? <RefList refs={refs.slice(0, 5)} /> : <div className="ix-empty"><EmptyState icon="link" title="No referrals yet." actionLabel="See referral links" onAction={() => go('links')} /></div>}
        </section>
      </div>
      <div className="ix-side">
        <section className="ix-card" aria-labelledby="av-about">
          <header className="ix-card__head"><h2 id="av-about">About</h2></header>
          <div className="mk-body">
            <KV rows={[
              ['Type', a.kind], ['Audience', a.channel], ['Mobile', <span key="p" className="mk-data">{a.phone}</span>], ['Email', a.email], ['District', a.district],
              ['Account manager', a.manager], ['Applied', dmy(a.appliedAt)], a.approvedAt ? ['Approved', `${dmy(a.approvedAt)} · ${a.approvedBy}`] : null,
            ]} />
          </div>
        </section>
        <section className="ix-card" aria-labelledby="av-rule">
          <header className="ix-card__head"><h2 id="av-rule">Commission</h2></header>
          <div className="mk-body">
            <KV rows={[['Rule', a.ruleObj ? a.ruleObj.name : '—'], ['Pays', ruleText(a.ruleObj)], ['Paid by', `${a.pay.method}${a.pay.method === 'Bank transfer' ? '' : ' · ' + a.pay.number}`]]} />
          </div>
        </section>
      </div>
    </div>
  );
}

function RefList({ refs }) {
  return (
    <>
      <ul className="ix-plist" aria-label="Referrals">
        {refs.map((r) => (
          <li key={r.id}><div className="ix-pitem">
            <span className="ix-pitem__top"><b>{r.store ? <Link href={'/admin/merchant?id=' + r.store}>{r.business}</Link> : r.business}</b><StatusBadge tone={r.tone}>{r.statusLabel}</StatusBadge></span>
            <span className="ix-pitem__mid">{r.owner} · {dm(r.at)}{r.plan ? ' · ' + r.plan : ''}{r.monthly ? ' · ' + money(r.monthly) + '/mo' : ''}</span>
          </div></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table ix-table--static gc-table--keep">
          <caption className="sr-only">Referrals</caption>
          <thead><tr><th scope="col">Store</th><th scope="col">Owner</th><th scope="col">Signed up</th><th scope="col">Package</th><th scope="col" className="ix-num">Pays</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {refs.map((r) => (
              <tr key={r.id}>
                <td><span className="mk-cell">{r.store ? <Link href={'/admin/merchant?id=' + r.store}>{r.business}</Link> : <b>{r.business}</b>}<span className="mk-sub">{r.store ? <span className="mk-data">#{r.store}</span> : 'Did not become a store'} · {r.id}</span></span></td>
                <td className="ix-muted">{r.owner}</td>
                <td className="ix-muted">{dmy(r.at)}</td>
                <td className="ix-muted">{r.plan || '—'}</td>
                <td className="ix-num mk-fig">{r.monthly ? money(r.monthly) + '/mo' : '—'}</td>
                <td><StatusBadge tone={r.tone}>{r.statusLabel}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Links({ ctx }) {
  const { a, refs, setSheet } = ctx;
  return (
    <section className="ix-card" aria-labelledby="av-links">
      <header className="ix-card__head"><div><h2 id="av-links">Referral links</h2><p className="ix-card__sub">Code {a.code} works on every link and at sign-up</p></div>{a.status === 'Active' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet('link')}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add link</button> : null}</header>
      {a.links.length ? (
        <div className="av-links">
          {a.links.map((l) => {
            const n = refs.filter((r) => r.link === l.id).length;
            return (
              <div key={l.id} className="av-link">
                <span className="av-link__top"><b>{l.label}</b><span className="mk-note">{num(l.clicks)} clicks · {plural(n, 'sign-up')}</span>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => copyText(l.url, 'Link copied')}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy</button></span>
                <span className="av-url">{l.url}</span>
                <span className="mk-note">Made {dmy(l.createdAt)}</span>
              </div>
            );
          })}
        </div>
      ) : <div className="ix-empty"><EmptyState icon="link" title={a.status === 'Active' ? 'No links yet.' : 'Links are made when the affiliate is approved.'} actionLabel={a.status === 'Active' ? 'Add link' : undefined} onAction={() => setSheet('link')} /></div>}
    </section>
  );
}

function Referrals({ ctx }) {
  const { refs, a } = ctx;
  return (
    <section className="ix-card" aria-label="Referrals">
      {refs.length ? <RefList refs={refs} /> : <div className="ix-empty"><EmptyState icon="store" title="No referrals yet." /></div>}
      <div className="ix-foot"><span>{plural(refs.length, 'referral')} · {num(a.conversions)} paying</span></div>
    </section>
  );
}

function Commissions({ ctx }) {
  const { coms, a, setSheet } = ctx;
  return (
    <section className="ix-card" aria-labelledby="av-coms">
      <header className="ix-card__head"><div><h2 id="av-coms">Commission history</h2><p className="ix-card__sub">Held {HOLD_DAYS} days after each payment, then due</p></div>{a.status !== 'Rejected' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet('adjust')}><Icon name="diff" width="16" height="16" aria-hidden="true" />Manual adjustment</button> : null}</header>
      {coms.length ? (<>
        <ul className="ix-plist" aria-label="Commission">
          {coms.map((c) => (
            <li key={c.id}><div className="ix-pitem">
              <span className="ix-pitem__top"><b>{c.kind === 'adjustment' ? c.note : storeLabel(c.store)}</b><span className="mk-fig">{money(c.amount)}</span></span>
              <span className="ix-pitem__mid">{dm(c.at)} · {c.kind === 'adjustment' ? 'Adjustment' : c.note} · {c.status}</span>
            </div></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table ix-table--static gc-table--keep">
            <caption className="sr-only">Commission history</caption>
            <thead><tr><th scope="col">Date</th><th scope="col">For</th><th scope="col">What</th><th scope="col" className="ix-num">Store paid</th><th scope="col" className="ix-num">Commission</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {coms.map((c) => (
                <tr key={c.id}>
                  <td className="ix-muted" style={{ whiteSpace: 'nowrap' }}>{dmy(c.at)}</td>
                  <td>{c.store ? <Link href={'/admin/merchant?id=' + c.store}>{storeLabel(c.store)}</Link> : <span className="ix-muted">—</span>}</td>
                  <td><span className="mk-cell"><span>{c.note}</span><span className="mk-sub">{c.kind === 'adjustment' ? 'Manual adjustment · ' + c.by : (ctx.data.rules.find((r) => r.id === c.rule) || { name: c.rule }).name}</span></span></td>
                  <td className="ix-num mk-data">{c.base ? money(c.base) : '—'}</td>
                  <td className="ix-num mk-fig">{money(c.amount)}</td>
                  <td><StatusBadge tone={COM_STATUS[c.status]}>{c.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>) : <div className="ix-empty"><EmptyState icon="percent" title="No commission yet. It starts when a referred store pays." /></div>}
      <div className="ix-foot"><span className="av-foot"><span>Earned <b>{money(a.earned)}</b></span><span>Paid <b>{money(a.paid)}</b></span><span>Due <b>{money(a.due)}</b></span><span>Held <b>{money(a.held)}</b></span></span></div>
    </section>
  );
}

function Payouts({ ctx }) {
  const { pays, a, setPayout, askPayout } = ctx;
  return (
    <section className="ix-card" aria-labelledby="av-pays">
      <header className="ix-card__head"><div><h2 id="av-pays">Payouts</h2><p className="ix-card__sub">{money(a.due)} due now · payouts start at {money(MIN_PAYOUT)}</p></div>{a.status === 'Active' || a.status === 'Paused' ? <button type="button" className="ix-btn ix-btn--sm" onClick={askPayout}><Icon name="wallet" width="16" height="16" aria-hidden="true" />Request payout</button> : null}</header>
      {pays.length ? (
        <div className="mk-list">
          {pays.map((p) => (
            <button key={p.id} type="button" className="mk-li" style={{ width: '100%', border: 0, borderTop: '1px solid var(--border-subtle)', background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }} onClick={() => setPayout(p.id)}>
              <span className="mk-li__main"><b>{p.id} · {p.method}</b><small className="mk-sub">Asked by {p.requestedBy} {dayTime(p.requestedAt)}{p.txn ? ' · ' + p.txn : ''}</small></span>
              <b className="mk-fig">{money(p.amount)}</b>
              <StatusBadge tone={PAYOUT_STATUS[p.status]}>{p.status === 'Pending' ? 'To approve' : p.status}</StatusBadge>
            </button>
          ))}
        </div>
      ) : <div className="ix-empty"><EmptyState icon="wallet" title="No payouts yet." /></div>}
    </section>
  );
}

function Payment({ ctx }) {
  const { a, setSheet } = ctx;
  const bank = a.pay.method === 'Bank transfer';
  return (
    <section className="ix-card" aria-labelledby="av-pay">
      <header className="ix-card__head"><h2 id="av-pay">Payment info</h2><button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet('edit')}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Edit</button></header>
      <div className="mk-body">
        <KV rows={bank
          ? [['Paid by', 'Bank transfer'], ['Bank and branch', a.pay.bank], ['Account number', <span key="n" className="mk-data">{a.pay.account}</span>], ['Account name', a.pay.holder]]
          : [['Paid by', a.pay.method], [a.pay.method + ' number', <span key="n" className="mk-data">{a.pay.number}</span>], ['Name on the account', a.pay.holder]]} />
        <p className="mk-note">Changing these details applies to the next payout. A payout already approved keeps the details it was approved with.</p>
      </div>
    </section>
  );
}

function Materials({ ctx }) {
  const { a, setSheet } = ctx;
  return (
    <section className="ix-card" aria-labelledby="av-mat">
      <header className="ix-card__head"><div><h2 id="av-mat">Promotional materials</h2><p className="ix-card__sub">Files sent to {a.name.split(' ')[0]}</p></div>{a.status === 'Active' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet('material')}><Icon name="send" width="16" height="16" aria-hidden="true" />Send a file</button> : null}</header>
      {a.materials.length ? (
        <div className="mk-list">
          {[...a.materials].reverse().map((m, i) => (
            <div key={m.name + i} className="mk-li">
              <Icon name={/\.mp4$/.test(m.name) ? 'film' : /\.zip$/.test(m.name) ? 'folder-archive' : 'file-text'} width="16" height="16" aria-hidden="true" />
              <span className="mk-li__main"><b>{m.name}</b><small className="mk-sub">Sent {dayTime(m.sentAt)} by {m.by}</small></span>
            </div>
          ))}
        </div>
      ) : <div className="ix-empty"><EmptyState icon="folder-open" title="Nothing sent yet." actionLabel={a.status === 'Active' ? 'Send a file' : undefined} onAction={() => setSheet('material')} /></div>}
    </section>
  );
}

function Notes({ ctx }) {
  const { a } = ctx;
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const save = () => { const r = addAffNote(a.id, text); if (!r.ok) { setErr(r.error); return; } setText(''); toast('Note added'); };
  return (
    <section className="ix-card" aria-labelledby="av-notes">
      <header className="ix-card__head"><h2 id="av-notes">Notes</h2></header>
      <div className="mk-body">
        <Field id="av-note" label="Add a note" error={err}><textarea id="av-note" {...ctl(err)} rows={3} value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} /></Field>
        <span className="mk-row"><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={save} disabled={!text.trim()}>Add note</button></span>
      </div>
      {[...a.notes].reverse().map((n) => <div key={n.id} className="av-note"><p>{n.text}</p><small>{n.by} · {dayTime(n.at)}</small></div>)}
    </section>
  );
}

// ---- small side panels -----------------------------------------------------------------------------------------------
function LinkSheet({ open, a, onClose }) {
  const [f, setF] = useState({ label: '', page: PAGES[0][0] });
  const [err, setErr] = useState('');
  if (!open) return null;
  const close = () => { setF({ label: '', page: PAGES[0][0] }); setErr(''); onClose(); };
  const save = () => { const r = addLink(a.id, f.label, f.page); if (!r.ok) { setErr(r.error); return; } copyText(r.url, 'Link made and copied'); close(); };
  return (
    <Sheet open title="Add referral link" onClose={close} footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Make link</button></>}>
      <div className="mk-form">
        <Field id="ln-label" label="Name" hint="Where it will be used, e.g. YouTube description" error={err}><input id="ln-label" data-autofocus {...ctl(err)} value={f.label} onChange={(e) => { setF({ ...f, label: e.target.value }); setErr(''); }} /></Field>
        <Field id="ln-page" label="Opens"><select id="ln-page" className="gc-input gc-select" value={f.page} onChange={(e) => setF({ ...f, page: e.target.value })}>{PAGES.map(([u, l]) => <option key={u} value={u}>{l} · {u.replace('https://', '')}</option>)}</select></Field>
        <p className="mk-note">The link carries the code {a.code} and UTM tags, so sign-ups and clicks are counted here.</p>
      </div>
    </Sheet>
  );
}
function MaterialSheet({ open, a, onClose }) {
  const [pick, setPick] = useState(MATERIALS[0]);
  if (!open) return null;
  const send = () => { const r = sendMaterial(a.id, pick); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast(`Sent to ${a.email || a.phone}`); onClose(); };
  return (
    <Sheet open title="Send a file" onClose={onClose} footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={send}>Send</button></>}>
      <div className="mk-form">
        <Field id="mt-pick" label="File"><select id="mt-pick" data-autofocus className="gc-input gc-select" value={pick} onChange={(e) => setPick(e.target.value)}>{MATERIALS.map((m) => <option key={m}>{m}</option>)}</select></Field>
        <p className="mk-note">Demo: it is logged here; no email goes out.</p>
      </div>
    </Sheet>
  );
}
