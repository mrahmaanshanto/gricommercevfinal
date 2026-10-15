'use client';
// MarketingTabs — the page tabs of Marketing's two folded rows (review CX-U9): Offers (all offers · coupons · flash
// sales · smart offers) and Loyalty (overview · members · product points · store credit · invites). Each tab is its
// own page (address and page id unchanged); in the menu those pages fold under their row (navigation.js › `fold`).
// A tab shows only when the person can open that page in this edition and plan (team.js › navFor), read after mount,
// so the server and the first browser render match (every tab), then the list narrows. One tab left = no strip.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NAV } from '@/shell/navigation';
import { routeOf } from '@/runtime/routes';
import { navFor, currentUser } from '@/lib/team';

export const TAB_GROUPS = {
  offers: { label: 'Offers', tabs: [['promo-home', 'All offers'], ['promo-coupons', 'Coupons'], ['promo-flash', 'Flash sales'], ['rec-offers', 'Smart offers']] },
  loyalty: { label: 'Loyalty', tabs: [['loy-home', 'Overview'], ['loy-members', 'Members'], ['loy-products', 'Product points'], ['loy-wallet', 'Store credit'], ['loy-referrals', 'Invite a friend']] },
};
const ITEMS = NAV.flatMap((g) => g.items.flatMap((it) => it.children || [it]));
const hrefOf = (id) => { const it = ITEMS.find((x) => x.id === id); return it && it.to ? routeOf(it.to) + (it.q ? '?' + it.q : '') : ''; };

/** The ids of every page this person can open now (menu rows and folded pages, not locked ones). */
export function openablePages() {
  try {
    return new Set(navFor(currentUser()).flatMap((g) => g.items.flatMap((it) => (it.children || [it]).filter((c) => !c.locked).map((c) => c.id))));
  } catch { return null; }
}

const CSS = `
.mk-tabs .ix-bar{min-height:44px}
.mk-tabs .ix-tab{text-decoration:none}
.mk-tabs .ix-tab[aria-current="page"]{background:var(--fill-primary-soft);color:var(--primary)}
@media (max-width:640px){.mk-tabs .ix-tab{height:36px}}
`;

export default function MarketingTabs({ group, active }) {
  const g = TAB_GROUPS[group];
  const [ok, setOk] = useState(null);
  useEffect(() => { setOk(openablePages()); }, []);
  if (!g) return null;
  const tabs = g.tabs.filter(([id]) => (!ok || ok.has(id) || id === active) && hrefOf(id));
  if (tabs.length < 2) return null;
  return (
    <nav className="ix-card mk-tabs" aria-label={g.label}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-bar">
        <div className="ix-tabs">
          {tabs.map(([id, label]) => <Link key={id} href={hrefOf(id)} className="ix-tab" aria-current={id === active ? 'page' : undefined}>{label}</Link>)}
        </div>
      </div>
    </nav>
  );
}
