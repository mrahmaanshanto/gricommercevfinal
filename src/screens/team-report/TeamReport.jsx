'use client';
// TeamReport — support and sales team performance, laid out like Shopify's overview pages (components/ui/IndexKit.jsx):
// title row with Export, one strip of key figures with the period picker, then the agent leaderboard and, beside it,
// where conversations come from and the first response by day.
// Edit freely: this file is the source for the screen.

import React from 'react';
import Link from 'next/link';
import { DCLogic } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';

// ---- logic ----

const PERIODS = ['Last 7 days', 'Today', 'Last 30 days', 'This quarter'];
// name, role, resolved, first reply, revenue, CSAT
const AGENTS = [
  ['Rina Ahmed', 'Support lead', 318, '1m 42s', '৳2.1L', 4.8],
  ['Tasnim Akter', 'Sales', 276, '2m 05s', '৳1.8L', 4.7],
  ['Mehedi Karim', 'Support', 241, '2m 38s', '৳1.1L', 4.6],
  ['Sabbir Islam', 'Support', 198, '3m 11s', '৳74k', 4.2],
  ['Nabila Ferdous', 'Sales · part time', 142, '2m 52s', '৳68k', 4.5],
];
// channel, conversations, colour (Facebook is --viz-1 and phone --viz-3 across the app)
const SOURCES = [['Instagram DM', 462, 'var(--viz-5)'], ['WhatsApp', 381, 'var(--viz-6)'], ['Calls', 248, 'var(--viz-3)'], ['Facebook', 193, 'var(--viz-1)']];
// day, first response in minutes
const DAYS = [['Sat', 2.2], ['Sun', 2.6], ['Mon', 1.9], ['Tue', 3.3], ['Wed', 2.1], ['Thu', 1.7], ['Fri', 1.4]];

class Component extends DCLogic {
  state = { period: PERIODS[0] };
  exportCsv() {
    const rows = [['Agent', 'Role', 'Resolved', 'First reply', 'Revenue', 'CSAT'], ...AGENTS];
    const csv = rows.map((r) => r.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'team-performance.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Exported ' + AGENTS.length + ' agents to team-performance.csv');
  }
  renderVals() {
    const maxSrc = Math.max(...SOURCES.map((x) => x[1]));
    const maxDay = Math.max(...DAYS.map((d) => d[1]));
    return {
      period: this.state.period, setPeriod: (e) => this.setState({ period: e.target.value }),
      exportCsv: () => this.exportCsv(),
      sources: SOURCES.map(([l, n, c]) => ({ l, n, c, w: Math.round((n / maxSrc) * 100) + '%' })),
      days: DAYS.map(([d, m]) => ({ d, m, h: Math.round((m / maxDay) * 100) + '%', peak: m === maxDay, t: d + ' · ' + Math.floor(m) + 'm ' + String(Math.round((m % 1) * 60)).padStart(2, '0') + 's' })),
    };
  }
}

// ---- styles ----

const CSS = `
.tr-src{display:flex;flex-direction:column;gap:var(--space-3)}
.tr-src__row{display:flex;justify-content:space-between;font-size:var(--text-xs-plus);color:var(--text-body)}
.tr-src__row b{font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.tr-bar{height:6px;margin-top:4px;border-radius:var(--radius-full);background:var(--surface-subtle)}
.tr-bar>span{display:block;height:100%;border-radius:inherit}
.tr-days{display:flex;align-items:flex-end;gap:8px;height:96px}
.tr-days>span{flex:1;border-radius:var(--radius-sm) var(--radius-sm) 0 0;background:var(--fill-primary-soft)}
.tr-days>span.is-peak{background:var(--primary)}
.tr-dlab{display:flex;gap:8px;margin-top:6px}
.tr-dlab>span{flex:1;text-align:center;font-size:var(--text-xs);color:var(--text-muted)}
.tr-note{margin:var(--space-3) 0 0;font-size:var(--text-xs);color:var(--text-body)}
.tr-plist{margin-top:var(--space-2)}
.tr-board{margin-top:var(--space-3)}
`;

// ---- markup ----

const csatTone = (x) => (x >= 4.5 ? 'success' : 'warning');

export default class TeamReportScreen extends Component {
  render() {
    const v = this.renderVals();
    return (
      <div className="dc-screen ds" data-screen="TeamReport">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="rep-marketing" />
          <div className="gc-shell__main">
            <Topbar crumb="Reports" page="Team performance" />
            <main className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <ShopHeader icon="users" title="Team performance"
                  about="How the support and sales team is doing: conversations handled, first response, resolution and revenue from chat, per agent and per channel. Support and sales · 6 agents · Asia/Dhaka."
                  secondary={[{ label: 'Export', onClick: v.exportCsv }]}
                  more={[{ label: 'Inbox', href: '/merchant-inbox' }, { label: 'Support tickets', href: '/support-tickets' }, { label: 'Reports', href: '/reports-centre' }]} />

                <MetricStrip label={'Team figures, ' + v.period}
                  lead={<select className="ix-pick" aria-label="Reporting period" value={v.period} onChange={v.setPeriod}>{PERIODS.map((p) => <option key={p}>{p}</option>)}</select>}
                  items={[
                    { label: 'Conversations handled', value: '1,284', sub: '▲ 11%' },
                    { label: 'First response', value: '2m 14s', sub: '▼ 38s' },
                    { label: 'Resolution rate', value: '94%', sub: '▲ 3pt' },
                    { label: 'Revenue from chat', value: '৳6.42L', sub: '▲ 18%' },
                  ]} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card" aria-labelledby="tr-board">
                      <header className="ix-card__head"><div><h2 id="tr-board">Agent leaderboard</h2><p className="ix-card__sub">Ranked by resolved</p></div></header>
                      <ul className="ix-plist tr-plist" aria-label="Agent leaderboard">
                        {AGENTS.map((a) => (
                          <li key={a[0]}>
                            <div className="ix-pitem">
                              <span className="ix-pitem__top"><b>{a[0]}</b><span>{a[2]} resolved</span></span>
                              <span className="ix-pitem__mid">{a[1]} · first reply {a[3]} · {a[4]}</span>
                              <span className="ix-pitem__tags"><StatusBadge tone={csatTone(a[5])} icon="star">{a[5].toFixed(1)}</StatusBadge></span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="ix-table-wrap tr-board">
                        <table className="ix-table ix-table--static gc-table--keep">
                          <caption className="sr-only">Agent leaderboard, {v.period}</caption>
                          <thead>
                            <tr><th scope="col">Agent</th><th scope="col">Role</th><th scope="col" className="ix-num">Resolved</th><th scope="col" className="ix-num">First reply</th><th scope="col" className="ix-num">Revenue</th><th scope="col">CSAT</th></tr>
                          </thead>
                          <tbody>
                            {AGENTS.map((a) => (
                              <tr key={a[0]}>
                                <td className="ix-strong">{a[0]}</td>
                                <td className="ix-muted">{a[1]}</td>
                                <td className="ix-num">{a[2]}</td>
                                <td className="ix-num">{a[3]}</td>
                                <td className="ix-num">{a[4]}</td>
                                <td><StatusBadge tone={csatTone(a[5])} icon="star">{a[5].toFixed(1)}</StatusBadge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card" aria-labelledby="tr-src">
                      <header className="ix-card__head"><h2 id="tr-src">Where conversations come from</h2><Link href="/merchant-inbox">Inbox</Link></header>
                      <div className="ix-card__body tr-src">
                        {v.sources.map((x) => (
                          <div key={x.l}>
                            <div className="tr-src__row"><span>{x.l}</span><b>{x.n}</b></div>
                            <div className="tr-bar"><span style={{ width: x.w, background: x.c }} /></div>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="ix-card" aria-labelledby="tr-days">
                      <header className="ix-card__head"><div><h2 id="tr-days">First response by day</h2><p className="ix-card__sub">minutes</p></div></header>
                      <div className="ix-card__body">
                        <div className="tr-days" role="img" aria-label={v.days.map((d) => d.t).join(', ')}>
                          {v.days.map((d) => <span key={d.d} className={d.peak ? 'is-peak' : ''} style={{ height: d.h }} title={d.t} />)}
                        </div>
                        <div className="tr-dlab">{v.days.map((d) => <span key={d.d}>{d.d}</span>)}</div>
                        <p className="tr-note">Tuesday peaks at 3m 20s — the Eid campaign send lands at 11 AM with only two agents rostered.</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
