// Reports · hr group. See ../catalogue.js for the definition contract.
// Everything reads the Staff & HR snapshot (src/lib/hr.js loadSnapshot): attendance cells, leave,
// loans, payroll runs and the roster are the same numbers the HR pages show.

import { wholesaleOn } from '../../edition';
import {
  loadSnapshot, cellOf, leaveBalance, leaveDaysOf, leaveType, coverageOf, isClosedDay, loanLeft, loanPaid, scheduleOf,
  computeLines, runStatusLabel, monthLabel, staffBy, runStaff, daysIn, dayPlan,
} from '../../hr';
import { accountBy } from '../../ledger';
import { getLiabilities } from '../../liabilities';
import * as salesBook from '../../salesBook';
import { bucketsOf, sum, groupBy, dayKey, startOfDay, addDays, monthStart } from '../period';

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const safe = (fn, fb) => { try { return fn(); } catch { return fb; } };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TONES = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];
/** Day keys 'YYYY-MM-DD' of [from, to). */
function keysIn(from, to) {
  const out = [];
  for (let t = startOfDay(from); t < to; t = addDays(t, 1)) out.push(dayKey(t));
  return out;
}
const snapshot = () => safe(() => loadSnapshot(), null);
const pick = (S, f) => (S ? S.staff.filter((st) => (!f.staff || st.name === f.staff) && (!f.place || st.branch === f.place)) : []);
const monthFrom = (month) => { const [y, m] = month.split('-').map(Number); return new Date(y, m - 1, 1).getTime(); };
const monthKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
/** Item-level sale lines in [from, to) when the sales book has them, else null. */
function saleLines(from, to) {
  if (typeof salesBook.getSaleLines !== 'function') return null;
  const list = safe(() => salesBook.getSaleLines(), null);
  return Array.isArray(list) ? list.filter((l) => l && l.at >= from && l.at < to) : null;
}
const blank = (kpis, notes) => ({ kpis, chart: null, table: { columns: [{ key: 'x', label: '—' }], rows: [] }, notes });

// ---- attendance -----------------------------------------------------------------------------------
const attendanceSummary = {
  id: 'attendance-summary',
  group: 'hr',
  title: 'Attendance summary',
  description: 'Who came, who was late or absent, leave taken and overtime worked, per person over the period.',
  icon: 'calendar-check-2',
  keywords: 'attendance present late absent overtime leave punch staff branch',
  filters: ['staff', 'place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const S = snapshot();
    const today = S ? dayKey(S.now) : dayKey(Date.now());
    // days before the first attendance record have nothing to count (attendance started in this app then)
    const first = S ? Object.keys(S.att || {}).filter((k) => Object.keys(S.att[k] || {}).length).sort()[0] || today : today;
    const keys = keysIn(from, to).filter((k) => k <= today && k >= first);
    const { buckets, keyOf } = bucketsOf(from, to);
    const series = [['On time', 'success'], ['Late', 'warning'], ['Absent', 'danger'], ['On leave', 'info']].map(([name, tone]) => ({ name, tone, values: buckets.map(() => 0) }));
    const rows = pick(S, f).map((st) => {
      const r = { _key: st.code, name: st.name, branch: st.branch, designation: st.designation, expected: 0, present: 0, late: 0, lateMin: 0, absent: 0, half: 0, leave: 0, otMin: 0, unmarked: 0, _href: '/staff-profile' };
      keys.forEach((k) => {
        const c = cellOf(S, st.code, k);
        if (c.rec) r.otMin += c.rec.ot || 0;
        const bi = buckets.findIndex((b) => b.key === keyOf(new Date(k + 'T12:00').getTime()));
        const add = (i) => { if (bi >= 0) series[i].values[bi] += 1; };
        switch (c.code) {
          case 'P': r.present++; add(0); break;
          case 'L': r.present++; r.late++; r.lateMin += (c.rec && c.rec.late) || 0; add(1); break;
          case 'HD': r.present++; r.half++; add(0); break;
          case 'A': r.absent++; add(2); break;
          case 'V': case 'U': r.leave++; add(3); break;
          case '?': r.unmarked++; break;
          default: break;
        }
      });
      r.expected = r.present + r.absent + r.unmarked;
      r.rate = r.expected ? (r.present - r.half * 0.5) / r.expected : null;
      r.ot = r2(r.otMin / 60);
      return r;
    }).filter((r) => r.expected || r.leave || r.otMin);
    const expected = sum(rows, (r) => r.expected), present = sum(rows, (r) => r.present), half = sum(rows, (r) => r.half);
    const rate = expected ? (present - half * 0.5) / expected : 0;
    return {
      kpis: [
        { key: 'rate', label: 'Attendance', value: rate, format: 'pct', good: 'up', sub: `${present} of ${expected} working days` },
        { key: 'late', label: 'Late arrivals', value: sum(rows, (r) => r.late), format: 'int', good: 'down', sub: `${Math.round(sum(rows, (r) => r.lateMin))} minutes in all` },
        { key: 'absent', label: 'Absences', value: sum(rows, (r) => r.absent), format: 'int', good: 'down' },
        { key: 'leave', label: 'Leave days', value: sum(rows, (r) => r.leave), format: 'int', good: 'none' },
        { key: 'ot', label: 'Overtime', value: sum(rows, (r) => r.ot), format: 'num', good: 'none', sub: 'Hours' },
      ],
      chart: { type: 'stacked', labels: buckets.map((b) => b.label), series, format: 'int' },
      table: {
        columns: [
          { key: 'name', label: 'Staff' },
          { key: 'branch', label: 'Place' },
          { key: 'expected', label: 'Working days', format: 'int', align: 'right', total: 'sum' },
          { key: 'present', label: 'Present', format: 'int', align: 'right', total: 'sum' },
          { key: 'late', label: 'Late', format: 'int', align: 'right', total: 'sum' },
          { key: 'absent', label: 'Absent', format: 'int', align: 'right', total: 'sum' },
          { key: 'half', label: 'Half days', format: 'int', align: 'right', total: 'sum' },
          { key: 'leave', label: 'Leave', format: 'int', align: 'right', total: 'sum' },
          { key: 'ot', label: 'Overtime (h)', format: 'num', align: 'right', total: 'sum' },
          { key: 'rate', label: 'Attendance', format: 'pct', align: 'right', total: rate },
        ],
        rows,
        sort: { key: 'absent', dir: 'desc' },
      },
      notes: [
        'Working days are the days each person was planned to work (weekly off, holidays and leave left out) up to today, from the first day attendance was recorded. Days not marked yet count as working days not attended.',
        'Late is past the shift’s grace time. Overtime is the time stayed after the shift ended.',
      ],
    };
  },
};

// ---- leave ------------------------------------------------------------------------------------------
const leaveReport = {
  id: 'leave-report',
  group: 'hr',
  title: 'Leave report & balances',
  description: 'Leave taken in the period by type, requests still waiting, and the days each person has left this year.',
  icon: 'plane',
  keywords: 'leave casual sick earned annual balance pending approved rejected',
  filters: ['staff', 'place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const S = snapshot();
    if (!S) return blank([{ key: 'taken', label: 'Days taken', value: 0, format: 'int', good: 'none' }], []);
    const a = dayKey(from), b = dayKey(addDays(to, -1));
    const staff = pick(S, f);
    const codes = new Set(staff.map((st) => st.code));
    const reqs = S.leave.requests.filter((r) => codes.has(r.code));
    const overlap = (r) => r.from <= b && r.to >= a;
    const daysInPeriod = (r) => leaveDaysOf(S, r.code, r.from < a ? a : r.from, r.to > b ? b : r.to);
    const approved = reqs.filter((r) => r.status === 'ok' && overlap(r)).map((r) => ({ ...r, days: daysInPeriod(r) }));
    const asked = (r) => r.at >= from && r.at < to;
    const waiting = reqs.filter((r) => r.status === 'wait' && (overlap(r) || asked(r))).map((r) => ({ ...r, days: leaveDaysOf(S, r.code, r.from, r.to) }));
    const rejected = reqs.filter((r) => r.status === 'no' && (overlap(r) || asked(r)));
    const rows = staff.map((st) => {
      const mine = approved.filter((r) => r.code === st.code);
      const wait = waiting.filter((r) => r.code === st.code);
      const bal = safe(() => leaveBalance(S, st.code), {});
      const left = (id) => (bal[id] && bal[id].left != null ? bal[id].left : null);
      return {
        _key: st.code, name: st.name, branch: st.branch,
        taken: sum(mine, (r) => r.days), types: [...new Set(mine.map((r) => leaveType(S, r.type).name))].join(', '),
        waiting: sum(wait, (r) => r.days), rejected: rejected.filter((r) => r.code === st.code).length,
        casual: left('casual'), sick: left('sick'), earned: left('earned'), _href: '/leave',
      };
    });
    const types = S.settings.leaveTypes.map((t) => ({ name: t.name, taken: sum(approved.filter((r) => r.type === t.id), (r) => r.days), waiting: sum(waiting.filter((r) => r.type === t.id), (r) => r.days) })).filter((t) => t.taken || t.waiting);
    const taken = sum(rows, (r) => r.taken);
    const top = types.slice().sort((x, y) => y.taken - x.taken)[0];
    return {
      kpis: [
        { key: 'taken', label: 'Days taken', value: taken, format: 'int', good: 'none', sub: `${approved.length} approved request${approved.length === 1 ? '' : 's'}` },
        { key: 'people', label: 'People on leave', value: rows.filter((r) => r.taken > 0).length, format: 'int', good: 'none' },
        { key: 'waiting', label: 'Waiting for a decision', value: waiting.length, format: 'int', good: 'down', sub: `${sum(waiting, (r) => r.days)} days asked` },
        { key: 'rejected', label: 'Rejected', value: rejected.length, format: 'int', good: 'none' },
        { key: 'top', label: 'Most taken', value: top && top.taken ? top.name : '—', format: 'text', sub: top && top.taken ? `${top.taken} days` : '' },
      ],
      chart: { type: 'hbar', labels: types.map((t) => t.name), series: [{ name: 'Taken', tone: 'info', values: types.map((t) => t.taken) }, { name: 'Waiting', tone: 'warning', values: types.map((t) => t.waiting) }], format: 'int' },
      table: {
        columns: [
          { key: 'name', label: 'Staff' },
          { key: 'branch', label: 'Place' },
          { key: 'taken', label: 'Taken', format: 'int', align: 'right', total: 'sum' },
          { key: 'types', label: 'Type' },
          { key: 'waiting', label: 'Waiting (days)', format: 'int', align: 'right', total: 'sum' },
          { key: 'rejected', label: 'Rejected', format: 'int', align: 'right', total: 'sum' },
          { key: 'casual', label: 'Casual left', format: 'int', align: 'right' },
          { key: 'sick', label: 'Sick left', format: 'int', align: 'right' },
          { key: 'earned', label: 'Earned left', format: 'int', align: 'right' },
        ],
        rows,
        sort: { key: 'taken', dir: 'desc' },
      },
      notes: [
        'Taken counts the working days of approved leave that fall in the period. Waiting and rejected count requests for days in the period or asked for in it.',
        'Days left are for this calendar year (Staff & HR › Leave), including leave taken before these records.',
      ],
    };
  },
};

// ---- payroll register ------------------------------------------------------------------------------
const payrollRegister = {
  id: 'payroll-register',
  group: 'hr',
  title: 'Payroll register',
  description: 'The salary sheet for each month in the period: gross, overtime, incentive, cuts, loan instalments, net pay and how it was paid.',
  icon: 'banknote',
  keywords: 'payroll salary sheet register net pay overtime incentive deduction loan bonus paid',
  filters: ['staff', 'place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const S = snapshot();
    const runs = S ? S.runs.filter((r) => { const t = monthFrom(r.month); return t >= from && t < to; }).sort((x, y) => x.month.localeCompare(y.month)) : [];
    const liabs = S ? S.liabs : [];
    const rows = [];
    runs.forEach((run) => {
      const lines = run.lines || (run.status === 'paid' ? null : safe(() => computeLines(S, run), null));
      const label = run.kind === 'bonus' ? run.title : monthLabel(run.month);
      if (!lines) {
        if (f.staff || f.place) return;
        rows.push({ _key: run.id, month: label, name: `All staff (${run.count || '—'})`, branch: '', gross: null, ot: null, incentive: null, cut: null, loan: null, net: run.total || 0, account: '', status: runStatusLabel(run), _href: '/payroll' });
        return;
      }
      const liab = run.liabilityId ? liabs.find((l) => l.id === run.liabilityId) : null;
      lines.forEach((ln) => {
        if ((f.staff && ln.name !== f.staff) || (f.place && ln.branch !== f.place)) return;
        const ll = liab && (liab.lines || []).find((x) => x.name === ln.name);
        const status = run.status === 'paid' || (ll && (ll.paid || 0) >= ll.amount) ? 'Paid' : ll && ll.paid > 0 ? 'Partly paid' : runStatusLabel(run);
        const extra = (ln.extras || []).reduce((a, x) => a + (x.amount || 0), 0);
        rows.push({
          _key: run.id + ':' + ln.code, month: label, name: ln.name, branch: ln.branch, gross: run.kind === 'bonus' ? ln.bonus || ln.net : ln.gross,
          ot: ln.ot || 0, incentive: (ln.incentive || 0) + extra, cut: ln.cut || 0, loan: ln.loan || 0, net: ln.net,
          account: ((accountBy((ll && ll.account) || ln.payAccount) || {}).name || '').split(' · ')[0], status, _href: '/payroll',
        });
      });
    });
    const net = sum(rows, (r) => r.net);
    const months = [...new Set(rows.map((r) => r.month))];
    const byBranch = [...groupBy(rows.filter((r) => r.branch), (r) => r.branch)].map(([b, list]) => ({ b, net: sum(list, (r) => r.net) })).sort((x, y) => y.net - x.net).slice(0, 10);
    const unpaid = sum(rows.filter((r) => r.status !== 'Paid'), (r) => r.net);
    return {
      kpis: [
        { key: 'net', label: 'Net pay', value: net, format: 'money', good: 'none', sub: unpaid ? `৳${Math.round(unpaid).toLocaleString('en-IN')} not paid yet` : 'All paid' },
        { key: 'gross', label: 'Gross salaries', value: sum(rows, (r) => r.gross), format: 'money', good: 'none' },
        { key: 'extra', label: 'Overtime and incentive', value: sum(rows, (r) => r.ot + r.incentive), format: 'money', good: 'none' },
        { key: 'cuts', label: 'Cuts and loan instalments', value: sum(rows, (r) => r.cut + r.loan), format: 'money', good: 'none' },
        { key: 'people', label: 'People paid', value: new Set(rows.filter((r) => r.branch).map((r) => r.name)).size, format: 'int', good: 'none' },
      ],
      chart: months.length > 1
        ? { type: 'bar', labels: months, series: [{ name: 'Net pay', tone: 'primary', values: months.map((m) => sum(rows.filter((r) => r.month === m), (r) => r.net)) }], format: 'money0' }
        : { type: 'hbar', labels: byBranch.map((x) => x.b), series: [{ name: 'Net pay', tone: 'primary', values: byBranch.map((x) => x.net) }], format: 'money0' },
      table: {
        columns: [
          { key: 'month', label: 'Run' },
          { key: 'name', label: 'Staff' },
          { key: 'branch', label: 'Place' },
          { key: 'gross', label: 'Gross', format: 'money', align: 'right', total: 'sum' },
          { key: 'ot', label: 'Overtime', format: 'money', align: 'right', total: 'sum' },
          { key: 'incentive', label: 'Incentive', format: 'money', align: 'right', total: 'sum' },
          { key: 'cut', label: 'Cuts', format: 'money', align: 'right', total: 'sum' },
          { key: 'loan', label: 'Loan', format: 'money', align: 'right', total: 'sum' },
          { key: 'net', label: 'Net pay', format: 'money', align: 'right', total: 'sum' },
          { key: 'account', label: 'Paid from' },
          { key: 'status', label: 'Status' },
        ],
        rows,
        sort: null,
      },
      notes: [
        'Cuts are for absence, unpaid leave and late days; loan is the instalment of a staff loan or advance taken from the salary. Net pay = gross + overtime + incentive − cuts − loan.',
        'Runs paid before these records are shown as one line with their total.',
      ],
    };
  },
};

// ---- loans outstanding --------------------------------------------------------------------------------
const loansOutstanding = {
  id: 'loans-outstanding',
  group: 'hr',
  title: 'Staff loans & advances',
  description: 'Every loan and salary advance still being paid back: given, repaid, left, the monthly cut and the months to go.',
  icon: 'hand-coins',
  keywords: 'loan advance staff outstanding instalment emi repaid left',
  filters: ['staff', 'place'],
  snapshot: true,
  compare: false,
  defaultPeriod: 'month',
  compute({ filters }) {
    const f = filters || {};
    const S = snapshot();
    const codes = new Set(pick(S, f).map((st) => st.code));
    const loans = S ? S.loans.filter((l) => codes.has(l.code) && ((l.status === 'run' && loanLeft(l) > 0) || l.status === 'req')) : [];
    const rows = loans.map((l) => {
      const st = staffBy(S, l.code) || {};
      const plan = safe(() => scheduleOf(S, l), []);
      const req = l.status === 'req';
      return {
        _key: l.id, id: l.id, name: st.name || l.code, branch: st.branch || '', type: l.type === 'loan' ? 'Loan' : 'Advance',
        given: req ? null : l.at, amount: l.amount, repaid: req ? 0 : loanPaid(l), left: req ? 0 : loanLeft(l), emi: l.emi,
        months: plan.length, next: plan[0] ? monthLabel(plan[0].month, true) : '—', status: req ? 'Waiting for approval' : 'Being repaid', _href: '/loans-advances',
      };
    }).sort((a, b) => b.left - a.left);
    const active = rows.filter((r) => r.status === 'Being repaid');
    const reqs = rows.filter((r) => r.status !== 'Being repaid');
    const left = sum(active, (r) => r.left);
    const byPerson = [...groupBy(active, (r) => r.name)].map(([n, list]) => ({ n, left: sum(list, (r) => r.left) })).sort((a, b) => b.left - a.left).slice(0, 10);
    return {
      kpis: [
        { key: 'left', label: 'Still to be paid back', value: left, format: 'money', good: 'down', sub: `${active.length} loan${active.length === 1 ? '' : 's'} and advances` },
        { key: 'people', label: 'Staff paying back', value: new Set(active.map((r) => r.name)).size, format: 'int', good: 'none' },
        { key: 'cut', label: 'Next month’s cuts', value: sum(active, (r) => Math.min(r.emi, r.left)), format: 'money', good: 'none', sub: 'Taken from salaries' },
        { key: 'req', label: 'Requests waiting', value: sum(reqs, (r) => r.amount), format: 'money', good: 'none', sub: `${reqs.length} request${reqs.length === 1 ? '' : 's'}` },
      ],
      chart: { type: 'hbar', labels: byPerson.map((x) => x.n), series: [{ name: 'Left to pay', tone: 'warning', values: byPerson.map((x) => x.left) }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Staff' },
          { key: 'type', label: 'Type' },
          { key: 'given', label: 'Given', format: 'date' },
          { key: 'amount', label: 'Amount', format: 'money', align: 'right', total: 'sum' },
          { key: 'repaid', label: 'Repaid', format: 'money', align: 'right', total: 'sum' },
          { key: 'left', label: 'Left', format: 'money', align: 'right', total: 'sum' },
          { key: 'emi', label: 'Monthly cut', format: 'money', align: 'right' },
          { key: 'months', label: 'Months left', format: 'int', align: 'right' },
          { key: 'next', label: 'Next cut' },
          { key: 'status', label: 'Status' },
        ],
        rows,
        sort: { key: 'left', dir: 'desc' },
      },
      notes: ['Repaid counts salary instalments already taken and cash paid back. A cut waiting in an approved but unpaid salary run is still counted as left.'],
    };
  },
};

// ---- staff cost vs sales ---------------------------------------------------------------------------
const staffCostVsSales = {
  id: 'staff-cost-vs-sales',
  group: 'hr',
  title: 'Staff cost vs sales',
  description: 'Salary cost of each branch against the sales it made, and staff cost as a share of sales.',
  icon: 'scale',
  keywords: 'staff cost salary payroll sales ratio branch productivity percent',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to }) {
    const S = snapshot();
    const cost = {}, people = {};
    const addCost = (place, name, amount) => { cost[place] = r2((cost[place] || 0) + amount); (people[place] = people[place] || new Set()).add(name); };
    if (S) {
      for (let m = monthStart(from); m < to; m = monthStart(m, 1)) {
        const month = monthKey(m);
        const a = Math.max(m, from), b = Math.min(monthStart(m, 1), to);
        if (b <= a) continue;
        const share = Math.round((b - a) / 864e5) / daysIn(month);
        const run = S.runs.find((r) => r.kind === 'salary' && r.month === month);
        const lines = run && (run.lines || (run.status === 'paid' ? null : safe(() => computeLines(S, run), null)));
        if (lines) lines.forEach((ln) => addCost(ln.branch, ln.name, share * ((ln.gross || 0) + (ln.ot || 0) + (ln.incentive || 0) + (ln.extras || []).reduce((s, x) => s + (x.amount || 0), 0) - (ln.cut || 0))));
        else runStaff(S, month).forEach((st) => addCost(st.branch, st.name, share * st.gross));
      }
    }
    const lines = saleLines(from, to);
    const sales = {};
    if (lines) lines.forEach((l) => { const p = l.place || (l.channel === 'Online' ? 'Online (no branch)' : 'Other'); sales[p] = r2((sales[p] || 0) + (Number(l.revenue) || 0)); });
    const places = [...new Set([...Object.keys(cost), ...Object.keys(sales)])];
    const rows = places.map((p) => ({
      _key: p, place: p, people: people[p] ? people[p].size : 0, cost: cost[p] || 0, sales: lines ? sales[p] || 0 : null,
      pct: lines && sales[p] ? (cost[p] || 0) / sales[p] : null, _href: '/payroll',
    })).sort((a, b) => b.cost - a.cost);
    const totalCost = sum(rows, (r) => r.cost);
    const book = safe(() => salesBook.salesByChannel(from, to).all, { net: 0 });
    const totalSales = lines ? sum(rows, (r) => r.sales) : r2(book.net);
    const worst = rows.filter((r) => r.pct != null && r.sales > 0).sort((a, b) => b.pct - a.pct)[0];
    const top = rows.slice(0, 8);
    return {
      kpis: [
        { key: 'cost', label: 'Staff cost', value: totalCost, format: 'money', good: 'down', sub: `${sum(rows, (r) => r.people)} people` },
        { key: 'sales', label: 'Sales', value: totalSales, format: 'money', good: 'up', sub: lines ? 'From sale lines' : 'All channels, after returns' },
        { key: 'pct', label: 'Staff cost of sales', value: totalSales ? totalCost / totalSales : 0, format: 'pct', good: 'down' },
        { key: 'worst', label: 'Highest share', value: worst ? worst.place : '—', format: 'text', sub: worst ? `${Math.round(worst.pct * 1000) / 10}% of its sales` : '' },
      ],
      chart: {
        type: 'bar', labels: top.map((r) => r.place.replace(' branch', '')), format: 'money0',
        series: [{ name: 'Staff cost', tone: 'warning', values: top.map((r) => r.cost) }, ...(lines ? [{ name: 'Sales', tone: 'primary', values: top.map((r) => r.sales || 0) }] : [])],
      },
      table: {
        columns: [
          { key: 'place', label: 'Place' },
          { key: 'people', label: 'Staff', format: 'int', align: 'right', total: 'sum' },
          { key: 'cost', label: 'Staff cost', format: 'money', align: 'right', total: 'sum' },
          { key: 'sales', label: 'Sales', format: 'money', align: 'right', total: lines ? 'sum' : totalSales },
          { key: 'pct', label: 'Cost of sales', format: 'pct', align: 'right', total: totalSales ? totalCost / totalSales : null },
        ],
        rows,
        sort: { key: 'cost', dir: 'desc' },
      },
      notes: [
        'Staff cost is gross pay plus overtime and incentive, less cuts, from the salary run of each month (staff gross salary for months without a run), counted for the part of the month in the period.',
        lines ? 'Sales are the sale lines of each branch or warehouse before VAT; returns are not taken off.' : 'Sales per branch need the item-level sale lines; until then only the shop’s total sales are shown.',
      ],
    };
  },
};

// ---- roster cover ---------------------------------------------------------------------------------
const rosterCover = {
  id: 'roster-cover',
  group: 'hr',
  title: 'Roster cover',
  description: 'Shifts planned with fewer people than their minimum, by day and place.',
  icon: 'calendar-x-2',
  keywords: 'roster shift cover under staffed short minimum staff schedule',
  filters: ['place'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const S = snapshot();
    const rows = [];
    let checked = 0;
    if (S) {
      // the roster starts with the first attendance or roster record kept in the app
      const first = [...Object.keys(S.att || {}), ...Object.keys((S.roster && S.roster.days) || {}), ...Object.keys((S.roster && S.roster.published) || {})].sort()[0] || dayKey(S.now);
      keysIn(from, to).forEach((k) => {
        if (k < first || isClosedDay(S, k)) return;
        const t = new Date(k + 'T12:00').getTime();
        safe(() => coverageOf(S, k), []).filter((r) => !f.place || r.place === f.place).forEach((r) => {
          if (r.min > 0) checked++;
          if (r.n >= r.min) return;
          // who would have been on it but is on leave
          const away = S.staff.filter((st) => st.branch === r.place && st.shift === r.shift.id && dayPlan(S, st, k).kind === 'leave').map((st) => st.name);
          rows.push({ _key: k + r.place + r.shift.id, day: startOfDay(t), weekday: DAY_NAMES[new Date(t).getDay()], place: r.place, shift: r.shift.name, planned: r.n, min: r.min, short: r.min - r.n, names: r.names.join(', ') || '—', away: away.join(', '), _href: '/shifts' });
        });
      });
    }
    const places = [...groupBy(rows, (r) => r.place)].map(([p, list]) => ({ p, n: list.length })).sort((a, b) => b.n - a.n);
    const { buckets, keyOf } = bucketsOf(from, to);
    const series = places.slice(0, 6).map((x, i) => ({ name: x.p, tone: TONES[i], values: buckets.map(() => 0) }));
    rows.forEach((r) => { const s = series.find((x) => x.name === r.place); const i = buckets.findIndex((b) => b.key === keyOf(r.day)); if (s && i >= 0) s.values[i] += 1; });
    return {
      kpis: [
        { key: 'short', label: 'Short shifts', value: rows.length, format: 'int', good: 'down', sub: `of ${checked} shifts checked` },
        { key: 'days', label: 'Days with a gap', value: new Set(rows.map((r) => r.day)).size, format: 'int', good: 'down' },
        { key: 'missing', label: 'People missing', value: sum(rows, (r) => r.short), format: 'int', good: 'down', sub: 'Below the minimums' },
        { key: 'place', label: 'Most often short', value: places[0] ? places[0].p : '—', format: 'text', sub: places[0] ? `${places[0].n} shift${places[0].n === 1 ? '' : 's'}` : '' },
      ],
      chart: { type: 'stacked', labels: buckets.map((b) => b.label), series, format: 'int' },
      table: {
        columns: [
          { key: 'day', label: 'Day', format: 'date' },
          { key: 'weekday', label: 'Weekday' },
          { key: 'place', label: 'Place' },
          { key: 'shift', label: 'Shift' },
          { key: 'planned', label: 'Planned', format: 'int', align: 'right' },
          { key: 'min', label: 'Minimum', format: 'int', align: 'right' },
          { key: 'short', label: 'Short by', format: 'int', align: 'right', total: 'sum' },
          { key: 'names', label: 'On the shift' },
          { key: 'away', label: 'On leave' },
        ],
        rows,
        sort: { key: 'day', dir: 'asc' },
      },
      notes: ['Counts the people planned on the roster (with approved leave taken off) against each shift’s minimum staff in Shifts & roster. The weekly off day and public holidays are left out, as the shops are shut; days before the roster was kept in the app are not counted.'],
    };
  },
};

// ---- sales and commission per salesperson ----------------------------------------------------------
// the commission rates of the September commission liability (liabilities.js): 1% of counter sales, 0.5% of wholesale
const COMMISSION = { Retail: 0.01, Wholesale: 0.005, Online: 0 };
const salesBySalesperson = {
  id: 'sales-by-salesperson-commission',
  group: 'hr',
  title: 'Sales & commission by salesperson',
  description: 'What each salesperson sold, their average sale and the commission it earns at the shop’s rates.',
  icon: 'badge-percent',
  keywords: 'salesperson commission sales staff sold by incentive aov',
  filters: ['staff', 'channel'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const all = saleLines(from, to);
    const lines = (all || []).filter((l) => l.salesperson && (!f.staff || l.salesperson === f.staff) && (!f.channel || l.channel === f.channel));
    const S = snapshot();
    const rows = [...groupBy(lines, (l) => l.salesperson)].map(([name, list]) => {
      const sales = new Set(list.map((l) => l.saleId || l.id)).size;
      const revenue = sum(list, (l) => l.revenue);
      const retail = sum(list.filter((l) => l.channel === 'Retail'), (l) => l.revenue);
      const wholesale = sum(list.filter((l) => l.channel === 'Wholesale'), (l) => l.revenue);
      const st = S ? S.staff.find((x) => x.name === name) : null;
      return {
        _key: name, name, branch: st ? st.branch : (list[0].place || ''), sales, units: sum(list, (l) => l.qty), revenue, avg: sales ? revenue / sales : 0,
        retail, wholesale, commission: r2(retail * COMMISSION.Retail + wholesale * COMMISSION.Wholesale), _href: '/staff-profile',
      };
    }).sort((a, b) => b.revenue - a.revenue);
    const recorded = sum(safe(() => getLiabilities(), []).filter((l) => l.type === 'commission' && l.at >= from && l.at < to), (l) => l.amount);
    const revenue = sum(rows, (r) => r.revenue), count = sum(rows, (r) => r.sales);
    const top = rows.slice(0, 10);
    return {
      kpis: [
        { key: 'revenue', label: 'Sales', value: revenue, format: 'money', good: 'up', sub: `${count} sale${count === 1 ? '' : 's'}` },
        { key: 'avg', label: 'Average sale', value: count ? revenue / count : 0, format: 'money', good: 'up' },
        { key: 'people', label: 'Salespeople', value: rows.length, format: 'int', good: 'none' },
        { key: 'commission', label: 'Commission earned', value: sum(rows, (r) => r.commission), format: 'money', good: 'none', sub: '1% retail · 0.5% wholesale' },
        { key: 'recorded', label: 'Commission in liabilities', value: recorded, format: 'money', good: 'none', sub: 'Owed for this period' },
      ],
      chart: { type: 'hbar', labels: top.map((r) => r.name), series: [{ name: 'Sales', tone: 'primary', values: top.map((r) => r.revenue) }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Salesperson' },
          { key: 'branch', label: 'Place' },
          { key: 'sales', label: 'Sales', format: 'int', align: 'right', total: 'sum' },
          { key: 'units', label: 'Units', format: 'int', align: 'right', total: 'sum' },
          { key: 'revenue', label: 'Sold for', format: 'money', align: 'right', total: 'sum' },
          { key: 'avg', label: 'Average sale', format: 'money', align: 'right', total: count ? revenue / count : null },
          { key: 'retail', label: 'Retail', format: 'money', align: 'right', total: 'sum' },
          ...(wholesaleOn() ? [{ key: 'wholesale', label: 'Wholesale', format: 'money', align: 'right', total: 'sum' }] : []),
          { key: 'commission', label: 'Commission', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'revenue', dir: 'desc' },
      },
      notes: [
        all ? 'Sold for is before VAT and after discounts; returns are not taken off. Commission uses the rates in Liabilities: 1% of counter (retail) sales and 0.5% of wholesale invoices; online sales earn none.'
          : 'Needs the salesperson on each sale (item-level sale lines): nothing to show until sales record who sold them.',
        'Commission in liabilities is what was recorded as owed for the period in Accounts › Liabilities, to compare with what the sales earn.',
      ],
    };
  },
};

export default [attendanceSummary, leaveReport, payrollRegister, loansOutstanding, staffCostVsSales, rosterCover, salesBySalesperson];
