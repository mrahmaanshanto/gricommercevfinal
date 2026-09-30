// profit — profit by sales channel for a period, counted when the sale or cost happened:
//   channel   net sales − cost of goods = gross profit
//             − the channel's own costs: gateway / COD fees and delivery charges (Online; card fees
//               Retail), expenses whose category belongs to it (categories.js), sales commission,
//               affiliate payouts and promotions owed for it (liabilities.js)
//             = channel profit
//   shared    costs of the whole shop (rent of an office, salaries, internet …)
//   income    other income (bonus from suppliers, interest, scrap …)
//   net profit = channel profits − shared costs + other income
// Liability payments are left out of the ledger costs (they are counted when owed, see liabilities.js).
// Loyalty (loyalty.js): "Loyalty points used" and "Rewards and referral credit" are costs of the
// channel. Points used at checkout were already taken off those sales in the sales book, so that
// part is added back to the channel's sales first: the cost shows once and profit is not cut twice.

import { getEntries } from './ledger';
import { getItems, costsOf, partnerBy } from './settlements';
import { getLiabilities, LIAB_TYPES } from './liabilities';
import { homeOf, CHANNELS } from './categories';
import { salesByChannel, getSales } from './salesBook';
import { loyaltyCosts } from './loyalty';

const r2 = (n) => Math.round(n * 100) / 100;
const COST_KINDS = ['expense', 'salary', 'commission', 'affiliate payout', 'promotion', 'paid out'];

export function profitByChannel(from, to, { sales = getSales(), entries = getEntries(), liabilities = getLiabilities(), items = getItems(), loyalty = loyaltyCosts(from, to) } = {}) {
  const book = salesByChannel(from, to, sales);
  // points used at checkout: back into the channel's sales (before the points discount)
  loyalty.lines.filter((l) => l.onBill && book[l.channel]).forEach((l) => [book[l.channel], book.all].forEach((c) => {
    c.revenue = r2(c.revenue + l.onBill); c.net = r2(c.net + l.onBill); c.gross = r2(c.gross + l.onBill);
    c.margin = c.net ? c.gross / c.net : 0; c.avg = c.orders ? c.net / c.orders : 0;
  }));
  const bucket = () => ({ lines: {}, total: 0 });
  const costs = { Online: bucket(), Retail: bucket(), Wholesale: bucket(), Shared: bucket() };
  const add = (home, label, amount, group) => {
    if (!amount) return;
    const b = costs[costs[home] ? home : 'Shared'];
    const key = label;
    b.lines[key] = b.lines[key] || { label, amount: 0, group };
    b.lines[key].amount = r2(b.lines[key].amount + amount);
    b.total = r2(b.total + amount);
  };
  // partners: what gateways, the card machine and couriers kept on this period's payments
  items.filter((i) => !i.removed && !i.carry && i.at >= from && i.at < to).forEach((i) => {
    const p = partnerBy(i.partner);
    if (!p) return;
    const c = costsOf(i, p);
    const home = p.id === 'card' ? 'Retail' : 'Online';
    add(home, p.kind === 'Courier' ? 'COD fees' : p.id === 'card' ? 'Card machine fees' : 'Gateway fees', c.fee, 'partner');
    add(home, 'Delivery charges', c.charge, 'partner');
  });
  // expenses paid in the period (not payments of liabilities, which count when owed)
  entries.filter((e) => COST_KINDS.includes(e.kind) && e.amount < 0 && !e.liab && e.at >= from && e.at < to).forEach((e) => {
    const label = e.cat || (e.kind === 'paid out' ? 'Paid out at counters' : e.kind === 'salary' ? 'Salary' : 'Other');
    add(e.kind === 'paid out' ? 'Retail' : homeOf(label), label, -e.amount, 'expense');
  });
  // liabilities owed for the period
  liabilities.filter((l) => l.at >= from && l.at < to).forEach((l) => {
    const t = LIAB_TYPES[l.type] || LIAB_TYPES.other;
    l.lines.forEach((x) => add(x.channel || l.channel || 'Shared', l.type === 'salary' ? 'Staff salaries' : t.label, x.amount, l.type));
  });
  // loyalty: points used and rewards given (loyalty.js)
  loyalty.lines.forEach((l) => add(l.channel, l.label, l.amount, 'loyalty'));
  // other income
  const income = bucket();
  entries.filter((e) => e.kind === 'income' && e.amount > 0 && e.at >= from && e.at < to).forEach((e) => {
    const label = e.cat || 'Other income';
    income.lines[label] = income.lines[label] || { label, amount: 0 };
    income.lines[label].amount = r2(income.lines[label].amount + e.amount);
    income.total = r2(income.total + e.amount);
  });

  const list = (b) => Object.values(b.lines).sort((a, c) => c.amount - a.amount);
  const channels = {};
  CHANNELS.forEach((ch) => {
    const s = book[ch];
    const own = costs[ch];
    const profit = r2(s.gross - own.total);
    channels[ch] = { ...s, costs: list(own), costsTotal: own.total, profit, profitMargin: s.net ? profit / s.net : 0 };
  });
  const channelProfit = r2(CHANNELS.reduce((a, ch) => a + channels[ch].profit, 0));
  const net = r2(channelProfit - costs.Shared.total + income.total);
  return {
    channels, all: book.all, channelProfit,
    shared: { lines: list(costs.Shared), total: costs.Shared.total },
    income: { lines: list(income), total: income.total },
    net, netMargin: book.all.net ? net / book.all.net : 0,
  };
}
