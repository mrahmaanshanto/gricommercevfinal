'use client';
// Shared pieces for Online Store › Pages (/store-pages, /store-page-edit) and Menus (/store-menus): the page frame
// (the shell plus one Shopify-style ix-page), the data hooks and the page status badge. Data: lib/storePages.js and
// lib/storeMenus.js (this browser).

import React, { useEffect, useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge } from '@/components/ui';
import { getPages, STATUSES, STORE_PAGES_EVENT } from '@/lib/storePages';
import { getMenus, STORE_MENUS_EVENT } from '@/lib/storeMenus';

/** The shell and one page; `after` renders outside the shell (dialogs, sheets). */
export function StoreFrame({ screen, active, page, css = '', children, after, narrow }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb="Online Store" page={page} />
          <div className="gc-shell__content">
            <div className={'ix-page' + (narrow ? ' ix-page--narrow' : '')}>{children}</div>
          </div>
        </main>
      </div>
      {after}
    </div>
  );
}

/** The store's pages after mount ({ pages, ready }); re-reads on every change. */
export function useStorePages() {
  const [state, setState] = useState({ pages: [], ready: false });
  useEffect(() => {
    const load = () => setState({ pages: getPages(), ready: true });
    load();
    window.addEventListener(STORE_PAGES_EVENT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(STORE_PAGES_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  return state;
}

/** The store's menus after mount ({ menus, ready }). */
export function useStoreMenus() {
  const [state, setState] = useState({ menus: [], ready: false });
  useEffect(() => {
    const load = () => setState({ menus: getMenus(), ready: true });
    load();
    window.addEventListener(STORE_MENUS_EVENT, load);
    window.addEventListener(STORE_PAGES_EVENT, load);
    return () => { window.removeEventListener(STORE_MENUS_EVENT, load); window.removeEventListener(STORE_PAGES_EVENT, load); };
  }, []);
  return state;
}

export function PageStatus({ status }) {
  const s = STATUSES[status] || STATUSES.draft;
  return <StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge>;
}

/** ?name= from the address bar (after mount only). */
export const queryParam = (name) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(name) || '');
