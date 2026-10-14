'use client';
// Store page — what a customer sees for one of the store's pages (/page?handle=about-us): the store header with the
// Main menu, the page's title and content blocks, and the footer (storeChrome.jsx). Only published pages show;
// ?preview=1 shows a draft or hidden page to staff with a "Preview" bar. Old addresses (/pages/privacy → privacy-policy)
// still find their page; a page that moved follows its redirect (Online Store › SEO). The head carries the page's SEO
// (title, description, robots, canonical, Open Graph and its schema).
// Front end only: pages from lib/storePages.js, menus from lib/storeMenus.js; the live website serves the same at
// dazzleshop.com.bd/pages/<handle>.

import React from 'react';
import Link from 'next/link';
import { STATUSES } from '@/lib/storePages';
import { BlockView } from '@/screens/integrations/blogShared';
import { StoreChrome, useStoreItem, NotFound, Crumbs } from './storeChrome';

export default function StorePage() {
  const st = useStoreItem('page');
  const page = st.item;
  const draft = st.ready && st.shows && page && page.status !== 'published';
  return (
    <StoreChrome screen="StorePage" head={st.ready ? st.head : null} movedFrom={st.movedFrom}
      preview={draft ? <>Preview · this page is {STATUSES[page.status].label.toLowerCase()}{page.goLiveAt ? ' and goes live later' : ''} and not on the website <Link href={`/store-page-edit?id=${page.id}`} style={{ color: 'inherit' }}>Edit page</Link></> : null}
      current={(it) => it.link.type === 'page' && page && it.link.ref === page.id}>
      {(shell) => (!st.ready ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (<>
        <Crumbs items={[{ name: page.title }]} />
        <article className="spg-card">
          <div className="bl-article">
            <h1 className="bl-a-title">{page.title}</h1>
            {(page.blocks || []).map((b) => <BlockView key={b.id} block={b} catalog={shell.catalog} live />)}
          </div>
        </article>
      </>) : <NotFound />)}
    </StoreChrome>
  );
}
