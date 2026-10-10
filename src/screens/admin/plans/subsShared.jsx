'use client';
// Plans & modules › Subscriptions and Licences — the parts both pages share: the subscription rows and views, plan
// moves over the last 30 days, the page CSS (prefix subs-), and small text helpers.
// Data: lib/admin/merchants (merchantRow, nextRenewal) and lib/platform/billing. Nothing here changes data.

import { DAY, daysBetween, startOfDay, dmy, dm, hm, yearOf, taka } from '@/lib/platform/util';
import { PLAN_IDS } from '@/lib/platform/catalogue';
import { subOf, openInvoices, balance, isPaying } from '@/lib/platform/billing';
import { merchantRow } from '@/lib/admin/merchants';

export const SUBS_VIEWS = [
  ['all', 'All'], ['active', 'Active'], ['trial', 'Trial'], ['renew', 'Renewing in 7 days'], ['late', 'Overdue / grace'],
  ['expired', 'Expired'], ['paused', 'Paused'],
];

/** One store's subscription as a list row (merchantRow plus the subscription's own fields and its views). */
export function subsRow(db, shop, t) {
  const r = merchantRow(db, shop, t);
  const sub = subOf(db, shop.id);
  const k = r.stateKey;
  const toRenew = r.renewal != null ? daysBetween(t, r.renewal) : null;
  const views = ['all'];
  if (k === 'active') views.push('active');
  if (k === 'trial') views.push('trial');
  if (k === 'active' && toRenew != null && toRenew >= 0 && toRenew <= 7) views.push('renew');
  if (k === 'grace' || k === 'pastdue' || (k === 'suspended' && r.owed > 0)) views.push('late');
  if (k === 'cancelled' || k === 'archived') views.push('expired');
  if (k === 'paused') views.push('paused');
  // what falls due this week: the open bill if one is issued, else the monthly amount
  const week = views.includes('renew')
    ? openInvoices(db, shop.id).filter((i) => i.dueAt < startOfDay(t) + 8 * DAY).reduce((s, i) => s + balance(db, i), 0) || r.monthly
    : 0;
  return {
    ...r, cycle: sub.cycle === 'yearly' ? 'yearly' : 'monthly', started: sub.trialStart || shop.createdAt,
    autoCharge: !!sub.autoCharge, payMethod: sub.payMethod, views, toRenew, week, paying: isPaying(r.state),
    trialEnds: k === 'trial' ? sub.trialStart + sub.trialDays * DAY : null,
  };
}

/** Plan changes in the last `days` days, from the plan items on each bill (each change ends one and starts the next). */
export function planMoves(db, t, days = 30) {
  let up = 0, down = 0;
  const from = t - days * DAY;
  for (const sub of Object.values(db.subs)) {
    const plans = sub.items.filter((it) => it.kind === 'plan').sort((a, b) => a.since - b.since);
    for (let i = 1; i < plans.length; i++) {
      const it = plans[i];
      if (it.since < from || it.since > t) continue;
      const a = PLAN_IDS.indexOf(plans[i - 1].code), b = PLAN_IDS.indexOf(it.code);
      if (b > a) up++; else if (b < a) down++;
    }
  }
  return { up, down };
}

export function subsList(db, t) {
  const rows = db.shops.map((s) => subsRow(db, s, t));
  const counts = {};
  for (const [k] of SUBS_VIEWS) counts[k] = rows.filter((r) => r.views.includes(k)).length;
  const paying = rows.filter((r) => r.paying);
  const renew = rows.filter((r) => r.views.includes('renew'));
  const late = rows.filter((r) => r.views.includes('late'));
  return {
    rows, counts,
    figs: {
      mrr: paying.reduce((s, r) => s + r.monthly, 0), paying: paying.length,
      week: renew.reduce((s, r) => s + r.week, 0), weekN: renew.length,
      late: late.reduce((s, r) => s + r.owed, 0), lateN: late.length,
      moves: planMoves(db, t, 30),
    },
  };
}

export const subsMoney = (n) => taka(n);
export const subsPlural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
/** "Today 10:02" · "Yesterday" · "3 days ago" · "02 Sep" · "02 Sep 2025" */
export function subsWhen(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n === 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday';
  if (n > 1 && n < 7) return n + ' days ago';
  return yearOf(ms) === yearOf(t) ? dm(ms) : dmy(ms);
}
/** "today" · "tomorrow" · "in 6 days" · "3 days ago" */
export function subsDue(ms, t) {
  const n = daysBetween(t, ms);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n > 0) return `in ${n} days`;
  return `${-n} day${n === -1 ? '' : 's'} ago`;
}

/** Read ?view, ?q, the filters and ?id from the address (after mount). */
export function subsFromUrl(views, keys) {
  const p = new URLSearchParams(window.location.search);
  const view = views.some(([k]) => k === p.get('view')) ? p.get('view') : 'all';
  const f = {};
  for (const k of keys) f[k] = p.get(k) || '';
  return { view, q: p.get('q') || '', f, id: p.get('id') || null };
}
export function subsToUrl({ view, q, f, id }) {
  const p = new URLSearchParams();
  if (view !== 'all') p.set('view', view);
  if (q.trim()) p.set('q', q.trim());
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  if (id) p.set('id', id);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

export const SUBS_CSS = `
.subs-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.subs-filters .gc-filterbar__search{max-width:320px}
.subs-name{display:flex;flex-direction:column;min-width:0;max-width:240px}
.subs-name b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.subs-name small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.subs-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading);white-space:nowrap}
.subs-key{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading);white-space:nowrap}
.subs-on{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.subs-on i{width:8px;height:8px;border-radius:var(--radius-full);background:var(--border-strong)}
.subs-on.is-on i{background:var(--success)}
.subs-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.subs-foot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ix-table tbody tr{cursor:pointer}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ix-table tbody tr:focus-visible td{background:var(--surface-subtle)}
button.ix-pitem{width:100%;border:0;border-bottom:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;cursor:pointer}
.ix-plist>li:last-child>button.ix-pitem{border-bottom:0}
.subs-panel{display:flex;flex-direction:column;gap:var(--space-5)}
.subs-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.subs-sec>h3{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.subs-sec>h3 small{font-family:var(--font-data);font-weight:var(--weight-regular);color:var(--text-muted)}
.subs-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.subs-top .subs-key{flex:1;min-width:0;overflow-wrap:anywhere;white-space:normal}
.subs-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.subs-list li{display:flex;align-items:center;gap:var(--space-3);min-height:40px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.subs-list li:first-child{border-top:0}
.subs-list li>span{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.subs-list b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.subs-list small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.subs-list li>em{flex:none;display:flex;align-items:center;gap:var(--space-2);font-style:normal}
.subs-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.subs-acts .ix-btn.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.subs-box{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.subs-box .gc-input{background:var(--surface-card)}
.subs-switch{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.subs-switch>span{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.subs-switch b{font-weight:var(--weight-medium);color:var(--text-heading)}
.subs-switch small{font-size:var(--text-xs);color:var(--text-muted)}
.subs-form{display:flex;flex-direction:column;gap:var(--space-3)}
.subs-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.subs-form textarea.gc-input,.subs-box textarea.gc-input{height:auto;min-height:72px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.subs-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.subs-opt{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);cursor:pointer}
.subs-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.subs-opt input{margin-top:2px;accent-color:var(--primary)}
.subs-opt span{display:flex;flex-direction:column;gap:2px}
.subs-opt b{font-weight:var(--weight-medium);color:var(--text-heading)}
.subs-opt small{font-size:var(--text-xs);color:var(--text-muted)}
.subs-warn{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-error-soft);font-size:var(--text-sm);color:var(--text-danger)}
.subs-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.subs-err{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.subs-empty{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.subs-skel{height:420px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:subs-sk 1.4s ease infinite}
.subs-skel--strip{height:72px}
@keyframes subs-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.subs-skel{animation:none}}
@media (max-width:640px){.subs-filters{padding:6px}.subs-two{grid-template-columns:minmax(0,1fr)}.subs-acts .ix-btn{height:40px}}
`;
