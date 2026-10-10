'use client';
// Licences (/admin/licences) — the licence directory: one licence per store (key, type, status, issued, valid until,
// seats, domains), worked out from its subscription by lib/admin/merchants › licenceOf. Title row (Issue licence,
// Export), three facts the tabs don't repeat, then one card with the statuses as tabs (counts on the tabs), search,
// the table (a two-line list on phones) and the pager. A row opens the licence's panel: key (copy), details, the
// revocation if any, its history, and Renew / Revoke / Issue again.
// Actions: Issue licence (a store without one, or revoked) → merchants › activateTrial (trial) or licences › issuePaid
// (bill issued and paid now) or licences › reinstate (a licence staff revoked); Renew → extendTrial for a trial, else the
// store's Billing tab; Revoke (Dialog, reason) → licences › revoke = setControl(id, 'suspended', 'Licence revoked · …').
// Every action writes the store's history, which the panel shows. ?view, ?q and ?id live in the address (after mount).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, Dialog, StatusBadge, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, MetricStrip, IndexTabs, Pager, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, dmy, dm, daysBetween } from '@/lib/platform/util';
import { METHODS, CONTROL_REASONS, PLAN_NAME } from '@/lib/platform/catalogue';
import { shopOf, subOf, extendTrial } from '@/lib/platform/billing';
import { activateTrial } from '@/lib/admin/merchants';
import { LIC_VIEWS, licenceRows, licenceRow, issueKind, issuePaid, reinstate, revoke } from '@/lib/admin/licences';
import { AdminShell, usePlatform } from '../AdminShell';
import { SUBS_CSS, subsMoney as money, subsPlural as plural, subsWhen, subsDue, subsFromUrl, subsToUrl } from './subsShared';

const PAGE = 20;
const KIND_LABEL = { reinstate: 'Revoked by staff', restore: 'Cancelled or archived', resume: 'Paused' };
const TRIAL_DAYS = ['7', '15', '30'];

const domainsText = (d) => (d.length > 1 ? `${d[0]} +${d.length - 1}` : d[0] || '—');
const csvRows = (rows) => [
  ['Licence key', 'Merchant ID', 'Store', 'Type', 'Status', 'Issued', 'Valid until', 'Staff seats', 'Domains'],
  ...rows.map((r) => [r.key, '#' + r.id, r.name, r.type, r.status, dmy(r.issued), r.validUntil ? dmy(r.validUntil) : '', r.seats, r.domains.join('; ')]),
];

async function copyKey(key) {
  try { await navigator.clipboard.writeText(key); toast('Licence key copied'); } catch { toast('Copy failed: select the key and copy it'); }
}

/** What a paid licence costs for the store's cycle (the plan's list price). */
function paidPrice(db, shopId) {
  const sub = subOf(db, shopId);
  const ladder = db.plans[sub.ladder];
  const ver = ladder.versions.find((v) => v.v === sub.version) || ladder.versions[ladder.versions.length - 1];
  const p = ver.plans[sub.plan];
  return { amount: sub.cycle === 'yearly' ? p.yearly : p.price, yearly: sub.cycle === 'yearly', plan: PLAN_NAME[sub.plan] };
}

// ---- issue a licence -------------------------------------------------------------------------------------------------
export function IssueSheet({ db, t, rows, initial, onClose }) {
  const options = rows.filter((r) => issueKind(r));
  const [id, setId] = useState(initial && options.some((r) => r.id === initial) ? initial : options[0] ? options[0].id : '');
  const [mode, setMode] = useState('trial');
  const [days, setDays] = useState('15');
  const [method, setMethod] = useState('bKash');
  const [txId, setTxId] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState(null);
  const row = options.find((r) => r.id === id) || null;
  const kind = row ? issueKind(row) : null;
  const price = row && kind !== 'reinstate' ? paidPrice(db, row.id) : null;
  const cash = method === 'Cash at office';
  const errOf = (f) => (err && err.field === f ? err.text : null);
  const ctl = (f, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (errOf(f) ? ' gc-input--error' : ''), 'aria-invalid': errOf(f) ? true : undefined });

  const submit = () => {
    if (!row) { setErr({ field: 'shop', text: 'Pick a store.' }); return; }
    let r;
    if (kind === 'reinstate') r = reinstate(row.id, note);
    else if (mode === 'trial') r = activateTrial(row.id, Number(days));
    else r = issuePaid(row.id, { method, txId: cash ? '' : txId, note });
    if (!r || !r.ok) { setErr({ field: (r && r.field) || 'form', text: (r && r.error) || 'Could not issue the licence.' }); return; }
    toast(kind === 'reinstate' ? `Licence given back to ${row.name}`
      : mode === 'trial' ? `${days}-day trial licence issued to ${row.name}`
        : `Paid licence issued to ${row.name} · valid until ${dmy(r.validUntil)}`);
    onClose(row.id);
  };

  return (
    <Sheet open title="Issue licence" onClose={() => onClose(null)}
      footer={options.length ? <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(null)}>Cancel</button>
        <button type="submit" form="subs-issue" className="gc-btn gc-btn--solid">{kind === 'reinstate' ? 'Give licence back' : mode === 'trial' ? 'Start trial' : 'Issue paid licence'}</button>
      </> : <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(null)}>Close</button>}>
      {!options.length ? <p className="subs-empty">Every store has a licence. Stores being set up get theirs when they go live.</p> : (
        <form id="subs-issue" className="subs-form" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="gc-field">
            <label className="gc-label" htmlFor="subs-is">Store</label>
            <select id="subs-is" {...ctl('shop', true)} value={id} data-autofocus onChange={(e) => { setId(e.target.value); setErr(null); }}>
              {options.map((r) => <option key={r.id} value={r.id}>{r.name} · #{r.id} · {KIND_LABEL[issueKind(r)]}</option>)}
            </select>
            {errOf('shop') ? <p className="gc-help gc-help--error" role="alert">{errOf('shop')}</p> : row ? <p className="gc-help">{row.packageName} · {row.key}</p> : null}
          </div>

          {kind === 'reinstate' ? (
            <>
              <p className="subs-note">Revoked {row.revoked ? `${subsWhen(row.revoked.at, t)} · ${row.revoked.reason}${row.revoked.by ? ' · ' + row.revoked.by : ''}` : ''}. The store's admin and storefront come back at once.</p>
              <div className="gc-field">
                <label className="gc-label" htmlFor="subs-in">Why it is given back</label>
                <textarea id="subs-in" rows={2} {...ctl('note')} value={note} onChange={(e) => { setNote(e.target.value); setErr(null); }} placeholder="Issue solved with the owner" />
                {errOf('note') ? <p className="gc-help gc-help--error" role="alert">{errOf('note')}</p> : null}
              </div>
            </>
          ) : (
            <>
              <div className="subs-opts" role="radiogroup" aria-label="Licence">
                <label className={'subs-opt' + (mode === 'trial' ? ' is-on' : '')}>
                  <input type="radio" name="subs-mode" value="trial" checked={mode === 'trial'} onChange={() => { setMode('trial'); setErr(null); }} />
                  <span><b>Trial</b><small>Full access for the trial; the first bill falls due when it ends.</small></span>
                </label>
                <label className={'subs-opt' + (mode === 'paid' ? ' is-on' : '')}>
                  <input type="radio" name="subs-mode" value="paid" checked={mode === 'paid'} onChange={() => { setMode('paid'); setErr(null); }} />
                  <span><b>Paid{price ? ` · ${money(price.amount)}` : ''}</b><small>{price ? `${price.plan} plan for ${price.yearly ? '12 months' : '1 month'}: the bill is issued and recorded as paid now.` : ''}</small></span>
                </label>
              </div>
              {mode === 'trial' ? (
                <div className="gc-field">
                  <label className="gc-label" htmlFor="subs-idays">Trial length</label>
                  <select id="subs-idays" className="gc-input gc-select" value={days} onChange={(e) => setDays(e.target.value)}>
                    {TRIAL_DAYS.map((n) => <option key={n} value={n}>{n} days · ends {dm(t + Number(n) * DAY)}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div className="subs-two">
                    <div className="gc-field">
                      <label className="gc-label" htmlFor="subs-im">Paid by</label>
                      <select id="subs-im" {...ctl('method', true)} value={method} onChange={(e) => { setMethod(e.target.value); setErr(null); }}>
                        {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    {cash ? null : (
                      <div className="gc-field">
                        <label className="gc-label" htmlFor="subs-itx">Transaction ID</label>
                        <input id="subs-itx" {...ctl('txId')} style={{ fontFamily: 'var(--font-data)' }} value={txId} onChange={(e) => { setTxId(e.target.value); setErr(null); }} autoComplete="off" />
                        {errOf('txId') ? <p className="gc-help gc-help--error" role="alert">{errOf('txId')}</p> : null}
                      </div>
                    )}
                  </div>
                  <div className="gc-field">
                    <label className="gc-label" htmlFor="subs-inote">Note (optional)</label>
                    <input id="subs-inote" className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Paid at the office" />
                  </div>
                </>
              )}
            </>
          )}
          {errOf('form') ? <p className="subs-err" role="alert">{errOf('form')}</p> : null}
        </form>
      )}
    </Sheet>
  );
}

// ---- one licence ------------------------------------------------------------------------------------------------------
export function LicencePanel({ id, db, t, onClose, onRevoke, onIssue }) {
  const shop = shopOf(db, id);
  if (!shop) return null;
  const l = licenceRow(db, shop, t);
  const kind = issueKind(l);
  const canRevoke = !['Revoked', 'Not issued'].includes(l.status);
  const renewTrial = async () => {
    const end = l.trialEnds;
    const ok = await confirmDialog({ title: 'Extend the trial licence by 7 days?', body: `${l.name}'s licence then runs until ${dmy(end + 7 * DAY)} instead of ${dmy(end)}. The first bill moves with it.`, confirmLabel: 'Extend trial' });
    if (!ok) return;
    const r = extendTrial(id, 7);
    toast(r.ok ? `Trial licence extended to ${dmy(end + 7 * DAY)}` : r.error);
  };

  return (
    <Sheet open title={l.name} label={`${l.name} licence`} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
        <Link href={`/admin/merchant?id=${id}&tab=licence`} className="gc-btn gc-btn--solid">Open merchant</Link>
      </>}>
      <div className="subs-panel">
        <div className="subs-sec">
          <div className="subs-top">
            <span className="subs-key">{l.key}</span>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Copy licence key" title="Copy" onClick={() => copyKey(l.key)}><Icon name="copy" width="16" height="16" aria-hidden="true" /></button>
            <StatusBadge tone={l.tone}>{l.status}</StatusBadge>
          </div>
          {l.revoked ? <p className="subs-warn">Revoked {subsWhen(l.revoked.at, t)} · {l.revoked.reason}{l.revoked.by ? ' · ' + l.revoked.by : ''}. The store is suspended until the licence is given back.</p> : null}
          <KV rows={[
            ['Store', `#${l.id} · ${l.packageName}`],
            ['Type', l.type],
            ['Issued', dmy(l.issued)],
            ['Valid until', l.validUntil ? `${dmy(l.validUntil)} · ${subsDue(l.validUntil, t)}` : '—'],
            ['Staff seats', String(l.seats)],
            ['Domains', l.domains.join(', ')],
          ]} />
        </div>

        <div className="subs-sec">
          <h3>Actions</h3>
          <div className="subs-acts">
            {l.status === 'Trial' ? <button type="button" className="ix-btn ix-btn--sm" onClick={renewTrial}><Icon name="calendar-plus" width="16" height="16" aria-hidden="true" />Extend trial</button>
              : ['Valid', 'Valid · payment late', 'Suspended'].includes(l.status) && !l.revoked
                ? <Link href={`/admin/merchant?id=${id}&tab=billing`} className="ix-btn ix-btn--sm"><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Renew</Link> : null}
            {kind ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onIssue(id)}><Icon name="badge-check" width="16" height="16" aria-hidden="true" />{kind === 'reinstate' ? 'Give licence back' : 'Issue licence'}</button> : null}
            {canRevoke && !l.revoked ? <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={() => onRevoke(id)}><Icon name="shield-x" width="16" height="16" aria-hidden="true" />Revoke</button> : null}
          </div>
          {['Valid', 'Valid · payment late'].includes(l.status) ? <p className="subs-note">Renews by itself when the next bill is paid{l.validUntil ? ` (${dm(l.validUntil)})` : ''}; record a payment on the Billing tab.</p> : null}
        </div>

        <div className="subs-sec">
          <h3>History</h3>
          {l.history.length ? (
            <ul className="subs-list">
              {l.history.map((e) => <li key={e.id}><span><b>{e.text}</b><small>{subsWhen(e.at, t)}</small></span></li>)}
            </ul>
          ) : <p className="subs-empty">No changes yet.</p>}
        </div>
      </div>
    </Sheet>
  );
}

// ---- the page --------------------------------------------------------------------------------------------------------
export default function Licences() {
  const { db, t, live } = usePlatform();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [issue, setIssue] = useState(null);        // { id } while the Issue sheet is open
  const [rv, setRv] = useState(null);              // { id, pick, note, error } while the Revoke dialog is open
  const [page, setPage] = useState(0);
  const first = useRef(true);

  useEffect(() => { const s = subsFromUrl(LIC_VIEWS, []); setView(s.view); setQ(s.q); setOpenId(s.id); setReady(true); }, []);
  useEffect(() => { if (ready) subsToUrl({ view, q, f: {}, id: openId }); }, [ready, view, q, openId]);
  useEffect(() => {
    if (!ready) return;
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, view, q]);

  const list = live ? licenceRows(db, t) : null;
  const all = list ? list.rows : [];
  const s = q.trim().toLowerCase();
  const filtered = all.filter((r) => (view === 'all' || r.view === view)
    && (!s || [r.key, r.name, r.id, '#' + r.id, r.owner, ...r.domains].join(' ').toLowerCase().includes(s)));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const viewLabel = (LIC_VIEWS.find(([k]) => k === view) || [])[1] || 'All';

  const exportAll = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv(`gridcommerce-licences-${view}.csv`, csvRows(filtered));
    toast(plural(filtered.length, 'licence') + ' exported');
  };
  const doRevoke = () => {
    const reason = rv.pick === 'Other' ? rv.note.trim() : [rv.pick, rv.note.trim()].filter(Boolean).join(' · ');
    if (!rv.pick) { setRv({ ...rv, error: { field: 'pick', text: 'Pick a reason.' } }); return; }
    if (rv.pick === 'Other' && !rv.note.trim()) { setRv({ ...rv, error: { field: 'note', text: 'Say why.' } }); return; }
    const r = revoke(rv.id, reason);
    if (!r.ok) { setRv({ ...rv, error: { field: 'pick', text: r.error } }); return; }
    const name = (shopOf(db, rv.id) || {}).name || 'the store';
    setRv(null);
    setOpenId(rv.id);
    toast(`Licence revoked · ${name} suspended`);
  };
  const rvErr = (f) => (rv && rv.error && rv.error.field === f ? rv.error.text : null);

  // facts the tabs don't show: seats licensed, custom domains, licences ending within 7 days
  const facts = list ? (() => {
    const live7 = all.filter((r) => ['Valid', 'Valid · payment late', 'Trial'].includes(r.status));
    const ending = live7.filter((r) => r.validUntil && daysBetween(t, r.validUntil) >= 0 && daysBetween(t, r.validUntil) <= 7);
    return [
      { label: 'Staff seats licensed', icon: 'users', value: live7.reduce((a, r) => a + r.seats, 0).toLocaleString('en-IN'), sub: plural(live7.length, 'working licence') },
      { label: 'Custom domains', icon: 'globe', value: String(all.filter((r) => r.domains.length > 1).length), sub: 'on top of the gridcommerce address' },
      { label: 'Ending in 7 days', icon: 'calendar-clock', value: String(ending.length), sub: plural(ending.filter((r) => r.status === 'Trial').length, 'trial') },
    ];
  })() : null;

  const tabs = LIC_VIEWS.map(([k, label]) => ({ key: k, id: 'lic-tab-' + k, label, count: list ? list.counts[k] || 0 : null, on: view === k, onClick: () => setView(k) }));

  let body;
  if (!live) {
    body = <div className="subs-skel" aria-busy="true" aria-label="Loading licences" />;
  } else {
    body = (
      <section className="ix-card" aria-label={viewLabel + ' licences'}>
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Licence statuses" /></div>
        <div className="subs-filters">
          <FilterBar label="Search licences" filters={[]} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search key, store, ID, owner or domain' }} />
        </div>
        {!filtered.length ? (
          <div className="ix-empty">
            {s ? <EmptyState title="No licences match this search." actionLabel="Clear search" onAction={() => setQ('')} />
              : <EmptyState icon="key-round" title={`No licences in ${viewLabel}.`} actionLabel="Show all" onAction={() => setView('all')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label={viewLabel + ' licences'}>
              {rows.map((r) => (
                <li key={r.id}>
                  <button type="button" className="ix-pitem" onClick={() => setOpenId(r.id)}>
                    <span className="ix-pitem__top"><b>{r.name}</b><StatusBadge tone={r.tone}>{r.status}</StatusBadge></span>
                    <span className="ix-pitem__mid"><span className="ix-id">{r.key}</span></span>
                    <span className="ix-pitem__mid">{r.type} · {r.validUntil ? 'until ' + dm(r.validUntil) : 'no end date'} · {plural(r.seats, 'seat')}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{viewLabel} licences</caption>
                <thead>
                  <tr>
                    <th scope="col">Key</th>
                    <th scope="col">Store</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Issued</th>
                    <th scope="col">Valid until</th>
                    <th scope="col" className="ix-num">Seats</th>
                    <th scope="col">Domains</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} tabIndex={0} aria-label={`${r.name} licence, open`}
                      onClick={() => setOpenId(r.id)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); setOpenId(r.id); } }}>
                      <td><span className="subs-key">{r.key}</span></td>
                      <td><span className="subs-name"><b>{r.name}</b><small>#{r.id}</small></span></td>
                      <td className="ix-muted">{r.type.replace(' subscription', '')}</td>
                      <td><StatusBadge tone={r.tone}>{r.status}</StatusBadge></td>
                      <td className="ix-muted">{dmy(r.issued)}</td>
                      <td className={r.validUntil && daysBetween(t, r.validUntil) <= 3 && r.status !== 'Revoked' ? 'ix-warn' : 'ix-muted'}>{r.validUntil ? dmy(r.validUntil) : '—'}</td>
                      <td className="ix-num"><span className="subs-fig">{r.seats}</span></td>
                      <td className="ix-muted" title={r.domains.join(', ')}>{domainsText(r.domains)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 licences'}
          atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  const rvShop = rv ? shopOf(db, rv.id) : null;
  return (
    <AdminShell active="licences" title="Licences">
      <style dangerouslySetInnerHTML={{ __html: SUBS_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="key-round" title="Licences"
          about="Every store's licence: its key, type, status, when it was issued and how long it is valid, staff seats and domains. A licence follows the subscription: paying keeps it valid, a trial gives a trial licence, and revoking it suspends the store until it is given back."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportAll }]}
          primary={{ label: 'Issue licence', icon: 'plus', onClick: () => setIssue({ id: null }) }} />
        {facts ? <MetricStrip items={facts} /> : <div className="subs-skel subs-skel--strip" aria-hidden="true" />}
        {body}
      </div>

      {live && openId && !issue && !rv ? (
        <LicencePanel id={openId} db={db} t={t} onClose={() => setOpenId(null)}
          onRevoke={(id) => { setOpenId(null); setRv({ id, pick: '', note: '', error: null }); }}
          onIssue={(id) => { setOpenId(null); setIssue({ id }); }} />
      ) : null}

      {live && issue ? <IssueSheet db={db} t={t} rows={all} initial={issue.id} onClose={(id) => { setIssue(null); if (id) setOpenId(id); }} /> : null}

      <Dialog open={!!rv} title={rvShop ? `Revoke ${rvShop.name}'s licence` : 'Revoke licence'} onClose={() => setRv(null)} width={480}
        footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setRv(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={doRevoke}>Revoke licence</button>
        </>}>
        {rv ? (
          <div className="subs-form">
            <p className="subs-warn">The licence stops working: the store is suspended (admin and storefront off) until it is given back. Nothing is deleted.</p>
            <div className="gc-field">
              <label className="gc-label" htmlFor="subs-rr">Reason</label>
              <select id="subs-rr" className={'gc-input gc-select' + (rvErr('pick') ? ' gc-input--error' : '')} aria-invalid={rvErr('pick') ? true : undefined} data-autofocus value={rv.pick}
                onChange={(e) => setRv({ ...rv, pick: e.target.value, error: null })}>
                <option value="">Choose a reason</option>
                {CONTROL_REASONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              {rvErr('pick') ? <p className="gc-help gc-help--error" role="alert">{rvErr('pick')}</p> : null}
            </div>
            <div className="gc-field">
              <label className="gc-label" htmlFor="subs-rn">{rv.pick === 'Other' ? 'Say why' : 'Note (optional)'}</label>
              <textarea id="subs-rn" rows={2} className={'gc-input' + (rvErr('note') ? ' gc-input--error' : '')} aria-invalid={rvErr('note') ? true : undefined} value={rv.note}
                onChange={(e) => setRv({ ...rv, note: e.target.value, error: null })} />
              {rvErr('note') ? <p className="gc-help gc-help--error" role="alert">{rvErr('note')}</p> : null}
            </div>
          </div>
        ) : null}
      </Dialog>
    </AdminShell>
  );
}
