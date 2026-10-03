// Reports · Marketing & support group. See ../catalogue.js for the definition contract.
//   ad-spend-roas      ad spend against the delivered sales credited to each campaign (attribution model), Delivered
//                      ROAS and cost per delivered order (metric dictionary, ../metrics.js)
//   discounts-coupons  money given off: item, bill, coupon, member and points discounts
//   promo-results      flash sales: units, sales, discount cost and the lift in shop sales
//   team-inbox         chats by agent and channel: first reply, closed, chats that became orders
//   calls-report       calls answered and missed, waiting time, outcomes and callbacks
//   comments-report    comments on posts: unanswered, intents, reply time
//   blog-report        blog posts: views, top posts, SEO scores, by author (as of now)
//   referrals-report   invite-a-friend: friends joined, bought, rewards earned and paid

import * as salesBook from '../../salesBook';
import { getOrders } from '../../orders';
import { getAdSpend } from '../../adSpend';
import { getInvoices } from '../../invoices';
import { POS_KEYS, load } from '../../posStore';
import { getConvs, getCalls, getComments, staffName, channelName, POSTS, INTENTS } from '../../inbox';
import { getPosts, getAuthors, seoScore } from '../../blog';
import { getReferralRecords, getMembers } from '../../loyalty';
import { formatBDT } from '../../format';
import { bucketsOf, sum, groupBy, addDays, startOfDay } from '../period';
import { metricValue } from '../metrics';
import { creditTable, modelLabel } from '../../attribution';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const avg = (list) => (list.length ? list.reduce((a, x) => a + x, 0) / list.length : 0);
const inP = (t, from, to) => typeof t === 'number' && t >= from && t < to;
const MIN = 60e3;

/** Sale lines from the sales book (empty until the line-level book is there). */
const saleLines = () => safe(() => (typeof salesBook.getSaleLines === 'function' ? salesBook.getSaleLines() : []), []);
const channelTotals = (from, to) => safe(() => salesBook.salesByChannel(from, to), null);

// ---- ad spend & ROAS ------------------------------------------------------------------------------
const PLATFORM_CHANNEL = { Facebook: 'meta_ads', Instagram: 'meta_ads', Google: 'google_ads', TikTok: 'tiktok_ads' };
const adSpendRoas = {
  id: 'ad-spend-roas',
  group: 'marketing',
  title: 'Ad spend & ROAS',
  description: 'What you paid for ads, the delivered sales credited to each campaign, Delivered ROAS and the cost of each delivered order.',
  icon: 'megaphone',
  keywords: 'ads facebook instagram google tiktok boost campaign roas delivered return on ad spend cost per order marketing attribution',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to }) {
    const ctx = { from, to };
    const ads = getAdSpend().filter((a) => inP(a.at, from, to));
    const spend = sum(ads, (a) => a.amount);
    const ch = channelTotals(from, to);
    const onlineSales = ch ? ch.Online.revenue : 0;
    const onlineOrders = ch ? ch.Online.orders : 0;
    // credit for orders delivered in the period, under the shop's attribution model
    const cred = safe(() => creditTable({ from, to, basis: 'delivered' }), { rows: [], total: { delivered: 0, deliveredSales: 0 } });
    const paid = cred.rows.filter((r) => r.paid);
    const paidDelivered = paid.reduce((a, r) => a + r.delivered, 0);
    const campaigns = [...groupBy(ads, (a) => a.platform + '|' + a.campaign)].map(([, list]) => ({ platform: list[0].platform, campaign: list[0].campaign, spend: sum(list, (a) => a.amount) }));
    const credited = (c) => {
      const row = paid.find((r) => r.channel === PLATFORM_CHANNEL[c.platform]);
      return (row && row.campaigns.find((x) => x.campaign === c.campaign)) || { delivered: 0, deliveredSales: 0 };
    };
    const rows = campaigns.map((c) => {
      const got = credited(c);
      return { platform: c.platform, campaign: c.campaign, spend: c.spend, orders: Math.round(got.delivered * 10) / 10, sales: r2(got.deliveredSales), roas: c.spend ? r2(got.deliveredSales / c.spend) : null, cpo: got.delivered ? r2(c.spend / got.delivered) : null, _href: '/campaigns' };
    });
    // delivered sales credited to channels nobody paid for
    cred.rows.filter((r) => !r.paid && r.delivered > 0).forEach((r) => rows.push({ platform: '—', campaign: r.name + ' · no paid ads', spend: 0, orders: Math.round(r.delivered * 10) / 10, sales: r2(r.deliveredSales), roas: null, cpo: null }));
    const { buckets, keyOf } = bucketsOf(from, to);
    const spendS = buckets.map(() => 0), salesS = buckets.map(() => 0);
    const at = (t) => buckets.findIndex((b) => b.key === keyOf(t));
    ads.forEach((a) => { const i = at(a.at); if (i >= 0) spendS[i] += a.amount; });
    if (ch) Object.entries(ch.Online.days).forEach(([k, v]) => { const i = buckets.findIndex((b) => b.key === keyOf(new Date(k + 'T12:00').getTime())); if (i >= 0) salesS[i] += v; });
    const top = campaigns.slice().sort((a, b) => b.spend - a.spend)[0];
    const roas = metricValue('delivered_roas', ctx), cpo = metricValue('cost_per_delivered', ctx);
    return {
      kpis: [
        { key: 'spend', metric: 'ad_spend', label: 'Ad spend', value: spend, format: 'money', good: 'none', sub: ads.length ? `${ads.length} payment${ads.length === 1 ? '' : 's'} · ${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}` : 'No ad spend recorded' },
        { key: 'sales', metric: 'sales', label: 'Online sales', value: r2(onlineSales), format: 'money', good: 'up', sub: `${onlineOrders} online orders` },
        { key: 'roas', metric: 'delivered_roas', label: 'Delivered ROAS', value: roas == null ? null : r2(roas), format: 'num', good: 'up', sub: modelLabel() },
        { key: 'cpo', metric: 'cost_per_delivered', label: 'Cost per delivered order', value: cpo == null ? null : r2(cpo), format: 'money', good: 'down', sub: `${Math.round(paidDelivered)} delivered from ads` },
        { key: 'fromads', label: 'Delivered orders from ads', value: Math.round(paidDelivered), format: 'int', good: 'up', sub: top ? `Most spend: ${top.campaign}` : '' },
      ],
      chart: { type: 'bar', labels: buckets.map((b) => b.label), series: [{ name: 'Ad spend', tone: 'warning', values: spendS }, { name: 'Online sales', tone: 'primary', values: salesS.map(r2) }], format: 'money0' },
      table: {
        columns: [
          { key: 'campaign', label: 'Campaign' },
          { key: 'platform', label: 'Platform' },
          { key: 'spend', label: 'Spend', format: 'money', total: 'sum' },
          { key: 'orders', label: 'Delivered orders', format: 'num', total: 'sum' },
          { key: 'sales', label: 'Delivered sales', format: 'money', total: 'sum' },
          { key: 'roas', label: 'Delivered ROAS', format: 'num', total: roas == null ? null : r2(roas) },
          { key: 'cpo', label: 'Per delivered order', format: 'money' },
        ],
        rows,
        sort: { key: 'spend', dir: 'desc' },
      },
      notes: [
        `Credit: ${modelLabel()} (change it on Attribution & UTM). Delivered sales are goods value before VAT and delivery charges, counted on the day the courier delivered.`,
        'Delivered ROAS = delivered sales credited to ads ÷ ad spend. Add ad spend with “Add ad spend” so it shows here and in Marketing expenses.',
      ],
    };
  },
};

// ---- discounts & coupons ----------------------------------------------------------------------------
const DISC_TYPES = [['lineDisc', 'Item discounts'], ['cartDisc', 'Bill discount'], ['couponDisc', 'Coupon'], ['memberDisc', 'Member discount'], ['pointsDisc', 'Loyalty points used']];
const discountsCoupons = {
  id: 'discounts-coupons',
  group: 'marketing',
  title: 'Discounts & coupons',
  description: 'How much was given off prices, by kind of discount and coupon code, and how much of your sales it touched.',
  icon: 'ticket-percent',
  keywords: 'discount coupon code promo member points money off markdown',
  filters: ['channel'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const chOk = (ch) => !filters.channel || ch === filters.channel;
    // bills that keep their discounts by kind: POS sales and the demo invoices
    const pos = safe(() => load(POS_KEYS.sales, []), []);
    const posIds = new Set(pos.map((s) => s.id));
    const bills = [...pos, ...safe(() => getInvoices(), []).filter((i) => i.src === 'demo' && !posIds.has(i.id))]
      .map((s) => ({ ...s, channel: s.wholesale ? 'Wholesale' : 'Retail' }))
      .filter((s) => inP(s.at, from, to) && chOk(s.channel));
    const groups = new Map();
    const add = (label, type, amount, bill) => {
      if (!(amount > 0)) return;
      const g = groups.get(label) || groups.set(label, { label, type, discount: 0, bills: new Set(), channels: new Set() }).get(label);
      g.discount += amount; g.bills.add(bill.id); g.channels.add(bill.channel);
    };
    let grossBills = 0;
    bills.forEach((b) => {
      const t = b.totals || {};
      grossBills += Number(t.gross) || 0;
      DISC_TYPES.forEach(([k, label]) => add(k === 'couponDisc' ? `Coupon · ${b.coupon || t.coupon || t.couponCode || 'code not saved'}` : label, label, Number(t[k]) || 0, b));
    });
    const typed = sum([...groups.values()], (g) => g.discount);
    const withDisc = new Set(bills.filter((b) => DISC_TYPES.some(([k]) => (Number((b.totals || {})[k]) || 0) > 0)).map((b) => b.id));
    // the line book knows every discount (online and demo days too) but not its kind
    const lines = saleLines().filter((l) => inP(l.at, from, to) && chOk(l.channel));
    const lineDisc = sum(lines, (l) => l.disc);
    const lineGross = sum(lines, (l) => (Number(l.revenue) || 0) + (Number(l.disc) || 0));
    const rest = lines.length ? r2(lineDisc - typed) : 0;
    if (rest > 0.5) {
      const ids = new Set(lines.filter((l) => l.disc > 0 && !withDisc.has(l.saleId)).map((l) => l.saleId));
      groups.set('Other discounts', { label: 'Other discounts (kind not recorded)', type: 'Other', discount: rest, bills: ids, channels: new Set(lines.filter((l) => l.disc > 0 && !withDisc.has(l.saleId)).map((l) => l.channel)) });
      ids.forEach((id) => withDisc.add(id));
    }
    const total = r2(typed + Math.max(0, rest));
    const gross = lines.length ? Math.max(lineGross, grossBills) : grossBills;
    const nBills = lines.length ? new Set(lines.map((l) => l.saleId)).size : bills.length;
    const rows = [...groups.values()].map((g) => ({ label: g.label, type: g.type, channels: [...g.channels].join(', '), bills: g.bills.size, discount: r2(g.discount), share: total ? g.discount / total : 0, per: g.bills.size ? g.discount / g.bills.size : 0 }));
    const byType = [...groupBy(rows, (r) => r.type)].map(([type, list]) => ({ type, amount: sum(list, (r) => r.discount) })).sort((a, b) => b.amount - a.amount);
    const coupon = sum(rows.filter((r) => r.type === 'Coupon'), (r) => r.discount);
    return {
      kpis: [
        { key: 'total', label: 'Discount given', value: total, format: 'money', good: 'none' },
        { key: 'rate', label: 'Of sales before discount', value: gross ? total / gross : 0, format: 'pct', good: 'down' },
        { key: 'bills', label: 'Bills with a discount', value: withDisc.size, format: 'int', good: 'none', sub: nBills ? `of ${nBills} bills` : '' },
        { key: 'coupon', label: 'Coupon discounts', value: coupon, format: 'money', good: 'none', sub: ((n) => `${n} bill${n === 1 ? '' : 's'} with a code`)(rows.filter((r) => r.type === 'Coupon').reduce((a, r) => a + r.bills, 0)) },
      ],
      chart: { type: 'donut', labels: byType.map((t) => t.type), series: [{ name: 'Discount', values: byType.map((t) => t.amount) }], format: 'money0' },
      table: {
        columns: [
          { key: 'label', label: 'Discount' },
          { key: 'channels', label: 'Channel' },
          { key: 'bills', label: 'Bills', format: 'int' },
          { key: 'discount', label: 'Discount', format: 'money', total: 'sum' },
          { key: 'per', label: 'Per bill', format: 'money' },
          { key: 'share', label: 'Share', format: 'pct' },
        ],
        rows,
        sort: { key: 'discount', dir: 'desc' },
      },
      notes: [
        'Kinds come from the bills made at the POS and the invoices: item discounts, the bill discount, coupons, member discounts and loyalty points taken off the bill.',
        'Online orders and demo September days only record the discount on each line, so they show under “Other discounts”. Coupon codes are listed by code where the sale kept it.',
      ],
    };
  },
};

// ---- flash sales & promos -----------------------------------------------------------------------------
const T = (m, d, h = 0, mi = 0) => new Date(2026, m - 1, d, h, mi).getTime();
/** The flash sales on Promo › Flash sales (demo figures kept on that page): [from, to), pieces sold, sales, average discount. */
export const FLASH_SALES = [
  { name: 'Weekend Mega Sale', products: 12, from: T(9, 18, 18), to: T(9, 21), sold: 184, sales: 142300, off: 0.3, offText: 'up to 40% off' },
  { name: 'Night Deals', products: 6, from: T(9, 18, 21), to: T(9, 19), sold: 38, sales: 44600, off: 0.25, offText: '25% off' },
  { name: 'Skin care week', products: 8, from: T(9, 22), to: T(9, 29), sold: 0, sales: 0, off: 0.25, offText: '25% off' },
  { name: 'Puja Special', products: 15, from: T(10, 8), to: T(10, 14), sold: 0, sales: 0, off: 0.2, offText: 'up to 30% off' },
  { name: 'Month-end Clearance', products: 20, from: T(8, 28), to: T(9, 1), sold: 402, sales: 198400, off: 0.35, offText: 'up to 50% off' },
  { name: 'Independence Day Deals', products: 10, from: T(8, 15), to: T(8, 18), sold: 215, sales: 87100, off: 0.16, offText: '16% off' },
];
const promoResults = {
  id: 'promo-results',
  group: 'marketing',
  title: 'Flash sale & promo results',
  description: 'Each flash sale that ran in the period: pieces sold, sales, what the discount cost, and how much shop sales rose on those days.',
  icon: 'zap',
  keywords: 'flash sale promotion promo campaign uplift discount cost offer',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to, now }) {
    const list = FLASH_SALES.filter((p) => p.from < to && p.to > from);
    const daySales = (a, b) => { const ch = channelTotals(a, b); return ch ? ch.all.revenue : 0; };
    const days = (a, b) => Math.max(1, Math.round((startOfDay(b - 1) - startOfDay(a)) / 864e5) + 1);
    const rows = list.map((p) => {
      const a = startOfDay(p.from), b = addDays(startOfDay(p.to - 1), 1);
      const during = daySales(a, b) / days(a, b);
      const before = daySales(addDays(a, -14), a) / 14;
      const cost = p.sales ? Math.round((p.sales * p.off) / (1 - p.off)) : 0;
      const status = (now || Date.now()) < p.from ? 'Not started' : (now || Date.now()) < p.to ? 'Running' : 'Ended';
      return { name: p.name, dates: `${new Date(p.from).getDate()} ${new Date(p.from).toLocaleString('en', { month: 'short' })} – ${new Date(p.to - 1).getDate()} ${new Date(p.to - 1).toLocaleString('en', { month: 'short' })}`, offText: p.offText, status, sold: p.sold, sales: p.sales, cost, during: r2(during), before: r2(before), uplift: before ? during / before - 1 : null, _href: '/flash-sales' };
    });
    const sales = sum(rows, (r) => r.sales);
    const best = rows.filter((r) => r.uplift != null).sort((a, b) => b.uplift - a.uplift)[0];
    return {
      kpis: [
        { key: 'promos', label: 'Flash sales in the period', value: rows.length, format: 'int', good: 'none' },
        { key: 'sales', label: 'Flash sale sales', value: sales, format: 'money', good: 'up' },
        { key: 'units', label: 'Pieces sold', value: sum(rows, (r) => r.sold), format: 'int', good: 'up' },
        { key: 'cost', label: 'Discount cost', value: sum(rows, (r) => r.cost), format: 'money', good: 'down', sub: sales ? `${Math.round((sum(rows, (r) => r.cost) / (sales + sum(rows, (r) => r.cost))) * 100)}% off on average` : '' },
        { key: 'lift', label: 'Best lift in shop sales', value: best ? best.uplift : null, format: 'pct', good: 'up', sub: best ? best.name : 'No sales before to compare' },
      ],
      chart: { type: 'hbar', labels: rows.map((r) => r.name), series: [{ name: 'Sales', tone: 'primary', values: rows.map((r) => r.sales) }, { name: 'Discount cost', tone: 'warning', values: rows.map((r) => r.cost) }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Flash sale' },
          { key: 'dates', label: 'Dates' },
          { key: 'offText', label: 'Offer' },
          { key: 'status', label: 'Status' },
          { key: 'sold', label: 'Pieces', format: 'int', total: 'sum' },
          { key: 'sales', label: 'Sales', format: 'money', total: 'sum' },
          { key: 'cost', label: 'Discount cost', format: 'money', total: 'sum' },
          { key: 'during', label: 'Shop sales a day', format: 'money0' },
          { key: 'before', label: 'Day before (14-day avg)', format: 'money0' },
          { key: 'uplift', label: 'Lift', format: 'pct' },
        ],
        rows,
        sort: { key: 'sales', dir: 'desc' },
      },
      notes: [
        'Pieces, sales and the offer are the figures on Promo › Flash sales (demo, kept on that page). Discount cost is worked out from the average discount: sales × discount ÷ (1 − discount).',
        'Shop sales a day are all channels from the sales book on the sale’s days, against the 14 days before it started.',
      ],
    };
  },
};

// ---- team inbox -----------------------------------------------------------------------------------
const orderOfMsg = (m) => (m.type === 'order' && m.order) || ((m.from === 'system' && m.icon === 'shopping-bag' && /#\w+/.exec(m.text || '')) || [])[0] || '';
const teamInbox = {
  id: 'team-inbox',
  group: 'marketing',
  title: 'Team inbox',
  description: 'Chats per agent and channel: how fast the first reply came, how many were closed and how many turned into orders.',
  icon: 'messages-square',
  keywords: 'inbox chat messenger whatsapp instagram agent support first response resolution team',
  filters: [],
  defaultPeriod: 'week',
  compute({ from, to }) {
    const orders = new Map(safe(() => getOrders(), []).map((o) => [o.id, o]));
    const convs = safe(() => getConvs(), []).map((c) => {
      const msgs = (c.messages || []).filter((m) => inP(m.at, from, to));
      const firstIn = msgs.find((m) => m.from === 'customer');
      if (!firstIn && !msgs.some((m) => m.from === 'agent')) return null;
      const reply = firstIn ? (c.messages || []).find((m) => m.from === 'agent' && m.at > firstIn.at) : null;
      const closedMsg = msgs.find((m) => m.from === 'system' && m.icon === 'circle-check');
      const ids = [...new Set(msgs.map(orderOfMsg).filter(Boolean))];
      const value = ids.reduce((a, id) => a + ((orders.get(id) || {}).amount || 0), 0);
      return {
        id: c.id, ch: c.ch, agent: c.assignee ? staffName(c.assignee) : 'Unassigned', replies: msgs.filter((m) => m.from === 'agent').length,
        first: reply ? (reply.at - firstIn.at) / MIN : null, waiting: !!firstIn && !reply,
        closed: !!closedMsg || (c.status === 'closed' && msgs.length > 0), resolve: closedMsg && firstIn ? (closedMsg.at - firstIn.at) / MIN : null,
        orders: ids.length, value,
      };
    }).filter(Boolean);
    const rows = [...groupBy(convs, (c) => c.agent)].map(([agent, list]) => {
      const firsts = list.map((c) => c.first).filter((x) => x != null);
      return { agent, convs: list.length, replies: sum(list, (c) => c.replies), first: firsts.length ? Math.round(avg(firsts)) : null, waiting: list.filter((c) => c.waiting).length, closed: list.filter((c) => c.closed).length, orders: sum(list, (c) => c.orders), value: sum(list, (c) => c.value), _href: '/merchant-inbox' };
    });
    const firsts = convs.map((c) => c.first).filter((x) => x != null);
    const closed = convs.filter((c) => c.closed).length;
    const byCh = [...groupBy(convs, (c) => channelName(c.ch))].map(([ch, list]) => [ch, list.length]).sort((a, b) => b[1] - a[1]);
    return {
      kpis: [
        { key: 'convs', label: 'Conversations', value: convs.length, format: 'int', good: 'up', sub: `${sum(convs, (c) => c.replies)} replies sent` },
        { key: 'first', label: 'First reply, average (minutes)', value: firsts.length ? Math.round(avg(firsts)) : null, format: 'int', good: 'down', sub: `${convs.filter((c) => c.waiting).length} still waiting for a first reply` },
        { key: 'closed', label: 'Closed', value: convs.length ? closed / convs.length : 0, format: 'pct', good: 'up', sub: `${closed} of ${convs.length}` },
        { key: 'orders', label: 'Chats → orders', value: sum(convs, (c) => c.orders), format: 'int', good: 'up', sub: `${formatBDT(Math.round(sum(convs, (c) => c.value)))} of orders` },
      ],
      chart: { type: 'hbar', labels: byCh.map((x) => x[0]), series: [{ name: 'Conversations', tone: 'primary', values: byCh.map((x) => x[1]) }], format: 'int' },
      table: {
        columns: [
          { key: 'agent', label: 'Agent' },
          { key: 'convs', label: 'Conversations', format: 'int', total: 'sum' },
          { key: 'replies', label: 'Replies', format: 'int', total: 'sum' },
          { key: 'first', label: 'First reply (min)', format: 'int', total: firsts.length ? Math.round(avg(firsts)) : null },
          { key: 'waiting', label: 'Waiting', format: 'int', total: 'sum' },
          { key: 'closed', label: 'Closed', format: 'int', total: 'sum' },
          { key: 'orders', label: 'Orders', format: 'int', total: 'sum' },
          { key: 'value', label: 'Order value', format: 'money', total: 'sum' },
        ],
        rows,
        sort: { key: 'convs', dir: 'desc' },
      },
      notes: [
        'A conversation counts when the customer wrote or an agent replied in the period; it belongs to the agent it is assigned to. First reply is from the customer’s first message in the period to the next agent reply.',
        'Chats → orders are orders created from the chat or sent in it.',
      ],
    };
  },
};

// ---- calls ------------------------------------------------------------------------------------------
const INCOMING = ['in', 'missed', 'voicemail'];
const callsReport = {
  id: 'calls-report',
  group: 'marketing',
  title: 'Calls',
  description: 'Calls answered and missed, how long callers waited, what the calls were about and the callbacks still to make.',
  icon: 'phone-call',
  keywords: 'calls phone missed answered callback hotline outcome wait time agent',
  filters: [],
  defaultPeriod: 'week',
  compute({ from, to }) {
    const calls = safe(() => getCalls(), []).filter((c) => inP(c.at, from, to));
    const incoming = calls.filter((c) => INCOMING.includes(c.dir));
    const answered = calls.filter((c) => c.dir === 'in');
    const missed = calls.filter((c) => c.dir === 'missed' || c.dir === 'voicemail');
    const waits = incoming.map((c) => Number(c.wait) || 0).filter((x) => x > 0);
    const outcome = (c) => c.result || (c.dir === 'missed' || c.dir === 'voicemail' ? 'Missed' : 'No outcome noted');
    const outcomes = [...groupBy(calls, outcome)].map(([k, list]) => [k, list.length]).sort((a, b) => b[1] - a[1]);
    const top = outcomes.slice(0, 5);
    if (outcomes.length > 5) top.push(['Other', outcomes.slice(5).reduce((a, x) => a + x[1], 0)]);
    const rows = [...groupBy(calls, (c) => (c.agent ? staffName(c.agent) : 'Nobody (missed)'))].map(([agent, list]) => {
      const talked = list.filter((c) => (Number(c.dur) || 0) > 0);
      return {
        agent, calls: list.length, answered: list.filter((c) => c.dir === 'in').length, out: list.filter((c) => c.dir === 'out').length, missed: list.filter((c) => c.dir === 'missed' || c.dir === 'voicemail').length,
        talk: r2(sum(list, (c) => c.dur) / 60), avgTalk: talked.length ? Math.round(avg(talked.map((c) => Number(c.dur)))) : null,
        resolved: list.filter((c) => ['Resolved', 'Order created', 'Payment verified'].includes(c.result)).length, orders: list.filter((c) => c.result === 'Order created').length, _href: '/merchant-calls',
      };
    });
    const due = calls.filter((c) => c.callback === 'due' || c.result === 'Callback needed').length;
    return {
      kpis: [
        { key: 'calls', label: 'Calls', value: calls.length, format: 'int', good: 'none', sub: `${incoming.length} in · ${calls.length - incoming.length} out` },
        { key: 'answered', label: 'Incoming answered', value: incoming.length ? answered.length / incoming.length : null, format: 'pct', good: 'up', sub: `${answered.length} of ${incoming.length}` },
        { key: 'missed', label: 'Missed', value: missed.length, format: 'int', good: 'down', sub: `${missed.filter((c) => c.callback === 'done').length} called back` },
        { key: 'wait', label: 'Wait before answer (seconds)', value: waits.length ? Math.round(avg(waits)) : null, format: 'int', good: 'down' },
        { key: 'callbacks', label: 'Callbacks still to make', value: due, format: 'int', good: 'down' },
      ],
      chart: { type: 'donut', labels: top.map((x) => x[0]), series: [{ name: 'Calls', values: top.map((x) => x[1]) }], format: 'int' },
      table: {
        columns: [
          { key: 'agent', label: 'Agent' },
          { key: 'calls', label: 'Calls', format: 'int', total: 'sum' },
          { key: 'answered', label: 'Answered', format: 'int', total: 'sum' },
          { key: 'out', label: 'Outgoing', format: 'int', total: 'sum' },
          { key: 'missed', label: 'Missed', format: 'int', total: 'sum' },
          { key: 'talk', label: 'Talk time (min)', format: 'num', total: 'sum' },
          { key: 'avgTalk', label: 'Average call (sec)', format: 'int' },
          { key: 'resolved', label: 'Sorted on the call', format: 'int', total: 'sum' },
          { key: 'orders', label: 'Orders taken', format: 'int', total: 'sum' },
        ],
        rows,
        sort: { key: 'calls', dir: 'desc' },
      },
      notes: [
        'Answered is incoming calls picked up out of all incoming calls (missed calls and voicemails included). Wait is how long the caller rang before an answer or hang-up.',
        '“Sorted on the call” means resolved, an order created or a payment verified.',
      ],
    };
  },
};

// ---- comments -----------------------------------------------------------------------------------------
const commentsReport = {
  id: 'comments-report',
  group: 'marketing',
  title: 'Comments on posts',
  description: 'Comments on your Facebook, Instagram, TikTok and LinkedIn posts: which still need an answer, what people asked for and how fast the team replied.',
  icon: 'message-circle',
  keywords: 'comments moderation social facebook instagram tiktok post reel unanswered intent spam',
  filters: [],
  defaultPeriod: 'week',
  compute({ from, to }) {
    const list = safe(() => getComments(), []).filter((c) => inP(c.at, from, to));
    const open = (c) => c.status === 'open' && c.intent !== 'spam';
    const replyMin = (c) => { const r = (c.replies || [])[0]; return r && r.at >= c.at ? (r.at - c.at) / MIN : null; };
    const times = list.map(replyMin).filter((x) => x != null);
    const posts = new Map(POSTS.map((p) => [p.id, p]));
    const rows = [...groupBy(list, (c) => c.post)].map(([id, cs]) => {
      const p = posts.get(id) || { title: id, ch: '', kind: 'Post' };
      const t = cs.map(replyMin).filter((x) => x != null);
      return { post: p.title, ch: p.ch ? channelName(p.ch) : '—', kind: p.kind, comments: cs.length, open: cs.filter(open).length, order: cs.filter((c) => c.intent === 'order').length, price: cs.filter((c) => c.intent === 'price').length, complaint: cs.filter((c) => c.intent === 'complaint').length, hidden: cs.filter((c) => c.status === 'hidden' || c.intent === 'spam').length, reply: t.length ? Math.round(avg(t)) : null, _href: '/merchant-inbox?view=comments' };
    });
    const intents = Object.entries(INTENTS).map(([k, v]) => [v.label, list.filter((c) => c.intent === k).length]).filter((x) => x[1]);
    return {
      kpis: [
        { key: 'comments', label: 'Comments', value: list.length, format: 'int', good: 'up', sub: `on ${rows.length} post${rows.length === 1 ? '' : 's'}` },
        { key: 'open', label: 'Waiting for an answer', value: list.filter(open).length, format: 'int', good: 'down' },
        { key: 'reply', label: 'Reply time, average (minutes)', value: times.length ? Math.round(avg(times)) : null, format: 'int', good: 'down' },
        { key: 'order', label: 'Want to order or ask a price', value: list.filter((c) => c.intent === 'order' || c.intent === 'price').length, format: 'int', good: 'up' },
        { key: 'complaint', label: 'Complaints', value: list.filter((c) => c.intent === 'complaint').length, format: 'int', good: 'down' },
      ],
      chart: { type: 'donut', labels: intents.map((x) => x[0]), series: [{ name: 'Comments', values: intents.map((x) => x[1]) }], format: 'int' },
      table: {
        columns: [
          { key: 'post', label: 'Post' },
          { key: 'ch', label: 'Channel' },
          { key: 'kind', label: 'Type' },
          { key: 'comments', label: 'Comments', format: 'int', total: 'sum' },
          { key: 'open', label: 'Unanswered', format: 'int', total: 'sum' },
          { key: 'order', label: 'Order intent', format: 'int', total: 'sum' },
          { key: 'price', label: 'Price asks', format: 'int', total: 'sum' },
          { key: 'complaint', label: 'Complaints', format: 'int', total: 'sum' },
          { key: 'hidden', label: 'Spam or hidden', format: 'int', total: 'sum' },
          { key: 'reply', label: 'Reply time (min)', format: 'int' },
        ],
        rows,
        sort: { key: 'open', dir: 'desc' },
      },
      notes: ['Unanswered are open comments that are not spam. Reply time is from the comment to the first public reply.'],
    };
  },
};

// ---- blog -------------------------------------------------------------------------------------------
const blogReport = {
  id: 'blog-report',
  group: 'marketing',
  title: 'Blog content',
  description: 'Your blog as it stands: posts published, views, the most read posts, SEO scores and each author’s share.',
  icon: 'newspaper',
  keywords: 'blog posts content seo views author articles',
  filters: [],
  snapshot: true,
  defaultPeriod: 'month',
  compute() {
    const posts = safe(() => getPosts(), []);
    const authors = new Map(safe(() => getAuthors(), []).map((a) => [a.id, a.name]));
    const STATUS = { published: 'Published', scheduled: 'Scheduled', draft: 'Draft', archived: 'Archived', review: 'In review' };
    const rows = posts.map((p) => {
      const s = safe(() => seoScore(p), { score: 0, label: '—' });
      return { title: p.title || 'Untitled', status: STATUS[p.status] || p.status, author: authors.get(p.authorId) || '—', at: p.publishAt ? new Date(p.publishAt).getTime() : null, views: p.views || 0, month: p.viewsMonth || 0, comments: p.comments || 0, seo: s.score, seoLabel: s.label, _href: '/blog-editor?id=' + encodeURIComponent(p.id) };
    });
    const live = rows.filter((r) => r.status === 'Published');
    const byAuthor = [...groupBy(rows.filter((r) => r.views), (r) => r.author)].map(([a, list]) => [a, sum(list, (r) => r.views), sum(list, (r) => r.month)]).sort((a, b) => b[1] - a[1]);
    return {
      kpis: [
        { key: 'live', label: 'Published posts', value: live.length, format: 'int', good: 'up', sub: `${rows.filter((r) => r.status === 'Scheduled').length} scheduled · ${rows.filter((r) => r.status === 'Draft').length} drafts` },
        { key: 'views', label: 'Views, all time', value: sum(rows, (r) => r.views), format: 'int', good: 'up' },
        { key: 'month', label: 'Views, last 30 days', value: sum(rows, (r) => r.month), format: 'int', good: 'up' },
        { key: 'seo', label: 'Average SEO score', value: live.length ? Math.round(avg(live.map((r) => r.seo))) : null, format: 'int', good: 'up', sub: `${live.filter((r) => r.seo >= 80).length} good · ${live.filter((r) => r.seo >= 50 && r.seo < 80).length} need work · ${live.filter((r) => r.seo < 50).length} poor` },
      ],
      chart: { type: 'hbar', labels: byAuthor.map((x) => x[0]), series: [{ name: 'Earlier views', tone: 'slate', values: byAuthor.map((x) => Math.max(0, x[1] - x[2])) }, { name: 'Last 30 days', tone: 'primary', values: byAuthor.map((x) => x[2]) }], format: 'int' },
      table: {
        columns: [
          { key: 'title', label: 'Post' },
          { key: 'status', label: 'Status' },
          { key: 'author', label: 'Author' },
          { key: 'at', label: 'Published', format: 'date' },
          { key: 'views', label: 'Views', format: 'int', total: 'sum' },
          { key: 'month', label: 'Last 30 days', format: 'int', total: 'sum' },
          { key: 'comments', label: 'Comments', format: 'int', total: 'sum' },
          { key: 'seo', label: 'SEO score', format: 'int' },
          { key: 'seoLabel', label: 'SEO' },
        ],
        rows,
        sort: { key: 'views', dir: 'desc' },
      },
      notes: ['The chart shows views per author. SEO score is the share of the editor’s SEO checklist a post passes: 80 and up is good, under 50 is poor.'],
    };
  },
};

// ---- referrals ---------------------------------------------------------------------------------------
const referralsReport = {
  id: 'referrals-report',
  group: 'marketing',
  title: 'Invite a friend (referrals)',
  description: 'Friends who joined with a customer’s code, how many bought, what they spent and the rewards earned and paid.',
  icon: 'user-plus',
  keywords: 'referral invite friend code reward loyalty word of mouth',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to }) {
    const all = safe(() => getReferralRecords(), []);
    const recs = all.filter((r) => inP(r.joinedAt, from, to));
    const names = new Map(safe(() => getMembers(), []).map((m) => [m.phone, m.name]));
    const paid = all.filter((r) => r.status === 'given' && inP(r.givenAt, from, to));
    const rows = [...groupBy(recs, (r) => r.referrer)].map(([phone, list]) => ({
      name: names.get(phone) || phone, phone, joined: list.length, bought: list.filter((r) => r.order).length,
      sales: sum(list, (r) => (r.order ? r.order.amount : 0)), earned: sum(list.filter((r) => r.status !== 'waiting'), (r) => r.reward),
      due: sum(list.filter((r) => r.status === 'due'), (r) => r.reward), _href: '/referrals',
    }));
    const sales = sum(rows, (r) => r.sales);
    const earned = sum(rows, (r) => r.earned);
    return {
      kpis: [
        { key: 'joined', label: 'Friends joined', value: recs.length, format: 'int', good: 'up' },
        { key: 'bought', label: 'Bought', value: recs.filter((r) => r.order).length, format: 'int', good: 'up', sub: recs.length ? `${Math.round((recs.filter((r) => r.order).length / recs.length) * 100)}% of those who joined` : '' },
        { key: 'sales', label: 'Their first orders', value: sales, format: 'money', good: 'up' },
        { key: 'earned', label: 'Rewards earned', value: earned, format: 'money', good: 'none', sub: sales ? `${Math.round((earned / sales) * 1000) / 10}% of their orders` : '' },
        { key: 'paid', label: 'Rewards given in the period', value: sum(paid, (r) => r.reward), format: 'money', good: 'none', sub: `${all.filter((r) => r.status === 'due').length} still due` },
      ],
      chart: { type: 'hbar', labels: rows.map((r) => r.name), series: [{ name: 'Bought', tone: 'success', values: rows.map((r) => r.bought) }, { name: 'Not bought yet', tone: 'slate', values: rows.map((r) => r.joined - r.bought) }], format: 'int' },
      table: {
        columns: [
          { key: 'name', label: 'Customer who invited' },
          { key: 'joined', label: 'Joined', format: 'int', total: 'sum' },
          { key: 'bought', label: 'Bought', format: 'int', total: 'sum' },
          { key: 'sales', label: 'Their orders', format: 'money', total: 'sum' },
          { key: 'earned', label: 'Reward earned', format: 'money', total: 'sum' },
          { key: 'due', label: 'Still due', format: 'money', total: 'sum' },
        ],
        rows,
        sort: { key: 'joined', dir: 'desc' },
      },
      notes: ['Counted by the day the friend joined. A reward is earned when the friend’s first order is delivered; “given” rewards went to the wallet, as points or in cash.'],
    };
  },
};

export default [adSpendRoas, discountsCoupons, promoResults, teamInbox, callsReport, commentsReport, blogReport, referralsReport];
