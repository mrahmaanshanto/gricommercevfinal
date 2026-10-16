'use client';
// storeHeader — the store's header as built in Online Store › Header builder (lib/storefront/headers.js): desktop and
// phone rows drawn separately (phones below 900 px), each row with its height, colours and "sticky"; the elements
// (logo, main menu with drop-downs and mega menus, All categories, search with a category picker, cart, account,
// wishlist, compare, language, hotline, WhatsApp, button, HTML block, social icons, short text, divider, store notice); the phone
// drawer (☰) and the bottom navigation bar. Menus come from Online Store › Menus; a top item with a mega menu opens a
// panel of columns on a computer and a plain list on a phone.

import { useSaved } from '@/lib/storefront/saved';
import { shopSocials } from './shopInfo';
import { FileImg } from '@/components/files/FileParts';
import { useFileSrc } from '@/lib/files';
import React from 'react';
import { Icon } from '@/runtime/dc';
import { getLocale, setLocale, toast } from '@/runtime/ui';
import { resolveLink } from '@/lib/storeMenus';
import { parsePath, demoHref } from '@/lib/seo';
import { ROWS, AREAS } from '@/lib/storefront/headers';
import { openSideCart } from '@/lib/storefront/cart';
import { catChildren, catByPath } from '@/lib/storefront/catalog';
import { BlockContent, bdt } from './storeKit';
import { NoticeBar } from './storeNotices';

const live = (it) => { const r = resolveLink(it.link); return !r.broken && !r.note; };
const telOf = (n) => 'tel:' + String(n || '').replace(/[^\d+]/g, '');
const waOf = (n) => 'https://wa.me/' + String(n || '').replace(/[^\d]/g, '');

/** A menu link: opens here when this demo has the page, else on the live website. */
export function MenuLink({ item, current, children, className }) {
  const r = resolveLink(item.link);
  if (r.broken) return null;
  const label = children || item.label;
  const cls = [className, current ? 'on' : ''].filter(Boolean).join(' ') || undefined;
  if (r.href) {
    const ext = /^https?:/i.test(r.href);
    return ext ? <a href={r.href} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>
      : <a href={r.href} className={cls} aria-current={current ? 'page' : undefined}>{label}</a>;
  }
  const p = parsePath(r.url);
  if (p) return <a href={demoHref(p.kind, p.handle)} className={cls}>{label}</a>;
  if (/^https?:/i.test(r.url)) return <a href={r.url} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>;
  return <button type="button" className={cls} onClick={() => toast(`${item.label} opens on the live website (${r.url}).`, { tone: 'info' })}>{label}</button>;
}

const TONE = {
  theme: ['var(--sf-head-bg)', 'var(--sf-head-fg)', 'var(--sf-head-line)'],
  light: ['#ffffff', 'var(--sf-text)', 'var(--sf-line)'],
  dark: ['#0f172a', '#e2e8f0', 'rgba(255,255,255,.12)'],
  brand: ['var(--sf-primary)', 'var(--sf-on-primary)', 'rgba(255,255,255,.18)'],
  accent: ['var(--sf-accent)', 'var(--sf-on-accent)', 'rgba(0,0,0,.08)'],
};

// ---- mega menu -----------------------------------------------------------------------------------------------------
// a signed-in shopper's wishlist lives in My account (Batch C); guests keep the /wishlist page
const wishHref = (ctx) => (ctx.me ? '/account?tab=wishlist' + (ctx.preview ? '&preview=1' : '') : '/wishlist' + (ctx.preview ? '?preview=1' : ''));

function MegaPanel({ item, ctx }) {
  const m = item.mega;
  const cols = (m.cols || []).slice(0, 5);
  const style = m.width === 'full' ? { left: 0, right: 0 } : m.width === 'custom' ? { width: Math.min(1600, Math.max(480, Number(m.px) || 960)) + 'px', left: '50%', transform: 'translateX(-50%)', maxWidth: '100vw' } : { width: 'min(var(--sf-width), 100vw)', left: '50%', transform: 'translateX(-50%)' };
  return (
    <div className="sfm-mega" style={style}>
      <div className="sfm-cols" style={{ gridTemplateColumns: `repeat(${cols.length},minmax(0,1fr))${m.promo && m.promo.src ? ' 220px' : ''}` }}>
        {cols.map((c) => <MegaColumn key={c.id} c={c} item={item} ctx={ctx} />)}
        {m.promo && m.promo.src ? <a className="sfm-img" href={m.promo.href || '#'}><FileImg src={m.promo.src} alt="" loading="lazy" />{m.promo.title ? <span>{m.promo.title}</span> : null}</a> : null}
      </div>
    </div>
  );
}
export function MegaColumn({ c, item, ctx }) {
  if (c.kind === 'cats') {
    const top = catByPath(c.ref);
    const kids = catChildren(c.ref);
    return (
      <div className="sfm-col">
        <b>{c.title || (top && top.name) || c.ref}</b>
        <ul>
          {(kids.length ? kids : top ? [top] : []).map((k) => <li key={k.id}><a href={k.href}>{k.name}</a></li>)}
          {top && kids.length ? <li><a href={top.href} className="sfm-all">All {top.name.toLowerCase()}</a></li> : null}
        </ul>
      </div>
    );
  }
  if (c.kind === 'links') {
    const kids = (item.children || []).filter(live);
    return <div className="sfm-col"><b>{c.title || item.label}</b><ul>{kids.map((k) => <li key={k.id}><MenuLink item={k} /></li>)}</ul></div>;
  }
  if (c.kind === 'image') return c.src ? <a className="sfm-img" href={c.href || '#'}><FileImg src={c.src} alt="" loading="lazy" />{c.title ? <span>{c.title}</span> : null}</a> : null;
  if (c.kind === 'block') return <div className="sfm-col">{c.title ? <b>{c.title}</b> : null}<BlockContent id={c.block} catalog={ctx.catalog} compact /></div>;
  return null;
}

// ---- elements --------------------------------------------------------------------------------------------------------
const PILLS = ['#2563eb', '#db2777', '#9333ea', '#0d9488', '#14532d', '#ea580c'];
function MainMenu({ el, ctx }) {
  const menu = (ctx.menus || []).find((m) => m.id === (el.menu || 'main')) || (ctx.menus || []).find((m) => m.place === 'header');
  const items = ((menu && menu.items) || []).filter(live);
  if (!items.length) return null;
  return (
    <nav aria-label="Shop" className={'sfm' + (el.weight === 'bold' ? ' is-bold' : '') + ' is-' + (el.look || 'plain')}>
      <ul>
        {items.map((it, i) => {
          const pill = Number(el.pills) > 0 && i >= items.length - Number(el.pills) ? PILLS[(i - (items.length - Number(el.pills))) % PILLS.length] : '';
          const kids = (it.children || []).filter(live);
          const mega = it.mega && it.mega.on && (it.mega.cols || []).length >= 2;
          return (
            <li key={it.id} className={[mega ? 'is-mega' : '', pill ? 'is-pill' : ''].filter(Boolean).join(' ') || undefined} style={pill ? { '--pill': pill } : undefined}>
              <MenuLink item={it} current={ctx.current && ctx.current(it)}>{it.label}{kids.length || mega ? <Icon name="chevron-down" width="14" height="14" aria-hidden="true" /> : null}</MenuLink>
              {mega ? <MegaPanel item={it} ctx={ctx} /> : kids.length ? <ul className="sfm-drop">{kids.map((c) => <li key={c.id}><MenuLink item={c} /></li>)}</ul> : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
function CatMenu({ el, ctx }) {
  const tops = (ctx.cats || []).filter((c) => c.lv === 0 && c.count > 0);
  return (
    <div className="sfc">
      <button type="button" className="sfc-btn" aria-haspopup="true"><Icon name="layout-grid" width="16" height="16" aria-hidden="true" />{el.label || 'All categories'}<Icon name="chevron-down" width="14" height="14" aria-hidden="true" /></button>
      <div className="sfc-panel">
        {tops.map((c) => {
          const kids = catChildren(c.path);
          return <div key={c.id}><a href={c.href} className="sfc-top">{c.name}<small>{c.count}</small></a>{kids.length ? <span>{kids.map((k) => <a key={k.id} href={k.href}>{k.name}</a>)}</span> : null}</div>;
        })}
      </div>
    </div>
  );
}
export function SearchForm({ el = {}, ctx, autoFocus, idp = 'sfs', value = '', cat = '' }) {
  const tops = (ctx.cats || []).filter((c) => c.lv === 0 && c.count > 0);
  return (
    <form className={'sfq sfq--' + (el.size || 'L') + ' sfq-' + (el.look || 'box')} action="/search" method="get" role="search">
      {el.cats ? (
        <select name="cat" aria-label="Category" className="sfq-cat" defaultValue={cat}>
          <option value="">All</option>
          {tops.map((c) => <option key={c.id} value={c.path}>{c.name}</option>)}
        </select>
      ) : null}
      <label htmlFor={idp + '-q'} className="sr-only">Search</label>
      <input id={idp + '-q'} name="q" type="search" placeholder={el.placeholder || 'Search products'} defaultValue={value} autoFocus={autoFocus} />
      {ctx.preview ? <input type="hidden" name="preview" value="1" /> : null}
      <button type="submit" aria-label="Search"><Icon name="search" width="18" height="18" aria-hidden="true" /></button>
    </form>
  );
}
function Logo({ el, ctx }) {
  const name = (ctx.logo && ctx.logo.name) || (ctx.shop && ctx.shop.brand && ctx.shop.brand.name) || 'Dazzle Shop';
  const pic = ctx.logo && (ctx.darkRow ? ctx.logo.light || ctx.logo.src : ctx.logo.src);
  const src = useFileSrc(pic || '', 'md');
  return (
    <a href={'/store' + (ctx.preview ? '?preview=1' : '')} className={'sfl sfl--' + (el.size || 'M') + (src ? ' has-img' : '')} aria-label={name + ' home'}>
      {src ? <img className="sfl-img" src={src} alt={name} /> : <>
        <span className="sfl-mark" aria-hidden="true">{name.slice(0, 1)}</span>
        {el.name !== false ? <span className="sfl-name">{name}</span> : null}
      </>}
    </a>
  );
}
/** An icon with its label beside, below or as two lines (label style 'none' | 'beside' | 'below' | 'two'). */
/** Wishlist / Compare in the header, with how many are saved. */
function SavedLink({ kind, el, ctx }) {
  const saved = useSaved();
  const n = kind === 'wish' ? saved.wish.length : saved.compare.length;
  return <Labeled icon={kind === 'wish' ? 'heart' : 'git-compare'} label={kind === 'wish' ? 'Wishlist' : 'Compare'} sub={el.sub} look={el.label} href={kind === 'wish' ? wishHref(ctx) : '/compare' + (ctx.preview ? '?preview=1' : '')} badge={n || null} mobile={ctx.device === 'mobile'} />;
}
function Labeled({ icon, label, sub, look, onClick, href, badge, mobile }) {
  const st = mobile ? 'none' : look === true ? 'beside' : look || 'none';
  const inner = (
    <>
      <span className="sfi-ic"><Icon name={icon} width="20" height="20" aria-hidden="true" />{badge ? <em className="sfi-badge">{badge}</em> : null}</span>
      {st !== 'none' ? <span className="sfi-t">{st === 'two' ? <><b>{label}</b>{sub ? <small>{sub}</small> : null}</> : label}</span> : null}
    </>
  );
  const cls = 'sfi sfi--' + st;
  return href ? <a className={cls} href={href} aria-label={st === 'none' ? label : undefined}>{inner}</a>
    : <button type="button" className={cls} aria-label={st === 'none' ? label : undefined} onClick={onClick}>{inner}</button>;
}
function IconBtn({ icon, label, showLabel, onClick, badge, href, pic }) {
  // pic: the signed-in shopper's profile picture (Batch C step 3) in place of the icon
  const inner = <>{pic ? <img className="sfi-pic" src={pic} alt="" width="24" height="24" /> : <Icon name={icon} width="20" height="20" aria-hidden="true" />}{showLabel ? <span>{label}</span> : null}{badge ? <em className="sfi-badge">{badge}</em> : null}</>;
  return href ? <a className="sfi" href={href} aria-label={showLabel ? undefined : label}>{inner}</a>
    : <button type="button" className="sfi" aria-label={showLabel ? undefined : label} onClick={onClick}>{inner}</button>;
}
export function cartAction(ctx) { return ctx.values && ctx.values.cartType === 'page' ? () => { window.location.href = '/cart' + (ctx.preview ? '?preview=1' : ''); } : openSideCart; }
function Lang() {
  const bn = typeof window !== 'undefined' && getLocale() === 'bn';
  return <button type="button" className="sfi sfi--lang" onClick={() => setLocale(bn ? 'en' : 'bn')} aria-label={bn ? 'Switch to English' : 'বাংলায় দেখুন'}><b className={bn ? '' : 'on'}>EN</b><span aria-hidden="true">/</span><b className={bn ? 'on bn' : 'bn'} lang="bn">বাং</b></button>;
}
const SOCIAL = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok']];
export function Social({ el = {} }) {
  const list = SOCIAL.filter(([k]) => el[k]);
  if (!list.length) return null;
  return <span className="sfso">{list.map(([k, l]) => <a key={k} href={el[k]} target="_blank" rel="noopener noreferrer" aria-label={l}><Icon name={k === 'tiktok' ? 'music-2' : k} width="18" height="18" aria-hidden="true" /></a>)}</span>;
}

function El({ el, ctx, rowKey }) {
  const phone = (ctx.general && ctx.general.support_phone) || '+8801811843300';
  switch (el.type) {
    case 'logo': return <Logo el={el} ctx={ctx} />;
    case 'menu': return ctx.device === 'mobile' ? null : <MainMenu el={el} ctx={ctx} />;
    case 'catmenu': return ctx.device === 'mobile' ? <IconBtn icon="layout-grid" label={el.label || 'All categories'} onClick={() => ctx.openDrawer('cats')} /> : <CatMenu el={el} ctx={ctx} />;
    case 'search': return ctx.device === 'mobile' && rowKey === 'main' ? <IconBtn icon="search" label="Search" onClick={() => ctx.openDrawer('search')} /> : <SearchForm el={el} ctx={ctx} idp={'sfs-' + el.id} />;
    case 'cart': {
      const withTotal = el.total && ctx.device !== 'mobile';
      if (el.label && el.label !== 'none' && !withTotal) return <Labeled icon="shopping-cart" label="Cart" sub={`${ctx.count} item${ctx.count === 1 ? '' : 's'}`} look={el.label} badge={ctx.count || null} onClick={cartAction(ctx)} mobile={ctx.device === 'mobile'} />;
      return <IconBtn icon="shopping-cart" label={withTotal ? bdt(ctx.total || 0) : `Cart, ${ctx.count} item${ctx.count === 1 ? '' : 's'}`} showLabel={withTotal} badge={ctx.count || null} onClick={cartAction(ctx)} />;
    }
    case 'wishlist': return <SavedLink kind="wish" el={el} ctx={ctx} />;
    case 'compare': return <SavedLink kind="compare" el={el} ctx={ctx} />;
    case 'iconlink': return <Labeled icon={el.icon || 'link'} label={el.label || 'Link'} sub={el.sub} look={el.look || 'below'} href={el.href || '#'} mobile={ctx.device === 'mobile'} />;
    case 'account': {
      const first = ctx.me ? (ctx.me.name || 'My account').split(' ')[0] : '';
      const href = '/account' + (ctx.preview ? '?preview=1' : '');
      if (ctx.me && ctx.me.avatar) return <IconBtn icon="user" pic={ctx.me.avatar} label={first} showLabel={!!el.label && el.label !== 'none' && ctx.device !== 'mobile'} href={href} />;
      return <Labeled icon="user" label={ctx.me ? first : el.label === 'two' ? 'Account' : 'Sign in'} sub={ctx.me ? 'My account' : el.sub || 'Register or log in'} look={el.label} href={href} mobile={ctx.device === 'mobile'} />;
    }
    case 'lang': return <Lang />;
    case 'phone': return <a className="sft" href={telOf(el.number || phone)}><Icon name="phone" width="16" height="16" aria-hidden="true" />{ctx.device === 'mobile' ? null : <span>{el.label ? el.label + ' ' : ''}{el.number || phone}</span>}</a>;
    case 'whatsapp': return <a className="sfw" href={waOf(el.number || phone)} target="_blank" rel="noopener noreferrer" aria-label={el.label || 'WhatsApp'}><Icon name="message-circle" width="16" height="16" aria-hidden="true" />{ctx.device === 'mobile' ? null : <span>{el.label || 'WhatsApp'}</span>}</a>;
    case 'button': return el.label ? <a className={'sf-btn sf-btn--sm' + (el.style === 'outline' ? ' sf-btn--line' : ' sf-btn--fill') + (el.style === 'gradient' ? ' sfh-glow' : '') + (el.style === 'pill' || el.style === 'gradient' ? ' sfh-pill' : '')} href={el.href || '#'}>{el.icon ? <Icon name={el.icon} width="16" height="16" aria-hidden="true" /> : null}{el.label}</a> : null;
    case 'html': return <div className="sfh-html"><BlockContent id={el.block} catalog={ctx.catalog} compact /></div>;
    case 'social': return <Social el={el} />;
    case 'text': return el.text ? <span className="sft">{el.text}</span> : null;
    case 'divider': return el.kind === 'space' ? <span className="sfh-space" aria-hidden="true" /> : <span className="sfh-div" aria-hidden="true" />;
    case 'notice': return (ctx.notices || []).length ? <div className="sfh-notice"><NoticeBar list={ctx.notices} place="header" /></div> : null;
    default: return null;
  }
}

function Row({ r, rowKey, device, top, ctx, burger }) {
  const [bg, fg, line] = TONE[r.tone] || TONE.theme;
  const grow = (list) => (list || []).some((e) => e.type === 'search' && !(device === 'mobile' && rowKey === 'main'));
  return (
    <div className={'sfh-row ' + (device === 'mobile' ? 'sfh-m' : 'sfh-d') + (r.sticky ? ' is-sticky' : '') + ' is-' + rowKey}
      style={{ '--row-h': r.height + 'px', '--row-top': top + 'px', minHeight: r.height + 'px', top: r.sticky ? top + 'px' : undefined, background: bg, color: fg, borderBottom: '1px solid ' + line }}>
      <div className="sf-wrap sfh-in">
        {AREAS.map(([a]) => (
          <div key={a} className={'sfh-a sfh-' + a + (grow(r[a]) ? ' is-grow' : '')}>
            {a === 'left' && burger ? <button type="button" className="sfi" aria-label="Menu" onClick={() => ctx.openDrawer('menu')}><Icon name="menu" width="22" height="22" aria-hidden="true" /></button> : null}
            {(r[a] || []).map((el) => <El key={el.id} el={el} ctx={{ ...ctx, darkRow: r.tone === 'dark' || r.tone === 'brand' || (r.tone === 'theme' && ctx.values && (ctx.values.headerTone === 'dark' || ctx.values.headerTone === 'brand')) }} rowKey={rowKey} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Desktop and phone rows; sticky rows stack under each other. */
export function StoreHeader({ H, ctx }) {
  const rowsOf = (device) => {
    const dev = (H && H[device]) || { rows: {} };
    let top = 0;
    let burgerDone = false;
    return ROWS.map(([k]) => {
      const r = dev.rows && dev.rows[k];
      if (!r || !r.on) return null;
      const t = top;
      if (r.sticky) top += Number(r.height) || 0;
      const burger = device === 'mobile' && !burgerDone && k === 'main' && (H.mobile.drawer || []).length > 0;
      if (burger) burgerDone = true;
      return <Row key={device + k} r={r} rowKey={k} device={device} top={t} ctx={{ ...ctx, device }} burger={burger} />;
    });
  };
  return <header className="sfh">{rowsOf('desktop')}{rowsOf('mobile')}</header>;
}

/** The phone's ☰ drawer: what the header builder put in it, in that order. */
export function MobileDrawer({ open, focus, H, ctx, onClose }) {
  if (!open) return null;
  const items = (H && H.mobile && H.mobile.drawer) || [];
  const menu = (ctx.menus || []).find((m) => m.place === 'header');
  const tops = (ctx.cats || []).filter((c) => c.lv === 0 && c.count > 0);
  const order = focus === 'cats' ? ['catmenu', ...items.filter((x) => x !== 'catmenu')] : focus === 'search' ? ['search', ...items.filter((x) => x !== 'search')] : items;
  const part = (k) => {
    switch (k) {
      case 'search': return <div key={k} className="sfd-sec"><SearchForm el={{ cats: false, size: 'L' }} ctx={ctx} autoFocus={focus === 'search'} idp="sfd-s" /></div>;
      case 'menu': return menu ? (
        <nav key={k} className="sfd-sec" aria-label="Shop menu">
          <ul className="sfd-list">
            {(menu.items || []).filter(live).map((it) => {
              const kids = (it.children || []).filter(live);
              const megaCats = it.mega && it.mega.on ? (it.mega.cols || []).filter((c) => c.kind === 'cats').flatMap((c) => catChildren(c.ref)) : [];
              return (
                <li key={it.id}>
                  {kids.length || megaCats.length ? (
                    <details><summary>{it.label}<Icon name="chevron-down" width="16" height="16" aria-hidden="true" /></summary>
                      <ul>
                        <li><MenuLink item={it}>{'All ' + it.label.toLowerCase()}</MenuLink></li>
                        {kids.map((c) => <li key={c.id}><MenuLink item={c} /></li>)}
                        {megaCats.filter((c) => !kids.some((k2) => k2.label === c.name)).map((c) => <li key={c.id}><a href={c.href}>{c.name}</a></li>)}
                      </ul>
                    </details>
                  ) : <MenuLink item={it} />}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null;
      case 'catmenu': return <div key={k} className="sfd-sec"><b className="sfd-h">Categories</b><ul className="sfd-list">{tops.map((c) => <li key={c.id}><a href={c.href}>{c.name}<small>{c.count}</small></a></li>)}</ul></div>;
      case 'account': return <div key={k} className="sfd-sec"><a className="sfd-row" href={'/account' + (ctx.preview ? '?preview=1' : '')}><Icon name="user" width="18" height="18" aria-hidden="true" />{ctx.me ? 'My account' : 'Sign in'}</a><a className="sfd-row" href={wishHref(ctx)}><Icon name="heart" width="18" height="18" aria-hidden="true" />Wishlist{ctx.wishCount ? ' (' + ctx.wishCount + ')' : ''}</a></div>;
      case 'lang': return <div key={k} className="sfd-sec"><Lang /></div>;
      case 'phone': { const n = (ctx.general && ctx.general.support_phone) || '+8801811843300'; return <div key={k} className="sfd-sec"><a className="sfd-row" href={telOf(n)}><Icon name="phone" width="18" height="18" aria-hidden="true" />{n}</a></div>; }
      case 'social': return <div key={k} className="sfd-sec"><Social el={Object.fromEntries(shopSocials(ctx.values || {}).map((x) => [x.k, x.href]))} /></div>;
      default: return null;
    }
  };
  return (
    <div className="sfd-wrap" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <button type="button" className="sfd-scrim" aria-label="Close the menu" onClick={onClose} tabIndex={-1} />
      <div className="sfd" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="sfd-head"><b>Menu</b><button type="button" className="sfi" aria-label="Close" onClick={onClose} autoFocus={focus !== 'search'}><Icon name="x" width="22" height="22" aria-hidden="true" /></button></div>
        {order.map(part)}
      </div>
    </div>
  );
}

/** The phone's bottom navigation bar. */
export function BottomNav({ H, ctx }) {
  const m = H && H.mobile;
  if (!m || !m.bottomNav) return null;
  const NAV = { home: ['Home', 'house'], cats: ['Categories', 'layout-grid'], search: ['Search', 'search'], cart: ['Cart', 'shopping-cart'], account: ['Account', 'user'], wishlist: ['Wishlist', 'heart'] };
  const act = (k) => (k === 'home' ? () => { window.location.href = '/store' + (ctx.preview ? '?preview=1' : ''); } : k === 'cats' ? () => ctx.openDrawer('cats') : k === 'search' ? () => ctx.openDrawer('search') : k === 'cart' ? cartAction(ctx) : k === 'account' ? () => { window.location.href = '/account' + (ctx.preview ? '?preview=1' : ''); } : () => { window.location.href = wishHref(ctx); });
  return (
    <nav className="sfb" aria-label="Quick links">
      {(m.navItems || []).filter((k) => NAV[k]).map((k) => (
        <button key={k} type="button" onClick={act(k)} className={ctx.kind === 'home' && k === 'home' ? 'on' : undefined}>
          <span className="sfb-ico">{k === 'account' && ctx.me && ctx.me.avatar ? <img className="sfi-pic" src={ctx.me.avatar} alt="" width="22" height="22" /> : <Icon name={NAV[k][1]} width="20" height="20" aria-hidden="true" />}{k === 'cart' && ctx.count ? <em>{ctx.count}</em> : null}</span>
          <span>{NAV[k][0]}</span>
        </button>
      ))}
    </nav>
  );
}

export const HEADER_CSS = `
/* theme pack: logo picture, labelled icons, menu looks, search looks, glowing pill button */
.sfl.has-img{display:inline-flex;align-items:center}
.sfl-img{display:block;height:34px;width:auto;max-width:220px;object-fit:contain}
.sfl--S .sfl-img{height:26px}.sfl--L .sfl-img{height:44px;max-width:260px}
.sfi-ic{position:relative;display:inline-grid;place-items:center}
.sfi--below{flex-direction:column;gap:2px;min-width:52px;height:auto;padding:4px 6px}
.sfi--below .sfi-t{font-size:var(--sf-fs-sm);line-height:1.1}
.sfi--beside .sfi-t{font-size:var(--sf-fs-sm)}
.sfi--two{gap:8px;width:auto;padding:0 6px;text-align:left}
.sfi--two .sfi-t{display:flex;flex-direction:column;line-height:1.15}
.sfi--two .sfi-t b{font-weight:var(--weight-semibold);font-size:var(--sf-fs-sm)}
.sfi--two .sfi-t small{font-size:var(--text-xs);opacity:.75}
.sfi--two .sfi-ic{color:var(--sf-accent)}
.sfm.is-caps>ul>li>a,.sfm.is-caps>ul>li>button{text-transform:uppercase;letter-spacing:.03em;font-size:var(--sf-fs-sm)}
.sfm.is-divided>ul>li+li{border-left:1px solid currentColor;border-left-color:color-mix(in srgb,currentColor 25%,transparent)}
.sfm.is-chips>ul{gap:6px}
.sfm.is-chips>ul>li>a,.sfm.is-chips>ul>li>button{padding:6px 14px;border-radius:var(--radius-full);background:color-mix(in srgb,currentColor 8%,transparent)}
.sfm li.is-pill>a,.sfm li.is-pill>button{margin:0 2px;padding:5px 14px;border-radius:var(--radius-full);background:var(--pill);color:#fff!important;font-weight:var(--weight-semibold);text-transform:uppercase;font-size:var(--sf-fs-sm);letter-spacing:.02em}
.sfq-soft{background:color-mix(in srgb,currentColor 6%,transparent);border-color:transparent!important}
.sfq-pill{border-radius:var(--radius-full)!important;border:1.5px solid var(--sf-primary)!important;overflow:hidden}
.sfq-button button[type=submit]{background:var(--sf-primary);color:var(--sf-on-primary);border-radius:var(--sf-radius);margin:3px;align-self:stretch;min-width:44px}
.sfh-pill{border-radius:var(--radius-full)!important}
.sfh-glow{background:linear-gradient(135deg,#ef4444,#f97316)!important;border-color:transparent!important;color:#fff!important;box-shadow:0 4px 14px rgba(239,68,68,.35)}

.sfh{display:contents}
.sfh-row{position:relative;z-index:40;display:flex;align-items:stretch}
.sfh-row.is-sticky{position:sticky;z-index:45}
.sfh-row.is-top{font-size:var(--sf-fs-sm)}
.sfh-in{display:flex;align-items:center;gap:16px;min-height:inherit}
.sfh-a{display:flex;align-items:center;gap:12px;min-width:0}
.sfh-left{flex:1 1 0;justify-content:flex-start}
.sfh-center{flex:0 1 auto;justify-content:center}
.sfh-right{flex:1 1 0;justify-content:flex-end}
.sfh-center.is-grow{flex:2 1 0}
/* on a computer the side areas never shrink below their elements; the search in the centre gives way */
.sfh-d .sfh-left,.sfh-d .sfh-right{min-width:max-content}
.sfh-center:empty{display:none}
.sfh-div{width:1px;height:20px;background:currentColor;opacity:.25}
.sfh-space{width:16px}
.sfh-html{max-height:100%;overflow:hidden}
.sfh-notice{min-width:0;max-width:100%}
.sfh-html .bl-article :is(p,h3,h4){margin:0}
.sfl{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex:none}
.sfl-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:var(--sf-radius);background:var(--sf-primary);color:var(--sf-on-primary);font-weight:var(--weight-semibold);font-size:var(--sf-fs-lg)}
.sfl-name{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--weight-semibold);white-space:nowrap}
.sfl--S .sfl-mark{width:28px;height:28px;font-size:var(--sf-fs)}.sfl--S .sfl-name{font-size:var(--sf-fs-lg)}
.sfl--L .sfl-mark{width:44px;height:44px;font-size:var(--sf-fs-h3)}.sfl--L .sfl-name{font-size:var(--sf-fs-h2)}
.sfi-pic{width:24px;height:24px;border-radius:50%;object-fit:cover;display:block;box-shadow:0 0 0 1px var(--sf-line)}
.sfi{position:relative;display:inline-flex;align-items:center;gap:6px;min-width:40px;min-height:40px;justify-content:center;padding:0 6px;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-decoration:none}
.sfi-badge{position:absolute;top:2px;right:0;min-width:18px;height:18px;padding:0 4px;border-radius:var(--radius-full);background:var(--sf-sale);color:var(--sf-on-sale);font-style:normal;font-size:var(--sf-fs-sm);line-height:18px;text-align:center}
.sfi--lang{gap:4px;font-size:var(--sf-fs-sm)}.sfi--lang b{font-weight:var(--weight-medium);opacity:.6}.sfi--lang b.on{opacity:1;text-decoration:underline}
.sft,.sfw{display:inline-flex;align-items:center;gap:6px;color:inherit;text-decoration:none;white-space:nowrap}
.sfw{padding:6px 12px;border-radius:var(--sf-radius-btn);background:#25d366;color:#08331a}
.sfso{display:inline-flex;gap:4px}.sfso a{display:inline-grid;place-items:center;width:36px;height:36px;color:inherit}
/* main menu */
.sfm ul{display:flex;flex-wrap:wrap;gap:4px 22px;margin:0;padding:0;list-style:none}
.sfh-a:has(>.sfm){align-self:stretch}
.sfm{display:flex;align-self:stretch}
.sfm>ul{align-items:stretch}
.sfm>ul>li{position:relative;display:flex;align-items:center}
.sfm>ul>li.is-mega{position:static}
.sfm>ul>li>a,.sfm>ul>li>button{display:inline-flex;align-items:center;gap:3px;padding:10px 0;border:0;border-bottom:2px solid transparent;background:none;color:inherit;font:inherit;text-decoration:none;cursor:pointer}
.sfm.is-bold>ul>li>a{font-weight:var(--weight-semibold)}
.sfm>ul>li>a.on,.sfm>ul>li:hover>a{border-bottom-color:currentColor}
.sfm-drop{position:absolute;left:-10px;top:100%;z-index:50;display:none!important;flex-direction:column;gap:0!important;min-width:200px;padding:6px!important;background:var(--sf-surface);color:var(--sf-text);border:1px solid var(--sf-line);border-radius:var(--sf-radius);box-shadow:0 14px 30px -12px rgba(15,23,42,.3)}
.sfm>ul>li:hover>.sfm-drop,.sfm>ul>li:focus-within>.sfm-drop{display:flex!important}
.sfm-drop a,.sfm-drop button{display:block;padding:8px 10px;border-radius:var(--sf-radius);text-decoration:none;color:inherit;background:none;border:0;font:inherit;text-align:left;cursor:pointer}
.sfm-drop a:hover{background:var(--sf-soft);color:var(--sf-primary)}
.sfm-mega{position:absolute;top:100%;z-index:50;display:none;padding:24px;background:var(--sf-surface);color:var(--sf-text);border:1px solid var(--sf-line);border-radius:0 0 var(--sf-radius-card) var(--sf-radius-card);box-shadow:0 18px 40px -16px rgba(15,23,42,.35);box-sizing:border-box}
.sfm>ul>li:hover>.sfm-mega,.sfm>ul>li:focus-within>.sfm-mega{display:block}
.sfm-cols{display:grid;gap:24px}
.sfm-col b{display:block;margin-bottom:8px;font-weight:var(--weight-semibold)}
.sfm-col ul{display:flex!important;flex-direction:column;gap:6px!important}
.sfm-col a{text-decoration:none;color:var(--sf-text)}.sfm-col a:hover{color:var(--sf-primary);text-decoration:underline}
.sfm-all{color:var(--sf-primary)!important;font-weight:var(--weight-medium)}
.sfm-img{position:relative;display:block;min-height:160px;border-radius:var(--sf-radius);overflow:hidden;text-decoration:none}
.sfm-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sfm-img span{position:absolute;left:0;right:0;bottom:0;padding:12px;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;font-weight:var(--weight-semibold)}
/* all categories */
.sfc{position:relative}
.sfc-btn{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border:0;border-radius:var(--sf-radius-btn);background:var(--sf-primary);color:var(--sf-on-primary);font:inherit;font-weight:var(--weight-medium);cursor:pointer}
.sfc-panel{position:absolute;left:0;top:100%;z-index:50;display:none;width:280px;max-height:70vh;overflow:auto;padding:8px;background:var(--sf-surface);color:var(--sf-text);border:1px solid var(--sf-line);border-radius:var(--sf-radius);box-shadow:0 14px 30px -12px rgba(15,23,42,.3)}
.sfc:hover .sfc-panel,.sfc:focus-within .sfc-panel{display:block}
.sfc-panel>div{padding:6px 8px;border-bottom:1px solid var(--sf-line)}
.sfc-panel>div:last-child{border-bottom:0}
.sfc-top{display:flex;justify-content:space-between;text-decoration:none;font-weight:var(--weight-medium)}
.sfc-top small{color:var(--sf-muted)}
.sfc-panel span{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:4px}
.sfc-panel span a{font-size:var(--sf-fs-sm);color:var(--sf-muted);text-decoration:none}
.sfc-panel span a:hover,.sfc-top:hover{color:var(--sf-primary)}
/* search */
.sfq{display:flex;align-items:stretch;width:100%;min-height:42px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:var(--sf-surface);color:var(--sf-text);overflow:hidden}
.sfq--S{max-width:240px}.sfq--M{max-width:400px}.sfq--L{max-width:640px}
.sfq-cat{max-width:140px;border:0;border-right:1px solid var(--sf-line);background:var(--sf-soft);color:inherit;font:inherit;padding:0 8px}
.sfq input{flex:1;min-width:0;border:0;padding:0 12px;background:none;color:inherit;font:inherit}
.sfq input:focus{outline:none}
.sfq:focus-within{outline:2px solid var(--sf-primary)}
.sfq button{display:grid;place-items:center;width:46px;border:0;background:var(--sf-primary);color:var(--sf-on-primary);cursor:pointer}
/* phone drawer and bottom bar */
.sfd-wrap{position:fixed;inset:0;z-index:200}
.sfd-scrim{position:absolute;inset:0;border:0;background:rgba(15,23,42,.45)}
.sfd{position:absolute;left:0;top:0;bottom:0;width:min(340px,88vw);overflow-y:auto;background:var(--sf-surface);color:var(--sf-text);box-shadow:8px 0 30px rgba(15,23,42,.25)}
.sfd-head{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 8px 16px;border-bottom:1px solid var(--sf-line)}
.sfd-sec{padding:12px 16px;border-bottom:1px solid var(--sf-line)}
.sfd-h{display:block;margin-bottom:6px;font-size:var(--sf-fs-sm);color:var(--sf-muted);font-weight:var(--weight-medium)}
.sfd-list{margin:0;padding:0;list-style:none}
.sfd-list li>a,.sfd-list li>button,.sfd-list summary{display:flex;align-items:center;justify-content:space-between;min-height:44px;width:100%;border:0;background:none;color:inherit;font:inherit;text-align:left;text-decoration:none;cursor:pointer;list-style:none}
.sfd-list summary::-webkit-details-marker{display:none}
.sfd-list details ul{margin:0 0 6px 12px;padding:0;list-style:none}
.sfd-list small{color:var(--sf-muted)}
.sfd-row{display:flex;align-items:center;gap:10px;min-height:44px;width:100%;border:0;background:none;color:inherit;font:inherit;text-decoration:none;cursor:pointer}
.sfb{display:none}
@media (max-width:899px){
  .sfh-d{display:none!important}
  .sfh-in{gap:6px}
  .sfh-a{gap:2px}
  .sfl-name{font-size:var(--sf-fs-lg)}
  .sfb{position:fixed;left:0;right:0;bottom:0;z-index:90;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;padding-bottom:var(--host-badge,0px);background:var(--sf-surface);border-top:1px solid var(--sf-line);box-shadow:0 -6px 18px -12px rgba(15,23,42,.4)}
  .sfb button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:56px;border:0;background:none;color:var(--sf-muted);font:inherit;font-size:var(--sf-fs-sm);cursor:pointer}
  .sfb button.on{color:var(--sf-primary)}
  .sfb-ico{position:relative;display:inline-flex}
  .sfb-ico em{position:absolute;top:-6px;right:-10px;min-width:16px;height:16px;padding:0 3px;border-radius:var(--radius-full);background:var(--sf-sale);color:var(--sf-on-sale);font-style:normal;font-size:var(--sf-fs-sm);line-height:16px;text-align:center}
  .sf-theme.has-bnav{padding-bottom:calc(56px + var(--host-badge,0px))}
}
@media (min-width:900px){.sfh-m{display:none!important}}
`;

export { bdt };
