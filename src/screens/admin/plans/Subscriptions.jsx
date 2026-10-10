'use client';
// Subscriptions (/admin/subscriptions) — every store's subscription in one list. Title row (Export), four money figures
// that the tabs don't repeat (MRR, renewals due this week, overdue & grace, plan moves in 30 days), then one card with
// the views as tabs (counts on the tabs), search and filters (package, plan, cycle, auto-charge), the table (a two-line
// list on phones) and the pager. A row opens a side panel: the package, what is on the bill, module trials, the
// actions (change package with the upgrade / downgrade simulation, extend trial, extend grace, automatic charge, open
// the merchant) and the subscription's history.
// Data: subsShared › subsList (lib/admin/merchants rows + lib/platform/billing). Actions: billing › changePlan (through
// the merchant profile's PlanSimulator), extendTrial, setAutoCharge; merchants › extendGrace. ?view, ?q, filters and
// ?id (the open panel) live in the address, read after mount; rows are worked out once the saved data has loaded.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, MetricStrip, IndexTabs, Pager, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, dmy, dm } from '@/lib/platform/util';
import { LADDERS, PLAN_IDS, PLAN_NAME, ladderLabel } from '@/lib/platform/catalogue';
import { shopOf, subOf, subState, planOf, priceOf, billItems, itemName, extendTrial, setAutoCharge, openInvoices, balance, isPaying } from '@/lib/platform/billing';
import { extendGrace, activityOf, nextRenewal } from '@/lib/admin/merchants';
import { AdminShell, usePlatform } from '../AdminShell';
import { PROFILE_CSS } from '../merchants/profile/profileShared';
import { PlanSimulator } from '../merchants/profile/ProfileActions';
import { SUBS_VIEWS, SUBS_CSS, subsList, subsMoney as money, subsPlural as plural, subsWhen, subsDue, subsFromUrl, subsToUrl } from './subsShared';

const PAGE = 20;
const FILTER_KEYS = ['pkg', 'plan', 'cycle', 'auto'];
const SUB_EVENTS = /plan|trial|cycle|charge|pause|resum|cancel|restor|archiv|added to the bill|ended|suspend|access restored|read-only|grace|licence/i;
const CLOSED = ['cancelled', 'archived', 'setup', 'failed'];

const renewText = (r) => (!r.renewal ? '—' : r.stateKey === 'trial' ? 'Trial ends ' + dm(r.renewal) : dmy(r.renewal));
const cycleText = (c) => (c === 'yearly' ? 'Yearly' : 'Monthly');

const csvRows = (rows) => [
  ['Merchant ID', 'Store', 'Package', 'Cycle', 'Monthly (BDT)', 'Started', 'Next renewal', 'State', 'Auto-charge', 'Owed (BDT)'],
  ...rows.map((r) => ['#' + r.id, r.name, r.packageName, cycleText(r.cycle), Math.round(r.monthly), dmy(r.started), renewText(r), r.stateLabel, r.autoCharge ? 'On · ' + r.payMethod : 'Off', Math.round(r.owed)]),
];

// ---- the side panel -------------------------------------------------------------------------------------------------
export function SubPanel({ id, db, t, onClose }) {
  const shop = shopOf(db, id);
  const sub = subOf(db, id);
  const [tool, setTool] = useState(null);         // null · 'plan' · 'trial' · 'grace'
  const [days, setDays] = useState('7');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState(null);
  useEffect(() => { setTool(null); setErr(null); setReason(''); setDays('7'); }, [id]);
  if (!shop || !sub) return null;

  const st = subState(db, id, t);
  const plan = planOf(db, sub);
  const items = billItems(sub, t).filter((it) => it.since <= t + 31 * DAY);
  const trials = sub.moduleTrials.slice().sort((a, b) => b.start - a.start);
  const history = activityOf(db, id).filter((e) => SUB_EVENTS.test(e.text)).slice(0, 10);
  const owed = openInvoices(db, id);
  const overdue = owed.filter((i) => i.dueAt < t);
  const closed = CLOSED.includes(st.key);
  const late = ['grace', 'pastdue', 'suspended'].includes(st.key) && overdue.length > 0;
  const monthly = billItems(sub, t).filter((it) => it.period !== 'Once').reduce((s, it) => s + (it.period === 'Yearly' ? Math.round(it.price / 12) : priceOf(db, sub, it)), 0);
  const trialEnd = sub.trialStart + sub.trialDays * DAY;
  const paying = isPaying(st);
  const renewal = nextRenewal(db, shop, t);
  const profile = (tab) => `/admin/merchant?id=${id}&tab=${tab}`;
  const toggle = (k) => { setErr(null); setTool((x) => (x === k ? null : k)); };

  const doTrial = async () => {
    const n = Number(days);
    const ok = await confirmDialog({ title: `Extend the trial by ${n} days?`, body: `${shop.name}'s trial ends on ${dmy(trialEnd + n * DAY)} instead of ${dmy(trialEnd)}. The first bill moves with it.`, confirmLabel: 'Extend trial' });
    if (!ok) return;
    const r = extendTrial(id, n);
    if (!r.ok) { setErr(r.error); return; }
    toast(`Trial extended to ${dmy(trialEnd + n * DAY)}`);
    setTool(null);
  };
  const doGrace = () => {
    const n = Number(days);
    if (!n || n < 1 || n > 30) { setErr({ field: 'days', text: 'Give 1 to 30 days.' }); return; }
    const r = extendGrace(id, n, reason);
    if (!r.ok) { setErr({ field: /why/i.test(r.error) ? 'reason' : 'form', text: r.error }); return; }
    toast(`Grace extended by ${r.days} days for ${shop.name}`);
    setTool(null); setReason('');
  };
  const doAuto = async () => {
    const on = !sub.autoCharge;
    if (on && !(await confirmDialog({ title: 'Charge this store automatically?', body: `Each bill is charged to the saved ${sub.payMethod} on its due day, then retried after 1 and 3 days.`, confirmLabel: 'Turn on' }))) return;
    const r = setAutoCharge(id, on);
    if (r && r.ok) toast(on ? `Automatic charge on · ${sub.payMethod}` : 'Automatic charge off · collected by hand');
  };
  const errText = (f) => (err && typeof err === 'object' && err.field === f ? err.text : null);

  return (
    <Sheet open title={shop.name} label={`${shop.name} subscription`} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
        <Link href={profile('subscription')} className="gc-btn gc-btn--solid">Open merchant</Link>
      </>}>
      <div className="subs-panel">
        <div className="subs-sec">
          <div className="subs-top">
            <span className="subs-key">#{id}</span>
            <StatusBadge tone={st.key === 'active' ? 'success' : st.key === 'trial' ? 'primary' : st.key === 'grace' ? 'warning' : ['pastdue', 'suspended', 'failed'].includes(st.key) ? 'error' : 'neutral'}>{st.label}</StatusBadge>
          </div>
          <KV rows={[
            ['Package', `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]} (v${plan.version})`],
            ['Billing', cycleText(sub.cycle)],
            ['Monthly', <span key="m" className="subs-fig">{!monthly || !(paying || st.key === 'trial') ? '—' : money(monthly) + (st.key === 'trial' ? ' after the trial' : '')}</span>],
            ['Started', dmy(sub.trialStart || shop.createdAt)],
            st.key === 'trial' ? ['Trial', `Day ${st.days} of ${sub.trialDays} · ends ${dm(trialEnd)}`] : null,
            overdue.length ? ['Overdue', <span key="o" className="subs-fig">{money(overdue.reduce((s, i) => s + balance(db, i), 0))} · due {dm(overdue[0].dueAt)}</span>] : null,
            !overdue.length && owed.length ? ['Next bill', <span key="o" className="subs-fig">{money(balance(db, owed[0]))} · due {dm(owed[0].dueAt)}</span>] : null,
            !owed.length && paying && renewal ? ['Next renewal', `${dmy(renewal)} · ${subsDue(renewal, t)}`] : null,
          ]} />
        </div>

        {closed ? null : (
          <div className="subs-sec">
            <h3>Actions</h3>
            <div className="subs-acts">
              <button type="button" className={'ix-btn ix-btn--sm' + (tool === 'plan' ? ' is-on' : '')} aria-expanded={tool === 'plan'} onClick={() => toggle('plan')}><Icon name="arrow-up-down" width="16" height="16" aria-hidden="true" />Change package</button>
              {st.key === 'trial' ? <button type="button" className={'ix-btn ix-btn--sm' + (tool === 'trial' ? ' is-on' : '')} aria-expanded={tool === 'trial'} onClick={() => toggle('trial')}><Icon name="calendar-plus" width="16" height="16" aria-hidden="true" />Extend trial</button> : null}
              {late ? <button type="button" className={'ix-btn ix-btn--sm' + (tool === 'grace' ? ' is-on' : '')} aria-expanded={tool === 'grace'} onClick={() => toggle('grace')}><Icon name="clock" width="16" height="16" aria-hidden="true" />Extend grace</button> : null}
            </div>

            {tool === 'plan' ? (
              <div className="subs-box">
                <PlanSimulator key={id} ctx={{ db, t, shop, sub }} idp="subs-ps" onDone={() => setTool(null)} />
              </div>
            ) : null}

            {tool === 'trial' ? (
              <div className="subs-box">
                <div className="gc-field">
                  <label className="gc-label" htmlFor="subs-td">Add days</label>
                  <select id="subs-td" className="gc-input gc-select" value={days} onChange={(e) => setDays(e.target.value)}>
                    {['3', '7', '15'].map((n) => <option key={n} value={n}>{n} days · ends {dm(trialEnd + Number(n) * DAY)}</option>)}
                  </select>
                </div>
                {typeof err === 'string' ? <p className="subs-err" role="alert">{err}</p> : null}
                <div><button type="button" className="gc-btn gc-btn--solid" onClick={doTrial}>Extend trial</button></div>
              </div>
            ) : null}

            {tool === 'grace' ? (
              <div className="subs-box">
                <p className="subs-note">{plural(overdue.length, 'unpaid bill')} move{overdue.length === 1 ? 's' : ''} its due date on; the store stays open meanwhile.</p>
                <div className="subs-two">
                  <div className="gc-field">
                    <label className="gc-label" htmlFor="subs-gd">Days</label>
                    <input id="subs-gd" type="number" min="1" max="30" inputMode="numeric" className={'gc-input' + (errText('days') ? ' gc-input--error' : '')} aria-invalid={errText('days') ? true : undefined} value={days} onChange={(e) => { setDays(e.target.value); setErr(null); }} />
                    {errText('days') ? <p className="gc-help gc-help--error" role="alert">{errText('days')}</p> : null}
                  </div>
                </div>
                <div className="gc-field">
                  <label className="gc-label" htmlFor="subs-gr">Reason</label>
                  <textarea id="subs-gr" rows={2} className={'gc-input' + (errText('reason') ? ' gc-input--error' : '')} aria-invalid={errText('reason') ? true : undefined} value={reason} onChange={(e) => { setReason(e.target.value); setErr(null); }} placeholder="Promised to pay on Sunday" />
                  {errText('reason') ? <p className="gc-help gc-help--error" role="alert">{errText('reason')}</p> : null}
                </div>
                {errText('form') ? <p className="subs-err" role="alert">{errText('form')}</p> : null}
                <div><button type="button" className="gc-btn gc-btn--solid" onClick={doGrace}>Extend grace</button></div>
              </div>
            ) : null}

            <div className="subs-switch">
              <span><b id="subs-auto">Charge automatically</b><small>{sub.autoCharge ? `Saved ${sub.payMethod}, on the due day` : 'Owner pays from the panel or on a call'}</small></span>
              <button type="button" role="switch" aria-checked={!!sub.autoCharge} aria-labelledby="subs-auto" className="gc-switch" onClick={doAuto}><span className="gc-switch__knob" /></button>
            </div>
          </div>
        )}

        <div className="subs-sec">
          <h3>{closed || st.key === 'paused' ? 'Last billed for' : 'On the bill'} <small>{plural(items.length, 'item')}</small></h3>
          {items.length ? (
            <ul className="subs-list">
              {items.map((it) => (
                <li key={it.id}>
                  <span><b>{itemName(sub, it)}</b><small>{it.period === 'Once' ? 'Once' : it.period} · {it.since > t ? (st.key === 'trial' ? 'from ' + dm(it.since) + ', after the trial' : 'from ' + dmy(it.since)) : 'since ' + dmy(it.since)}</small></span>
                  <em><span className="subs-fig">{money(priceOf(db, sub, it))}</span></em>
                </li>
              ))}
            </ul>
          ) : <p className="subs-empty">{st.key === 'trial' ? 'Nothing is billed during the trial.' : 'Nothing is billed.'}</p>}
        </div>

        {trials.length ? (
          <div className="subs-sec">
            <h3>Module trials</h3>
            <ul className="subs-list">
              {trials.map((m) => {
                const end = m.start + m.days * DAY;
                const running = !m.result;
                return (
                  <li key={m.id}>
                    <span><b>{m.name}</b><small>{dm(m.start)} – {dm(end)}{m.by ? ' · ' + m.by : ''}{m.autoAdd && running ? ` · then ${money(m.price)} a month` : ''}</small></span>
                    <em><StatusBadge tone={running ? 'primary' : /Became|Converted/.test(m.result) ? 'success' : 'neutral'}>{running ? 'Running' : m.result}</StatusBadge></em>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="subs-sec">
          <h3>History</h3>
          {history.length ? (
            <ul className="subs-list">
              {history.map((e) => <li key={e.id}><span><b>{e.text}</b><small>{subsWhen(e.at, t)}</small></span></li>)}
            </ul>
          ) : <p className="subs-empty">No changes yet.</p>}
        </div>
      </div>
    </Sheet>
  );
}

// ---- the page --------------------------------------------------------------------------------------------------------
export default function Subscriptions() {
  const { db, t, live } = usePlatform();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ pkg: '', plan: '', cycle: '', auto: '' });
  const [openId, setOpenId] = useState(null);
  const [page, setPage] = useState(0);
  const first = useRef(true);

  useEffect(() => { const s = subsFromUrl(SUBS_VIEWS, FILTER_KEYS); setView(s.view); setQ(s.q); setF(s.f); setOpenId(s.id); setReady(true); }, []);
  useEffect(() => { if (ready) subsToUrl({ view, q, f, id: openId }); }, [ready, view, q, f, openId]);
  useEffect(() => {
    if (!ready) return;
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, view, q, f]);

  const list = live ? subsList(db, t) : null;
  const all = list ? list.rows : [];
  const s = q.trim().toLowerCase();
  const filtered = all.filter((r) => {
    if (!r.views.includes(view)) return false;
    if (f.pkg && r.ladder !== f.pkg) return false;
    if (f.plan && r.plan !== f.plan) return false;
    if (f.cycle && r.cycle !== f.cycle) return false;
    if (f.auto && (f.auto === 'on') !== r.autoCharge) return false;
    if (!s) return true;
    return [r.name, r.id, '#' + r.id, r.owner, r.domain].join(' ').toLowerCase().includes(s);
  }).sort((a, b) => {
    if (a.renewal == null && b.renewal == null) return a.name.localeCompare(b.name);
    if (a.renewal == null) return 1;
    if (b.renewal == null) return -1;
    return a.renewal - b.renewal || a.name.localeCompare(b.name);
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const monthlyTotal = filtered.reduce((a, r) => a + r.monthly, 0);
  const filtersOn = !!s || FILTER_KEYS.some((k) => f[k]);
  const clearFilters = () => { setQ(''); setF({ pkg: '', plan: '', cycle: '', auto: '' }); };
  const setFilter = (k) => (v) => setF((old) => ({ ...old, [k]: v }));
  const viewLabel = (SUBS_VIEWS.find(([k]) => k === view) || [])[1] || 'All';

  const exportAll = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv(`gridcommerce-subscriptions-${view}.csv`, csvRows(filtered));
    toast(plural(filtered.length, 'subscription') + ' exported');
  };

  const tabs = SUBS_VIEWS.map(([k, label]) => ({ key: k, id: 'subs-tab-' + k, label, count: list ? list.counts[k] || 0 : null, on: view === k, onClick: () => setView(k) }));
  const filters = [
    { key: 'pkg', label: 'Package', all: 'All packages', value: f.pkg, options: LADDERS.map((l) => [l.id, l.label]), onChange: setFilter('pkg') },
    { key: 'plan', label: 'Plan', all: 'All plans', value: f.plan, options: PLAN_IDS.map((p) => [p, PLAN_NAME[p]]), onChange: setFilter('plan') },
    { key: 'cycle', label: 'Cycle', all: 'All cycles', value: f.cycle, options: [['monthly', 'Monthly'], ['yearly', 'Yearly']], onChange: setFilter('cycle') },
    { key: 'auto', label: 'Auto-charge', all: 'Auto-charge: any', value: f.auto, options: [['on', 'Auto-charge on'], ['off', 'Auto-charge off']], onChange: setFilter('auto') },
  ];

  const figs = list ? list.figs : null;
  const strip = figs ? (
    <MetricStrip items={[
      { label: 'MRR', icon: 'trending-up', value: money(figs.mrr), sub: plural(figs.paying, 'paying store') },
      { label: 'Renewals this week', icon: 'calendar-clock', value: money(figs.week), sub: plural(figs.weekN, 'store'), onClick: () => setView('renew'), on: view === 'renew' },
      { label: 'Overdue & grace', icon: 'triangle-alert', value: money(figs.late), sub: plural(figs.lateN, 'store'), onClick: () => setView('late'), on: view === 'late' },
      { label: 'Plan changes · 30 days', icon: 'arrow-up-down', value: figs.moves.up || figs.moves.down ? `${figs.moves.up} up · ${figs.moves.down} down` : 'None' },
    ]} />
  ) : <div className="subs-skel subs-skel--strip" aria-hidden="true" />;

  let body;
  if (!live) {
    body = <div className="subs-skel" aria-busy="true" aria-label="Loading subscriptions" />;
  } else {
    const footLabel = (
      <span className="subs-foot">
        <span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 subscriptions'}</span>
        {monthlyTotal ? <span>Monthly <b>{money(monthlyTotal)}</b></span> : null}
      </span>
    );
    body = (
      <section className="ix-card" aria-label={viewLabel + ' subscriptions'}>
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Subscription views" /></div>
        <div className="subs-filters">
          <FilterBar label="Filter subscriptions" filters={filters} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search store, ID, owner or domain' }} />
        </div>
        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn
              ? <EmptyState title="No subscriptions match these filters." actionLabel="Clear filters" onAction={clearFilters} />
              : <EmptyState icon="repeat" title={`No subscriptions in ${viewLabel}.`} actionLabel="Show all" onAction={() => setView('all')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label={viewLabel + ' subscriptions'}>
              {rows.map((r) => (
                <li key={r.id}>
                  <button type="button" className="ix-pitem" onClick={() => setOpenId(r.id)}>
                    <span className="ix-pitem__top"><b>{r.name}</b><span className="subs-fig">{r.monthly ? money(r.monthly) : '—'}</span></span>
                    <span className="ix-pitem__mid"><span className="ix-id">#{r.id}</span> · {r.packageName} · {cycleText(r.cycle)}</span>
                    <span className="ix-pitem__tags">
                      <StatusBadge tone={r.tone}>{r.stateLabel}</StatusBadge>
                      {r.renewal ? <span className="ix-pitem__mid">{r.stateKey === 'trial' ? renewText(r) : 'Renews ' + dm(r.renewal)}</span> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{viewLabel} subscriptions</caption>
                <thead>
                  <tr>
                    <th scope="col">Store</th>
                    <th scope="col">Package</th>
                    <th scope="col">Cycle</th>
                    <th scope="col" className="ix-num">Monthly</th>
                    <th scope="col">Started</th>
                    <th scope="col">Next renewal</th>
                    <th scope="col">State</th>
                    <th scope="col">Auto-charge</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} tabIndex={0} aria-label={`${r.name}, open subscription`}
                      onClick={() => setOpenId(r.id)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); setOpenId(r.id); } }}>
                      <td><span className="subs-name"><b>{r.name}</b><small>#{r.id}</small></span></td>
                      <td>{r.packageName}</td>
                      <td className="ix-muted">{cycleText(r.cycle)}</td>
                      <td className="ix-num"><span className="subs-fig">{r.monthly ? money(r.monthly) : '—'}</span></td>
                      <td className="ix-muted">{dmy(r.started)}</td>
                      <td className={r.toRenew != null && r.toRenew <= 3 && ['active', 'trial'].includes(r.stateKey) ? 'ix-warn' : 'ix-muted'}>
                        {renewText(r)}{r.renewal && r.toRenew != null && r.toRenew >= 0 && r.toRenew <= 7 ? ' · ' + subsDue(r.renewal, t) : ''}
                      </td>
                      <td><StatusBadge tone={r.tone}>{r.stateLabel}</StatusBadge></td>
                      <td><span className={'subs-on' + (r.autoCharge ? ' is-on' : '')}><i aria-hidden="true" />{r.autoCharge ? 'On · ' + r.payMethod : 'Off'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={footLabel} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="subscriptions" title="Subscriptions">
      <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS + SUBS_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="repeat" title="Subscriptions"
          about="Every store's subscription: package, billing cycle, monthly amount, next renewal and whether it is charged automatically. Open one to change its package (with the new price, the prorated difference and the limits that change), extend a trial or grace, or switch automatic charging."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportAll }]} />
        {live ? strip : <div className="subs-skel subs-skel--strip" aria-hidden="true" />}
        {body}
      </div>
      {live && openId && shopOf(db, openId) ? <SubPanel id={openId} db={db} t={t} onClose={() => setOpenId(null)} /> : null}
    </AdminShell>
  );
}

