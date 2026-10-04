/* <gc-sidebar> — framework-free twin of the design system's Sidebar component.
   Same markup, same gc-* classes, same behaviour (grouped links, collapsible group headers,
   count chips, collapse to a 76px rail). The rows are business areas (navigation.js); the open
   area lists its pages under it, as in Shopify's admin. The person's own shortcuts (lib/navProfile.js): up to 5
   pinned pages at the top (the pin on a page row), and an area opens the page last used in it. A module the plan
   lacks shows locked with "Upgrade" (lib/plans.js); an area not set up yet shows "Set up" (lib/navSetup.js).
   Used by every template so a
   template renders its nav without waiting on React or the compiled bundle.
   Renders into a shadow root so React templates never try to reconcile its children.
   Keep in step with components/navigation/Sidebar.jsx — that file is the source of truth. */
import { NAV, NAV_ALIAS } from './navigation';
import { routeOf, assetUrl, navigate } from '../runtime/routes';
import { getLocale, readFlag, writeFlag, toast } from '../runtime/ui';
import { t } from './i18n';
import { navFor, pinsFor, currentUser, roleOf, SESSION_EVENT } from '../lib/team';
import { currentEdition, EDITION_EVENT } from '../lib/edition';
import { PLAN_EVENT, upgradeHref } from '../lib/plans';
import { NAV_PROFILE_EVENT, MAX_PINS, isPinned, togglePin, lastTabOf, rememberTab } from '../lib/navProfile';
import { STOCK_SETUP_EVENT, rememberEdition } from '../lib/stockSetup';
import { PROPOSAL_EVENT } from '../lib/proposal';
import { liveCount, LIVE_EVENT } from '../lib/liveCounts';

/** A menu row's count: a live one (lib/liveCounts.js) when it names one, else the number written in the menu. 0 shows nothing. */
const countOf = (it) => { if (!it.live) return it.count != null ? it.count : null; const n = liveCount(it.live); return n ? n : null; };

export function defineGcSidebar() {
  if (typeof window === 'undefined' || customElements.get('gc-sidebar')) return;
  // Mirror of the .gc-sidebar / .gc-navitem rules in css/surfaces.css. Inlined rather than
  // <link>ed so the panel is styled on first paint; tokens inherit from the document :root.
  const CSS = `*,*::before,*::after{box-sizing:border-box}
:host{display:contents}
.gc-sidebar{width:var(--sidebar-panel-width,264px);flex:none;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-subtle,#e2e8f0);border-radius:var(--radius-2xl,16px);background:var(--surface-card,#fff);font-family:var(--font-sans,Poppins,ui-sans-serif,system-ui,sans-serif);transition:width .3s cubic-bezier(.4,0,.2,1)}
.gc-sidebar--collapsed{width:var(--main-sidebar-width,76px)}
.gc-sidebar--fill{height:100%}
.gc-sidebar--sticky{position:sticky;top:var(--shell-inset,12px);align-self:flex-start;height:calc(100vh - var(--shell-inset,12px)*2)}
.gc-sidebar__head{display:flex;height:56px;flex:none;align-items:center;justify-content:space-between;gap:8px;padding:4px 12px 0 20px}
.gc-sidebar--collapsed .gc-sidebar__head{justify-content:center;padding:0}
.gc-sidebar__ed{font-size:var(--text-xs,12px);font-weight:var(--weight-medium,500);letter-spacing:.02em;color:var(--text-muted,#64748b);white-space:nowrap;padding-left:2px}
.gc-sidebar__body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding:0 12px 12px}
.gc-sidebar__body::-webkit-scrollbar{width:6px}
.gc-sidebar__body::-webkit-scrollbar-track{background:transparent}
.gc-sidebar__body::-webkit-scrollbar-thumb{border-radius:var(--radius-full);background:var(--slate-300,#cbd5e1)}
.gc-sidebar__group+.gc-sidebar__group{margin-top:8px}
.gc-sidebar__grouphead{display:flex;width:100%;height:24px;align-items:center;justify-content:space-between;border:none;background:none;padding:0 10px;color:var(--text-muted,#94a3b8);font-family:inherit;font-size:var(--text-2xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;cursor:pointer;transition:color .2s cubic-bezier(0,0,.2,1)}
.gc-sidebar__grouphead:hover{color:var(--text-body,#475569)}
.gc-sidebar__items{display:flex;flex-direction:column;gap:1px;margin-top:2px}
.gc-sidebar__eyebrow{margin:0;padding:16px 10px 4px;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted,#94a3b8)}
.gc-sidebar__back{display:inline-flex;height:36px;align-items:center;gap:6px;border:none;border-radius:var(--radius-lg);background:none;padding:0 12px 0 6px;color:var(--text-body,#475569);font-family:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:background .2s cubic-bezier(0,0,.2,1),color .2s}
.gc-sidebar__back:hover{background:var(--surface-subtle,#f1f5f9);color:var(--text-heading,#1e293b)}
.gc-sidebar__rule{margin:16px 10px;height:1px;background:var(--border-subtle,#e2e8f0);border:none}
.gc-navitem{position:relative;display:flex;width:100%;min-height:36px;align-items:center;gap:10px;border:none;border-radius:var(--radius-xl,12px);background:none;padding:0 10px;color:var(--text-body,#475569);font-family:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-align:left;text-decoration:none;cursor:pointer;transition:background-color .2s cubic-bezier(0,0,.2,1),color .2s cubic-bezier(0,0,.2,1)}
.gc-navitem:hover{background:var(--surface-subtle,#f1f5f9);color:var(--text-heading,#1e293b)}
.gc-navitem--active,.gc-navitem--active:hover{background:var(--surface-page,#f4f7fb);color:var(--text-heading,#0f172a)}
.gc-navitem__icon{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-lg,8px);background:color-mix(in srgb,var(--primary-500,#2e559d) 9%,var(--surface-card,#fff));color:var(--primary-500,#2e559d);transition:background-color .15s ease,color .15s ease,box-shadow .15s ease}
.gc-navitem--open .gc-navitem__icon,.gc-navitem--active .gc-navitem__icon{background:linear-gradient(145deg,color-mix(in srgb,var(--primary-500,#2e559d) 55%,#1f6fe0) 0%,var(--primary,#003087) 100%);color:#fff;box-shadow:0 6px 14px -6px color-mix(in srgb,var(--primary,#003087) 60%,transparent)}
.gc-navitem--area.gc-navitem--active{background:none}
.gc-navitem--area.gc-navitem--active:hover{background:var(--surface-page,#f4f7fb)}
.gc-navitem--active,.gc-navitem--open{font-weight:var(--weight-medium)}
.gc-navitem__label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gc-navitem__chev{flex:none;display:grid;place-items:center;margin-left:auto;color:var(--text-muted,#94a3b8);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.gc-navitem--active .gc-navitem__chev{color:currentColor}
.gc-navitem__count{flex:none;display:inline-flex;min-width:20px;height:20px;align-items:center;justify-content:center;border-radius:var(--radius-full);background:var(--surface-subtle,#f1f5f9);padding:0 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted,#94a3b8);font-variant-numeric:tabular-nums}
.gc-navitem__count--live{background:var(--fill-warning-soft,#fff1d6);color:var(--text-warning,#9a4a00)}
.gc-sub .gc-navitem--active .gc-navitem__count{background:var(--surface-card,#fff);color:var(--primary,#003087)}
.gc-sidebar--collapsed .gc-sidebar__body{padding-left:8px;padding-right:8px;scrollbar-width:none}
.gc-sidebar--collapsed .gc-sidebar__body::-webkit-scrollbar{display:none}
.gc-sidebar--collapsed .gc-navitem{justify-content:center;gap:0;padding:0;min-height:40px}
.gc-sidebar--collapsed .gc-navitem--active{background:none}
.gc-sidebar--collapsed .gc-navitem__label,.gc-sidebar--collapsed .gc-navitem__chev,.gc-sidebar--collapsed .gc-navitem__count{display:none}
:host([theme="dark"]) .gc-sidebar{background:#222e45;border-color:#384766}
:host([theme="dark"]) .gc-navitem{color:#cbd5e1}
:host([theme="dark"]) .gc-navitem:hover{background:#313e59;color:#f1f5f9}
:host([theme="dark"]) .gc-navitem--active,:host([theme="dark"]) .gc-navitem--active:hover{background:#313e59;color:#f1f5f9}
:host([theme="dark"]) .gc-navitem__icon{background:rgba(255,255,255,.06);color:#9fb3d6}
:host([theme="dark"]) .gc-navitem--open .gc-navitem__icon,:host([theme="dark"]) .gc-navitem--active .gc-navitem__icon{background:linear-gradient(145deg,#2eaee4 0%,#0070a0 100%);color:#fff}
:host([theme="dark"]) .gc-sub .gc-navitem--active{background:rgba(0,156,222,.16);color:#7fd4f5}
:host([theme="dark"]) .gc-sub .gc-navitem--active::before{background:#2eaee4}
:host([theme="dark"]) .gc-sub__in::before{background:#24324f}
:host([theme="dark"]) .gc-sidebar__me{border-color:#384766;color:#f1f5f9}
:host([theme="dark"]) .gc-navitem__count{background:#26334d;color:var(--text-muted)}
:host([theme="dark"]) .gc-navitem--active .gc-navitem__count{background:#222e45;color:#7cd4fd}
:host([theme="dark"]) .gc-sidebar__grouphead{color:#7f8fb0}
:host([theme="dark"]) .gc-sidebar__grouphead:hover{color:#cbd5e1}
:host([theme="dark"]) .gc-sidebar__eyebrow{color:#7f8fb0}
:host([theme="dark"]) .gc-sidebar__rule{background:#384766}
:host([theme="dark"]) .gc-sidebar__back{color:#cbd5e1}
:host([theme="dark"]) .gc-sidebar__back:hover{background:#313e59;color:#f1f5f9}
/* sub-menu: opens under its parent, in place, with a short expand animation */
.gc-sub{display:grid;grid-template-rows:1fr}
.gc-sub__in{position:relative;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:1px;margin:1px 0 4px;padding-left:40px}
.gc-sub__in::before{content:"";position:absolute;left:23px;top:3px;bottom:3px;width:1.5px;border-radius:2px;background:var(--border-subtle,#e2e8f0)}
.gc-sub--opening{animation:gc-sub-open .24s cubic-bezier(.2,0,0,1) both}
.gc-sub--closing{animation:gc-sub-close .2s cubic-bezier(.4,0,1,1) both}
@keyframes gc-sub-open{from{grid-template-rows:0fr;opacity:0}to{grid-template-rows:1fr;opacity:1}}
@keyframes gc-sub-close{from{grid-template-rows:1fr;opacity:1}to{grid-template-rows:0fr;opacity:0}}
.gc-sub .gc-pinrow{overflow:visible}
.gc-sub .gc-navitem{min-height:30px;padding:0 10px;border-radius:var(--radius-lg,8px);font-weight:var(--weight-regular);color:var(--text-body,#475569)}
.gc-sub .gc-navitem--active,.gc-sub .gc-navitem--active:hover{background:color-mix(in srgb,var(--primary-500,#2e559d) 11%,var(--surface-card,#fff));color:var(--primary,#003087)}
.gc-sub .gc-navitem--active::before{content:"";position:absolute;left:-20px;top:7px;bottom:7px;width:3px;border-radius:3px;background:var(--primary,#003087)}
.gc-sub .gc-navitem--active,.gc-sub .gc-navitem--active:hover{font-weight:var(--weight-medium)}
.gc-navitem--open,.gc-navitem--open:hover{color:var(--text-heading,#1e293b)}
/* a fold-out group inside an area's pages (navigation.js › subs, e.g. "More stock tools") */
.gc-sub__in--grp{margin:1px 0 3px;padding-left:14px}
.gc-sub__in--grp::before{left:3px}
.gc-sub__in--grp .gc-navitem--active::before{left:-11px}
.gc-navitem--open .gc-navitem__chev{transform:rotate(90deg)}
:host([theme="dark"]) .gc-navitem--open{color:#f1f5f9}
:host([theme="dark"]) .gc-sub .gc-navitem{color:#cbd5e1}
button,a{font:inherit}
button:focus-visible,a:focus-visible{outline:3px solid var(--focus-ring,rgba(0,48,135,.5));outline-offset:-2px}
nav{display:block}
.gc-sidebar__toggle{display:grid;place-items:center;width:36px;height:36px;flex:none;border:0;border-radius:var(--radius-lg);background:none;color:var(--text-muted);cursor:pointer}
.gc-sidebar__toggle:hover{background:var(--surface-subtle)}
.gc-sidebar__meta{display:flex;align-items:center;gap:8px;min-width:0;padding:2px 20px 8px}
.gc-sidebar__chip{flex:none;padding:3px 9px;border-radius:var(--radius-md,6px);background:color-mix(in srgb,var(--primary-500,#2e559d) 10%,var(--surface-card,#fff));color:var(--primary,#003087);font-size:var(--text-2xs);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;white-space:nowrap}
.gc-sidebar__metatxt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.gc-sidebar__me{display:flex;align-items:center;gap:10px;flex:none;margin:0 12px 10px;padding:6px 8px;border:1px solid var(--border-subtle,#e2e8f0);border-radius:var(--radius-xl,12px);color:var(--text-heading);text-decoration:none;transition:background-color .15s ease}
.gc-sidebar__me:hover{background:var(--surface-page,#f4f7fb)}
.gc-sidebar__av{position:relative;flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:linear-gradient(145deg,var(--primary-500,#2e559d),var(--primary,#003087));color:#fff;font-size:var(--text-2xs);font-weight:var(--weight-semibold)}
.gc-sidebar__av i{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:var(--radius-full);background:var(--success,#16a34a);border:2px solid var(--surface-card,#fff)}
.gc-sidebar__metxt{flex:1;min-width:0;display:flex;flex-direction:column}
.gc-sidebar__metxt b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium)}
.gc-sidebar__metxt small{font-size:var(--text-xs);color:var(--text-muted)}
.gc-sidebar--collapsed .gc-sidebar__me{justify-content:center;margin:0 12px 12px;padding:8px 0}
.gc-navitem__dot--live{background:var(--error,#dc2626)}
.gc-sidebar__toggle:hover{color:var(--text-heading);border-color:var(--border-strong)}
.gc-tip{position:fixed;z-index:300;padding:4px 8px;border-radius:var(--radius-md);background:#0f172a;color:#fff;font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;pointer-events:none;transform:translateY(-50%)}
/* pins: a pin button on a page row (on hover, and always on the current page); the Pinned list at the top */
.gc-pinrow{position:relative}
.gc-pin{position:absolute;top:50%;right:4px;transform:translateY(-50%);display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted,#64748b);cursor:pointer;opacity:0;transition:opacity .15s,background-color .15s,color .15s}
.gc-pinrow:hover .gc-pin,.gc-pinrow:focus-within .gc-pin{opacity:1}
.gc-pinrow.is-here .gc-pin{opacity:.6}
.gc-pinrow.is-here .gc-navitem__count{margin-right:22px}
.gc-pin:hover{opacity:1;background:var(--surface-card,#fff);color:var(--text-heading,#1e293b)}
.gc-pinrow:hover .gc-navitem__count,.gc-pinrow:focus-within .gc-navitem__count,.gc-pinrow:hover .gc-navitem__lock{visibility:hidden}
.gc-sidebar--drawer .gc-pin{opacity:.6;width:32px;height:32px;right:0}
/* "Set up" and locked ("Upgrade") states */
.gc-navitem__setup,.gc-navitem__up{flex:none;display:inline-flex;height:20px;align-items:center;border-radius:var(--radius-full);padding:0 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.gc-navitem__setup{background:var(--fill-warning-soft,#fef3c7);color:var(--text-warning,#a14f06)}
.gc-navitem__up{background:var(--fill-primary-soft,rgba(0,48,135,.1));color:var(--primary,#003087)}
.gc-navitem__lock{flex:none;display:grid;place-items:center;color:var(--text-muted,#64748b)}
.gc-navitem--locked{color:var(--text-muted,#64748b)}
.gc-navitem__dot{position:absolute;top:6px;right:14px;width:8px;height:8px;border-radius:var(--radius-full);background:var(--warning,#f59e0b);border:2px solid var(--surface-card,#fff)}
.gc-sidebar--collapsed .gc-navitem{position:relative}
.gc-sidebar--collapsed .gc-navitem__setup,.gc-sidebar--collapsed .gc-navitem__up,.gc-sidebar--collapsed .gc-navitem__lock{display:none}
:host([theme="dark"]) .gc-navitem__dot{border-color:#222e45}
/* below 1024px the panel is an off-canvas drawer opened from the top bar */
.gc-sidebar--drawer{display:none}
.gc-sidebar--drawer.is-open{display:flex;position:fixed;left:0;top:0;bottom:0;z-index:160;width:min(300px,86vw);height:100dvh;border-radius:0 var(--radius-2xl,16px) var(--radius-2xl,16px) 0;box-shadow:0 24px 60px -12px rgba(15,23,42,.45);animation:gc-drawer .2s cubic-bezier(0,0,.2,1)}
.gc-backdrop{position:fixed;inset:0;z-index:155;border:0;background:rgba(15,23,42,.5)}
@keyframes gc-drawer{from{transform:translateX(-16px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.gc-sidebar--drawer.is-open,.gc-sub--opening,.gc-sub--closing{animation:none}.gc-sub--closing{display:none}.gc-sidebar{transition:none}}`;


  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pascal = (n) => n.replace(/(^|-)([a-z0-9])/g, (m, a, b) => b.toUpperCase());

  // Build a Lucide glyph as inline SVG (createIcons() cannot reach into a shadow root).
  const glyph = (name, size) => {
    const lib = window.lucide && window.lucide.icons ? window.lucide.icons[pascal(name)] : null;
    let kids = [];
    if (lib) kids = Array.isArray(lib[0]) ? lib : (lib[2] || []);
    const body = kids.map(([tag, at]) => '<' + tag + ' ' + Object.keys(at || {}).map((k) => `${k}="${esc(at[k])}"`).join(' ') + '></' + tag + '>').join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="flex:none;display:block">${body}</svg>`;
  };

  const COLLAPSE_KEY = 'gc.sidebar.collapsed';
  const hrefOf = (it) => (it.to ? routeOf(it.to) + (it.q ? '?' + it.q : '') : '#');
  const ALL = NAV.flatMap((g) => g.items.flatMap((it) => [it, ...(it.children || [])]));
  // Every page draws its own menu, so where the menu was scrolled to and which groups were folded are
  // kept for the whole visit (this tab): moving to another page leaves the menu where it was.
  const SCROLL_KEY = 'gc.sidebar.scroll';
  const GRP_KEY = 'gc.sidebar.grp';   // the fold-out group opened by hand: { id, at: the page it was opened on }
  const CLOSED_KEY = 'gc.sidebar.closed';
  const session = {
    get(k, fb) { try { const v = JSON.parse(window.sessionStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } },
    set(k, v) { try { window.sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  class GcSidebar extends HTMLElement {
    static get observedAttributes() { return ['active', 'base', 'sticky', 'theme', 'collapsed']; }
    connectedCallback() {
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this.onClick(e));
        this.shadowRoot.addEventListener('mouseover', (e) => this.tip(e, true));
        this.shadowRoot.addEventListener('focusin', (e) => this.tip(e, true));
        this.shadowRoot.addEventListener('mouseout', (e) => this.tip(e, false));
        this.shadowRoot.addEventListener('focusout', (e) => this.tip(e, false));
      }
      this.closed = session.get(CLOSED_KEY, {});
      this.firstPaint = true;   // bring the current page's item into view once, if it is off screen
      this.open = false;       // drawer
      this.railOpen = false;   // rail widths: expanded by hand for this page
      this.userCollapsed = readFlag(COLLAPSE_KEY);
      this.mqDrawer = window.matchMedia('(max-width: 1023px)');
      this.mqRail = window.matchMedia('(max-width: 1279px)');
      this._mq = () => { this.open = false; this.render(); };
      this._route = () => { const want = this.drillFor(this.activeId()); if (want !== this.drill) { this.expand(want); setTimeout(() => this.render(), 250); } this.render(); };
      this._toggle = () => { this.open = !this.open; this.render(); if (this.open) this.focusFirst(); };
      this._key = (e) => { if (e.key === 'Escape' && this.open) { this.open = false; this.render(); } };
      this.mqDrawer.addEventListener('change', this._mq);
      this.mqRail.addEventListener('change', this._mq);
      window.addEventListener('gc:nav-toggle', this._toggle);
      window.addEventListener('gc:locale', this._route);
      window.addEventListener('gc:route', this._route);
      // live counts (Inbox: unread chats, open comments, new mentions) follow the inbox data
      this._live = () => { window.clearTimeout(this._liveT); this._liveT = window.setTimeout(() => this.render(), 120); };
      window.addEventListener(LIVE_EVENT, this._live);
      window.addEventListener(SESSION_EVENT, this._route);
      window.addEventListener(EDITION_EVENT, this._route);
      window.addEventListener(STOCK_SETUP_EVENT, this._route);
      window.addEventListener(PROPOSAL_EVENT, this._route);
      window.addEventListener(PLAN_EVENT, this._route);
      window.addEventListener(NAV_PROFILE_EVENT, this._route);
      // "Set up" states read the libs that own them (couriers, gateways, counters): loaded after the first paint
      this._setup = () => this.loadSetup();
      ['gc:connections', 'gc:ledger', 'gc:pos', 'storage', 'focus'].forEach((ev) => window.addEventListener(ev, this._setup));
      this.loadSetup();
      rememberEdition();   // the first time the shop is opened, note its edition (Stock setup notices a later change)
      window.addEventListener('popstate', this._route);
      document.addEventListener('keydown', this._key);
      this.drill = this.drillFor(this.activeId());
      this.render();
      if (!window.lucide) this.waitForGlyphs();
    }
    disconnectedCallback() {
      if (!this._mq) return;
      this.mqDrawer.removeEventListener('change', this._mq);
      this.mqRail.removeEventListener('change', this._mq);
      window.removeEventListener('gc:nav-toggle', this._toggle);
      window.removeEventListener('gc:locale', this._route);
      window.removeEventListener('gc:route', this._route);
      window.removeEventListener(LIVE_EVENT, this._live);
      window.removeEventListener(SESSION_EVENT, this._route);
      window.removeEventListener(EDITION_EVENT, this._route);
      window.removeEventListener(STOCK_SETUP_EVENT, this._route);
      window.removeEventListener(PROPOSAL_EVENT, this._route);
      window.removeEventListener(PLAN_EVENT, this._route);
      window.removeEventListener(NAV_PROFILE_EVENT, this._route);
      ['gc:connections', 'gc:ledger', 'gc:pos', 'storage', 'focus'].forEach((ev) => window.removeEventListener(ev, this._setup));
      window.removeEventListener('popstate', this._route);
      document.removeEventListener('keydown', this._key);
    }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    /** Work out which chosen areas still need setting up (lib/navSetup.js), then redraw if that changed. */
    loadSetup() {
      import('../lib/navSetup').then(({ pendingSetup }) => {
        const next = pendingSetup();
        const key = next.map((x) => x.id).join(',');
        if (key === (this.setupKey || '')) return;
        this.setup = next; this.setupKey = key;
        if (this.shadowRoot) this.render();
      }).catch(() => {});
    }
    get mode() { return this.mqDrawer && this.mqDrawer.matches ? 'drawer' : this.mqRail && this.mqRail.matches ? 'rail' : 'full'; }
    /** Screens that pass `collapsed` (the POS) start on the icon rail and expand by hand. */
    get railFirst() { return this.mode === 'rail' || (this.mode === 'full' && this.hasAttribute('collapsed')); }
    get isCollapsed() { return this.railFirst ? !this.railOpen : this.mode === 'full' ? this.userCollapsed : false; }

    /** The menu item for this page: taken from the URL (path + query), then the screen's hint. */
    activeId() {
      const raw = this.getAttribute('active') || '';
      const hint = NAV_ALIAS[raw] || raw;
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      const query = new URLSearchParams(window.location.search);
      const here = ALL.filter((it) => it.to && routeOf(it.to) === path);
      // an item with a query (e.g. channel=pos) wins when the URL carries that query
      const hit = here.find((it) => it.q && [...new URLSearchParams(it.q)].every(([k, v]) => query.get(k) === v));
      if (hit) return hit.id;
      if (here.some((it) => it.id === hint && !it.q)) return hint;
      const plain = here.filter((it) => !it.q);
      const leaf = plain.find((it) => !it.children) || plain[0];
      return leaf ? leaf.id : hint;
    }
    drillFor(active) {
      for (const g of NAV) for (const it of g.items) if (it.children && it.children.some((c) => c.id === active)) return it.id;
      return null;
    }
    focusFirst() { const el = this.shadowRoot.querySelector('.gc-navitem--active, .gc-navitem'); if (el) el.focus(); }
    waitForGlyphs(n) {
      if (window.lucide) return this.render();
      if ((n || 0) > 50) return;
      setTimeout(() => this.waitForGlyphs((n || 0) + 1), 100);
    }
    tip(e, show) {
      const old = this.shadowRoot.querySelector('.gc-tip');
      if (old) old.remove();
      if (!show || !this.isCollapsed) return;
      const el = e.composedPath().find((n) => n.matches && n.matches('.gc-navitem'));
      if (!el) return;
      const r = el.getBoundingClientRect();
      const tip = document.createElement('div');
      tip.className = 'gc-tip';
      tip.setAttribute('role', 'tooltip');
      tip.textContent = el.getAttribute('aria-label') || '';
      tip.style.left = r.right + 10 + 'px';
      tip.style.top = r.top + r.height / 2 + 'px';
      this.shadowRoot.appendChild(tip);
    }
    onClick(e) {
      const path = e.composedPath();
      const hit = (sel) => path.find((el) => el.matches && el.matches(sel));
      const drill = hit('[data-drill]'), back = hit('[data-back]'), group = hit('[data-group]'), toggle = hit('[data-toggle]'), shade = hit('.gc-backdrop'), pin = hit('[data-pin]'), grp = hit('[data-grp]');
      const link = !drill && !back && !group && !toggle && !pin && !grp ? hit('a[href^="/"]') : null;
      if (shade) { this.open = false; this.render(); return; }
      if (grp) {
        e.preventDefault();
        const id = grp.dataset.grp;
        session.set(GRP_KEY, { id: this.openGrp === id ? '' : id, at: this.activeId() });
        this.render();
        return;
      }
      if (pin) {
        e.preventDefault();
        const res = togglePin(currentUser().id, pin.dataset.pin);   // redraws through NAV_PROFILE_EVENT
        if (res.full) toast(t('You can pin up to {n} pages. Unpin one first.').replace('{n}', MAX_PINS), { tone: 'info' });
        return;
      }
      if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); this.open = false; navigate(link.getAttribute('href')); return; }
      if (drill) {
        e.preventDefault();
        const parent = ALL.find((it) => it.id === drill.dataset.drill);
        if (this.isCollapsed) { if (this.railFirst) this.railOpen = true; else this.setCollapsed(false); }
        const here = parent.to && routeOf(parent.to) === window.location.pathname;
        // a second click on the open parent closes it; otherwise it opens (one at a time)
        this.expand(this.drill === parent.id && (here || !parent.to) ? null : parent.id);
        this.render();
        if (this.anim && this.anim.close) setTimeout(() => this.render(), 250);   // drop the closed list once it has folded
        // a parent is a page too: opening its menu also opens its landing page
        if (this.drill === parent.id && parent.to && !here) { this.open = false; navigate(hrefOf(parent)); }
      }
      else if (back) { e.preventDefault(); this.drill = null; this.render(); this.focusFirst(); }
      else if (group) { e.preventDefault(); this.closed[group.dataset.group] = !this.closed[group.dataset.group]; session.set(CLOSED_KEY, this.closed); this.render(); }
      else if (toggle) {
        e.preventDefault();
        if (this.mode === 'drawer') this.open = false;
        else if (this.railFirst) this.railOpen = !this.railOpen;
        else this.setCollapsed(!this.userCollapsed);
        this.render();
      }
    }
    /** Open one parent's sub-menu (and close the one that was open); null closes it. */
    expand(id) {
      if (id === this.drill) return;
      this.anim = { open: id, close: this.drill, at: Date.now() };
      this.drill = id;
    }
    /** The animation class for a sub-menu. A re-render mid-animation picks it up where it was. */
    subAnim(id) {
      const a = this.anim;
      if (!a) return '';
      const gone = Date.now() - a.at;
      if (gone > 240) return '';
      return a.open === id ? ` gc-sub--opening" style="animation-delay:-${gone}ms` : a.close === id ? ` gc-sub--closing" style="animation-delay:-${gone}ms` : '';
    }
    setCollapsed(on) { this.userCollapsed = on; writeFlag(COLLAPSE_KEY, on); }

    /** One menu row. An area (an item with pages) is a link to its first page the role can open; the open area
     *  lists its pages under it (sub). */
    row(it, active, collapsed, L) {
      // an area with one page (Home) is drawn as a plain row: no chevron, no page list
      const single = !!it.children && it.children.filter((c) => !c.hidden).length <= 1;
      const open = !!it.children && !single && this.drill === it.id && !collapsed;
      const cls = 'gc-navitem' + (active ? ' gc-navitem--active' : '') + (open ? ' gc-navitem--open' : '') + (it.children ? ' gc-navitem--area' : '') + (it.locked ? ' gc-navitem--locked' : '');
      const label = L(it.label) + (it.suffix ? ' ' + L(it.suffix) : '');
      const state = it.locked ? L('Upgrade') : it.setup ? L('Set up') : '';
      const inner = `<span class="gc-navitem__icon" aria-hidden="true">${glyph(it.icon, 17)}</span>`
        + (collapsed ? '' : `<span class="gc-navitem__label">${esc(label)}</span>`)
        + (it.locked ? `<span class="gc-navitem__up">${esc(state)}</span>` : it.setup ? `<span class="gc-navitem__setup">${esc(state)}</span>` : '')
        + (!collapsed && countOf(it) != null && !state ? `<span class="gc-navitem__count${it.live ? ' gc-navitem__count--live' : ''}">${countOf(it)}</span>` : '')
        + (!collapsed && it.children && !single && !state ? `<span class="gc-navitem__chev" aria-hidden="true">${glyph('chevron-right', 15)}</span>` : '')
        + (collapsed && it.setup ? '<span class="gc-navitem__dot" aria-hidden="true"></span>' : '')
        + (collapsed && !it.setup && it.live && countOf(it) ? '<span class="gc-navitem__dot gc-navitem__dot--live" aria-hidden="true"></span>' : '');
      const name = collapsed ? ` aria-label="${esc(label + (state ? ' · ' + state : ''))}"` : state ? ` aria-label="${esc(label + ', ' + state)}"` : '';
      // an area opens the page last used in it (lib/navProfile.js), else its first page; a locked area opens Upgrade
      const pagesOf = it.children ? it.children.filter((c) => !c.hidden && c.to && !c.locked) : [];
      const last = it.children ? lastTabOf(currentUser().id, it.id) : '';
      const to = it.children ? pagesOf.find((c) => c.id === last) || pagesOf[0] || it.children[0] : it;
      const href = it.locked ? upgradeHref(it.locked) : hrefOf(to);
      // the open area's page row carries aria-current; the area itself only on the icon rail (no page rows there)
      return `<a class="${cls}"${name} href="${esc(href)}"${active && (!it.children || single || collapsed) ? ' aria-current="page"' : ''}>${inner}</a>`;
    }

    /** A page row with its pin button (a sibling of the link, so it never opens the page). */
    pinRow(x, on, inner, L) {
      const pinned = isPinned(currentUser().id, x.id);
      const label = L(x.tab || x.label);
      const pinLabel = (pinned ? L('Unpin') : L('Pin to menu')) + ': ' + label;
      return `<div class="gc-pinrow${on ? ' is-here' : ''}"><a class="gc-navitem${on ? ' gc-navitem--active' : ''}" href="${hrefOf(x)}"${on ? ' aria-current="page"' : ''}>${inner}</a>`
        + `<button type="button" class="gc-pin" data-pin="${esc(x.id)}" aria-pressed="${pinned}" aria-label="${esc(pinLabel)}" title="${esc(pinLabel)}">${glyph(pinned ? 'pin-off' : 'pin', 14)}</button></div>`;
    }

    /** The person's pinned pages (lib/navProfile.js), at the top of the menu. */
    pinned(pins, active, collapsed, L) {
      if (!pins.length) return '';
      if (collapsed) return pins.map((p) => `<a class="gc-navitem${p.id === active ? ' gc-navitem--active' : ''}" aria-label="${esc(L(p.label))}" href="${hrefOf(p)}"${p.id === active ? ' aria-current="page"' : ''}><span class="gc-navitem__icon" aria-hidden="true">${glyph(p.icon, 17)}</span></a>`).join('') + '<hr class="gc-sidebar__rule">';
      const shut = !!this.closed.Pinned;
      return `<div class="gc-sidebar__group"><button type="button" class="gc-sidebar__grouphead" data-group="Pinned" aria-expanded="${!shut}"><span>${esc(L('Pinned'))}</span><span class="gc-navitem__chev" aria-hidden="true" style="transform:${shut ? 'rotate(-90deg)' : 'none'}">${glyph('chevron-down', 16)}</span></button>`
        + (shut ? '' : `<div class="gc-sidebar__items">${pins.map((p) => this.pinRow(p, p.id === active, `<span class="gc-navitem__icon" aria-hidden="true">${glyph(p.icon, 17)}</span><span class="gc-navitem__label">${esc(L(p.label))}</span>`, L)).join('')}</div>`)
        + '</div>';
    }

    /** The pages of the open area (the one this page belongs to). A `hidden` page (a create flow) is not listed: it
     *  lights up the page named in its `under`. */
    sub(p, active, L) {
      if (!p.children || p.children.filter((x) => !x.hidden).length <= 1) return '';
      const anim = this.subAnim(p.id);
      if (this.drill !== p.id && !anim.includes('closing')) return '';
      const here = p.children.find((x) => x.id === active);
      const lit = here && here.hidden ? here.under : active;
      const item = (x) => {
        const on = x.id === lit;
        const label = L(x.tab || x.label);
        // a page of a module the plan lacks: locked, opens Upgrade (never the page)
        if (x.locked) return `<a class="gc-navitem gc-navitem--locked" href="${esc(upgradeHref(x.locked))}" aria-label="${esc(label + ', ' + L('Upgrade'))}"><span class="gc-navitem__label">${esc(label)}</span><span class="gc-navitem__lock" aria-hidden="true">${glyph('lock', 14)}</span></a>`;
        return this.pinRow(x, on, `<span class="gc-navitem__label">${esc(label)}</span>${countOf(x) != null ? `<span class="gc-navitem__count${x.live ? ' gc-navitem__count--live' : ''}">${countOf(x)}</span>` : ''}`, L);
      };
      const list = p.children.filter((x) => !x.hidden);
      // pages that share a `sub` fold into one row (p.subs), one group open at a time: the one opened by hand on this
      // page, else the one holding this page
      const grpOf = (x) => (x.sub && p.subs && p.subs[x.sub] ? x.sub : null);
      const hand = session.get(GRP_KEY, null);
      const holder = (list.find((x) => x.id === lit && grpOf(x)) || {}).sub || '';
      const openId = hand && hand.at === active ? hand.id : holder;
      this.openGrp = openId;
      const done = new Set();
      const rows = list.map((x) => {
        const g = grpOf(x);
        if (!g) return item(x);
        if (done.has(g)) return '';
        done.add(g);
        const open = openId === g;
        const label = L(p.subs[g].label);
        return `<button type="button" class="gc-navitem${open ? ' gc-navitem--open' : ''}" data-grp="${esc(g)}" aria-expanded="${open}"><span class="gc-navitem__label">${esc(label)}</span><span class="gc-navitem__chev" aria-hidden="true">${glyph('chevron-right', 14)}</span></button>`
          + (open ? `<div class="gc-sub__in gc-sub__in--grp">${list.filter((y) => grpOf(y) === g).map(item).join('')}</div>` : '');
      }).join('');
      return `<div class="gc-sub${anim}"><div class="gc-sub__in">${rows}</div></div>`;
    }

    render() {
      // keep the menu's scroll position through the redraw (and from the page before)
      const was = this.shadowRoot.querySelector('.gc-sidebar__body');
      const top = was ? was.scrollTop : session.get(SCROLL_KEY, 0);
      this.paint();
      const nav = this.shadowRoot.querySelector('.gc-sidebar__body');
      if (!nav) return;
      nav.scrollTop = top;
      nav.addEventListener('scroll', () => session.set(SCROLL_KEY, nav.scrollTop), { passive: true });
      if (this.firstPaint) {
        this.firstPaint = false;
        const on = nav.querySelector('.gc-navitem--active');
        if (on) {
          const a = on.getBoundingClientRect(), b = nav.getBoundingClientRect();
          if (b.height && (a.top < b.top || a.bottom > b.bottom)) { on.scrollIntoView({ block: 'nearest' }); session.set(SCROLL_KEY, nav.scrollTop); }
        }
      }
    }

    paint() {
      const locale = getLocale();
      const L = (s) => t(s, locale);
      const active = this.activeId();
      const mode = this.mode;
      const c = this.isCollapsed;
      const isOn = (it) => it.id === active || (it.children || []).some((x) => x.id === active);
      const me = currentUser();
      const MENU = navFor(me, { setup: this.setup || [] });   // only what the signed-in person can open
      const pins = pinsFor(me, MENU);
      // remember the page used in its area, so tapping the area later opens it again (lib/navProfile.js)
      for (const g of MENU) for (const it of g.items) {
        const here = (it.children || []).find((x) => x.id === active && !x.locked);
        if (here) rememberTab(me.id, it.id, here.hidden ? here.under : here.id);
      }
      let body;
      if (c) {
        body = '<div class="gc-sidebar__items">'
          + `<button type="button" class="gc-navitem" data-toggle aria-label="${esc(L('Expand sidebar'))}"><span class="gc-navitem__icon" aria-hidden="true">${glyph('panel-left-open', 17)}</span></button>`
          + this.pinned(pins, active, true, L)
          + MENU.map((g, i) => (i ? '<hr class="gc-sidebar__rule">' : '') + g.items.map((it) => this.row(it, isOn(it), true, L)).join('')).join('')
          + '</div>';
      } else {
        body = this.pinned(pins, active, false, L) + MENU.map((g) => {
          const shut = !!this.closed[g.label];
          return `<div class="gc-sidebar__group"><button type="button" class="gc-sidebar__grouphead" data-group="${esc(g.label)}" aria-expanded="${!shut}"><span>${esc(L(g.label))}</span><span class="gc-navitem__chev" aria-hidden="true" style="transform:${shut ? 'rotate(-90deg)' : 'none'}">${glyph('chevron-down', 16)}</span></button>`
            + (shut ? '' : `<div class="gc-sidebar__items">${g.items.map((it) => this.row(it, isOn(it), false, L) + this.sub(it, active, L)).join('')}</div>`)
            + '</div>';
        }).join('');
      }
      const logoHref = routeOf('merchant-overview/MerchantOverview.dc.html');
      const ed = currentEdition();
      const dark = this.getAttribute('theme') === 'dark';
      const classes = 'gc-sidebar' + (c ? ' gc-sidebar--collapsed' : '')
        + (mode === 'drawer' ? ' gc-sidebar--drawer' + (this.open ? ' is-open' : '') : '')
        + (mode !== 'drawer' && this.hasAttribute('sticky') ? ' gc-sidebar--sticky' : '')
        + (this.hasAttribute('fill') ? ' gc-sidebar--fill' : '');
      const toggleLabel = mode === 'drawer' ? L('Close menu') : L('Collapse sidebar');
      this.shadowRoot.innerHTML = `<style>${CSS}</style>
${mode === 'drawer' && this.open ? `<button type="button" class="gc-backdrop" aria-label="${esc(L('Close menu'))}"></button>` : ''}
<aside class="${classes}" id="gc-nav">
<div class="gc-sidebar__head"><a href="${logoHref}" aria-label="${esc(ed.name)}" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-decoration:none">${c
        ? `<img src="${assetUrl('8c3babaf605936b39809e7960e7c846f')}" alt="" style="width:36px;height:36px;flex:none;object-fit:contain">`
        : `<img src="${dark ? assetUrl('820d4a69b45ed8fa40c9bc6015985c0e') : assetUrl('ff462bc6abaa5d30500a126b259de9d6')}" alt="" style="height:30px;width:auto;display:block">`}</a>${c ? '' : `<button type="button" class="gc-sidebar__toggle" data-toggle aria-label="${esc(toggleLabel)}">${glyph(mode === 'drawer' ? 'x' : 'panel-left-close', 17)}</button>`}</div>
${c ? '' : `<div class="gc-sidebar__meta"><span class="gc-sidebar__chip">${esc(L(ed.id !== 'full' ? ed.short : 'All modules'))}</span><span class="gc-sidebar__metatxt">${esc(L(roleOf(me).title))}</span></div>`}
<nav class="gc-sidebar__body" aria-label="${esc(L('Main'))}">${body}</nav>
<a class="gc-sidebar__me" href="/my-dashboard" aria-label="${esc(me.name + ' · ' + L('My dashboard'))}"><span class="gc-sidebar__av" aria-hidden="true">${esc(me.initials)}<i></i></span>${c ? '' : `<span class="gc-sidebar__metxt"><b>${esc(me.name)}</b><small>${esc(L('My dashboard'))}</small></span><span class="gc-navitem__chev" aria-hidden="true">${glyph('chevron-right', 15)}</span>`}</a></aside>`;
    }
  }

  customElements.define('gc-sidebar', GcSidebar);
}
