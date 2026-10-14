'use client';
// storeChrome — what every customer page of the website shares: the store header with the Main menu (sub-items in a
// drop-down), the footer with the footer menus and the shop's contact details (Settings › General), the preview bar for
// staff, and useStoreItem(kind, param), which finds the page / post / product / category / landing page at the address,
// follows a redirect when it moved (Online Store › SEO › Redirects) and logs an address it can't find (Not found).
// Used by StorePage (/page), StoreBlogPost (/blog-post), StoreProduct (/product), StoreCategory (/category) and
// StoreLanding (/lp). Front end only: the live website's server does the same at dazzleshop.com.bd.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { STORE_PAGES_EVENT } from '@/lib/storePages';
import { headerMenu, footerMenus, resolveLink, STORE_MENUS_EVENT } from '@/lib/storeMenus';
import { businessProfile } from '@/lib/businessProfile';
import { getCatalog } from '@/lib/stock';
import { findByHandle, ADAPTERS, contextOf } from '@/lib/seoItems';
import { headFor, livePath, parsePath, demoHref } from '@/lib/seo';
import { resolve, logMiss, SEO_EVENT } from '@/lib/redirects';
import { BLOG_CSS } from '@/screens/integrations/blogShared';
import SeoHead from '@/components/seo/SeoHead';

export const STORE_CSS = `
.spg-nav{display:flex;flex-wrap:wrap;gap:6px 26px;margin:0;padding:0;list-style:none}
.spg-nav>li{position:relative}
.spg-nav a,.spg-nav button{display:inline-flex;align-items:center;gap:2px;padding:8px 2px;border:0;border-bottom:2px solid transparent;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;text-decoration:none;cursor:pointer}
.spg-nav a:hover,.spg-nav button:hover{color:#003087}
.spg-nav a.on{color:#003087;border-bottom-color:#003087}
.spg-drop{position:absolute;left:-8px;top:100%;z-index:10;display:none;min-width:200px;margin:0;padding:6px;list-style:none;background:#fff;border:1px solid #e2e8f0;border-radius:var(--radius-lg);box-shadow:0 12px 28px -10px rgba(15,23,42,.25)}
.spg-nav>li:hover .spg-drop,.spg-nav>li:focus-within .spg-drop{display:block}
.spg-drop a,.spg-drop button{display:flex;width:100%;padding:8px 10px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);color:#334155;text-align:left;text-decoration:none;cursor:pointer}
.spg-drop a:hover,.spg-drop button:hover{background:#f1f5f9;color:#003087}
.spg-main{flex:1;padding:32px 64px 56px}
.spg-crumb{max-width:760px;margin:0 auto 16px;font-size:var(--text-sm);color:var(--text-muted)}
.spg-crumb a{color:var(--text-muted)}
.spg-card{max-width:760px;margin:0 auto;padding:40px 48px;background:#fff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.spg-card .bl-article a.gc-btn--solid{color:#fff}
.spg-card .bl-a-title{margin-bottom:var(--space-2)}
.spg-wide{max-width:1120px}
.spg-home{padding:0;border:0;background:none;font:inherit;color:var(--text-muted);text-decoration:underline;cursor:pointer}
.spg-pv{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 16px;min-height:40px;padding:8px 16px;background:#fff4e0;color:#a14f06;font-size:var(--text-sm);font-weight:var(--weight-medium)}
.spg-moved{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;min-height:36px;padding:6px 16px;background:#e7f0ff;color:#003087;font-size:var(--text-xs)}
.spg-ftr{margin-top:auto;background:#0f172a;color:#cbd5e1;padding:40px 64px 28px;font-size:var(--text-sm)}
.spg-cols{display:grid;grid-template-columns:minmax(200px,1.4fr) repeat(auto-fit,minmax(150px,1fr));gap:28px}
.spg-cols b{display:block;margin-bottom:10px;color:#fff;font-weight:var(--weight-semibold)}
.spg-cols ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
.spg-cols a,.spg-cols button{padding:0;border:0;background:none;font:inherit;color:#cbd5e1;text-decoration:none;cursor:pointer;text-align:left}
.spg-cols a:hover,.spg-cols button:hover{color:#fff;text-decoration:underline}
.spg-cols p{margin:0 0 6px;line-height:1.6}
.spg-base{display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(203,213,225,.2)}
.spg-base>:last-child{margin-left:auto;display:flex;align-items:center;gap:8px}
@media (max-width:1024px){.spg-main{padding:24px 32px 40px}.spg-ftr{padding:32px}}
@media (max-width:640px){.spg-main{padding:16px 16px 32px}.spg-card{padding:24px 20px}.spg-ftr{padding:28px 16px}.spg-cols{grid-template-columns:repeat(2,minmax(0,1fr))}.spg-cols>:first-child{grid-column:1/-1}.spg-base>:last-child{margin-left:0}.spg-drop{position:static;box-shadow:none;border:0;padding:0 0 0 12px}.spg-nav>li:hover .spg-drop{display:none}.spg-nav>li:focus-within .spg-drop{display:block}}
`;

export const query = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');

/** A menu link: opens here when this demo has the page (a full load, so the page reads its new address), else says
 *  it opens on the live website. */
export function MenuLink({ item, current, children }) {
  const r = resolveLink(item.link);
  if (r.broken) return null;
  if (r.href) {
    const ext = /^https?:/i.test(r.href);
    return ext ? <a href={r.href} target="_blank" rel="noopener noreferrer">{children || item.label}</a>
      : <a href={r.href} className={current ? 'on' : undefined} aria-current={current ? 'page' : undefined}>{children || item.label}</a>;
  }
  // a link to a live-site address this demo now draws (a product, a category …) opens its customer view
  const p = parsePath(r.url);
  if (p) return <a href={demoHref(p.kind, p.handle)}>{children || item.label}</a>;
  if (/^https?:/i.test(r.url)) return <a href={r.url} target="_blank" rel="noopener noreferrer">{children || item.label}</a>;
  return <button type="button" onClick={() => toast(`${item.label} opens on the live website (${r.url}).`, { tone: 'info' })}>{children || item.label}</button>;
}
const live = (it) => { const r = resolveLink(it.link); return !r.broken && !r.note; };

/** The menus and the shop, re-read when pages or menus change. */
export function useStoreShell() {
  const [st, setSt] = useState({ ready: false, header: null, footers: [], shop: null, catalog: [] });
  useEffect(() => {
    const load = () => {
      let shop = null;
      try { shop = businessProfile(); } catch { shop = null; }
      setSt({ ready: true, header: headerMenu(), footers: footerMenus(), shop, catalog: getCatalog() });
    };
    load();
    window.addEventListener(STORE_PAGES_EVENT, load);
    window.addEventListener(STORE_MENUS_EVENT, load);
    return () => { window.removeEventListener(STORE_PAGES_EVENT, load); window.removeEventListener(STORE_MENUS_EVENT, load); };
  }, []);
  return st;
}

/**
 * The item at this address: { ready, item, shows, preview, movedFrom, head }. When nothing has the handle, a redirect
 * for its live address is followed (the address bar changes to the new one); when there is none either, the address
 * is added to Online Store › SEO › Not found. Unpublished items show only with ?preview=1 (staff).
 */
export function useStoreItem(kind, param = 'handle') {
  const [st, setSt] = useState({ ready: false, item: null, shows: false, preview: false, movedFrom: '', head: null });
  useEffect(() => {
    const load = () => {
      const handle = query(param);
      const preview = query('preview') === '1';
      const movedFrom = query('from');
      let item = findByHandle(kind, handle);
      if (!item && handle) {
        const r = resolve(livePath(kind, handle), { count: true });
        const to = r && parsePath(r.to);
        if (to) { window.location.replace(demoHref(to.kind, to.handle) + '&from=' + encodeURIComponent(livePath(kind, handle))); return; }
        if (r && /^https?:/i.test(r.to)) { window.location.replace(r.to); return; }
        logMiss(livePath(kind, handle), document.referrer ? new URL(document.referrer).hostname : 'Direct');
      }
      const shows = !!item && (ADAPTERS[kind].live(item) || preview);
      setSt({ ready: true, item, shows, preview, movedFrom, head: shows ? headFor(kind, item, contextOf(kind, item)) : { title: 'Page not found', description: '', robots: 'noindex, follow', canonical: '', og: {}, jsonld: [] } });
    };
    load();
    const evs = ['gc:store-pages', 'gc:blog', 'gc:categories', 'gc:landing-pages', 'storage', SEO_EVENT];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, [kind, param]);
  return st;
}

/** The website around a customer page: header, preview / moved bars, main, footer; and the page's head tags. */
export function StoreChrome({ screen, head, preview, movedFrom, current, css = '', children }) {
  const st = useStoreShell();
  const name = (st.shop && st.shop.brand && st.shop.brand.name) || 'Dazzle Shop';
  const contact = (st.shop && st.shop.contact) || {};
  const items = (st.header && st.header.items) || [];
  const columns = [];
  (st.footers || []).forEach((m) => {
    const loose = (m.items || []).filter((it) => !(it.children || []).length && live(it));
    if (loose.length) columns.push({ key: m.id, title: m.name, items: loose });
    (m.items || []).filter((it) => (it.children || []).length).forEach((it) => { const kids = it.children.filter(live); if (kids.length) columns.push({ key: it.id, title: it.label, items: kids }); });
  });
  const isCur = (it) => !!current && current(it);
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: BLOG_CSS + STORE_CSS + css }} />
      <SeoHead head={head} />
      <div className="sf-root" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        {preview ? <div className="spg-pv" role="status"><Icon name="eye" width="16" height="16" aria-hidden="true" /><span>{preview}</span></div> : null}
        {movedFrom ? <div className="spg-moved" role="status"><Icon name="corner-down-right" width="14" height="14" aria-hidden="true" /><span>Moved here from {movedFrom} (a redirect)</span></div> : null}
        <header className="sf-header sf-pad" style={{ minHeight: '76px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '32px', padding: '0 64px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-lg)', background: '#003087', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{name.slice(0, 1)}</span>
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', color: '#0f172a' }}>{name}</span>
          </span>
          <nav aria-label="Shop" className="sf-navrow" style={{ minWidth: 0 }}>
            <ul className="spg-nav">
              {items.filter(live).map((it) => {
                const kids = (it.children || []).filter(live);
                return (
                  <li key={it.id}>
                    <MenuLink item={it} current={isCur(it)}>{it.label}{kids.length ? <Icon name="chevron-down" width="14" height="14" aria-hidden="true" /> : null}</MenuLink>
                    {kids.length ? <ul className="spg-drop">{kids.map((c) => <li key={c.id}><MenuLink item={c} current={isCur(c)} /></li>)}</ul> : null}
                  </li>
                );
              })}
            </ul>
          </nav>
          <Link href="/checkout" aria-label="Cart" className="sf-acct" style={{ marginLeft: 'auto', display: 'inline-flex', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', color: '#334155' }}><Icon name="shopping-cart" width="22" height="22" aria-hidden="true" /></Link>
        </header>

        <main className="spg-main">{children(st)}</main>

        <footer className="spg-ftr">
          <div className="spg-cols">
            <div>
              <b>{name}</b>
              {contact.address ? <p>{contact.address}</p> : null}
              {contact.phone ? <p>Call {contact.phone}</p> : null}
              {contact.email ? <p>{contact.email}</p> : null}
              {contact.hours ? <p>{contact.hours}</p> : null}
            </div>
            {columns.map((c) => (
              <div key={c.key}><b>{c.title}</b><ul>{c.items.map((it) => <li key={it.id}><MenuLink item={it} /></li>)}</ul></div>
            ))}
          </div>
          <div className="spg-base">
            <span>© {name}</span>
            <span>Powered by <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: '18px', objectFit: 'contain' }} /></span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/** "Page not found" with a way on. */
export function NotFound() {
  return (
    <article className="spg-card" style={{ textAlign: 'center' }}>
      <div className="bl-article">
        <h1 className="bl-a-title">Page not found</h1>
        <p>The page you are looking for is not here. It may have moved.</p>
        <p><Link href="/offers" className="gc-btn gc-btn--solid" style={{ textDecoration: 'none' }}>See today’s offers</Link></p>
      </div>
    </article>
  );
}
/** Home / … / this page. */
export function Crumbs({ items, wide }) {
  return (
    <nav aria-label="Breadcrumb" className={'spg-crumb' + (wide ? ' spg-wide' : '')}>
      <button type="button" className="spg-home" onClick={() => toast('The home page opens on the live website.', { tone: 'info' })}>Home</button>
      {(items || []).map((c, i) => <React.Fragment key={i}>{' / '}{c.href ? <a href={c.href}>{c.name}</a> : <span>{c.name}</span>}</React.Fragment>)}
    </nav>
  );
}
