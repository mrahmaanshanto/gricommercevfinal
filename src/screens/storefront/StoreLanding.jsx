'use client';
// Landing page — what a customer sees for a published landing page (/lp?handle=wireless-earbuds-pro): the parts built
// in the landing page builder (landingView.jsx), with a working cash-on-delivery order form. Landing pages stand on
// their own (no store menu, nothing to wander off to): the shop's logo and phone on top, the parts, a sticky Order
// bar on phones. The head carries the page's SEO and the product's schema (lib/seo.js). Drafts show only with
// ?preview=1, and a draft's order form makes no order. A moved page follows its redirect. A page saved before the
// builder worked gets its template's parts, filled from its product (landingParts.ensureParts).
// The builder's preview frame opens /lp?draft=1&preview=1&edit=1: the page is the builder's unsaved copy, posted with
// sendPreview(frame, 'landing', page) and redrawn on every change (store.js › listenPreview).
// Front end only: pages from lib/landingPages.js; the live website serves the same at dazzleshop.com.bd/lp/<handle>.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { allProducts, getSavedProducts } from '@/lib/products';
import { ensureParts } from '@/lib/landingParts';
import { dhakaText } from '@/lib/seo';
import { isPreview, listenPreview, previewValue, SF_EVENT } from '@/lib/storefront/store';
import SeoHead from '@/components/seo/SeoHead';
import { useStoreItem } from './storeChrome';
import LandingView from './landingView';

/** The builder's unsaved page in its preview frame (null elsewhere, or until the builder has sent it). */
function useDraft() {
  const [on, setOn] = useState(false);
  const [page, setPage] = useState(null);
  useEffect(() => {
    if (!isPreview() || new URLSearchParams(window.location.search).get('draft') !== '1') return undefined;
    setOn(true);
    listenPreview();
    const read = () => setPage(previewValue('landing') || null);
    read();
    window.addEventListener(SF_EVENT, read);
    return () => window.removeEventListener(SF_EVENT, read);
  }, []);
  return { on, page };
}

export default function StoreLanding() {
  const draft = useDraft();
  const st = useStoreItem('landing');
  const lp = draft.on ? draft.page : st.item;
  const product = useMemo(() => (lp ? allProducts(getSavedProducts()).find((x) => x.id === lp.productId || x.sku === lp.sku) || null : null), [lp]);
  const page = useMemo(() => (lp ? ensureParts(lp, product) : null), [lp, product]);
  if (draft.on) {
    return (
      <div className="dc-screen ds" data-screen="StoreLanding" style={{ minHeight: '100vh', background: '#fff' }}>
        {page ? <LandingView page={page} product={product} preview /> : <div style={{ minHeight: 400 }} aria-busy="true" />}
      </div>
    );
  }
  const isDraft = st.ready && st.shows && lp && lp.status !== 'published';
  return (
    <div className="dc-screen ds" data-screen="StoreLanding" style={{ minHeight: '100vh', background: '#fff' }}>
      <SeoHead head={st.ready ? st.head : null} />
      {isDraft ? (
        <div className="spg-pv" role="status" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 40, padding: '8px 16px', background: '#fff4e0', color: '#a14f06', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
          <Icon name="eye" width="16" height="16" aria-hidden="true" />
          <span>Preview · this page is a draft{lp.goLiveAt ? ', going live ' + dhakaText(lp.goLiveAt) : ''}. Its order form makes no orders. <Link href={`/landing-page-builder?id=${lp.id}`} style={{ color: 'inherit' }}>Edit page</Link></span>
        </div>
      ) : null}
      {!st.ready ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows && page ? <LandingView page={page} product={product} preview={isDraft} /> : (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '70vh', padding: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)' }}>This offer page isn’t here</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>It may have ended or moved.</p>
            <a className="gc-btn gc-btn--solid" href="/store">Go to the shop</a>
          </div>
        </div>
      )}
    </div>
  );
}
