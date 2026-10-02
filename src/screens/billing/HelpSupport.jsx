'use client';
// Generated from design/templates/billing/HelpSupport.dc.html by scripts/convert-design.mjs.
// Help & support — Settings — support tickets to GridCommerce with the full communication history, as a Shopify list:
// the open-ticket line, four key figures, then the tickets (Open / Solved / All views). A row opens the ticket's
// conversation in a side panel (reply, Mark solved / Reopen); New ticket opens the form in a side panel too.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { toast as __toast } from '@/runtime/ui';
import { Sheet as __Sheet, StatusBadge as __StatusBadge } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';

// ---- logic (from the design's <script type="text/x-dc">) ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }
function val(e) { return e && e.target ? e.target.value : e; }

var CATS = ['Billing and payments', 'WordPress sync', 'AI auto-call', 'Courier integration', 'Tracking and pixels', 'Account and access', 'Something else'];
var T = [
  { id: 'GC-T-2291', s: 'WooCommerce stock not updating for variants', c: 'WordPress sync', st: 'open', u: '12 min ago', o: '29 Sep, 10:05 AM', agent: 'Rafiq, integrations', m: [
    ['me', 'Stock changes made in GridCommerce are not reaching WooCommerce for products with size variants. Simple products work.', '10:05 AM'],
    ['event', 'Call from GridCommerce support · 6 min', '10:40 AM'],
    ['them', 'Thanks for the call. The variants were created in WooCommerce before the connection, so their IDs were not matched. A re-match is running now.', '10:52 AM'],
    ['them', 'Re-match finished: 38 of 38 variants linked. Please change one stock value and check WooCommerce.', '2:48 PM']] },
  { id: 'GC-T-2284', s: 'Refund for duplicate SSLCOMMERZ charge', c: 'Billing and payments', st: 'waiting', u: 'yesterday', o: '28 Sep, 4:12 PM', agent: 'Nabila, billing', m: [
    ['me', 'The wallet top-up of ৳1,000 was charged twice on 28 Sep. Only one top-up shows in the wallet.', '4:12 PM'],
    ['them', 'Confirmed with SSLCOMMERZ: the second charge was not settled. It returns to the card in 7 to 10 working days. We will close this once it lands.', '6:30 PM'],
    ['event', 'Email sent · refund reference SSL-RF-51920', '6:31 PM']] },
  { id: 'GC-T-2240', s: 'AI calls in Bangla sound too fast', c: 'AI auto-call', st: 'solved', u: '22 Sep', o: '21 Sep, 1:15 PM', agent: 'Tanim, AI team', m: [
    ['me', 'Customers say the Bangla call voice speaks too fast.', '1:15 PM'],
    ['them', 'Voice speed is now in AI auto-call settings. It is set to 0.9× for this store.', '22 Sep, 11:02 AM']] },
  { id: 'GC-T-2197', s: 'Add a second POS counter', c: 'Account and access', st: 'solved', u: '14 Sep', o: '13 Sep, 7:40 PM', agent: 'Nabila, billing', m: [
    ['me', 'Please add a second counter to the POS register for Mirpur.', '7:40 PM'], ['them', 'Added. It is billed from the next renewal.', '14 Sep, 10:10 AM']] }
];
var STL = { open: ['Open', 'info'], waiting: ['Waiting on refund', 'warning'], solved: ['Solved', 'success'] };
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var tickets = (s.added || []).concat(T).map(function (t) { var o = assign({}, t); if (s.st && s.st[t.id]) o.st = s.st[t.id]; o.m = t.m.concat((s.extra || {})[t.id] || []); return o; });
    var f = s.f || 'active', sel = s.sel || tickets[0].id;
    var shown = tickets.filter(function (t) { return f === 'all' || (f === 'active' ? t.st !== 'solved' : t.st === 'solved'); });
    var cur = tickets.filter(function (t) { return t.id === sel; })[0] || tickets[0];
    var b = STL[cur.st];
    var cnt = { active: tickets.filter(function (t) { return t.st !== 'solved'; }).length, solved: tickets.filter(function (t) { return t.st === 'solved'; }).length, all: tickets.length };
    var v = {
      headline: cnt.active + ' open tickets · usual first reply under 2 hours',
      tiles: [{ l: 'Open', v: String(cnt.active), s: '1 waiting on a refund', c: '#60a5fa' }, { l: 'Solved this year', v: '14', s: 'average 5 hours to solve', c: '#34d399' }, { l: 'Support phone', v: '09678-120120', s: 'Sat–Thu, 9:00 AM – 9:00 PM', c: '#a78bfa' }, { l: 'Account manager', v: 'Nabila', s: 'billing and plan changes', c: '#fbbf24' }],
      composing: !!s.compose, cats: CATS, subj: s.subj || '', body: s.body || '',
      onCat: function (e) { self.setState({ cat: val(e) }); }, onSubj: function (e) { self.setState({ subj: val(e) }); }, onBody: function (e) { self.setState({ body: val(e) }); },
      newT: function () { self.setState({ compose: true }); }, cancelT: function () { self.setState({ compose: false }); },
      submitT: function () {
        if (!(s.subj || '').trim()) { toast(self, 'Add a subject so the right team picks it up.', true); return; }
        var id = 'GC-T-' + (2292 + (s.added || []).length);
        var t = { id: id, s: s.subj, c: s.cat || CATS[0], st: 'open', u: 'just now', o: '29 Sep, now', agent: 'waiting for the next agent', m: [['me', s.body || s.subj, 'now']] };
        self.setState({ added: [t].concat(s.added || []), compose: false, subj: '', body: '', sel: id, f: 'active', view: true }); toast(self, 'Ticket ' + id + ' sent. A reply usually comes within 2 hours.');
      },
      chips: [['active', 'Open'], ['solved', 'Solved'], ['all', 'All']].map(function (c) { return { key: c[0], label: c[1], count: cnt[c[0]], id: 'hs-tab-' + c[0], on: c[0] === f, onClick: function () { self.setState({ f: c[0] }); } }; }),
      list: shown.map(function (t) { var bb = STL[t.st]; return { id: t.id, s: t.s, c: t.c, u: t.u, st: bb[0], tone: bb[1], open: function () { self.setState({ sel: t.id, view: true }); } }; }),
      viewing: !!s.view, closeView: function () { self.setState({ view: false }); },
      cur: { id: cur.id, s: cur.s, c: cur.c, st: b[0], tone: b[1], o: cur.o, agent: cur.agent },
      thread: cur.m.map(function (m) { var me = m[0] === 'me', ev = m[0] === 'event'; return { t: m[1], w: m[2], isEvent: ev, isMsg: !ev, me: me, who: me ? 'You' : 'GridCommerce support' }; }),
      reply: s.reply || '', onReply: function (e) { self.setState({ reply: val(e) }); },
      send: function () { var r = (s.reply || '').trim(); if (!r) return; var ex = assign({}, s.extra || {}); ex[cur.id] = (ex[cur.id] || []).concat([['me', r, 'now']]); var st = assign({}, s.st || {}); if (cur.st === 'solved') st[cur.id] = 'open'; self.setState({ extra: ex, reply: '', st: st }); toast(self, 'Reply sent.'); },
      closeLabel: cur.st === 'solved' ? 'Reopen' : 'Mark solved',
      closeT: function () { var st = assign({}, s.st || {}); st[cur.id] = cur.st === 'solved' ? 'open' : 'solved'; self.setState({ st: st }); toast(self, cur.st === 'solved' ? 'Ticket reopened.' : 'Marked solved. Thanks for letting us know.'); }
    };
    return v;
  }
}

// ---- styles ----

const CSS = `
/* a figure's note wraps under the value instead of running into the next figure */
[data-screen="HelpSupport"] .ix-metric__value{flex-wrap:wrap;row-gap:0}
.hs-id{font-family:var(--font-data)}
.hs-subj{display:block;max-width:420px;overflow:hidden;text-overflow:ellipsis}
.hs-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin:0 0 var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.hs-thread{display:flex;flex-direction:column;gap:var(--space-3)}
.hs-msg{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.hs-msg.is-me{align-items:flex-end}
.hs-bubble{max-width:85%;padding:8px 12px;border-radius:var(--radius-xl);background:var(--surface-subtle);font-size:var(--text-sm);line-height:20px;color:var(--text-heading)}
.hs-msg.is-me .hs-bubble{background:var(--primary);color:#fff}
.hs-who{font-size:var(--text-xs);color:var(--text-muted)}
.hs-event{align-self:center;padding:4px 12px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);text-align:center}
.hs-reply{display:flex;gap:var(--space-2);width:100%}
.hs-reply .gc-input{flex:1;min-width:0}
.hs-form{display:flex;flex-direction:column;gap:var(--space-4)}
.hs-form>div{display:flex;flex-direction:column;gap:6px}
`;

// ---- markup ----

export default class HelpSupportScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="HelpSupport">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="set-help" />
          <main className="gc-shell__main">
            <__Topbar crumb="Settings" page={"Help & support"} placeholder="Search" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader title="Help & support" meta={v.headline}
                  about="Support tickets to GridCommerce with the full conversation. Replies arrive here and by SMS to the store phone."
                  primary={{ label: 'New ticket', onClick: v.newT }} />
                <MetricStrip label="Support" items={(v.tiles || []).map((t) => ({ label: t.l, value: t.v, sub: t.s }))} />

                <section className="ix-card" aria-label="Tickets">
                  <div className="ix-bar"><IndexTabs tabs={v.chips || []} label="Tickets" /></div>
                  {(v.list || []).length ? (<>
                    <ul className="ix-plist" aria-label="Tickets">
                      {v.list.map((t) => (
                        <li key={t.id}>
                          <button type="button" className="ix-pitem" onClick={t.open}>
                            <span className="ix-pitem__top"><b>{t.s}</b><span className="hs-id ix-muted">{t.id}</span></span>
                            <span className="ix-pitem__mid">{t.c} · {t.u}</span>
                            <span className="ix-pitem__tags"><__StatusBadge tone={t.tone}>{t.st}</__StatusBadge></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Tickets</caption>
                        <thead><tr><th scope="col">Ticket</th><th scope="col">Subject</th><th scope="col">Topic</th><th scope="col">Updated</th><th scope="col">Status</th></tr></thead>
                        <tbody>
                          {v.list.map((t) => (
                            <tr key={t.id} onClick={t.open}>
                              <td><button type="button" className="ix-strong hs-id" onClick={t.open}>{t.id}</button></td>
                              <td><span className="hs-subj ix-strong" title={t.s}>{t.s}</span></td>
                              <td className="ix-muted">{t.c}</td>
                              <td className="ix-muted">{t.u}</td>
                              <td><__StatusBadge tone={t.tone}>{t.st}</__StatusBadge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>) : <div className="ix-empty"><p className="ix-muted" style={{ margin: 0, textAlign: 'center' }}>No tickets here.</p></div>}
                  <div className="ix-foot"><span>{(v.list || []).length} ticket{(v.list || []).length === 1 ? '' : 's'}</span></div>
                </section>
                <LearnMore topic="support" />
              </div>
            </div>
          </main>
        </div>

        <__Sheet open={!!v.viewing} title={v.cur ? v.cur.s : 'Ticket'} onClose={v.closeView}
          footer={<div className="hs-reply">
            <input className="gc-input" aria-label="Reply" placeholder="Write a reply" value={v.reply} onChange={v.onReply} onKeyDown={(e) => { if (e.key === 'Enter') v.send(); }} />
            <button type="button" className="gc-btn gc-btn--solid" onClick={v.send}>Send</button>
          </div>}>
          {v.cur ? (<>
            <div className="hs-meta">
              <span className="hs-id">{v.cur.id}</span>
              <__StatusBadge tone={v.cur.tone}>{v.cur.st}</__StatusBadge>
              <span>{v.cur.c}</span>
              <button type="button" className="ix-btn ix-btn--sm" style={{ marginLeft: 'auto' }} onClick={v.closeT}>{v.closeLabel}</button>
            </div>
            <p className="hs-meta">Opened {v.cur.o} · handled by {v.cur.agent}</p>
            <div className="hs-thread">
              {(v.thread || []).map((m, i) => (m.isEvent
                ? <div key={i} className="hs-event">{m.t} · <span style={{ whiteSpace: 'nowrap' }}>{m.w}</span></div>
                : <div key={i} className={'hs-msg' + (m.me ? ' is-me' : '')}><div className="hs-bubble">{m.t}</div><span className="hs-who">{m.who} · {m.w}</span></div>))}
            </div>
          </>) : null}
        </__Sheet>

        <__Sheet open={!!v.composing} title="New ticket" onClose={v.cancelT}
          footer={<>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={v.cancelT}>Cancel</button>
            <button type="button" className="gc-btn gc-btn--solid" onClick={v.submitT}>Send ticket</button>
          </>}>
          <div className="hs-form">
            <div>
              <label className="gc-label" htmlFor="cat">Topic</label>
              <select id="cat" className="gc-input gc-select" onChange={v.onCat}>
                {(v.cats || []).map((ct) => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <label className="gc-label" htmlFor="subj">Subject</label>
              <input id="subj" className="gc-input" placeholder="What do you need help with?" value={v.subj} onChange={v.onSubj} />
            </div>
            <div>
              <label className="gc-label" htmlFor="body">Details</label>
              <textarea id="body" className="gc-input" rows="4" placeholder="Order numbers, screenshots and steps help us answer faster." onChange={v.onBody} defaultValue={`${v.body ?? ""}`} />
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Replies arrive here and by SMS to the store phone.</p>
          </div>
        </__Sheet>
      </div>
    );
  }
}
