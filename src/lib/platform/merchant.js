// platform/merchant — everything the Merchant page (console › Tenants › a store) shows, for one store at time t.
// Billing, modules, notes and activity come from the records; the store's own trading picture (sales, team,
// integrations, tickets, affiliates) is what the tenant reports, generated per store for the demo (views.profile).
// Dhaka Gadget Hub (0031) keeps the numbers drawn on the design board.

import { DAY, rng, daysBetween, startOfMonth, addMonths, monthOf, monthLong, dm, dmy, dmhm, hm, ago, taka, num, spark, initials, periodOf, dayOfMonth, yearOf } from './util';
import { MODULES, SETS, PLAN_NAME, ladderLabel, staffIni, staffColor, ADDONS, TRIALABLE, METHODS, VIA, COLLECTORS, SOURCES, REASON_LABEL } from './catalogue';
import { shopOf, subOf, subState, isPaying, mrrOf, planOf, balance, invoiceState, openInvoices, paidOn, lastPayment, paidVia, billItems, priceOf, itemName, outcomeLabel, dayName } from './billing';
import { profile, health, lastActiveDays, ordersMTD } from './views';

const TEAM_NAMES = ['Sumon Roy', 'Kamal Ahmed', 'Rina Begum', 'Tanjila Akter', 'Rubel Mia', 'Shapla Khatun', 'Masud Rana', 'Nipa Das', 'Joy Barua', 'Rasel Ahmed', 'Mitu Akter', 'Hasan Ali'];
const ROLES = { Retail: ['Manager', 'Cashier · POS', 'Cashier · POS', 'Stock'], Online: ['Manager', 'Orders', 'Content', 'Packing'], Wholesale: ['Manager', 'Accounts', 'Warehouse', 'Sales'] };
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const C64 = 2 * Math.PI * 28;

/** Months of store sales (৳) from the month it opened to this month, oldest first. */
export function salesSeries(db, shop, t, p) {
  const months = [];
  const start = startOfMonth(shop.createdAt);
  for (let m = start, i = 0; m <= t && i < 24; m = addMonths(m, 1, 1), i++) months.push(m);
  const r = rng('sales' + shop.id);
  const n = months.length;
  return months.map((m, i) => {
    const ramp = Math.min(1, 0.35 + (i / Math.max(1, n - 1)) * 0.75);
    const isNow = i === n - 1;
    const orders = isNow ? ordersMTD(db, shop, t) : Math.round(shop.orders0 * ramp * (0.9 + r() * 0.2));
    return { t: m, orders, sales: orders * p.avg };
  });
}

export function moduleState(db, shop, sub, plan, code, name, set, t) {
  const items = billItems(sub, t);
  const trial = sub.moduleTrials.find((m) => m.code === code && !m.result && m.start <= t);
  const usesByName = (shop.mods || []).some((m) => name.toLowerCase().startsWith(m.toLowerCase()) || m.toLowerCase().startsWith(name.toLowerCase().split(' ')[0]));
  if (trial) {
    const left = Math.max(0, Math.ceil((trial.start + trial.days * DAY - t) / DAY));
    return { cls: 'mod mod-trial', title: `Trial · ${left} days left`, label: `${name} · ${left} d`, lock: false, left };
  }
  if (items.some((it) => it.code === code)) return { cls: 'mod mod-add', title: 'Billed separately', label: name, lock: false };
  const ladderSet = { online: 'online', retail: 'retail', wholesale: 'wholesale' };
  if (set === 'platform' || set === 'everyday') return { cls: 'mod mod-in', title: 'In plan', label: name, lock: false };
  if (set === 'online' || set === 'retail' || set === 'wholesale') {
    const inSeg = shop.segs.map((s) => s.toLowerCase()).includes(set) || ladderSet[sub.ladder] === set;
    if (inSeg) return { cls: 'mod mod-in', title: 'In plan', label: name, lock: false };
    if (usesByName) return { cls: 'mod mod-add', title: 'Billed separately', label: name, lock: false };
    return { cls: 'mod mod-off', title: 'Not in this segment', label: name, lock: false };
  }
  if (set === 'service') return { cls: 'mod mod-off', title: 'Not bought', label: name, lock: false };
  const rule = plan.sets[set] || 'Add-on';
  if (rule === 'Included') return { cls: 'mod mod-in', title: 'In plan', label: name, lock: false };
  if (usesByName) return { cls: 'mod mod-add', title: 'Billed separately', label: name, lock: false };
  return { cls: 'mod mod-lock', title: 'Locked', label: name, lock: true };
}

/** The whole Merchant page for one store. */
export function merchantView(db, t, id, me) {
  const shop = shopOf(db, id) || shopOf(db, '0031');
  const sid = shop.id;
  const sub = subOf(db, sid);
  const st = subState(db, sid, t);
  const hl = health(db, shop, t);
  const p = profile(shop);
  const plan = planOf(db, sub);
  const r = rng('mv' + sid);
  const owner = shop.owner.name;
  const seg = shop.segs[0];
  const dgh = sid === '0031';
  const lastDays = lastActiveDays(db, shop, t);
  const open = openInvoices(db, sid);
  const overdueInv = open.filter((i) => i.dueAt < t && daysBetween(i.dueAt, t) > 0);
  const items = billItems(sub, t);
  const monthly = mrrOf(db, sub, t);
  const planPrice = priceOf(db, sub, { kind: 'plan', code: sub.plan });
  const pays = db.payments.filter((x) => x.shopId === sid && x.status === 'ok').sort((a, b) => b.at - a.at);
  const paidTotal = pays.reduce((s, x) => s + x.amount, 0);
  const paidMonths = new Set(pays.map((x) => db.invoices.find((i) => i.id === x.invoiceId)?.period).filter(Boolean)).size;
  const calls = db.calls.filter((c) => c.shopId === sid).sort((a, b) => b.at - a.at);
  const notes = db.notes.filter((n) => n.shopId === sid).sort((a, b) => (b.pinned - a.pinned) || b.at - a.at);
  const pendingAdj = db.adjustments.filter((a) => a.shopId === sid && a.status === 'pending');
  const site = shop.dom ? 'https://' + shop.dom : `https://${shop.sub}.gridcommerce.com.bd`;

  // ---- header ----
  const stateText = st.key === 'grace' ? `${st.label} · invoice unpaid` : st.key === 'pastdue' ? `${st.label} · ${st.days} days unpaid` : st.key === 'suspended' ? `Suspended · unpaid ${st.days} days` : st.key === 'trial' ? `${st.label} of ${sub.trialDays}` : st.label;
  const head = {
    ini: initials(shop.name), name: shop.name, tid: sid,
    desc: [shop.desc || shop.cat, shop.address || shop.dist, 'owner ' + owner].join(' · '),
    segPlan: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]} plan`,
    stateText, statePill: st.pill, stateShp: st.shp,
    healthText: `Health ${hl.score} · ${hl.band}`, healthPill: 'pill p-' + hl.tone, healthShp: 'shp shp-' + hl.tone,
    am: shop.am ? 'Account manager: ' + shop.am : 'No account manager yet',
    site, phone: shop.owner.phone,
  };
  const lastEv = db.events.filter((e) => e.shopId === sid && (e.kind === 'team' || e.kind === 'owner')).sort((a, b) => b.at - a.at)[0];
  const lastSign = lastDays === 0 ? (dgh ? t - (t % DAY > 0 ? 0 : 0) : t) : t - lastDays * DAY;
  const facts = [
    { k: 'signed', label: 'Signed up', value: dmy(shop.createdAt), sub: shop.src === 'Physical visit' ? 'on a field visit' : 'from ' + shop.src },
    { k: 'activation', label: 'Last activation', value: lastDays === 0 ? (dgh ? 'Today 10:02' : 'Today') : lastDays === 1 ? 'Yesterday' : lastDays + ' days ago', sub: 'owner signed in' },
    { k: 'updated', label: 'Last updated', value: lastEv && lastEv.kind === 'team' ? ago(lastEv.at, t) : lastDays === 0 ? 'Today' : ago(lastSign, t), sub: lastEv && lastEv.kind === 'team' ? lastEv.text.split(' ').slice(2).join(' ').replace('updated ', '').slice(0, 30) : 'products and orders' },
    { k: 'reset', label: 'Reset link sent', value: shop.resetAt ? (daysBetween(shop.resetAt, t) === 0 ? 'Today ' + hm(shop.resetAt) : dmy(shop.resetAt)) : 'Never', sub: shop.resetAt ? `by ${shop.resetBy === (me && me.name) ? 'you' : shop.resetBy.split(' ')[0]}, by SMS` : 'owner has not asked' },
    { k: 'package', label: 'Package', value: `${PLAN_NAME[sub.plan]} ${taka(planPrice)}`, sub: monthly - planPrice > 0 ? `+ ${taka(monthly - planPrice)} modules and credits` : sub.cycle === 'yearly' ? 'paid yearly' : 'plan only' },
    { k: 'by', label: 'Onboarded by', value: shop.by, sub: shop.helper && shop.helper !== shop.by ? 'helper ' + shop.helper : 'no helper' },
    { k: 'src', label: 'Came from', value: shop.src, sub: shop.campaign || (shop.ref ? 'referred by ' + (shopOf(db, shop.ref) || {}).name : '—') },
  ];

  // ---- overview ----
  const series = salesSeries(db, shop, t, p);
  const thisM = series[series.length - 1] || { orders: 0, sales: 0 };
  const prevM = series[series.length - 2] || { orders: 0, sales: 0 };
  const fx = p.fixed;
  const lifeSales = fx ? fx.lifetimeSales : series.reduce((s, x) => s + x.sales, 0);
  const lifeOrders = fx ? fx.lifetimeOrders : series.reduce((s, x) => s + x.orders, 0);
  const customers = fx ? fx.customers : Math.round(lifeOrders * 0.6);
  const repeat = fx ? fx.repeatBuyers : Math.round(customers * p.repeat);
  const counter = fx ? fx.counter : p.counter;
  const monthPace = prevM.sales ? Math.round(((thisM.sales / Math.max(1, dayOfMonth(t)) * 30) - prevM.sales) / prevM.sales * 100) : 0;
  const sp = (vals, color) => ({ ...spark(vals.length > 1 ? vals : [0, ...vals]), color });
  const overviewKpis = [
    { k: 'life', label: 'Lifetime sales', value: taka(lifeSales), note: `through GridCommerce since ${monthOf(shop.createdAt)} ${yearOf(shop.createdAt)}`, cls: 'dpill d-flat', ...sp(series.map((x) => x.sales), '#6683b7') },
    { k: 'orders', label: 'Orders, lifetime', value: num(lifeOrders), note: counter ? `counter ${Math.round(counter * 100)}% · online ${100 - Math.round(counter * 100)}%` : 'all online', cls: 'dpill d-flat', ...sp(series.map((x) => x.orders), '#6683b7') },
    { k: 'month', label: 'This month', value: taka(thisM.sales), note: `${num(thisM.orders)} orders · ${monthPace >= 0 ? '▲' : '▼'} ${Math.abs(monthPace)}% vs ${monthLong(addMonths(t, -1, 1))}`, cls: monthPace >= 0 ? 'dpill d-good cs-pill-line' : 'dpill d-bad cs-pill-line', ...sp(series.slice(-8).map((x) => x.sales), monthPace >= 0 ? '#10b981' : '#ff5724') },
    { k: 'cust', label: 'Customers', value: num(customers), note: `${num(repeat)} repeat buyers`, cls: 'dpill d-good', ...sp(series.map((x, i) => i), '#10b981') },
    { k: 'paid', label: 'Paid to GridCommerce', value: taka(paidTotal), note: `${paidMonths} month${paidMonths === 1 ? '' : 's'}`, cls: 'dpill d-flat', ...sp(pays.slice().reverse().map((x) => x.amount), '#6683b7') },
    { k: 'avg', label: 'Average order', value: taka(fx ? fx.avg : p.avg), note: `${(fx ? fx.avgDelta : Math.round((r() - 0.3) * 60)) >= 0 ? '▲' : '▼'} ${taka(Math.abs(fx ? fx.avgDelta : Math.round((r() - 0.3) * 60)))}`, cls: 'dpill d-good', ...sp(series.map((x, i) => 100 + i * 3 + r() * 10), '#10b981') },
  ];
  // the line chart (640 x 200, plot 40..630 x, 18..178 y)
  // the month in progress is drawn at its pace for the whole month, so the line does not dip
  const sv = series.slice(-13).map((x, i, arr) => (i === arr.length - 1 ? { ...x, sales: Math.round((x.sales / Math.max(1, dayOfMonth(t))) * 30) } : x));
  const hi = Math.max(1, ...sv.map((x) => x.sales));
  const pts = sv.map((x, i) => [40 + (590 * i) / Math.max(1, sv.length - 1), 178 - (160 * x.sales) / (hi * 1.08)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const labelIdx = sv.length > 1 ? [0, Math.round((sv.length - 1) / 3), Math.round((2 * (sv.length - 1)) / 3), sv.length - 1] : [0];
  const salesChart = {
    line, area: sv.length > 1 ? `${line} L630.0,178 L40.0,178 Z` : '', last: pts[pts.length - 1] || [630, 178],
    labels: [...new Set(labelIdx)].map((i, k, arr) => ({ x: pts[i][0], pct: ((pts[i][0] / 640) * 100).toFixed(1) + '%', text: k === 0 || k === arr.length - 1 ? `${monthOf(sv[i].t)} ${String(yearOf(sv[i].t)).slice(2)}` : monthOf(sv[i].t) })),
  };
  const healthBox = {
    title: head.healthText, score: hl.score, dash: `${((C64 * hl.score) / 100).toFixed(1)} ${C64.toFixed(1)}`,
    color: hl.tone === 'ok' ? '#10b981' : hl.tone === 'warn' ? '#ff9800' : '#ff5724',
    change: hl.change === 0 ? 'No change in 7 days' : `${hl.change < 0 ? '▼' : '▲'} ${Math.abs(hl.change)} in 7 days${hl.why ? ': ' + hl.why : ''}`,
    changeColor: hl.change < 0 ? 'var(--errt)' : 'var(--okt)',
    parts: hl.parts.map((x) => ({ ...x, width: x.value + '%', bar: x.value < 50 ? '#ff5724' : '#003087', valColor: x.value < 50 ? 'var(--errt)' : 'var(--ink)' })),
  };
  // team
  const seats = plan.limits.seats;
  const teamN = dgh ? 3 : Math.min(seats - 1, 1 + Math.floor(r() * 3));
  const roles = ROLES[seg] || ROLES.Online;
  const team = dgh ? [
    { ini: 'AH', color: '#003087', name: 'Arif Hossain', role: 'Owner', phone: '+880 1711-XXXXXX · 2FA on', last: lastDays === 0 ? 'Today 10:02' : lastDays === 1 ? 'Yesterday' : lastDays + ' days ago' },
    { ini: 'SR', color: '#7d94bf', name: 'Sumon Roy', role: 'Manager', phone: '+880 1819-XXXXXX', last: 'Today 09:48' },
    { ini: 'KA', color: '#7d94bf', name: 'Kamal Ahmed', role: 'Cashier · POS', phone: '+880 1552-XXXXXX', last: 'Yesterday' },
    { ini: 'RB', color: '#7d94bf', name: 'Rina Begum', role: 'Cashier · POS', phone: '+880 1677-XXXXXX', last: '3 days ago' },
  ] : [
    { ini: initials(owner), color: '#003087', name: owner, role: 'Owner', phone: shop.owner.phone + (r() > 0.4 ? ' · 2FA on' : ''), last: lastDays === 0 ? 'Today' : lastDays === 1 ? 'Yesterday' : lastDays + ' days ago' },
    ...Array.from({ length: teamN }, (_, i) => { const nm = TEAM_NAMES[(Number(sid) + i * 5) % TEAM_NAMES.length]; return { ini: initials(nm), color: '#7d94bf', name: nm, role: roles[i % roles.length], phone: `+880 1${3 + (i % 7)}${10 + ((Number(sid) * 7 + i * 13) % 89)}-XXXXXX`, last: i === 0 && lastDays < 3 ? 'Today' : i + lastDays < 2 ? 'Yesterday' : `${i + 1 + lastDays} days ago` }; }),
  ];
  // integrations
  const intPart = hl.parts.find((x) => x.key === 'integrations').value;
  const couriers = seg === 'Wholesale' ? [] : ['Steadfast', 'Pathao'];
  const integrations = [
    ...couriers.map((c, i) => (i === 0 && intPart < 50 ? { shp: 'shp shp-err', name: c, text: dgh ? 'Failing since 09:40 · INC-114' : 'Sync failing · retrying', color: 'var(--errt)', weight: 'var(--weight-medium)' } : { shp: 'shp shp-ok', name: c, text: 'Healthy', color: 'var(--body)', weight: 'var(--weight-regular)' })),
    { shp: 'shp shp-ok', name: seg === 'Wholesale' ? 'Bank feed' : 'bKash', text: 'Healthy', color: 'var(--body)', weight: 'var(--weight-regular)' },
    (() => { const sms = Math.round(shop.orders0 * (dgh ? 50.9 : 6 + r() * 8)); const over = sms > plan.limits.sms * (dgh ? 10 : 1) && items.every((it) => it.code !== 'SMS') || dgh; return { shp: over ? 'shp shp-warn' : 'shp shp-ok', name: 'SMS', text: `${num(dgh ? 48900 : sms)} sent${over ? ' · over plan' : ''}`, color: over ? 'var(--warnt)' : 'var(--body)', weight: over ? 'var(--weight-medium)' : 'var(--weight-regular)' }; })(),
  ];
  const noteRows = notes.map((n) => ({
    id: n.id, kind: n.kind, pinned: n.pinned, done: n.done,
    head: n.kind === 'task' ? `Task · ${n.by.split(' ')[0]}, ${daysBetween(n.due || n.at, t) <= 0 ? 'today' : ago(n.due, t)}${n.done ? ' · done' : ''}` : `${n.pinned ? 'Pinned · ' : ''}${n.by}${n.pinned ? '' : ' · ' + ago(n.at, t)}`,
    text: n.text, bg: n.pinned ? '#fff8e6' : 'var(--surface2)', border: n.pinned ? '1px solid #f5c26b' : '1px solid var(--line)',
  }));
  const controls = {
    paused: sub.status === 'paused', readonly: shop.control === 'readonly', suspended: st.key === 'suspended' || shop.control === 'suspended',
    archived: sub.status === 'archived', cancelled: sub.status === 'cancelled',
  };

  // ---- billing ----
  const nextDue = sub.nextDue;
  const nextLabel = nextDue ? dm(nextDue) : sub.status === 'trial' ? dm(sub.trialStart + sub.trialDays * DAY) : '—';
  const usualMethod = (() => { const c = {}; for (const x of pays.slice(0, 6)) c[x.method] = (c[x.method] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || sub.payMethod; })();
  const lastTwo = pays.slice(0, 2);
  const viaNote = pays.length ? (() => { const call = pays.slice(0, 6).filter((x) => x.via === 'call').length; const panel = pays.slice(0, 6).filter((x) => x.via === 'panel').length; const auto = pays.slice(0, 6).filter((x) => x.via === 'auto').length; return auto ? `${auto} of the last ${Math.min(6, pays.length)} charged automatically` : lastTwo.every((x) => x.via === 'call') ? `last 2 on a call, ${panel} from panel` : `${panel} from panel, ${call} on a call`; })() : 'no payments yet';
  const lateBefore = db.invoices.filter((i) => i.shopId === sid && !i.noCharge && i.dueAt < t - 31 * DAY).some((i) => { const lp = lastPayment(db, i.id); return lp && lp.at > i.dueAt + 7 * DAY; });
  const billsByMonth = db.invoices.filter((i) => i.shopId === sid && !i.noCharge).sort((a, b) => a.dueAt - b.dueAt).slice(-16);
  let run = 0;
  const billKpis = [
    { label: `Monthly bill from ${nextDue ? monthLong(nextDue) : 'the trial end'}`, value: taka(monthly || planPrice), note: monthly - planPrice > 0 ? `plan ${taka(planPrice)} + modules and credits` : 'plan only', cls: 'dpill d-flat', ...sp(billsByMonth.map((i) => i.total), '#6683b7') },
    { label: 'Overdue', value: taka(overdueInv.reduce((s, i) => s + balance(db, i), 0)), note: overdueInv.length ? `${overdueInv[0].id} · ${daysBetween(overdueInv[0].dueAt, t)} days` : open.length ? `${open[0].id} due ${dm(open[0].dueAt)}` : 'nothing owed', cls: overdueInv.length ? 'dpill d-bad' : 'dpill d-good', ...sp(billsByMonth.map((i) => { const lp = lastPayment(db, i.id); return lp ? Math.max(0, daysBetween(i.dueAt, lp.at)) : Math.max(0, daysBetween(i.dueAt, t)); }), overdueInv.length ? '#ff5724' : '#10b981') },
    { label: 'Usually pays', value: sub.autoCharge ? sub.payMethod : usualMethod, note: sub.autoCharge ? 'charged automatically' : viaNote, cls: 'dpill d-flat', ...sp(pays.slice(0, 16).reverse().map((x) => (x.via === 'panel' ? 1 : x.via === 'auto' ? 2 : 0)), '#6683b7') },
    { label: 'Paid lifetime', value: taka(paidTotal), note: lateBefore ? 'has paid late before' : overdueInv.length ? 'never missed a month before' : 'always on time', cls: lateBefore ? 'dpill d-bad' : 'dpill d-good', ...sp(pays.slice().reverse().map((x) => (run += x.amount)), '#10b981') },
  ];
  const TYPE = { plan: ['Plan', 'pill p-navy'], module: ['Module', 'pill p-sky'], credits: ['Credits', 'pill p-grey'], oneoff: ['One-off', 'pill p-grey'], proration: ['One-off', 'pill p-grey'] };
  const billRows = [
    ...items.filter((it) => it.period !== 'Once' || !it.billedIn).map((it) => ({
      id: it.id, name: itemName(sub, it), type: TYPE[it.kind][0], typeCls: TYPE[it.kind][1], price: taka(priceOf(db, sub, it)), period: it.period,
      since: it.fromTrial ? `From ${dm(it.since)}, after trial` : it.since > t ? `From ${dm(it.since)}` : dmy(it.since), next: it.period === 'Once' && it.billedIn ? '—' : nextLabel,
      plan: it.kind === 'plan', raw: it,
    })),
    ...sub.moduleTrials.filter((m) => !m.result && m.autoAdd && m.start <= t).map((m) => ({ id: m.id, name: m.name, type: 'Module', typeCls: 'pill p-sky', price: taka(m.price), period: 'Monthly', since: `From ${dm(m.start + m.days * DAY)}, after trial`, next: nextLabel, trial: true })),
    ...sub.items.filter((it) => it.period === 'Once' && it.billedIn && it.billedIn !== 'pending').slice(-2).map((it) => ({ id: it.id, name: it.name, type: 'One-off', typeCls: 'pill p-grey', price: taka(it.price), period: 'Once', since: dmy(it.since), next: '—', done: true })),
  ];
  const payable = open.map((i) => ({ value: i.id, label: `${i.id} · ${taka(balance(db, i))} · ${daysBetween(i.dueAt, t) > 0 ? 'overdue' : 'due ' + dm(i.dueAt)}` }));
  const firstOpen = overdueInv[0] || open[0] || null;
  const promise = calls.find((c) => c.outcome === 'promised' && c.invoiceId === (firstOpen || {}).id);
  const banner = firstOpen ? {
    strong: `${firstOpen.id} · ${taka(balance(db, firstOpen))}`,
    rest: `${daysBetween(firstOpen.dueAt, t) > 0 ? ` overdue ${daysBetween(firstOpen.dueAt, t)} days` : ` due ${dm(firstOpen.dueAt)}`}${promise ? ` · promised on the ${dm(promise.at)} call to pay ${dayName(promise.promiseAt)}` : ''}`,
    bg: daysBetween(firstOpen.dueAt, t) > 0 ? '#ffece5' : '#fff4e0', color: daysBetween(firstOpen.dueAt, t) > 0 ? '#7c2d12' : '#7a3e05',
  } : { strong: 'Nothing owed', rest: nextDue ? ` · next bill ${taka(monthly)} on ${dm(nextDue)}` : '', bg: '#e7f8f1', color: '#065f46' };
  const invRows = [
    ...db.invoices.filter((i) => i.shopId === sid).map((i) => {
      const s = invoiceState(db, i, t);
      const lp = lastPayment(db, i.id);
      return {
        key: i.id, id: i.id, at: i.issuedAt, period: monthOf(i.period), amount: taka(i.total), amountColor: 'var(--ink)',
        status: s.key === 'nocharge' ? 'No charge · trial' : s.key === 'paid' ? `Paid ${dm(s.paidAt)}` : s.key === 'credited' ? 'Settled by credit' : s.key === 'overdue' ? `Overdue · ${s.days} day${s.days === 1 ? '' : 's'}` : s.days === 0 ? 'Due today' : `Due ${dm(i.dueAt)}`,
        cls: s.key === 'nocharge' ? 'pill p-grey' : s.key === 'paid' || s.key === 'credited' ? 'pill p-ok' : s.key === 'overdue' ? 'pill p-err' : 'pill p-warn',
        via: s.key === 'nocharge' ? 'Trial' : lp ? paidVia(lp) : '—', by: lp ? lp.by : '—',
      };
    }),
    ...db.credits.filter((c) => c.shopId === sid).map((c) => ({ key: c.id, id: c.id, at: c.at, period: monthOf((db.invoices.find((i) => i.id === c.invoiceId) || { period: periodOf(c.at) }).period), amount: taka(-c.amount), amountColor: '#c2410c', status: 'Credit issued', cls: 'pill p-sky', via: REASON_LABEL[c.reason] || c.reason, by: c.by })),
    ...pendingAdj.filter((a) => a.type === 'credit' || a.type === 'waive').map((a) => ({ key: a.id, id: a.id, at: a.at, period: a.invoiceId && a.invoiceId !== 'next' ? monthOf((db.invoices.find((i) => i.id === a.invoiceId) || { period: periodOf(a.at) }).period) : '—', amount: taka(-a.amount), amountColor: '#c2410c', status: 'Waiting 2nd approval', cls: 'pill p-warn', via: REASON_LABEL[a.reason] || a.reason, by: a.by })),
  ].sort((a, b) => b.at - a.at).slice(0, 8);
  const callRows = calls.slice(0, 6).map((c) => ({ id: c.id, at: dmhm(c.at), text: c.note || outcomeLabel(c.outcome), by: c.by }));

  // ---- modules ----
  const sets = SETS.map((s) => ({
    id: s.id, label: s.label, sub: s.sub,
    mods: MODULES.filter((m) => m.set === s.id).map((m) => ({ code: m.code, name: m.name, ...moduleState(db, shop, sub, plan, m.code, m.name, s.id, t) })),
  }));
  const runningTrial = sub.moduleTrials.find((m) => !m.result && m.start <= t);
  const trialLeft = runningTrial ? Math.max(0, Math.ceil((runningTrial.start + runningTrial.days * DAY - t) / DAY)) : 0;
  const lockedTried = sets.flatMap((s) => s.mods).filter((m) => m.lock).slice(0, 3).map((m, i) => ({ name: m.name, n: dgh ? [12, 5, 3][i] : Math.max(1, Math.round((3 - i) * (1 + r() * 3))) }));
  const maxTried = Math.max(1, ...lockedTried.map((x) => x.n));
  const trialHistory = sub.moduleTrials.slice().sort((a, b) => b.start - a.start).map((m) => {
    const end = m.start + m.days * DAY;
    const left = Math.max(0, Math.ceil((end - t) / DAY));
    const running = !m.result && m.start <= t;
    return {
      id: m.id, name: m.name, trial: `${m.days} days · ${dm(m.start)} to ${dm(end)}`, use: m.use || (running ? 'In use' : '—'),
      result: running ? `Running · ${left} days left` : m.result || 'Starts ' + dm(m.start), cls: running ? 'pill p-sky' : /Became|Converted/.test(m.result || '') ? 'pill p-ok' : 'pill p-grey', shp: /Became|Converted/.test(m.result || '') ? 'shp shp-ok' : '', by: m.by,
    };
  });

  // ---- onboarding ----
  const d0 = shop.createdAt;
  const trialDay = st.key === 'trial' ? st.days : 99;
  const stalled = st.key === 'trial' && lastDays >= 5;
  const products = dgh ? 412 : 40 + Math.floor(r() * 400);
  const steps = [
    { label: 'Store created', at: d0, who: shop.src === 'Physical visit' ? 'Self · on the visit' : 'Self · signup' },
    { label: `${products} products ${r() > 0.4 || dgh ? 'imported by CSV' : 'added by hand'}`, at: d0 + DAY, who: shop.helper ? `${shop.helper}, helper` : 'Owner' },
    seg === 'Retail' ? { label: `POS and ${dgh ? 2 : 1 + Math.floor(r() * 2)} barcode scanner${dgh ? 's' : ''} set up`, at: d0 + 2 * DAY, who: 'In person' } : seg === 'Wholesale' ? { label: 'Price lists and credit terms set', at: d0 + 2 * DAY, who: 'Video call' } : { label: 'Theme and checkout set up', at: d0 + 2 * DAY, who: 'Owner' },
    { label: seg === 'Retail' ? 'First counter sale' : 'First order', at: d0 + 2 * DAY, who: dgh ? '৳3,450 · Samsung charger' : taka(Math.round(p.avg * (0.8 + r() * 0.6))) },
    ...(seg === 'Wholesale' ? [] : [{ label: 'Steadfast and Pathao connected', at: d0 + 3 * DAY, who: 'Video call' }]),
    ...(shop.dom ? [{ label: `Domain ${shop.dom} live`, at: d0 + 5 * DAY, who: shop.helper || shop.by }] : [{ label: 'Own domain', at: d0 + 5 * DAY, who: 'Not added yet', skip: true }]),
    { label: `Staff invited · ${teamN} ${seg === 'Retail' ? 'cashier' + (teamN === 1 ? '' : 's') : 'staff'}`, at: d0 + 7 * DAY, who: 'Owner' },
  ].map((s, i) => {
    const done = !s.skip && s.at <= t && (st.key !== 'trial' || i <= Math.min(6, Math.floor(trialDay / 2)) - (stalled ? 2 : 0));
    const stuck = !done && stalled && i === Math.max(1, Math.floor(trialDay / 2) - 1);
    return { ...s, key: i, cls: done ? 'dot d-done' : stuck ? 'dot d-stuck' : 'dot d-todo', date: done ? (i === 0 ? dmy(s.at) : dm(s.at)) : '—', who: done ? s.who : stuck ? 'Stuck · needs a call' : s.skip ? s.who : 'Not yet' };
  });
  const doneN = steps.filter((s) => s.cls === 'dot d-done').length;
  const stepsTitle = doneN === steps.length ? `Setup steps · activation 100% on day ${Math.max(1, daysBetween(d0, steps[steps.length - 1].at))}` : `Setup steps · ${doneN} of ${steps.length} done`;
  const sessions = dgh ? [
    { key: 1, title: 'In person · Elephant Road shop', when: `${dmy(d0 - 2 * DAY)} · Rakib Hasan`, text: 'Demo on the counter; signed up on the spot, Growth plan.' },
    { key: 2, title: 'Video call · 50 min', when: `${dmy(d0 + DAY)} · Tania Sultana`, text: 'Imported products from his Excel sheet; set up two price lists.' },
    { key: 3, title: 'Phone · 20 min', when: `${dmy(addMonths(t, -7, 27))} · Rakib Hasan`, text: 'Upgrade to Business after the Analytics trial.' },
  ] : [
    { key: 1, title: shop.src === 'Physical visit' ? 'In person · at the shop' : 'Video call · 40 min', when: `${dmy(d0)} · ${shop.by}`, text: shop.src === 'Physical visit' ? `Demo at the shop; signed up on the spot, ${PLAN_NAME[sub.plan]} plan.` : 'Walked through products, payments and the first order.' },
    ...(shop.helper ? [{ key: 2, title: 'Video call · 30 min', when: `${dmy(d0 + DAY)} · ${shop.helper}`, text: 'Imported products and set up delivery charges.' }] : []),
  ];
  const sessionLog = db.events.filter((e) => e.shopId === sid && e.kind === 'session').sort((a, b) => b.at - a.at).map((e) => ({ key: e.id, title: e.text.split(' — ')[0], when: `${dmy(e.at)} · ${e.by || ''}`, text: e.text.split(' — ')[1] || '' }));
  const onboarding = {
    sources: [...SOURCES, 'CSV import'].map((s) => ({ label: s, on: s === shop.src })),
    by: { ini: staffIni(shop.by), color: staffColor(shop.by), name: shop.by, team: { 'Rakib Hasan': 'Sales · field team', 'Tania Sultana': 'Sales', 'Farhana Akter': 'Support', 'Mahin Khan': 'Admin' }[shop.by] || 'Sales' },
    helper: shop.helper ? { ini: staffIni(shop.helper), color: staffColor(shop.helper), name: shop.helper, note: `${sessions.length + sessionLog.length} session${sessions.length + sessionLog.length === 1 ? '' : 's'}` } : { ini: '—', color: '#cbd5e1', name: 'Unassigned', note: 'no helper yet' },
    campaign: dgh ? { name: 'Elephant Road gadget cluster', sub: 'Field visits, Aug 2025 · 11 stores signed' } : shop.campaign ? { name: shop.campaign, sub: 'Campaign' } : { name: shop.src, sub: shop.ref ? 'Referred by ' + (shopOf(db, shop.ref) || {}).name : 'No campaign' },
    method: dgh ? { name: 'In person, then video call', sub: 'Fully set up in 7 days' } : { name: shop.src === 'Physical visit' ? 'In person' : shop.helper ? 'Video call' : 'Self-serve', sub: doneN === steps.length ? 'Fully set up' : `${doneN} of ${steps.length} steps done` },
    stepsTitle, steps, sessions: [...sessionLog, ...sessions],
  };

  // ---- support ----
  const TICKETS = dgh ? [
    { id: 'T-2291', subject: 'Steadfast parcels not syncing since this morning', pr: 'Urgent', shp: 'shp shp-err', status: 'Open · reply overdue 25 min', cls: 'pill p-err', opened: 'Today', open: true },
    { id: 'T-2203', subject: 'Barcode scanner not reading new stickers', pr: 'Normal', shp: 'shp shp-none', status: 'Solved in 2 h · rated 5', cls: 'pill p-ok', opened: dm(t - 29 * DAY), rating: 5 },
    { id: 'T-2150', subject: 'How to give a cashier discount rights', pr: 'Low', shp: 'shp shp-ok', status: 'Solved in 20 min · rated 5', cls: 'pill p-ok', opened: dm(t - 52 * DAY), rating: 5 },
    { id: 'T-2098', subject: 'Invoice for July with VAT', pr: 'Low', shp: 'shp shp-ok', status: 'Solved in 1 day · rated 4', cls: 'pill p-ok', opened: dm(t - 74 * DAY), rating: 4 },
  ] : (() => {
    const subjects = ['Courier charge shows twice on an order', 'How to add a second price list', 'Product photos not loading on mobile', 'Change the shop logo on invoices', 'bKash payment not showing on the order', 'Add a new staff member to the POS'];
    const n = Math.floor(r() * 4);
    return Array.from({ length: n }, (_, i) => {
      const openOne = i === 0 && (intPart < 50 || r() > 0.8);
      const rating = 4 + Math.round(r());
      return { id: 'T-' + (2000 + ((Number(sid) * 37 + i * 11) % 290)), subject: subjects[(Number(sid) + i) % subjects.length], pr: openOne ? 'Urgent' : i % 2 ? 'Low' : 'Normal', shp: openOne ? 'shp shp-err' : i % 2 ? 'shp shp-ok' : 'shp shp-none', status: openOne ? 'Open · waiting for us' : `Solved in ${1 + i} h · rated ${rating}`, cls: openOne ? 'pill p-err' : 'pill p-ok', opened: openOne ? 'Today' : dm(t - (10 + i * 23) * DAY), open: openOne, rating: openOne ? null : rating };
    });
  })();
  const ratings = TICKETS.filter((x) => x.rating);
  const access = [
    ...(shop.resetAt ? [{ key: 'r', at: shop.resetAt, text: 'Password reset link sent to the owner by SMS', by: shop.resetBy }] : []),
    ...db.events.filter((e) => e.shopId === sid && /PIN|reset|two-factor|Two-factor/i.test(e.text) && !/reset link sent by SMS, by/i.test(e.text)).map((e) => ({ key: e.id, at: e.at, text: e.text, by: e.by || 'Staff' })),
    ...(dgh ? [{ key: 's1', at: t - 98 * DAY, text: 'Owner asked for a reset link himself', by: 'Self' }, { key: 's2', at: shop.createdAt + 7 * DAY, text: 'Two-factor sign-in turned on for the owner', by: 'Owner' }] : [{ key: 's2', at: shop.createdAt + 2 * DAY, text: 'Owner set a password and signed in for the first time', by: 'Owner' }]),
  ].sort((a, b) => b.at - a.at).slice(0, 5).map((x) => ({ ...x, when: `${dmy(x.at)} ${hm(x.at)}` }));
  const issues = [];
  if (intPart < 50) issues.push(dgh ? 'Steadfast outage (not his fault)' : 'courier sync failing');
  if (overdueInv.length) issues.push(`${monthLong(overdueInv[0].period)} invoice overdue`);
  if (pendingAdj.length) issues.push(`${pendingAdj[0].type === 'credit' ? 'outage credit' : 'adjustment'} waiting for approval`);
  if (st.key === 'trial' && st.left <= 3) issues.push(`trial ends in ${st.left} days`);
  const pinned = notes.find((n) => n.pinned);
  const support = {
    kpis: [
      { label: 'Open tickets', value: String(TICKETS.filter((x) => x.open).length), note: TICKETS.some((x) => x.open) ? 'urgent · ' + (intPart < 50 ? 'courier' : 'support') : 'nothing open', cls: TICKETS.some((x) => x.open) ? 'dpill d-bad' : 'dpill d-good' },
      { label: 'Tickets, 90 days', value: String(TICKETS.length), note: TICKETS.length <= 6 ? 'below the average of 6' : 'above the average of 6', cls: TICKETS.length <= 6 ? 'dpill d-good' : 'dpill d-bad' },
      { label: 'Satisfaction', value: ratings.length ? (ratings.reduce((s, x) => s + x.rating, 0) / ratings.length).toFixed(1) + ' / 5' : '—', note: `${ratings.length} rating${ratings.length === 1 ? '' : 's'}`, cls: 'dpill d-good' },
      { label: 'First reply, median', value: dgh ? '12 min' : `${8 + Math.floor(r() * 20)} min`, note: 'target 30 min', cls: 'dpill d-good' },
    ],
    tickets: TICKETS, access,
    before: [
      pinned ? pinned.text : `Best time: ${r() > 0.5 ? 'after 20:00' : 'before noon'}. Speaks Bangla.`,
      issues.length ? 'Open issues: ' + issues.join(', ') + '.' : 'No open issues.',
    ],
  };

  // ---- affiliates ----
  const referred = db.shops.filter((x) => x.ref === sid).map((x) => {
    const xs = subState(db, x.id, t);
    const xp = db.payments.filter((q) => q.shopId === x.id && q.status === 'ok' && q.at < x.createdAt + 365 * DAY);
    const commission = Math.round(xp.reduce((s, q) => s + q.amount, 0) * 0.1);
    return { key: x.id, id: x.id, name: x.name, signed: dmy(x.createdAt), status: isPaying(xs) ? `Paying · ${PLAN_NAME[subOf(db, x.id).plan]}` : xs.label, cls: isPaying(xs) ? 'pill p-ok' : 'pill p-grey', commission: commission ? taka(commission) : 'Pending', amt: commission };
  });
  const earned = referred.reduce((s, x) => s + x.amt, 0);
  const thisMonthComm = Math.round(db.payments.filter((q) => referred.some((x) => x.id === q.shopId) && q.at >= startOfMonth(t)).reduce((s, q) => s + q.amount, 0) * 0.1);
  const affBars = dgh ? [31, 38, 44, 52, 58, 62] : Array.from({ length: 6 }, (_, i) => Math.round((5 + r() * 10) * (1 + i * 0.15)));
  const affMax = Math.max(...affBars);
  const refBy = shop.ref ? shopOf(db, shop.ref) : null;
  const affiliates = {
    link: `gridcommerce.com.bd/r/${shop.sub.slice(0, 6)}-${owner.split(' ')[0].toLowerCase()}`,
    referred, stats: { referred: referred.length, paying: referred.filter((x) => x.cls === 'pill p-ok').length, earned: taka(earned), paidOut: taka(Math.max(0, earned - thisMonthComm)) },
    own: {
      active: dgh ? 42 : Math.round(3 + r() * 30), activeNote: `+${dgh ? 6 : Math.round(r() * 5)} this month`,
      sales: taka(dgh ? 62400 : affBars[5] * 1000), salesNote: `${dgh ? 16 : Math.round(5 + r() * 15)}% of online sales`, salesLabel: `Affiliate sales, ${monthOf(t)}`,
      owes: taka(dgh ? 3120 : Math.round(affBars[5] * 50)),
      bars: affBars.map((v, i) => ({ key: i, v, h: Math.round((v / affMax) * 110) + 'px', label: monthOf(addMonths(t, i - 5, 1)) })),
    },
    top: dgh ? [{ key: 1, name: 'Tanvir Tech Reviews', where: 'YouTube', amt: '৳21,300' }, { key: 2, name: 'Mirpur Gadget Group', where: 'Facebook group', amt: '৳14,800' }, { key: 3, name: 'Nabil · campus rep', where: 'Referral code', amt: '৳8,900' }] : [{ key: 1, name: TEAM_NAMES[Number(sid) % 12].split(' ')[0] + ' Reviews', where: 'YouTube', amt: taka(affBars[5] * 400) }, { key: 2, name: shop.dist + ' Shoppers Group', where: 'Facebook group', amt: taka(affBars[5] * 250) }],
    referredBy: refBy ? `Referred by ${refBy.name} (tenant ${refBy.id}); they earn 10% of this store's payments for 12 months.` : `Not referred by anyone: came from ${shop.src === 'Physical visit' ? 'a field visit' : shop.src}.`,
  };

  // ---- activity ----
  const actRows = [];
  const push = (atMs, kind, text, key) => actRows.push({ key, at: atMs, kind, text });
  for (const e of db.events.filter((x) => x.shopId === sid)) push(e.at, e.kind === 'session' ? 'staff' : e.kind, e.text, e.id);
  for (const i of db.invoices.filter((x) => x.shopId === sid)) {
    if (i.issuedAt <= t) push(i.issuedAt, 'system', i.noCharge ? `${i.id} · trial started, no charge` : `${i.id} issued · ${taka(i.total)}, due ${dm(i.dueAt)}`, i.id + ':i');
    const lp = lastPayment(db, i.id);
    if (!i.noCharge && i.dueAt + DAY <= t && (!lp || lp.at > i.dueAt + DAY)) push(i.dueAt + 60000, 'system', `${i.id} became overdue; store entered grace`, i.id + ':o');
    for (const c of i.charges || []) if (!c.ok) push(c.at, 'billing', `Automatic charge for ${i.id} failed · ${c.method} · will retry`, i.id + ':c' + c.at);
  }
  for (const q of pays) push(q.at, 'billing', `${taka(q.amount)} received for ${q.invoiceId} · ${paidVia(q)}${q.by && q.by !== 'Owner' && q.by !== 'Auto-charge' ? ', by ' + q.by : ''}`, q.id);
  for (const c of calls) push(c.at, c.by === 'System' ? 'system' : 'staff', c.outcome === 'reminder' ? c.note : `Collection call: ${c.note.charAt(0).toLowerCase() + c.note.slice(1)}${c.by !== 'System' ? ', by ' + c.by : ''}`, c.id);
  for (const a of db.adjustments.filter((x) => x.shopId === sid)) {
    push(a.at, 'staff', `${a.id}: ${a.type} ${taka(a.amount)} asked by ${a.by} · ${REASON_LABEL[a.reason] || a.reason}`, a.id + ':r');
    if (a.decidedAt && a.decidedBy !== 'auto') push(a.decidedAt, 'billing', `${a.id} ${a.status} by ${a.decidedBy}${a.cnId ? ' · ' + a.cnId + ' issued' : ''}`, a.id + ':d');
  }
  for (const n of notes) push(n.at, 'staff', `${n.kind === 'task' ? 'Task' : 'Note'} by ${n.by}: ${n.text.slice(0, 80)}${n.text.length > 80 ? '…' : ''}`, n.id);
  const KIND = { owner: ['Owner', 'pill p-sky'], team: ['Team', 'pill p-sky'], staff: ['Staff', 'pill p-navy'], billing: ['Billing', 'pill p-warn'], system: ['System', 'pill p-grey'] };
  const activity = actRows.filter((x) => x.at <= t).sort((a, b) => b.at - a.at).slice(0, 60).map((x) => ({ ...x, label: (KIND[x.kind] || KIND.system)[0], cls: (KIND[x.kind] || KIND.system)[1], when: daysBetween(x.at, t) === 0 ? 'Today ' + hm(x.at) : yearOf(x.at) === yearOf(t) ? dmhm(x.at) : dmy(x.at) }));

  return {
    shop, sub, st, hl, head, facts,
    tabsCount: { billing: overdueInv.length || (open.length ? open.length : 0), support: TICKETS.filter((x) => x.open).length },
    overview: { kpis: overviewKpis, salesChart, health: healthBox, teamTitle: `Owner and team · ${team.length} of ${seats} seats`, team, integrations, notes: noteRows, controls },
    billing: { kpis: billKpis, rows: billRows, banner, payable, defaultInvoice: firstOpen ? firstOpen.id : '', defaultAmount: firstOpen ? String(balance(db, firstOpen)) : '', invoices: invRows, calls: callRows, autoCharge: sub.autoCharge, payMethod: sub.payMethod, methods: METHODS, via: VIA, collectors: COLLECTORS, addons: ADDONS, nextDue },
    modules: { sets, trialLegend: runningTrial ? `Trial · ${trialLeft} days left` : 'Trial', options: TRIALABLE, locked: lockedTried.map((x, i) => ({ ...x, key: i, width: Math.round((x.n / maxTried) * 100) + '%', color: ['#003087', '#2e559d', '#0070a0'][i] })), history: trialHistory },
    onboarding, support, affiliates, activity,
    plan,
  };
}
