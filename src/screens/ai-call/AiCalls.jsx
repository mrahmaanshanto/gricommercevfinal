'use client';
// AI calls · results — the AI confirmation calls, laid out like a Shopify list (components/ui/IndexKit.jsx): title
// row, today's figures, then one card with the result views, search and a compact table. A row opens the call in a
// side panel: the recording, the transcript and what to do next (mark confirmed, call again, call myself).
// Edit freely: this file is the source for the screen.

import React from 'react';
import Link from 'next/link';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV, Pager } from '@/components/ui/IndexKit';
import { getOrders, patchOrder, logOrder, orderHref } from '@/lib/orders';
import { verifyOf, startAutoCall, settleAutoCall } from '@/lib/orderFlow';
import { isNewOrder, statusKeyOf } from '@/lib/orderStatus';
import { clockNow } from '@/lib/settlements';
import { currentUser } from '@/lib/team';
import { formatBDT, formatDate, formatTime, groupIndian } from '@/lib/format';

// ---- logic ----
// The calls are the orders' automatic confirmation calls (lib/orderFlow.js › verifyOf, method 'auto'): the demo's
// approved orders were confirmed on one, and Auto call on an order page adds more. "Needs a person" is what the menu
// counts (lib/liveCounts.js › aicalls): no answer or wrong number on an order that is still new.

const DAY = 24 * 60 * 60 * 1000;
const DAYS = 7;   // the list shows the last week's calls
const PAGE = 25;
// result key -> [label, badge tone]
const ST = { calling: ['Calling', 'info'], conf: ['AI confirmed', 'success'], cancel: ['Cancelled by customer', 'error'], noans: ['No answer', 'warning'], wrong: ['Wrong number', 'error'], person: ['Needs a person', 'primary'] };
const KEY_OF = { calling: 'calling', confirmed: 'conf', declined: 'cancel', 'no-answer': 'noans', 'wrong-number': 'wrong' };
const ORDER = ['all', 'person', 'conf', 'noans', 'cancel', 'wrong'];
const hash = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 1000003; return h; };
const taka = (n) => groupIndian(Math.round(n || 0));

/** What was said on the call (the demo makes it from the order and the result). */
function transcript(o, key) {
  const first = String(o.customer || '').split(' ')[0] || 'আপনি';
  const hello = ['ai', 'আসসালামু আলাইকুম ' + first + ', আপনার অর্ডার ' + o.id + ' নিয়ে কল করছি। মোট ' + taka(o.amount) + ' টাকা। কনফার্ম করবেন?'];
  if (key === 'calling') return [];
  if (key === 'noans' || key === 'person') return [['ai', 'কল ধরেননি। একটি SMS পাঠানো হয়েছে।']];
  if (key === 'wrong') return [['ai', 'এই নম্বরটি চালু নেই। অর্ডারটি দেখে নিন।']];
  if (key === 'cancel') return [hello, ['c', 'অর্ডারটা বাতিল করুন।'], ['ai', 'ঠিক আছে, অর্ডারটি বাতিল করা হলো।']];
  return [hello, ['c', 'জি, কনফার্ম।'], ['ai', 'ধন্যবাদ। শিগগির ডেলিভারি হবে।']];
}

/** The last week's automatic calls, newest first. */
function readCalls(now) {
  const out = [];
  getOrders().forEach((o) => {
    const v = verifyOf(o, now);
    if (!v || v.method !== 'auto' || !v.at || now - v.at > DAYS * DAY) return;
    let key = KEY_OF[v.state] || 'conf';
    if ((key === 'noans' || key === 'wrong') && isNewOrder(statusKeyOf(o.status, o.payment))) key = 'person';
    const secs = 25 + (hash(o.id) % 40);
    out.push({ o, v, key, at: v.at, tries: (v.attempts || 1) + ' of 3', dur: key === 'conf' || key === 'cancel' ? '0:' + String(secs).padStart(2, '0') : '—' });
  });
  return out.sort((a, b) => b.at - a.at);
}

class Component extends DCLogic {
  state = { ready: false, ver: 0, f: 'all', sel: '', p: 0, q: '', find: false, pg: 0 };
  componentDidMount() {
    this.setState({ ready: true });
    // a call made here (AI call again) answers after a few seconds: write the answer down when it is in
    this.timer = window.setInterval(() => {
      const busy = getOrders().filter((o) => o.verify && o.verify.state === 'calling');
      if (!busy.length) return;
      busy.forEach((o) => settleAutoCall(o));
      this.setState((s) => ({ ver: s.ver + 1 }));
    }, 2000);
  }
  componentWillUnmount() { window.clearInterval(this.timer); }
  renderVals() {
    const s = this.state;
    const now = s.ready ? clockNow() : 0;
    const calls = s.ready ? readCalls(now) : [];
    const cnt = { all: calls.length }; calls.forEach((c) => { cnt[c.key] = (cnt[c.key] || 0) + 1; });
    const needle = s.q.trim().toLowerCase();
    const shown = calls.filter((c) => (s.f === 'all' || c.key === s.f) && (!needle || [c.o.id, c.o.customer, c.o.phone].join(' ').toLowerCase().includes(needle)));
    const cur = calls.find((c) => c.o.id === s.sel) || null;
    const pg = Math.min(s.pg, Math.max(0, Math.ceil(shown.length / PAGE) - 1));
    const page = shown.slice(pg * PAGE, pg * PAGE + PAGE);
    const bump = () => this.setState({ ver: s.ver + 1 });
    const answered = calls.filter((c) => c.key !== 'calling').length;
    const confRate = answered ? Math.round((cnt.conf || 0) / answered * 100) : 0;
    const when = (t) => formatDate(t) + ', ' + formatTime(t);
    return {
      figures: [
        { label: 'Calls', value: String(calls.length), sub: 'last ' + DAYS + ' days' },
        { label: 'Confirmed', value: confRate + '%', sub: (cnt.conf || 0) + ' orders' },
        { label: 'Needs a person', value: String(cnt.person || 0), sub: 'no answer or wrong number' },
        { label: 'Stopped', value: String((cnt.cancel || 0) + (cnt.wrong || 0)), sub: 'cancelled or wrong number' },
      ],
      tabs: ORDER.map((k) => ({ key: k, label: k === 'all' ? 'All results' : ST[k][0], count: cnt[k] || 0, id: 'ai-tab-' + k, on: s.f === k, onClick: () => this.setState({ f: k, pg: 0 }) })),
      tabLabel: s.f === 'all' ? 'All results' : ST[s.f][0],
      find: s.find || !!needle,
      openFind: () => this.setState({ find: true }),
      closeFind: () => this.setState({ find: false, q: '' }),
      q: s.q, onSearch: (e) => this.setState({ q: e.target.value, pg: 0 }),
      empty: shown.length === 0,
      emptyTitle: !s.ready ? 'Loading calls…' : needle ? 'No calls match “' + s.q.trim() + '”' : s.f === 'all' ? 'No AI calls in the last ' + DAYS + ' days.' : 'No calls with this result.',
      countLabel: shown.length > PAGE ? (pg * PAGE + 1) + '–' + (pg * PAGE + page.length) + ' of ' + shown.length + ' calls' : shown.length + (shown.length === 1 ? ' call' : ' calls'),
      atStart: pg === 0, atEnd: (pg + 1) * PAGE >= shown.length,
      prev: () => this.setState({ pg: pg - 1 }), next: () => this.setState({ pg: pg + 1 }),
      rows: page.map((c) => ({ o: c.o.id, n: c.o.customer, amt: formatBDT(c.o.amount), pay: c.o.payment, st: ST[c.key][0], tone: ST[c.key][1], tries: c.tries, t: when(c.at), on: !!cur && c.o.id === cur.o.id,
        open: () => this.setState({ sel: c.o.id, p: 0 }),
        onRowClick: (e) => { if (e.target.closest('a,button')) return; this.setState({ sel: c.o.id, p: 0 }); } })),
      cur: cur ? { o: cur.o.id, href: orderHref(cur.o.id), n: cur.o.customer, ph: cur.o.phone, amt: formatBDT(cur.o.amount), pay: cur.o.payment, tries: cur.tries, at: when(cur.at), st: ST[cur.key][0], tone: ST[cur.key][1], dur: cur.dur,
        done: cur.key === 'conf' || cur.key === 'calling', calling: cur.key === 'calling',
        tr: transcript(cur.o, cur.key).map((m) => ({ ai: m[0] === 'ai', t: m[1], who: m[0] === 'ai' ? 'GridCommerce AI' : cur.o.customer })) } : null,
      close: () => this.setState({ sel: '' }),
      prog: (s.p || 0) + '%', play: () => this.setState({ p: 100 }),
      confirm: () => {
        const by = (currentUser() || {}).name || 'Staff';
        patchOrder(cur.o, { verify: { ...cur.v, state: 'confirmed', by, note: 'Marked confirmed after the AI call' } });
        logOrder(cur.o.id, 'phone-call', 'Marked confirmed', 'After the AI call · ' + by);
        bump(); toast(cur.o.id + ' marked confirmed.');
      },
      again: () => { startAutoCall(cur.o); bump(); toast('Calling ' + cur.o.customer + ' again…', { tone: 'info' }); },
      manual: () => { window.location.href = 'tel:' + String(cur.o.phone || '').replace(/[^0-9+]/g, ''); },
    };
  }
}

// ---- styles ----

const CSS = `
.ai-id{font-family:var(--font-data)}
.ai-play{display:flex;align-items:center;gap:10px}
.ai-play .gc-progress{flex:1;height:6px}
.ai-dur{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ai-tr{display:flex;flex-direction:column;gap:10px}
.ai-msg{display:flex;flex-direction:column;align-items:flex-start;gap:3px}
.ai-msg--c{align-items:flex-end}
.ai-msg__b{max-width:85%;padding:8px 12px;border-radius:var(--radius-xl);background:var(--surface-subtle);font-family:var(--font-bn);font-size:var(--text-sm);line-height:20px;color:var(--text-heading)}
.ai-msg--c .ai-msg__b{background:var(--primary);color:var(--text-inverse)}
.ai-msg small{font-size:var(--text-xs);color:var(--text-muted)}
.ai-h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

// ---- markup ----

export default class AiCallsScreen extends Component {
  render() {
    const v = this.renderVals();
    const c = v.cur;
    return (
      <div className="dc-screen ds" data-screen="AiCalls">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="comm-ai" />
          <main className="gc-shell__main">
            <Topbar crumb="Orders" page="AI calls" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="phone-call" title="AI calls"
                  about="Results of the last week's AI confirmation calls. Open a call to hear it, read the transcript and decide what happens to the order. Calls that need a person wait in their own view."
                  secondary={[{ label: 'Call settings', href: '/auto-call-settings' }]}
                  more={[{ label: 'Orders', href: '/merchant-orders' }, { label: 'Calls', href: '/merchant-calls' }]} />

                <MetricStrip label="AI calls" items={v.figures} />

                <section className="ix-card" aria-label={v.tabLabel}>
                  <div className="ix-bar">
                    {v.find ? (<>
                      <SearchField value={v.q} onChange={v.onSearch} placeholder="Search order, customer or phone" onDone={v.closeFind} autoFocus />
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                    </>) : (<>
                      <IndexTabs tabs={v.tabs} label="Call result" />
                      <span className="ix-tools">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={v.openFind}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                      </span>
                    </>)}
                  </div>
                  {v.empty ? (
                    <div className="ix-empty"><EmptyState icon="phone-off" title={v.emptyTitle} /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label={v.tabLabel}>
                      {v.rows.map((r) => (
                        <li key={r.o}>
                          <button type="button" className="ix-pitem" onClick={r.open}>
                            <span className="ix-pitem__top"><b className="ai-id">{r.o}</b><span>{r.amt}</span></span>
                            <span className="ix-pitem__mid">{r.n} · {r.t} · try {r.tries}</span>
                            <span className="ix-pitem__tags"><StatusBadge tone={r.tone}>{r.st}</StatusBadge></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">{v.tabLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Order</th>
                            <th scope="col">Customer</th>
                            <th scope="col" className="ix-num">Total</th>
                            <th scope="col">Payment</th>
                            <th scope="col">Result</th>
                            <th scope="col">Tries</th>
                            <th scope="col">When</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.o} className={r.on ? 'is-sel' : ''} onClick={r.onRowClick}>
                              <td className="ai-id"><button type="button" className="ix-strong" onClick={r.open}>{r.o}</button></td>
                              <td>{r.n}</td>
                              <td className="ix-num">{r.amt}</td>
                              <td className="ix-muted">{r.pay}</td>
                              <td><StatusBadge tone={r.tone}>{r.st}</StatusBadge></td>
                              <td className="ix-muted">{r.tries}</td>
                              <td className="ix-muted">{r.t}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <Pager label={v.countLabel} atStart={v.atStart} atEnd={v.atEnd} prev={v.prev} next={v.next} />
                </section>
                <LearnMore topic="AI calls" />
              </div>
            </div>
          </main>
        </div>

        <Sheet open={!!c} title={c ? c.n : 'Call'} label="AI call" onClose={v.close}
          footer={c ? <>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={v.manual}>Call myself</button>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={v.again} disabled={c.calling}>AI call again</button>
            {c.done ? null : <button type="button" className="gc-btn gc-btn--solid" onClick={v.confirm}>Mark confirmed</button>}
          </> : null}>
          {c ? (<>
            <div><StatusBadge tone={c.tone}>{c.st}</StatusBadge></div>
            <KV rows={[
              ['Order', <Link key="o" href={c.href} className="ai-id">{c.o}</Link>],
              ['Phone', <span key="p" className="ai-id">{c.ph}</span>],
              ['Total', c.amt + ' · ' + c.pay],
              ['Try', c.tries + ' · ' + c.at],
            ]} />
            {c.dur === '—' ? null : <div className="ai-play">
              <button type="button" className="ix-btn ix-btn--primary ix-btn--icon" aria-label="Play recording" onClick={v.play}><Icon name="play" width="16" height="16" aria-hidden="true" /></button>
              <span className="gc-progress"><span className="gc-progress__fill" style={{ width: v.prog }} /></span>
              <span className="ai-dur">{c.dur}</span>
            </div>}
            {c.tr.length ? <h3 className="ai-h3">Transcript</h3> : null}
            <div className="ai-tr">
              {c.tr.map((m, i) => (
                <div key={i} className={'ai-msg' + (m.ai ? '' : ' ai-msg--c')}>
                  <div className="ai-msg__b">{m.t}</div>
                  <small>{m.who}</small>
                </div>
              ))}
            </div>
          </>) : null}
        </Sheet>
      </div>
    );
  }
}
