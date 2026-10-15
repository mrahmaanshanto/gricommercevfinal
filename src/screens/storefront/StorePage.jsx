'use client';
// Store page — what a customer sees for one of the store's pages (/page?handle=about-us): the store header with the
// Main menu, the page's title and content blocks, and the footer (storeChrome.jsx). Only published pages show;
// ?preview=1 shows a draft or hidden page to staff with a "Preview" bar. Old addresses (/pages/privacy → privacy-policy)
// still find their page; a page that moved follows its redirect (Online Store › SEO). The head carries the page's SEO
// (title, description, robots, canonical, Open Graph and its schema).
// Drawn by the theme with the Page layout (Online Store › Layouts; a layout for this page wins), the page's content as
// its main section. Front end only: pages from lib/storePages.js, menus from lib/storeMenus.js; the live website serves
// the same at dazzleshop.com.bd/pages/<handle>.
// About us, Contact us and the policy pages (privacy, terms, returns, delivery) take the theme's About / Contact / Policy
// page style (pageStyles.jsx); other pages, and the policies' 'card' style, show the page in its card.

import React from 'react';
import Link from 'next/link';
import { STATUSES } from '@/lib/storePages';
import { BlockView } from '@/screens/integrations/blogShared';
import { StoreChrome, useStoreItem, NotFound, Crumbs } from './storeChrome';
import { Sections, useLayout } from './sections';
import { AboutPage, ContactPage, PolicyPage, POLICY_TEMPLATES, PAGE_STYLES_CSS } from './pageStyles';

export default function StorePage() {
  const st = useStoreItem('page');
  const page = st.item;
  const draft = st.ready && st.shows && page && page.status !== 'published';
  const lay = useLayout('page', { page }, page ? page.id : '');
  const styled = (shell) => {
    const v = shell.values || {};
    if (page.template === 'about') return <AboutPage page={page} shell={shell} look={v.aboutStyle || 'classic'} />;
    if (page.template === 'contact') return <ContactPage page={page} shell={shell} look={v.contactStyle || 'cards'} />;
    if (POLICY_TEMPLATES.includes(page.template) && v.policyStyle && v.policyStyle !== 'card') return <PolicyPage page={page} shell={shell} look={v.policyStyle} />;
    return null;
  };
  return (
    <StoreChrome screen="StorePage" kind="page" css={PAGE_STYLES_CSS} head={st.ready ? st.head : null} movedFrom={st.movedFrom} headerId={lay ? lay.header : ''}
      preview={draft ? <>Preview · this page is {STATUSES[page.status].label.toLowerCase()}{page.goLiveAt ? ' and goes live later' : ''} and not on the website <Link href={`/store-page-edit?id=${page.id}`} style={{ color: 'inherit' }}>Edit page</Link></> : null}
      current={(it) => it.link.type === 'page' && page && it.link.ref === page.id}>
      {(shell) => (!st.ready || !lay ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (
        <Sections sections={lay.sections} values={shell.values} catalog={shell.catalog} main={styled(shell) || (
          <div className="sf-wrap spg-body">
            <Crumbs items={[{ name: page.title }]} />
            <article className="spg-card">
              <div className="bl-article">
                <h1 className="bl-a-title">{page.title}</h1>
                {(page.blocks || []).map((b) => <BlockView key={b.id} block={b} catalog={shell.catalog} live />)}
              </div>
            </article>
          </div>
        )} />
      ) : <NotFound shell={shell} />)}
    </StoreChrome>
  );
}
