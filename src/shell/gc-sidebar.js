/* <gc-sidebar> — framework-free twin of the design system's Sidebar component.
   Same markup, same gc-* classes, same behaviour (grouped links, collapsible group headers,
   count chips, drill-in sub-nav, collapse to a 76px rail). Used by every template so a
   template renders its nav without waiting on React or the compiled bundle.
   Renders into a shadow root so React templates never try to reconcile its children.
   Keep in step with components/navigation/Sidebar.jsx — that file is the source of truth. */
import { NAV } from './navigation';
import { routeOf, assetUrl, navigate } from '../runtime/routes';

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
.gc-sidebar__body::-webkit-scrollbar-thumb{border-radius:9999px;background:var(--slate-300,#cbd5e1)}
.gc-sidebar__group+.gc-sidebar__group{margin-top:var(--nav-group-gap,28px)}
.gc-sidebar__grouphead{display:flex;width:100%;height:32px;align-items:center;justify-content:space-between;border:none;background:none;padding:0 10px;color:var(--text-muted,#94a3b8);font-family:inherit;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:color .2s cubic-bezier(0,0,.2,1)}
.gc-sidebar__grouphead:hover{color:var(--text-body,#475569)}
.gc-sidebar__items{display:flex;flex-direction:column;gap:var(--nav-row-gap,2px);margin-top:4px}
.gc-sidebar__eyebrow{margin:0;padding:16px 10px 4px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted,#94a3b8)}
.gc-sidebar__back{display:inline-flex;height:36px;align-items:center;gap:6px;border:none;border-radius:9999px;background:var(--primary,#003087);padding:0 16px 0 12px;color:#fff;font-family:inherit;font-size:13px;font-weight:500;letter-spacing:.025em;cursor:pointer;transition:background .2s cubic-bezier(0,0,.2,1)}
.gc-sidebar__back:hover{background:var(--primary-focus,#002a77)}
.gc-sidebar__rule{margin:16px 10px;height:1px;background:var(--border-subtle,#e2e8f0);border:none}
.gc-navitem{display:flex;width:100%;height:var(--nav-row-height,40px);align-items:center;gap:12px;border:none;border-radius:var(--radius-xl,12px);background:none;padding:0 10px;color:var(--text-body,#475569);font-family:inherit;font-size:13px;font-weight:500;letter-spacing:.025em;text-align:left;text-decoration:none;cursor:pointer;transition:background-color .2s cubic-bezier(0,0,.2,1),color .2s cubic-bezier(0,0,.2,1)}
.gc-navitem:hover{background:var(--surface-subtle,#f1f5f9);color:var(--text-heading,#1e293b)}
.gc-navitem--active,.gc-navitem--active:hover{background:var(--fill-primary-soft,rgba(0,48,135,.1));color:var(--primary,#003087)}
.gc-navitem__icon{flex:none;display:grid;place-items:center;color:currentColor}
.gc-navitem__label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gc-navitem__chev{flex:none;display:grid;place-items:center;color:var(--text-muted,#94a3b8);transition:transform .2s cubic-bezier(0,0,.2,1)}
.gc-navitem--active .gc-navitem__chev{color:currentColor}
.gc-navitem__count{flex:none;display:inline-flex;min-width:24px;height:24px;align-items:center;justify-content:center;border-radius:9999px;background:var(--surface-subtle,#f1f5f9);padding:0 8px;font-size:12px;font-weight:500;color:var(--text-muted,#94a3b8);font-variant-numeric:tabular-nums}
.gc-navitem--active .gc-navitem__count{background:rgba(255,255,255,.65);color:var(--primary,#003087)}
.gc-sidebar--collapsed .gc-sidebar__body{padding-left:8px;padding-right:8px;scrollbar-width:none}
.gc-sidebar--collapsed .gc-sidebar__body::-webkit-scrollbar{display:none}
.gc-sidebar--collapsed .gc-navitem{justify-content:center;gap:0;padding:0}
.gc-sidebar--collapsed .gc-navitem__label,.gc-sidebar--collapsed .gc-navitem__chev,.gc-sidebar--collapsed .gc-navitem__count{display:none}
:host([theme="dark"]) .gc-sidebar{background:#222e45;border-color:#384766}
:host([theme="dark"]) .gc-navitem{color:#cbd5e1}
:host([theme="dark"]) .gc-navitem:hover{background:#313e59;color:#f1f5f9}
:host([theme="dark"]) .gc-navitem--active,:host([theme="dark"]) .gc-navitem--active:hover{background:#313e59;color:#7cd4fd}
:host([theme="dark"]) .gc-navitem__count{background:#26334d;color:#94a3b8}
:host([theme="dark"]) .gc-navitem--active .gc-navitem__count{background:#222e45;color:#7cd4fd}
:host([theme="dark"]) .gc-sidebar__grouphead{color:#7f8fb0}
:host([theme="dark"]) .gc-sidebar__grouphead:hover{color:#cbd5e1}
:host([theme="dark"]) .gc-sidebar__eyebrow{color:#7f8fb0}
:host([theme="dark"]) .gc-sidebar__rule{background:#384766}
:host([theme="dark"]) .gc-sidebar__back{background:#009cde}
:host([theme="dark"]) .gc-sidebar__back:hover{background:#0089c3}`;


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

  class GcSidebar extends HTMLElement {
    static get observedAttributes() { return ['active', 'base', 'collapsed', 'sticky', 'theme']; }
    connectedCallback() {
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this.onClick(e));
      }
      this.drill = null;
      this.closed = {};
      const active = this.getAttribute('active') || '';
      for (const g of NAV) for (const it of g.items) {
        if (it.children && it.children.some((c) => c.id === active)) this.drill = it.id;
      }
      this.render();
      if (!window.lucide) this.waitForGlyphs();
    }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    get isCollapsed() { return this.hasAttribute('collapsed'); }
    waitForGlyphs(n) {
      if (window.lucide) return this.render();
      if ((n || 0) > 50) return;
      setTimeout(() => this.waitForGlyphs((n || 0) + 1), 100);
    }
    onClick(e) {
      const path = e.composedPath();
      const hit = (sel) => path.find((el) => el.matches && el.matches(sel));
      const drill = hit('[data-drill]'), back = hit('[data-back]'), group = hit('[data-group]'), toggle = hit('[data-toggle]');
      const link = !drill && !back && !group && !toggle ? hit('a[href^="/"]') : null;
      if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); navigate(link.getAttribute('href')); return; }
      if (drill) { e.preventDefault(); if (this.isCollapsed) this.removeAttribute('collapsed'); else { this.drill = drill.dataset.drill; this.render(); } }
      else if (back) { e.preventDefault(); this.drill = null; this.render(); }
      else if (group) { e.preventDefault(); this.closed[group.dataset.group] = !this.closed[group.dataset.group]; this.render(); }
      else if (toggle) { e.preventDefault(); this.toggleAttribute('collapsed'); }
    }

    row(it, active, collapsed) {
      const cls = 'gc-navitem' + (active ? ' gc-navitem--active' : '');
      const inner = `<span class="gc-navitem__icon">${glyph(it.icon, collapsed ? 20 : 18)}</span>`
        + (collapsed ? '' : `<span class="gc-navitem__label">${esc(it.label)}</span>`)
        + (!collapsed && it.count != null ? `<span class="gc-navitem__count">${it.count}</span>` : '')
        + (!collapsed && it.children ? `<span class="gc-navitem__chev">${glyph('chevron-right', 16)}</span>` : '');
      if (it.children) return `<button type="button" class="${cls}" title="${esc(it.label)}" data-drill="${it.id}">${inner}</button>`;
      return `<a class="${cls}" title="${esc(it.label)}" href="${it.to ? routeOf(it.to) : '#'}"${active ? ' aria-current="page"' : ''}>${inner}</a>`;
    }

    render() {
      const active = this.getAttribute('active') || '';
      const c = this.isCollapsed;
      const isOn = (it) => it.id === active || (it.children || []).some((x) => x.id === active);
      let body;
      if (c) {
        body = '<div class="gc-sidebar__items">'
          + `<button type="button" class="gc-navitem" data-toggle title="Expand sidebar"><span class="gc-navitem__icon">${glyph('panel-left-open', 20)}</span></button>`
          + NAV.map((g, i) => (i ? '<hr class="gc-sidebar__rule">' : '') + g.items.map((it) => this.row(it, isOn(it), true)).join('')).join('')
          + '</div>';
      } else if (this.drill) {
        const p = NAV.flatMap((g) => g.items).find((i) => i.id === this.drill);
        body = '<div>'
          + `<button type="button" class="gc-sidebar__back" data-back>${glyph('chevron-left', 16)} Back</button>`
          + `<p class="gc-sidebar__eyebrow">${esc(p.label)}</p><div class="gc-sidebar__items">`
          + (p.to ? this.row({ ...p, children: null }, p.id === active, false) : '')
          + p.children.map((x) => this.row(x, x.id === active, false)).join('')
          + '</div></div>';
      } else {
        body = NAV.map((g) => {
          const shut = !!this.closed[g.label];
          return `<div class="gc-sidebar__group"><button type="button" class="gc-sidebar__grouphead" data-group="${esc(g.label)}" aria-expanded="${!shut}"><span>${esc(g.label)}</span><span class="gc-navitem__chev" style="transform:${shut ? 'rotate(-90deg)' : 'none'}">${glyph('chevron-down', 16)}</span></button>`
            + (shut ? '' : `<div class="gc-sidebar__items">${g.items.map((it) => this.row(it, isOn(it), false)).join('')}</div>`)
            + '</div>';
        }).join('');
      }
      const logoHref = routeOf('site-map/SiteMap.dc.html');
      const dark = this.getAttribute('theme') === 'dark';
      this.shadowRoot.innerHTML = `<style>${CSS}</style>
<aside class="gc-sidebar${c ? ' gc-sidebar--collapsed' : ''}${this.hasAttribute('sticky') ? ' gc-sidebar--sticky' : ''}${this.hasAttribute('fill') ? ' gc-sidebar--fill' : ''}">
<div class="gc-sidebar__head"><a href="${logoHref}" title="GridCommerce" style="display:flex;align-items:center;text-decoration:none">${c
        ? `<img src="${assetUrl('8c3babaf605936b39809e7960e7c846f')}" alt="GridCommerce" style="width:36px;height:36px;flex:none;object-fit:contain">`
        : `<img src="${dark ? assetUrl('820d4a69b45ed8fa40c9bc6015985c0e') : assetUrl('ff462bc6abaa5d30500a126b259de9d6')}" alt="GridCommerce" style="height:30px;width:auto;display:block">`}</a>${c ? '' : `<button type="button" data-toggle aria-label="Collapse sidebar" style="display:grid;place-items:center;width:34px;height:34px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:none;color:var(--text-muted);cursor:pointer">${glyph('panel-left-close', 17)}</button>`}</div>
<div class="gc-sidebar__body">${body}</div></aside>`;
    }
  }

  customElements.define('gc-sidebar', GcSidebar);
}
