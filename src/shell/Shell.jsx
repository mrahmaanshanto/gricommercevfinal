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
  useEffect(() => {
    const go = (e) => router.push(e.detail);
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

function Switcher({ label, screens }) {
  const here = usePathname();
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
// A POS screen is a fixed-height stage scaled to the window height and widened by the inverse of
// that scale, so it fills the width with no page scroll. Ported from the design's pos-fit.js.

const BAND = 58; // clear strip at the bottom for the screen switcher

export function PosFit() {
  useEffect(() => {
    const stages = document.querySelectorAll('[data-pos-fit]');
    if (!stages.length || stages.length > 3) return undefined; // >3 = the contact sheet
    const [dw, dh] = (stages[0].dataset.posFit || '1380x880').split('x').map(Number);
    const tag = document.createElement('style');
    tag.textContent = 'html,body{overflow:hidden!important;height:100%;margin:0;background:#0f172a}'
      + '[data-pos-fit]{position:fixed!important;left:0!important;top:0!important;'
      + `width:calc(var(--pos-stage-w,${dw}) * 1px)!important;min-width:calc(var(--pos-stage-w,${dw}) * 1px)!important;`
      + `height:calc(var(--pos-stage-h,${dh}) * 1px)!important;min-height:calc(var(--pos-stage-h,${dh}) * 1px)!important;`
      + 'max-height:none!important;transform-origin:0 0!important;transform:scale(var(--pos-fit-scale,1))!important}'
      + '[data-pos-fit] [data-pos-fit]{position:static!important;width:100%!important;min-width:0!important;height:100%!important;min-height:0!important;transform:none!important}';
    document.head.appendChild(tag);
    const root = document.documentElement.style;
    const fit = () => {
      const vp = window.visualViewport;
      const vh = Math.min(window.innerHeight || Infinity, document.documentElement.clientHeight || Infinity, vp ? vp.height : Infinity);
      const vw = Math.min(window.innerWidth || Infinity, document.documentElement.clientWidth || Infinity, vp ? vp.width : Infinity);
      const availH = Math.max(320, vh - BAND);
      let s = Math.min(1, availH / dh);
      if (vw / s < dw) s = vw / dw;
      root.setProperty('--pos-fit-scale', String(s));
      root.setProperty('--pos-stage-w', String(Math.max(dw, Math.round(vw / s))));
      root.setProperty('--pos-stage-h', String(Math.round(availH / s)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
      tag.remove();
      ['--pos-fit-scale', '--pos-stage-w', '--pos-stage-h'].forEach((p) => root.removeProperty(p));
    };
  }, []);
  return null;
}
