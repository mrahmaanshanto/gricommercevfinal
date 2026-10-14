'use client';
// Merchant app · Sign-up done (/onb-done): what was saved (shop, link, system) and the next steps picked from the answers
// (lib/shopOnboarding.js › getOnboarding): first product, Facebook / Instagram, delivery, payments, the POS register.
// Steps that only exist on the web say so. Go to my dashboard → /m-home (the owner is already signed in).

import React, { useEffect, useState } from 'react';
import { AppScreen, Content, ActionBar, Button, Card, ListRow, Note, Icon, toast } from './kit/AppKit';
import { ONB_CSS } from './onb/OnbKit';
import { getOnboarding, clearDraft, SUBDOMAIN_BASE } from '@/lib/shopOnboarding';
import { EDITIONS } from '@/lib/edition';


export default function OnbDoneScreen() {
  const [rec, setRec] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { const r = getOnboarding(); setRec(r); setReady(true); if (r) clearDraft(); }, []);
  const link = rec ? rec.handle + '.' + SUBDOMAIN_BASE : '';
  const online = rec && (rec.sell === 'online' || rec.sell === 'both');
  const shop = rec && (rec.sell === 'shop' || rec.sell === 'both');
  const social = rec && (rec.find || []).some((x) => x === 'Facebook page' || x === 'Instagram');
  const digitalPay = rec && (rec.pay || []).some((x) => x !== 'Cash on delivery');
  const copy = async () => {
    try { await navigator.clipboard.writeText('https://' + link); toast('Link copied'); } catch { toast('Copy did not work. Hold the link to copy it.', { tone: 'error' }); }
  };

  return (
    <AppScreen name="OnbDone" title="Your shop is ready" tabs={false} css={ONB_CSS}>
      <Content top={47} bottom={98} style={{ padding: '24px 0 0' }}>
        {!ready ? null : !rec ? (
          <div style={{ padding: '0 24px' }}>
            <h1 className="onbt">No shop yet</h1>
            <Note tone="warn" icon="alert" style={{ marginTop: '16px' }}>
              <div>Sign-up isn’t finished.</div>
              <a href="/onb-phone" style={{ display: 'inline-block', marginTop: '6px', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>Start sign-up</a>
            </Note>
          </div>
        ) : (
          <>
            <div style={{ padding: '0 24px' }}>
              <span className="ico" style={{ width: '52px', height: '52px', background: 'var(--okbg)', color: 'var(--ok)' }}><Icon name="check" size={26} stroke={2.4} /></span>
              <h1 className="onbt" style={{ marginTop: '14px' }}>{`${rec.shop} is ready`}</h1>
              <p className="onbs">Start with these — picked from your answers.</p>
            </div>
            <Card pad style={{ marginTop: '18px' }}>
              <div className="k">Your shop link</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <span className="ell" style={{ flex: 1, minWidth: 0, fontWeight: 'var(--weight-semibold)' }}>{link}</span>
                <Button kind="soft" onClick={copy} style={{ height: '36px' }}>Copy</Button>
              </div>
              <div className="onbmuted" style={{ marginTop: '8px' }}>{`${EDITIONS[rec.edition] ? EDITIONS[rec.edition].name : ''} · ${rec.kind || 'Shop'}`}</div>
            </Card>
            <div className="sec"><h2>Next steps</h2></div>
            <Card>
              {rec.product
                ? <ListRow href={'/m-product-edit?id=' + encodeURIComponent(rec.product.id)} icon="box" title="First product added" sub={rec.product.name} pill={{ tone: 'ok', text: 'Done' }} />
                : <ListRow href="/onb-product" icon="box" title="Add your first product" sub="A name, a price and a photo." />}
              {shop ? <ListRow href="/m-pos" icon="cart" title="Open the POS register" sub="Sell at the counter and print receipts." /> : null}
              {online && social ? <ListRow href="/connections" icon="chat" ellipsis={false} title="Connect Facebook and Instagram" sub="On the web · Messages and comments come into one inbox." /> : null}
              {online ? <ListRow href="/set-delivery" icon="truck" ellipsis={false} title="Set delivery charges and courier" sub="On the web · Inside Dhaka, outside Dhaka, and COD fee." /> : null}
              {digitalPay ? <ListRow href="/set-payments" icon="wallet" ellipsis={false} title="Set up online payments" sub={'On the web · ' + (rec.pay || []).filter((x) => x !== 'Cash on delivery').join(', ')} /> : null}
            </Card>
          </>
        )}
      </Content>
      <ActionBar><Button href={rec ? '/m-home' : '/onb-welcome'} style={{ flex: 2 }}>{rec ? 'Go to my dashboard' : 'Back to start'}</Button></ActionBar>
    </AppScreen>
  );
}
