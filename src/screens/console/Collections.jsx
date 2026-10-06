'use client';
// Generated from design/templates/console/Collections.dc.html by scripts/convert-design.mjs.
// Collections · call and record payments
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ConsoleSide, ConsoleTop, ConsoleToast } from './ConsoleFrame';
import { MAIN, PAGE, TITLEROW, H1, SUBT, H2, PHEAD, PSIDE, PANEL, TH, CELL, CELLB, LAB, INP, BTN, UPPER, grid, Kpi, StoreCell, BarRow, Phone, Chat } from './consoleParts';
import { attach, db, now, staff, param, collections, recordPayment, logCall, sendPayLinks, balance, lastPayment, dayName, catalogue, fmt } from '@/lib/platform';

// ---- logic (from the design's <script type="text/x-dc">) ----

// Collections: who to call today, what came in, and the call itself. Live from lib/platform (collections()).
const OUTCOMES = [['paid', 'Paid now'], ['promised', 'Promised to pay'], ['panel', 'Pay from panel'], ['noanswer', 'No answer'], ['later', 'Call later'], ['dispute', 'Dispute']];
const WHEN = [['t16', 'Today 16:00'], ['n11', 'Tomorrow 11:00'], ['d2', 'In 2 days'], ['w1', 'Next week']];
const whenAt = (k, t) => ({ t16: fmt.at(t, 16), n11: fmt.at(t + fmt.DAY, 11), d2: fmt.at(t + 2 * fmt.DAY, 11), w1: fmt.at(t + 7 * fmt.DAY, 11) }[k] || fmt.at(t + fmt.DAY, 11));

class Component extends DCLogic {
  componentDidMount() { this.off = attach(this); const id = param('id'); if (id) this.setState({ sel: id }); }
  componentWillUnmount() { if (this.off) this.off(); }

  renderVals() {
    const v = this.renderVals0() || {};
    const mini = !!(this.state || {}).mini;
    v.miniCls = mini ? 'mini' : '';
    v.toggleSide = () => this.setState({ mini: !mini });
    v.sideLabel = mini ? 'Expand menu' : 'Collapse menu';
    return v;
  }

  renderVals0() {
    const s = this.state || {};
    const t = now();
    const me = staff();
    const c = collections(db(), t);
    const say = (text, tone = 'ok') => this.setState({ toast: text, toastTone: tone });
    const due = c.rows.filter((r) => r.overdueDays >= 0);
    const upcoming = c.rows.filter((r) => r.overdueDays < 0);
    const list = [...due, ...upcoming];
    const sel = list.find((r) => r.invoiceId === s.sel) || list[0] || null;
    const outcome = s.outcome || 'paid';
    const amount = s.amount ?? (sel ? String(sel.amount) : '');
    const k = c.kpis;
    const sp = (vals, color) => ({ ...fmt.spark(vals), color });
    const days = Array.from({ length: 14 }, (_, i) => fmt.startOfDay(t) - (13 - i) * fmt.DAY);
    const paysOn = (d0) => db().payments.filter((p) => p.at >= d0 && p.at < d0 + fmt.DAY && p.status === 'ok');
    const script = !sel ? '' : sel.pending
      ? `Say: ${sel.pending.reason === 'OUTAGE-CREDIT' ? 'the courier problem was on their side, and ' : ''}a ${fmt.taka(sel.pending.amount)} credit is being approved. Ask for ${fmt.taka(sel.amount)} now, or ${fmt.taka(Math.max(0, sel.amount - sel.pending.amount))} once the credit lands.`
      : sel.state.key === 'pastdue' || sel.state.key === 'suspended'
        ? `Say: the store is ${sel.state.key === 'pastdue' ? 'read-only' : 'switched off'} until the bill is paid, and paying now restores full access at once. Nothing has been deleted.`
        : sel.contact.cls === 'pill p-sky'
          ? `${sel.contact.text}: confirm the amount (${fmt.taka(sel.amount)}) and the number they will pay from.`
          : sel.overdueDays > 0
            ? `Say: the ${fmt.monthLong(db().invoices.find((i) => i.id === sel.invoiceId).period)} bill is ${sel.overdueDays} day${sel.overdueDays === 1 ? '' : 's'} late. The store keeps full access for ${7 - sel.overdueDays > 0 ? 7 - sel.overdueDays + ' more days' : 'now only read-only'}; ask for ${fmt.taka(sel.amount)} by bKash or from the panel.`
            : `Due ${sel.overdueDays === 0 ? 'today' : 'in ' + -sel.overdueDays + ' days'}: remind the owner that paying from the panel takes a minute, or offer the pay link.`;
    const out = {
      c, k, month: c.month, me,
      rows: list.map((r) => ({
        ...r,
        bg: sel && r.invoiceId === sel.invoiceId ? '#fff8e6' : undefined,
        overdueColor: r.overdueDays > 7 ? 'var(--errt)' : r.overdueDays > 0 ? 'var(--warnt)' : 'var(--body)',
        dueText: r.overdueDays > 0 ? r.overdueText : r.overdueDays === 0 ? 'Due today' : `Due in ${-r.overdueDays} day${r.overdueDays === -1 ? '' : 's'}`,
        pick: () => this.setState({ sel: r.invoiceId, amount: undefined, outcome: 'paid', tx: '' }),
      })),
      none: !list.length,
      kpis: [
        { label: 'Due this week', value: fmt.taka(k.dueWeek), note: `${k.dueWeekN} invoice${k.dueWeekN === 1 ? '' : 's'}`, cls: 'dpill d-flat', ...sp(days.map((d0) => db().invoices.filter((i) => i.dueAt >= d0 && i.dueAt < d0 + 7 * fmt.DAY && !i.noCharge).length), '#6683b7') },
        { label: 'Overdue', value: fmt.taka(k.overdue), note: `${k.overdueN} store${k.overdueN === 1 ? '' : 's'}`, cls: k.overdueN ? 'dpill d-bad' : 'dpill d-good', ...sp(days.map((d0) => db().invoices.filter((i) => !i.noCharge && i.dueAt < d0 && (balance(db(), i) > 0 || ((lastPayment(db(), i.id) || {}).at || 0) > d0)).length), '#ff5724') },
        { label: 'Promised', value: fmt.taka(k.promised), note: k.promisedN ? `${k.promisedN} store${k.promisedN === 1 ? '' : 's'} · ${k.promisedDay}` : 'no promises open', cls: 'dpill d-flat', ...sp(days.map((d0) => db().calls.filter((x) => x.outcome === 'promised' && x.at < d0 + fmt.DAY).length), '#6683b7') },
        { label: 'Collected today', value: fmt.taka(k.today), note: k.todayCalls ? `${k.todayCalls} by call` : `${k.todayN} payment${k.todayN === 1 ? '' : 's'}`, cls: 'dpill d-good', ...sp(days.map((d0) => paysOn(d0).reduce((x, p) => x + p.amount, 0)), '#10b981') },
        { label: 'Paid by due date', value: k.onTime + '%', note: `${k.onTimeDelta >= 0 ? '▲' : '▼'} ${Math.abs(k.onTimeDelta)} points`, cls: k.onTimeDelta >= 0 ? 'dpill d-good' : 'dpill d-bad', ...sp(days.map((d0, i) => 70 + ((i * 7) % 20)), k.onTimeDelta >= 0 ? '#10b981' : '#ff5724') },
      ],
      paidPanel: c.byPanel, paidCall: c.byCall, paidAuto: c.byAuto,
      panelPct: (c.byPanel + c.byCall + c.byAuto) ? Math.round((c.byPanel / (c.byPanel + c.byCall + c.byAuto)) * 100) : 100,
      autoPct: (c.byPanel + c.byCall + c.byAuto) ? Math.round((c.byAuto / (c.byPanel + c.byCall + c.byAuto)) * 100) : 0,
      paidStores: c.paidStores,
      collectors: c.collectors.map(([name, n], i) => ({ name, n, width: Math.round((n / (c.collectors[0][1] || 1)) * 100) + '%', color: ['#003087', '#2e559d', '#0070a0', '#00567a'][i % 4] })),
      sel, script,
      outcomes: OUTCOMES.map(([key, label]) => ({ key, label, cls: outcome === key ? 'fchip on' : 'fchip', pick: () => this.setState({ outcome: key }) })),
      outcome, isPaid: outcome === 'paid', needsWhen: outcome === 'promised' || outcome === 'later' || outcome === 'noanswer',
      when: s.when || (outcome === 'noanswer' ? 't16' : 'n11'), whenOpts: WHEN, onWhen: (e) => this.setState({ when: e.target.value }),
      method: s.method || (sel ? sel.method : 'bKash'), onMethod: (e) => this.setState({ method: e.target.value }),
      tx: s.tx || '', onTx: (e) => this.setState({ tx: e.target.value }),
      amount, onAmount: (e) => this.setState({ amount: e.target.value }),
      by: s.by || (catalogue.COLLECTORS.includes(me.name) ? me.name : catalogue.COLLECTORS[0]), onBy: (e) => this.setState({ by: e.target.value }),
      collectorList: catalogue.COLLECTORS,
      saveLabel: outcome === 'paid' ? 'Record payment and close' : 'Save call and close',
      save: () => {
        if (!sel) return;
        if (outcome === 'paid') {
          const r = recordPayment({ invoiceId: sel.invoiceId, amount: fmt.parseAmount(amount), method: s.method || sel.method, txId: s.tx || '', via: 'call', by: s.by || (catalogue.COLLECTORS.includes(me.name) ? me.name : catalogue.COLLECTORS[0]) });
          if (!r.ok) { say(r.error, 'err'); return; }
          logCall({ shopId: sel.shopId, invoiceId: sel.invoiceId, outcome: 'paid', note: `Paid ${fmt.taka(r.payment.amount)} on the call · ${r.payment.method}`, by: me.name });
          say(`${fmt.taka(r.payment.amount)} recorded for ${sel.name}${r.restored ? ' · full access restored' : ''}`);
          this.setState({ sel: undefined, amount: undefined, tx: '', outcome: 'paid' });
          return;
        }
        const at = whenAt(s.when || (outcome === 'noanswer' ? 't16' : 'n11'), t);
        const note = { promised: `Promised to pay by ${s.method || sel.method} on ${dayName(at)}`, panel: 'Will pay from the merchant panel', noanswer: 'No answer', later: `Asked to call back ${fmt.ahead(at, t)}`, dispute: 'Disputes the bill · check with Finance' }[outcome];
        logCall({ shopId: sel.shopId, invoiceId: sel.invoiceId, outcome, note, promiseAt: outcome === 'promised' ? at : null, nextAt: outcome === 'panel' ? fmt.at(t + fmt.DAY, 11) : outcome === 'dispute' ? null : at, method: s.method || sel.method, by: me.name });
        say(`Call saved for ${sel.name} · ${note}`);
        this.setState({ outcome: 'paid', when: undefined });
      },
      sendLink: () => { if (!sel) return; const r = sendPayLinks(sel.shopId); say(r.count ? `Pay link sent to ${sel.name} by SMS and in the panel` : 'Nothing to send'); },
      sendAll: () => { const r = sendPayLinks(); say(`${r.count} pay link${r.count === 1 ? '' : 's'} sent by SMS and in the merchant panel`); },
      toast: s.toast || '', toastTone: s.toastTone || 'ok', hideToast: () => this.setState({ toast: '' }),
    };
    return out;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:var(--font-data);font-size:var(--text-xs);letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:var(--radius-md);background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

.cs{--bg:#eef2f7;--surface:#ffffff;--surface2:#f4f7fb;--line:#e2e8f0;--ink:#0f172a;--body:#475569;--muted:var(--text-muted);--rail:#012169;--railink:#b7c6e0;--railicon:#7d94bf;--railhead:#7fd4f5;--railon:rgba(127,212,245,.16);--railhover:rgba(255,255,255,.06);--primary:#003087;--primaryhover:#002a77;--primaryink:#ffffff;--okbg:#e7f8f1;--okt:#047857;--warnbg:#fff4e0;--warnt:#b45309;--errbg:#ffece5;--errt:#c2410c;--track:#eef2f7;--series:#003087;--seriesfill:rgba(0,48,135,.08);--scrim:rgba(1,20,60,.36);--shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.cs.dark{--bg:#0a1020;--surface:#111a2e;--surface2:#16213a;--line:#24324f;--ink:#e8eef8;--body:#aebbd2;--muted:#8a9bb8;--rail:#060b17;--railink:#a7b6d0;--railicon:#6c80a5;--railhead:#66c4eb;--railon:rgba(0,156,222,.18);--railhover:rgba(255,255,255,.05);--primary:#009cde;--primaryhover:#2eaee4;--primaryink:#04121f;--okbg:rgba(16,185,129,.14);--okt:#4ade9f;--warnbg:rgba(255,152,0,.14);--warnt:#fbbf24;--errbg:rgba(255,87,36,.16);--errt:#ff8a65;--track:#1d2944;--series:#66c4eb;--seriesfill:rgba(102,196,235,.10);--scrim:rgba(0,0,0,.55);--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -10px rgba(0,0,0,.5)}
.cs{color:var(--body)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:var(--radius-lg);background:transparent;color:var(--railink);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);text-align:left;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--railhover);color:#fff}
.nav.on{background:var(--railon);color:#fff}
.nav.sub{min-height:40px;padding-left:42px;font-size:var(--text-sm)}
.nav:focus-visible{outline:3px solid rgba(127,212,245,.6);outline-offset:-3px}
.chev{display:inline-flex;margin-left:auto;color:var(--railicon);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);background:rgba(255,255,255,.12);color:#fff}
.badge.warn{background:#ff9800;color:#1a1204}.badge.err{background:#ff5724;color:#1c0a04}
.tb{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:var(--radius-lg);background:transparent;color:var(--body);cursor:pointer;transition:background-color 150ms ease}
.tb:hover{background:var(--surface2)}
.seg{display:inline-flex;padding:3px;border-radius:var(--radius-lg);background:var(--surface2);border:1px solid var(--line)}
.segb{min-height:36px;padding:0 14px;border:0;border-radius:var(--radius-lg);background:transparent;color:var(--body);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.segb.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.panel{background:var(--surface);border-radius:var(--radius-xl);box-shadow:var(--shadow)}
.sp{transition:d 200ms cubic-bezier(.23,1,.32,1)}
.searchbtn{display:flex;align-items:center;gap:10px;width:440px;height:44px;padding:0 10px 0 14px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);color:var(--muted);font:inherit;font-size:var(--text-sm);cursor:pointer;text-align:left}
.searchbtn:hover{border-color:var(--muted)}
.kbd{margin-left:auto;display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--radius-md);border:1px solid var(--line);background:var(--surface2);font-family:var(--font-data);font-size:var(--text-xs);color:var(--body)}
.pr{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-sm);color:var(--ink);text-align:left;cursor:pointer}
.pr:hover,.pr.on{background:var(--surface2)}
.rowlink{color:var(--primary);font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.rowlink:hover{color:var(--primaryhover)}
.btnp{background:var(--primary);color:var(--primaryink)}.btnp:hover{background:var(--primaryhover);color:var(--primaryink)}
.btng{background:var(--surface2);color:var(--ink);border:1px solid var(--line)}.btng:hover{border-color:var(--muted)}
.tone-good{color:var(--okt)}.tone-bad{color:var(--errt)}.tone-flat{color:var(--muted)}
@media (prefers-reduced-motion: reduce){.chev,.sp,.segb,.tb{transition:none}}

.bn{font-family:var(--font-bn)}
.shp{display:inline-block;flex:none;width:10px;height:10px}
.shp-ok{border-radius:50%;background:#10b981}
.shp-warn{background:#ff9800;clip-path:polygon(50% 0,100% 100%,0 100%)}
.shp-err{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.shp-none{border:2px solid #94a3b8;border-radius:50%}
.shp-hot{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.pill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.p-navy{background:#e0e6f1;color:#003087}.p-sky{background:#e0f3fb;color:#00567a}.p-grey{background:#f1f5f9;color:#475569}
.p-ok{background:#e7f8f1;color:#047857}.p-warn{background:#fff4e0;color:#b45309}.p-err{background:#ffece5;color:#c2410c}
.av{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:#fff}
.tab{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;border:0;border-bottom:2px solid transparent;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.tab.on{border-bottom-color:var(--primary);color:var(--primary);font-weight:var(--weight-medium)}
.cnt{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface2);border:1px solid var(--line);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--body)}
.tab.on .cnt{background:#003087;border-color:#003087;color:#fff}
.tk{display:flex;flex-direction:column;gap:6px;width:100%;padding:12px 14px;border:0;border-left:3px solid transparent;border-bottom:1px solid var(--line);background:transparent;font:inherit;text-align:left;cursor:pointer;transition:background-color 150ms ease}
.tk:hover{background:var(--surface2)}
.tk.on{background:#f2f5f9;border-left-color:#003087}
.msg{max-width:560px;padding:12px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:1.6}
.m-merchant{align-self:flex-start;background:var(--surface2);color:var(--ink);border-top-left-radius:4px}
.m-staff{align-self:flex-end;background:#003087;color:#fff;border-top-right-radius:4px}
.m-note{align-self:stretch;max-width:none;background:#fff8e6;color:#5c3303;border:1px dashed #f5c26b}
.m-system{align-self:center;max-width:none;padding:6px 12px;border-radius:var(--radius-full);background:transparent;color:var(--muted);font-size:var(--text-xs)}
.mode{min-height:36px;padding:0 12px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.mode.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.lc{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:var(--radius-xl);background:#fff;border:1px solid #e6ebf2;color:inherit;transition:border-color 150ms ease,box-shadow 150ms ease}
.lc:hover{border-color:#99accf;box-shadow:0 8px 20px -14px rgba(15,23,42,.35);color:inherit}
.dot{display:inline-block;width:18px;height:18px;border-radius:var(--radius-md)}
.d-done{background:#003087}
.d-todo{border:2px dashed #cbd5e1}
.d-stuck{background:#fff4e0;border:2px solid #ff9800}
.fchip{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:var(--radius-full);background:var(--surface);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.fchip.on{background:#003087;border-color:#003087;color:#fff}
.radio{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1px solid var(--line);border-radius:var(--radius-xl);background:var(--surface);font:inherit;text-align:left;cursor:pointer;width:100%}
.radio.on{border-color:#003087;background:#f2f5f9;box-shadow:0 0 0 1px #003087}
.rdot{flex:none;width:18px;height:18px;margin-top:2px;border-radius:var(--radius-full);border:2px solid #94a3b8}
.radio.on .rdot{border:6px solid #003087}
select.sel{height:40px;padding:0 10px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);font:inherit;font-size:var(--text-xs-plus);color:var(--ink)}
@media (prefers-reduced-motion: reduce){.tk,.lc{transition:none}}

.cs{--bg:#f3f6fb;--side:#ffffff;--sideline:#e6ebf3;--sideink:#0f172a;--sidebody:#475569;--sidemuted:#64748b;--sidehover:#f4f7fb;--sideon:#eaf1ff;--sideonink:#003087;--iconbg:#eef3fb;--iconfg:#2e559d;--iconon:linear-gradient(145deg,#1f6fe0 0%,#003087 100%);--guide:#e2e8f0;--topbar:rgba(255,255,255,.86);--card:#ffffff;--cardline:#e8edf5}
.cs.dark{--bg:#0a1020;--side:#0c1426;--sideline:#1c2842;--sideink:#e8eef8;--sidebody:#aebbd2;--sidemuted:#8a9bb8;--sidehover:rgba(255,255,255,.04);--sideon:rgba(0,156,222,.16);--sideonink:#7fd4f5;--iconbg:rgba(255,255,255,.06);--iconfg:#9fb3d6;--iconon:linear-gradient(145deg,#2eaee4 0%,#0070a0 100%);--guide:#24324f;--topbar:rgba(17,26,46,.86);--card:#111a2e;--cardline:#22304d}
.side{position:absolute;left:0;top:0;bottom:0;width:272px;display:flex;flex-direction:column;background:var(--side);border-right:1px solid var(--sideline)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 10px;border:0;border-radius:var(--radius-xl);background:transparent;color:var(--sidebody);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);text-align:left;text-decoration:none;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--sidehover);color:var(--sideink)}
.nav:active{transform:scale(.99)}
.nav:focus-visible{outline:3px solid rgba(0,48,135,.35);outline-offset:-2px}
.navic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--iconbg);color:var(--iconfg);transition:background-color 150ms ease,color 150ms ease}
.nav.grp.open{color:var(--sideink);font-weight:var(--weight-medium)}
.nav.grp.open .navic,.nav.top.on .navic{background:var(--iconon);color:#fff;box-shadow:0 6px 14px -6px rgba(0,48,135,.55)}
.nav.top.on{color:var(--sideink);font-weight:var(--weight-medium);background:var(--sidehover)}
.kids{position:relative;display:grid;gap:2px;margin:2px 0 8px 0;padding-left:44px}
.kids:before{content:"";position:absolute;left:25px;top:4px;bottom:4px;width:1.5px;border-radius:2px;background:var(--guide)}
.nav.sub{position:relative;min-height:38px;padding:0 10px;font-size:var(--text-sm);border-radius:var(--radius-lg)}
.nav.sub.on{background:var(--sideon);color:var(--sideonink);font-weight:var(--weight-medium)}
.nav.sub.on:before{content:"";position:absolute;left:-20px;top:9px;bottom:9px;width:3px;border-radius:3px;background:#003087}
.cs.dark .nav.sub.on:before{background:#2eaee4}
.chev{display:inline-flex;margin-left:auto;color:var(--sidemuted);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 7px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);background:#eef2f7;color:#475569}
.badge.warn{background:#fff1d6;color:#9a4a00}.badge.err{background:#ffe3d9;color:#b3340e}
.cs.dark .badge{background:rgba(255,255,255,.08);color:#cbd5e1}.cs.dark .badge.warn{background:rgba(255,152,0,.18);color:#fbbf24}.cs.dark .badge.err{background:rgba(255,87,36,.2);color:#ff8a65}
.topbar{position:absolute;left:272px;right:0;top:0;height:64px;display:flex;align-items:center;gap:12px;padding:0 24px 0 28px;background:var(--topbar);backdrop-filter:saturate(160%) blur(12px);-webkit-backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid var(--sideline);z-index:3}
.crumbic{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--radius-lg);background:var(--iconbg);color:var(--iconfg)}
.searchbtn{width:400px;height:40px;border-radius:var(--radius-xl);background:var(--surface2);border:1px solid transparent}
.searchbtn:hover{border-color:var(--line);background:var(--surface)}
.tb{width:40px;height:40px;border-radius:var(--radius-xl)}
.panel{background:var(--card);border:1px solid var(--cardline);border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04)}
.kpi{position:relative;display:flex;flex-direction:column;gap:4px;padding:14px 16px 12px;border-radius:var(--radius-xl);background:var(--card);border:1px solid var(--cardline);box-shadow:0 1px 2px rgba(15,23,42,.04);overflow:hidden}
.dpill{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.d-good{background:#e7f8f1;color:#047857}.d-bad{background:#ffece5;color:#c2410c}.d-flat{background:transparent;color:var(--muted);padding:0}
.th{background:#f8fafc;border-bottom:1px solid var(--line)}
.cs.dark .th{background:rgba(255,255,255,.03)}
.statuscard{margin:0 14px 10px;padding:12px 14px;border-radius:var(--radius-xl);background:linear-gradient(160deg,#f5f9ff 0%,#eef4fd 100%);border:1px solid #e1eaf7}
.cs.dark .statuscard{background:rgba(255,255,255,.04);border-color:var(--sideline)}
.me{display:flex;align-items:center;gap:10px;margin:0 14px 14px;padding:10px;border-radius:var(--radius-xl);border:1px solid var(--sideline)}
@media (prefers-reduced-motion: reduce){.nav,.navic,.chev{transition:none}.nav:active{transform:none}}

.sidein{display:flex;flex-direction:column;height:min(100%,900px);min-height:0}
.cs{overflow-wrap:break-word}
.cs [style*="display:grid"] > *{min-width:0}
.pill{white-space:normal;height:auto;min-height:24px;padding:3px 9px;line-height:1.3;max-width:100%}
.dpill{white-space:normal;height:auto;min-height:22px;padding:3px 8px;line-height:1.35;max-width:100%}
.d-flat{padding:0}
.kl{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ell{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.nav{position:relative;min-height:38px}
.navlabel{margin:6px 10px 4px !important}
.sidemeta{padding-bottom:8px !important}
.nav.sub{min-height:34px}
.kids{margin:2px 0 4px 0}
.statuscard{padding:10px 12px}
.me{padding:8px 10px}
.sidehead{padding-top:14px !important}
.sidenav{flex-grow:1;display:flex;flex-direction:column;gap:2px;padding:0 12px 8px;overflow-y:auto;scrollbar-width:thin}
.navtxt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.side{transition:width 220ms cubic-bezier(.23,1,.32,1)}
.topbar,.mainarea,.formbar{transition:left 220ms cubic-bezier(.23,1,.32,1)}
.sidetoggle{margin-left:auto;flex:none;color:var(--sidemuted)}
.logo-mini{display:none}
.cs.mini .side{width:76px}
.cs.mini .topbar{left:76px}
.cs.mini .mainarea{left:76px !important}
.cs.mini .navtxt,.cs.mini .chev,.cs.mini .kids,.cs.mini .sidemeta,.cs.mini .logo-full,.cs.mini .statustxt,.cs.mini .metxt,.cs.mini .mebtn,.cs.mini .navlabel{display:none !important}
.cs.mini .logo-mini{display:block}
.cs.mini .sidehead{flex-direction:column;align-items:center;padding:16px 0 10px;gap:10px}
.cs.mini .sidetoggle{margin-left:0}
.cs.mini .sidenav{padding:0 12px 8px}
.cs.mini .nav{justify-content:center;padding:0}
.cs.mini .nav .badge{position:absolute;top:5px;right:8px;min-width:9px;width:9px;height:9px;padding:0;font-size:0;border:2px solid var(--side);background:#ff9800}
.cs.mini .nav .badge.err{background:#ff5724}
.cs.mini .statuscard{margin:0 12px 10px;padding:12px 0;display:flex;justify-content:center}
.cs.mini .me{justify-content:center;margin:0 12px 12px;padding:8px 0}
@media (prefers-reduced-motion: reduce){.side,.topbar,.mainarea,.formbar{transition:none}}
.fcard{background:var(--card);border:1px solid var(--cardline);border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04);padding:4px 28px}
.fsec{display:grid;grid-template-columns:250px minmax(0,1fr);gap:32px;padding:24px 0}
.fsec + .fsec{border-top:1px solid var(--line)}
.fsh{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--ink);margin:0}
.fsd{margin:6px 0 0;font-size:var(--text-xs-plus);line-height:1.55;color:var(--body)}
.fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.flab{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--ink)}
.req{color:#c2410c;margin-left:2px}
.fhelp{font-size:var(--text-xs);line-height:1.45;color:var(--muted)}
.ferr{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:#c2410c}
.in{width:100%;height:44px;padding:0 12px;border:1px solid #d5dde8;border-radius:var(--radius-lg);background:var(--surface);font:inherit;font-size:var(--text-sm);color:var(--ink)}
textarea.in{height:auto;padding:10px 12px;line-height:1.5;resize:vertical}
select.in{padding-right:8px}
.in:focus,.affix:focus-within{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.15)}
.in.err,.affix.err{border-color:#ff5724;box-shadow:0 0 0 3px rgba(255,87,36,.12)}
.in.ok{border-color:#10b981}
.in[disabled]{background:var(--surface2);color:var(--muted)}
.affix{display:flex;align-items:stretch;height:44px;border:1px solid #d5dde8;border-radius:var(--radius-lg);overflow:hidden;background:var(--surface)}
.affix > span{display:flex;align-items:center;flex:none;padding:0 12px;background:var(--surface2);color:var(--body);font-size:var(--text-xs-plus)}
.affix > span.pre{border-right:1px solid #d5dde8}.affix > span.post{border-left:1px solid #d5dde8}
.affix input{flex:1;min-width:0;border:0;padding:0 12px;font:inherit;font-size:var(--text-sm);background:transparent;color:var(--ink);outline:none}
.sw{position:relative;display:inline-flex;flex:none;width:40px;height:24px;border-radius:var(--radius-full);background:#cbd5e1}
.sw:after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.sw.on{background:#003087}.sw.on:after{transform:translateX(16px)}
.swrow{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:12px 0}
.swrow + .swrow{border-top:1px solid var(--line)}
.rgrid{display:grid;gap:10px}
.rc{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid #d5dde8;border-radius:var(--radius-xl);background:var(--surface);min-width:0}
.rc.on{border-color:#003087;background:#f5f8ff;box-shadow:0 0 0 1px #003087}
.rc .rdot{margin-top:1px}
.rc.on .rdot{border:6px solid #003087}
.cb{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);border:2px solid #94a3b8;background:#fff}
.cb.on{background:#003087;border-color:#003087;color:#fff}
.cb.dis{background:var(--surface2);border-color:#cbd5e1}
.chk{display:flex;align-items:center;gap:10px;min-height:36px;font-size:var(--text-sm);color:var(--ink);min-width:0}
.tagsel{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:var(--radius-full);border:1px solid #d5dde8;font-size:var(--text-xs-plus);color:var(--body);background:var(--surface)}
.tagsel.on{background:#003087;border-color:#003087;color:#fff;font-weight:var(--weight-medium)}
.formbar{position:absolute;left:0;right:0;bottom:0;height:72px;display:flex;align-items:center;gap:10px;padding:0 28px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:3}
.note{padding:12px 14px;border-radius:var(--radius-xl);font-size:var(--text-xs-plus);line-height:1.55}
.n-info{background:#f2f5f9;color:var(--ink)}.n-warn{background:#fff4e0;color:#7a3e05}.n-err{background:#ffece5;color:#7c2d12}.n-ok{background:#e7f8f1;color:#065f46}

`;

// ---- markup ----

export default class CollectionsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="Collections">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1000px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <ConsoleSide group="billing" item="collections" toggle={v.toggleSide} label={v.sideLabel} />
          <ConsoleTop group="billing" page="Collections" />
          <main className="mainarea" style={MAIN}>
            <div style={PAGE}>
              <div style={TITLEROW}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={H1}>Collections</h1>
                  <p style={SUBT}>Stores pay from their panel or are charged automatically; staff call the rest and record the payment</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }}>
                  <button className="btn btng" type="button" onClick={v.sendAll} style={BTN}><Chat />Send pay links to all due</button>
                </div>
              </div>
              <div style={grid("repeat(5,minmax(0,1fr))")}>
                {v.kpis.map((k) => <Kpi key={k.label} k={k} />)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 400px", gap: "14px", alignItems: "stretch" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="panel" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", padding: "14px 18px 4px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>Who to call</h2>
                      <span className="cs-sub" style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Due today and overdue first · Dhaka working hours</span>
                    </div>
                    <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 80px 130px minmax(0,1.2fr) 110px 34px 90px", ...TH }}>
                      <span>Store and invoice</span>
                      <span style={{ textAlign: "right" }}>Amount</span>
                      <span>Overdue</span>
                      <span>Last contact</span>
                      <span>Next call</span>
                      <span />
                      <span />
                    </div>
                    {v.rows.map((r) => (
                      <div key={r.key} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 80px 130px minmax(0,1.2fr) 110px 34px 90px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)", background: r.bg }}>
                        <StoreCell ini={r.ini} name={r.name} sub={r.invoiceId} href={"/merchant-detail?id=" + r.shopId + "&tab=billing"} Link={__Link} />
                        <span className="num" style={{ ...CELLB, textAlign: "right" }}>{fmt.taka(r.amount)}</span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: r.overdueColor }}>{r.dueText}</span>
                          <span style={{ height: "6px", borderRadius: "3px", background: "var(--track)" }}>
                            <span style={{ display: "block", width: r.bar + "%", height: "100%", borderRadius: "3px", background: r.barCol }} />
                          </span>
                        </span>
                        <span className={r.contact.cls} style={{ justifySelf: "start" }}>{r.contact.text}</span>
                        <span style={CELL}>{r.next}</span>
                        <span className="av" style={{ width: "26px", height: "26px", background: r.amColor }} title={r.amName}>{r.am}</span>
                        <button className="btn btnp" type="button" onClick={r.pick} style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}><Phone s={14} />Call</button>
                      </div>
                    ))}
                    {v.none ? <div style={{ padding: "16px 18px", fontSize: "var(--text-xs-plus)", color: "var(--muted)", borderTop: "1px solid var(--line)" }}>No one to call: every bill due this week is paid.</div> : null}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>How {v.month} was paid</h2>
                        <div style={PSIDE} />
                      </div>
                      <div className="cs-seg-nolab" style={{ display: "flex", height: "30px", borderRadius: "var(--radius-lg)", overflow: "hidden", gap: "2px" }}>
                        <span style={{ width: v.panelPct + "%", background: "#003087", color: "#fff", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden" }}>From the merchant panel · {v.paidPanel}</span>
                        <span style={{ width: (100 - v.panelPct - v.autoPct) + "%", background: "#009cde", color: "#04121f", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden" }}>Taken on a call · {v.paidCall}</span>
                        {v.paidAuto ? <span style={{ width: v.autoPct + "%", background: "#99d7f2", color: "#04121f", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden" }}>Auto · {v.paidAuto}</span> : null}
                      </div>
                      <div className="cs-chart-legend"><span><span className="cs-chart-dot" style={{ background: "#003087" }} />From the merchant panel · {v.paidPanel}</span><span><span className="cs-chart-dot" style={{ background: "#009cde" }} />Taken on a call · {v.paidCall}</span>{v.paidAuto ? <span><span className="cs-chart-dot" style={{ background: "#99d7f2" }} />Charged automatically · {v.paidAuto}</span> : null}</div>
                      <p style={{ margin: "10px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--body)" }}>{v.month}, {v.paidStores} paid store{v.paidStores === 1 ? "" : "s"}{v.paidAuto ? `, ${v.paidAuto} charged automatically` : ""}.</p>
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Collected on calls, {v.month}</h2>
                        <div style={PSIDE} />
                      </div>
                      {v.collectors.length ? v.collectors.map((x) => <BarRow key={x.name} label={x.name} width={x.width} color={x.color} value={`${x.n} collected`} />) : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No payments taken on calls yet this month.</div>}
                    </section>
                  </div>
                </div>
                <section className="panel" style={PANEL}>
                  <div style={PHEAD}>
                    <h2 style={H2}>On the call</h2>
                    <div style={PSIDE} />
                  </div>
                  {v.sel ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <StoreCell ini={v.sel.ini} name={v.sel.name} sub={`${v.sel.invoiceId} · ${fmt.taka(v.sel.amount)} · ${v.sel.overdueDays > 0 ? v.sel.overdueText : v.sel.overdueDays === 0 ? "due today" : "due in " + -v.sel.overdueDays + " days"}`} href={"/merchant-detail?id=" + v.sel.shopId + "&tab=billing"} Link={__Link} />
                      <div style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface2)", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--ink)" }}>{v.script}</div>
                      <div style={UPPER}>Outcome</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {v.outcomes.map((o) => <button key={o.key} className={o.cls} type="button" onClick={o.pick} aria-pressed={o.cls === "fchip on" ? "true" : "false"}>{o.label}</button>)}
                      </div>
                      <div style={grid("repeat(2,minmax(0,1fr))")}>
                        <label className="fl" style={LAB}>Method<select className="sel" style={{ width: "100%" }} value={v.method} onChange={v.onMethod}>
                          {["bKash", "Nagad", "Rocket", "Bank transfer", "Cash at office"].map((x) => <option key={x}>{x}</option>)}
                        </select></label>
                        {v.isPaid ? <label className="fl" style={LAB}>Transaction ID<input className="inp" type="text" value={v.tx} onChange={v.onTx} placeholder="e.g. 9TX44PL0B" style={INP} /></label> : null}
                        {v.isPaid ? <label className="fl" style={LAB}>Amount, ৳<input className="inp" type="text" inputMode="numeric" value={v.amount} onChange={v.onAmount} placeholder="" style={INP} /></label> : null}
                        {v.isPaid ? <label className="fl" style={LAB}>Received by<select className="sel" style={{ width: "100%" }} value={v.by} onChange={v.onBy}>
                          {v.collectorList.map((x) => <option key={x}>{x}</option>)}
                        </select></label> : null}
                        {v.needsWhen ? <label className="fl" style={LAB}>{v.outcome === "promised" ? "Pays on" : "Call again"}<select className="sel" style={{ width: "100%" }} value={v.when} onChange={v.onWhen}>
                          {v.whenOpts.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select></label> : null}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button className="btn btnp" type="button" onClick={v.save} style={BTN}>{v.saveLabel}</button>
                        <button className="btn btng" type="button" onClick={v.sendLink} style={BTN}><Chat />Send pay link</button>
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Payments merchants make from their own panel appear here automatically; nothing is charged without them unless the store asked for automatic charging.</div>
                    </div>
                  ) : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Pick a store in Who to call.</div>}
                </section>
              </div>
            </div>
          </main>
          <ConsoleToast text={v.toast} tone={v.toastTone} onClose={v.hideToast} />
        </div>
      </div>
    );
  }
}
