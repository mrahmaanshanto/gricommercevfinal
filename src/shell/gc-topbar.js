/* <gc-topbar> — the one top bar every merchant screen shares.
   Left to right: page crumb and title · search with scope and barcode scan · Settings, Invoice, Files ·
   View store · Notifications · the signed-in user (always rightmost). Below 1024px a menu button opens the
   sidebar as a drawer, and the quick-access links move into the account menu.
   Attributes: crumb, page (the page title), placeholder, base (path to templates/, default "../"), theme="dark", height.
   Under the bar, a page of an area the shop chose but has not set up shows a short setup prompt (lib/navSetup.js).
   The account menu shows the person's roles (several roles = the union, lib/team.js), their start page
   (lib/navProfile.js) and the shop's plan (lib/plans.js).
   Framework-free and rendered in a shadow root, like <gc-sidebar>, so React templates never reconcile it. */
import { routeOf, navigate } from '../runtime/routes';
import { getLocale, setLocale, toast } from '../runtime/ui';
import { t } from './i18n';
import { NAV, NAV_ALIAS } from './navigation';
import { currentEdition, EDITION_EVENT } from '../lib/edition';
import { onKeys as proposalsOn, PROPOSAL_EVENT } from '../lib/proposal';

// The crumb follows the menu: the page's menu group (or its parent item), found from the side menu's active id
// or the address. Screens still pass their old crumb; it is only used when the page is not in the menu.
const OLD_CRUMB = { 'Stocks & Inventory': 'Inventory', Stock: 'Inventory', Purchase: 'Inventory', Purchasing: 'Inventory', Accounts: 'Finances', General: 'Home', Promo: 'Marketing', Communication: 'Communications', Management: 'Settings',
  // the menu's old group names (areas since Oct 2026, navigation.js)
  'Products & stock': 'Inventory', Money: 'Finances', Sales: 'Orders', 'Customer support': 'Communications', 'Online store & settings': 'Settings', Automation: 'Communications', Reports: 'Analytics', Recovery: 'Marketing' };
function menuCrumb(fallback) {
  if (typeof document === 'undefined') return fallback;
  const sb = document.querySelector('gc-sidebar');
  const raw = (sb && sb.getAttribute('active')) || '';
  const id = NAV_ALIAS[raw] || raw;
  const path = (window.location.pathname.replace(/\/$/, '') || '/');
  const pathOf = (it) => (it.to ? routeOf(it.to).split('?')[0] : '');
  let byPath = '';
  for (const g of NAV) {
    for (const it of g.items) {
      if (it.id === id) return g.label;
      for (const c of it.children || []) if (c.id === id) return it.label;
      if (!byPath && pathOf(it) === path) byPath = g.label;
      for (const c of it.children || []) if (!byPath && pathOf(c) === path) byPath = it.label;
    }
  }
  return byPath || OLD_CRUMB[fallback] || fallback;
}
import { USERS, currentUser, roleOf, roleTitles, signInAs, signOut, homeOf, navFor, landingChoices, canSee, SESSION_EVENT } from '../lib/team';
import { getConvs, recentConvs, lastLine, ago as agoText, unreadCount, initialsOf, channelName } from '../lib/inbox';
import { liveCount, LIVE_EVENT } from '../lib/liveCounts';
import { currentPlan, PLAN_EVENT } from '../lib/plans';
import { landingOf, setLanding, areaOf, NAV_PROFILE_EVENT } from '../lib/navProfile';
import { businessProfile } from '../lib/businessProfile';
import { getPlaces } from '../lib/locations';

// the account menu's shop line: the store name from Settings › General and how many branches it has
const shopName = () => { try { return businessProfile().brand.name || 'Your shop'; } catch { return 'Your shop'; } };
function placesLine() {
  let list = [];
  try { list = getPlaces({}).filter((p) => p.active !== false && !p.noSale); } catch { /* ignore */ }
  const n = list.filter((p) => p.type === 'Branch').length;
  if (n) return n + (n === 1 ? ' branch' : ' branches');
  return list.length > 1 ? list.length + ' places' : '1 shop';
}

// the menu area of this page: the side menu's active id, else the address
function pageArea() {
  if (typeof document === 'undefined') return null;
  const sb = document.querySelector('gc-sidebar');
  const raw = (sb && sb.getAttribute('active')) || '';
  const path = (window.location.pathname.replace(/\/$/, '') || '/');
  const pathOf = (it) => (it.to ? routeOf(it.to).split('?')[0] : '');
  for (const g of NAV) for (const it of g.items) for (const c of it.children || []) if (pathOf(c) === path) return it.id;
  const a = raw ? areaOf(raw) : null;
  return a ? a.id : null;
}
const LATER_KEY = 'gc.setup.later';
const later = () => { try { return JSON.parse(window.sessionStorage.getItem(LATER_KEY)) || []; } catch { return []; } };

export function defineGcTopbar() {
  if (typeof window === 'undefined' || customElements.get('gc-topbar')) return;
  const P = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8H8M16 12H8M12 16H8"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4M2 7h20M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    kb: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    sparkles: '<path d="M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    flask: '<path d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.12a2 2 0 0 1-.21-.9V2M8.5 2h7M7 16h10"/>'
  };
  const ic = (n, s = 18, w = 1.75) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const CSS = `*,*::before,*::after{box-sizing:border-box}
:host{display:block;flex:none;position:sticky;top:0;z-index:100;container-type:inline-size;font-family:var(--font-sans)}
.bar{--bg:#fff;--line:#e2e8f0;--ink:#0f172a;--body:#475569;--muted:var(--text-muted);--soft:#f1f5f9;--field:#f5f7fa;--navy:#003087;--pop:#fff;--hover:#f1f5f9;
  display:flex;align-items:center;gap:8px;height:var(--h,var(--header-height,56px));padding:0 12px 0 20px;background:var(--bg);border-bottom:1px solid var(--line);border-radius:var(--radius-xl) var(--radius-xl) 0 0}
.bar.dark{--bg:#0f1b33;--line:#1f2d4a;--ink:#e8eef8;--body:#b6c3d9;--muted:#8a9bb8;--soft:#18264a;--field:#16233f;--navy:#7fb8ff;--pop:#13213d;--hover:#1b2a4d}
.ib.menu{display:none;flex:none}
.id{flex:0 1 auto;min-width:0;display:flex;align-items:center;gap:6px;max-width:34%;font-size:var(--text-sm);white-space:nowrap}
.id .crumb{color:var(--muted);overflow:hidden;text-overflow:ellipsis}
.id .sl{color:var(--muted);flex:none}
.id .here{color:var(--ink);font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis}
.helpbtn{flex:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--line);border-radius:var(--radius-full,999px);background:var(--bg);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--ink);cursor:pointer}
.helpbtn:hover{border-color:var(--navy);color:var(--navy)}
.helpbtn:focus-visible{outline:2px solid var(--navy);outline-offset:2px}
.pchip{flex:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--warning);border-radius:var(--radius-full);background:var(--fill-warning-soft);color:var(--text-warning);font-size:var(--text-xs);font-weight:var(--weight-medium);text-decoration:none;white-space:nowrap}
.pchip:hover{background:var(--warning);color:#fff}
.pchip .pn{display:none}
button,input,select{font:inherit}
.search{position:relative;flex:1 1 320px;max-width:540px;min-width:200px}
.field{display:flex;align-items:center;height:36px;border:1px solid var(--line);border-radius:var(--radius-xl);background:var(--field);transition:border-color .2s,box-shadow .2s,background-color .2s}
.field:focus-within{border-color:var(--navy);background:var(--bg);box-shadow:0 0 0 3px rgba(0,48,135,.14)}
.scope{flex:none;width:72px;height:26px;margin-left:6px;padding:0 6px 0 10px;border:0;border-radius:var(--radius-lg);background:var(--bg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);cursor:pointer;box-shadow:0 0 0 1px var(--line)}
.sic{flex:none;display:flex;padding:0 8px 0 10px;color:var(--muted)}
input{flex:1;min-width:0;height:100%;border:0;background:transparent;font:inherit;font-size:var(--text-sm);color:var(--ink);outline:none}
input::placeholder{color:var(--muted)}
.kbd{flex:none;margin-right:6px;padding:2px 6px;border:1px solid var(--line);border-radius:var(--radius-md);font-family:var(--font-data);font-size:var(--text-xs);color:var(--muted);background:var(--bg)}
.scanbtn{flex:none;display:inline-flex;align-items:center;gap:6px;height:28px;margin-right:4px;padding:0 10px;border:0;border-radius:var(--radius-lg);background:var(--navy);color:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}
.dark .scanbtn{color:#0f1b33}
.grp{display:flex;align-items:center;gap:2px;padding:3px;border-radius:var(--radius-xl);background:var(--soft)}
.ib{position:relative;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:transparent;color:var(--body);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;text-decoration:none;transition:background-color .2s,color .2s}
.ib:hover,.ib[aria-expanded="true"]{background:var(--bg);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.08)}
.bar>.ib:hover,.bar>.ib[aria-expanded="true"]{background:var(--hover);box-shadow:none}
.tip{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);padding:4px 8px;border-radius:var(--radius-md);background:#0f172a;color:#fff;font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s .3s}
.ib:hover .tip,.ib:focus-visible .tip{opacity:1}
.sep{width:1px;height:28px;background:var(--line);margin:0 4px}
.store{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--bg);color:var(--ink);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);text-decoration:none;white-space:nowrap;cursor:pointer}
.store:hover{border-color:var(--navy);color:var(--navy)}
.badge{position:absolute;top:4px;right:4px;min-width:17px;height:17px;padding:0 4px;border-radius:var(--radius-full);background:#c2380f;color:#fff;font-size:var(--text-2xs);font-weight:var(--weight-medium);line-height:17px;text-align:center;border:2px solid var(--bg)}
.spin{animation:sp .8s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
.ok{color:var(--text-success)}
.me{display:flex;align-items:center;gap:8px;height:40px;margin-left:4px;padding:0 8px 0 4px;border:0;border-radius:var(--radius-xl);background:transparent;font:inherit;cursor:pointer;text-align:left}
.me:hover,.me[aria-expanded="true"]{background:var(--hover)}
.av{position:relative;flex:none;width:30px;height:30px;border-radius:var(--radius-lg);background:linear-gradient(145deg,#2eaee4,#003087);color:#fff;display:flex;align-items:center;justify-content:center;font-size:var(--text-xs-plus);font-weight:var(--weight-semibold)}
.av i{position:absolute;right:-2px;bottom:-2px;width:11px;height:11px;border-radius:var(--radius-full);background:#10b981;border:2px solid var(--bg)}
.mn{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--ink);white-space:nowrap}.mr{font-size:var(--text-xs);color:var(--muted);white-space:nowrap}
.me .chev{color:var(--muted)}
button:focus-visible,a:focus-visible,select:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.pop{position:absolute;top:calc(100% + 8px);z-index:100;min-width:280px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 80px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:8px;border:1px solid var(--line);border-radius:var(--radius-xl);background:var(--pop);box-shadow:0 18px 40px -12px rgba(15,23,42,.28);color:var(--ink);animation:pin .16s cubic-bezier(.23,1,.32,1)}
@keyframes pin{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.wrap{position:relative}
.ph{display:flex;align-items:center;justify-content:space-between;padding:6px 8px 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--muted)}
.ph a,.ph button{border:0;background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:0;text-transform:none;color:var(--navy);cursor:pointer;text-decoration:none}
.it{display:flex;align-items:flex-start;gap:10px;width:100%;padding:9px 8px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;text-align:left;color:var(--ink);text-decoration:none;cursor:pointer}
.it:hover{background:var(--hover)}
.it .ico{flex:none;width:32px;height:32px;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;background:var(--soft);color:var(--navy)}
.it b{display:block;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);line-height:18px}.it small{display:block;font-size:var(--text-xs);line-height:16px;color:var(--muted)}
.it .t{margin-left:auto;flex:none;font-size:var(--text-xs);color:var(--muted)}
.note{display:grid;grid-template-columns:32px minmax(0,1fr) auto 8px;align-items:start;column-gap:10px}.note .t{margin:0}.note .dot{width:8px;height:8px;margin-top:5px;border-radius:var(--radius-full);background:transparent}.note.unread .dot{background:#009cde}
.foot{display:block;margin:4px 0 0;padding:10px 8px 6px;border-top:1px solid var(--line);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--navy);text-align:center;text-decoration:none}
.only-narrow{display:none}
.only-phone{display:none}
.ib.aibtn{display:none;color:var(--navy)}
.hr{height:1px;margin:6px 4px;background:var(--line)}
.chl{display:flex;flex-direction:column;max-height:min(420px,calc(100dvh - 220px));overflow-y:auto}
.chat{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;column-gap:10px;padding:8px}
.chat .cav{position:relative;width:40px;height:40px;border-radius:var(--radius-full);display:grid;place-items:center;overflow:hidden;background:var(--soft);color:var(--navy);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.chat .cav img{width:100%;height:100%;object-fit:cover}
.chat b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:var(--weight-medium)}
.chat small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chat.unread b{font-weight:var(--weight-semibold)}.chat.unread small{color:var(--ink);font-weight:var(--weight-medium)}
.chat .side{display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:var(--text-xs);color:var(--muted)}
.chat .cdot{width:10px;height:10px;border-radius:var(--radius-full);background:var(--navy)}
.chf{display:flex;gap:6px;padding:0 8px 6px}
.chf button{height:28px;padding:0 12px;border:0;border-radius:var(--radius-full);background:var(--soft);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.chf button.on{background:var(--navy);color:#fff}
.chq{display:flex;flex-wrap:wrap;gap:6px;padding:4px 8px 2px}
.chq a{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border:1px solid var(--line);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--ink);text-decoration:none}
.chq a:hover{border-color:var(--navy);color:var(--navy)}
.chq b{min-width:18px;height:18px;padding:0 5px;border-radius:var(--radius-full);background:var(--soft);font-size:var(--text-2xs);line-height:18px;text-align:center}
.ib.chatbtn{color:var(--navy)}
.badge.chat-n{background:var(--navy)}
.chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 8px 8px}
.chip{height:36px;padding:0 14px;border:1px solid var(--line);border-radius:var(--radius-full);background:var(--bg);font:inherit;font-size:var(--text-xs-plus);color:var(--body);cursor:pointer}
.chip:hover{border-color:var(--navy);color:var(--navy)}
.scanbox{position:relative;height:120px;margin:4px 8px 10px;border-radius:var(--radius-xl);background:#0f172a;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#cbd5e1;font-size:var(--text-xs-plus)}
.scanbox::before{content:"";position:absolute;left:16px;right:16px;top:20px;height:2px;background:#ff5724;box-shadow:0 0 12px #ff5724;animation:sl 1.6s ease-in-out infinite alternate}
@keyframes sl{to{top:98px}}
.hit{display:flex;align-items:center;gap:10px;margin:0 8px 8px;padding:10px;border-radius:var(--radius-lg);background:rgba(16,185,129,.1);font-size:var(--text-xs-plus);color:var(--ink)}
.row2{display:flex;gap:8px;padding:0 8px 6px}
.pb{flex:1;height:36px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}
.pb.p{background:var(--navy);color:#fff}.pb.s{background:var(--soft);color:var(--navy)}
.seg{display:flex;gap:2px;margin-left:auto;padding:2px;border-radius:var(--radius-lg);background:var(--soft)}
.seg button{height:28px;padding:0 9px;border:0;border-radius:var(--radius-md);background:transparent;font:inherit;font-size:var(--text-xs);color:var(--body);cursor:pointer}.seg button.on{background:var(--bg);color:var(--navy);font-weight:var(--weight-medium)}
@container (max-width:1180px){.mnm,.kbd{display:none}.me{padding-right:4px}}
@container (max-width:1060px){.store span,.scanbtn .lbl{display:none}.store{width:38px;padding:0;justify-content:center}.store svg+svg{display:none}}
@container (max-width:900px){.grp,.sep,.store{display:none}.only-narrow{display:flex}}
@container (max-width:640px){.helpbtn{display:none}.it.only-phone{display:flex}.ib.aibtn{display:inline-flex}.ib{width:36px;height:36px}.me{height:44px;margin-left:0;padding:0 2px}.me .chev{display:none}.sic{padding:0 4px 0 8px}.scanbtn{padding:0 8px}.pchip{padding:0 10px;gap:4px}.pchip .pl{display:none}.pchip .pn{display:inline}.bar{padding:0 8px 0 12px;gap:6px}.id{display:none}.scope{display:none}.search{min-width:0;flex:1 1 80px}.pop{position:fixed;left:12px!important;right:12px!important;top:72px;width:auto!important;max-height:calc(100dvh - 84px - env(safe-area-inset-bottom))}}
@media (max-width:1023px){.ib.menu{display:inline-flex}.bar{border-radius:0}}
.lsel{margin-left:auto;max-width:150px;height:28px;padding:0 6px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--bg);font:inherit;font-size:var(--text-xs);color:var(--body);cursor:pointer}
.setup{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 12px 6px 20px;border-bottom:1px solid var(--border-subtle,#e2e8f0);background:var(--fill-warning-soft,#fef3c7);font-size:var(--text-sm);color:var(--text-heading,#0f172a)}
.setup>svg{flex:none;color:var(--text-warning,#a14f06)}
.setup .st{flex:1;min-width:0}
.setup .sgo{flex:none;display:inline-flex;align-items:center;height:28px;padding:0 12px;border-radius:var(--radius-lg);background:var(--primary,#003087);color:#fff;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);text-decoration:none;white-space:nowrap}
.setup .sx{flex:none;display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-body,#475569);cursor:pointer}
.setup .sx:hover{background:rgba(255,255,255,.6)}
@container (max-width:640px){.setup{padding:6px 8px 6px 12px;flex-wrap:wrap}.setup .sx{width:36px;height:36px}}
@media (prefers-reduced-motion:reduce){.pop{animation:none}.scanbox::before{animation:none;top:58px}.spin{animation:none}}`;

  const NOTES = [
    { i: 'cart', t: 'New order #136812', d: 'Nusrat Jahan · ৳2,450 · bKash paid', w: '2 min', u: 1 },
    { i: 'box', t: 'Low stock: Anker 20W charger', d: '4 left at Dhanmondi branch', w: '18 min', u: 1 },
    { i: 'truck', t: 'Steadfast pickups delayed', d: '23 parcels waiting for tracking numbers', w: '1 h', u: 1 },
    { i: 'wallet', t: 'COD payout received', d: 'Pathao · ৳48,300 for 31 orders', w: '3 h', u: 0 },
    { i: 'zap', t: 'Flash sale starts in 5 hours', d: 'Weekend Mega Sale · 6:00 PM', w: 'Today', u: 0 }
  ];
  // a shop without online selling: counter sales, dues and stock (no couriers, COD or online payments)
  const RETAIL_NOTES = [
    { i: 'cart', t: 'Counter sale #136812', d: 'Dhanmondi · Counter 1 · ৳2,450 cash', w: '2 min', u: 1 },
    { i: 'box', t: 'Low stock: Anker 20W charger', d: '4 left at Dhanmondi branch', w: '18 min', u: 1 },
    { i: 'wallet', t: 'Payment due today', d: 'Shirin Akter · ৳3,200 on due', w: '1 h', u: 1 },
    { i: 'wallet', t: 'Card machine payout received', d: 'City Bank · ৳48,300 for 31 sales', w: '3 h', u: 0 },
    { i: 'truck', t: 'Stock transfer arrived', d: 'Central Warehouse → Dhanmondi · 24 items', w: 'Today', u: 0 }
  ];

  class GcTopbar extends HTMLElement {
    static get observedAttributes() { return ['crumb', 'page', 'placeholder', 'base', 'theme', 'height']; }
    constructor() { super(); this.root = this.attachShadow({ mode: 'open' }); this._open = ''; this._unread = 3; this._scanHit = false; }
    connectedCallback() {
      this.render();
      this._doc = (e) => { if (this._open && !e.composedPath().includes(this)) { this._open = ''; this.render(); } };
      this._loc = () => this.render();
      window.addEventListener('gc:locale', this._loc);
      window.addEventListener('gc:settle', this._loc);
      window.addEventListener('gc:meet', this._loc);
      window.addEventListener(SESSION_EVENT, this._loc);
      window.addEventListener(EDITION_EVENT, this._loc);
      window.addEventListener(PROPOSAL_EVENT, this._loc);
      window.addEventListener(PLAN_EVENT, this._loc);
      window.addEventListener(NAV_PROFILE_EVENT, this._loc);
      // the chat badge and list follow the inbox (throttled: typing in the Inbox fires it often)
      this._inbox = () => { window.clearTimeout(this._inboxT); this._inboxT = window.setTimeout(() => this.render(), 150); };
      window.addEventListener(LIVE_EVENT, this._inbox);
      // the setup prompt: which chosen areas are not set up yet (read after the first paint)
      this._setup = () => import('../lib/navSetup').then(({ pendingSetup }) => {
        const next = pendingSetup(); const key = next.map((x) => x.id).join(',');
        if (key !== (this._setupKey || '')) { this._setupList = next; this._setupKey = key; this.render(); }
      }).catch(() => {});
      ['gc:connections', 'gc:ledger', 'gc:pos', 'gc:route', 'focus'].forEach((ev) => window.addEventListener(ev, this._setup));
      this._setup();
      this._key = (e) => {
        if (e.key === 'Escape' && this._open) { this.close(true); }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); const i = this.root.querySelector('input'); if (i) i.focus(); }
      };
      if (!this._navBound) { this._navBound = true; this.root.addEventListener('click', (e) => { const a = e.composedPath().find((el) => el.matches && el.matches('a[href^="/"]')); if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); this._open = ''; document.documentElement.classList.remove('gc-pop-open'); navigate(a.getAttribute('href')); } }); }
      document.addEventListener('pointerdown', this._doc); document.addEventListener('keydown', this._key);
    }
    disconnectedCallback() { document.documentElement.classList.remove('gc-pop-open'); document.removeEventListener('pointerdown', this._doc); document.removeEventListener('keydown', this._key); window.removeEventListener('gc:locale', this._loc); window.removeEventListener(EDITION_EVENT, this._loc); window.removeEventListener(PROPOSAL_EVENT, this._loc); window.removeEventListener('gc:settle', this._loc); window.removeEventListener('gc:meet', this._loc); window.removeEventListener(SESSION_EVENT, this._loc); window.removeEventListener(PLAN_EVENT, this._loc); window.removeEventListener(NAV_PROFILE_EVENT, this._loc); window.removeEventListener(LIVE_EVENT, this._inbox); if (this._setup) ['gc:connections', 'gc:ledger', 'gc:pos', 'gc:route', 'focus'].forEach((ev) => window.removeEventListener(ev, this._setup)); }
    /** Closes the open popover; from the keyboard, focus goes back to the button that opened it. */
    close(refocus) { const k = this._open; this._open = ''; this.render(); if (refocus && k) { const el = this.root.querySelector(k === 'search' ? 'input' : `[data-act="${k}"]`); if (el) el.focus(); } }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    toggle(k) { this._open = this._open === k ? '' : k; if (k === 'scan' && this._open) { this._scanHit = false; clearTimeout(this._st); this._st = setTimeout(() => { this._scanHit = true; if (this._open === 'scan') this.render(); }, 1400); } this.render(); }
    render() {
      const a = (n, d) => this.getAttribute(n) || d;
      const ed = currentEdition();
      const has = (m) => ed.modules.includes(m);   // shortcuts only for the edition's modules (src/lib/edition.js)
      const locale = getLocale();
      const L = (x) => t(x, locale);
      const base = a('base', '../'), dark = a('theme', '') === 'dark', o = this._open;
      const title = a('page', ''), crumb = ((c) => (c === title ? '' : c))(menuCrumb(a('crumb', ''))), ph = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches) ? L('Search') : L(a('placeholder', has('catalog') ? 'Search orders, products, customers, invoices…' : 'Search customers, chats and calls…'));
      const exp = (k) => `aria-expanded="${o === k}" aria-haspopup="true"`;
      const pop = (k, html, style) => (o === k ? `<div class="pop" role="dialog" style="${style}">${html}</div>` : '');
      const searchPop = `<div class="ph">${L('Recent searches')}</div><div class="chips"><button class="chip">#136779</button><button class="chip">01711-234567</button><button class="chip">Redmi Note 13</button><button class="chip">INV-2026-0912</button></div>
        <div class="ph">${L('Jump to')}</div>
        ${has('commerce') ? `<a class="it" href="${routeOf('merchant-orders/MerchantOrders.dc.html')}"><span class="ico">${ic('cart', 16)}</span><span><b>Orders</b><small>Search by order ID, phone or customer</small></span></a>` : ''}
        ${has('catalog') ? `<a class="it" href="${routeOf('products/AllProducts.dc.html')}"><span class="ico">${ic('box', 16)}</span><span><b>Products</b><small>Name, SKU or barcode</small></span></a>` : ''}
        <a class="it" href="${routeOf('customers-crm/AllCustomers.dc.html')}"><span class="ico">${ic('user', 16)}</span><span><b>Customers</b><small>Name, phone or email</small></span></a>
        ${has('commerce') ? `<a class="it" href="${routeOf('order-detail/OrderDetail.dc.html')}"><span class="ico">${ic('receipt', 16)}</span><span><b>Invoices</b><small>Invoice number or amount</small></span></a>` : ''}
        ${has('comms') ? `<a class="it" href="${routeOf('merchant-inbox/MerchantInbox.dc.html')}"><span class="ico">${ic('user', 16)}</span><span><b>Inbox</b><small>Name, phone or message</small></span></a>` : ''}`;
      const scanPop = `<div class="ph">Scan a barcode <span style="text-transform:none;letter-spacing:0;font-weight:var(--weight-medium)">USB scanner ready</span></div>
        <div class="scanbox">Point the camera at a barcode, or scan with the USB scanner</div>
        ${this._scanHit ? `<div class="hit" role="status"><span class="ok">${ic('check', 16, 2.5)}</span><span><b style="display:block">Baseus Car Phone Holder</b><span style="font-family:var(--font-data);font-size:11.5px;color:var(--muted)">8941200200214 · 40 in stock · ৳1,890</span></span></div>
        <div class="row2"><a class="pb p" href="${routeOf('products/AddProduct.dc.html')}" style="display:flex;align-items:center;justify-content:center;text-decoration:none">Open product</a><a class="pb s" href="${routeOf('pos-register/Pos.dc.html')}" style="display:flex;align-items:center;justify-content:center;text-decoration:none">Add to POS cart</a></div>` : `<div class="row2"><button class="pb s" data-act="cam">${ic('camera', 14)} Use phone camera</button></div>`}`;
      const invPop = `<div class="ph">Invoices <a href="${routeOf('order-detail/OrderDetail.dc.html')}">See all</a></div>
        <a class="it" href="${routeOf('order-detail/OrderDetail.dc.html')}"><span class="ico">${ic('plus', 16, 2.2)}</span><span><b>New invoice</b><small>For a phone or walk-in sale</small></span></a>
        <div class="hr"></div>
        ${[['INV-2026-0931', 'Nusrat Jahan · ৳2,450', 'Paid'], ['INV-2026-0930', 'Rahim Traders · ৳38,200', 'Due 25 Sep'], ['INV-2026-0929', 'Walk-in · ৳890', 'Paid']].map((r) => `<a class="it" href="${routeOf('order-detail/OrderDetail.dc.html')}"><span class="ico">${ic('receipt', 16)}</span><span><b>${r[0]}</b><small>${r[1]}</small></span><span class="t">${r[2]}</span></a>`).join('')}`;
      const filesPop = `<div class="ph">Recent files <a href="${routeOf('settings-console/SetMedia.dc.html')}">File manager</a></div>
        ${[['file', 'products-import-sep.csv', 'Product import · 412 rows', '1 h'], ['image', 'eid-banner-1200x400.jpg', 'Storefront banner', 'Yesterday'], ['file', 'INV-2026-0930.pdf', 'Invoice · Rahim Traders', 'Yesterday'], ['file', 'stock-count-18-sep.xlsx', 'Stock count export', '2 days']].map((r) => `<a class="it" href="${routeOf('settings-console/SetMedia.dc.html')}"><span class="ico">${ic(r[0], 16)}</span><span><b>${r[1]}</b><small>${r[2]}</small></span><span class="t">${r[3]}</span></a>`).join('')}
        <div class="hr"></div><button class="it" data-act="upload"><span class="ico">${ic('plus', 16, 2.2)}</span><span><b>Upload a file</b><small>Images, PDF, CSV or Excel · up to 20 MB</small></span></button>`;
      // payouts waiting for the evening check (components/EveningCheck.jsx)
      const settle = (typeof window !== 'undefined' && window.__gcSettle) || { count: 0 };
      const settleNote = settle.count ? `<a class="it note unread" href="/settlements?check=1"><span class="ico">${ic('wallet', 16)}</span><span><b>${esc(settle.text)}</b><small>Did the expected money reach your bank? Tap to answer.</small></span><span class="t">Now</span><i class="dot" role="img" aria-label="Unread"></i></a>` : '';
      // meetings starting soon or waiting for a note (components/MeetingAlerts.jsx)
      const meet = ((typeof window !== 'undefined' && window.__gcMeet) || { items: [] }).items;
      const meetNotes = meet.map((m) => `<a class="it note unread" href="/meetings?id=${encodeURIComponent(m.id)}"><span class="ico">${ic('video', 16)}</span><span><b>${esc(m.t)}</b><small>${esc(m.d)}</small></span><span class="t">${esc(m.w)}</span><i class="dot" role="img" aria-label="Unread"></i></a>`).join('');
      const unread = this._unread + (settle.count ? 1 : 0) + meet.length;
      const notePop = `<div class="ph">${L('Notifications')} <button data-act="readall">${L('Mark all read')}</button></div>
        ${settleNote}${meetNotes}${(has('online') ? NOTES : RETAIL_NOTES).map((n, i) => { const un = n.u && i < this._unread; return `<a class="it note${un ? ' unread' : ''}" href="${routeOf(has('commerce') ? 'merchant-orders/MerchantOrders.dc.html' : 'merchant-inbox/MerchantInbox.dc.html')}"><span class="ico">${ic(n.i, 16)}</span><span><b>${n.t}</b><small>${n.d}</small></span><span class="t">${n.w}</span><i class="dot"${un ? ' role="img" aria-label="Unread"' : ' aria-hidden="true"'}></i></a>`; }).join('')}
        <a class="foot" href="${routeOf(has('comms') ? 'merchant-inbox/MerchantInbox.dc.html' : 'merchant-orders/MerchantOrders.dc.html')}">${L('View all notifications')}</a>`;
      // parts of Nayeem's proposal switched on (src/lib/proposal.js): say so, so a screenshot is never taken for today's build
      const pOn = proposalsOn().length;
      const pText = L('Proposal: {n} on').replace('{n}', pOn);
      const pChip = pOn ? `<a class="pchip" href="/dev/proposal" aria-label="${esc(pText)}" title="${L('Proposal switches')}">${ic('flask', 15)}<span class="pl">${esc(pText)}</span><span class="pn" aria-hidden="true">${pOn}</span></a>` : '';
      const me = currentUser(), myRole = roleOf(me), titles = roleTitles(me);
      // Messenger: the latest chats (lib/inbox.js); picking one opens it as a chat window on this page (ChatDock.jsx)
      const showChats = has('comms') && canSee(me, 'inbox');
      const chatN = showChats ? unreadCount(getConvs()) : 0;
      const chatPop = !showChats || o !== 'chats' ? '' : (() => {
        const all = getConvs();
        const list = recentConvs(this._chatF === 'unread' ? all.filter((c) => c.unread) : all, 10);
        const now = Date.now();
        const row = (c) => `<button class="it chat${c.unread ? ' unread' : ''}" data-chat="${esc(c.id)}"><span class="cav">${c.avatar ? `<img src="${esc(c.avatar)}" alt="" style="object-position:${esc(c.pos || '50% 30%')}">` : esc(initialsOf(c.name))}</span><span style="min-width:0"><b>${esc(c.name)}</b><small>${esc(channelName(c.ch))} · ${esc(lastLine(c))}</small></span><span class="side">${esc(agoText((c.messages[c.messages.length - 1] || { at: now }).at, now))}${c.unread ? `<i class="cdot" role="img" aria-label="${L('Unread')}"></i>` : ''}</span></button>`;
        const n = (k) => { const v = liveCount(k); return v ? `<b>${v}</b>` : ''; };
        return `<div class="ph">${L('Chats')} <a href="/merchant-inbox">${L('Open Inbox')}</a></div>
        <div class="chf" role="group" aria-label="${L('Show')}"><button data-chatf="all" class="${this._chatF !== 'unread' ? 'on' : ''}" aria-pressed="${this._chatF !== 'unread'}">${L('All')}</button><button data-chatf="unread" class="${this._chatF === 'unread' ? 'on' : ''}" aria-pressed="${this._chatF === 'unread'}">${L('Unread')}${chatN ? ' · ' + chatN : ''}</button></div>
        <div class="chl">${list.length ? list.map(row).join('') : `<p style="margin:12px 8px;font-size:var(--text-sm);color:var(--muted)">${L('No unread chats')}</p>`}</div>
        <div class="hr"></div>
        <div class="chq"><a href="/merchant-inbox?view=comments">${L('Comments')} ${n('comments')}</a><a href="/merchant-inbox?view=mentions">${L('Mentions')} ${n('mentions')}</a><a href="/support-tickets">${L('Support tickets')} <b>5</b></a></div>`;
      })();
      const plan = currentPlan();
      // the person's menu (role(s), edition, plan) with the "Set up" checks still to do; the area of this page
      const menu = navFor(me, { setup: this._setupList || [] });
      const here = pageArea();
      const hereSetup = (menu.flatMap((g) => g.items).find((it) => it.id === here && it.setup) || {}).setup;
      const hidden = later();
      const herePath = window.location.pathname.replace(/\/$/, '');
      // on the page that fixes it, the note stays without the button
      const onFix = hereSetup && hereSetup.href.split('?')[0] === herePath;
      const setupBar = hereSetup && !hidden.includes(hereSetup.id)
        ? `<div class="setup" role="status">${ic('alert', 16)}<span class="st">${esc(L(hereSetup.note))}</span>${onFix ? '' : `<a class="sgo" href="${esc(hereSetup.href)}">${esc(L(hereSetup.label))}</a>`}<button class="sx" data-act="setup-later" data-id="${esc(hereSetup.id)}" aria-label="${L('Hide for now')}" title="${L('Hide for now')}">${ic('x', 16)}</button></div>` : '';
      // start page choices: every page the person can open, by area (lib/team.js › landingChoices)
      const landing = landingOf(me.id);
      const landingOpts = `<option value=""${landing ? '' : ' selected'}>${L('My dashboard')}</option>` + landingChoices(me, menu).map((a) => `<optgroup label="${esc(L(a.area))}">${a.items.map((x) => `<option value="${esc(x.href)}"${x.href === landing ? ' selected' : ''}>${esc(L(x.label))}</option>`).join('')}</optgroup>`).join('');
      const mePop = `<div style="display:flex;align-items:center;gap:10px;padding:8px"><span class="av">${esc(me.initials)}<i></i></span><span><span class="mn" style="display:block">${esc(me.name)}</span><span class="mr" style="display:block;white-space:normal">${esc(titles.map((x) => L(x)).join(' + '))}</span><span class="mr">${esc(me.email)}</span></span></div>
        <div class="hr"></div>
        <button class="it only-phone" data-act="help"><span class="ico">${ic('help', 16)}</span><span><b>${L('Help')}</b><small>${L('Help for this page')}</small></span></button>
        <a class="it" href="/my-dashboard"><span class="ico">${ic('user', 16)}</span><span><b>${L('My dashboard')}</b><small>${L('Your tasks, numbers and team for today')}</small></span></a>
        <a class="it" href="/tasks"><span class="ico">${ic('check', 16)}</span><span><b>${L('My tasks')}</b></span></a>
        <a class="it" href="${routeOf('settings-console/SetSecurity.dc.html')}"><span class="ico">${ic('user', 16)}</span><span><b>${L('My profile')}</b><small>${L('Details, password and two-factor sign-in')}</small></span></a>
        <a class="it" href="${routeOf('settings-console/SetGeneral.dc.html')}"><span class="ico">${ic('gear', 16)}</span><span><b>${L('Store settings')}</b></span></a>
        ${has('online') ? `<a class="it only-narrow" href="${routeOf('storefront/Offers.dc.html')}"><span class="ico">${ic('store', 16)}</span><span><b>${L('View store')}</b></span></a>` : ''}
        ${has('commerce') ? `<a class="it only-narrow" href="${routeOf('order-detail/OrderDetail.dc.html')}"><span class="ico">${ic('receipt', 16)}</span><span><b>${L('Invoices')}</b></span></a>` : ''}
        <a class="it only-narrow" href="${routeOf('settings-console/SetMedia.dc.html')}"><span class="ico">${ic('folder', 16)}</span><span><b>${L('Files')}</b></span></a>
        <label class="it" style="cursor:default;align-items:center"><span class="ico">${ic('flag', 16)}</span><b style="white-space:nowrap">${L('Start page')}</b><select class="lsel" data-act="landing" aria-label="${L('Start page')}">${landingOpts}</select></label>
        <a class="it" href="/subscription"><span class="ico">${ic('store', 16)}</span><span><b>${esc(shopName())}</b><small>${esc(L(plan.name + ' plan'))} · ${esc(L(placesLine()))}</small></span><span class="t" style="color:#047857">${ic('check', 14, 2.5)}</span></a>
        <div class="it" style="cursor:default;align-items:center"><span class="ico">${ic('kb', 16)}</span><b>${L('Language')}</b><span class="seg" role="group" aria-label="${L('Language')}"><button data-lang="en" class="${locale === 'en' ? 'on' : ''}" aria-pressed="${locale === 'en'}">EN</button><button data-lang="bn" lang="bn" class="${locale === 'bn' ? 'on' : ''}" aria-pressed="${locale === 'bn'}">বাংলা</button></span></div>
        <div class="hr"></div>
        <a class="it" href="/set-profile"><span class="ico">${ic('user', 16)}</span><span><b>${L('Profile type')}</b><small>${L('Switch to a team member’s profile')}</small></span></a>
        <div class="hr"></div>
        <button class="it" data-act="signout" style="width:100%;text-align:left"><span class="ico" style="color:#c2410c">${ic('out', 16)}</span><span><b>${L('Sign out')}</b></span></button>`;
      this.root.innerHTML = `<style>${CSS}</style>
<div class="bar${dark ? ' dark' : ''}" role="banner" style="--h:${esc(a('height', '56'))}px">
  <button class="ib menu" data-act="nav" aria-label="${L('Open menu')}" aria-controls="gc-nav">${ic('menu', 20)}</button>
  <nav class="id" aria-label="Breadcrumb">${crumb ? `<span class="crumb">${esc(L(crumb))}</span><span class="sl" aria-hidden="true">/</span>` : ''}${title ? `<span class="here" aria-current="page">${esc(L(title))}</span>` : ''}</nav>
  <button class="helpbtn" data-act="help" aria-label="${L('Help for this page')}" title="${L('Help for this page')} (?)">${ic('help', 17)}<span>${L('Help')}</span></button>
  ${pChip}
  <div class="search wrap">
    <div class="field"><select class="scope" aria-label="${L('Search in')}"><option>${L('All')}</option><option>${L('Orders')}</option><option>${L('Products')}</option><option>${L('Customers')}</option><option>${L('Invoices')}</option></select>
      <span class="sic">${ic('search', 17)}</span><input type="search" placeholder="${esc(ph)}" aria-label="${L('Search')}" data-act="sfocus"><span class="kbd">⌘K</span>
      <button class="scanbtn" data-act="scan" ${exp('scan')} aria-label="${L('Scan a barcode')}">${ic('scan', 16)}<span class="lbl">${L('Scan')}</span></button></div>
    ${pop('search', searchPop, 'left:0;right:0')}${pop('scan', scanPop, 'right:0;width:340px')}
  </div>
  <div class="grp" role="group" aria-label="Quick access">
    <a class="ib" href="${routeOf('settings-console/SetGeneral.dc.html')}" aria-label="${L('Settings')}">${ic('gear')}<span class="tip">${L('Settings')}</span></a>
    ${has('commerce') ? `<span class="wrap"><button class="ib" data-act="inv" ${exp('inv')} aria-label="${L('Invoices')}">${ic('receipt')}<span class="tip">${L('Invoices')}</span></button>${pop('inv', invPop, 'right:-60px;width:330px')}</span>` : ''}
    <span class="wrap"><button class="ib" data-act="files" ${exp('files')} aria-label="${L('Files')}">${ic('folder')}<span class="tip">${L('Files')}</span></button>${pop('files', filesPop, 'right:-20px;width:340px')}</span>
  </div>
  <span class="sep" aria-hidden="true"></span>
  ${has('online') ? `<a class="store" href="${routeOf('storefront/Offers.dc.html')}" aria-label="View store (opens the storefront)">${ic('store', 16)}<span>${L('View store')}</span>${ic('ext', 13)}</a>` : ''}
  <button class="ib aibtn" data-act="gridai" aria-label="${L('Ask GridAI')}">${ic('sparkles')}</button>
  ${showChats ? `<span class="wrap"><button class="ib chatbtn" data-act="chats" ${exp('chats')} aria-label="${L('Chats')}${chatN ? ', ' + L('{n} unread').replace('{n}', chatN) : ''}">${ic('chat')}${chatN ? `<span class="badge chat-n">${chatN}</span>` : ''}<span class="tip">${L('Chats')}</span></button>${pop('chats', chatPop, 'right:-48px;width:360px')}</span>` : ''}
  <span class="wrap"><button class="ib" data-act="notes" ${exp('notes')} aria-label="${L('Notifications')}${unread ? ', ' + unread + ' unread' : ''}">${ic('bell')}${unread ? `<span class="badge">${unread}</span>` : ''}<span class="tip">${L('Notifications')}</span></button>${pop('notes', notePop, 'right:-8px;width:360px')}</span>
  <span class="wrap" style="margin-left:auto"><button class="me" data-act="me" ${exp('me')} aria-label="${L('Account menu')}, ${esc(me.name)}"><span class="av">${esc(me.initials)}<i></i></span><span class="mnm"><span class="mn" style="display:block">${esc(me.name)}</span><span class="mr">${esc(L(titles[0] || myRole.title))}${titles.length > 1 ? ' +' + (titles.length - 1) : ''}</span></span><span class="chev">${ic('chev', 16)}</span></button>${pop('me', mePop, 'right:0;width:300px')}</span>
</div>${setupBar}`;
      // phones: while a menu is open the page behind it doesn't scroll (a swipe moves the menu, not the page)
      try { document.documentElement.classList.toggle('gc-pop-open', !!o && window.matchMedia('(max-width: 640px)').matches); } catch { /* ignore */ }
      const on = (sel, ev, fn) => this.root.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn));
      on('[data-act="nav"]', 'click', () => window.dispatchEvent(new CustomEvent('gc:nav-toggle')));
      on('[data-act="scan"]', 'click', () => this.toggle('scan'));
      on('[data-act="inv"]', 'click', () => this.toggle('inv'));
      on('[data-act="files"]', 'click', () => this.toggle('files'));
      on('[data-act="notes"]', 'click', () => this.toggle('notes'));
      on('[data-act="chats"]', 'click', () => this.toggle('chats'));
      on('[data-chatf]', 'click', (e) => { this._chatF = e.currentTarget.getAttribute('data-chatf'); this.render(); });
      on('[data-chat]', 'click', (e) => {
        const id = e.currentTarget.getAttribute('data-chat');
        this._open = '';
        // on the Inbox the chat opens there; anywhere else as a chat window (components/inbox/ChatDock.jsx)
        if (window.location.pathname.replace(/\/$/, '') === '/merchant-inbox') navigate('/merchant-inbox?c=' + encodeURIComponent(id));
        else window.dispatchEvent(new CustomEvent('gc:chat-open', { detail: { id } }));
        this.render();
      });
      on('[data-act="me"]', 'click', () => this.toggle('me'));
      on('[data-act="help"]', 'click', () => { this._open = ''; this.render(); window.dispatchEvent(new CustomEvent('gc:help')); });
      on('[data-act="gridai"]', 'click', () => { this._open = ''; this.render(); window.dispatchEvent(new CustomEvent('gc:gridai', { detail: { q: '' } })); });
      on('[data-act="sfocus"]', 'focus', () => { if (this._open !== 'search') { this._open = 'search'; this.render(); const i = this.root.querySelector('input'); if (i) i.focus(); } });
      on('[data-act="readall"]', 'click', () => { this._unread = 0; this.render(); });
      on('[data-act="upload"]', 'click', () => { this.close(true); toast('Choose a file to upload', { tone: 'info' }); });
      on('[data-act="cam"]', 'click', () => { this._scanHit = true; this.render(); });
      on('[data-switch]', 'click', (e) => {
        const u = signInAs(e.currentTarget.getAttribute('data-switch'));
        this._open = '';
        toast(`Signed in as ${u.name} · ${roleOf(u).title}`, { tone: 'info' });
        navigate(homeOf(u));
      });
      on('[data-act="landing"]', 'change', (e) => {
        setLanding(me.id, e.currentTarget.value);
        toast(L('Start page saved'), { tone: 'success' });
      });
      on('[data-act="setup-later"]', 'click', (e) => {
        try { window.sessionStorage.setItem(LATER_KEY, JSON.stringify([...later(), e.currentTarget.getAttribute('data-id')])); } catch { /* ignore */ }
        this.render();
      });
      on('[data-act="signout"]', 'click', () => { this._open = ''; signOut(); navigate(routeOf('merchant-signin/MerchantSignIn.dc.html')); });
      on('[data-lang]', 'click', (e) => {
        const next = e.currentTarget.getAttribute('data-lang');
        if (next === getLocale()) return;
        setLocale(next); // re-renders the shell through the gc:locale event
        toast(t('Language set to English. The menu and top bar follow it; page content is English for now.', next), { tone: 'info' });
      });
    }
  }
  customElements.define('gc-topbar', GcTopbar);
}
