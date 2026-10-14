'use client';
// Services › an order (/admin/service-order?id=SO-1001). The next step first:
//   New            assign an expert (the best fit by skill, room and rating is suggested) — work and the deadline start
//   In progress    add the delivery (a file or link) or, for a monthly service, write the month's report; hand it in;
//                  ask the merchant something (the order waits, the deadline pauses); ask the owner for store access
//                  (what may be opened and for how long; it becomes a GridCommerce access session the owner approves in
//                  their panel, then Start session here); offer extra work as a paid quote when the brief grows
//   Quality check  a lead passes it (it goes to the merchant) or sends it back with a note (internal; never the expert
//                  checking their own work)
//   Delivered      the merchant approves it or asks for a change (changes left shown)
// Side: the deadline (paused time added), the expert, money (paid, extra work, refunds — full before work starts, part
// after; someone other than the asker approves; sent refunds reach Finance), store access, brief, history.
// Data: lib/platform/services.js; access sessions: lib/admin/supportAccess.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { staff as currentStaff } from '@/lib/platform/store';
import {
  orderById, stateOf, pkgOf, getExperts, suggestExpert, loadOf, assign, setPriority, askMerchant, resume, addDeliverable, addReport, submitWork, qaDecide,
  requestAccess, postMessage, proposeQuote, requestRefund, decideRefund, closeOrder, AREAS, areaLabel, payLabel, REFUND_REASONS, settings,
} from '@/lib/platform/services';
import { requestAccess as askSession, startSession, sessionById, stateOf as sessionState, STATE_LABEL } from '@/lib/admin/supportAccess';
import { useAdminStore } from '@/lib/admin/store';
import { access as accessStore } from '@/lib/admin/supportAccess';
import { now as platformNow } from '@/lib/platform/store';
import { AdminShell } from '../AdminShell';
import { useSvc, OrderStatus, slaWord, tk, dShort, dTime, qp, SVA_CSS } from './svcAdmin';

const say = (res, ok) => { if (res && res.ok === false) { toast(res.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };
const LEADS = ['admin', 'management', 'support', 'ops'];

export default function SvcOrder() {
  const { ready, tick } = useSvc();
  useAdminStore(accessStore);
  const me = currentStaff();
  const [pick, setPick] = useState('');
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState(false);
  const [dl, setDl] = useState({ name: '', note: '' });
  const [rep, setRep] = useState({ summary: '', k: [['', ''], ['', ''], ['', '']] });
  const [ask, setAsk] = useState(null);
  const [acc, setAcc] = useState(null);
  const [quote, setQuote] = useState(null);
  const [qa, setQa] = useState(null);
  const [refund, setRefund] = useState(null);
  const o = useMemo(() => (ready ? orderById(qp('id')) : null), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <AdminShell active="svc-order" title="Service order"><div style={{ minHeight: 400 }} aria-busy="true" /></AdminShell>;
  if (!o) return <AdminShell active="svc-order" title="Service order"><div className="ix-page"><RecordHeader back="/admin/services" backLabel="Service orders" title="Order not found" /><section className="ix-card ix-empty"><EmptyState icon="briefcase" title="This order is not here" /></section></div></AdminShell>;

  const st = stateOf(o);
  const pkg = pkgOf(st.svc, o.pkgId) || {};
  const monthly = o.cycle === 'monthly';
  const sug = suggestExpert(o.serviceId);
  const experts = getExperts().filter((e) => e.active && e.skills.includes(o.serviceId));
  const draftDl = o.deliverables.filter((d) => d.draft);
  const draftRep = o.reports.filter((r) => r.status === 'draft');
  const session = o.access && o.access.sessionId ? sessionById(o.access.sessionId) : null;
  const sState = session ? sessionState(session, platformNow()) : null;
  const ownWork = st.expert && st.expert.kind === 'staff' && st.expert.name === me.name;
  const isLead = LEADS.includes(me.role);
  const by = me.name;

  const doAssign = () => say(assign(o.id, pick || (sug && sug.id), by), 'Assigned');
  const sendMsg = () => { if (say(postMessage(o.id, { from: note ? 'staff' : 'expert', name: note ? by : (st.expert ? st.expert.name : by), text: msg, internal: note }), note ? 'Note added' : 'Sent to the merchant')) setMsg(''); };
  const doAccess = () => {
    const r = askSession({ shopId: o.shopId, reason: `Service ${o.id} · ${st.svc.name} · ${areaLabel(acc.area)}` });
    if (!say(r)) return;
    if (say(requestAccess(o.id, { area: acc.area, minutes: acc.minutes, sessionId: r.session.id }, by), 'Asked. The owner approves it in their panel.')) setAcc(null);
  };
  const doStart = () => say(startSession(session.id, { scope: 'changes', minutes: Math.min(60, o.access.minutes || 60) }), 'Session started · every change is logged');
  const doRefundAsk = () => { if (say(requestRefund(o.id, refund, by), 'Refund asked. Someone else approves it.')) setRefund(null); };
  const close = async () => { if (await confirmDialog({ title: 'Close this order?', body: 'Use it when the merchant stopped answering or the work ended another way.', confirmLabel: 'Close order', tone: 'danger' })) say(closeOrder(o.id, 'Closed by ' + by, by), 'Order closed'); };

  return (
    <AdminShell active="svc-order" title={o.id}>
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/services" backLabel="Service orders" title={`${o.shopName} · ${st.svc.name}`}
          badges={<><OrderStatus status={st.status} />{o.priority === 'high' ? <span className="gc-badge gc-badge--error">High priority</span> : null}{st.overdue ? <span className="gc-badge gc-badge--error">Overdue</span> : null}</>}
          meta={<>{o.id} · {pkg.name}{monthly ? ' · monthly' : ''} · paid {dTime(o.paid.at)} by {payLabel(o.paid.method)}</>}
          more={[{ label: o.priority === 'high' ? 'Normal priority' : 'High priority', onClick: () => say(setPriority(o.id, o.priority === 'high' ? 'normal' : 'high', by)) }, { label: 'Open the store', href: '/admin/merchant?id=' + o.shopId }, !['closed', 'cancelled', 'refunded'].includes(st.status) ? { label: 'Close order', onClick: close, tone: 'danger' } : null].filter(Boolean)} />

        <div className="ix-record">
          <div className="ix-main">
            {/* ---- next step ---- */}
            {st.status === 'brief' ? (
              <section className="ix-card sva-pad" aria-labelledby="so-next">
                <h2 id="so-next">Assign an expert</h2>
                <p className="gc-help">{sug ? `Suggested: ${sug.name} (${loadOf(sug.id)} of ${sug.capacity} orders, ${sug.rating}★).` : 'No active expert has this skill yet. Add one on Experts.'} Work and the {pkg.days}-day deadline start now.</p>
                <div className="sva-row">
                  <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Expert" value={pick || (sug ? sug.id : '')} onChange={(e) => setPick(e.target.value)}>
                    {experts.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.kind === 'partner' ? 'partner' : 'staff'} · {loadOf(e.id)}/{e.capacity}</option>)}
                  </select>
                  <button type="button" className="ix-btn ix-btn--primary" disabled={!experts.length} onClick={doAssign}>Assign and start</button>
                </div>
              </section>
            ) : null}
            {st.status === 'progress' ? (
              <section className="ix-card sva-pad" aria-labelledby="so-next">
                <h2 id="so-next">{monthly ? `Month ${o.reports.length + (draftRep.length ? 0 : 1)} report` : 'Delivery'}</h2>
                {monthly ? (draftRep.length ? (
                  <p className="gc-help">Written: “{draftRep[0].summary}”. Hand it in for the quality check.</p>
                ) : (
                  <div className="sva-form">
                    <div><label className="gc-label" htmlFor="so-rs">What happened this month</label><textarea id="so-rs" className="gc-input" rows={3} value={rep.summary} onChange={(e) => setRep({ ...rep, summary: e.target.value })} /></div>
                    <div className="sva-grid2">{rep.k.map((k, i) => <div key={i} className="sva-row" style={{ flexWrap: 'nowrap' }}><input className="gc-input" aria-label={'Figure ' + (i + 1) + ' name'} placeholder="e.g. Google visits" value={k[0]} onChange={(e) => setRep({ ...rep, k: rep.k.map((x, j) => (j === i ? [e.target.value, x[1]] : x)) })} /><input className="gc-input" aria-label={'Figure ' + (i + 1) + ' value'} placeholder="+40%" value={k[1]} onChange={(e) => setRep({ ...rep, k: rep.k.map((x, j) => (j === i ? [x[0], e.target.value] : x)) })} /></div>)}</div>
                    <div><button type="button" className="ix-btn" onClick={() => { if (say(addReport(o.id, { summary: rep.summary, kpis: rep.k }, st.expert ? st.expert.name : by), 'Report written')) setRep({ summary: '', k: [['', ''], ['', ''], ['', '']] }); }}>Save report</button></div>
                  </div>
                )) : (
                  <div className="sva-form">
                    {draftDl.length ? <ul className="sva-files">{draftDl.map((d) => <li key={d.id}><Icon name="file" width="16" height="16" aria-hidden="true" /><b style={{ fontWeight: 'var(--weight-medium)' }}>{d.name}</b>{d.note ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{d.note}</span> : null}<small>v{d.version} · not sent yet</small></li>)}</ul> : null}
                    <div className="sva-grid2">
                      <div><label className="gc-label" htmlFor="so-dn">File or link</label><input id="so-dn" className="gc-input" placeholder="home-design-v2.pdf" value={dl.name} onChange={(e) => setDl({ ...dl, name: e.target.value })} /></div>
                      <div><label className="gc-label" htmlFor="so-dd">Note for the merchant</label><input id="so-dd" className="gc-input" value={dl.note} onChange={(e) => setDl({ ...dl, note: e.target.value })} /></div>
                    </div>
                    <div><button type="button" className="ix-btn" onClick={() => { if (say(addDeliverable(o.id, dl, st.expert ? st.expert.name : by), 'Added')) setDl({ name: '', note: '' }); }}>Add</button></div>
                  </div>
                )}
                <div className="sva-row">
                  <button type="button" className="ix-btn ix-btn--primary" onClick={() => say(submitWork(o.id, by), o.qa ? 'Handed in for the quality check' : 'Delivered to the merchant')}>{o.qa ? 'Hand in for the quality check' : 'Deliver to the merchant'}</button>
                  <button type="button" className="ix-btn" onClick={() => setAsk('')}>Ask the merchant…</button>
                  <button type="button" className="ix-btn" onClick={() => setAcc({ area: (st.svc.access && st.svc.access.area) || 'products', minutes: (st.svc.access && st.svc.access.minutes) || 60 })} disabled={o.access.status === 'asked'}>Ask for store access…</button>
                  <button type="button" className="ix-btn" onClick={() => setQuote({ text: '', fee: '', days: '' })}>Offer extra work…</button>
                </div>
              </section>
            ) : null}
            {st.status === 'waiting' ? (
              <section className="ix-card sva-pad" aria-labelledby="so-next">
                <h2 id="so-next">Waiting for the merchant</h2>
                <p className="gc-help">{o.access.status === 'asked' ? `The owner is asked to open ${areaLabel(o.access.area).toLowerCase()} for ${o.access.minutes} min.` : 'The merchant was asked something.'} The deadline is paused. {st.quietWarn ? `The order closes by itself in ${st.quietLeft} days without a reply.` : ''}</p>
                <div className="sva-row"><button type="button" className="ix-btn" onClick={() => say(resume(o.id, by), 'Back in progress')}>They answered elsewhere: resume</button></div>
              </section>
            ) : null}
            {st.status === 'qa' ? (
              <section className="ix-card sva-pad" aria-labelledby="so-next">
                <h2 id="so-next">Quality check</h2>
                {monthly ? draftRep.map((r) => <div key={r.id}><p>{r.summary}</p><div className="sva-kpis" style={{ marginTop: 8 }}>{r.kpis.map(([l, v]) => <span key={l} className="gc-badge gc-badge--slate">{l}: {v}</span>)}</div></div>)
                  : <ul className="sva-files">{draftDl.map((d) => <li key={d.id}><Icon name="file" width="16" height="16" aria-hidden="true" />{d.name}{d.note ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{d.note}</span> : null}<small>v{d.version} · {st.expert ? st.expert.name : ''}</small></li>)}</ul>}
                {ownWork ? <p className="gc-help gc-help--error">This is your own work: another lead checks it.</p> : !isLead ? <p className="gc-help">A lead (support, management or ops) checks it.</p> : qa != null ? (
                  <div className="sva-form">
                    <label className="gc-label" htmlFor="so-qa">What to fix (only the team sees this)</label>
                    <textarea id="so-qa" className="gc-input" rows={2} value={qa} onChange={(e) => setQa(e.target.value)} />
                    <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" onClick={() => { if (say(qaDecide(o.id, false, qa, by), 'Sent back to the expert')) setQa(null); }}>Send back</button><button type="button" className="ix-btn" onClick={() => setQa(null)}>Cancel</button></div>
                  </div>
                ) : (
                  <div className="sva-row">
                    <button type="button" className="ix-btn ix-btn--primary" onClick={() => say(qaDecide(o.id, true, '', by), 'Passed · delivered to the merchant')}>Pass · deliver</button>
                    <button type="button" className="ix-btn" onClick={() => setQa('')}>Send back…</button>
                  </div>
                )}
              </section>
            ) : null}
            {st.status === 'delivered' ? (
              <section className="ix-card sva-pad"><h2>Delivered · the merchant approves it</h2><p className="gc-help">{st.revisionsLeft} change{st.revisionsLeft === 1 ? '' : 's'} left in the package. Asking for more becomes extra work (a paid quote).</p>
                <div className="sva-row"><button type="button" className="ix-btn" onClick={() => setQuote({ text: '', fee: '', days: '' })}>Offer extra work…</button></div></section>
            ) : null}

            {ask != null ? (
              <section className="ix-card sva-pad" aria-label="Ask the merchant">
                <label className="gc-label" htmlFor="so-ask">What do you need from the merchant?</label>
                <textarea id="so-ask" className="gc-input" rows={3} value={ask} onChange={(e) => setAsk(e.target.value)} />
                <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" onClick={() => { if (say(askMerchant(o.id, ask, st.expert ? st.expert.name : by), 'Asked · the deadline is paused')) setAsk(null); }}>Ask and pause the deadline</button><button type="button" className="ix-btn" onClick={() => setAsk(null)}>Cancel</button></div>
              </section>
            ) : null}
            {acc ? (
              <section className="ix-card sva-pad" aria-label="Ask for store access">
                <h2>Ask the owner to open the store</h2>
                <div className="sva-grid2">
                  <div><label className="gc-label" htmlFor="so-area">What may be opened</label><select id="so-area" className="gc-input gc-select" value={acc.area} onChange={(e) => setAcc({ ...acc, area: e.target.value })}>{AREAS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                  <div><label className="gc-label" htmlFor="so-min">For up to</label><select id="so-min" className="gc-input gc-select" value={acc.minutes} onChange={(e) => setAcc({ ...acc, minutes: Number(e.target.value) })}>{[15, 30, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}</select></div>
                </div>
                <p className="gc-help">The owner approves it in their panel (the order’s page). Then you start the session here; it is logged on the store and ends when the time is up.</p>
                <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" onClick={doAccess}>Ask the owner</button><button type="button" className="ix-btn" onClick={() => setAcc(null)}>Cancel</button></div>
              </section>
            ) : null}
            {quote ? (
              <section className="ix-card sva-pad" aria-label="Offer extra work">
                <h2>Extra work (outside the package)</h2>
                <div><label className="gc-label" htmlFor="so-qt">What it is</label><input id="so-qt" className="gc-input" value={quote.text} onChange={(e) => setQuote({ ...quote, text: e.target.value })} placeholder="e.g. 200 more products" /></div>
                <div className="sva-grid2">
                  <div><label className="gc-label" htmlFor="so-qf">Fee before VAT (৳)</label><input id="so-qf" className="gc-input" inputMode="numeric" value={quote.fee} onChange={(e) => setQuote({ ...quote, fee: e.target.value })} /></div>
                  <div><label className="gc-label" htmlFor="so-qd">Extra days</label><input id="so-qd" className="gc-input" inputMode="numeric" value={quote.days} onChange={(e) => setQuote({ ...quote, days: e.target.value })} /></div>
                </div>
                <p className="gc-help">VAT {settings().vatPct}% is added. The merchant accepts and pays it on the order’s page.</p>
                <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" onClick={() => { if (say(proposeQuote(o.id, quote, by), 'Sent to the merchant')) setQuote(null); }}>Send the quote</button><button type="button" className="ix-btn" onClick={() => setQuote(null)}>Cancel</button></div>
              </section>
            ) : null}

            {/* ---- conversation ---- */}
            <section className="ix-card" aria-labelledby="so-msgs">
              <div className="ix-card__head"><h2 id="so-msgs">Conversation</h2><span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Notes are only for the team</span></div>
              <div className="sva-thread">
                {o.messages.length ? o.messages.map((m) => (
                  <div key={m.id} className={'sva-msg' + (m.from === 'system' ? ' is-sys' : m.from !== 'merchant' ? ' is-us' : '') + (m.internal ? ' is-note' : '')}>
                    {m.from !== 'system' ? <small>{m.name}{m.internal ? ' · team note' : ''}</small> : null}
                    <div className="sva-b">{m.text}{(m.files || []).length ? '  ' + m.files.map((f) => '📎 ' + f.name).join('  ') : ''}</div>
                    <small>{dTime(m.at)}</small>
                  </div>
                )) : <p className="ix-muted" style={{ margin: 0 }}>No messages yet.</p>}
              </div>
              {!['closed', 'cancelled', 'refunded'].includes(st.status) ? (
                <div className="sva-compose">
                  <textarea className="gc-input" rows={2} aria-label="Message" placeholder={note ? 'A note for the team…' : `Write to ${o.shopName} as ${st.expert ? st.expert.name : by}…`} value={msg} onChange={(e) => setMsg(e.target.value)} />
                  <div className="sva-row"><label className="sva-chk"><input type="checkbox" className="gc-check" checked={note} onChange={(e) => setNote(e.target.checked)} />Team note (the merchant doesn’t see it)</label><button type="button" className="ix-btn ix-btn--primary" style={{ marginLeft: 'auto' }} onClick={sendMsg}>{note ? 'Add note' : 'Send'}</button></div>
                </div>
              ) : null}
            </section>

            <section className="ix-card sva-pad" aria-labelledby="so-files">
              <h2 id="so-files">Files</h2>
              {o.deliverables.length || o.files.length || o.reports.length ? (
                <ul className="sva-files">
                  {o.reports.map((r) => <li key={r.id}><Icon name="file-bar-chart" width="16" height="16" aria-hidden="true" />{r.title}<small>{r.status === 'sent' ? 'sent ' + dShort(r.at) : 'draft'}{r.rating ? ' · ' + r.rating.stars + '★' : ''}</small></li>)}
                  {o.deliverables.map((d) => <li key={d.id}><Icon name="file-check" width="16" height="16" aria-hidden="true" />{d.name}<small>v{d.version} · {d.draft ? 'not sent' : 'delivered'} · {d.by}</small></li>)}
                  {o.files.map((f, i) => <li key={'f' + i}><Icon name="file" width="16" height="16" aria-hidden="true" />{f.name}<small>from {f.by} · {dShort(f.at)}</small></li>)}
                </ul>
              ) : <p className="ix-muted">Nothing yet.</p>}
            </section>
          </div>

          <aside className="ix-side" aria-label="Order details">
            <section className="ix-card sva-pad">
              <h2>Deadline</h2>
              <KV rows={[
                ['Due', st.due ? dTime(st.due) : 'Starts when assigned'],
                ['Now', slaWord(st) || (st.status === 'delivered' ? 'Delivered' : '—')],
                ['Paused so far', st.paused ? Math.round(st.paused / 3600e3) + ' h (waiting for the merchant)' : '—'],
                ['Changes used', `${o.revisionsUsed || 0} of ${pkg.revisions || 0}`],
              ]} />
            </section>
            {st.status !== 'brief' ? (
              <section className="ix-card sva-pad">
                <h2>Expert</h2>
                <p>{st.expert ? `${st.expert.name} · ${st.expert.kind === 'partner' ? 'partner, ' + st.expert.commission + '% commission' : 'GridCommerce staff'}` : 'None'}</p>
                {!['closed', 'cancelled', 'refunded'].includes(st.status) ? (
                  <div className="sva-row">
                    <select className="gc-input gc-select" style={{ flex: 1, minWidth: 0 }} aria-label="Move to another expert" value={pick || o.expertId || ''} onChange={(e) => setPick(e.target.value)}>{experts.map((e) => <option key={e.id} value={e.id}>{e.name} · {loadOf(e.id)}/{e.capacity}</option>)}</select>
                    <button type="button" className="ix-btn ix-btn--sm" disabled={!pick || pick === o.expertId} onClick={() => say(assign(o.id, pick, by), 'Moved')}>Move</button>
                  </div>
                ) : null}
              </section>
            ) : null}
            <section className="ix-card sva-pad">
              <h2>Money</h2>
              <KV rows={[
                ['Paid', `${tk(o.total)} (fee ${tk(o.fee)} + VAT ${tk(o.vat)})`],
                ...o.quotes.map((q) => ['Extra work', `${q.text} · ${tk(q.total)} · ${q.status}`]),
                monthly ? ['Each month', tk(o.total) + (o.stopAt ? ` · stops ${dShort(o.stopAt)}` : ' · with the subscription')] : null,
                st.expert && st.expert.kind === 'partner' ? ['Partner earns', tk(Math.round((o.fee * st.expert.commission) / 100)) + (monthly ? ' a month' : '') + ' when approved'] : null,
                ['Refundable', tk(st.refundable)],
              ].filter(Boolean)} />
              {o.refunds.map((r) => (
                <ul key={r.id} className="sva-files"><li>
                  <span>{r.id} · {tk(r.amount)} · {r.reason}{r.note ? ' · ' + r.note : ''}<span className="sva-sub">{r.status} · asked by {r.by}{r.approvedBy ? ' · approved by ' + r.approvedBy : ''}</span></span>
                  {r.status === 'requested' ? <span className="sva-row" style={{ marginLeft: 'auto' }}><button type="button" className="ix-btn ix-btn--sm" onClick={() => say(decideRefund(o.id, r.id, true, by), 'Approved')}>Approve</button><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => say(decideRefund(o.id, r.id, false, by), 'Declined')}>Decline</button></span> : null}
                  {r.status === 'approved' ? <button type="button" className="ix-btn ix-btn--sm" style={{ marginLeft: 'auto' }} onClick={() => say(decideRefund(o.id, r.id, 'sent', by), 'Marked sent · it reaches Finance › Refunds')}>Mark sent</button> : null}
                </li></ul>
              ))}
              {refund ? (
                <div className="sva-form">
                  <div className="sva-grid2">
                    <div><label className="gc-label" htmlFor="so-ra">Amount (৳)</label><input id="so-ra" className="gc-input" inputMode="numeric" value={refund.amount} onChange={(e) => setRefund({ ...refund, amount: e.target.value })} /></div>
                    <div><label className="gc-label" htmlFor="so-rr">Reason</label><select id="so-rr" className="gc-input gc-select" value={refund.reason} onChange={(e) => setRefund({ ...refund, reason: e.target.value })}><option value="">Choose…</option>{REFUND_REASONS.map((x) => <option key={x}>{x}</option>)}</select></div>
                  </div>
                  <div><label className="gc-label" htmlFor="so-rn">Note</label><input id="so-rn" className="gc-input" value={refund.note} onChange={(e) => setRefund({ ...refund, note: e.target.value })} /></div>
                  <p className="gc-help">{st.status === 'brief' ? 'Work has not started: the whole amount can go back.' : 'Work has started: refund part of it (all of it only when it was not what was agreed).'}</p>
                  <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" onClick={doRefundAsk}>Ask for approval</button><button type="button" className="ix-btn" onClick={() => setRefund(null)}>Cancel</button></div>
                </div>
              ) : st.refundable > 0 ? <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => setRefund({ amount: st.status === 'brief' ? String(st.refundable) : '', reason: '', note: '' })}>Refund…</button></div> : null}
            </section>
            <section className="ix-card sva-pad">
              <h2>Store access</h2>
              {o.access.status === 'none' ? <p className="gc-help">{st.svc.access && st.svc.access.needed ? `This service usually needs ${areaLabel(st.svc.access.area).toLowerCase()}.` : 'Not needed so far.'}</p> : (<>
                <KV rows={[['Asked', `${areaLabel(o.access.area)} · ${o.access.minutes} min${o.access.askedBy ? ' · by ' + o.access.askedBy : ''}`], ['Owner', o.access.status === 'asked' ? 'Not answered yet' : o.access.status === 'declined' ? 'Declined' : 'Approved in their panel'], session ? ['Session', `${session.id} · ${STATE_LABEL[sState] || sState}`] : null].filter(Boolean)} />
                {session && sState === 'approved' && session.byId === me.id ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={doStart}>Start session</button> : null}
                {session && sState === 'approved' && session.byId !== me.id ? <p className="gc-help">{session.by} asked, so they start it.</p> : null}
              </>)}
            </section>
            <section className="ix-card sva-pad">
              <h2>Brief</h2>
              {(st.svc.brief || []).map((f) => { const v = o.brief[f.id]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) return null; return <div key={f.id}><span className="gc-label">{f.label}</span><p style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{Array.isArray(v) ? v.map((x) => x.name).join(', ') : f.type === 'money' ? tk(Number(String(v).replace(/[^0-9.]/g, ''))) + ' (paid by the merchant to the ad platform)' : String(v)}</p></div>; })}
              {!Object.keys(o.brief || {}).length ? <p className="ix-muted">No brief answers.</p> : null}
            </section>
            <details className="ix-card gc-disclose" style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <summary>History</summary>
              <ul className="sva-files" style={{ marginTop: 8 }}>{o.history.slice().reverse().map((h, i) => <li key={i}><span>{h.text}<span className="sva-sub">{dTime(h.at)} · {h.by}</span></span></li>)}</ul>
            </details>
            <p className="gc-help" style={{ margin: 0 }}><Link href={'/admin/merchant?id=' + o.shopId} className="bl-link">Store profile</Link></p>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
