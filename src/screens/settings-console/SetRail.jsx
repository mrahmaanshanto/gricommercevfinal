'use client';
// Generated from design/templates/settings-console/SetRail.dc.html by scripts/convert-design.mjs.
// SetRail — the settings navigation: a column beside the form from 1024px up, and a
// horizontally scrolling strip of sections above the form on narrower windows.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { SetFragment as __SetFragment } from '@/screens/settings-console/SetChrome';

// ---- logic (from the design's <script type="text/x-dc">) ----

// Sections that have a screen in this build. The rest say so when chosen.
const ROUTES = {
  general: '/set-general', preference: '/set-preference', payment: '/set-payments', delivery: '/set-delivery',
  ai: '/set-ai', rules: '/set-rules', usage: '/set-usage', seo: '/set-seo', storage: '/set-storage',
  apisec: '/set-security', dbbackup: '/set-security#s1', filebackup: '/set-security#s2',
};

const GROUPS = [
  ['Store', [['general', 'General', 'ok'], ['preference', 'Preference', 'ok'], ['pos', 'POS', 'ok'], ['report', 'Report Settings', 'none']]],
  ['Commerce', [['payment', 'Payment Gateway', 'ok'], ['delivery', 'Delivery Settings', 'ok'], ['courier', 'Courier Settings', 'warn', '1']]],
  ['Communication', [['mail', 'Mail', 'ok'], ['sms', 'SMS', 'warn', '1'], ['push', 'Push Notifications', 'off'], ['social', 'Social Integrations', 'ok'], ['ai', 'AI Auto-Reply', 'ok'], ['rules', 'Auto-Reply Rules', 'ok'], ['usage', 'AI Usage', 'none']]],
  ['Discovery', [['seo', 'SEO', 'ok'], ['smart', 'Smart Search', 'ok'], ['imgsearch', 'Image Search', 'off']]],
  ['Platform', [['storage', 'Storage', 'warn', '1'], ['realtime', 'Realtime (Websocket)', 'ok'], ['apisec', 'API Security', 'ok'], ['recaptcha', 'Recaptcha', 'off'], ['dbbackup', 'Database Backup', 'ok'], ['filebackup', 'File Backup', 'warn', '1']]],
];

const STATE = { ok: 'configured', warn: 'needs setup', off: 'turned off' };

class Component extends DCLogic {
  constructor(p) {
    super(p);
    this.scroller = React.createRef();
    this.state = { q: '', closed: {}, collapsed: false };
  }
  componentDidMount() { this.reveal(); }
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
        .filter(([, name]) => !q || name.toLowerCase().includes(q))
        .map(([id, name, dot, badge]) => ({ id, name, dot, badge: badge || '', href: ROUTES[id] || '', active: id === active })),
    })).map((g) => ({ ...g, count: g.items.length })).filter((g) => g.items.length);
    return {
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

// ---- styles (from the design's <helmet>) ----

const CSS = `
.set-shell__nav{flex:none;display:flex;align-self:flex-start;position:sticky;top:var(--header-height,64px);height:calc(var(--set-vh,100dvh) - var(--header-height,64px) - 24px)}
.set-nav{width:272px;flex:none;height:100%;display:flex;flex-direction:column;border-right:1px solid #e2e8f0;background:#fff;font-family:var(--font-sans)}
.set-nav__head{flex:none;display:flex;flex-direction:column;gap:10px;padding:16px 14px 12px}
.set-nav__back{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 10px;margin-left:-6px;align-self:flex-start;border-radius:var(--radius-lg);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#003087;text-decoration:none}
.set-nav__back:hover{background:rgba(0,48,135,.06)}
.set-nav__iconbtn{width:32px;height:32px;flex:none;display:grid;place-items:center;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.set-nav__iconbtn:hover{background:#f1f5f9;color:#475569}
.set-nav__search{display:flex;align-items:center;gap:8px;height:44px;padding:0 10px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;color:var(--text-muted)}
.set-nav__search:focus-within{border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.14)}
.set-nav__search input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);color:#1e293b}
.set-nav__search input::placeholder{color:var(--text-muted)}
.set-nav__list{flex:1;min-height:0;overflow:auto;padding:0 10px 12px}
.set-nav__group{display:flex;flex-direction:column;gap:1px;padding-bottom:10px}
.set-nav__grouphead{display:flex;align-items:center;gap:5px;height:28px;padding:0 6px;border:0;background:none;font-family:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);cursor:pointer}
.set-nav__grouphead:hover{color:#475569}
.set-nav__grouphead[aria-expanded="false"] svg{transform:rotate(-90deg)}
.set-nav__item{display:flex;align-items:center;gap:9px;width:100%;height:36px;padding:0 9px;border:0;border-radius:var(--radius-lg);background:none;font-family:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-regular);letter-spacing:.005em;text-align:left;text-decoration:none;color:#475569;cursor:pointer}
.set-nav__item:hover{background:#f1f5f9;color:#1e293b}
.set-nav__item[aria-current="page"],.set-nav__item[aria-current="page"]:hover{background:rgba(0,48,135,.1);font-weight:var(--weight-medium);color:#003087}
.set-nav__name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.set-nav__dot{flex:none;width:7px;height:7px;border-radius:var(--radius-full)}
.set-nav__dot--ok{background:#10b981}
.set-nav__dot--warn{background:#ff9800}
.set-nav__dot--off{border:1.5px solid #64748b}
.set-nav__badge{flex:none;display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:var(--radius-full);background:rgba(255,152,0,.16);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.set-nav__legend{flex:none;display:flex;flex-wrap:wrap;gap:4px 12px;padding:10px 14px;border-top:1px solid #e2e8f0;font-size:var(--text-xs);color:var(--text-muted)}
.set-nav__legend span{display:inline-flex;align-items:center;gap:5px}
.set-nav__empty{padding:8px 9px;font-size:var(--text-xs);color:var(--text-muted)}
.set-nav a:focus-visible,.set-nav button:focus-visible{outline:3px solid var(--focus-ring,rgba(0,48,135,.5));outline-offset:-2px}
.set-nav--collapsed{width:56px}
.set-nav--collapsed .set-nav__head{padding:16px 12px 12px}
.set-nav--collapsed .set-nav__hide{display:none}
@media (max-width:1439px){.set-nav{width:248px}.set-nav--collapsed{width:56px}}
@media (max-width:1279px){.set-nav{width:224px}.set-nav--collapsed{width:56px}}
/* below 1024px: one row of sections that scrolls sideways, pinned under the top bar */
@media (max-width:1023px){
  .set-shell__nav{align-self:stretch;width:100%;height:auto;z-index:30}
  .set-nav,.set-nav--collapsed{width:100%;height:auto;border-right:0;border-bottom:1px solid #e2e8f0}
  .set-nav__head,.set-nav__legend,.set-nav__grouphead{display:none}
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
    const dot = (it) => (it.dot === 'none' ? <span className="set-nav__dot" aria-hidden="true" /> : <span className={'set-nav__dot set-nav__dot--' + it.dot} role="img" aria-label={STATE[it.dot]} />);
    const inner = (it) => (<>
      {dot(it)}
      <span className="set-nav__name">{it.name}</span>
      {it.badge ? <span className="set-nav__badge" aria-label={it.badge + ' to fix'}>{it.badge}</span> : null}
    </>);
    const screen = (
      <div className="dc-screen ds" data-screen="SetRail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <nav aria-label="Settings sections" className={'set-nav' + (v.collapsed ? ' set-nav--collapsed' : '')}>
          <div className="set-nav__head">
            <__Link className="set-nav__back set-nav__hide" href="/merchant-overview"><__Icon name="arrow-left" strokeWidth="1.75" width="15" height="15" aria-hidden="true" />Back to dashboard</__Link>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="set-nav__hide" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: ".015em", color: "#1e293b" }}>Settings</span>
              <button type="button" className="set-nav__iconbtn" style={{ marginLeft: "auto" }} aria-label={v.collapsed ? 'Show the settings menu' : 'Hide the settings menu'} aria-expanded={!v.collapsed} aria-controls="set-nav-list" onClick={v.toggleNav}>
                <__Icon name={v.collapsed ? 'panel-left-open' : 'panel-left-close'} strokeWidth="1.75" width="16" height="16" aria-hidden="true" />
              </button>
            </div>
            <label className="set-nav__search set-nav__hide">
              <__Icon name="search" strokeWidth="1.75" width="16" height="16" aria-hidden="true" />
              <input type="search" value={v.q} onChange={v.setQ} placeholder="Search settings" aria-label="Search settings sections" />
            </label>
            <span className="set-nav__hide" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Type a section name, like “Payment”, “Storage” or “SEO”.</span>
          </div>
          <div ref={v.scroller} id="set-nav-list" className="set-nav__list set-nav__hide">
            {__list(v.groups).map((g) => (
              <div key={g.label} className="set-nav__group">
                <button type="button" className="set-nav__grouphead" aria-expanded={g.open} onClick={v.toggleGroup(g.label)}><__Icon name="chevron-down" strokeWidth="1.75" width="13" height="13" aria-hidden="true" />{g.label}<span style={{ marginLeft: "auto", letterSpacing: ".02em" }}>{g.count}</span></button>
                {g.open ? __list(g.items).map((it) => (it.href
                  ? <__Link key={it.id} className="set-nav__item" href={it.href} aria-current={it.active ? 'page' : undefined}>{inner(it)}</__Link>
                  : <button key={it.id} type="button" className="set-nav__item" aria-current={it.active ? 'page' : undefined} onClick={v.soon(it.name)}>{inner(it)}</button>
                )) : null}
              </div>
            ))}
            {v.groups.length ? null : (
              <span className="set-nav__empty">No section matches “{v.q}”. <button type="button" onClick={v.clearQ} style={{ border: "0", background: "none", padding: "0", font: "inherit", color: "#003087", textDecoration: "underline", cursor: "pointer" }}>Clear search</button></span>
            )}
          </div>
          <div className="set-nav__legend set-nav__hide" aria-hidden="true">
            <span><span className="set-nav__dot set-nav__dot--ok" />Configured</span>
            <span><span className="set-nav__dot set-nav__dot--warn" />Needs setup</span>
            <span><span className="set-nav__dot set-nav__dot--off" />Turned off</span>
          </div>
        </nav>
      </div>
    );
    return this.props.embedded ? screen : <__SetFragment name="Settings section menu">{screen}</__SetFragment>;
  }
}
