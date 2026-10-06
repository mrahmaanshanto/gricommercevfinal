'use client';
// Generated from design/templates/console/MerchantDetail.dc.html by scripts/convert-design.mjs.
// Merchant detail · one store, every tab (console › Tenants › Merchants › a store)
// Edit freely: this file is now the source for the screen.
// Data: lib/platform (merchantView). The look is the design board's; every list and action is live.
// /merchant-detail?id=0031&tab=billing opens a store on a tab.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ConsoleSide, ConsoleTop, ConsoleToast } from './ConsoleFrame';
import { H2, PHEAD, PSIDE, PANEL, TH, CELL, CELLB, LAB, INP, BTN, SMB, CHK, row, Kpi, Plus, Lock, Phone } from './consoleParts';
import {
  attach, db, now, staff, param, merchantView, recordPayment, sendPayLinks, setAutoCharge, addItem, editItem, endItem, changePlan,
  startModuleTrial, sendReset, addNote, toggleTask, setAttribution, logSession, pauseStore, resumeStore, setControl,
  archiveStore, restoreStore, catalogue, fmt,
} from '@/lib/platform';

// ---- logic ----

const TABS = [['overview', 'Overview'], ['billing', 'Billing and payments'], ['modules', 'Modules and trials'], ['onboarding', 'Onboarding'], ['support', 'Support'], ['affiliates', 'Affiliates'], ['activity', 'Activity']];
const FILTERS = [['all', 'Everything'], ['owner', 'Owner and team'], ['staff', 'Staff'], ['billing', 'Billing'], ['system', 'System']];
const CONTROL = {
  pause: ['Pause storefront', (id, why) => pauseStore(id, why), 'Storefront paused · no bills while paused'],
  resume: ['Resume store', (id) => resumeStore(id), 'Store resumed'],
  readonly: ['Make read-only', (id, why) => setControl(id, 'readonly', why), 'Admin is read-only; the storefront keeps selling'],
  writable: ['Remove read-only', (id, why) => setControl(id, null, why || 'Fixed'), 'Full access restored'],
  suspend: ['Suspend store', (id, why) => setControl(id, 'suspended', why), 'Store suspended · data kept'],
  lift: ['Lift suspension', (id, why) => setControl(id, null, why || 'Fixed'), 'Suspension lifted'],
  archive: ['Archive store', (id, why) => archiveStore(id, why), 'Store archived · restorable without a rebuild'],
  restore: ['Restore store', (id) => restoreStore(id), 'Store restored · billing starts today'],
};

class Component extends DCLogic {
  componentDidMount() {
    this.off = attach(this);
    const tab = param('tab');
    if (tab && TABS.some(([id]) => id === tab)) this.setState({ tab });
  }
  componentWillUnmount() { if (this.off) this.off(); }
  componentDidUpdate() {
    const shop = db().shops.find((x) => x.id === param('id', '0031'));
    if (shop) document.title = `Merchant page · ${shop.name} · GridCommerce`;
  }

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
    const id = param('id', '0031');
    const t = now();
    const me = staff();
    const m = merchantView(db(), t, id, me);
    const sid = m.shop.id;
    const tab = s.tab ?? 'overview';
    const say = (text, tone = 'ok') => this.setState({ toast: text, toastTone: tone });
    const done = (res, okText) => { if (res && res.ok === false) say(res.error, 'err'); else say(okText); return res; };
    const field = (k, fallback) => (s[k] ?? fallback);
    const set = (k) => (ev) => this.setState({ [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value });

    // record a payment
    const payInv = field('payInv', m.billing.defaultInvoice);
    const payInvRow = m.billing.payable.find((x) => x.value === payInv);
    const payAmount = field('payAmount', m.billing.defaultAmount);
    // add an item
    const addCode = field('addCode', 'M05');
    const addon = catalogue.ADDONS.find((a) => a.code === addCode);
    const addPrice = field('addPrice', addon ? String(addon.price) : '');
    const addPeriod = field('addPeriod', addon ? (addon.period === 'Once' ? 'One-off' : addon.period) : 'Monthly');
    const addStarts = field('addStarts', fmt.dmy(t));
    const nextDue = m.billing.nextDue;
    const proDays = nextDue ? Math.max(0, fmt.daysBetween(t, nextDue)) : 0;
    const proAmt = Math.round((Number(String(addPrice).replace(/[^0-9.]/g, '')) || 0) * proDays / 30);
    // module trial
    const trialCode = field('trialCode', m.modules.options[0].code + '|' + m.modules.options[0].label);
    const [tCode, tLabel] = trialCode.split('|');
    const trialOpt = m.modules.options.find((o) => o.code === tCode && o.label === tLabel) || m.modules.options[0];

    const out = {
      m, tab, me,
      tabs: TABS.map(([tid, label]) => {
        const count = tid === 'billing' ? m.tabsCount.billing : tid === 'support' ? m.tabsCount.support : 0;
        return { id: tid, label, count: count ? String(count) : '', hasCount: !!count, cls: tid === tab ? 'mt on' : 'mt', sel: tid === tab ? 'true' : 'false', pick: () => this.setState({ tab: tid }) };
      }),
      goBilling: () => this.setState({ tab: 'billing' }),
      goModules: () => this.setState({ tab: 'modules' }),
      toast: s.toast || '', toastTone: s.toastTone || 'ok', hideToast: () => this.setState({ toast: '' }),
      sendReset: () => { const r = sendReset(sid); done(r, `Reset link sent to ${r.phone} by SMS · written to the audit log`); },

      // billing
      payInv, payAmount, payMethod: field('payMethod', m.billing.payMethod === 'Card' ? 'bKash' : m.billing.payMethod), payTx: field('payTx', ''), payVia: field('payVia', 'call'),
      payBy: field('payBy', catalogue.COLLECTORS.includes(me.name) ? me.name : catalogue.COLLECTORS[0]),
      onPayInv: (ev) => { const row = m.billing.payable.find((x) => x.value === ev.target.value); this.setState({ payInv: ev.target.value, payAmount: row ? String(fmt.parseAmount(row.label.split('·')[1])) : '' }); },
      onPayAmount: set('payAmount'), onPayMethod: set('payMethod'), onPayTx: set('payTx'), onPayVia: set('payVia'), onPayBy: set('payBy'),
      submitPay: () => {
        if (!payInvRow) { say('Nothing is owed: there is no bill to record a payment against.', 'err'); return; }
        const r = recordPayment({ invoiceId: payInv, amount: fmt.parseAmount(payAmount), method: field('payMethod', 'bKash'), txId: field('payTx', ''), via: field('payVia', 'call'), by: field('payBy', me.name) });
        if (r.ok) { this.setState({ payTx: '', payInv: undefined, payAmount: undefined }); say(`${fmt.taka(r.payment.amount)} recorded for ${r.payment.invoiceId}${r.restored ? ' · the store is back to full access' : r.left ? ' · ' + fmt.taka(r.left) + ' still owed' : ' · receipt sent to the owner'}`); }
        else say(r.error, 'err');
      },
      sendLink: () => { const r = sendPayLinks(sid); done(r, r.count ? `Pay link sent by SMS and in the merchant panel (${r.count} bill${r.count === 1 ? '' : 's'})` : 'No unpaid bill to send a link for'); },
      autoText: m.billing.autoCharge ? `Auto-charge on · ${m.billing.payMethod} · turn off` : 'Collected by hand · charge automatically',
      toggleAuto: () => { const on = !m.billing.autoCharge; const r = setAutoCharge(sid, on, on ? (m.billing.payMethod === 'Bank transfer' ? 'Card' : m.billing.payMethod) : undefined); done(r, on ? 'Automatic charge on: the next bill is charged on its due day, with retries after 1 and 3 days' : 'Automatic charge off: bills are collected by hand'); },
      addCode, addPrice, addPeriod, addStarts, addProrate: field('addProrate', true), addTell: field('addTell', true), proText: `Prorate the first month (${fmt.taka(proAmt)} for ${proDays} days)`,
      onAddCode: (ev) => { const a = catalogue.ADDONS.find((x) => x.code === ev.target.value); this.setState({ addCode: ev.target.value, addPrice: a ? String(a.price) : '', addPeriod: a ? (a.period === 'Once' ? 'One-off' : a.period) : 'Monthly' }); },
      onAddPrice: set('addPrice'), onAddPeriod: set('addPeriod'), onAddStarts: set('addStarts'), onAddProrate: set('addProrate'), onAddTell: set('addTell'),
      submitAdd: () => {
        const starts = Date.parse(addStarts);
        const r = addItem(sid, { code: addCode === 'CUSTOM' ? null : addCode, name: s.addName || 'Custom item', price: fmt.parseAmount(addPrice), period: addPeriod, startsAt: Number.isFinite(starts) && starts > t ? starts : t, prorate: field('addProrate', true) });
        done(r, r.ok ? `${r.item.name} added · on the next bill${field('addTell', true) ? ' · the owner is told in the admin and by SMS' : ''}` : '');
      },
      editingItem: s.editItem || null, editPrice: s.editPrice || '', onEditPrice: set('editPrice'),
      startEdit: (row) => this.setState({ editItem: row.id, editPrice: String(fmt.parseAmount(row.price)), editPlan: m.sub.plan, editCycle: m.sub.cycle }),
      saveEdit: () => {
        const row = m.billing.rows.find((x) => x.id === s.editItem);
        if (row && row.plan) {
          const r = changePlan(sid, s.editPlan || m.sub.plan, s.editCycle || m.sub.cycle);
          done(r, r.ok ? `Plan changed to ${catalogue.PLAN_NAME[s.editPlan]}${r.prorated ? ' · ' + fmt.taka(r.prorated) + ' prorated on the next bill' : ''}` : '');
          if (r.ok) this.setState({ editItem: null });
          return;
        }
        const r = editItem(sid, s.editItem, fmt.parseAmount(s.editPrice)); done(r, 'Price changed from the next bill'); if (r.ok) this.setState({ editItem: null });
      },
      editPlan: s.editPlan || m.sub.plan, editCycle: s.editCycle || m.sub.cycle, onEditPlan: set('editPlan'), onEditCycle: set('editCycle'),
      planChoices: ['growth', 'business', 'enterprise'].map((pid) => { const lv = db().plans[m.sub.ladder]; const ver = lv.versions.find((x) => x.v === lv.live); return { pid, label: `${ver.plans[pid].name} · ${fmt.taka(ver.plans[pid].price)}` }; }),
      cancelEdit: () => this.setState({ editItem: null }),
      ending: s.ending || null,
      askEnd: (row) => this.setState({ ending: row.id }),
      confirmEnd: (row) => { const r = endItem(sid, row.id); done(r, `${row.name} ended · not on the next bill`); this.setState({ ending: null }); },

      // modules
      trialCode, trialLen: field('trialLen', '14 days'), trialStart: field('trialStart', 'Now'), trialDate: field('trialDate', fmt.dmy(t + fmt.DAY)), trialReason: field('trialReason', 'Sales evaluation'),
      trialAuto: field('trialAuto', true), trialTell: field('trialTell', true), trialAutoText: `When the trial ends, add it to the bill at ${fmt.taka(trialOpt.price)} a month unless the owner says no`,
      onTrialCode: set('trialCode'), onTrialLen: set('trialLen'), onTrialStart: set('trialStart'), onTrialDate: set('trialDate'), onTrialReason: set('trialReason'), onTrialAuto: set('trialAuto'), onTrialTell: set('trialTell'),
      submitTrial: () => {
        const days = parseInt(field('trialLen', '14 days'), 10);
        const when = field('trialStart', 'Now') === 'Now' ? t : Date.parse(field('trialDate', ''));
        const r = startModuleTrial(sid, { code: trialOpt.code, label: trialOpt.label, days, startsAt: Number.isFinite(when) ? when : t, reason: field('trialReason', 'Sales evaluation'), autoAdd: field('trialAuto', true), price: trialOpt.price });
        done(r, r.ok ? (r.extended ? `${r.trial.name} trial extended by ${days} days` : `${r.trial.name} trial started for ${days} days`) : '');
      },

      // notes
      noteOpen: !!s.noteOpen, noteText: s.noteText || '', noteKind: s.noteKind || 'note', notePin: !!s.notePin,
      openNote: () => this.setState({ noteOpen: true }), closeNote: () => this.setState({ noteOpen: false, noteText: '' }),
      onNoteText: set('noteText'), onNoteKind: set('noteKind'), onNotePin: set('notePin'),
      saveNote: () => { const r = addNote(sid, { text: s.noteText, kind: s.noteKind || 'note', pinned: !!s.notePin }); done(r, (s.noteKind === 'task' ? 'Task' : 'Note') + ' saved'); if (r.ok) this.setState({ noteOpen: false, noteText: '', notePin: false }); },
      flipTask: (n) => { if (n.kind === 'task') { const r = toggleTask(n.id); done(r, r.done ? 'Task done' : 'Task open again'); } },

      // store controls
      control: s.control || null, controlWhy: s.controlWhy || catalogue.CONTROL_REASONS[0], onControlWhy: set('controlWhy'),
      askControl: (k) => (k === 'resume' || k === 'restore' ? done(CONTROL[k][1](sid), CONTROL[k][2]) : this.setState({ control: k })),
      cancelControl: () => this.setState({ control: null }),
      doControl: () => { const k = s.control; const r = CONTROL[k][1](sid, s.controlWhy || catalogue.CONTROL_REASONS[0]); done(r, CONTROL[k][2] + ' · written to the audit log'); this.setState({ control: null }); },
      controlLabel: s.control ? CONTROL[s.control][0] : '',
      exportStore: () => {
        const d = db();
        const pack = { store: m.shop, subscription: m.sub, invoices: d.invoices.filter((x) => x.shopId === sid), payments: d.payments.filter((x) => x.shopId === sid), credits: d.credits.filter((x) => x.shopId === sid), notes: d.notes.filter((x) => x.shopId === sid), exportedAt: new Date(t).toISOString(), by: me.name };
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' }));
        a.download = `store-${sid}-${m.shop.sub}.json`;
        a.click();
        say(`Store data exported to store-${sid}-${m.shop.sub}.json · written to the audit log`);
      },

      // onboarding
      editSrc: !!s.editSrc, toggleEditSrc: () => this.setState({ editSrc: !s.editSrc }),
      pickSrc: (src) => { if (!s.editSrc) return; const r = setAttribution(sid, src); done(r, `Came from: ${src}`); },
      sessOpen: !!s.sessOpen, sessKind: s.sessKind || 'Video call', sessMin: s.sessMin || '30', sessNote: s.sessNote || '',
      openSess: () => this.setState({ sessOpen: true }), closeSess: () => this.setState({ sessOpen: false }),
      onSessKind: set('sessKind'), onSessMin: set('sessMin'), onSessNote: set('sessNote'),
      saveSess: () => { const r = logSession(sid, { kind: s.sessKind || 'Video call', minutes: s.sessMin || '', note: s.sessNote }); done(r, 'Session logged'); if (r.ok) this.setState({ sessOpen: false, sessNote: '' }); },

      // affiliates
      copyLink: () => { try { navigator.clipboard.writeText('https://' + m.affiliates.link); } catch { /* ignore */ } say('Referral link copied'); },

      // activity
      filter: s.filter || 'all',
      filters: FILTERS.map(([k, label]) => ({ k, label, cls: (s.filter || 'all') === k ? 'fchip on' : 'fchip', pressed: (s.filter || 'all') === k ? 'true' : 'false', pick: () => this.setState({ filter: k }) })),
      activity: m.activity.filter((a) => { const f = s.filter || 'all'; return f === 'all' || (f === 'owner' ? a.kind === 'owner' || a.kind === 'team' : a.kind === f); }),
    };
    TABS.forEach(([tid]) => { out['is_' + tid] = tid === tab; });
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

.inp{height:44px;padding:0 14px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);font:inherit;font-size:var(--text-sm);color:var(--ink)}
.fl{display:flex;flex-direction:column;gap:5px;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:.04em;color:var(--muted);min-width:0}
.fl select{width:100%}
.mrow{display:grid;grid-template-columns:minmax(0,2fr) 150px minmax(0,1.3fr) 76px 130px minmax(0,1fr) 110px 110px 34px;align-items:center;gap:12px;min-height:56px;padding:0 18px;border-top:1px solid var(--line);color:inherit;transition:background-color 150ms ease}
.mrow:hover{background:var(--surface2);color:inherit}
.mt{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 2px;border:0;border-bottom:2px solid transparent;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body);cursor:pointer;white-space:nowrap}
.mt.on{border-bottom-color:#003087;color:#003087;font-weight:var(--weight-medium)}
.fact{display:flex;flex-direction:column;gap:3px;padding:12px 16px;min-width:0}
.fact + .fact{border-left:1px solid var(--line)}
.mod{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:var(--radius-lg);font-size:var(--text-xs);white-space:nowrap}
.mod-in{background:#003087;color:#fff}.mod-add{background:#e0f3fb;color:#00567a;border:1px solid #99d7f2}.mod-trial{background:#fff;color:#0070a0;border:2px dashed #009cde}
.mod-lock{background:var(--surface2);color:var(--muted);border:1px solid var(--line)}.mod-off{background:transparent;color:var(--text-muted);border:1px dashed #e2e8f0}
.src{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid var(--line);font-size:var(--text-xs-plus);color:var(--body);background:var(--surface)}
.src.on{background:#003087;border-color:#003087;color:#fff;font-weight:var(--weight-medium)}
.toast{position:absolute;right:24px;bottom:24px;display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:var(--radius-xl);background:#0f172a;color:#fff;box-shadow:0 16px 36px -16px rgba(0,0,0,.55);font-size:var(--text-sm);z-index:5}
@media (prefers-reduced-motion: reduce){.mrow{transition:none}}


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

export default class MerchantDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const m = v.m;
    const h = m.head;
    const o = m.overview;
    const b = m.billing;
    const c = o.controls;
    return (
      <div className="dc-screen" data-screen="MerchantDetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1560px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <ConsoleSide group="tenants" item="merchants" toggle={v.toggleSide} label={v.sideLabel} />
          <ConsoleTop group="tenants" page={h.name} crumb="Merchants" />
          <main className="mainarea" style={{ position: "absolute", left: "272px", right: "0", top: "64px", bottom: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ background: "var(--surface)", padding: "14px 24px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                <__Link href="/merchants" style={{ fontWeight: "var(--weight-medium)" }}>← Merchants</__Link>
                <span style={{ color: "var(--muted)" }}>/ {h.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "var(--radius-xl)", background: "#003087", color: "#fff", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", flex: "none" }}>{h.ini}</span>
                <div style={{ minWidth: "0" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }}>{h.name}</h1>
                  <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}><span className="mono">tenant {h.tid}</span> · {h.desc}</div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                    <span className="pill p-navy">{h.segPlan}</span>
                    <span className={h.statePill}><span className={h.stateShp} />{h.stateText}</span>
                    <span className={h.healthPill}><span className={h.healthShp} />{h.healthText}</span>
                    <span className="pill p-grey">{h.am}</span>
                  </div>
                </div>
                <div className="cs-actions" style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "560px" }}>
                  <a className="btn btng" href={h.site} target="_blank" rel="noopener" style={BTN}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
</svg>Visit website</a>
                  <__Link href="/tenant-context-bar" className="btn btng" style={BTN}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>View as owner</__Link>
                  <button className="btn btng" type="button" onClick={v.sendReset} style={BTN}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="4" y="11" width="16" height="10" rx="2" />
  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
</svg>Send reset link</button>
                  <button className="btn btng" type="button" onClick={v.goModules} style={BTN}>Give module trial</button>
                  <button className="btn btnp" type="button" onClick={v.goBilling} style={BTN}>Record payment</button>
                  <a className="btn btnp" href={"tel:" + String(h.phone).replace(/[^0-9+]/g, "")} style={BTN}><Phone />Call owner</a>
                </div>
              </div>
              <div className="cs-cols2" style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", marginTop: "14px", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                {m.facts.map((f) => (
                  <div className="fact" key={f.k}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>{f.label}</span>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{f.value}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{f.sub}</span>
                  </div>
                ))}
              </div>
              <div className="cs-desk-only" style={{ height: "14px" }} />
            </div>
            <div role="tablist" aria-label="Merchant sections" className="cs-strip" style={{ display: "flex", gap: "26px", padding: "0 24px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
              {v.tabs.map((tb) => (
                <button key={tb.id} className={tb.cls} type="button" role="tab" aria-selected={tb.sel} onClick={tb.pick}>{tb.label}{tb.hasCount ? <span className="cnt">{tb.count}</span> : null}</button>
              ))}
            </div>
            <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "0", overflow: "hidden" }}>
              {v.is_overview ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "12px" }}>
                    {o.kpis.map((k) => <Kpi key={k.k} k={k} />)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Store sales per month</h2>
                        <div style={PSIDE}>৳ thousand</div>
                      </div>
                      <svg className="cs-chart-l" viewBox="0 0 640 200" width="100%" role="img" aria-hidden="true" style={{ display: "block" }}>
                        {[178, 138, 98, 58, 18].map((y) => <line key={y} x1="36" x2="640" y1={y} y2={y} stroke="#eef2f7" />)}
                        {o.salesChart.area ? <path d={o.salesChart.area} fill="#003087" opacity=".08" /> : null}
                        <path d={o.salesChart.line} fill="none" stroke="#003087" strokeWidth="2.5" strokeLinejoin="round" />
                        <circle cx={o.salesChart.last[0]} cy={o.salesChart.last[1]} r="4.5" fill="#fff" stroke="#003087" strokeWidth="2.5" />
                        {o.salesChart.labels.map((l) => <text key={l.x} x={l.x} y="196" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">{l.text}</text>)}
                      </svg>
                      <div className="cs-axis" aria-hidden="true">
                        {o.salesChart.labels.map((l) => <span key={l.x} style={{ left: l.pct }}>{l.text}</span>)}
                      </div>
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>{o.health.title}</h2>
                        <div style={PSIDE} />
                      </div>
                      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                            <circle cx="32.0" cy="32.0" r="28.0" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                            <circle cx="32.0" cy="32.0" r="28.0" fill="none" stroke={o.health.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={o.health.dash} transform="rotate(-90 32.0 32.0)" />
                          </svg>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{o.health.score}</span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: o.health.changeColor, fontWeight: "var(--weight-medium)" }}>{o.health.change}</span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        {o.health.parts.map((p) => (
                          <div key={p.key} style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 30px", alignItems: "center", gap: "8px", minHeight: "26px" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>{p.label}</span>
                            <span style={{ height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                              <span style={{ display: "block", width: p.width, height: "100%", borderRadius: "var(--radius-sm)", background: p.bar }} />
                            </span>
                            <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: p.valColor, textAlign: "right" }}>{p.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>{o.teamTitle}</h2>
                        <div style={PSIDE} />
                      </div>
                      {o.team.map((p, i) => (
                        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "46px", borderTop: i ? "1px solid var(--line)" : "0" }}>
                          <span className="av" style={{ background: p.color }}>{p.ini}</span>
                          <div style={{ minWidth: "0" }}>
                            <div style={CELLB}>{p.name} <span style={{ fontWeight: "var(--weight-regular)", color: "var(--muted)" }}>· {p.role}</span></div>
                            <div className="num" style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>{p.phone}</div>
                          </div>
                          <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>{p.last}</span>
                        </div>
                      ))}
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Integrations now</h2>
                        <div style={PSIDE} />
                      </div>
                      {o.integrations.map((x) => (
                        <div key={x.name} style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "32px", fontSize: "var(--text-xs-plus)" }}>
                          <span className={x.shp} />
                          <span style={{ fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{x.name}</span>
                          <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: x.color, fontWeight: x.weight }}>{x.text}</span>
                        </div>
                      ))}
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Notes and tasks</h2>
                        <div style={PSIDE}>
                          <button className="btn btng" type="button" onClick={v.noteOpen ? v.closeNote : v.openNote} style={BTN}><Plus />Add note</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {v.noteOpen ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface2)", border: "1px solid var(--line)" }}>
                            <textarea className="inp" rows={3} value={v.noteText} onChange={v.onNoteText} placeholder="What should the next person know?" aria-label="Note" style={{ height: "auto", padding: "8px 10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5" }} />
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                              <select className="sel" value={v.noteKind} onChange={v.onNoteKind} aria-label="Note or task"><option value="note">Note</option><option value="task">Task for today</option></select>
                              <label style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}><input type="checkbox" checked={v.notePin} onChange={v.onNotePin} style={CHK} />Pin</label>
                              <span style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                                <button className="btn btng" type="button" onClick={v.closeNote} style={SMB}>Cancel</button>
                                <button className="btn btnp" type="button" onClick={v.saveNote} style={SMB}>Save</button>
                              </span>
                            </div>
                          </div>
                        ) : null}
                        {o.notes.length ? o.notes.map((n) => (
                          <div key={n.id} onClick={() => v.flipTask(n)} role={n.kind === "task" ? "button" : undefined} title={n.kind === "task" ? (n.done ? "Mark as open" : "Mark as done") : undefined} style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: n.bg, border: n.border, cursor: n.kind === "task" ? "pointer" : "default", opacity: n.done ? ".6" : "1" }}>
                            <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--muted)" }}>{n.head}</div>
                            <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--ink)", textDecoration: n.done ? "line-through" : "none" }}>{n.text}</div>
                          </div>
                        )) : (!v.noteOpen ? <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No notes yet.</div> : null)}
                      </div>
                    </section>
                  </div>
                  <section className="panel" style={PANEL}>
                    <div style={PHEAD}>
                      <h2 style={H2}>Store controls</h2>
                      <div style={PSIDE} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <button className="btn btng" type="button" onClick={v.exportStore} style={BTN}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
</svg>Export store data</button>
                      <button className="btn btng" type="button" onClick={() => v.askControl(c.paused ? "resume" : "pause")} disabled={c.archived || c.cancelled} style={BTN}>{c.paused ? "Resume store" : "Pause storefront"}</button>
                      <button className="btn btng" type="button" onClick={() => v.askControl(c.readonly ? "writable" : "readonly")} disabled={c.archived || c.cancelled} style={BTN}>{c.readonly ? "Remove read-only" : "Make read-only"}</button>
                      <button className="btn" type="button" onClick={() => v.askControl(m.shop.control === "suspended" ? "lift" : "suspend")} disabled={c.archived || c.cancelled || (c.suspended && m.shop.control !== "suspended")} title={c.suspended && m.shop.control !== "suspended" ? "Suspended for an unpaid bill: record the payment to restore access" : undefined} style={{ ...BTN, background: "#ffece5", color: "#c2410c" }}>{m.shop.control === "suspended" ? "Lift suspension" : "Suspend store"}</button>
                      <button className="btn" type="button" onClick={() => v.askControl(c.archived ? "restore" : "archive")} style={{ ...BTN, background: "#ffece5", color: "#c2410c" }}>{c.archived ? "Restore store" : "Archive store"}</button>
                      <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Each needs a reason code and is written to the audit log. Data is never deleted.</span>
                    </div>
                    {v.control ? (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "12px", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#fff4e0" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#7a3e05" }}>{v.controlLabel} · reason</span>
                        <select className="sel" value={v.controlWhy} onChange={v.onControlWhy} aria-label="Reason code">{catalogue.CONTROL_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
                        <button className="btn btnp" type="button" onClick={v.doControl} style={SMB}>{v.controlLabel}</button>
                        <button className="btn btng" type="button" onClick={v.cancelControl} style={SMB}>Cancel</button>
                      </div>
                    ) : null}
                  </section>
                </div>
              ) : null}
              {v.is_billing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                    {b.kpis.map((k) => <Kpi key={k.label} k={k} />)}
                  </div>
                  <section className="panel" style={PANEL}>
                    <div style={PHEAD}>
                      <h2 style={H2}>What the store is billed for</h2>
                      <div style={PSIDE}>plan, modules and credits are billed separately</div>
                    </div>
                    <div style={{ margin: "0 -20px -16px" }}>
                      <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 90px 80px 90px minmax(0,1.3fr) 70px 120px", ...TH }}>
                        <span>Billed item</span>
                        <span>Type</span>
                        <span style={{ textAlign: "right" }}>Price</span>
                        <span>Period</span>
                        <span>Since</span>
                        <span>Next bill</span>
                        <span />
                      </div>
                      {b.rows.map((r, i) => (
                        <div key={r.id} style={row("minmax(0,1.6fr) 90px 80px 90px minmax(0,1.3fr) 70px 120px", i === 0)}>
                          {v.editingItem === r.id && r.plan ? (
                            <span style={{ display: "flex", gap: "6px" }}>
                              <select className="sel" value={v.editPlan} onChange={v.onEditPlan} aria-label="Plan" style={{ height: "34px" }}>{v.planChoices.map((pc) => <option key={pc.pid} value={pc.pid}>{pc.label}</option>)}</select>
                              <select className="sel" value={v.editCycle} onChange={v.onEditCycle} aria-label="Billing cycle" style={{ height: "34px" }}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
                            </span>
                          ) : <span style={CELLB}>{r.name}</span>}
                          <span className={r.typeCls} style={{ justifySelf: "start" }}>{r.type}</span>
                          {v.editingItem === r.id && !r.plan ? (
                            <input className="inp" value={v.editPrice} onChange={v.onEditPrice} aria-label="New price" style={{ height: "34px", width: "80px", padding: "0 8px", fontSize: "var(--text-xs-plus)", textAlign: "right" }} />
                          ) : <span className="num" style={{ ...CELLB, textAlign: "right" }}>{r.price}</span>}
                          <span style={CELL}>{r.period}</span>
                          <span style={CELL}>{r.since}</span>
                          <span style={CELL}>{r.next}</span>
                          <span style={{ display: "flex", gap: "6px" }}>
                            {r.done || r.trial ? null : v.editingItem === r.id ? (
                              <>
                                <button className="btn btnp" type="button" onClick={v.saveEdit} style={SMB}>Save</button>
                                <button className="btn btng" type="button" onClick={v.cancelEdit} style={SMB}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button className="btn btng" type="button" onClick={() => v.startEdit(r)} style={SMB}>{r.plan ? "Change" : "Edit"}</button>
                                {r.plan ? null : v.ending === r.id ? <button className="btn" type="button" onClick={() => v.confirmEnd(r)} style={{ ...SMB, background: "#ffece5", color: "#c2410c" }}>Sure? End</button> : <button className="btn btng" type="button" onClick={() => v.askEnd(r)} style={SMB}>End</button>}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Record a payment</h2>
                        <div style={PSIDE}><button type="button" className="rowlink" onClick={v.toggleAuto} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", fontSize: "var(--text-xs)" }}>{v.autoText}</button></div>
                      </div>
                      <div style={{ padding: "10px 12px", borderRadius: "var(--radius-lg)", background: b.banner.bg, fontSize: "var(--text-xs-plus)", color: b.banner.color, marginBottom: "12px" }}><strong>{b.banner.strong}</strong>{b.banner.rest}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
                        <label className="fl" style={LAB}>Invoice<select className="sel" style={{ width: "100%" }} value={v.payInv} onChange={v.onPayInv}>
                          {b.payable.length ? b.payable.map((x) => <option key={x.value} value={x.value}>{x.label}</option>) : <option value="">Nothing owed</option>}
                        </select></label>
                        <label className="fl" style={LAB}>Amount, ৳<input className="inp" type="text" inputMode="numeric" value={v.payAmount} onChange={v.onPayAmount} placeholder="" style={INP} /></label>
                        <label className="fl" style={LAB}>Method<select className="sel" style={{ width: "100%" }} value={v.payMethod} onChange={v.onPayMethod}>
                          {b.methods.map((x) => <option key={x}>{x}</option>)}
                        </select></label>
                        <label className="fl" style={LAB}>Transaction ID<input className="inp" type="text" value={v.payTx} onChange={v.onPayTx} placeholder="e.g. 8KJ21M0QX" style={INP} /></label>
                        <label className="fl" style={LAB}>How it came in<select className="sel" style={{ width: "100%" }} value={v.payVia} onChange={v.onPayVia}>
                          {b.via.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                        </select></label>
                        <label className="fl" style={LAB}>Received by<select className="sel" style={{ width: "100%" }} value={v.payBy} onChange={v.onPayBy}>
                          {b.collectors.map((x) => <option key={x}>{x}</option>)}
                        </select></label>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
                        <button className="btn btnp" type="button" onClick={v.submitPay} style={BTN}>Record payment</button>
                        <button className="btn btng" type="button" onClick={v.sendLink} style={BTN}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
</svg>Send pay link to panel</button>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>A receipt goes to the owner; the store leaves grace at once.</span>
                      </div>
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Add a module or item to the bill</h2>
                        <div style={PSIDE} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
                        <label className="fl" style={LAB}>Module or item<select className="sel" style={{ width: "100%" }} value={v.addCode} onChange={v.onAddCode}>
                          {b.addons.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
                          <option value="CUSTOM">Custom item…</option>
                        </select></label>
                        <label className="fl" style={LAB}>Price, ৳<input className="inp" type="text" inputMode="numeric" value={v.addPrice} onChange={v.onAddPrice} placeholder="" style={INP} /></label>
                        <label className="fl" style={LAB}>Billing period<select className="sel" style={{ width: "100%" }} value={v.addPeriod} onChange={v.onAddPeriod}>
                          <option>Monthly</option>
                          <option>Yearly</option>
                          <option>One-off</option>
                        </select></label>
                        <label className="fl" style={LAB}>Starts<input className="inp" type="text" value={v.addStarts} onChange={v.onAddStarts} placeholder="" style={INP} /></label>
                      </div>
                      <label style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}><input type="checkbox" checked={v.addProrate} onChange={v.onAddProrate} style={CHK} />{v.proText}</label>
                      {" "}
                      <label style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}><input type="checkbox" checked={v.addTell} onChange={v.onAddTell} style={CHK} />Tell the owner in the admin and by SMS</label>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button className="btn btnp" type="button" onClick={v.submitAdd} style={BTN}><Plus />Add to next invoice</button>
                        <span style={{ alignSelf: "center", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Custom prices over 20% off list need a second approval.</span>
                      </div>
                    </section>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Invoices and payments</h2>
                        <div style={PSIDE}>
                          <__Link href={"/invoices?store=" + m.shop.id} className="rowlink">All invoices →</__Link>
                        </div>
                      </div>
                      <div style={{ margin: "0 -20px -16px" }}>
                        <div className="th" style={{ display: "grid", gridTemplateColumns: "140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", ...TH }}>
                          <span>Number</span>
                          <span>Period</span>
                          <span style={{ textAlign: "right" }}>Amount</span>
                          <span>Status</span>
                          <span>Paid via</span>
                          <span>Recorded by</span>
                        </div>
                        {b.invoices.length ? b.invoices.map((r, i) => (
                          <div key={r.key} style={row("140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", i === 0)}>
                            <__Link href={r.id.startsWith("INV") || r.id.startsWith("CN") ? "/invoices?id=" + r.id : "/adjustments?id=" + r.id} className="mono" style={CELLB}>{r.id}</__Link>
                            <span style={CELL}>{r.period}</span>
                            <span className="num" style={{ ...CELLB, color: r.amountColor, textAlign: "right" }}>{r.amount}</span>
                            <span className={r.cls} style={{ justifySelf: "start" }}>{r.status}</span>
                            <span style={CELL}>{r.via}</span>
                            <span style={CELL}>{r.by}</span>
                          </div>
                        )) : <div style={{ padding: "14px 18px", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No bills yet.</div>}
                      </div>
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Collection calls</h2>
                        <div style={PSIDE}>
                          <__Link href="/collections" className="rowlink">Collections →</__Link>
                        </div>
                      </div>
                      {b.calls.length ? b.calls.map((cl, i) => (
                        <div key={cl.id} style={{ display: "flex", gap: "10px", minHeight: "40px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "0" }}>
                          <span style={{ display: "inline-flex", color: "var(--muted)" }}><Phone s={15} /></span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)", width: "92px", flex: "none" }}>{cl.at}</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>{cl.text}</span>
                          <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)", flex: "none" }}>{cl.by}</span>
                        </div>
                      )) : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No calls logged.</div>}
                    </section>
                  </div>
                </div>
              ) : null}
              {v.is_modules ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-in" style={{ height: "18px", padding: "0 8px" }} />In plan</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-add" style={{ height: "18px", padding: "0 8px" }} />Billed separately</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-trial" style={{ height: "18px", padding: "0 8px" }} />{m.modules.trialLegend}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-lock" style={{ height: "18px", padding: "0 8px" }} />Locked</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-off" style={{ height: "18px", padding: "0 8px" }} />Not in this segment</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Modules the store has</h2>
                        <div style={PSIDE}>{catalogue.MODULES.length} modules</div>
                      </div>
                      {m.modules.sets.map((st) => (
                        <div key={st.id} style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                          <div>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{st.label}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{st.sub}</div>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {st.mods.map((md) => <span key={md.code} className={md.cls} title={md.title}><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>{md.code}</span>{md.label}{md.lock ? <Lock /> : null}</span>)}
                          </div>
                        </div>
                      ))}
                    </section>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <section className="panel" style={PANEL}>
                        <div style={PHEAD}>
                          <h2 style={H2}>Give a module trial</h2>
                          <div style={PSIDE} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <label className="fl" style={LAB}>Module<select className="sel" style={{ width: "100%" }} value={v.trialCode} onChange={v.onTrialCode}>
                            {m.modules.options.map((op) => <option key={op.code + op.label} value={op.code + "|" + op.label}>{op.label}</option>)}
                          </select></label>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
                            <label className="fl" style={LAB}>Length<select className="sel" style={{ width: "100%" }} value={v.trialLen} onChange={v.onTrialLen}>
                              <option>7 days</option>
                              <option>14 days</option>
                              <option>30 days</option>
                            </select></label>
                            <label className="fl" style={LAB}>Starts<select className="sel" style={{ width: "100%" }} value={v.trialStart} onChange={v.onTrialStart}>
                              <option>Now</option>
                              <option>Choose a date</option>
                            </select></label>
                          </div>
                          {v.trialStart === "Choose a date" ? <label className="fl" style={LAB}>Start date<input className="inp" type="text" value={v.trialDate} onChange={v.onTrialDate} style={INP} /></label> : null}
                          <label className="fl" style={LAB}>Reason<select className="sel" style={{ width: "100%" }} value={v.trialReason} onChange={v.onTrialReason}>
                            <option>Sales evaluation</option>
                            <option>Support goodwill</option>
                            <option>Upgrade offer</option>
                            <option>Beta programme</option>
                          </select></label>
                          <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>
                            <input type="checkbox" checked={v.trialAuto} onChange={v.onTrialAuto} style={{ ...CHK, marginTop: "2px" }} />
                            <span>{v.trialAutoText}</span>
                          </label>
                          <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}><input type="checkbox" checked={v.trialTell} onChange={v.onTrialTell} style={CHK} />Tell the owner in the admin and by SMS</label>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="btn btnp" type="button" onClick={v.submitTrial} style={BTN}>Start trial</button>
                            <span style={{ alignSelf: "center", fontSize: "var(--text-xs)", color: "var(--muted)" }}>One trial per module per store. The data stays if it ends.</span>
                          </div>
                        </div>
                      </section>
                      <section className="panel" style={PANEL}>
                        <div style={PHEAD}>
                          <h2 style={H2}>Locked features tried, 30 days</h2>
                          <div style={PSIDE} />
                        </div>
                        {m.modules.locked.length ? m.modules.locked.map((x) => (
                          <div key={x.key} style={{ display: "grid", gridTemplateColumns: "140px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>{x.name}</span>
                            <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                              <span style={{ display: "block", width: x.width, height: "100%", borderRadius: "var(--radius-sm)", background: x.color }} />
                            </span>
                            <span className="num" style={{ ...CELLB, textAlign: "right" }}>{x.n} click{x.n === 1 ? "" : "s"}</span>
                          </div>
                        )) : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Nothing locked: the plan includes every set.</div>}
                      </section>
                    </div>
                  </div>
                  <section className="panel" style={PANEL}>
                    <div style={PHEAD}>
                      <h2 style={H2}>Trial history</h2>
                      <div style={PSIDE} />
                    </div>
                    <div style={{ margin: "0 -20px -16px" }}>
                      <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.2fr) minmax(0,1.2fr) 190px minmax(0,1fr)", ...TH }}>
                        <span>Module</span>
                        <span>Trial</span>
                        <span>Use during trial</span>
                        <span>Result</span>
                        <span>Given by</span>
                      </div>
                      {m.modules.history.length ? m.modules.history.map((x, i) => (
                        <div key={x.id} style={row("minmax(0,1.3fr) minmax(0,1.2fr) minmax(0,1.2fr) 190px minmax(0,1fr)", i === 0)}>
                          <span style={CELLB}>{x.name}</span>
                          <span style={CELL}>{x.trial}</span>
                          <span style={CELL}>{x.use}</span>
                          <span className={x.cls} style={{ justifySelf: "start" }}>{x.shp ? <span className={x.shp} aria-hidden="true" /> : null}{x.result}</span>
                          <span style={CELL}>{x.by}</span>
                        </div>
                      )) : <div style={{ padding: "14px 18px", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No module trials yet.</div>}
                    </div>
                  </section>
                </div>
              ) : null}
              {v.is_onboarding ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <section className="panel" style={PANEL}>
                    <div style={PHEAD}>
                      <h2 style={H2}>How the store came to GridCommerce</h2>
                      <div style={PSIDE}>
                        <button className="btn btng" type="button" onClick={v.toggleEditSrc} style={BTN}>{v.editSrc ? "Done" : "Edit attribution"}</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                      {m.onboarding.sources.map((x) => v.editSrc
                        ? <button key={x.label} type="button" className={x.on ? "src on" : "src"} onClick={() => v.pickSrc(x.label)} aria-pressed={x.on ? "true" : "false"} style={{ cursor: "pointer", font: "inherit" }}>{x.label}</button>
                        : <span key={x.label} className={x.on ? "src on" : "src"}>{x.label}</span>)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "14px" }}>
                      {[["Onboarded by", m.onboarding.by, m.onboarding.by.team], ["Onboarding helper", m.onboarding.helper, m.onboarding.helper.note]].map(([lab, p, note]) => (
                        <div key={lab} style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                          <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>{lab}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <span className="av" style={{ width: "28px", height: "28px", background: p.color }} title={p.ini}>{p.ini}</span>
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{p.name}</span>
                          </div>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)", marginTop: "4px" }}>{note}</div>
                        </div>
                      ))}
                      {[["Campaign", m.onboarding.campaign], ["Onboarding method", m.onboarding.method]].map(([lab, x]) => (
                        <div key={lab} style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                          <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>{lab}</div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)", marginTop: "6px" }}>{x.name}</div>
                          <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)", marginTop: "4px" }}>{x.sub}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>{m.onboarding.stepsTitle}</h2>
                        <div style={PSIDE} />
                      </div>
                      {m.onboarding.steps.map((x, i) => (
                        <div key={x.key} style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: i ? "1px solid var(--line)" : "0" }}>
                          <span className={x.cls} style={{ width: "18px", height: "18px" }} />
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>{x.label}</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>{x.date}</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>{x.who}</span>
                        </div>
                      ))}
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Onboarding sessions</h2>
                        <div style={PSIDE}>
                          <button className="btn btng" type="button" onClick={v.sessOpen ? v.closeSess : v.openSess} style={BTN}><Plus />Log a session</button>
                        </div>
                      </div>
                      {v.sessOpen ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 0" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <select className="sel" value={v.sessKind} onChange={v.onSessKind} aria-label="Session type"><option>In person</option><option>Video call</option><option>Phone</option></select>
                            <input className="inp" value={v.sessMin} onChange={v.onSessMin} aria-label="Minutes" inputMode="numeric" style={{ height: "40px", width: "90px" }} />
                            <span style={{ alignSelf: "center", fontSize: "var(--text-xs)", color: "var(--muted)" }}>min</span>
                          </div>
                          <textarea className="inp" rows={2} value={v.sessNote} onChange={v.onSessNote} placeholder="What was done?" aria-label="What was done" style={{ height: "auto", padding: "8px 10px", fontSize: "var(--text-xs-plus)" }} />
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button className="btn btng" type="button" onClick={v.closeSess} style={SMB}>Cancel</button>
                            <button className="btn btnp" type="button" onClick={v.saveSess} style={SMB}>Save session</button>
                          </div>
                        </div>
                      ) : null}
                      {m.onboarding.sessions.map((x, i) => (
                        <div key={x.key} style={{ padding: "10px 0", borderTop: i || v.sessOpen ? "1px solid var(--line)" : "0" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                            <span style={CELLB}>{x.title}</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{x.when}</span>
                          </div>
                          <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--body)" }}>{x.text}</div>
                        </div>
                      ))}
                    </section>
                  </div>
                </div>
              ) : null}
              {v.is_support ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                    {m.support.kpis.map((k) => <Kpi key={k.label} k={k} />)}
                  </div>
                  <section className="panel" style={PANEL}>
                    <div style={PHEAD}>
                      <h2 style={H2}>Tickets</h2>
                      <div style={PSIDE}>
                        <__Link href="/support-desk" className="rowlink">Open in support desk →</__Link>
                      </div>
                    </div>
                    <div style={{ margin: "0 -20px -16px" }}>
                      <div className="th" style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1.8fr) 90px 220px 70px", ...TH }}>
                        <span>Ticket</span>
                        <span>Subject</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span>Opened</span>
                      </div>
                      {m.support.tickets.length ? m.support.tickets.map((x, i) => (
                        <div key={x.id} style={{ ...row("90px minmax(0,1.8fr) 90px 220px 70px", i === 0), background: x.open ? "#fff8e6" : undefined }}>
                          <span className="mono" style={CELLB}>{x.id}</span>
                          <span style={CELLB}>{x.subject}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}><span className={x.shp} />{x.pr}</span>
                          <span className={x.cls} style={{ justifySelf: "start" }}>{x.status}</span>
                          <span style={CELL}>{x.opened}</span>
                        </div>
                      )) : <div style={{ padding: "14px 18px", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No tickets in 90 days.</div>}
                    </div>
                  </section>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Sign-in and access</h2>
                        <div style={PSIDE}>
                          <button className="btn btng" type="button" onClick={v.sendReset} style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}>Send reset link</button>
                        </div>
                      </div>
                      {m.support.access.map((x, i) => (
                        <div key={x.key} style={{ display: "grid", gridTemplateColumns: "130px minmax(0,1fr) 110px", gap: "10px", alignItems: "center", minHeight: "42px", borderTop: i ? "1px solid var(--line)" : "0" }}>
                          <span className="num" style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{x.when}</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>{x.text}</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "right" }}>{x.by}</span>
                        </div>
                      ))}
                    </section>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Before you call</h2>
                        <div style={PSIDE} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--ink)" }}>
                        {m.support.before.map((x) => <div key={x} style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface2)" }}>{x}</div>)}
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}
              {v.is_affiliates ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={PANEL}>
                      <div style={PHEAD}>
                        <h2 style={H2}>Referral partner with GridCommerce</h2>
                        <div style={PSIDE}>10% of each referred store's payments for 12 months · bKash payout</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Referral link</div>
                          <div className="mono" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>{m.affiliates.link}</div>
                        </div>
                        <button className="btn btng" type="button" onClick={v.copyLink} style={{ marginLeft: "auto", minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="9" y="9" width="13" height="13" rx="2" />
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
</svg>Copy</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "10px", margin: "12px 0" }}>
                        {[["Stores referred", m.affiliates.stats.referred], ["Now paying", m.affiliates.stats.paying], ["Earned", m.affiliates.stats.earned], ["Paid out", m.affiliates.stats.paidOut]].map(([lab, val]) => (
                          <div key={lab}>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>{lab}</div>
                            <div className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>{val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ margin: "0 -20px -16px" }}>
                        <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 110px minmax(0,1fr) 90px", ...TH }}>
                          <span>Store referred</span>
                          <span>Signed up</span>
                          <span>Status</span>
                          <span style={{ textAlign: "right" }}>Commission</span>
                        </div>
                        {m.affiliates.referred.length ? m.affiliates.referred.map((x, i) => (
                          <div key={x.key} style={row("minmax(0,1.4fr) 110px minmax(0,1fr) 90px", i === 0)}>
                            <__Link href={"/merchant-detail?id=" + x.id} style={CELLB}>{x.name}</__Link>
                            <span style={CELL}>{x.signed}</span>
                            <span className={x.cls} style={{ justifySelf: "start" }}>{x.status}</span>
                            <span className="num" style={{ ...CELLB, textAlign: "right" }}>{x.commission}</span>
                          </div>
                        )) : <div style={{ padding: "14px 18px", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No stores referred yet.</div>}
                      </div>
                    </section>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <section className="panel" style={PANEL}>
                        <div style={PHEAD}>
                          <h2 style={H2}>The store's own affiliate programme</h2>
                          <div style={PSIDE}>৳ thousand of sales through affiliates</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "12px" }}>
                          <Kpi k={{ label: "Active affiliates", value: String(m.affiliates.own.active), note: m.affiliates.own.activeNote, cls: "dpill d-good" }} />
                          <Kpi k={{ label: m.affiliates.own.salesLabel, value: m.affiliates.own.sales, note: m.affiliates.own.salesNote, cls: "dpill d-good" }} />
                          <Kpi k={{ label: "Commission it owes", value: m.affiliates.own.owes, note: "pays on the 5th", cls: "dpill d-flat" }} />
                        </div>
                        <div style={{ marginTop: "12px" }}>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "158px" }}>
                            {m.affiliates.own.bars.map((x) => (
                              <div key={x.key} style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                                <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{x.v}</span>
                                <span style={{ width: "70%", maxWidth: "44px", height: x.h, borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}>{x.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                      <section className="panel" style={PANEL}>
                        <div style={PHEAD}>
                          <h2 style={H2}>Top affiliates</h2>
                          <div style={PSIDE} />
                        </div>
                        {m.affiliates.top.map((x, i) => (
                          <div key={x.key} style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: i ? "1px solid var(--line)" : "0" }}>
                            <span style={CELLB}>{x.name}</span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{x.where}</span>
                            <span className="num" style={{ marginLeft: "auto", ...CELLB }}>{x.amt}</span>
                          </div>
                        ))}
                      </section>
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>{m.affiliates.referredBy}</div>
                </div>
              ) : null}
              {v.is_activity ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {v.filters.map((f) => <button key={f.k} className={f.cls} type="button" aria-pressed={f.pressed} onClick={f.pick}>{f.label}</button>)}
                    </div>
                    <span style={{ marginLeft: "auto" }}>
                      <__Link href="/audit-log" className="btn btng" style={BTN}>Full audit log</__Link>
                    </span>
                  </div>
                  <section className="panel" style={PANEL}>
                    {v.activity.length ? v.activity.map((a, i) => (
                      <div key={a.key} style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: i ? "1px solid var(--line)" : "0" }}>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>{a.when}</span>
                        <span className={a.cls} style={{ justifySelf: "start" }}>{a.label}</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>{a.text}</span>
                      </div>
                    )) : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Nothing here yet.</div>}
                  </section>
                </div>
              ) : null}
            </div>
          </main>
          <ConsoleToast text={v.toast} tone={v.toastTone} onClose={v.hideToast} />
        </div>
      </div>
    );
  }
}
