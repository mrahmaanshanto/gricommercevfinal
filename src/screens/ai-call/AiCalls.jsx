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
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';

// ---- logic ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }

// result key -> [label, badge tone]
const ST = { conf: ['AI confirmed', 'success'], cancel: ['Cancelled by customer', 'error'], noans: ['No answer', 'warning'], wrong: ['Wrong number', 'error'], person: ['Needs a person', 'primary'], later: ['Call back later', 'info'] };
// order, customer, phone, total, payment, result, try, time, length, transcript
const CALLS = [
  ['#ORD-0929-014', 'Nusrat Jahan', '01711-482093', 2450, 'COD', 'person', '1 of 3', '2:40 PM', '1:12', [['ai', 'আসসালামু আলাইকুম নুসরাত জাহান, GridShop থেকে বলছি। আপনি ২টি পণ্য অর্ডার করেছেন, মোট ২,৪৫০ টাকা।'], ['c', 'হ্যাঁ, কিন্তু কেসটা ব্ল্যাক না, নেভি ব্লু চাই। আর ডেলিভারি শুক্রবারের পরে দিলে ভালো।'], ['ai', 'রঙ বদলানো আর ডেলিভারির দিন ঠিক করার জন্য আমাদের একজন প্রতিনিধি আপনাকে কল করবেন।']]],
  ['#ORD-0929-012', 'Rakibul Hasan', '01819-330214', 1180, 'COD', 'conf', '1 of 3', '2:31 PM', '0:48', [['ai', 'আপনি ১টি চার্জার অর্ডার করেছেন, মোট ১,১৮০ টাকা। ঠিকানা ধানমন্ডি ২৭। কনফার্ম করবেন?'], ['c', 'জি, কনফার্ম।'], ['ai', 'ধন্যবাদ। ২ দিনের মধ্যে ডেলিভারি হবে।']]],
  ['#ORD-0929-010', 'Tanvir Ahmed', '01912-554018', 890, 'COD', 'noans', '3 of 3', '1:55 PM', '—', [['ai', 'তিনবার কল করা হয়েছে, ধরেননি। একটি SMS পাঠানো হয়েছে।']]],
  ['#ORD-0929-011', 'Farhana Akter', '01552-907731', 3960, 'bKash', 'conf', '1 of 3', '1:20 PM', '0:39', [['ai', 'আপনার বিকাশে পরিশোধিত অর্ডারটি কনফার্ম করছি। ঠিকানা মিরপুর ১০?'], ['c', 'হ্যাঁ।']]],
  ['#ORD-0929-009', 'Unknown', '01300-000001', 650, 'COD', 'wrong', '1 of 3', '12:48 PM', '0:05', [['ai', 'এই নম্বরটি চালু নেই। অর্ডারটি ফ্রড চেকের জন্য চিহ্নিত করা হয়েছে।']]],
  ['#ORD-0929-008', 'Sumaiya Islam', '01678-220415', 1540, 'COD', 'later', '1 of 3', '12:10 PM', '0:22', [['c', 'এখন অফিসে আছি, বিকাল ৫টার পরে কল দিন।'], ['ai', 'ঠিক আছে, বিকাল ৫টায় আবার কল করব।']]],
  ['#ORD-0929-006', 'Arif Chowdhury', '01744-906632', 2210, 'COD', 'cancel', '1 of 3', '11:30 AM', '0:31', [['c', 'অর্ডারটা ভুল করে দুইবার হয়ে গেছে, এটা বাতিল করুন।'], ['ai', 'অর্ডারটি বাতিল করা হলো। অন্য অর্ডারটি চালু আছে।']]],
  ['#ORD-0929-005', 'Mehedi Hasan', '01999-127740', 760, 'COD', 'conf', '2 of 3', '11:02 AM', '0:44', [['ai', 'অর্ডার কনফার্ম করবেন?'], ['c', 'জি।']]]
];
const ORDER = ['all', 'person', 'conf', 'noans', 'later', 'cancel', 'wrong'];

class Component extends DCLogic {
  state = { over: {}, f: 'all', sel: '', p: 0, q: '', find: false };
  renderVals() {
    const s = this.state;
    const calls = CALLS.map((c) => { const x = c.slice(); if (s.over[c[0]]) x[5] = s.over[c[0]]; return x; });
    const cnt = { all: calls.length }; calls.forEach((c) => { cnt[c[5]] = (cnt[c[5]] || 0) + 1; });
    const needle = s.q.trim().toLowerCase();
    const shown = calls.filter((c) => (s.f === 'all' || c[5] === s.f) && (!needle || [c[0], c[1], c[2]].join(' ').toLowerCase().includes(needle)));
    const cur = calls.find((c) => c[0] === s.sel) || null;
    const setSt = (st, msg) => { this.setState({ over: { ...s.over, [cur[0]]: st } }); toast(msg); };
    const confRate = Math.round((cnt.conf || 0) / calls.length * 100);
    return {
      figures: [
        { label: 'Calls today', value: String(calls.length), sub: 'from 9:00 AM' },
        { label: 'Confirmed', value: confRate + '%', sub: (cnt.conf || 0) + ' moved to To pack' },
        { label: 'Stopped', value: String((cnt.cancel || 0) + (cnt.wrong || 0)), sub: 'cancelled or wrong number' },
        { label: 'Fake orders stopped', value: '9', sub: 'this week' },
        { label: 'Cost today', value: '৳34', sub: '2 extended' },
      ],
      tabs: ORDER.map((k) => ({ key: k, label: k === 'all' ? 'All results' : ST[k][0], count: cnt[k] || 0, id: 'ai-tab-' + k, on: s.f === k, onClick: () => this.setState({ f: k }) })),
      tabLabel: s.f === 'all' ? 'All results' : ST[s.f][0],
      find: s.find || !!needle,
      openFind: () => this.setState({ find: true }),
      closeFind: () => this.setState({ find: false, q: '' }),
      q: s.q, onSearch: (e) => this.setState({ q: e.target.value }),
      empty: shown.length === 0,
      emptyTitle: needle ? 'No calls match “' + s.q.trim() + '”' : 'No calls with this result today.',
      countLabel: shown.length + (shown.length === 1 ? ' call' : ' calls') + ' today',
      rows: shown.map((c) => ({ o: c[0], n: c[1], amt: bdt(c[3]), pay: c[4], st: ST[c[5]][0], tone: ST[c[5]][1], tries: c[6], t: c[7], on: !!cur && c[0] === cur[0],
        open: () => this.setState({ sel: c[0], p: 0 }),
        onRowClick: (e) => { if (e.target.closest('a,button')) return; this.setState({ sel: c[0], p: 0 }); } })),
      cur: cur ? { o: cur[0], n: cur[1], ph: cur[2], amt: bdt(cur[3]), pay: cur[4], tries: cur[6], at: cur[7], st: ST[cur[5]][0], tone: ST[cur[5]][1], dur: cur[8],
        tr: cur[9].map((m) => ({ ai: m[0] === 'ai', t: m[1], who: m[0] === 'ai' ? 'GridCommerce AI' : cur[1] })) } : null,
      close: () => this.setState({ sel: '' }),
      prog: (s.p || 0) + '%', play: () => this.setState({ p: 100 }),
      confirm: () => setSt('conf', cur[0] + ' marked confirmed and moved to To pack.'),
      again: () => toast('AI will call ' + cur[1] + ' again in 2 minutes. ৳4 from the wallet.'),
      manual: () => toast('Calling ' + cur[2] + ' from the store line. The result is saved on the order.'),
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
                  about="Results of today's AI confirmation calls. Open a call to hear it, read the transcript and decide what happens to the order. Calls that need a person wait in their own view."
                  secondary={[{ label: 'Call settings', href: '/auto-call-settings' }]}
                  more={[{ label: 'Orders', href: '/merchant-orders' }, { label: 'Calls', href: '/merchant-calls' }]} />

                <MetricStrip label="AI calls today" items={v.figures} />

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
                  <div className="ix-foot"><span>{v.countLabel}</span></div>
                </section>
                <LearnMore topic="AI calls" />
              </div>
            </div>
          </main>
        </div>

        <Sheet open={!!c} title={c ? c.n : 'Call'} label="AI call" onClose={v.close}
          footer={c ? <>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={v.manual}>Call myself</button>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={v.again}>AI call again</button>
            <button type="button" className="gc-btn gc-btn--solid" onClick={v.confirm}>Mark confirmed</button>
          </> : null}>
          {c ? (<>
            <div><StatusBadge tone={c.tone}>{c.st}</StatusBadge></div>
            <KV rows={[
              ['Order', <Link key="o" href="/order-detail" className="ai-id">{c.o}</Link>],
              ['Phone', <span key="p" className="ai-id">{c.ph}</span>],
              ['Total', c.amt + ' · ' + c.pay],
              ['Try', c.tries + ' · ' + c.at],
            ]} />
            <div className="ai-play">
              <button type="button" className="ix-btn ix-btn--primary ix-btn--icon" aria-label="Play recording" onClick={v.play}><Icon name="play" width="16" height="16" aria-hidden="true" /></button>
              <span className="gc-progress"><span className="gc-progress__fill" style={{ width: v.prog }} /></span>
              <span className="ai-dur">{c.dur}</span>
            </div>
            <h3 className="ai-h3">Transcript</h3>
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
