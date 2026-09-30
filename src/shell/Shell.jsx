'use client';
// React entry points for the shared shell. <gc-sidebar> and <gc-topbar> are framework-free custom
// elements that render into their own shadow roots, so their styles never clash with a screen's.

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { defineGcSidebar } from './gc-sidebar';
import { defineGcTopbar } from './gc-topbar';
import { routeOf } from '../runtime/routes';
import '../runtime/dc';

if (typeof window !== 'undefined') {
  defineGcSidebar();
  defineGcTopbar();
}

/** The shared left menu. `active` is a menu item id from navigation.js. */
export function Sidebar(props) {
  return <gc-sidebar {...props} />;
}

/** The shared top bar: crumb, page title, search, quick actions and the profile menu. */
export function Topbar(props) {
  return <gc-topbar {...props} />;
}

/** Routes the shell's `dc:navigate` events through the Next.js router (no full page reload). */
export function NavigationBridge() {
  const router = useRouter();
  const path = usePathname();
  // screens and the sidebar listen to gc:route to follow path and query changes
  useEffect(() => {
    const id = window.setTimeout(() => window.dispatchEvent(new CustomEvent('gc:route')), 0);
    return () => window.clearTimeout(id);
  }, [path]);
  useEffect(() => {
    const go = (e) => {
      const before = window.location.pathname + window.location.search;
      router.push(e.detail);
      // the router updates the address a moment later: announce it once it has (query-only changes too)
      let tries = 0;
      const tick = () => {
        if (window.location.pathname + window.location.search !== before || ++tries > 20) window.dispatchEvent(new CustomEvent('gc:route'));
        else window.setTimeout(tick, 50);
      };
      window.setTimeout(tick, 50);
    };
    window.addEventListener('dc:navigate', go);
    return () => window.removeEventListener('dc:navigate', go);
  }, [router]);
  return null;
}

// ---- review switchers for the POS and Settings screen sets ------------------------------------

const POS_SCREENS = [
  ['01', 'Idle', 'PosIdle.dc.html'],
  ['02', 'Active sale', 'PosActive.dc.html'],
  ['04', 'Payment', 'PosPay.dc.html'],
  ['05', 'Keypad', 'PosKeypad.dc.html'],
  ['06', 'Held / recent', 'PosSales.dc.html'],
  ['07', 'Return', 'PosReturn.dc.html'],
  ['08', 'Open', 'PosOpen.dc.html'],
  ['09', 'Shift close', 'PosClose.dc.html'],
  ['10', 'Offline', 'PosOffline.dc.html'],
  ['··', 'All 12', 'PosRegister.dc.html'],
];

const SETTINGS_SCREENS = [
  ['01', 'General', 'SetGeneral.dc.html'], ['04', 'Media', 'SetMedia.dc.html'],
  ['05', 'Preference', 'SetPreference.dc.html'], ['06', 'Payments', 'SetPayments.dc.html'],
  ['07', 'Delivery', 'SetDelivery.dc.html'], ['08', 'AI reply', 'SetAi.dc.html'],
  ['09', 'AI usage', 'SetUsage.dc.html'], ['10', 'Rules', 'SetRules.dc.html'],
  ['11', 'SEO', 'SetSeo.dc.html'], ['12', 'Storage', 'SetStorage.dc.html'],
  ['13', 'Keys / backups', 'SetSecurity.dc.html'], ['··', 'All settings', 'SettingsConsole.dc.html'],
];

// The switchers are review tools. They show only when NEXT_PUBLIC_SHOW_STORYBOARD=true.
export const SHOW_STORYBOARD = process.env.NEXT_PUBLIC_SHOW_STORYBOARD === 'true';

function Switcher({ label, screens }) {
  const here = usePathname();
  if (!SHOW_STORYBOARD) return null;
  return (
    <nav aria-label={label} className="dc-switcher">
      {screens.map(([n, text, file]) => {
        const href = routeOf(file);
        const on = here === href;
        return (
          <Link key={file} href={href} title={text} className={on ? 'on' : undefined} aria-current={on ? 'page' : undefined}>
            <span className="n">{n}</span>
            {text}
          </Link>
        );
      })}
    </nav>
  );
}

export const PosSwitcher = () => <Switcher label="POS screens" screens={POS_SCREENS} />;
export const SettingsSwitcher = () => <Switcher label="Settings screens" screens={SETTINGS_SCREENS} />;

// ---- POS stage fit ----------------------------------------------------------------------------
// The POS screens are fluid (see src/screens/pos-register/posLayout.js): they fill the window and
// reflow at their own breakpoints, so nothing is scaled with a transform any more. All that is
// left to do here is reserve the strip at the bottom for the review switcher when it is shown.

const BAND = process.env.NEXT_PUBLIC_SHOW_STORYBOARD === 'true' ? 58 : 0; // clear strip at the bottom for the screen switcher

export function PosFit() {
  useEffect(() => {
    if (!BAND) return undefined;
    const root = document.documentElement.style;
    root.setProperty('--pos-band', BAND + 'px');
    return () => root.removeProperty('--pos-band');
  }, []);
  return null;
}
