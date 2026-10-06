'use client';
// Smart offers — offers that go out by themselves when a customer does something, or that the shop sends to a group.
// Rebuilt from the 21 Sep design (GridCommerce-Design › recovery/SmartOffers) in today's Shopify-style list layout:
//   Figures   offers sent, used, sales from offers, discount cost (this month)
//   List      All / On / Off; each offer: name + what sends it, what the customer gets, channels, sent, used, sales, on/off
//   Panel     New smart offer / a row opens it: name; when (a trigger + its value + wait, or a customer group you send
//             it to); what they get; code valid for; send by; message with {code}; on/off; Send now; Delete
//   Rules     rest time between offers and sending hours (one sheet, for every offer and cart reminder)
//   Send log  the latest messages: time, customer, offer, channel, code, status
// Data: src/lib/smartOffers.js (browser storage); sending is simulated.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { formatBDT, formatDateTime } from '@/lib/format';
import {
  getOffers, saveOffer, deleteOffer, setOfferOn, sendNow, audienceOf, getRules, saveRules, getLog, totals, pickLists, blankOffer,
  triggerText, waitText, rewardText, triggerBy, rewardBy, channelName, TRIGGERS, TRIGGER_GROUPS, REWARDS, WAITS, ORDER_COUNTS, LEVELS,
  FESTIVALS, CHANNELS, GROUPS, REST, HOURS, VARS, OFFERS_EVENT,
} from '@/lib/smartOffers';

const CSS = `
.so-name{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:340px}
.so-name b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.so-name small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.so-reward{display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.so-chs{display:flex;flex-wrap:wrap;gap:4px}
.so-off td{color:var(--text-muted)}
.so-form{display:grid;gap:var(--space-5)}
.so-sec{display:grid;gap:var(--space-3);margin:0;padding:0;border:0;min-width:0}
.so-sec>legend{margin-bottom:var(--space-1);padding:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.so-field>.gc-label{margin:0}
.so-field .gc-help{margin:0}
.so-field .gc-input{width:100%;min-width:0}
.so-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.so-checks{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5)}
.so-checks label{display:inline-flex;align-items:center;gap:8px;min-height:36px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.so-msg{min-height:110px;padding-top:10px;padding-bottom:10px;resize:vertical}
.so-vars{display:flex;flex-wrap:wrap;gap:6px}
.so-vars button{height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.so-vars button:hover{border-color:var(--primary);color:var(--primary)}
.so-preview{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-body);white-space:pre-wrap}
.so-sum{margin:0;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);line-height:1.5;color:var(--text-body)}
.so-sum b{color:var(--text-heading);font-weight:var(--weight-medium)}
.so-onrow{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-heading)}
.so-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);width:100%}
.so-foot>.so-left{display:flex;gap:var(--space-2);margin-right:auto}
.so-logbar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.so-logbar h2{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-code{font-family:var(--font-data);font-size:var(--text-xs)}
@media (max-width:640px){.so-row{grid-template-columns:minmax(0,1fr)}}
`;

const STATUS = { sent: ['Sent', 'neutral'], delivered: ['Delivered', 'info'], read: ['Read', 'info'], opened: ['Opened', 'info'], used: ['Used', 'success'], failed: ['Failed', 'error'] };
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const num = (n) => Number(n || 0).toLocaleString('en-IN');

function Switch({ on, onToggle, label }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" onClick={(e) => { e.stopPropagation(); onToggle(); }}><span className="gc-switch__knob" /></button>;
}
// a pick list that always holds the offer's own choice (an older offer may name a product no longer in the catalogue)
const withCur = (list, cur) => (cur && !list.includes(cur) ? [cur, ...list] : list);
const Err = ({ id, text }) => (text ? <p id={id} className="gc-help gc-help--error" role="alert">{text}</p> : null);

export default function SmartOffers() {
  const [ready, setReady] = useState(false);
  const [offers, setOffers] = useState([]);
  const [log, setLog] = useState([]);
  const [rules, setRules] = useState({ rest: '7', hours: '9-21' });
  const [tab, setTab] = useState('all');
  const [edit, setEdit] = useState(null);       // the offer form (id '' = new)
  const [errs, setErrs] = useState({});
  const [ruleSheet, setRuleSheet] = useState(null);
  const [allLog, setAllLog] = useState(false);
  const [lists, setLists] = useState({ cats: [], prods: [] });

  // offers live in browser storage: read after mount, so the first render matches the server
  useEffect(() => {
    const load = () => { setOffers(getOffers()); setLog(getLog()); setRules(getRules()); };
    load(); setLists(pickLists()); setReady(true);
    window.addEventListener(OFFERS_EVENT, load); window.addEventListener('storage', load);
    return () => { window.removeEventListener(OFFERS_EVENT, load); window.removeEventListener('storage', load); };
  }, []);

  const t = useMemo(() => totals(offers), [offers]);
  const shown = offers.filter((o) => tab === 'all' || (tab === 'on' ? o.on : !o.on));
  const tabs = [['all', 'All'], ['on', 'On'], ['off', 'Off']].map(([k, label]) => ({ key: k, id: 'so-tab-' + k, label, count: ready ? offers.filter((o) => k === 'all' || (k === 'on' ? o.on : !o.on)).length : null, on: tab === k, onClick: () => setTab(k) }));
  const restText = (REST.find((r) => r[0] === rules.rest) || REST[2])[1];
  const hoursText = (HOURS.find((h) => h[0] === rules.hours) || HOURS[0])[1];

  const openNew = () => { setErrs({}); setEdit({ ...blankOffer(), sCat: lists.cats[0] || '', oCat: lists.cats[1] || lists.cats[0] || '', sProd: lists.prods[0] || '', oProd: lists.prods[0] || '' }); };
  const openEdit = (o) => { setErrs({}); setEdit({ ...o, ch: (o.ch || []).slice() }); };
  const close = () => setEdit(null);
  const put = (k, v) => { setEdit((e) => ({ ...e, [k]: v })); setErrs((x) => { const n = { ...x }; delete n[k === 'name' ? 'name' : k === 'msg' ? 'msg' : k === 'ch' ? 'ch' : k === 'days' ? 'days' : /^o/.test(k) || k === 'off' ? 'reward' : 'trigger']; return n; }); };
  const onIn = (k) => (e) => put(k, e.target.value);
  const numIn = (k) => (e) => put(k, e.target.value.replace(/[^\d]/g, ''));
  const toggleCh = (c) => put('ch', edit.ch.includes(c) ? edit.ch.filter((x) => x !== c) : (c === 'fav' ? ['fav'] : [...edit.ch.filter((x) => x !== 'fav'), c]));
  const addVar = (v) => put('msg', (edit.msg || '').replace(/\s*$/, '') + ' ' + v);

  const save = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const res = saveOffer(edit);
    if (!res.ok) {
      setErrs(res.errors);
      const first = ['name', 'trigger', 'reward', 'days', 'ch', 'msg'].find((k) => res.errors[k]);
      setTimeout(() => { const el = document.getElementById('so-' + first); if (el) el.focus(); }, 0);
      return;
    }
    toast(edit.id ? res.offer.name + ' saved.' : res.offer.name + ' added.' + (res.offer.on ? '' : ' It is off until you turn it on.'));
    setEdit(null);
  };
  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete ' + edit.name + '?', body: 'It stops at once. Codes already sent keep working until they expire.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteOffer(edit.id); toast(edit.name + ' deleted.'); setEdit(null);
  };
  const send = async (o) => {
    const n = audienceOf(o);
    const who = o.trig === 'manual' ? 'everyone in “' + o.group + '”' : 'customers who match it today';
    if (!(await confirmDialog({ title: 'Send ' + o.name + ' now?', body: 'It goes to about ' + num(n) + ' ' + (n === 1 ? 'customer' : 'customers') + ' (' + who + '), each with their own code. Messages are paid from your GridCommerce credits. Rest time and sending hours still apply.', confirmLabel: 'Send now' }))) return;
    const sent = sendNow(o.id);
    toast(num(sent) + ' offers on their way.');
    setEdit(null);
  };
  const toggleOn = (o) => { setOfferOn(o.id, !o.on); toast(o.name + (o.on ? ' turned off.' : ' turned on.')); };

  // ---- the form's pieces ----
  const trig = edit ? triggerBy(edit.sit) : null;
  const rew = edit ? rewardBy(edit.off) : null;
  const preview = edit ? String(edit.msg || '').replace('{name}', 'Nusrat').replace('{offer}', rewardText(edit).charAt(0).toLowerCase() + rewardText(edit).slice(1)).replace('{code}', 'NUS7Q2')
    .replace('{expiry}', (() => { const d = new Date(Date.now() + (Number(edit.days) || 7) * 864e5); return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]; })())
    .replace('{shop}', 'Dazzle Shop').replace('{link}', 'grid.shop/o/NUS7Q2') : '';
  const selectOf = (id, value, onChange, opts, label) => (
    <select id={id} className="gc-input gc-select" value={value} onChange={onChange} aria-label={label}>
      {opts.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
    </select>
  );
  const triggerValue = () => {
    if (!trig || !trig.needs.length) return null;
    return trig.needs.map((k) => {
      if (k === 'cat') return <label key={k} className="so-field"><span className="gc-label">Category</span>{selectOf('so-sCat', edit.sCat, onIn('sCat'), [['', 'Choose…'], ...withCur(lists.cats, edit.sCat).map((c) => [c, c])])}</label>;
      if (k === 'prod') return <label key={k} className="so-field"><span className="gc-label">Product</span>{selectOf('so-sProd', edit.sProd, onIn('sProd'), [['', 'Choose…'], ...withCur(lists.prods, edit.sProd).map((c) => [c, c])])}</label>;
      if (k === 'views') return <label key={k} className="so-field"><span className="gc-label">Looked at it</span>{selectOf('so-sViews', edit.sViews, onIn('sViews'), [['2', '2 or more times'], ['3', '3 or more times'], ['5', '5 or more times']])}</label>;
      if (k === 'amount') return <label key={k} className="so-field"><span className="gc-label">Amount (৳)</span><input className="gc-input" inputMode="numeric" value={edit.sAmt} onChange={numIn('sAmt')} /></label>;
      if (k === 'count') return <label key={k} className="so-field"><span className="gc-label">Order number</span>{selectOf('so-sCount', edit.sCount, onIn('sCount'), ORDER_COUNTS)}</label>;
      if (k === 'idle') return <label key={k} className="so-field"><span className="gc-label">No order for</span>{selectOf('so-sIdle', edit.sIdle, onIn('sIdle'), [['30', '30 days'], ['45', '45 days'], ['60', '60 days'], ['90', '90 days'], ['180', '180 days']])}</label>;
      if (k === 'level') return <label key={k} className="so-field"><span className="gc-label">Level</span>{selectOf('so-sLevel', edit.sLevel, onIn('sLevel'), LEVELS)}</label>;
      if (k === 'group') return <label key={k} className="so-field"><span className="gc-label">Group</span>{selectOf('so-sGroup', edit.sGroup, onIn('sGroup'), GROUPS.filter((g) => g[0] !== 'All customers').map((g) => g[0]))}</label>;
      if (k === 'fest') return <label key={k} className="so-field"><span className="gc-label">Festival</span>{selectOf('so-sFest', edit.sFest, onIn('sFest'), FESTIVALS)}</label>;
      return null;
    });
  };
  const rewardValue = () => rew.needs.map((k) => {
    if (k === 'pct') return <label key={k} className="so-field"><span className="gc-label">Discount (%)</span><input className="gc-input" inputMode="numeric" value={edit.oPct} onChange={numIn('oPct')} /></label>;
    if (k === 'cap') return <label key={k} className="so-field"><span className="gc-label">Up to (৳) <span className="ix-muted">optional</span></span><input className="gc-input" inputMode="numeric" value={edit.oCap} onChange={numIn('oCap')} placeholder="No limit" /></label>;
    if (k === 'tk') return <label key={k} className="so-field"><span className="gc-label">Amount off (৳)</span><input className="gc-input" inputMode="numeric" value={edit.oTk} onChange={numIn('oTk')} /></label>;
    if (k === 'cat') return <label key={k} className="so-field"><span className="gc-label">Category</span>{selectOf('so-oCat', edit.oCat, onIn('oCat'), [['', 'Choose…'], ...withCur(lists.cats, edit.oCat).map((c) => [c, c])])}</label>;
    if (k === 'prod') return <label key={k} className="so-field"><span className="gc-label">{edit.off === 'gift' ? 'Gift' : 'Product'}</span>{selectOf('so-oProd', edit.oProd, onIn('oProd'), [['', 'Choose…'], ...withCur(lists.prods, edit.oProd).map((c) => [c, c])])}</label>;
    if (k === 'mult') return <label key={k} className="so-field"><span className="gc-label">Points</span>{selectOf('so-oMult', edit.oMult, onIn('oMult'), [['2', '2× points'], ['3', '3× points'], ['5', '5× points']])}</label>;
    return null;
  });

  return (
    <div className="dc-screen ds" data-screen="SmartOffers">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="rec-offers" />
        <main className="gc-shell__main">
          <Topbar crumb="Marketing" page="Smart offers" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="sparkles" title="Smart offers"
                about="Offers that go out by themselves when a customer does something — buys from a category, stops buying, looks at a product without buying — or that you send to a customer group. Every customer gets their own one-time code. Send rules keep anyone from getting too many messages."
                secondary={[{ label: 'Send rules', onClick: () => setRuleSheet({ ...rules }) }]}
                more={[{ label: 'Coupons', href: '/coupons' }, { label: 'Abandoned carts', href: '/abandoned-carts' }, { label: 'Auto reminders', href: '/auto-reminders' }]}
                primary={{ label: 'New smart offer', onClick: openNew }} />

              <MetricStrip label="Smart offers this month" items={[
                { label: 'Offers sent', value: ready ? num(t.sent) : '—', sub: 'this month' },
                { label: 'Used', value: ready ? num(t.used) : '—', sub: ready ? t.usedPct + '% of sent' : '' },
                { label: 'Sales from offers', value: ready ? formatBDT(t.sales) : '—' },
                { label: 'Discount cost', value: ready ? formatBDT(t.discount) : '—', sub: ready ? t.costPct + '% of those sales' : '' },
              ]} />

              <section className="ix-card" aria-label="Offers">
                <div className="ix-bar">
                  <IndexTabs tabs={tabs} label="Offer status" />
                  <span className="ix-tools"><InfoTip text={'Rest time: one offer every ' + restText + ' per customer. Sent only ' + hoursText.toLowerCase() + '. Change it in Send rules.'} /></span>
                </div>
                {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !shown.length ? (
                  <div className="ix-empty">{offers.length
                    ? <EmptyState icon="sparkles" title={tab === 'on' ? 'No offers are on' : 'No offers are off'} actionLabel="Show all offers" onAction={() => setTab('all')} />
                    : <EmptyState icon="sparkles" title="No smart offers yet" actionLabel="New smart offer" onAction={openNew} />}</div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Offers">
                    {shown.map((o) => (
                      <li key={o.id}>
                        <button type="button" className="ix-pitem" onClick={() => openEdit(o)}>
                          <span className="ix-pitem__top"><b>{o.name}</b><span className={o.on ? '' : 'ix-muted'}>{o.on ? 'On' : 'Off'}</span></span>
                          <span className="ix-pitem__mid">{rewardText(o)}</span>
                          <span className="ix-pitem__mid">{num(o.sent)} sent · {pct(o.used, o.sent)}% used · {formatBDT(o.sales)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table">
                      <caption className="sr-only">Smart offers</caption>
                      <thead><tr><th scope="col">Offer</th><th scope="col">They get</th><th scope="col">Send by</th><th scope="col" className="ix-num">Sent</th><th scope="col" className="ix-num">Used</th><th scope="col" className="ix-num">Sales</th><th scope="col">On</th></tr></thead>
                      <tbody>
                        {shown.map((o) => (
                          <tr key={o.id} className={o.on ? '' : 'so-off'} onClick={(e) => { if (!e.target.closest('a,button')) openEdit(o); }}>
                            <td><span className="so-name"><button type="button" className="ix-strong" onClick={() => openEdit(o)} style={{ textAlign: 'left' }}><b>{o.name}</b></button><small>{triggerText(o)}{waitText(o) ? ' · ' + waitText(o) : ''}</small></span></td>
                            <td><span className="so-reward">{rewardText(o)}</span></td>
                            <td><span className="so-chs">{(o.ch || []).map((c) => <span key={c} className="gc-badge gc-badge--slate">{channelName(c)}</span>)}</span></td>
                            <td className="ix-num">{num(o.sent)}</td>
                            <td className="ix-num">{num(o.used)}<span className="ix-muted"> · {pct(o.used, o.sent)}%</span></td>
                            <td className="ix-num">{formatBDT(o.sales)}</td>
                            <td><Switch on={o.on} onToggle={() => toggleOn(o)} label={(o.on ? 'Turn off ' : 'Turn on ') + o.name} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{ready ? (shown.length === 1 ? '1 offer' : shown.length + ' offers') : ''}</span></div>
              </section>

              <section className="ix-card" aria-labelledby="so-log-h">
                <div className="so-logbar">
                  <h2 id="so-log-h">Send log</h2>
                  {ready && log.length > 8 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAllLog((x) => !x)}>{allLog ? 'Show less' : 'View all'}</button> : null}
                </div>
                {!ready ? <div style={{ minHeight: 120 }} aria-busy="true" /> : !log.length ? (
                  <div className="ix-empty"><EmptyState icon="send" title="Nothing sent yet" /></div>
                ) : (
                  <div className="ix-table-wrap ix-table-wrap--show">
                    <table className="ix-table">
                      <caption className="sr-only">Send log</caption>
                      <thead><tr><th scope="col">Time</th><th scope="col">Customer</th><th scope="col">Offer</th><th scope="col">Channel</th><th scope="col">Code</th><th scope="col">Status</th></tr></thead>
                      <tbody>
                        {(allLog ? log : log.slice(0, 8)).map((r) => {
                          const st = STATUS[r.status] || [r.status, 'neutral'];
                          return (
                            <tr key={r.id}>
                              <td className="ix-muted">{formatDateTime(new Date(r.at))}</td>
                              <td className="ix-strong">{r.who}</td>
                              <td>{r.offer}</td>
                              <td>{channelName(r.ch)}</td>
                              <td><span className="so-code">{r.code}</span></td>
                              <td><StatusBadge tone={st[1]}>{st[0]}</StatusBadge>{r.note ? <span className="ix-muted"> · {r.note}</span> : null}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              <LearnMore topic="smart offers" />
            </div>
          </div>
        </main>
      </div>

      {/* ---- the offer form ---- */}
      <Sheet open={!!edit} title={edit && edit.id ? edit.name || 'Edit offer' : 'New smart offer'} onClose={close}
        footer={edit ? (
          <div className="so-foot">
            {edit.id ? <span className="so-left">
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={remove}>Delete</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => send(edit)} disabled={!edit.on} title={edit.on ? undefined : 'Turn the offer on first'}>Send now</button>
            </span> : null}
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={close}>Cancel</button>
            <button type="submit" form="so-form" className="gc-btn gc-btn--sm gc-btn--solid">{edit.id ? 'Save' : 'Add offer'}</button>
          </div>
        ) : null}>
        {edit ? (
          <form id="so-form" className="so-form" onSubmit={save} noValidate>
            <div className="so-field">
              <label className="gc-label" htmlFor="so-name">Offer name</label>
              <input id="so-name" className={'gc-input' + (errs.name ? ' gc-input--error' : '')} value={edit.name} onChange={onIn('name')} maxLength={60} placeholder="For example Win them back" autoFocus={!edit.id} aria-invalid={!!errs.name} aria-describedby={errs.name ? 'so-name-err' : 'so-name-help'} />
              {errs.name ? <Err id="so-name-err" text={errs.name} /> : <p id="so-name-help" className="gc-help">Only you see this name.</p>}
            </div>

            <fieldset className="so-sec">
              <legend>When does it go out?</legend>
              <div className="gc-seg" role="group" aria-label="When does it go out">
                {[['auto', 'When a customer does something'], ['manual', 'I send it to a group']].map(([k, l]) => (
                  <button key={k} type="button" className={'gc-seg__btn' + (edit.trig === k ? ' gc-seg__btn--active' : '')} aria-pressed={edit.trig === k} onClick={() => put('trig', k)}>{l}</button>
                ))}
              </div>
              {edit.trig === 'auto' ? (<>
                <label className="so-field"><span className="gc-label">Send it when a customer…</span>
                  <select id="so-trigger" className="gc-input gc-select" value={edit.sit} onChange={onIn('sit')}>
                    {TRIGGER_GROUPS.map((g) => <optgroup key={g} label={g}>{TRIGGERS.filter((x) => x.group === g).map((x) => <option key={x.k} value={x.k}>{x.label}</option>)}</optgroup>)}
                  </select>
                </label>
                {trig.needs.length ? <div className="so-row">{triggerValue()}</div> : null}
                <label className="so-field"><span className="gc-label">Wait before sending</span>{selectOf('so-wait', edit.wait, onIn('wait'), WAITS.map((w) => [w[0], w[0] === '0' ? w[1] : w[1] + ' ' + trig.from]))}</label>
                <Err id="so-trigger-err" text={errs.trigger} />
              </>) : (
                <label className="so-field"><span className="gc-label">Customer group</span>{selectOf('so-group', edit.group, onIn('group'), GROUPS.map((g) => [g[0], g[0] + ' · about ' + num(g[1])]))}</label>
              )}
            </fieldset>

            <fieldset className="so-sec">
              <legend>What do they get?</legend>
              <label className="so-field"><span className="gc-label">Offer</span>{selectOf('so-reward', edit.off, onIn('off'), REWARDS.map((r) => [r.k, r.label]))}</label>
              {rew.needs.length ? <div className="so-row">{rewardValue()}</div> : null}
              <div className="so-row">
                <label className="so-field"><span className="gc-label">Only on orders above (৳) <span className="ix-muted">optional</span></span><input className="gc-input" inputMode="numeric" value={edit.oMin} onChange={numIn('oMin')} placeholder="Any order" /></label>
                <label className="so-field"><span className="gc-label">Code works for (days)</span><input id="so-days" className={'gc-input' + (errs.days ? ' gc-input--error' : '')} inputMode="numeric" value={edit.days} onChange={numIn('days')} aria-invalid={!!errs.days} /></label>
              </div>
              <Err id="so-reward-err" text={errs.reward || errs.days} />
            </fieldset>

            <p className="so-sum"><b>{triggerText(edit)}</b>{waitText(edit) ? ', ' + waitText(edit) : ''} → <b>{rewardText(edit) || '…'}</b>, with their own code for {edit.days || '…'} days.</p>

            <fieldset className="so-sec">
              <legend>Send by</legend>
              <div className="so-checks" id="so-ch" tabIndex={-1}>
                {CHANNELS.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" checked={edit.ch.includes(k)} onChange={() => toggleCh(k)} />{l}</label>)}
              </div>
              <Err id="so-ch-err" text={errs.ch} />
            </fieldset>

            <fieldset className="so-sec">
              <legend>Message</legend>
              <textarea id="so-msg" className={'gc-input so-msg' + (errs.msg ? ' gc-input--error' : '')} value={edit.msg} onChange={onIn('msg')} rows={4} aria-label="Message" aria-invalid={!!errs.msg} />
              <div className="so-vars" aria-label="Add to the message">{VARS.map((v) => <button key={v} type="button" onClick={() => addVar(v)}>{v}</button>)}</div>
              <Err id="so-msg-err" text={errs.msg} />
              <p className="so-preview" aria-label="Preview">{preview}</p>
            </fieldset>

            <div className="so-onrow"><span>Offer is on</span><Switch on={edit.on} onToggle={() => put('on', !edit.on)} label="Offer is on" /></div>
          </form>
        ) : null}
      </Sheet>

      {/* ---- send rules ---- */}
      <Sheet open={!!ruleSheet} title="Send rules" onClose={() => setRuleSheet(null)}
        footer={ruleSheet ? <div className="so-foot"><span className="so-left" /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setRuleSheet(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { saveRules(ruleSheet); setRuleSheet(null); toast('Send rules saved.'); }}>Save</button></div> : null}>
        {ruleSheet ? (
          <div className="so-form">
            <label className="so-field"><span className="gc-label">One offer every</span>{selectOf('so-rest', ruleSheet.rest, (e) => setRuleSheet({ ...ruleSheet, rest: e.target.value }), REST)}
              <span className="gc-help">A customer who got any offer recently is skipped. Cart reminders follow the same rule.</span></label>
            <label className="so-field"><span className="gc-label">Send only</span>{selectOf('so-hours', ruleSheet.hours, (e) => setRuleSheet({ ...ruleSheet, hours: e.target.value }), HOURS)}
              <span className="gc-help">Messages that fall outside go out at the next start time.</span></label>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
