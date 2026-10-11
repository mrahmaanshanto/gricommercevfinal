'use client';
// Merchant app · More (/m-more). The design board's layout (design/templates/app/MMore.dc.html) with live data:
//   the person's card (lib/team.js: name, role titles, shop name) and the edition chip (lib/edition.js),
//   the hub: appNav.moreGroups (Sell · Stock · Messages · Money · Team · Settings), only the pages this edition has,
//   this person's role can open and that are built (appNav.ROUTES_BUILT),
//   language (EN / বাংলা), the web panel, refresh, and Sign out (→ /merchant-sign-in).

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppScreen, Content, LargeHeader, TabBar, Section, Card, ListRow, Tile, TileGrid, Avatar, Pill, Skeleton, LangSwitch, Icon,
  useAppData, refresh, toast,
} from './kit/AppKit';
import { moreGroups, canUse } from './kit/appNav';
import { EDITIONS } from '@/lib/edition';
import { roleTitles, signOut } from '@/lib/team';
import { businessProfile } from '@/lib/businessProfile';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };

export default function MMoreScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData();
  const groups = useMemo(() => (ctx ? moreGroups(ctx) : null), [ctx]);
  const shop = useMemo(() => (ready ? safe(() => businessProfile().brand.name, '') : ''), [ready, tick]) || 'Your shop';
  const user = ctx ? ctx.user : null;
  const edition = ctx ? EDITIONS[ctx.ed] : null;
  const titles = user ? roleTitles(user).join(' + ') : '';
  const settings = ctx && canUse('/m-settings', ctx) ? '/m-settings' : undefined;

  const out = () => {
    signOut();
    router.push('/merchant-sign-in');
  };
  const reload = () => { refresh(); toast('Up to date'); };

  return (
    <AppScreen name="MMore" title="More">
      <Content top={47} bottom={0}>
        <LargeHeader title="More" actions={edition ? <Pill tone="nav">{edition.short}</Pill> : null} />

        <Card href={settings} style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '16px 20px 0', padding: '16px' }}>
          <Avatar text={user ? user.initials : ''} size={52} />
          <span style={{ flex: '1', minWidth: '0' }}>
            <span className="ell" style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{user ? user.name : ' '}</span>
            <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{user ? `${titles} · ${shop}` : ' '}</span>
          </span>
          {settings ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg> : null}
        </Card>

        {!groups ? <div style={{ marginTop: '24px' }}><Skeleton rows={4} /></div> : groups.map((g) => (
          <Section key={g.key} title={g.label}>
            <TileGrid card cols={3} style={{ margin: '0 20px' }}>
              {g.items.map((it) => <Tile key={it.href} href={it.href} icon={it.icon} label={it.label} />)}
            </TileGrid>
          </Section>
        ))}

        <Card style={{ margin: '24px 20px 0' }}>
          <div className="row">
            <span className="ico"><Icon name="globe" /></span>
            <span className="m"><span className="t" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>Language</span></span>
            <LangSwitch />
          </div>
          <ListRow href="/merchant-overview" icon="store" title="Open the web panel" sub="Settings, reports and setup" />
          <ListRow onClick={reload} icon="refresh" title="Refresh" sub="Read the latest orders, stock and money" />
        </Card>
        <button type="button" className="row" onClick={out} style={{ margin: '6px 20px 0', width: 'calc(100% - 40px)', color: 'var(--err)', fontWeight: 'var(--weight-medium)', justifyContent: 'center' }}>
          <Icon name="logout" size={20} />Sign out
        </button>
      </Content>
    </AppScreen>
  );
}
