'use client';
// Generated from design/templates/settings-console/SetRail.dc.html by scripts/convert-design.mjs.
// SetRail — the settings list (Shopify's Settings navigation): a column beside the cards from 1024px up (search,
// then each section with its icon and a status dot), and a horizontally scrolling strip of sections above the
// cards on narrower windows. The search finds sections and single settings (lib/settingsRegistry.js): a setting
// opens its page with the field highlighted, and settings owned by another area say where they live.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { SetFragment as __SetFragment } from '@/screens/settings-console/SetChrome';
import { hasModule, currentEditionId, LOCKED, routeInEdition } from '@/lib/edition';
import { searchSettings } from '@/lib/settingsRegistry';

// ---- logic (from the design's <script type="text/x-dc">) ----

// Sections that have a screen in this build. The rest say so when chosen.
const ROUTES = {
  // Business setup: each area's own setup page, listed here too (the pages keep their addresses)
  'set-orders': '/order-settings', 'set-catalog': '/catalog-setup', 'set-customers': '/customer-settings', 'set-channels': '/channel-settings', 'set-autocall': '/auto-call-settings',
  'set-comms': '/workflow-settings', 'set-staff': '/hr-setup', 'set-accounts': '/account-setup', 'set-pos': '/pos-manage',
  general: '/set-general', preference: '/set-preference', payment: '/set-payments', delivery: '/set-delivery',
  ai: '/set-ai', rules: '/set-rules', notifications: '/set-notifications', stocksetup: '/stock-setup', profile: '/set-profile', usage: '/set-usage', seo: '/set-seo', storage: '/set-storage',
  apisec: '/set-security', dbbackup: '/set-security#s1', filebackup: '/set-security#s2',
  privacy: '/set-privacy', domains: '/set-domains', history: '/settings-history',
  billing: '/subscription', usagelimits: '/subscription#usage', wallet: '/credit-wallet',
  // every outside connection is made in Connections
  connections: '/connections', social: '/connections?group=social', courier: '/connections?group=delivery', mail: '/connections?group=messages', sms: '/connections?group=messages',
};

const GROUPS = [
  ['Store', [['connections', 'Connections', 'ok'], ['general', 'General', 'ok'], ['profile', 'Profile type', 'ok'], ['stocksetup', 'Stock setup', 'ok'], ['preference', 'Preference', 'ok'], ['privacy', 'Privacy & consent', 'ok'], ['domains', 'Domains', 'ok'], ['pos', 'POS', 'ok'], ['report', 'Report Settings', 'none']]],
  ['Business setup', [['set-orders', 'Orders', 'ok'], ['set-catalog', 'Products & catalog', 'ok'], ['set-customers', 'Customers', 'ok'], ['set-channels', 'Sales channels', 'ok'], ['set-autocall', 'Auto-call', 'ok'], ['set-comms', 'Communications', 'ok'], ['set-staff', 'Staff & HR', 'ok'], ['set-accounts', 'Accounts', 'ok'], ['set-pos', 'POS counters', 'ok']]],
  ['Commerce', [['payment', 'Payment Gateway', 'ok'], ['delivery', 'Delivery Settings', 'ok'], ['courier', 'Courier Settings', 'warn', '1']]],
  ['Notifications', [['notifications', 'Order notifications', 'ok']]],
  ['Communication', [['mail', 'Mail', 'ok'], ['sms', 'SMS', 'warn', '1'], ['push', 'Push Notifications', 'off'], ['social', 'Social Integrations', 'ok'], ['ai', 'AI provider', 'ok'], ['rules', 'Auto-Reply Rules', 'ok'], ['usage', 'AI Usage', 'none']]],
  ['Discovery', [['seo', 'SEO', 'ok'], ['smart', 'Smart Search', 'ok'], ['imgsearch', 'Image Search', 'off']]],
  ['Platform', [['storage', 'Storage', 'warn', '1'], ['realtime', 'Realtime (Websocket)', 'ok'], ['apisec', 'API Security', 'ok'], ['recaptcha', 'Recaptcha', 'off'], ['dbbackup', 'Database Backup', 'ok'], ['filebackup', 'File Backup', 'warn', '1'], ['history', 'Settings history', 'none']]],
  ['Account & billing', [['billing', 'Plan & billing', 'ok'], ['usagelimits', 'Usage & limits', 'none'], ['wallet', 'Wallet & credits', 'none']]],
];

const STATE = { ok: 'configured', warn: 'needs setup', off: 'turned off' };
// the small icon in front of each section
const ICON = {
  connections: 'plug', general: 'store', profile: 'user-cog', stocksetup: 'boxes', preference: 'sliders-horizontal', pos: 'scan-line', report: 'file-bar-chart',
  payment: 'credit-card', delivery: 'truck', courier: 'package', notifications: 'bell', mail: 'mail', sms: 'message-square', push: 'bell-ring',
  social: 'share-2', ai: 'bot', rules: 'list-checks', usage: 'gauge', seo: 'search', smart: 'sparkles', imgsearch: 'image', storage: 'hard-drive',
  realtime: 'radio', apisec: 'shield', recaptcha: 'shield-check', dbbackup: 'database', filebackup: 'archive',
  privacy: 'lock', domains: 'globe', history: 'history', billing: 'receipt', usagelimits: 'activity', wallet: 'wallet',
  'set-orders': 'package', 'set-catalog': 'tag', 'set-customers': 'users', 'set-channels': 'share-2', 'set-autocall': 'phone-call',
  'set-comms': 'messages-square', 'set-staff': 'contact', 'set-accounts': 'landmark', 'set-pos': 'monitor-smartphone',
};
// sections that belong to a module (src/lib/edition.js); the rest are in every edition
const SECTION_MODULE = { domains: 'online', notifications: 'online', usage: 'comms', stocksetup: 'catalog', pos: 'pos', report: 'reports', payment: 'commerce', delivery: 'online', courier: 'online', social: 'comms', ai: 'comms', rules: 'comms', seo: 'online', smart: 'online', imgsearch: 'online' };

class Component extends DCLogic {
  constructor(p) {
    super(p);
    this.scroller = React.createRef();
    this.state = { q: '', closed: {}, collapsed: false, ed: LOCKED ? currentEditionId() : 'full' };
  }
  componentDidMount() { this.setState({ ed: currentEditionId() }); this.reveal(); }
  /** Bring the current section into view, in the column (vertical) and in the strip (horizontal). */
  reveal() {
    const run = () => {
      const box = this.scroller.current; if (!box) return;
      const row = box.querySelector('[aria-current="page"]');
      if (!row) return;
      box.scrollTop = Math.max(0, row.offsetTop - 150);
      box.scrollLeft = Math.max(0, row.offsetLeft - 24);
    };
    setTimeout(run, 120); setTimeout(run, 600);
  }
  renderVals() {
    const active = this.props.active || 'general';
    const q = this.state.q.trim().toLowerCase();
    const groups = GROUPS.map(([label, items]) => ({
      label,
      open: !!q || !this.state.closed[label],
      items: items
        // an item with no page yet is hidden, and so is a page outside the site's edition (it would say "Not in …")
        .filter(([id]) => ROUTES[id] && routeInEdition(ROUTES[id].split(/[?#]/)[0], this.state.ed))
        .filter(([id, name]) => (!q || name.toLowerCase().includes(q)) && (!SECTION_MODULE[id] || hasModule(SECTION_MODULE[id], this.state.ed)))
        .map(([id, name, dot, badge]) => ({ id, name, dot, badge: badge || '', href: ROUTES[id] || '', active: id === active })),
    })).map((g) => ({ ...g, count: g.items.length })).filter((g) => g.items.length);
    // single settings (and where settings owned by other areas live)
    let hits = [];
    if (q.length >= 2) { try { hits = searchSettings(q, { limit: 10 }); } catch { hits = []; } }
    return {
      hits,
      // a setting on the page that is open: highlight it here instead of opening the page again
      samePage: (h) => (e) => {
        const [path, query] = h.href.split('?');
        if (!h.field || typeof window === 'undefined' || window.location.pathname !== path) return;
        e.preventDefault();
        window.history.replaceState(window.history.state, '', path + '?' + query);
        window.dispatchEvent(new CustomEvent('gc:set-focus', { detail: h.field }));
      },
      scroller: this.scroller,
      q: this.state.q,
      setQ: (e) => this.setState({ q: e.target.value }),
      clearQ: () => this.setState({ q: '' }),
      collapsed: this.state.collapsed,
      toggleNav: () => this.setState((st) => ({ collapsed: !st.collapsed })),
      toggleGroup: (label) => () => this.setState((st) => ({ closed: { ...st.closed, [label]: !st.closed[label] } })),
      soon: (name) => () => toast(name + ' settings are not part of this demo yet.', { tone: 'info' }),
      groups,
    };
  }
}

// ---- styles ----

const CSS = `
.set-shell__nav{flex:none;display:flex;align-self:flex-start;position:sticky;top:var(--header-height,64px);height:calc(var(--set-vh,100dvh) - var(--header-height,64px) - 24px)}
.set-nav{width:240px;flex:none;height:100%;display:flex;flex-direction:column;border-right:1px solid var(--border-subtle);background:var(--surface-card);font-family:var(--font-sans)}
.set-nav__head{flex:none;display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-3) var(--space-2)}
.set-nav__top{display:flex;align-items:center;gap:var(--space-2);min-height:32px}
.set-nav__title{flex:1;min-width:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.set-nav__back{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px;margin-left:-4px;align-self:flex-start;border-radius:var(--radius-lg);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);text-decoration:none}
.set-nav__back:hover{background:var(--surface-subtle);color:var(--text-heading)}
.set-nav__iconbtn{width:28px;height:28px;flex:none;display:grid;place-items:center;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.set-nav__iconbtn:hover{background:var(--surface-subtle);color:var(--text-body)}
.set-nav__search{display:flex;align-items:center;gap:var(--space-2);height:32px;padding:0 10px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-muted)}
.set-nav__search:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.set-nav__search input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.set-nav__search input::placeholder{color:var(--text-muted)}
.set-nav__list{flex:1;min-height:0;overflow:auto;padding:0 var(--space-2) var(--space-3)}
.set-nav__group{display:flex;flex-direction:column;gap:1px;padding-bottom:var(--space-2)}
.set-nav__grouphead{display:flex;align-items:center;gap:4px;height:28px;padding:0 6px;border:0;background:none;font-family:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer}
.set-nav__grouphead:hover{color:var(--text-body)}
.set-nav__grouphead[aria-expanded="false"] svg{transform:rotate(-90deg)}
.set-nav__item{display:flex;align-items:center;gap:var(--space-2);width:100%;height:32px;padding:0 8px;border:0;border-radius:var(--radius-lg);background:none;font-family:inherit;font-size:var(--text-sm);font-weight:var(--weight-regular);text-align:left;text-decoration:none;color:var(--text-body);cursor:pointer}
.set-nav__item>svg{flex:none;color:var(--text-muted)}
.set-nav__item:hover{background:var(--surface-subtle);color:var(--text-heading)}
.set-nav__item[aria-current="page"],.set-nav__item[aria-current="page"]:hover{background:var(--fill-primary-soft);font-weight:var(--weight-medium);color:var(--primary)}
.set-nav__item[aria-current="page"]>svg{color:var(--primary)}
.set-nav__name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.set-nav__dot{flex:none;width:6px;height:6px;border-radius:var(--radius-full)}
.set-nav__dot--ok{background:var(--success,#10b981)}
.set-nav__dot--warn{background:var(--warning,#ff9800)}
.set-nav__dot--off{border:1.5px solid var(--text-muted)}
.set-nav__badge{flex:none;display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:var(--radius-full);background:var(--fill-warning-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.set-nav__empty{padding:8px;font-size:var(--text-xs);color:var(--text-muted)}
.set-nav__clear{border:0;background:none;padding:0;font:inherit;color:var(--text-link);text-decoration:underline;cursor:pointer}
.set-nav a:focus-visible,.set-nav button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.set-nav--collapsed{width:56px}
.set-nav--collapsed .set-nav__hide{display:none}
.set-nav__hit{height:auto;min-height:40px;padding:4px 8px;align-items:flex-start}
.set-nav__hit>svg{margin-top:3px}
.set-nav__hit .set-nav__name{display:flex;flex-direction:column;white-space:normal}
.set-nav__hitlabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.set-nav__hit small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.set-nav--collapsed .set-nav__hits{display:none}
/* collapsed: the list keeps only its icons */
@media (min-width:1024px){
  .set-nav--collapsed .set-nav__head{padding:var(--space-3) 14px var(--space-2)}
  .set-nav--collapsed .set-nav__list{padding:0 10px var(--space-3)}
  .set-nav--collapsed .set-nav__grouphead,.set-nav--collapsed .set-nav__name,.set-nav--collapsed .set-nav__dot,.set-nav--collapsed .set-nav__badge{display:none}
  .set-nav--collapsed .set-nav__item{justify-content:center;padding:0}
}
@media (max-width:1279px){.set-nav{width:220px}.set-nav--collapsed{width:56px}}
/* below 1024px: one row of sections that scrolls sideways, pinned under the top bar */
@media (max-width:1023px){
  .set-shell__nav{align-self:stretch;width:100%;height:auto;z-index:30}
  .set-nav,.set-nav--collapsed{width:100%;height:auto;border-right:0;border-bottom:1px solid var(--border-subtle)}
  .set-nav__head,.set-nav__grouphead,.set-nav__hits{display:none}
  .set-nav--collapsed .set-nav__list{display:flex}
  .set-nav__list{display:flex;align-items:center;gap:4px;overflow-x:auto;overflow-y:hidden;padding:8px 12px;scrollbar-width:thin}
  .set-nav__group{display:contents}
  .set-nav__item{flex:none;width:auto;white-space:nowrap}
  .set-nav__name{flex:none;overflow:visible}
}
`;

// ---- markup ----

export default class SetRailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const dot = (it) => (it.dot === 'none' ? null : <span className={'set-nav__dot set-nav__dot--' + it.dot} role="img" aria-label={STATE[it.dot]} title={STATE[it.dot]} />);
    const inner = (it) => (<>
      <__Icon name={ICON[it.id] || 'settings'} width="16" height="16" aria-hidden="true" />
      <span className="set-nav__name">{it.name}</span>
      {it.badge ? <span className="set-nav__badge" aria-label={it.badge + ' to fix'}>{it.badge}</span> : dot(it)}
    </>);
    const screen = (
      <div className="dc-screen ds" data-screen="SetRail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <nav aria-label="Settings sections" className={'set-nav' + (v.collapsed ? ' set-nav--collapsed' : '')}>
          <div className="set-nav__head">
            <__Link className="set-nav__back set-nav__hide" href="/merchant-overview"><__Icon name="arrow-left" width="14" height="14" aria-hidden="true" />Back to dashboard</__Link>
            <div className="set-nav__top">
              <span className="set-nav__title set-nav__hide">Settings</span>
              <button type="button" className="set-nav__iconbtn" aria-label={v.collapsed ? 'Show the settings menu' : 'Hide the settings menu'} aria-expanded={!v.collapsed} aria-controls="set-nav-list" onClick={v.toggleNav}>
                <__Icon name={v.collapsed ? 'panel-left-open' : 'panel-left-close'} width="16" height="16" aria-hidden="true" />
              </button>
            </div>
            <label className="set-nav__search set-nav__hide">
              <__Icon name="search" width="16" height="16" aria-hidden="true" />
              <input type="search" value={v.q} onChange={v.setQ} placeholder="Search settings" aria-label="Search settings" />
            </label>
          </div>
          <div ref={v.scroller} id="set-nav-list" className="set-nav__list">
            {__list(v.groups).map((g) => (
              <div key={g.label} className="set-nav__group">
                <button type="button" className="set-nav__grouphead" aria-expanded={g.open} onClick={v.toggleGroup(g.label)}><__Icon name="chevron-down" width="12" height="12" aria-hidden="true" />{g.label}</button>
                {g.open ? __list(g.items).map((it) => (it.href
                  ? <__Link key={it.id} className="set-nav__item" href={it.href} title={v.collapsed ? it.name : undefined} aria-current={it.active ? 'page' : undefined}>{inner(it)}</__Link>
                  : <button key={it.id} type="button" className="set-nav__item" title={v.collapsed ? it.name : undefined} aria-current={it.active ? 'page' : undefined} onClick={v.soon(it.name)}>{inner(it)}</button>
                )) : null}
              </div>
            ))}
            {v.hits.length ? (
              <div className="set-nav__group set-nav__hits">
                <span className="set-nav__grouphead" style={{ cursor: 'default' }}>Settings</span>
                {v.hits.map((h) => (
                  <__Link key={h.id} className="set-nav__item set-nav__hit" href={h.href} onClick={v.samePage(h)}>
                    <__Icon name={h.field ? 'text-cursor-input' : 'arrow-up-right'} width="16" height="16" aria-hidden="true" />
                    <span className="set-nav__name"><span className="set-nav__hitlabel">{h.label}</span><small>{h.page}{h.owner !== 'Settings' ? ' · ' + h.owner : ''}</small></span>
                  </__Link>
                ))}
              </div>
            ) : null}
            {v.groups.length || v.hits.length ? null : (
              <span className="set-nav__empty">No setting matches “{v.q}”. <button type="button" className="set-nav__clear" onClick={v.clearQ}>Clear search</button></span>
            )}
          </div>
        </nav>
      </div>
    );
    return this.props.embedded ? screen : <__SetFragment name="Settings section menu">{screen}</__SetFragment>;
  }
}
