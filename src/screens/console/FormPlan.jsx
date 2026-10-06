'use client';
// Generated from design/templates/console/FormPlan.dc.html by scripts/convert-design.mjs.
// Packaging · draft plan version
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ConsoleSide, ConsoleTop, ConsoleToast } from './ConsoleFrame';
import { MAIN, TITLEROW, H1, SUBT, H2, PHEAD, PSIDE, PANEL, BTN } from './consoleParts';
import { attach, db, now, staff, param, draftFor, draftErrors, diff, saveDraft, submitDraft, decideDraft, catalogue, fmt } from '@/lib/platform';

// ---- logic (from the design's <script type="text/x-dc">) ----

// Draft the next version of one plan. /form-plan?ladder=online&plan=business starts one; /form-plan?id=PV-001 opens a
// saved draft. Approval is by a second person (lib/platform/plans.js): the approver sees Approve / Reject here.
const VIS = [['Public', 'Shown on the pricing page and in upgrade offers.'], ['Private link', 'Only through a link staff send.'], ['Custom for one store', 'Built for a single account; needs a review date.']];
const EXISTING = [['keep', 'Keep them on version {base}', "They keep today's price and limits until they change plan."], ['next', 'Move at their next bill', "30 days' notice by SMS and in the admin."], ['now', 'Move now', 'Needs an Admin; only for price cuts.']];
const LIMITS = [['orders', 'Orders a month', 'orders'], ['products', 'Products', 'products'], ['seats', 'Staff seats', 'seats'], ['storage', 'Storage', 'GB'], ['couriers', 'Courier connections', 'couriers'], ['pages', 'Landing pages', 'pages'], ['sms', 'SMS included', 'a month'], ['ai', 'AI product credits', 'a month']];

class Component extends DCLogic {
  componentDidMount() {
    this.off = attach(this);
    const d = db();
    const id = param('id');
    const saved = id ? d.planDrafts.find((x) => x.id === id) : null;
    const form = saved ? { ...saved } : draftFor(d, param('ladder', 'online'), param('plan', 'business'));
    if (!saved) form.liveFromText = fmt.dmy(fmt.startOfMonth(fmt.addMonths(now(), 1, 1)));
    else form.liveFromText = saved.liveFrom ? fmt.dmy(saved.liveFrom) : '';
    this.setState({ form, ready: true });
  }
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
    const d = db();
    const me = staff();
    const f = s.form || draftFor(d, 'online', 'business');
    const ladder = d.plans[f.ladder];
    const base = ladder.versions.find((x) => x.v === f.baseV) || ladder.versions[ladder.versions.length - 1];
    const basePlan = base.plans[f.plan];
    const set = (patch) => this.setState({ form: { ...f, ...patch } });
    const numIn = (k) => (e) => set({ [k]: fmt.parseAmount(e.target.value) || 0 });
    const errs = s.tried ? draftErrors({ ...f, basePrice: basePlan.price }) : draftErrors({ ...f, basePrice: basePlan.price, why: f.why || 'x', name: f.name || 'x' });
    const changes = diff(basePlan, f);
    const onBase = Object.values(d.subs).filter((x) => x.ladder === f.ladder && x.plan === f.plan && x.version === base.v).length;
    const pending = f.status === 'pending';
    const iAmApprover = pending && f.by !== me.name && (catalogue.can(me, 'billing', 'approve') || me.role === 'admin');
    const locked = pending || f.status === 'approved';
    const parseDate = (txt) => { const ms = Date.parse(txt); return Number.isFinite(ms) ? ms : null; };
    const fields = () => ({ ...f, liveFrom: parseDate(f.liveFromText) });
    const say = (text, tone = 'ok') => this.setState({ toast: text, toastTone: tone });
    const errCount = Object.keys(errs).length;
    const growSet = f.sets.grow === 'Included';
    return {
      f, locked, pending, iAmApprover, approved: f.status === 'approved', rejected: f.status === 'rejected',
      title: `Draft plan · ${f.name || catalogue.PLAN_NAME[f.plan]}, version ${f.v}`,
      sub: `${catalogue.ladderLabel(f.ladder)} ladder · changes publish as a new version${pending ? ` · waiting for ${f.approver}` : f.status === 'approved' ? ` · approved by ${f.decidedBy}` : f.status === 'rejected' ? ` · rejected by ${f.decidedBy}: ${f.decisionNote}` : ''}`,
      ladders: catalogue.LADDERS, onLadder: (e) => { const nd = draftFor(d, e.target.value, f.plan); this.setState({ form: { ...nd, liveFromText: f.liveFromText } }); },
      onName: (e) => set({ name: e.target.value }), onTagline: (e) => set({ tagline: e.target.value }),
      vis: VIS.map(([k, help]) => ({ k, help, cls: (f.visibility || 'Public') === k ? 'rc on' : 'rc', on: (f.visibility || 'Public') === k ? 'true' : 'false', pick: () => !locked && set({ visibility: k }) })),
      onPrice: numIn('price'), onYearly: numIn('yearly'), onSetup: numIn('setup'), onTrial: numIn('trialDays'),
      sets: catalogue.SETS.filter((x) => x.id !== 'service' && (!x.ladder || x.ladder === f.ladder)).map((x) => ({ id: x.id, label: x.label, value: f.sets[x.id] || 'Included', on: (e) => set({ sets: { ...f.sets, [x.id]: e.target.value } }) })),
      setStates: catalogue.SET_STATES,
      limits: LIMITS.map(([k, label, post]) => ({ k, label, post, value: f.limits[k] >= catalogue.UNLIMITED ? 'Unlimited' : fmt.num(f.limits[k]), on: (e) => { const txt = e.target.value.trim().toLowerCase(); set({ limits: { ...f.limits, [k]: txt.startsWith('unl') ? catalogue.UNLIMITED : fmt.parseAmount(txt) || 0 } }); } })),
      onWarn: numIn('warnAt'), onTopup: numIn('topup'),
      atLimit: [['block', 'Block and offer a top-up', 'The action that would exceed is paused with a plain message.'], ['bill', 'Allow and bill the overage', 'Charged on the next invoice.']].map(([k, label, help]) => ({ k, label, help, cls: f.atLimit === k ? 'rc on' : 'rc', on: f.atLimit === k ? 'true' : 'false', pick: () => !locked && set({ atLimit: k }) })),
      existing: EXISTING.map(([k, label, help]) => ({ k, label: label.replace('{base}', base.v), help, cls: f.existing === k ? 'rc on' : 'rc', on: f.existing === k ? 'true' : 'false', pick: () => !locked && set({ existing: k }) })),
      existingSub: `${onBase} store${onBase === 1 ? ' is' : 's are'} on version ${base.v} of ${basePlan.name}.`,
      onLive: (e) => set({ liveFromText: e.target.value }),
      approvers: catalogue.APPROVERS.filter((n) => n !== me.name || pending).map((n) => ({ n, label: `${n} · ${(catalogue.staffBy(n) || {}).title}` })),
      onApprover: (e) => set({ approver: e.target.value }), onWhy: (e) => set({ why: e.target.value }),
      errs, errCount, yearlyMax: fmt.taka(f.price * 12),
      preview: { name: f.name || catalogue.PLAN_NAME[f.plan], price: fmt.taka(f.price), tagline: f.tagline, items: [`${f.limits.orders >= catalogue.UNLIMITED ? 'Unlimited' : fmt.num(f.limits.orders)} orders a month`, `${fmt.num(f.limits.seats)} staff seats`, growSet ? `Offers, loyalty, cart recovery${f.sets.credits === 'Included' ? ', inbox' : ''}` : 'Everyday core for one segment', `${f.trialDays}-day trial`] },
      changes: changes.map(([mark, text], i) => ({ key: i, mark, text })), baseV: base.v,
      saveDraft: () => { const r = saveDraft(fields()); if (r.ok) { this.setState({ form: { ...r.draft, liveFromText: f.liveFromText } }); say(`Draft saved · ${r.draft.id}`); } else say(r.error, 'err'); },
      submit: () => { this.setState({ tried: true }); const r = submitDraft(fields()); if (r.ok) { this.setState({ form: { ...r.draft, liveFromText: f.liveFromText } }); say(`Sent to ${r.draft.approver} for approval`); } else { if (r.draft) this.setState({ form: { ...r.draft, liveFromText: f.liveFromText } }); say(r.error, 'err'); } },
      approve: () => { const r = decideDraft(f.id, 'approve'); if (r.ok) { this.setState({ form: { ...r.draft, liveFromText: f.liveFromText } }); say(`Version ${r.version} approved · ${r.draft.liveFrom > now() ? 'goes live ' + fmt.dmy(r.draft.liveFrom) : 'live now'}`); } else say(r.error, 'err'); },
      rejecting: !!s.rejecting, rejectNote: s.rejectNote || '', onRejectNote: (e) => this.setState({ rejectNote: e.target.value }),
      startReject: () => this.setState({ rejecting: true }), cancelReject: () => this.setState({ rejecting: false }),
      reject: () => { const r = decideDraft(f.id, 'reject', s.rejectNote || ''); if (r.ok) { this.setState({ form: { ...r.draft, liveFromText: f.liveFromText }, rejecting: false }); say('Draft rejected · the drafter sees why'); } else say(r.error, 'err'); },
      canDraft: catalogue.can(me, 'packaging', 'edit'),
      toast: s.toast || '', toastTone: s.toastTone || 'ok', hideToast: () => this.setState({ toast: '' }),
    };
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

export default class FormPlanScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="FormPlan">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "2420px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <ConsoleSide group="packaging" item="plans" toggle={v.toggleSide} label={v.sideLabel} />
          <ConsoleTop group="packaging" page="Plan version 4" />
          <main className="mainarea" style={MAIN}>
            <div style={{ padding: "22px 28px 96px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                <__Link href={"/plans?ladder=" + v.f.ladder} style={{ fontWeight: "var(--weight-medium)" }}>← Plans</__Link>
              </div>
              <div style={TITLEROW}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={H1}>{v.title}</h1>
                  <p style={SUBT}>{v.sub}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "18px", alignItems: "start" }}>
                <fieldset disabled={v.locked} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                <div className="fcard">
                  <section className="fsec">
                    <div>
                      <h2 className="fsh">Plan</h2>
                      <p className="fsd">One plan on one ladder. Customers see the name and tagline on the pricing page.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div className="fgrid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                        <label className="fld">
                          <span className="flab">Ladder<span className="req" aria-hidden="true">*</span></span>
                          <select value={v.f.ladder} onChange={v.onLadder} className="in" disabled={!!v.f.id}>
                            {v.ladders.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                          </select>
                        </label>
                        <label className="fld">
                          <span className="flab">Plan name<span className="req" aria-hidden="true">*</span></span>
                          <input className={"in " + (v.errs.name ? "err" : "")} type="text" value={v.f.name} onChange={v.onName} />
                        </label>
                        <label className="fld" style={{ gridColumn: "1 / -1" }}>
                          <span className="flab">Tagline</span>
                          <input className="in " type="text" value={v.f.tagline} onChange={v.onTagline} />
                        </label>
                      </div>
                      <div className="fld">
                        <span className="flab">Visibility</span>
                        <div className="rgrid" role="radiogroup" aria-label="Visibility">
                          {v.vis.map((x) => (
                            <div key={x.k} className={x.cls} role="radio" aria-checked={x.on} tabIndex="0" onClick={x.pick} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); x.pick(); } }} style={{ cursor: "pointer" }}>
                              <span className="rdot" aria-hidden="true" />
                              <div style={{ minWidth: "0" }}>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{x.k}</div>
                                <div className="fhelp" style={{ marginTop: "2px" }}>{x.help}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="fsec">
                    <div>
                      <h2 className="fsh">Price</h2>
                      <p className="fsd">All prices in Taka, VAT included. Changing a price never changes what existing customers pay.</p>
                    </div>
                    <div className="fgrid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                      <label className="fld">
                        <span className="flab">Monthly price<span className="req" aria-hidden="true">*</span></span>
                        <div className={"affix " + (v.errs.price ? "err" : "")}><span className="pre">৳</span><input type="text" inputMode="numeric" value={fmt.num(v.f.price)} onChange={v.onPrice} /><span className="post">/ month</span></div>
                      </label>
                      <label className="fld">
                        <span className="flab">Yearly price</span>
                        <div className={"affix " + (v.errs.yearly ? "err" : "")}><span className="pre">৳</span><input type="text" inputMode="numeric" value={fmt.num(v.f.yearly)} onChange={v.onYearly} /><span className="post">/ year</span></div>
                        {v.errs.yearly ? <span className="ferr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>{v.errs.yearly}</span> : <span className="fhelp">Lower than 12 × monthly ({v.yearlyMax}).</span>}
                      </label>
                      <label className="fld">
                        <span className="flab">Setup fee</span>
                        <div className="affix "><span className="pre">৳</span><input type="text" inputMode="numeric" value={fmt.num(v.f.setup)} onChange={v.onSetup} /></div>
                        <span className="fhelp">Leave 0 for self-serve plans.</span>
                      </label>
                      <label className="fld">
                        <span className="flab">Store trial</span>
                        <div className="affix "><input type="text" inputMode="numeric" value={v.f.trialDays} onChange={v.onTrial} /><span className="post">days</span></div>
                        <span className="fhelp">Clock starts at the first real order or when the store is published.</span>
                      </label>
                    </div>
                  </section>
                  <section className="fsec">
                    <div>
                      <h2 className="fsh">Module sets</h2>
                      <p className="fsd">What each set does in this plan.</p>
                    </div>
                    <div>
                      {v.sets.map((x, i) => (
                        <div key={x.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 220px", gap: "12px", alignItems: "center", minHeight: "48px", borderTop: i ? "1px solid var(--line)" : "0" }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{x.label}</span>
                          <select aria-label={x.label} value={x.value} onChange={x.on} className="in">
                            {v.setStates.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="fsec">
                    <div>
                      <h2 className="fsh">Limits</h2>
                      <p className="fsd">Metered every calendar month, Dhaka time.</p>
                    </div>
                    <div className="fgrid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                      {v.limits.map((x) => (
                        <label key={x.k} className="fld">
                          <span className="flab">{x.label}</span>
                          <div className="affix "><input type="text" value={x.value} onChange={x.on} /><span className="post">{x.post}</span></div>
                        </label>
                      ))}
                    </div>
                  </section>
                  <section className="fsec">
                    <div>
                      <h2 className="fsh">At the limit</h2>
                      <p className="fsd">What happens when a store reaches a limit.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div className="fgrid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                        <label className="fld">
                          <span className="flab">Warn the owner at</span>
                          <div className="affix "><input type="text" inputMode="numeric" value={v.f.warnAt} onChange={v.onWarn} /><span className="post">%</span></div>
                        </label>
                        <label className="fld">
                          <span className="flab">Top-up pack</span>
                          <div className="affix "><span className="pre">৳</span><input type="text" inputMode="numeric" value={fmt.num(v.f.topup)} onChange={v.onTopup} /><span className="post">per 200 orders</span></div>
                        </label>
                      </div>
                      <div className="rgrid" role="radiogroup" aria-label="At the limit">
                        {v.atLimit.map((x) => (
                          <div key={x.k} className={x.cls} role="radio" aria-checked={x.on} tabIndex="0" onClick={x.pick} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); x.pick(); } }} style={{ cursor: "pointer" }}>
                            <span className="rdot" aria-hidden="true" />
                            <div style={{ minWidth: "0" }}>
                              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{x.label}</div>
                              <div className="fhelp" style={{ marginTop: "2px" }}>{x.help}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section className="fsec">
                    <div>
                      <h2 className="fsh">Existing customers</h2>
                      <p className="fsd">{v.existingSub}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div className="rgrid" role="radiogroup" aria-label="Existing customers">
                        {v.existing.map((x) => (
                          <div key={x.k} className={x.cls} role="radio" aria-checked={x.on} tabIndex="0" onClick={x.pick} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); x.pick(); } }} style={{ cursor: "pointer" }}>
                            <span className="rdot" aria-hidden="true" />
                            <div style={{ minWidth: "0" }}>
                              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{x.label}</div>
                              <div className="fhelp" style={{ marginTop: "2px" }}>{x.help}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {v.errs.existing ? <span className="ferr">{v.errs.existing}</span> : null}
                      <div className="fgrid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                        <label className="fld">
                          <span className="flab">Goes live on</span>
                          <input className="in " type="text" value={v.f.liveFromText || ""} onChange={v.onLive} placeholder="Today if empty" />
                        </label>
                        <label className="fld">
                          <span className="flab">Second approver<span className="req" aria-hidden="true">*</span></span>
                          <select value={v.f.approver} onChange={v.onApprover} className="in">
                            {v.approvers.map((a) => <option key={a.n} value={a.n}>{a.label}</option>)}
                          </select>
                        </label>
                        <label className="fld" style={{ gridColumn: "1 / -1" }}>
                          <span className="flab">Why this change<span className="req" aria-hidden="true">*</span></span>
                          <textarea className={"in " + (v.errs.why ? "err" : "")} rows="2" placeholder="What changes and why" value={v.f.why} onChange={v.onWhy} />
                        </label>
                      </div>
                    </div>
                  </section>
                </div>
                </fieldset>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <section className="panel" style={PANEL}>
                    <div style={PHEAD}>
                      <h2 style={H2}>Pricing page preview</h2>
                      <div style={PSIDE} />
                    </div>
                    <div style={{ padding: "18px", borderRadius: "var(--radius-xl)", background: "#012169", color: "#fff" }}>
                      <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.preview.name}</div>
                      <div className="num" style={{ marginTop: "6px", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)" }}>{v.preview.price}<span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", opacity: ".75" }}> / month</span></div>
                      <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", color: "#cbd8ee" }}>{v.preview.tagline}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px", fontSize: "var(--text-xs-plus)", color: "#e0e6f1" }}>
                        {v.preview.items.map((x) => <span key={x} style={{ display: "flex", gap: "8px", alignItems: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>{x}</span>)}
                      </div>
                      <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "center", height: "40px", borderRadius: "var(--radius-lg)", background: "#009cde", color: "#04121f", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>Start free trial</div>
                    </div>
                  </section>
                  <section className="panel" style={PANEL}>
                    <div style={PHEAD}>
                      <h2 style={H2}>Compared with version {v.baseV}</h2>
                      <div style={PSIDE} />
                    </div>
                    {v.changes.length ? v.changes.map((c) => (
                      <div key={c.key} style={{ display: "flex", alignItems: "flex-start", gap: "10px", minHeight: "32px", fontSize: "var(--text-xs-plus)" }}>
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "var(--radius-md)", fontWeight: "var(--weight-semibold)", background: c.mark === "+" ? "#e7f8f1" : c.mark === "−" ? "#ffece5" : "#f2f5f9", color: c.mark === "+" ? "#047857" : c.mark === "−" ? "#c2410c" : "#003087" }}>{c.mark}</span>
                        <span style={{ color: "var(--ink)", lineHeight: "1.45" }}>{c.text}</span>
                      </div>
                    )) : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No changes yet.</div>}
                  </section>
                  {v.errCount ? <div className="note n-err"><strong>{v.errCount} field{v.errCount === 1 ? "" : "s"} to fix</strong> before this can be sent for approval.</div> : v.approved ? <div className="note n-ok"><strong>Approved.</strong> Version {v.f.v} {v.f.liveFrom > Date.now() ? "goes live " + fmt.dmy(v.f.liveFrom) : "is live"}.</div> : v.pending ? <div className="note n-warn">Waiting for <strong>{v.f.approver}</strong>. You cannot approve your own draft.</div> : !v.canDraft ? <div className="note n-warn">Only an Admin can draft plan versions.</div> : null}
                  {v.rejecting ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <textarea className="inp" rows={2} value={v.rejectNote} onChange={v.onRejectNote} placeholder="Why is it rejected? The drafter sees this." aria-label="Reason for rejecting" style={{ height: "auto", padding: "8px 10px", fontSize: "var(--text-xs-plus)" }} />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btnp" type="button" onClick={v.reject} style={BTN}>Reject</button>
                        <button className="btn btng" type="button" onClick={v.cancelReject} style={BTN}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="formbar">
              <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Fields marked <span style={{ color: "#c2410c" }}>*</span> are required · every save is written to the audit log</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                <__Link href={"/plans?ladder=" + v.f.ladder} className="btn btng" style={BTN}>{v.locked ? "Back" : "Cancel"}</__Link>
                {v.iAmApprover ? (
                  <>
                    <button className="btn btng" type="button" onClick={v.startReject} style={BTN}>Reject</button>
                    <button className="btn btnp" type="button" onClick={v.approve} style={BTN}>Approve and publish</button>
                  </>
                ) : !v.locked ? (
                  <>
                    <button className="btn btng" type="button" onClick={v.saveDraft} disabled={!v.canDraft} style={BTN}>Save draft</button>
                    <button className="btn btnp" type="button" onClick={v.submit} disabled={!v.canDraft} style={BTN}>Send for approval</button>
                  </>
                ) : null}
              </span>
            </div>
          </main>
          <ConsoleToast text={v.toast} tone={v.toastTone} onClose={v.hideToast} />
        </div>
      </div>
    );
  }
}
