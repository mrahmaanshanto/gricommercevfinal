'use client';
// My dashboard (/my-dashboard) — the signed-in person's day (src/lib/team.js), laid out like Home: the title with the
// person and role, three key figures, the role's shortcuts as pills, then the work: tasks (top five), follow-ups,
// the role's report blocks (live figures from src/lib/reports, top rows) and, on the right, the role widgets —
// approvals, team chat, me at work, order pipeline, team on duty, content queue, systems, HR today.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { reportBy, reportInEdition } from '@/lib/reports/catalogue';
import { routeInEdition, hasModule, currentEditionId, LOCKED, EDITION_EVENT } from '@/lib/edition';
import { periodOf, fmt } from '@/lib/reports/period';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { getPosts } from '@/lib/blog';
import { USERS, roleOf, userBy } from '@/lib/team';
import { setStatus, dueState, dayKeyOf, priorityOf, isMine, teamBy } from '@/lib/tasks';
import { OPEN_STAGES, followState, stageOf, STAGE_WEIGHT } from '@/lib/leads';
import { staffBy, cellOf, todayKey, shiftBy, t12, leaveBalance, loanLeft, leaveType, statusOf } from '@/lib/hr';
import { useHr } from '@/screens/staff-hr/hrShared';
import { MetricStrip } from '@/components/ui/IndexKit';
import { StatusBadge } from '@/components/ui';
import { TeamPage, useMe, useTasks, useLeads, useTick, UserAvatar, userName } from './teamShared';
import { channelsFor, unread, getMessages, CHAT_EVENT } from '@/lib/teamChat';

const CSS = `
.md-links{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.md-links a{display:inline-flex;align-items:center;gap:var(--space-2);height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-xs);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;white-space:nowrap;transition:var(--transition-colors)}
.md-links a:hover{border-color:var(--primary);color:var(--primary)}
.md-links a svg{color:var(--text-muted)}
.md-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.md-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.md-period{margin-left:6px;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.md-body{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.md-kpis{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5)}
.md-kpi{min-width:0}
.md-kpi span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.md-kpi b{display:block;margin-top:2px;font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.md-mini{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.md-mini th{height:32px;padding:0 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);text-align:left;background:var(--surface-subtle);border-bottom:1px solid var(--border-subtle)}
.md-mini td{height:36px;padding:4px 8px;border-bottom:1px solid var(--border-subtle);color:var(--text-body)}
.md-mini tr:last-child td{border-bottom:0}
.md-mini tr.is-me td{background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.md-mini .num{text-align:right;font-family:var(--font-data);white-space:nowrap}
.md-task{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:4px 0;border-bottom:1px solid var(--border-subtle)}
.md-task:last-child{border-bottom:0}
.md-task__main{flex:1;min-width:0;text-decoration:none}
.md-task__main b{display:block;overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.md-check{display:grid;place-items:center;width:32px;height:32px;flex:none;margin:-6px;border:0;border-radius:var(--radius-full);background:none;cursor:pointer;padding:0}
.md-check::before{content:'';width:18px;height:18px;border:2px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card)}
.md-check:hover::before{border-color:var(--text-success)}
.md-check:focus-visible{outline:2px solid var(--primary)}
.md-pipe{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:var(--space-2)}
.md-pipe a{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);text-decoration:none;color:inherit}
.md-pipe a:hover{border-color:var(--primary)}
.md-pipe b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.md-row{display:flex;align-items:center;gap:var(--space-3);min-height:40px;font-size:var(--text-sm)}
.md-row > span:nth-child(2){flex:1;min-width:0}
.md-kv{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm)}
.md-kv > span:first-child{color:var(--text-muted)}
.md-more{font-size:var(--text-sm);font-weight:var(--weight-medium)}
@media (max-width:1023px){.md-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  /* task rows: the title gets the line; priority and due date go under it */
  .md-task{flex-wrap:wrap;row-gap:2px}
  .md-task:not(.md-follow) > .md-task__main{flex-basis:calc(100% - 40px)}
  .md-task:not(.md-follow) > .md-task__main + *{margin-left:calc(18px + var(--space-3))}
  .md-task > span:empty{display:none}
  /* follow-ups: the date above the name, the call button beside it */
  .md-follow > .md-follow__when{flex:1 1 100%;width:auto!important}
  .md-check{width:36px;height:36px}
}
`;

const P_LABEL = { week: 'This week', lastmonth: 'Last month', month: 'This month', today: 'Today', yesterday: 'Yesterday' };
const B = (id, preset, title, extra = {}) => ({ id, preset, title, ...extra });
const DH = { place: 'Dhanmondi branch' };
// what each role sees: report blocks (main column), widgets (side column) and quick links
const DASH = {
  ceo: { links: [['Daily summary', '/daily-summary', 'sun'], ['Reports', '/reports-centre', 'file-bar-chart'], ['Leads', '/sales-leads', 'target'], ['HR dashboard', '/hr-dashboard', 'contact']],
    blocks: [B('sales-summary', 'week', 'Sales this week', { top: 4 }), B('profit-by-channel-summary', 'lastmonth', 'Profit by channel', { top: 4 }), B('account-balances', 'month', 'Money now'), B('receivables-payables', 'month', 'Owed to you and by you'), B('staff-cost-vs-sales', 'lastmonth', 'Staff cost against sales')],
    side: ['approvals', 'pipeline', 'teamTasks'] },
  cto: { links: [['Attendance devices', '/attendance-devices', 'fingerprint'], ['Payment gateways', '/account-setup', 'credit-card'], ['Event health', '/event-health', 'activity'], ['Settings', '/set-general', 'settings']],
    blocks: [B('order-source', 'week', 'Orders by source — is tracking catching them?', { top: 5 }), B('pos-audit', 'week', 'POS manager approvals'), B('calls-report', 'week', 'Phone lines')],
    side: ['systems'] },
  content: { links: [['Post calendar', '/calendar', 'calendar'], ['New post', '/composer', 'pen-square'], ['Blog posts', '/blog-posts', 'newspaper'], ['Inbox', '/merchant-inbox', 'inbox']],
    blocks: [B('blog-report', 'month', 'Blog', { top: 4 }), B('comments-report', 'week', 'Comments on posts'), B('order-source', 'week', 'Orders from social')],
    side: ['content'] },
  orders: { links: [['Orders', '/merchant-orders', 'shopping-cart'], ['Courier returns', '/courier-returns', 'package-x'], ['AI calls', '/ai-calls', 'phone-call'], ['Abandoned carts', '/abandoned-carts', 'shopping-basket']],
    blocks: [B('order-funnel', 'week', 'Order funnel'), B('courier-performance', 'week', 'Couriers', { top: 4 }), B('rto-analysis', 'week', 'Returns to origin'), B('order-source', 'week', 'Where orders come from')],
    side: ['orders'] },
  comms: { links: [['Inbox', '/merchant-inbox', 'inbox'], ['Calls', '/merchant-calls', 'phone'], ['Tickets', '/support-tickets', 'life-buoy'], ['Leads', '/sales-leads', 'target']],
    blocks: [B('team-inbox', 'week', 'Inbox', { top: 4 }), B('calls-report', 'week', 'Calls'), B('comments-report', 'week', 'Comments')],
    side: ['orders'] },
  ads: { links: [['Campaigns', '/campaigns', 'layers'], ['Pixels & events', '/pixels-events', 'radar'], ['Coupons', '/coupons', 'ticket-percent'], ['Ad spend report', '/report?id=ad-spend-roas', 'chart-column']],
    blocks: [B('ad-spend-roas', 'lastmonth', 'Ad spend & return', { top: 4 }), B('order-source', 'week', 'Orders by source'), B('new-vs-returning', 'week', 'New and returning buyers'), B('discounts-coupons', 'lastmonth', 'Discounts & coupons')],
    side: [] },
  'wh-manager': { links: [['Stock', '/stock', 'boxes'], ['Receive goods', '/receive-goods', 'package-open'], ['Purchase orders', '/purchase-orders', 'clipboard-list'], ['Transfers', '/transfers', 'arrow-left-right']],
    blocks: [B('stock-value', 'month', 'Stock value'), B('low-stock-reorder', 'month', 'Low stock & reorder', { top: 5 }), B('po-status', 'month', 'Purchase orders'), B('stock-movement', 'week', 'Stock in and out this week')],
    side: ['orders', 'duty:Central Warehouse', 'teamTasks'], team: ['sabbir', 'farhana'] },
  'wh-supervisor': { links: [['Orders to pack', '/merchant-orders', 'package'], ['Receive goods', '/receive-goods', 'package-open'], ['Stock count', '/stock-count', 'clipboard-check'], ['Racks', '/racks', 'layout-grid']],
    blocks: [B('low-stock-reorder', 'month', 'Low stock', { top: 5 }), B('po-status', 'month', 'Deliveries coming')],
    side: ['orders', 'duty:Central Warehouse'] },
  'shop-manager': { links: [['Open register', '/pos', 'scan-line'], ['Counters & cash', '/pos-manage', 'store'], ['Daily summary', '/daily-summary', 'sun'], ['Leads', '/sales-leads', 'target']],
    blocks: [B('sales-summary', 'week', 'Dhanmondi sales this week', { filters: DH }), B('counter-performance', 'week', 'Counters', { filters: DH, top: 3 }), B('sales-by-staff', 'week', 'Sellers this week', { filters: DH, top: 5 }), B('low-stock-reorder', 'month', 'Low stock at Dhanmondi', { filters: DH, top: 4 })],
    side: ['duty:Dhanmondi branch', 'teamTasks'], team: ['sadia', 'rafi'] },
  'shop-supervisor': { links: [['Open register', '/pos', 'scan-line'], ['Cash pickups', '/pos-manage?tab=cash', 'hand-coins'], ['Shifts', '/pos-manage?tab=shifts', 'users'], ['Stock', '/stock', 'boxes']],
    blocks: [B('counter-performance', 'week', 'Counters this week', { filters: DH, top: 3 }), B('shift-z-report', 'week', 'Shift Z-reports', { top: 4 }), B('pos-audit', 'week', 'Manager approvals')],
    side: ['duty:Dhanmondi branch'] },
  seller: { links: [['Open register', '/pos', 'scan-line'], ['Customers', '/all-customers', 'users'], ['Stock', '/stock', 'boxes'], ['Return or exchange', '/return-exchange', 'undo-2']],
    blocks: [B('sales-by-staff', 'week', 'My sales this week', { filters: DH, top: 7, me: true }), B('sales-by-staff', 'lastmonth', 'Last month', { filters: DH, top: 7, me: true })],
    side: [] },
  hr: { links: [['HR dashboard', '/hr-dashboard', 'layout-grid'], ['Attendance', '/attendance', 'calendar-check'], ['Payroll', '/payroll', 'banknote'], ['Add staff', '/staff-create', 'user-plus']],
    blocks: [B('attendance-summary', 'week', 'Attendance this week', { top: 5 }), B('leave-report', 'month', 'Leave'), B('payroll-register', 'lastmonth', 'Last payroll'), B('staff-cost-vs-sales', 'lastmonth', 'Staff cost against sales')],
    side: ['hr', 'teamTasks'], team: USERS.map((u) => u.id) },
  'online-sales': { links: [['Leads', '/sales-leads', 'target'], ['Online orders', '/merchant-orders?channel=online', 'globe'], ['Abandoned carts', '/abandoned-carts', 'shopping-basket'], ['Customers', '/all-customers', 'users']],
    blocks: [B('order-source', 'week', 'Online orders by source'), B('new-vs-returning', 'week', 'New and returning buyers'), B('inactive-customers', 'month', 'Customers to win back', { top: 4 }), B('order-funnel', 'week', 'Order funnel')],
    side: ['pipeline', 'orders'] },
};

export default function MyDashboard() {
  const { me, ready } = useMe();
  const { tasks } = useTasks();
  const { leads } = useLeads();
  const { S } = useHr();
  const role = roleOf(me);
  // only what this site's edition has (src/lib/edition.js): report blocks, links and side widgets
  const [ed, setEd] = React.useState(() => (LOCKED ? currentEditionId() : 'full'));
  React.useEffect(() => { const on = () => setEd(currentEditionId()); on(); window.addEventListener(EDITION_EVENT, on); return () => window.removeEventListener(EDITION_EVENT, on); }, []);
  const base = DASH[me.role] || DASH.ceo;
  const SIDE_MODULE = { orders: 'commerce', hr: 'hr' };
  const cfg = ed === 'full' ? base : {
    ...base,
    links: base.links.filter(([, href]) => routeInEdition(href.split('?')[0], ed)),
    blocks: base.blocks.filter((b) => reportInEdition(reportBy(b.id), ed)),
    side: base.side.filter((w) => { const m = SIDE_MODULE[w] || (w.startsWith('duty:') ? 'hr' : null); return !m || hasModule(m, ed); }),
  };
  const now = Date.now();
  const today = dayKeyOf(now);
  const mine = tasks.filter((t) => isMine(t, me.id) && t.status !== 'done');
  const late = mine.filter((t) => dueState(t, today) === 'overdue');
  const dueToday = mine.filter((t) => dueState(t, today) === 'today');
  const myLeads = leads.filter((l) => l.owner === me.id && OPEN_STAGES.includes(l.stage));
  const follow = myLeads.filter((l) => ['overdue', 'today'].includes(followState(l, now)));
  const st = me.staff ? staffBy(S, me.staff) : null;

  const third = myLeads.length
    ? { label: 'Follow-ups due', value: String(follow.length), href: '/sales-leads' }
    : st ? { label: 'Clocked in', value: (() => { const c = cellOf(S, st.code, todayKey(S)); return c.rec && c.rec.in ? t12(c.rec.in) : '—'; })(), href: `/staff-profile?code=${st.code}` }
      : { label: 'Given to others', value: String(tasks.filter((t) => t.by === me.id && t.assignee !== me.id && t.status !== 'done').length), href: '/tasks?scope=gave' };

  return (
    <TeamPage screen="MyDashboard" active="my-dash" crumb="General" page="My dashboard" css={CSS} narrow
      title="My dashboard" meta={`${me.name} · ${role.title} · ${me.place}`}
      about="Your day: your tasks and follow-ups first, then the figures and lists your role works from. Tap a figure or a shortcut to open its page."
      primary={{ label: 'New task', href: '/tasks?new=1' }}>
      <MetricStrip label="Your day" items={[
        { label: 'Open tasks', value: String(mine.length), href: '/tasks' },
        { label: 'Due today or late', value: String(late.length + dueToday.length), sub: late.length ? `${late.length} late` : null, href: '/tasks' },
        third,
      ]} />
      {cfg.links.length ? <nav className="md-links" aria-label="Shortcuts">{cfg.links.map(([l, href, ic]) => <Link key={href} href={href}><Icon name={ic} width="16" height="16" aria-hidden="true" />{l}</Link>)}</nav> : null}

      <div className="md-grid">
        <div className="md-col">
          <MyTasks tasks={mine} today={today} />
          {myLeads.length ? <MyFollowUps leads={myLeads} now={now} /> : null}
          {ready ? cfg.blocks.map((b, i) => <ReportBlock key={b.id + i} b={b} me={me} />) : <section className="ix-card" style={{ minHeight: 200 }} aria-busy="true" />}
        </div>
        <div className="md-col">
          {cfg.side.includes('approvals') ? <Approvals S={S} tasks={tasks} me={me} /> : null}
          <ChatPeek me={me} ready={ready} />
          {st ? <MeAtWork S={S} st={st} /> : null}
          {/* team-wide summaries go last: the person's own work comes first */}
          {[...cfg.side.filter((w) => w !== 'approvals' && w !== 'pipeline' && w !== 'teamTasks'), ...cfg.side.filter((w) => w === 'pipeline' || w === 'teamTasks')].map((w) => {
            if (w === 'pipeline') return <Pipeline key={w} leads={leads} me={me} />;
            if (w === 'teamTasks') return <TeamTasks key={w} tasks={tasks} team={cfg.team || USERS.filter((u) => u.id !== me.id).map((u) => u.id)} today={today} />;
            if (w === 'orders') return <OrderPipe key={w} />;
            if (w === 'systems') return <Systems key={w} S={S} />;
            if (w === 'content') return <ContentQueue key={w} ready={ready} />;
            if (w === 'hr') return <HrToday key={w} S={S} />;
            if (w.startsWith('duty:')) return <OnDuty key={w} S={S} place={w.slice(5)} />;
            return null;
          })}
        </div>
      </div>
    </TeamPage>
  );
}

// ---- blocks ------------------------------------------------------------------------------------------
/** A card: an h2 (with an optional period), at most one link, then the body. */
function Block({ title, period, href, link, children, flush }) {
  return (
    <section className="ix-card" aria-label={title}>
      <header className="ix-card__head"><h2>{title}{period ? <span className="md-period">{period}</span> : null}</h2>{href ? <Link href={href}>{link}</Link> : null}</header>
      {flush ? children : <div className="md-body">{children}</div>}
    </section>
  );
}

function ReportBlock({ b, me }) {
  const def = reportBy(b.id);
  const res = useMemo(() => {
    if (!def || !def.compute) return null;
    try { const p = periodOf(b.preset); return def.compute({ from: p.from, to: p.to, now: Date.now(), filters: b.filters || {} }); } catch { return null; }
  }, [def, b.preset, b.filters]);
  if (!def || !res) return null;
  const kpis = (res.kpis || []).slice(0, 5);
  const NUM = ['money', 'money0', 'int', 'num', 'pct', 'days'];
  const all = res.table ? res.table.columns.filter((c) => !c.key.startsWith('_')) : [];
  // the name column, then the figures
  const cols = all.length ? [all[0], ...all.slice(1).filter((c) => NUM.includes(c.format))].slice(0, b.me ? 6 : 4) : [];
  let rows = res.table && b.top ? res.table.rows.slice(0, Math.min(5, b.top)) : [];
  const isMe = (r) => b.me && Object.values(r).some((v) => v === me.name);
  if (b.me && res.table) { rows = res.table.rows.slice(0, b.top || 7); }
  const myRow = b.me && res.table ? res.table.rows.find(isMe) : null;
  const href = `/report?id=${b.id}&p=${b.preset}${b.filters ? Object.entries(b.filters).map(([k, v]) => `&f_${k}=${encodeURIComponent(v)}`).join('') : ''}`;
  return (
    <Block title={b.title} period={`${b.title.toLowerCase().includes((P_LABEL[b.preset] || '').toLowerCase()) ? '' : P_LABEL[b.preset] || ''}${b.filters && b.filters.place && !b.title.includes(b.filters.place.replace(' branch', '')) ? ` · ${b.filters.place}` : ''}`.replace(/^ · /, '')} href={href} link="Open report">
        {b.me ? (
          myRow ? <div className="md-kpis">{cols.slice(1).map((c) => <div key={c.key} className="md-kpi"><span>{c.label}</span><b>{fmt(myRow[c.key], c.format)}</b></div>)}<div className="md-kpi"><span>Rank</span><b>{res.table.rows.indexOf(myRow) + 1} of {res.table.rows.length}</b></div></div> : <p className="tm-sub" style={{ margin: 0 }}>No sales of yours in this period yet.</p>
        ) : kpis.length ? <div className="md-kpis">{kpis.slice(0, 4).map((k) => <div key={k.key} className="md-kpi"><span>{k.label}</span><b title={fmt(k.value, k.format)}>{fmt(k.value, k.format)}</b>{k.sub ? <span>{k.sub}</span> : null}</div>)}</div> : null}
        {rows.length && cols.length ? (
          <div className="gc-table-wrap" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <table className="md-mini gc-table--keep">
              <thead><tr>{cols.map((c, i) => <th key={c.key} scope="col" className={i ? 'num' : ''}>{c.label}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i} className={isMe(r) ? 'is-me' : ''}>{cols.map((c, j) => <td key={c.key} className={j ? 'num' : ''}>{fmt(r[c.key], c.format)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : null}
    </Block>
  );
}

function MyTasks({ tasks, today }) {
  const list = [...tasks].sort((a, b) => (a.due || '9').localeCompare(b.due || '9')).slice(0, 5);
  return (
    <Block title="My tasks" href="/tasks" link="View all" flush>
      <div className="md-body" style={{ gap: 0, paddingTop: 'var(--space-2)' }}>
        {!tasks.length ? <p className="tm-sub" style={{ margin: 0 }}>Nothing open — well done.</p> : null}
        {list.map((t) => {
          const ds = dueState(t, today);
          const pr = priorityOf(t.priority);
          return (
            <div key={t.id} className="md-task">
              <button type="button" className="md-check" aria-label={`Mark “${t.title}” done`} onClick={() => { const made = setStatus(t.id, 'done'); toast(made ? 'Done — the next one is on your list.' : 'Done.'); }} />
              <Link href={`/tasks?task=${t.id}`} className="md-task__main"><b>{t.title}</b><span className="tm-sub">{(teamBy(t.team) || { name: '' }).name}{!(t.assignees || []).length ? ' · open for the team' : ''}{t.by !== t.assignee ? ` · from ${userName(t.by).split(' ')[0]}` : ''}</span></Link>
              {t.priority === 'urgent' || t.priority === 'high' ? <StatusBadge tone={pr[2]}>{pr[1]}</StatusBadge> : null}
              <span className={'tm-sub' + (ds === 'overdue' ? ' tm-out' : ds === 'today' ? ' tm-warn' : '')} style={{ whiteSpace: 'nowrap' }}>{ds === 'today' ? 'Today' : ds === 'overdue' ? 'Late' : t.due ? formatDate(new Date(t.due + 'T00:00:00').getTime()) : ''}</span>
            </div>
          );
        })}
        {tasks.length > list.length ? <Link href="/tasks" className="md-more" style={{ paddingTop: 'var(--space-2)' }}>+{tasks.length - list.length} more</Link> : null}
      </div>
    </Block>
  );
}

function MyFollowUps({ leads, now }) {
  const list = leads.filter((l) => l.next).sort((a, b) => a.next.at - b.next.at).slice(0, 5);
  return (
    <Block title="My follow-ups" period={`${leads.length} open · ${formatBDT(leads.reduce((a, l) => a + l.value, 0))}`} href="/sales-leads" link="All leads" flush>
      <div className="md-body" style={{ gap: 0, paddingTop: 'var(--space-2)' }}>
        {list.map((l) => { const fs = followState(l, now); return (
          <div key={l.id} className="md-task md-follow">
            <span className={'md-follow__when tm-fig' + (fs === 'overdue' ? ' tm-out' : fs === 'today' ? ' tm-warn' : '')} style={{ width: 70, fontSize: 'var(--text-xs)' }}>{fs === 'today' ? formatTime(l.next.at) : formatDate(l.next.at).replace(/ \d{4}$/, '')}</span>
            <Link href={`/sales-leads?lead=${l.id}`} className="md-task__main"><b>{l.name}{l.company ? ` · ${l.company}` : ''}</b><span className="tm-sub">{l.next.what} · {stageOf(l.stage)[1]} · {formatBDT(l.value)}</span></Link>
            <a href={'tel:' + l.phone.replace(/\D/g, '')} className="ix-btn ix-btn--sm ix-btn--icon" aria-label={`Call ${l.name}`}><Icon name="phone" width="16" height="16" aria-hidden="true" /></a>
          </div>
        ); })}
      </div>
    </Block>
  );
}

// ---- side widgets ------------------------------------------------------------------------------------
function MeAtWork({ S, st }) {
  const today = todayKey(S);
  const c = cellOf(S, st.code, today);
  const sh = shiftBy(S, st.shift);
  const bal = leaveBalance(S, st.code);
  const lastRun = [...S.runs].reverse().find((r) => r.kind === 'salary' && (r.lines || []).some((x) => x.code === st.code));
  const line = lastRun ? lastRun.lines.find((x) => x.code === st.code) : null;
  const owe = S.loans.filter((l) => l.code === st.code && l.status === 'run').reduce((a, l) => a + loanLeft(l), 0);
  const status = c.rec && c.rec.in ? `In at ${t12(c.rec.in)}${c.rec.late ? ` · ${c.rec.late} min late` : ''}` : c.plan.kind === 'leave' ? `On ${leaveType(S, c.plan.leave.type).name.toLowerCase()} leave` : c.plan.kind === 'off' ? 'Weekly off' : sh ? `Not in yet · ${sh.name} ${t12(sh.start)}` : 'Not in yet';
  return (
    <Block title="Me at work" period={st.code} href={`/staff-profile?code=${st.code}`} link="My profile">
        <div className="md-kv"><span>Today</span><span className={c.rec && c.rec.late ? 'tm-warn' : 'tm-strong'}>{status}</span></div>
        <div className="md-kv"><span>Shift</span><span className="tm-strong">{sh ? `${sh.name} · ${t12(sh.start)}–${t12(sh.end)}` : '—'}</span></div>
        <div className="md-kv"><span>Leave left</span><span className="tm-strong">Casual {Math.max(0, bal.casual.left)} · Sick {Math.max(0, bal.sick.left)}</span></div>
        {line ? <div className="md-kv"><span>Last salary ({lastRun.title})</span><span className="tm-fig tm-strong">{formatBDT(line.net)}{lastRun.status !== 'paid' ? ' · due' : ''}</span></div> : null}
        {owe ? <div className="md-kv"><span>Advance / loan left</span><span className="tm-fig tm-warn">{formatBDT(owe)}</span></div> : null}
    </Block>
  );
}

function Approvals({ S, tasks, me }) {
  const review = tasks.filter((t) => t.assignee === me.id && t.status === 'review');
  const leave = S.leave.requests.filter((r) => r.status === 'wait').length;
  const loans = S.loans.filter((l) => l.status === 'req').length;
  const fixes = S.fixes.filter((f) => f.status === 'wait').length;
  const unpaid = S.runs.filter((r) => r.status === 'approved');
  return (
    <Block title="Waiting for you">
        {review.map((t) => <Link key={t.id} href={`/tasks?task=${t.id}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile"><Icon name="stamp" width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{t.title}</span><span className="tm-sub">from {userName(t.by)}</span></span></Link>)}
        {unpaid.map((r) => <Link key={r.id} href="/payroll" className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile"><Icon name="banknote" width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{r.title} salaries to pay</span><span className="tm-sub">{formatBDT(r.total || 0)} approved</span></span></Link>)}
        <div className="md-kv"><span>Leave requests</span><Link href="/leave" className="tm-strong">{leave}</Link></div>
        <div className="md-kv"><span>Advance requests</span><Link href="/loans-advances" className="tm-strong">{loans}</Link></div>
        <div className="md-kv"><span>Attendance fixes</span><Link href="/attendance?view=fixes" className="tm-strong">{fixes}</Link></div>
    </Block>
  );
}

function Pipeline({ leads, me }) {
  const open = leads.filter((l) => OPEN_STAGES.includes(l.stage));
  const mineOnly = me.role === 'online-sales';
  const list = mineOnly ? open.filter((l) => l.owner === me.id) : open;
  return (
    <Block title="Sales pipeline" period={`${formatBDT(list.reduce((a, l) => a + l.value * STAGE_WEIGHT[l.stage], 0))} likely`} href="/sales-leads?view=board" link="Board">
        {OPEN_STAGES.map((k) => { const ls = list.filter((l) => l.stage === k); const [, label, tone] = stageOf(k); return <div key={k} className="md-kv"><span><StatusBadge tone={tone === 'slate' ? 'neutral' : tone}>{label}</StatusBadge></span><span className="tm-fig tm-strong">{ls.length} · {formatBDT(ls.reduce((a, l) => a + l.value, 0))}</span></div>; })}
    </Block>
  );
}

function TeamTasks({ tasks, team, today }) {
  const all = team.map((id) => ({ id, open: tasks.filter((t) => (t.assignees || []).includes(id) && t.status !== 'done'), })).filter((r) => userBy(r.id));
  const rows = [...all].sort((a, b) => b.open.length - a.open.length).slice(0, 5);
  return (
    <Block title="Team tasks" href="/tasks?scope=all" link="All tasks">
        {rows.map((r) => { const late = r.open.filter((t) => dueState(t, today) === 'overdue').length; return <div key={r.id} className="md-row"><UserAvatar id={r.id} size={28} /><span><span className="tm-strong">{userName(r.id)}</span><span className="tm-sub">{roleOf(userBy(r.id)).title}</span></span><span className="tm-sub" style={{ textAlign: 'right' }}>{r.open.length} open{late ? <span className="tm-out"> · {late} late</span> : ''}</span></div>; })}
        {all.length > rows.length ? <Link href="/tasks?scope=all" className="md-more">+{all.length - rows.length} more</Link> : null}
    </Block>
  );
}

function OrderPipe() {
  return (
    <Block title="Orders by status" href="/merchant-orders" link="Orders">
      <div className="md-pipe">{ORDER_STATUSES.map((s) => <Link key={s.key} href={`/merchant-orders?status=${s.key}`}><span className="tm-sub">{s.label}</span><b>{s.count}</b></Link>)}</div>
    </Block>
  );
}

function Systems({ S }) {
  const devs = S.devices || [];
  const off = devs.filter((d) => d.status !== 'online');
  return (
    <Block title="Systems" period={off.length ? `${off.length} problem${off.length === 1 ? '' : 's'} need you` : 'Everything is answering'}>
        {devs.map((d) => <Link key={d.id} href="/attendance-devices" className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile" style={d.status !== 'online' ? { background: 'var(--fill-error-soft)', color: 'var(--text-danger)' } : undefined}><Icon name={d.status === 'online' ? 'fingerprint' : 'wifi-off'} width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{d.name}</span><span className="tm-sub">{d.model} · {d.ip}</span></span><StatusBadge tone={d.status === 'online' ? 'success' : 'error'}>{d.status === 'online' ? 'Online' : 'Offline'}</StatusBadge></Link>)}
        <div className="md-kv"><span>Website</span><StatusBadge tone="success">Up · 99.98%</StatusBadge></div>
        <div className="md-kv"><span>Domain renewal</span><span className="tm-warn">20 Oct 2026</span></div>
        <div className="md-kv"><span>Payment gateways</span><Link href="/account-setup" className="tm-strong">bKash, SSLCOMMERZ, EPS</Link></div>
    </Block>
  );
}

function ContentQueue({ ready }) {
  const posts = ready ? getPosts() : [];
  const queue = posts.filter((p) => p.status === 'draft' || p.status === 'scheduled').slice(0, 5);
  return (
    <Block title="Content queue" href="/blog-posts" link="Blog">
        {queue.length ? queue.map((p) => <Link key={p.id} href={`/blog-editor?id=${p.id}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile"><Icon name={p.status === 'draft' ? 'file-pen' : 'calendar-clock'} width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{p.title}</span><span className="tm-sub">{p.status === 'draft' ? 'Draft' : 'Scheduled'}</span></span></Link>) : <span className="tm-sub">Nothing waiting.</span>}
    </Block>
  );
}

function HrToday({ S }) {
  const today = todayKey(S);
  const staff = S.staff.filter((s) => s.status !== 'left');
  const codes = staff.map((s) => cellOf(S, s.code, today).code);
  const n = (list) => codes.filter((c) => list.includes(c)).length;
  return (
    <Block title="People today" period={`${staff.length} on the staff list`} href="/hr-dashboard" link="HR dashboard">
        <div className="md-pipe">
          <Link href="/attendance"><span className="tm-sub">Present</span><b>{n(['P', 'L', 'HD'])}</b></Link>
          <Link href="/attendance"><span className="tm-sub">Late</span><b>{n(['L'])}</b></Link>
          <Link href="/leave"><span className="tm-sub">On leave</span><b>{n(['V', 'U'])}</b></Link>
          <Link href="/attendance"><span className="tm-sub">Not in yet</span><b>{n(['wait', '?'])}</b></Link>
        </div>
        <div className="md-kv"><span>Leave to decide</span><Link href="/leave" className="tm-strong">{S.leave.requests.filter((r) => r.status === 'wait').length}</Link></div>
        <div className="md-kv"><span>Advances asked</span><Link href="/loans-advances" className="tm-strong">{S.loans.filter((l) => l.status === 'req').length}</Link></div>
        <div className="md-kv"><span>Probation to confirm</span><Link href="/pay-changes" className="tm-strong">{staff.filter((s) => s.status === 'probation').length}</Link></div>
    </Block>
  );
}

function OnDuty({ S, place }) {
  const today = todayKey(S);
  const here = S.staff.filter((s) => s.status !== 'left' && s.branch === place);
  return (
    <Block title={`Team at ${place.replace(' branch', '')}`} href="/attendance" link="Attendance">
        {here.map((s) => {
          const c = cellOf(S, s.code, today);
          const sh = shiftBy(S, c.plan.shifts[0] || s.shift);
          const k = statusOf(S, s);
          const txt = c.rec && c.rec.in ? `In ${t12(c.rec.in)}${c.rec.late ? ` · ${c.rec.late} min late` : ''}` : c.plan.kind === 'leave' ? 'On leave' : k === 'suspended' ? 'Suspended' : c.plan.kind === 'off' ? 'Weekly off' : sh ? `Not in · ${sh.name} ${t12(sh.start)}` : 'Not in';
          return <Link key={s.code} href={`/staff-profile?code=${s.code}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-av" style={{ width: 28, height: 28, background: 'var(--surface-subtle)', color: 'var(--text-body)' }} aria-hidden="true">{s.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span><span><span className="tm-strong">{s.name}</span><span className="tm-sub">{s.designation}</span></span><span className={'tm-sub' + (c.rec && c.rec.late ? ' tm-warn' : c.rec ? ' tm-in' : '')} style={{ textAlign: 'right' }}>{txt}</span></Link>;
        })}
    </Block>
  );
}

function ChatPeek({ me, ready }) {
  useTick([CHAT_EVENT]);
  if (!ready) return null;
  const msgs = getMessages();
  const chans = channelsFor(me, undefined, msgs).map((c) => ({ c, n: unread(c.id, me.id, msgs), last: msgs.filter((m) => m.ch === c.id).slice(-1)[0] })).filter((x) => x.last).sort((a, b) => b.n - a.n || b.last.at - a.last.at).slice(0, 4);
  const total = chans.reduce((a, x) => a + x.n, 0);
  return (
    <Block title="Team chat" period={total ? `${total} unread` : 'All caught up'} href="/team-chat" link="Open chat">
        {chans.map(({ c, n, last }) => <Link key={c.id} href={`/team-chat?ch=${encodeURIComponent(c.id)}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}>{c.kind === 'dm' ? <UserAvatar id={c.other} size={28} /> : <span className="tm-tile" style={{ width: 28, height: 28 }}><Icon name={c.icon} width="14" height="14" aria-hidden="true" /></span>}<span><span className={n ? 'tm-strong' : ''}>{c.kind === 'channel' ? '# ' + c.name : c.name}</span><span className="tm-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName(last.by).split(' ')[0]}: {last.text}</span></span>{n ? <span className="gc-badge gc-badge--info">{n}</span> : null}</Link>)}
    </Block>
  );
}
