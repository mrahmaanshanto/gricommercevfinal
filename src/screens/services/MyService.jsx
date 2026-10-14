'use client';
// A service order (/my-service?id=SO-1001): where it is (Brief received → In progress → In review → Delivered → Closed;
// Waiting for you stops the deadline), what needs the owner now — approve store access (what the expert may open and
// for how long; it uses GridCommerce's access sessions, every change logged), accept or decline extra work (paid on
// accepting), approve the delivery or this month's report or ask for a change (changes left shown), rate it — then the
// messages with the expert, the files and deliverables, monthly reports, and the order's details, brief and history.
// A quiet order (Waiting for you, no reply) closes by itself after 14 days; the page warns from day 10.
// Data: lib/platform/services.js. Front end only.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { postEntry } from '@/lib/ledger';
import {
  orderById, stateOf, pkgOf, postMessage, approveDelivery, requestChange, rate, answerAccess, acceptQuote, declineQuote, cancelOrder, stopRetainer,
  areaLabel, payLabel, PAY_METHODS, QUIET_DAYS,
} from '@/lib/platform/services';
import { SvcFrame, useServices, SvcStatus, Steps, Stars, StarPicker, tk, query, dateText, shortDate, timeText, dueWord } from './svcShared';

const PAY_ACCOUNT = { bkash: 'bkash', nagad: 'nagad', card: 'brac', credits: 'gc-credits' };
const say = (res, ok) => { if (res && res.ok === false) { toast(res.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };

export default function MyService() {
  const { ready, tick } = useServices();
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [change, setChange] = useState(null);
  const [mins, setMins] = useState(60);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [qPay, setQPay] = useState('bkash');
  const o = useMemo(() => (ready ? orderById(query('id')) : null), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <SvcFrame screen="MyService" active="svc-mine" page="Order"><div style={{ minHeight: 400 }} aria-busy="true" /></SvcFrame>;
  if (!o) return <SvcFrame screen="MyService" active="svc-mine" page="Order" narrow><RecordHeader back="/my-services" backLabel="My services" title="Order not found" /><section className="ix-card ix-empty"><EmptyState icon="briefcase" title="This order is not here" actionLabel="My services" onAction={() => { window.location.href = '/my-services'; }} /></section></SvcFrame>;

  const st = stateOf(o);
  const pkg = pkgOf(st.svc, o.pkgId) || {};
  const monthly = o.cycle === 'monthly';
  const openQuote = (o.quotes || []).find((q) => q.status === 'sent');
  const lastReport = st.lastReport;
  const shown = o.messages.filter((m) => !m.internal);
  const delivered = o.deliverables.filter((d) => !d.draft);
  const needRateOrder = st.status === 'closed' && o.closeReason === 'Approved' && !o.rating && !monthly;
  const needRateReport = monthly && lastReport && lastReport.approvedAt && !lastReport.rating;

  const send = () => { if (say(postMessage(o.id, { from: 'merchant', text, files }))) { setText(''); setFiles([]); } };
  const doRate = () => { if (!stars) { toast('Pick the stars first.', { tone: 'error' }); return; } if (say(rate(o.id, stars, review, needRateReport ? lastReport.id : null), 'Thank you for rating it')) { setStars(0); setReview(''); } };
  const doQuote = () => {
    const res = acceptQuote(o.id, openQuote.id, qPay);
    if (!say(res, 'Extra work accepted and paid')) return;
    try { postEntry({ account: PAY_ACCOUNT[qPay], amount: -openQuote.total, kind: 'expense', cat: 'Software & subscriptions', party: 'GridCommerce Services', note: `${st.svc.name} · extra work · ${o.id}`, by: 'Staff' }); } catch { /* optional */ }
  };
  const cancel = async () => {
    if (!(await confirmDialog({ title: 'Cancel this order?', body: `Work has not started, so the full ${tk(o.total)} comes back to your ${payLabel(o.paid.method)}.`, confirmLabel: 'Cancel order', cancelLabel: 'Keep it', tone: 'danger' }))) return;
    say(cancelOrder(o.id, o.shopName), 'Order cancelled. The refund is on its way.');
  };
  const stop = async () => {
    if (!(await confirmDialog({ title: 'Stop this monthly service?', body: 'It ends with the month you are in; you are not charged after that.', confirmLabel: 'Stop it' }))) return;
    say(stopRetainer(o.id, o.shopName), 'It stops at the end of this month');
  };

  return (
    <SvcFrame screen="MyService" active="svc-mine" page={st.svc.name}>
      <RecordHeader back="/my-services" backLabel="My services" title={st.svc.name + ' · ' + pkg.name}
        badges={<SvcStatus status={st.status} />}
        meta={<>{o.id} · paid {dateText(o.paid.at)}{monthly ? ' · monthly' : ''}</>}
        more={[o.status === 'brief' ? { label: 'Cancel order', onClick: cancel, tone: 'danger' } : null, monthly && !o.stopAt && !['closed', 'cancelled', 'refunded'].includes(st.status) ? { label: 'Stop at the end of this month', onClick: stop } : null, { label: 'Order this again', href: '/service-detail?id=' + o.serviceId }].filter(Boolean)} />

      <section className="ix-card svc-pad" aria-label="Progress"><Steps status={st.status} /></section>

      <div className="ix-record">
        <div className="ix-main">
          {/* ---- what needs the owner now ---- */}
          {o.access.status === 'asked' ? (
            <section className="svc-need" aria-labelledby="ms-acc">
              <h2 id="ms-acc"><Icon name="key-round" width="16" height="16" aria-hidden="true" />{(st.expert && st.expert.name) || 'The expert'} asks to open your store</h2>
              <p>They may open <b>{areaLabel(o.access.area).toLowerCase()}</b>, nothing else, and every change they make is logged. It ends by itself when the time is up.</p>
              <div className="svc-row">
                <label className="gc-label" htmlFor="ms-mins" style={{ margin: 0 }}>For up to</label>
                <select id="ms-mins" className="gc-input gc-select" style={{ width: 'auto' }} value={mins} onChange={(e) => setMins(Number(e.target.value))}>{[15, 30, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}</select>
              </div>
              <div className="svc-row">
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => say(answerAccess(o.id, true, { minutes: mins }), 'Store access approved')}>Approve</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(answerAccess(o.id, false), 'Declined')}>Decline</button>
              </div>
            </section>
          ) : null}
          {openQuote ? (
            <section className="svc-need" aria-labelledby="ms-q">
              <h2 id="ms-q"><Icon name="receipt" width="16" height="16" aria-hidden="true" />Extra work offered</h2>
              <p>{openQuote.text} · <b>{tk(openQuote.total)}</b> (VAT included){openQuote.days ? ` · ${openQuote.days} more days` : ''}. It is outside the package you bought.</p>
              <div className="svc-row">
                <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Pay with" value={qPay} onChange={(e) => setQPay(e.target.value)}>{PAY_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={doQuote}>Accept and pay {tk(openQuote.total)}</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => say(declineQuote(o.id, openQuote.id), 'Declined')}>Decline</button>
              </div>
            </section>
          ) : null}
          {st.status === 'waiting' && o.access.status !== 'asked' ? (
            <section className="svc-need" aria-labelledby="ms-w">
              <h2 id="ms-w"><Icon name="message-circle-question" width="16" height="16" aria-hidden="true" />The expert needs something from you</h2>
              <p>Read their message below and reply. The deadline is stopped until you do.{st.quietWarn ? ` If there is no reply, the order closes by itself in ${st.quietLeft} day${st.quietLeft === 1 ? '' : 's'}.` : ''}</p>
            </section>
          ) : null}
          {st.status === 'delivered' ? (
            <section className="svc-need" aria-labelledby="ms-d" style={{ borderColor: 'var(--success)', background: 'var(--fill-success-soft, var(--surface-card))' }}>
              <h2 id="ms-d"><Icon name="package-check" width="16" height="16" aria-hidden="true" />{monthly ? `Your month ${lastReport ? lastReport.month : ''} report is ready` : 'Your work is ready'}</h2>
              {monthly && lastReport ? (<>
                <p>{lastReport.summary}</p>
                {lastReport.kpis && lastReport.kpis.length ? <div className="svc-kpis">{lastReport.kpis.map(([l, v]) => <div key={l} className="svc-kpi"><span>{l}</span><b>{v}</b></div>)}</div> : null}
              </>) : (
                <ul className="svc-files">{delivered.slice(-3).map((d) => <li key={d.id}><Icon name="file-check" width="16" height="16" aria-hidden="true" /><b>{d.name}</b>{d.note ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{d.note}</span> : null}<small>v{d.version}</small></li>)}</ul>
              )}
              {change != null ? (
                <div className="svc-field">
                  <label className="gc-label" htmlFor="ms-chg">What should change?</label>
                  <textarea id="ms-chg" className="gc-input" rows={3} value={change} onChange={(e) => setChange(e.target.value)} />
                  <div className="svc-row">
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { if (say(requestChange(o.id, change), 'Change requested')) setChange(null); }}>Send</button>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setChange(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="svc-row">
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => say(approveDelivery(o.id), monthly ? 'Approved. Next month has started.' : 'Approved. Please rate it.')}>Approve</button>
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!st.revisionsLeft} onClick={() => setChange('')}>Ask for a change</button>
                  <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{st.revisionsLeft ? `${st.revisionsLeft} change${st.revisionsLeft === 1 ? '' : 's'} left` : 'No changes left: the expert can offer extra work'}</span>
                </div>
              )}
            </section>
          ) : null}
          {needRateOrder || needRateReport ? (
            <section className="svc-need" aria-labelledby="ms-r" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-card)' }}>
              <h2 id="ms-r"><Icon name="star" width="16" height="16" aria-hidden="true" />How was {needRateReport ? `month ${lastReport.month}` : 'the work'}?</h2>
              <StarPicker value={stars} onChange={setStars} />
              <textarea className="gc-input" rows={2} aria-label="A few words (optional)" placeholder="A few words (optional)" value={review} onChange={(e) => setReview(e.target.value)} />
              <div><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={doRate}>Send rating</button></div>
            </section>
          ) : null}

          {/* ---- messages ---- */}
          <section className="ix-card" aria-labelledby="ms-msg">
            <div className="ix-card__head"><h2 id="ms-msg">Messages</h2>{st.expert ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>with {st.expert.name}</span> : null}</div>
            <div className="svc-thread" aria-live="polite">
              {shown.length ? shown.map((m) => (
                <div key={m.id} className={'svc-msg' + (m.from === 'merchant' ? ' is-me' : m.from === 'system' ? ' is-sys' : '')}>
                  {m.from !== 'system' && m.from !== 'merchant' ? <small>{m.name}</small> : null}
                  <div className="svc-bubble">{m.text}{(m.files || []).length ? <><br />{m.files.map((f) => '📎 ' + f.name).join('  ')}</> : null}</div>
                  <small>{timeText(m.at)}</small>
                </div>
              )) : <p className="ix-muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>No messages yet.</p>}
            </div>
            {!['closed', 'cancelled', 'refunded'].includes(st.status) ? (
              <div className="svc-compose">
                <label className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Attach files" title="Attach files" style={{ cursor: 'pointer' }}>
                  <Icon name="paperclip" width="16" height="16" aria-hidden="true" />
                  <input type="file" multiple hidden onChange={(e) => { const add = Array.from(e.target.files || []).map((x) => ({ name: x.name, size: Math.max(1, Math.round(x.size / 1024)) + ' KB' })); e.target.value = ''; setFiles((f) => [...f, ...add]); }} />
                </label>
                <textarea className="gc-input" rows={1} aria-label="Message to the expert" placeholder={files.length ? files.map((f) => f.name).join(', ') : 'Write to the expert…'} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); }} />
                <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={send}>Send</button>
              </div>
            ) : null}
          </section>

          {monthly && o.reports.filter((r) => r.status === 'sent').length ? (
            <section className="ix-card svc-pad" aria-labelledby="ms-rep">
              <h2 id="ms-rep">Monthly reports</h2>
              {o.reports.filter((r) => r.status === 'sent').slice().reverse().map((r) => (
                <details key={r.id} className="gc-disclose" open={r === lastReport}>
                  <summary>{r.title} · {shortDate(r.at)}{r.rating ? <> · <Stars value={r.rating.stars} size={12} /></> : null}</summary>
                  <p style={{ margin: '6px 0' }}>{r.summary}</p>
                  {r.kpis && r.kpis.length ? <div className="svc-kpis">{r.kpis.map(([l, v]) => <div key={l} className="svc-kpi"><span>{l}</span><b>{v}</b></div>)}</div> : null}
                </details>
              ))}
            </section>
          ) : null}

          <section className="ix-card svc-pad" aria-labelledby="ms-files">
            <h2 id="ms-files">Files and deliveries</h2>
            {delivered.length || o.files.length ? (
              <ul className="svc-files">
                {delivered.map((d) => <li key={d.id}><Icon name="file-check" width="16" height="16" aria-hidden="true" style={{ color: 'var(--text-success)' }} /><b>{d.name}</b><small>v{d.version} · {shortDate(d.at)} · from {d.by}</small></li>)}
                {o.files.map((f, i) => <li key={'f' + i}><Icon name="file" width="16" height="16" aria-hidden="true" /><b>{f.name}</b><small>{f.size ? f.size + ' · ' : ''}{shortDate(f.at)} · you</small></li>)}
              </ul>
            ) : <p className="ix-muted" style={{ fontSize: 'var(--text-sm)' }}>Nothing yet.</p>}
          </section>
        </div>

        <aside className="ix-side" aria-label="Order details">
          <section className="ix-card svc-pad">
            <h2>Details</h2>
            <KV rows={[
              ['Expert', st.expert ? <span>{st.expert.name}{st.expert.rating ? <> · <Stars value={st.expert.rating} size={11} /></> : null}</span> : 'Assigned within a working day'],
              ['Due', st.due && ['brief', 'progress', 'qa', 'waiting'].includes(st.status) ? `${dateText(st.due)} · ${st.waiting ? 'paused while waiting for you' : dueWord(st.left)}` : st.status === 'brief' ? 'Starts when the expert is assigned' : '—'],
              ['Changes left', monthly ? 'Per report: ' + (pkg.revisions || 0) : String(st.revisionsLeft)],
              ['Paid', tk(st.paidTotal) + (st.refunded ? ` · ${tk(st.refunded)} refunded` : '')],
              ['Invoice', o.invNo],
              monthly ? ['Next charge', o.stopAt ? `None · stops ${dateText(o.stopAt)}` : `${tk(o.total)} with your subscription`] : null,
              o.access.status !== 'none' ? ['Store access', o.access.status === 'asked' ? 'Waiting for you' : o.access.status === 'declined' ? 'Declined' : `${areaLabel(o.access.area)} · ${o.access.minutes} min · approved`] : null,
            ].filter(Boolean)} />
            {st.status === 'waiting' ? <p className="gc-help" style={{ margin: 0 }}>Orders waiting for you close by themselves after {QUIET_DAYS} days without a reply.</p> : null}
          </section>
          <section className="ix-card svc-pad">
            <h2>Your brief</h2>
            {(st.svc.brief || []).map((f) => { const v = o.brief[f.id]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) return null; return <div key={f.id} className="svc-field"><span className="gc-label">{f.label}</span><span style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{Array.isArray(v) ? v.map((x) => x.name).join(', ') : f.type === 'money' ? tk(Number(String(v).replace(/[^0-9.]/g, ''))) : String(v)}</span></div>; })}
          </section>
          <details className="ix-card gc-disclose" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <summary>History</summary>
            <ul className="svc-files" style={{ marginTop: 8 }}>{o.history.slice().reverse().map((h, i) => <li key={i} style={{ flexDirection: 'column', alignItems: 'flex-start' }}><span>{h.text}</span><small style={{ marginLeft: 0 }}>{timeText(h.at)} · {h.by}</small></li>)}</ul>
          </details>
          <p className="gc-help" style={{ margin: 0 }}>Need help with this order? <Link href="/support-tickets" className="bl-link">Ask support</Link></p>
        </aside>
      </div>
    </SvcFrame>
  );
}
