/* <gc-sidebar> — framework-free twin of the design system's Sidebar component.
   Same markup, same gc-* classes, same behaviour (grouped links, collapsible group headers,
   count chips, drill-in sub-nav, collapse to a 76px rail). Used by every template so a
   template renders its nav without waiting on React or the compiled bundle.
   Renders into a shadow root so React templates never try to reconcile its children.
   Keep in step with components/navigation/Sidebar.jsx — that file is the source of truth. */
import { NAV } from './navigation';
import { routeOf, assetUrl, navigate } from '../runtime/routes';
import { getLocale, readFlag, writeFlag } from '../runtime/ui';
import { t } from './i18n';

export function defineGcSidebar() {
  if (typeof window === 'undefined' || customElements.get('gc-sidebar')) return;
  // Mirror of the .gc-sidebar / .gc-navitem rules in css/surfaces.css. Inlined rather than
  // <link>ed so the panel is styled on first paint; tokens inherit from the document :root.
  const CSS = `*,*::before,*::after{box-sizing:border-box}
:host{display:contents}
.gc-sidebar{width:var(--sidebar-panel-width,280px);flex:none;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-subtle,#e2e8f0);border-radius:var(--radius-2xl,16px);background:var(--surface-card,#fff);font-family:var(--font-sans,Poppins,ui-sans-serif,system-ui,sans-serif);transition:width .3s cubic-bezier(.4,0,.2,1)}
.gc-sidebar--collapsed{width:var(--main-sidebar-width,76px)}
.gc-sidebar--fill{height:100%}
.gc-sidebar--sticky{position:sticky;top:var(--shell-inset,12px);align-self:flex-start;height:calc(100vh - var(--shell-inset,12px)*2)}
.gc-sidebar__head{display:flex;height:var(--header-height,72px);flex:none;align-items:center;justify-content:space-between;gap:8px;padding:0 var(--nav-pad-x,12px) 0 20px}
.gc-sidebar--collapsed .gc-sidebar__head{justify-content:center;padding:0}
.gc-sidebar__body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding:8px 8px 24px 12px}
.gc-sidebar__body::-webkit-scrollbar{width:6px}
.gc-sidebar__body::-webkit-scrollbar-track{background:transparent}
.gc-sidebar__body::-webkit-scrollbar-thumb{border-radius:var(--radius-full);background:var(--slate-300,#cbd5e1)}
.gc-sidebar__group+.gc-sidebar__group{margin-top:var(--nav-group-gap,28px)}
.gc-sidebar__grouphead{display:flex;width:100%;height:32px;align-items:center;justify-content:space-between;border:none;background:none;padding:0 10px;color:var(--text-muted,#94a3b8);font-family:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;cursor:pointer;transition:color .2s cubic-bezier(0,0,.2,1)}
.gc-sidebar__grouphead:hover{color:var(--text-body,#475569)}
.gc-sidebar__items{display:flex;flex-direction:column;gap:var(--nav-row-gap,2px);margin-top:4px}
.gc-sidebar__eyebrow{margin:0;padding:16px 10px 4px;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted,#94a3b8)}
.gc-sidebar__back{display:inline-flex;height:36px;align-items:center;gap:6px;border:none;border-radius:var(--radius-lg);background:none;padding:0 12px 0 6px;color:var(--text-body,#475569);font-family:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:background .2s cubic-bezier(0,0,.2,1),color .2s}
.gc-sidebar__back:hover{background:var(--surface-subtle,#f1f5f9);color:var(--text-heading,#1e293b)}
.gc-sidebar__rule{margin:16px 10px;height:1px;background:var(--border-subtle,#e2e8f0);border:none}
.gc-navitem{display:flex;width:100%;height:var(--nav-row-height,40px);align-items:center;gap:12px;border:none;border-radius:var(--radius-xl,12px);background:none;padding:0 10px;color:var(--text-body,#475569);font-family:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-align:left;text-decoration:none;cursor:pointer;transition:background-color .2s cubic-bezier(0,0,.2,1),color .2s cubic-bezier(0,0,.2,1)}
.gc-navitem:hover{background:var(--surface-subtle,#f1f5f9);color:var(--text-heading,#1e293b)}
.gc-navitem--active,.gc-navitem--active:hover{background:var(--fill-primary-soft,rgba(0,48,135,.1));color:var(--primary,#003087)}
.gc-navitem__icon{flex:none;display:grid;place-items:center;color:currentColor}
.gc-navitem__label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gc-navitem__chev{flex:none;display:grid;place-items:center;color:var(--text-muted,#94a3b8);transition:transform .2s cubic-bezier(0,0,.2,1)}
.gc-navitem--active .gc-navitem__chev{color:currentColor}
.gc-navitem__count{flex:none;display:inline-flex;min-width:24px;height:24px;align-items:center;justify-content:center;border-radius:var(--radius-full);background:var(--surface-subtle,#f1f5f9);padding:0 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted,#94a3b8);font-variant-numeric:tabular-nums}
.gc-navitem--active .gc-navitem__count{background:rgba(255,255,255,.65);color:var(--primary,#003087)}
.gc-sidebar--collapsed .gc-sidebar__body{padding-left:8px;padding-right:8px;scrollbar-width:none}
.gc-sidebar--collapsed .gc-sidebar__body::-webkit-scrollbar{display:none}
.gc-sidebar--collapsed .gc-navitem{justify-content:center;gap:0;padding:0}
.gc-sidebar--collapsed .gc-navitem__label,.gc-sidebar--collapsed .gc-navitem__chev,.gc-sidebar--collapsed .gc-navitem__count{display:none}
:host([theme="dark"]) .gc-sidebar{background:#222e45;border-color:#384766}
:host([theme="dark"]) .gc-navitem{color:#cbd5e1}
:host([theme="dark"]) .gc-navitem:hover{background:#313e59;color:#f1f5f9}
:host([theme="dark"]) .gc-navitem--active,:host([theme="dark"]) .gc-navitem--active:hover{background:#313e59;color:#7cd4fd}
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
.gc-sub__in{min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:var(--nav-row-gap,2px);padding-top:2px}
.gc-sub--opening{animation:gc-sub-open .24s cubic-bezier(.2,0,0,1) both}
.gc-sub--closing{animation:gc-sub-close .2s cubic-bezier(.4,0,1,1) both}
@keyframes gc-sub-open{from{grid-template-rows:0fr;opacity:0}to{grid-template-rows:1fr;opacity:1}}
@keyframes gc-sub-close{from{grid-template-rows:1fr;opacity:1}to{grid-template-rows:0fr;opacity:0}}
.gc-sub .gc-navitem{height:34px;padding-left:40px;border-radius:var(--radius-lg,8px);font-weight:var(--weight-regular);color:var(--text-body,#475569)}
.gc-sub .gc-navitem--active,.gc-sub .gc-navitem--active:hover{font-weight:var(--weight-medium)}
.gc-navitem--open{color:var(--text-heading,#1e293b)}
.gc-navitem--open .gc-navitem__chev{transform:rotate(90deg)}
:host([theme="dark"]) .gc-navitem--open{color:#f1f5f9}
:host([theme="dark"]) .gc-sub .gc-navitem{color:#cbd5e1}
button,a{font:inherit}
button:focus-visible,a:focus-visible{outline:3px solid var(--focus-ring,rgba(0,48,135,.5));outline-offset:-2px}
nav{display:block}
.gc-sidebar__toggle{display:grid;place-items:center;width:36px;height:36px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:none;color:var(--text-muted);cursor:pointer}
.gc-sidebar__toggle:hover{color:var(--text-heading);border-color:var(--border-strong)}
.gc-tip{position:fixed;z-index:300;padding:4px 8px;border-radius:var(--radius-md);background:#0f172a;color:#fff;font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;pointer-events:none;transform:translateY(-50%)}
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
      window.removeEventListener('popstate', this._route);
      document.removeEventListener('keydown', this._key);
    }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    get mode() { return this.mqDrawer && this.mqDrawer.matches ? 'drawer' : this.mqRail && this.mqRail.matches ? 'rail' : 'full'; }
    /** Screens that pass `collapsed` (the POS) start on the icon rail and expand by hand. */
    get railFirst() { return this.mode === 'rail' || (this.mode === 'full' && this.hasAttribute('collapsed')); }
    get isCollapsed() { return this.railFirst ? !this.railOpen : this.mode === 'full' ? this.userCollapsed : false; }

    /** The menu item for this page: taken from the URL (path + query), then the screen's hint. */
    activeId() {
      const hint = this.getAttribute('active') || '';
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
      const drill = hit('[data-drill]'), back = hit('[data-back]'), group = hit('[data-group]'), toggle = hit('[data-toggle]'), shade = hit('.gc-backdrop');
      const link = !drill && !back && !group && !toggle ? hit('a[href^="/"]') : null;
      if (shade) { this.open = false; this.render(); return; }
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

    row(it, active, collapsed, L) {
      const cls = 'gc-navitem' + (active ? ' gc-navitem--active' : '');
      const label = L(it.label) + (it.suffix ? ' ' + L(it.suffix) : '');
      const inner = `<span class="gc-navitem__icon" aria-hidden="true">${glyph(it.icon, collapsed ? 20 : 18)}</span>`
        + (collapsed ? '' : `<span class="gc-navitem__label">${esc(label)}</span>`)
        + (!collapsed && it.count != null ? `<span class="gc-navitem__count">${it.count}</span>` : '')
        + (!collapsed && it.children ? `<span class="gc-navitem__chev" aria-hidden="true">${glyph('chevron-right', 16)}</span>` : '');
      const name = collapsed ? ` aria-label="${esc(label)}"` : '';
      if (it.children) return `<button type="button" class="${cls}${!collapsed && this.drill === it.id ? ' gc-navitem--open' : ''}"${name} data-drill="${it.id}" aria-expanded="${this.drill === it.id}">${inner}</button>`;
      return `<a class="${cls}"${name} href="${hrefOf(it)}"${active ? ' aria-current="page"' : ''}>${inner}</a>`;
    }

    /** The sub-menu of a parent: rendered only while open, or while it folds shut. */
    sub(p, active, L) {
      if (!p.children) return '';
      const anim = this.subAnim(p.id);
      if (this.drill !== p.id && !anim.includes('closing')) return '';
      const item = (x) => {
        const on = x.id === active;
        return `<a class="gc-navitem${on ? ' gc-navitem--active' : ''}" href="${hrefOf(x)}"${on ? ' aria-current="page"' : ''}><span class="gc-navitem__label">${esc(L(x.label))}</span>${x.count != null ? `<span class="gc-navitem__count">${x.count}</span>` : ''}</a>`;
      };
      return `<div class="gc-sub${anim}"><div class="gc-sub__in">${p.children.map(item).join('')}</div></div>`;
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
      let body;
      if (c) {
        body = '<div class="gc-sidebar__items">'
          + `<button type="button" class="gc-navitem" data-toggle aria-label="${esc(L('Expand sidebar'))}"><span class="gc-navitem__icon" aria-hidden="true">${glyph('panel-left-open', 20)}</span></button>`
          + NAV.map((g, i) => (i ? '<hr class="gc-sidebar__rule">' : '') + g.items.map((it) => this.row(it, isOn(it), true, L)).join('')).join('')
          + '</div>';
      } else {
        body = NAV.map((g) => {
          const shut = !!this.closed[g.label];
          return `<div class="gc-sidebar__group"><button type="button" class="gc-sidebar__grouphead" data-group="${esc(g.label)}" aria-expanded="${!shut}"><span>${esc(L(g.label))}</span><span class="gc-navitem__chev" aria-hidden="true" style="transform:${shut ? 'rotate(-90deg)' : 'none'}">${glyph('chevron-down', 16)}</span></button>`
            + (shut ? '' : `<div class="gc-sidebar__items">${g.items.map((it) => this.row(it, it.children ? it.id === active : isOn(it), false, L) + this.sub(it, active, L)).join('')}</div>`)
            + '</div>';
        }).join('');
      }
      const logoHref = routeOf('merchant-overview/MerchantOverview.dc.html');
      const dark = this.getAttribute('theme') === 'dark';
      const classes = 'gc-sidebar' + (c ? ' gc-sidebar--collapsed' : '')
        + (mode === 'drawer' ? ' gc-sidebar--drawer' + (this.open ? ' is-open' : '') : '')
        + (mode !== 'drawer' && this.hasAttribute('sticky') ? ' gc-sidebar--sticky' : '')
        + (this.hasAttribute('fill') ? ' gc-sidebar--fill' : '');
      const toggleLabel = mode === 'drawer' ? L('Close menu') : L('Collapse sidebar');
      this.shadowRoot.innerHTML = `<style>${CSS}</style>
${mode === 'drawer' && this.open ? `<button type="button" class="gc-backdrop" aria-label="${esc(L('Close menu'))}"></button>` : ''}
<aside class="${classes}" id="gc-nav">
<div class="gc-sidebar__head"><a href="${logoHref}" aria-label="GridCommerce" style="display:flex;align-items:center;text-decoration:none">${c
        ? `<img src="${assetUrl('8c3babaf605936b39809e7960e7c846f')}" alt="" style="width:36px;height:36px;flex:none;object-fit:contain">`
        : `<img src="${dark ? assetUrl('820d4a69b45ed8fa40c9bc6015985c0e') : assetUrl('ff462bc6abaa5d30500a126b259de9d6')}" alt="" style="height:30px;width:auto;display:block">`}</a>${c ? '' : `<button type="button" class="gc-sidebar__toggle" data-toggle aria-label="${esc(toggleLabel)}">${glyph(mode === 'drawer' ? 'x' : 'panel-left-close', 17)}</button>`}</div>
<nav class="gc-sidebar__body" aria-label="${esc(L('Main'))}">${body}</nav></aside>`;
    }
  }

  customElements.define('gc-sidebar', GcSidebar);
}
