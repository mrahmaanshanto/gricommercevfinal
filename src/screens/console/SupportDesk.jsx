'use client';
// Generated from design/templates/console/SupportDesk.dc.html by scripts/convert-design.mjs.
// Support · tickets
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

const TICKETS = [{"id": "T-2291", "subj": "Steadfast parcels not syncing since this morning", "bn": false, "store": "Dhaka Gadget Hub", "tid": "0031", "ch": "WhatsApp", "pri": "Urgent", "pk": "err", "sla": "Reply overdue 25 min", "slat": "p-err", "who": "FA", "tags": ["Courier", "Incident INC-114"], "queue": "mine", "health": "54", "hband": "Watch", "hk": "warn", "plan": "Retail · Business", "state": "Grace · day 3", "sk": "warn", "integ": [["Steadfast", "err", "Failing since 09:40"], ["Pathao", "ok", "Healthy"], ["bKash", "ok", "Healthy"]], "past": "4 tickets in 90 days", "link": "Linked to INC-114 · Steadfast webhook delays, 38 stores affected", "msgs": [["merchant", "Arif Hossain · owner", "09:52", "Since morning none of my Steadfast bookings show a tracking number. 23 orders are stuck at 'Ready to ship'. Customers are calling."], ["system", "", "09:58", "Auto-linked to incident INC-114 · Steadfast webhook delays"], ["note", "Farhana Akter · internal", "10:05", "Same pattern as INC-114. Engineering is replaying webhooks from 09:40. Do not ask the merchant to rebook."], ["staff", "Farhana Akter", "10:07", "Arif bhai, this is a Steadfast delay affecting several stores, not your setup. Your 23 bookings are safe and will get tracking numbers as soon as the replay finishes. I will update you by 11:00."]]}, {"id": "T-2290", "subj": "bKash shows paid but the order is still unpaid", "bn": false, "store": "Rongdhonu Fashion", "tid": "0007", "ch": "In-app", "pri": "High", "pk": "warn", "sla": "Reply due in 12 min", "slat": "p-warn", "who": "FA", "tags": ["Payments"], "queue": "mine", "health": "86", "hband": "Healthy", "hk": "ok", "plan": "Online · Business", "state": "Active", "sk": "ok", "integ": [["bKash", "warn", "3 callbacks late"], ["Pathao", "ok", "Healthy"], ["Meta CAPI", "ok", "Healthy"]], "past": "1 ticket in 90 days", "link": "", "msgs": [["merchant", "Nusrat Jahan · manager", "13:58", "Order #RF-10442 shows bKash payment successful on the customer's phone (TrxID 8KJ21M0QX) but our admin still says unpaid."], ["system", "", "14:01", "Payment lookup: bKash confirms TrxID 8KJ21M0QX, ৳2,340, 13:41. Callback not received."]]}, {"id": "T-2288", "subj": "ডোমেইন কানেক্ট হচ্ছে না, দুই দিন হয়ে গেল", "bn": true, "store": "Kolpo Books", "tid": "0061", "ch": "WhatsApp", "pri": "Normal", "pk": "none", "sla": "Reply due in 1 h 40 min", "slat": "p-grey", "who": "TS", "tags": ["Domain", "Trial"], "queue": "mine", "health": "72", "hband": "Watch", "hk": "warn", "plan": "Online · Growth · trial", "state": "Trial · day 12 of 15", "sk": "none", "integ": [["Domain", "err", "DNS record missing"], ["Pathao", "ok", "Healthy"], ["Nagad", "ok", "Healthy"]], "past": "First ticket", "link": "Trial ends in 3 days · lead owner Tania S. in Sales CRM", "msgs": [["merchant", "Sadia Islam · owner", "11:20", "আমি kolpobooks.com.bd কানেক্ট করতে চাই কিন্তু দুই দিন ধরে 'Pending' দেখাচ্ছে। কী করব?"], ["system", "", "11:21", "Domain check: A record points to the old host (103.x.x.x). CNAME for www is missing."]]}, {"id": "T-2285", "subj": "Need the August invoice with VAT shown", "bn": false, "store": "Mohona Traders", "tid": "0012", "ch": "Email", "pri": "Low", "pk": "ok", "sla": "Reply due in 6 h", "slat": "p-grey", "who": "MK", "tags": ["Billing"], "queue": "all", "health": "90", "hband": "Healthy", "hk": "ok", "plan": "Wholesale · Enterprise", "state": "Active", "sk": "ok", "integ": [["Pathao", "ok", "Healthy"], ["SSLCommerz", "ok", "Healthy"], ["SMS", "ok", "Healthy"]], "past": "2 tickets in 90 days", "link": "", "msgs": [["merchant", "Kamrul Hasan · accounts", "Yesterday", "Please send the August subscription invoice with VAT shown separately. Our auditor needs it by Thursday."]]}, {"id": "T-2284", "subj": "How do I add a second warehouse?", "bn": false, "store": "Shonali Crafts", "tid": "0017", "ch": "In-app", "pri": "Normal", "pk": "none", "sla": "Reply due in 3 h", "slat": "p-grey", "who": "", "tags": ["How-to", "Upgrade interest"], "queue": "unassigned", "health": "78", "hband": "Healthy", "hk": "ok", "plan": "Online · Retail · Growth", "state": "Active", "sk": "ok", "integ": [["Pathao", "ok", "Healthy"], ["bKash", "ok", "Healthy"], ["SMS", "ok", "Healthy"]], "past": "3 tickets in 90 days", "link": "Warehouses need the Enterprise plan · sent to Sales CRM as an upgrade lead", "msgs": [["merchant", "Rumana Akter · owner", "12:40", "We opened a second godown in Chattogram. How do I add it so stock is kept separately?"], ["system", "", "12:41", "Warehouses (M05) are not in this store's plan. Upgrade interest flagged for Sales."]]}, {"id": "T-2281", "subj": "Staff can't sign in after the 2FA change", "bn": false, "store": "Bindu Beauty", "tid": "0044", "ch": "Phone", "pri": "High", "pk": "warn", "sla": "Waiting on merchant · 2 h", "slat": "p-sky", "who": "RH", "tags": ["Access"], "queue": "waiting", "health": "33", "hband": "At risk", "hk": "err", "plan": "Online · Business", "state": "Past due · read-only", "sk": "err", "integ": [["Pathao", "ok", "Healthy"], ["bKash", "ok", "Healthy"], ["Meta CAPI", "warn", "Delayed events"]], "past": "6 tickets in 90 days", "link": "Store is read-only for an unpaid invoice; sign-in works, edits do not", "msgs": [["merchant", "Call log · 11:05", "11:05", "Owner called: two staff members cannot save orders after enabling two-factor sign-in."], ["staff", "Rakib Hasan", "11:18", "Sign-in is working. The store is read-only because the September invoice is unpaid. Pay from Billing in your admin, or I can take it on a call; editing comes back straight away."]]}];
const QUEUES = [["mine", "Mine", 3], ["unassigned", "Unassigned", 4], ["breaching", "Breaching SLA", 2], ["waiting", "Waiting on merchant", 9], ["all", "All open", 38]];
const SHP = { ok: 'shp shp-ok', warn: 'shp shp-warn', err: 'shp shp-err', none: 'shp shp-none' };
const PILL = { ok: 'pill p-ok', warn: 'pill p-warn', err: 'pill p-err', none: 'pill p-grey' };
const RING = { ok: '#10b981', warn: '#ff9800', err: '#ff5724', none: '#94a3b8' };
class Component extends DCLogic {
  renderVals() {
    const v = this.renderVals0() || {};
    const mini = !!(this.state || {}).mini;
    v.miniCls = mini ? 'mini' : '';
    if (typeof v.rootCls === 'string') v.rootCls = v.rootCls + (mini ? ' mini' : '');
    v.toggleSide = () => this.setState({ mini: !mini });
    v.sideLabel = mini ? 'Expand menu' : 'Collapse menu';
    return v;
  }

  renderVals0() {
    const s = this.state || {};
    const q = s.q ?? 'mine';
    const mode = s.mode ?? 'reply';
    const list = TICKETS.filter((t) => q === 'all' || t.queue === q || (q === 'breaching' && t.slat === 'p-err') || (q === 'unassigned' && !t.who));
    const shown = list.length ? list : TICKETS;
    const selId = shown.some((t) => t.id === s.sel) ? s.sel : shown[0].id;
    const t0 = TICKETS.find((t) => t.id === selId);
    const C = 2 * Math.PI * 22;
    const cur = Object.assign({}, t0, {
      subjCls: t0.bn ? 'bn' : '',
      slaCls: 'pill ' + t0.slat,
      initials: t0.store.split(' ').map((w) => w[0]).slice(0, 2).join(''),
      tagList: t0.tags.map((x) => ({ t: x })),
      statePill: PILL[t0.sk], stateShp: SHP[t0.sk], healthShp: SHP[t0.hk],
      ringColor: RING[t0.hk], dash: (C * t0.health / 100).toFixed(1) + ' ' + C.toFixed(1),
      integList: t0.integ.map(([name, k, text]) => ({ name, text, shp: SHP[k] })),
      hasLink: !!t0.link,
      msgList: t0.msgs.map(([role, who, time, text]) => ({
        who: role === 'system' ? 'GridCommerce' : who, time, text,
        cls: 'msg m-' + role + (/[\u0980-\u09FF]/.test(text) ? ' bn' : ''),
        wrap: role === 'staff' ? 'w-staff' : '',
        metaCls: role === 'staff' ? 'meta-r' : '',
      })),
    });
    return {
      queues: QUEUES.map(([id, label, count]) => ({ label, count, cls: id === q ? 'tab on' : 'tab', sel: id === q ? 'true' : 'false', pick: () => this.setState({ q: id }) })),
      tickets: shown.map((t) => ({
        id: t.id, subj: t.subj, store: t.store, ch: t.ch, pri: t.pri, sla: t.sla,
        subjCls: t.bn ? 'bn' : '', slaCls: 'pill ' + t.slat, shp: SHP[t.pk],
        cls: t.id === selId ? 'tk on' : 'tk', current: t.id === selId ? 'true' : 'false',
        pick: () => this.setState({ sel: t.id }),
      })),
      cur,
      replyCls: mode === 'reply' ? 'mode on' : 'mode',
      noteCls: mode === 'note' ? 'mode on' : 'mode',
      setReply: () => this.setState({ mode: 'reply' }),
      setNote: () => this.setState({ mode: 'note' }),
      placeholder: mode === 'reply' ? 'Write to ' + t0.store + '…' : 'Only staff see internal notes. Mention a colleague with @',
      composerBorder: mode === 'reply' ? 'var(--line)' : '#f5c26b',
      composerBg: mode === 'reply' ? 'var(--surface)' : '#fff8e6',
      sendLabel: mode === 'reply' ? 'Send and set waiting on merchant' : 'Add note',
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:10px;border:0;font:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:6px;background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

.cs{--bg:#eef2f7;--surface:#ffffff;--surface2:#f4f7fb;--line:#e2e8f0;--ink:#0f172a;--body:#475569;--muted:#64748b;--rail:#012169;--railink:#b7c6e0;--railicon:#7d94bf;--railhead:#7fd4f5;--railon:rgba(127,212,245,.16);--railhover:rgba(255,255,255,.06);--primary:#003087;--primaryhover:#002a77;--primaryink:#ffffff;--okbg:#e7f8f1;--okt:#047857;--warnbg:#fff4e0;--warnt:#b45309;--errbg:#ffece5;--errt:#c2410c;--track:#eef2f7;--series:#003087;--seriesfill:rgba(0,48,135,.08);--scrim:rgba(1,20,60,.36);--shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.cs.dark{--bg:#0a1020;--surface:#111a2e;--surface2:#16213a;--line:#24324f;--ink:#e8eef8;--body:#aebbd2;--muted:#8a9bb8;--rail:#060b17;--railink:#a7b6d0;--railicon:#6c80a5;--railhead:#66c4eb;--railon:rgba(0,156,222,.18);--railhover:rgba(255,255,255,.05);--primary:#009cde;--primaryhover:#2eaee4;--primaryink:#04121f;--okbg:rgba(16,185,129,.14);--okt:#4ade9f;--warnbg:rgba(255,152,0,.14);--warnt:#fbbf24;--errbg:rgba(255,87,36,.16);--errt:#ff8a65;--track:#1d2944;--series:#66c4eb;--seriesfill:rgba(102,196,235,.10);--scrim:rgba(0,0,0,.55);--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -10px rgba(0,0,0,.5)}
.cs{color:var(--body)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:transparent;color:var(--railink);font:inherit;font-size:14px;font-weight:500;text-align:left;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--railhover);color:#fff}
.nav.on{background:var(--railon);color:#fff}
.nav.sub{min-height:40px;padding-left:42px;font-size:13.5px}
.nav:focus-visible{outline:3px solid rgba(127,212,245,.6);outline-offset:-3px}
.chev{display:inline-flex;margin-left:auto;color:var(--railicon);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:999px;font-size:11px;font-weight:600;background:rgba(255,255,255,.12);color:#fff}
.badge.warn{background:#ff9800;color:#1a1204}.badge.err{background:#ff5724;color:#1c0a04}
.tb{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:10px;background:transparent;color:var(--body);cursor:pointer;transition:background-color 150ms ease}
.tb:hover{background:var(--surface2)}
.seg{display:inline-flex;padding:3px;border-radius:10px;background:var(--surface2);border:1px solid var(--line)}
.segb{min-height:36px;padding:0 14px;border:0;border-radius:8px;background:transparent;color:var(--body);font:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.segb.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.panel{background:var(--surface);border-radius:14px;box-shadow:var(--shadow)}
.sp{transition:d 200ms cubic-bezier(.23,1,.32,1)}
.searchbtn{display:flex;align-items:center;gap:10px;width:440px;height:44px;padding:0 10px 0 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);font:inherit;font-size:14px;cursor:pointer;text-align:left}
.searchbtn:hover{border-color:var(--muted)}
.kbd{margin-left:auto;display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:6px;border:1px solid var(--line);background:var(--surface2);font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--body)}
.pr{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:transparent;font:inherit;font-size:14px;color:var(--ink);text-align:left;cursor:pointer}
.pr:hover,.pr.on{background:var(--surface2)}
.rowlink{color:var(--primary);font-size:13px;font-weight:600}
.rowlink:hover{color:var(--primaryhover)}
.btnp{background:var(--primary);color:var(--primaryink)}.btnp:hover{background:var(--primaryhover);color:var(--primaryink)}
.btng{background:var(--surface2);color:var(--ink);border:1px solid var(--line)}.btng:hover{border-color:var(--muted)}
.tone-good{color:var(--okt)}.tone-bad{color:var(--errt)}.tone-flat{color:var(--muted)}
@media (prefers-reduced-motion: reduce){.chev,.sp,.segb,.tb{transition:none}}

.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.shp{display:inline-block;flex:none;width:10px;height:10px}
.shp-ok{border-radius:50%;background:#10b981}
.shp-warn{background:#ff9800;clip-path:polygon(50% 0,100% 100%,0 100%)}
.shp-err{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.shp-none{border:2px solid #94a3b8;border-radius:50%}
.shp-hot{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.pill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:999px;font-size:11.5px;font-weight:600;white-space:nowrap}
.p-navy{background:#e0e6f1;color:#003087}.p-sky{background:#e0f3fb;color:#00567a}.p-grey{background:#f1f5f9;color:#475569}
.p-ok{background:#e7f8f1;color:#047857}.p-warn{background:#fff4e0;color:#b45309}.p-err{background:#ffece5;color:#c2410c}
.av{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border-radius:999px;font-size:11px;font-weight:700;color:#fff}
.tab{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;border:0;border-bottom:2px solid transparent;background:transparent;font:inherit;font-size:13.5px;font-weight:500;color:var(--body);cursor:pointer}
.tab.on{border-bottom-color:var(--primary);color:var(--primary);font-weight:600}
.cnt{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-size:11px;font-weight:600;color:var(--body)}
.tab.on .cnt{background:#003087;border-color:#003087;color:#fff}
.tk{display:flex;flex-direction:column;gap:6px;width:100%;padding:12px 14px;border:0;border-left:3px solid transparent;border-bottom:1px solid var(--line);background:transparent;font:inherit;text-align:left;cursor:pointer;transition:background-color 150ms ease}
.tk:hover{background:var(--surface2)}
.tk.on{background:#f2f5f9;border-left-color:#003087}
.msg{max-width:560px;padding:12px 14px;border-radius:14px;font-size:13.5px;line-height:1.6}
.m-merchant{align-self:flex-start;background:var(--surface2);color:var(--ink);border-top-left-radius:4px}
.m-staff{align-self:flex-end;background:#003087;color:#fff;border-top-right-radius:4px}
.m-note{align-self:stretch;max-width:none;background:#fff8e6;color:#5c3303;border:1px dashed #f5c26b}
.m-system{align-self:center;max-width:none;padding:6px 12px;border-radius:999px;background:transparent;color:var(--muted);font-size:12px}
.mode{min-height:36px;padding:0 12px;border:0;border-radius:8px;background:transparent;font:inherit;font-size:13px;font-weight:500;color:var(--body);cursor:pointer}
.mode.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.lc{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:#fff;border:1px solid #e6ebf2;color:inherit;transition:border-color 150ms ease,box-shadow 150ms ease}
.lc:hover{border-color:#99accf;box-shadow:0 8px 20px -14px rgba(15,23,42,.35);color:inherit}
.dot{display:inline-block;width:18px;height:18px;border-radius:6px}
.d-done{background:#003087}
.d-todo{border:2px dashed #cbd5e1}
.d-stuck{background:#fff4e0;border:2px solid #ff9800}
.fchip{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:999px;background:var(--surface);font:inherit;font-size:13px;font-weight:500;color:var(--body);cursor:pointer}
.fchip.on{background:#003087;border-color:#003087;color:#fff}
.radio{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font:inherit;text-align:left;cursor:pointer;width:100%}
.radio.on{border-color:#003087;background:#f2f5f9;box-shadow:0 0 0 1px #003087}
.rdot{flex:none;width:18px;height:18px;margin-top:2px;border-radius:999px;border:2px solid #94a3b8}
.radio.on .rdot{border:6px solid #003087}
select.sel{height:40px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);font:inherit;font-size:13px;color:var(--ink)}
@media (prefers-reduced-motion: reduce){.tk,.lc{transition:none}}
.w-staff{align-items:flex-end}.meta-r{text-align:right}

.cs{--bg:#f3f6fb;--side:#ffffff;--sideline:#e6ebf3;--sideink:#0f172a;--sidebody:#475569;--sidemuted:#64748b;--sidehover:#f4f7fb;--sideon:#eaf1ff;--sideonink:#003087;--iconbg:#eef3fb;--iconfg:#2e559d;--iconon:linear-gradient(145deg,#1f6fe0 0%,#003087 100%);--guide:#e2e8f0;--topbar:rgba(255,255,255,.86);--card:#ffffff;--cardline:#e8edf5}
.cs.dark{--bg:#0a1020;--side:#0c1426;--sideline:#1c2842;--sideink:#e8eef8;--sidebody:#aebbd2;--sidemuted:#8a9bb8;--sidehover:rgba(255,255,255,.04);--sideon:rgba(0,156,222,.16);--sideonink:#7fd4f5;--iconbg:rgba(255,255,255,.06);--iconfg:#9fb3d6;--iconon:linear-gradient(145deg,#2eaee4 0%,#0070a0 100%);--guide:#24324f;--topbar:rgba(17,26,46,.86);--card:#111a2e;--cardline:#22304d}
.side{position:absolute;left:0;top:0;bottom:0;width:272px;display:flex;flex-direction:column;background:var(--side);border-right:1px solid var(--sideline)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--sidebody);font:inherit;font-size:14px;font-weight:500;text-align:left;text-decoration:none;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--sidehover);color:var(--sideink)}
.nav:active{transform:scale(.99)}
.nav:focus-visible{outline:3px solid rgba(0,48,135,.35);outline-offset:-2px}
.navic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:var(--iconbg);color:var(--iconfg);transition:background-color 150ms ease,color 150ms ease}
.nav.grp.open{color:var(--sideink);font-weight:600}
.nav.grp.open .navic,.nav.top.on .navic{background:var(--iconon);color:#fff;box-shadow:0 6px 14px -6px rgba(0,48,135,.55)}
.nav.top.on{color:var(--sideink);font-weight:600;background:var(--sidehover)}
.kids{position:relative;display:grid;gap:2px;margin:2px 0 8px 0;padding-left:44px}
.kids:before{content:"";position:absolute;left:25px;top:4px;bottom:4px;width:1.5px;border-radius:2px;background:var(--guide)}
.nav.sub{position:relative;min-height:38px;padding:0 10px;font-size:13.5px;border-radius:10px}
.nav.sub.on{background:var(--sideon);color:var(--sideonink);font-weight:600}
.nav.sub.on:before{content:"";position:absolute;left:-20px;top:9px;bottom:9px;width:3px;border-radius:3px;background:#003087}
.cs.dark .nav.sub.on:before{background:#2eaee4}
.chev{display:inline-flex;margin-left:auto;color:var(--sidemuted);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 7px;border-radius:999px;font-size:11px;font-weight:700;background:#eef2f7;color:#475569}
.badge.warn{background:#fff1d6;color:#9a4a00}.badge.err{background:#ffe3d9;color:#b3340e}
.cs.dark .badge{background:rgba(255,255,255,.08);color:#cbd5e1}.cs.dark .badge.warn{background:rgba(255,152,0,.18);color:#fbbf24}.cs.dark .badge.err{background:rgba(255,87,36,.2);color:#ff8a65}
.topbar{position:absolute;left:272px;right:0;top:0;height:64px;display:flex;align-items:center;gap:12px;padding:0 24px 0 28px;background:var(--topbar);backdrop-filter:saturate(160%) blur(12px);-webkit-backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid var(--sideline);z-index:3}
.crumbic{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:var(--iconbg);color:var(--iconfg)}
.searchbtn{width:400px;height:40px;border-radius:12px;background:var(--surface2);border:1px solid transparent}
.searchbtn:hover{border-color:var(--line);background:var(--surface)}
.tb{width:40px;height:40px;border-radius:12px}
.panel{background:var(--card);border:1px solid var(--cardline);border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.kpi{position:relative;display:flex;flex-direction:column;gap:4px;padding:14px 16px 12px;border-radius:16px;background:var(--card);border:1px solid var(--cardline);box-shadow:0 1px 2px rgba(15,23,42,.04);overflow:hidden}
.dpill{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:600;white-space:nowrap}
.d-good{background:#e7f8f1;color:#047857}.d-bad{background:#ffece5;color:#c2410c}.d-flat{background:transparent;color:var(--muted);padding:0}
.th{background:#f8fafc;border-bottom:1px solid var(--line)}
.cs.dark .th{background:rgba(255,255,255,.03)}
.statuscard{margin:0 14px 10px;padding:12px 14px;border-radius:14px;background:linear-gradient(160deg,#f5f9ff 0%,#eef4fd 100%);border:1px solid #e1eaf7}
.cs.dark .statuscard{background:rgba(255,255,255,.04);border-color:var(--sideline)}
.me{display:flex;align-items:center;gap:10px;margin:0 14px 14px;padding:10px;border-radius:14px;border:1px solid var(--sideline)}
@media (prefers-reduced-motion: reduce){.nav,.navic,.chev{transition:none}.nav:active{transform:none}}

.sidein{display:flex;flex-direction:column;height:min(100%,900px);min-height:0}
.cs{overflow-wrap:break-word}
.cs [style*="display:grid"] > *{min-width:0}
.pill{white-space:normal;height:auto;min-height:24px;padding:3px 9px;line-height:1.3;max-width:100%}
.dpill{white-space:normal;height:auto;min-height:22px;padding:3px 8px;line-height:1.35;max-width:100%}
.d-flat{padding:0}
.kl{font-size:12.5px;font-weight:500;color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
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
.fcard{background:var(--card);border:1px solid var(--cardline);border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04);padding:4px 28px}
.fsec{display:grid;grid-template-columns:250px minmax(0,1fr);gap:32px;padding:24px 0}
.fsec + .fsec{border-top:1px solid var(--line)}
.fsh{font-size:15px;font-weight:600;color:var(--ink);margin:0}
.fsd{margin:6px 0 0;font-size:12.5px;line-height:1.55;color:var(--body)}
.fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.flab{font-size:13px;font-weight:600;color:var(--ink)}
.req{color:#c2410c;margin-left:2px}
.fhelp{font-size:12px;line-height:1.45;color:var(--muted)}
.ferr{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#c2410c}
.in{width:100%;height:44px;padding:0 12px;border:1px solid #d5dde8;border-radius:10px;background:var(--surface);font:inherit;font-size:14px;color:var(--ink)}
textarea.in{height:auto;padding:10px 12px;line-height:1.5;resize:vertical}
select.in{padding-right:8px}
.in:focus,.affix:focus-within{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.15)}
.in.err,.affix.err{border-color:#ff5724;box-shadow:0 0 0 3px rgba(255,87,36,.12)}
.in.ok{border-color:#10b981}
.in[disabled]{background:var(--surface2);color:var(--muted)}
.affix{display:flex;align-items:stretch;height:44px;border:1px solid #d5dde8;border-radius:10px;overflow:hidden;background:var(--surface)}
.affix > span{display:flex;align-items:center;flex:none;padding:0 12px;background:var(--surface2);color:var(--body);font-size:13px}
.affix > span.pre{border-right:1px solid #d5dde8}.affix > span.post{border-left:1px solid #d5dde8}
.affix input{flex:1;min-width:0;border:0;padding:0 12px;font:inherit;font-size:14px;background:transparent;color:var(--ink);outline:none}
.sw{position:relative;display:inline-flex;flex:none;width:40px;height:24px;border-radius:99px;background:#cbd5e1}
.sw:after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:99px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.sw.on{background:#003087}.sw.on:after{transform:translateX(16px)}
.swrow{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:12px 0}
.swrow + .swrow{border-top:1px solid var(--line)}
.rgrid{display:grid;gap:10px}
.rc{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid #d5dde8;border-radius:12px;background:var(--surface);min-width:0}
.rc.on{border-color:#003087;background:#f5f8ff;box-shadow:0 0 0 1px #003087}
.rc .rdot{margin-top:1px}
.rc.on .rdot{border:6px solid #003087}
.cb{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;border:2px solid #94a3b8;background:#fff}
.cb.on{background:#003087;border-color:#003087;color:#fff}
.cb.dis{background:var(--surface2);border-color:#cbd5e1}
.chk{display:flex;align-items:center;gap:10px;min-height:36px;font-size:13.5px;color:var(--ink);min-width:0}
.tagsel{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:999px;border:1px solid #d5dde8;font-size:13px;color:var(--body);background:var(--surface)}
.tagsel.on{background:#003087;border-color:#003087;color:#fff;font-weight:600}
.formbar{position:absolute;left:0;right:0;bottom:0;height:72px;display:flex;align-items:center;gap:10px;padding:0 28px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:3}
.note{padding:12px 14px;border-radius:12px;font-size:13px;line-height:1.55}
.n-info{background:#f2f5f9;color:var(--ink)}.n-warn{background:#fff4e0;color:#7a3e05}.n-err{background:#ffece5;color:#7c2d12}.n-ok{background:#e7f8f1;color:#065f46}
`;

// ---- markup ----

export default class SupportDeskScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="SupportDesk">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1000px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <aside className="side" aria-label="Console navigation">
            <div className="sidein">
              <div className="sidehead" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "18px 12px 6px 20px" }}>
                <span className="logo-full">
                  <img src="/assets/62dadbbb3f365aebdd41bb9975f5931f.png" alt="GridCommerce" style={{ height: "28px", width: "auto", display: "block" }} />
                </span>
                <img className="logo-mini" src="/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png" alt="GridCommerce" style={{ height: "32px", width: "auto" }} />
                <button className="tb sidetoggle" type="button" onClick={v.toggleSide} aria-label={v.sideLabel} title={v.sideLabel}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 3v18" />
                  </svg>
                </button>
              </div>
              <div className="sidemeta" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 20px 12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: "22px", padding: "0 8px", borderRadius: "6px", background: "var(--iconbg)", color: "var(--iconfg)", fontSize: "11px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase" }}>Console</span>
                <span className="ell" style={{ fontSize: "12px", color: "var(--sidemuted)" }}>Staff only · views logged</span>
              </div>
              <nav aria-label="Console" className="sidenav">
                <__Link href="/console-shell" className="nav top" title="Overview">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                    </svg>
                  </span>
                  <span className="navtxt">Overview</span>
                </__Link>
                <div className="navlabel" style={{ margin: "10px 10px 6px", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--sidemuted)" }}>Manage</div>
                <__Link href="/merchants" className="nav grp" title="Tenants" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 9 4.5 4h15L21 9" />
                      <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                      <path d="M5 12v9h14v-9" />
                    </svg>
                  </span>
                  <span className="navtxt">Tenants</span>
                  <span className="chev">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/module-catalogue" className="nav grp" title="Packaging" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
                      <path d="m3 7 9 5 9-5M12 12v10" />
                    </svg>
                  </span>
                  <span className="navtxt">Packaging</span>
                  <span className="chev">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/subscriptions" className="nav grp" title="Billing" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20M6 15h4" />
                    </svg>
                  </span>
                  <span className="navtxt">Billing</span>
                  <span className="badge warn">4</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/health-risk" className="nav grp" title="Monitoring" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 12h4l3-8 4 16 3-8h4" />
                    </svg>
                  </span>
                  <span className="navtxt">Monitoring</span>
                  <span className="badge warn">5</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/support-desk" className="nav grp open" title="Support" aria-expanded="true">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                      <path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h4M3 14v3a2 2 0 0 0 2 2h2v-7H3" />
                    </svg>
                  </span>
                  <span className="navtxt">Support</span>
                  <span className="chev open">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <div className="kids">
                  <__Link href="/support-desk" className="nav sub on" aria-current="page">
                    <span className="navtxt">Tickets</span>
                    <span className="badge ">12</span>
                  </__Link>
                  <__Link href="/store-access" className="nav sub">
                    <span className="navtxt">Store access · PIN</span>
                  </__Link>
                  <__Link href="/access-log" className="nav sub">
                    <span className="navtxt">Access log</span>
                  </__Link>
                  <__Link href="/support-performance" className="nav sub">
                    <span className="navtxt">Performance</span>
                  </__Link>
                </div>
                <__Link href="/leads" className="nav grp" title="Sales CRM" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
                    </svg>
                  </span>
                  <span className="navtxt">Sales CRM</span>
                  <span className="badge ">18</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/ops-centre" className="nav grp" title="Operations" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
                    </svg>
                  </span>
                  <span className="navtxt">Operations</span>
                  <span className="badge err">2</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/releases" className="nav grp" title="System" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                  <span className="navtxt">System</span>
                  <span className="chev">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
              </nav>
              <__Link href="/ops-centre" className="statuscard" title="1 open incident" style={{ display: "block", color: "inherit", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "none", width: "10px", height: "10px", borderRadius: "99px", background: "#ff9800", boxShadow: "0 0 0 3px rgba(255,152,0,.2)" }} />
                  <span className="statustxt" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--sideink)" }}>1 open incident</span>
                  <span className="num statustxt" style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--sidemuted)" }}>99.96%</span>
                </div>
                <div className="statustxt ell" style={{ marginTop: "4px", fontSize: "12px", color: "var(--sidebody)" }}>Steadfast webhooks delayed · 38 stores</div>
              </__Link>
              <div className="me">
                <span style={{ position: "relative", display: "inline-flex", flex: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(145deg,#2eaee4,#003087)", color: "#fff", fontSize: "13px", fontWeight: "700" }}>FA</span>
                  <span style={{ position: "absolute", right: "-2px", bottom: "-2px", width: "11px", height: "11px", borderRadius: "99px", background: "#10b981", border: "2px solid var(--side)" }} />
                </span>
                <div className="metxt" style={{ minWidth: "0" }}>
                  <div className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--sideink)" }}>Farhana Akter</div>
                  <div className="ell" style={{ fontSize: "11.5px", color: "var(--sidemuted)" }}>Support lead · 2FA on</div>
                </div>
                <__Link href="/staff-roles" className="tb mebtn" aria-label="Account and roles" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--sidemuted)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </__Link>
              </div>
            </div>
          </aside>
          <header className="topbar">
            <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", minWidth: "230px" }}>
              <span className="crumbic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                  <path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h4M3 14v3a2 2 0 0 0 2 2h2v-7H3" />
                </svg>
              </span>
              <span style={{ color: "var(--muted)" }}>Support</span>
              <span style={{ color: "var(--muted)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
              <span style={{ fontWeight: "600", color: "var(--ink)" }}>Tickets</span>
            </nav>
            <button className="searchbtn" type="button"><span style={{ display: "inline-flex" }}>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
</span>Search stores, phones, invoices, leads<span className="kbd">Ctrl K</span></button>
            {" "}
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px", height: "30px", padding: "0 12px", borderRadius: "999px", background: "var(--okbg)", color: "var(--okt)", fontSize: "12px", fontWeight: "600" }}><span style={{ width: "7px", height: "7px", borderRadius: "9px", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,.18)" }} />Production</span>
            {" "}
            <span className="num" style={{ fontSize: "12.5px", color: "var(--muted)", padding: "0 4px" }}>Sun 20 Sep · 14:32</span>
            {" "}
            <span style={{ width: "1px", height: "24px", background: "var(--line)" }} />
            {" "}
            <button className="tb" type="button" aria-label="Notifications, 3 unread" style={{ position: "relative" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10 21h4" />
              </svg>
              <span style={{ position: "absolute", top: "8px", right: "9px", width: "8px", height: "8px", borderRadius: "9px", background: "#ff5724", border: "2px solid var(--surface)" }} />
            </button>
            {" "}
            <button className="tb" type="button" aria-label="Help and runbooks">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
            </button>
          </header>
          <main className="mainarea" style={{ position: "absolute", left: "272px", right: "0", top: "64px", bottom: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "18px 24px 14px", background: "var(--surface)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={{ margin: "0", fontSize: "26px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.025em", color: "var(--ink)" }}>Tickets</h1>
                  <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--muted)" }}>38 open across 31 stores · first reply target 30 min, Dhaka working hours</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }}>
                  <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z" />
</svg>Filter</button>
                  <__Link href="/form-ticket" className="btn btnp" style={{ minHeight: "40px", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>New ticket</__Link>
                </div>
              </div>
            </div>
            <div role="tablist" aria-label="Queues" style={{ display: "flex", gap: "22px", padding: "0 24px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
              {__list(v.queues).map((q, $index) => (<React.Fragment key={$index}>
                  <button className={q?.cls} type="button" role="tab" aria-selected={q?.sel} onClick={q?.pick}>{q?.label}<span className="cnt">{q?.count}</span></button>
                </React.Fragment>))}
            </div>
            <div style={{ flexGrow: "1", display: "grid", gridTemplateColumns: "330px minmax(0,1fr) 290px", minHeight: "0" }}>
              <div style={{ borderRight: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden" }}>
                {__list(v.tickets).map((t, $index) => (<React.Fragment key={$index}>
                    <button className={t?.cls} type="button" onClick={t?.pick} aria-current={t?.current}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                        <span className={t?.shp} aria-hidden="true" />
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--body)" }}>{t?.pri}</span>
                        <span className="mono" style={{ fontSize: "11px", color: "var(--muted)" }}>{t?.id}</span>
                        <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--muted)" }}>{t?.ch}</span>
                      </span>
                      {" "}
                      <span className={t?.subjCls} style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "1.4", color: "var(--ink)" }}>{t?.subj}</span>
                      {" "}
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                        <span style={{ fontSize: "12.5px", color: "var(--body)" }}>{t?.store}</span>
                        <span className={t?.slaCls} style={{ marginLeft: "auto" }}>{t?.sla}</span>
                      </span>
                    </button>
                  </React.Fragment>))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: "0", background: "var(--surface)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ minWidth: "0", flexGrow: "1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="mono" style={{ color: "var(--muted)" }}>{v.cur?.id}</span>
                      <span className={v.cur?.slaCls}>{v.cur?.sla}</span>
                    </div>
                    <h2 className={v.cur?.subjCls} style={{ margin: "4px 0 0", fontSize: "17px", lineHeight: "1.35", fontWeight: "600", color: "var(--ink)" }}>{v.cur?.subj}</h2>
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                      {__list(v.cur?.tagList).map((tg, $index) => (<React.Fragment key={$index}>
                          <span className="pill p-grey">{tg?.t}</span>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", fontWeight: "600", color: "var(--muted)" }}>Status<select className="sel">
  <option>Open</option>
  <option>Waiting on merchant</option>
  <option>Waiting on engineering</option>
  <option>Solved</option>
</select></label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", fontWeight: "600", color: "var(--muted)" }}>Assignee<select className="sel">
  <option>Farhana Akter</option>
  <option>Rakib Hasan</option>
  <option>Tania Sultana</option>
  <option>Unassigned</option>
</select></label>
                </div>
                <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px", overflow: "hidden", background: "var(--bg)" }}>
                  {__list(v.cur?.msgList).map((m, $index) => (<React.Fragment key={$index}>
                      <div className={m?.wrap} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span className={m?.metaCls} style={{ fontSize: "11.5px", color: "var(--muted)" }}>{m?.who} · {m?.time}</span>
                        <div className={m?.cls}>{m?.text}</div>
                      </div>
                    </React.Fragment>))}
                </div>
                <div style={{ borderTop: "1px solid var(--line)", padding: "12px 20px 14px", background: "var(--surface)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div className="seg" role="group" aria-label="Composer mode">
                      <button className={v.replyCls} type="button" onClick={v.setReply}>Reply to merchant</button>
                      <button className={v.noteCls} type="button" onClick={v.setNote}>Internal note</button>
                    </div>
                    <button className="btn btng" type="button" style={{ minHeight: "36px", padding: "0 12px", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
  <path d="M14 2v6h6" />
</svg>Macro<span style={{ display: "inline-flex" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</span></button>
                    <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>Replies go out on {v.cur?.ch}</span>
                  </div>
                  <label>
                    <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Message</span>
                    <textarea placeholder={v.placeholder} style={__sx(`display:block;width:100%;height:64px;padding:10px 12px;border:1px solid ${v.composerBorder ?? ""};border-radius:10px;background:${v.composerBg ?? ""};font:inherit;font-size:13.5px;color:var(--ink);resize:none`)} />
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                    <button className="tb" type="button" aria-label="Attach a file" style={{ width: "40px", height: "40px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
                      </svg>
                    </button>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>English or Bangla; the merchant sees it in their language setting.</span>
                    <button className="btn btnp" type="button" style={{ marginLeft: "auto", minHeight: "40px", fontSize: "13px" }}>{v.sendLabel}</button>
                  </div>
                </div>
              </div>
              <aside aria-label="Store context" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "16px", borderLeft: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "10px", background: "#003087", color: "#fff", fontSize: "13px", fontWeight: "700" }}>{v.cur?.initials}</span>
                  <div>
                    <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--ink)" }}>{v.cur?.store}</div>
                    <div className="mono" style={{ color: "var(--muted)" }}>tenant {v.cur?.tid}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span className="pill p-navy">{v.cur?.plan}</span>
                  <span className={v.cur?.statePill}><span className={v.cur?.stateShp} aria-hidden="true" />{v.cur?.state}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", borderRadius: "12px", background: "var(--surface2)" }}>
                  <svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
                    <circle cx="27" cy="27" r="22" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="27" cy="27" r="22" fill="none" stroke={v.cur?.ringColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={v.cur?.dash} transform="rotate(-90 27 27)" />
                  </svg>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span className="num" style={{ fontSize: "22px", fontWeight: "700", color: "var(--ink)" }}>{v.cur?.health}</span>
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>health</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "600", color: "var(--body)" }}><span className={v.cur?.healthShp} aria-hidden="true" />{v.cur?.hband}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>Integrations now</div>
                  {__list(v.cur?.integList).map((ig, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "32px", fontSize: "13px" }}>
                        <span className={ig?.shp} aria-hidden="true" />
                        <span style={{ fontWeight: "500", color: "var(--ink)" }}>{ig?.name}</span>
                        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--body)" }}>{ig?.text}</span>
                      </div>
                    </React.Fragment>))}
                </div>
                {v.cur?.hasLink ? (<>
                  <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#f2f5f9", fontSize: "12.5px", lineHeight: "1.5", color: "#0f172a" }}>{v.cur?.link}</div>
                </>) : null}
                <div style={{ fontSize: "12.5px", color: "var(--body)" }}>{v.cur?.past}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                  <__Link href="/tenant-context-bar" className="btn btng" style={{ minHeight: "40px", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>Ask to view store</__Link>
                  <__Link href="/merchant-detail" className="btn btng" style={{ minHeight: "40px", fontSize: "13px" }}>Open merchant page</__Link>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
