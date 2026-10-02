'use client';
// Automations — the rules list, laid out like Shopify Flow's workflow list (components/ui/IndexKit.jsx): title row,
// key figures, then one card with the category views, search and filters, bulk on / off and a compact table.
// A row opens the workflow builder; the run history opens in a side panel (Recent runs).
// Edit freely: this file is the source for the screen.

import React from 'react';
import Link from 'next/link';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, Menu } from '@/components/ui/IndexKit';

// ---- logic ----

const CATS = [['all', 'All'], ['orders', 'Orders'], ['delivery', 'Delivery'], ['customers', 'Customers'], ['stock', 'Stock'], ['marketing', 'Marketing']];
// id, cat, name, when, then, default on, runs 7d, cost note, custom
const RULES = [
  ['r1', 'orders', 'Thank customers after AI confirmation', 'an order is AI confirmed', 'send a WhatsApp message with the order summary and delivery date', true, 212, '৳1.10 per message', false],
  ['r2', 'delivery', 'Book the courier when an order is packed', 'an order moves to Packed', 'book the default courier from the dispatch location and print the label', true, 164, 'No charge', false],
  ['r3', 'delivery', 'Ask for a review after delivery', 'a parcel is delivered, then wait 2 days', 'send an SMS with the review link', true, 138, '৳0.60 per SMS', false],
  ['r4', 'stock', 'Request stock when it runs low', 'stock at any location falls below its alert level', 'create a purchase request for the manager to approve', true, 9, 'No charge', false],
  ['r5', 'customers', 'Flag customers who return twice', 'the same phone number has 2 returned orders', 'tag the customer “Risky” and turn off COD for them', false, 0, 'No charge', false],
  ['r6', 'marketing', 'Share new blog posts', 'a blog post is published on WordPress', 'schedule it for the Facebook Page and LinkedIn page', false, 0, 'No charge', false],
  ['c1', 'orders', 'Big orders need a manager call', 'a COD order is over ৳10,000 and from a new customer', 'hold the order and notify the Dhanmondi manager in the app', true, 6, 'No charge', true],
  ['c2', 'marketing', 'Win back quiet customers', 'a customer has not ordered for 60 days', 'send a WhatsApp offer with code COMEBACK10', true, 41, '৳1.10 per message', true]
];
const RUNS = [['3:12 PM', 'Thank customers after AI confirmation', 'WhatsApp sent to Farhana Akter · #ORD-0929-011', 'ok'], ['2:55 PM', 'Book the courier when an order is packed', 'Pathao booked · #ORD-0929-004 · from Central Warehouse', 'ok'], ['1:40 PM', 'Big orders need a manager call', 'Held #ORD-0929-007 · ৳12,400 · new customer', 'ok'], ['11:20 AM', 'Ask for a review after delivery', 'SMS to 01911-204417 failed: number switched off', 'fail'], ['10:05 AM', 'Request stock when it runs low', 'Request PR-0929-02 · Braided Lightning Cable at Mirpur', 'ok'], ['9:00 AM', 'Win back quiet customers', '12 WhatsApp offers sent', 'ok']];
const catName = (k) => (CATS.find((c) => c[0] === k) || CATS[0])[1];
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
const BUILDER = '/workflow-builder';

class Component extends DCLogic {
  state = { f: 'all', on: {}, q: '', find: false, status: '', kind: '', sel: {}, runsOpen: false };
  isOn(r) { return this.state.on[r[0]] == null ? r[5] : this.state.on[r[0]]; }
  /** Turn the selected rules on or off. */
  setMany(ids, value) {
    const list = RULES.filter((r) => ids.includes(r[0]) && this.isOn(r) !== value);
    if (!list.length) { toast(value ? 'The selected rules are already on' : 'The selected rules are already off', { tone: 'info' }); return; }
    const on = { ...this.state.on };
    list.forEach((r) => { on[r[0]] = value; });
    this.setState({ on, sel: {} });
    if (list.length === 1) toast('“' + list[0][2] + '” is ' + (value ? 'on. It runs from the next matching event.' : 'off.'));
    else toast(plural(list.length, 'rule') + (value ? ' turned on' : ' turned off'));
  }
  renderVals() {
    const st = this.state;
    const needle = st.q.trim().toLowerCase();
    const live = RULES.filter((r) => this.isOn(r));
    const runs = live.reduce((a, r) => a + r[6], 0);
    const matches = (r) => (!needle || [r[2], r[3], r[4]].join(' ').toLowerCase().includes(needle))
      && (!st.status || (st.status === 'on') === this.isOn(r))
      && (!st.kind || (st.kind === 'custom') === r[8]);
    const counts = {};
    CATS.forEach(([k]) => { counts[k] = RULES.filter((r) => k === 'all' || r[1] === k).length; });
    const rows = RULES.filter((r) => (st.f === 'all' || r[1] === st.f) && matches(r));
    const selIds = rows.filter((r) => st.sel[r[0]]).map((r) => r[0]);
    const allChecked = rows.length > 0 && rows.every((r) => st.sel[r[0]]);
    const hasFilters = !!(needle || st.status || st.kind);
    const clear = () => this.setState({ q: '', status: '', kind: '' });
    return {
      tabs: CATS.map(([k, l]) => ({ key: k, label: l, count: counts[k], id: 'au-tab-' + k, on: st.f === k, onClick: () => this.setState({ f: k, sel: {} }) })),
      tabLabel: st.f === 'all' ? 'All rules' : catName(st.f) + ' rules',
      figures: [
        { label: 'Rules on', value: live.length + ' / ' + RULES.length, sub: RULES.filter((r) => r[8]).length + ' custom' },
        { label: 'Runs, 7 days', value: String(runs) },
        { label: 'Failed today', value: String(RUNS.filter((u) => u[3] === 'fail').length), onClick: () => this.setState({ runsOpen: true }) },
        { label: 'Wallet spend, 7 days', value: '৳361', sub: '391 messages' },
      ],
      find: !!(st.find || hasFilters),
      openFind: () => this.setState({ find: true }),
      closeFind: () => this.setState({ find: false, q: '', status: '', kind: '' }),
      q: st.q, onSearch: (e) => this.setState({ q: e.target.value }),
      status: st.status, onStatus: (e) => this.setState({ status: e.target.value }),
      kind: st.kind, onKind: (e) => this.setState({ kind: e.target.value }),
      hasFilters, clear,
      empty: rows.length === 0,
      emptyTitle: needle ? 'No rules match “' + st.q.trim() + '”' : 'No rules match these filters',
      countLabel: rows.length ? 'Showing ' + plural(rows.length, 'rule') : 'No rules to show',
      selCount: selIds.length, allChecked,
      toggleAll: () => { const sel = { ...st.sel }; rows.forEach((r) => { sel[r[0]] = !allChecked; }); this.setState({ sel }); },
      clearSel: () => this.setState({ sel: {} }),
      turnOn: () => this.setMany(selIds, true),
      turnOff: () => this.setMany(selIds, false),
      runsOpen: st.runsOpen,
      openRuns: () => this.setState({ runsOpen: true }),
      closeRuns: () => this.setState({ runsOpen: false }),
      runs: RUNS.map((u) => ({ t: u[0], r: u[1], d: u[2], ok: u[3] === 'ok' })),
      rows: rows.map((r) => {
        const on = this.isOn(r);
        return {
          id: r[0], name: r[2], cat: catName(r[1]), custom: r[8], when: 'When ' + r[3], full: 'When ' + r[3] + ', then ' + r[4] + '.',
          runs: on ? String(r[6]) : '—', cost: r[7], on,
          checked: !!st.sel[r[0]],
          onToggle: () => this.setState((s) => ({ sel: { ...s.sel, [r[0]]: !s.sel[r[0]] } })),
          onSwitch: () => this.setMany([r[0]], !on),
          onRowClick: (e) => { if (e.target.closest('a,button,input,label,select')) return; navigate(BUILDER); },
        };
      }),
    };
  }
}

// ---- styles ----

const CSS = `
.au-when{display:block;max-width:340px;overflow:hidden;text-overflow:ellipsis}
.au-runs{display:flex;flex-direction:column}
.au-run{display:flex;flex-direction:column;gap:4px;padding:10px 0;border-bottom:1px solid var(--border-subtle)}
.au-run:last-child{border-bottom:0}
.au-run__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.au-run__text{font-size:var(--text-xs);color:var(--text-muted)}
`;

// ---- markup ----

export default class AutomationsScreen extends Component {
  render() {
    const v = this.renderVals();
    return (
      <div className="dc-screen ds" data-screen="Automations">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="auto-rules" />
          <main className="gc-shell__main">
            <Topbar crumb="Automation" page="Rules" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="zap" title="Rules"
                  about="Ready-made rules and your own When / Then workflows. Turn a rule on or off, open it to change what it does, and check what ran in Recent runs."
                  secondary={[{ label: 'Recent runs', onClick: v.openRuns }]}
                  more={[{ label: 'Workflow settings', href: '/workflow-settings' }]}
                  primary={{ label: 'New workflow', href: BUILDER }} />

                <MetricStrip label="Rules at a glance" items={v.figures} />

                <section className="ix-card" aria-label={v.tabLabel}>
                  {v.selCount ? (
                    <div className="ix-bulk" role="toolbar" aria-label="Selected rules">
                      <input type="checkbox" checked={v.allChecked} onChange={v.toggleAll} aria-label="Select every rule shown" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                      <span className="ix-bulk__n">{v.selCount} selected</span>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.turnOn}>Turn on</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.turnOff}>Turn off</button>
                      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Clear selection', onClick: v.clearSel }]} />
                    </div>
                  ) : (
                    <div className="ix-bar">
                      {v.find ? (<>
                        <SearchField value={v.q} onChange={v.onSearch} placeholder="Search rules" onDone={v.closeFind} autoFocus />
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                      </>) : (<>
                        <IndexTabs tabs={v.tabs} label="Rule category" />
                        <span className="ix-tools">
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={v.openFind}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                        </span>
                      </>)}
                    </div>
                  )}
                  {v.find && !v.selCount ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="Status" className={'ix-filter' + (v.status ? ' is-set' : '')} value={v.status} onChange={v.onStatus}>
                        <option value="">Status</option><option value="on">On</option><option value="off">Off</option>
                      </select>
                      <select aria-label="Type" className={'ix-filter' + (v.kind ? ' is-set' : '')} value={v.kind} onChange={v.onKind}>
                        <option value="">Type</option><option value="ready">Ready-made</option><option value="custom">Custom</option>
                      </select>
                      {v.hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.clear}>Clear all</button> : null}
                    </div>
                  ) : null}

                  {v.empty ? (
                    <div className="ix-empty"><EmptyState icon="workflow" title={v.emptyTitle} actionLabel={v.hasFilters ? 'Clear filters' : undefined} onAction={v.hasFilters ? v.clear : undefined} /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label={v.tabLabel}>
                      {v.rows.map((r) => (
                        <li key={r.id}>
                          <Link href={BUILDER} className="ix-pitem">
                            <span className="ix-pitem__top"><b>{r.name}</b><span>{r.on ? <StatusBadge tone="success">On</StatusBadge> : <StatusBadge tone="neutral">Off</StatusBadge>}</span></span>
                            <span className="ix-pitem__mid">{r.when}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">{v.tabLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col" className="ix-check"><input type="checkbox" checked={v.allChecked} onChange={v.toggleAll} aria-label="Select every rule shown" /></th>
                            <th scope="col">Rule</th>
                            <th scope="col">Trigger</th>
                            <th scope="col">Category</th>
                            <th scope="col" className="ix-num">Runs, 7 days</th>
                            <th scope="col">Cost</th>
                            <th scope="col">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.id} className={r.checked ? 'is-sel' : ''} onClick={r.onRowClick} title={r.full}>
                              <td className="ix-check"><input type="checkbox" checked={r.checked} onChange={r.onToggle} aria-label={'Select ' + r.name} /></td>
                              <td><Link href={BUILDER} className="ix-strong">{r.name}</Link></td>
                              <td className="ix-muted"><span className="au-when">{r.when}</span></td>
                              <td className="ix-muted">{r.cat}{r.custom ? ' · Custom' : ''}</td>
                              <td className="ix-num">{r.runs}</td>
                              <td className="ix-muted">{r.cost}</td>
                              <td><button type="button" role="switch" aria-checked={r.on} aria-label={(r.on ? 'Turn off ' : 'Turn on ') + r.name} className="gc-switch" onClick={r.onSwitch}><span className="gc-switch__knob" /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <div className="ix-foot"><span>{v.countLabel}</span></div>
                </section>
                <LearnMore topic="rules" />
              </div>
            </div>
          </main>
        </div>

        <Sheet open={v.runsOpen} title="Recent runs" onClose={v.closeRuns}>
          <p className="gc-help" style={{ margin: 0 }}>Last 24 hours, Dhaka time. Failed runs retry 3 times before they show here.</p>
          <div className="au-runs">
            {v.runs.map((u) => (
              <div key={u.t + u.r} className="au-run">
                <span className="au-run__top"><span>{u.r}</span>{u.ok ? <StatusBadge tone="success">Done</StatusBadge> : <StatusBadge tone="error">Failed</StatusBadge>}</span>
                <span className="au-run__text">{u.t} · {u.d}</span>
              </div>
            ))}
          </div>
        </Sheet>
      </div>
    );
  }
}
