'use client';
// The Reviews card on the product page (Edit product, side column): the product's published reviews (average stars,
// count, the split by stars) and how many wait for a decision, with a link to Online Store › Reviews for this product.
// Data: lib/productReviews.js, read after mount.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { summaryOf, REVIEWS_EVENT } from '@/lib/productReviews';
import { hasModule } from '@/lib/edition';

export default function ProductReviewsCard({ product }) {
  const [s, setS] = useState(null);
  const sku = product && product.sku;
  useEffect(() => {
    if (!sku || !hasModule('online')) { setS(null); return undefined; }
    const load = () => setS(summaryOf(product));
    load();
    window.addEventListener(REVIEWS_EVENT, load);
    return () => window.removeEventListener(REVIEWS_EVENT, load);
  }, [sku]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return null;
  const href = '/product-reviews?sku=' + encodeURIComponent(sku);
  return (
    <section className="ix-card" aria-labelledby="ap-h-rev">
      <div className="ix-card__head ap-head">
        <div><h2 id="ap-h-rev">Reviews</h2></div>
        <Link href={href} className="ap-linkbtn">View</Link>
      </div>
      <div className="ix-card__body ap-body" style={{ gap: 'var(--space-2)' }}>
        {s.count ? (
          <p className="ap-big" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="star" width="16" height="16" fill="currentColor" style={{ color: 'var(--warning, #b45309)' }} aria-hidden="true" />
            <span>{s.avg.toFixed(1)} · {s.count} review{s.count === 1 ? '' : 's'}</span>
          </p>
        ) : <p className="ap-big">No reviews yet</p>}
        {s.count ? (
          <div style={{ display: 'grid', gap: 2 }} aria-label="Reviews by stars">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 24px', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>{n} ★</span>
                <span style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--surface-subtle)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${Math.round((s.stars[n] / s.count) * 100)}%`, background: 'var(--warning, #b45309)' }} /></span>
                <span style={{ textAlign: 'right', fontFamily: 'var(--font-data)' }}>{s.stars[n]}</span>
              </div>
            ))}
          </div>
        ) : null}
        {s.pending ? <Link href={href + '&tab=pending'} className="ap-src" style={{ color: 'var(--primary)' }}>{s.pending === 1 ? '1 review waits for you' : `${s.pending} reviews wait for you`}</Link> : null}
      </div>
    </section>
  );
}
