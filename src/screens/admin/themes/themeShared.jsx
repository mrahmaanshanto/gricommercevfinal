'use client';
// Storefront themes — what the Theme library, Theme, Templates, Assignments and Releases pages share: the CSS (classes
// thm-*), the data hook, the placeholder pictures and the action sheets that call lib/admin/themes.js.
//   useThemes()                          { db, t, data, ready } — platform stores + the themes store; runs due schedules
//   <Thumb item small />                 a CSS mock thumbnail (header bar, hero, product grid or order form) in the accent
//   <PreviewFrames item />               Desktop / Tablet / Phone frames drawing the item's sections as grey blocks
//   <StatusTag status />  <Chips items />  <PkgChips ids />  <ModChips codes />
//   <UploadSheet kind close onDone />    uploadItem (front end only: the .zip's name is kept; it appears as a Draft)
//   <EditSheet item close />             editItem (name, category, family, description, features, modules, packages, access)
//   <ReleaseSheet item close pick />     newRelease (new version, notes, rollout); `pick` lets the person choose the item
//   <DeprecateSheet item close />  <DisableSheet item close />      deprecate · setEnabled(false, reason)
//   <ChangeSheet shopId | themeId close />   assignStore, with a preview of what changes for the store
//   <MerchantEditing item />             which parts merchants may edit (Planned: UI only)
// Themes are a future module: no theme files are rendered and nothing is sent anywhere.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { useAdminStore } from '@/lib/admin/store';
import { TZ, dm, dmy, hm, daysBetween } from '@/lib/platform/util';
import { modulesOf } from '@/lib/admin/merchants';
import {
  themes, CATEGORIES, TEMPLATE_CATEGORIES, FAMILIES, PACKAGES, THEME_MODULES, TEAMS, EDITABLE, ROLLOUTS, STATUS_TONE,
  packageLabel, moduleName, sectionName, familyName, itemById, itemsOf, liveVersion, publishedVersions, releasesOf, statusOf,
  storesOn, templateUse, usageCount, onlineStores, packageOfShop, changePreview, cmpVer, bump, isSemver,
  uploadItem, editItem, newRelease, deprecate, setEnabled, assignStore, setEditable, runSchedule,
} from '@/lib/admin/themes';
import { usePlatform } from '../AdminShell';

export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
/** "Today 10:02" · "Yesterday 09:12" · "3 days ago" · "in 2 days" · "02 Sep" · "02 Sep 2025" */
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n === 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday ' + hm(ms);
  if (n === -1) return 'Tomorrow ' + hm(ms);
  if (n > 1 && n < 7) return n + ' days ago';
  if (n < -1 && n > -7) return `${dm(ms)} ${hm(ms)}`;
  return new Date(ms + TZ).getUTCFullYear() === new Date(t + TZ).getUTCFullYear() ? dm(ms) : dmy(ms);
}

/** Platform data + the themes store; scheduled releases go out when their time comes. */
export function useThemes() {
  const { db, t, live } = usePlatform();
  const { data, live: tl } = useAdminStore(themes);
  useEffect(() => { if (tl) runSchedule(); });
  return { db, t, data, ready: live && tl };
}

export const TH_CSS = `
.thm-muted{color:var(--text-muted)}
.thm-small{margin:0;font-size:var(--text-xs)}
.thm-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.thm-skel{height:360px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:thm-sk 1.4s ease infinite}
.thm-skel--sm{height:64px}
@keyframes thm-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.thm-skel{animation:none}}
.thm-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.thm-tools .ix-search{flex:1 1 220px;max-width:320px}
.thm-tools .gc-select{width:auto;min-width:160px}
/* the placeholder thumbnail */
.thm-thumb{--a:#2e559d;position:relative;display:flex;flex-direction:column;gap:6px;width:100%;aspect-ratio:4/3;padding:10px;border-radius:var(--radius-lg);background:color-mix(in srgb,var(--a) 9%,var(--surface-card));box-shadow:inset 0 0 0 1px var(--border-subtle);overflow:hidden}
.thm-thumb__bar{flex:0 0 10%;display:flex;align-items:center;gap:6px;min-height:0}
.thm-thumb__logo{flex:none;width:18%;height:70%;border-radius:var(--radius-full);background:var(--a)}
.thm-thumb__nav{flex:1;height:40%;border-radius:var(--radius-full);background:color-mix(in srgb,var(--a) 22%,transparent)}
.thm-thumb__hero{flex:0 0 34%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:5px;min-height:0;padding:0 8%;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--a),color-mix(in srgb,var(--a) 45%,#fff))}
.thm-thumb__hero--low{flex-basis:22%}
.thm-thumb__hero--big{flex:1 1 auto}
.thm-thumb__line{display:block;width:55%;height:6px;border-radius:var(--radius-full);background:rgba(255,255,255,.85)}
.thm-thumb__line--short{width:35%;opacity:.7}
.thm-thumb__btn{display:block;width:26%;height:8px;border-radius:var(--radius-full);background:#fff}
.thm-thumb__grid{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;min-height:0}
.thm-thumb__grid--dense{grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
.thm-thumb__grid span{border-radius:var(--radius-sm);background:linear-gradient(to bottom,var(--surface-card) 62%,color-mix(in srgb,var(--a) 16%,var(--surface-card)) 62%);box-shadow:0 0 0 1px color-mix(in srgb,var(--a) 14%,transparent)}
.thm-thumb__form{flex:0 0 32%;display:flex;flex-direction:column;justify-content:center;gap:4px;min-height:0;padding:0 12%}
.thm-thumb__form span{display:block;height:7px;border-radius:var(--radius-sm);background:var(--surface-card);box-shadow:0 0 0 1px color-mix(in srgb,var(--a) 22%,transparent)}
.thm-thumb__form .thm-thumb__btn{width:100%;height:9px;background:var(--a);box-shadow:none}
.thm-thumb--sm{gap:3px;padding:4px;border-radius:var(--radius-md)}
.thm-thumb--sm .thm-thumb__line,.thm-thumb--sm .thm-thumb__line--short{height:2px}
.thm-thumb--sm .thm-thumb__btn{height:3px}
.thm-thumb--sm .thm-thumb__grid,.thm-thumb--sm .thm-thumb__form{gap:2px}
.thm-thumb--sm .thm-thumb__form span{height:3px}
.thm-thumb--sm .thm-thumb__bar{gap:3px}
.thm-thumb__ph{position:absolute;right:6px;bottom:6px;padding:0 6px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--surface-card) 85%,transparent);font-size:var(--text-xs);color:var(--text-muted)}
/* card grid */
.thm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:var(--space-4);padding:var(--space-4)}
.thm-card{display:flex;flex-direction:column;gap:var(--space-2);width:100%;min-width:0;padding:var(--space-2) var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);font:inherit;color:inherit;text-align:left;text-decoration:none;cursor:pointer;transition:var(--transition-colors)}
.thm-card:hover{border-color:var(--border-strong)}
.thm-card:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.thm-card__body{display:flex;flex-direction:column;gap:6px;min-width:0;padding:0 var(--space-1)}
.thm-card__top{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-2);min-width:0}
.thm-card__name{min-width:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.thm-card__meta{font-size:var(--text-xs);color:var(--text-muted)}
.thm-card__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px var(--space-2);font-size:var(--text-xs);color:var(--text-body)}
.thm-chips{display:flex;flex-wrap:wrap;gap:4px;margin:0;padding:0;list-style:none}
.thm-chip{display:inline-flex;align-items:center;gap:4px;min-height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.thm-chip--soft{background:var(--fill-primary-soft);color:var(--primary)}
/* device preview */
.thm-seg{display:inline-flex;gap:2px;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.thm-seg__b{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.thm-seg__b[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.thm-seg__b:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.thm-stage{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);margin:var(--space-3) 0 0;padding:var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.thm-stage figcaption{align-self:stretch;text-align:center}
.thm-dev{--a:#2e559d;width:100%;border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-card);overflow:hidden}
.thm-dev--desktop{max-width:680px}
.thm-dev--tablet{max-width:420px;border-radius:var(--radius-xl)}
.thm-dev--phone{max-width:230px;border-radius:var(--radius-2xl)}
.thm-dev__chrome{display:flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle)}
.thm-dev__chrome>i{width:7px;height:7px;border-radius:var(--radius-full);background:var(--border-strong)}
.thm-dev--phone .thm-dev__chrome{justify-content:center}
.thm-dev--phone .thm-dev__chrome>i{width:44px;height:6px}
.thm-dev__url{flex:1;margin-left:8px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.thm-dev__page{display:flex;flex-direction:column;gap:8px;max-height:460px;padding:8px;overflow:auto}
.thm-ms{position:relative;display:flex;gap:6px;border-radius:var(--radius-md)}
.thm-ms__tag{position:absolute;top:4px;left:4px;z-index:1;padding:0 6px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--surface-card) 88%,transparent);font-size:var(--text-xs);color:var(--text-muted);pointer-events:none}
.thm-dev--phone .thm-ms__tag{display:none}
.thm-ms--announce{justify-content:center;align-items:center;height:16px;background:var(--a)}
.thm-ms--announce i{width:30%;height:4px;border-radius:var(--radius-full);background:rgba(255,255,255,.8)}
.thm-ms--header{align-items:center;height:30px;padding:0 6px;box-shadow:inset 0 -1px 0 var(--border-subtle)}
.thm-ms--header b{width:52px;height:12px;border-radius:var(--radius-full);background:var(--a)}
.thm-ms--header i{width:34px;height:6px;border-radius:var(--radius-full);background:var(--border-subtle)}
.thm-ms--header .thm-ms__sp{flex:1}
.thm-ms--hero{flex-direction:column;justify-content:center;gap:8px;min-height:120px;padding:0 8%;background:linear-gradient(135deg,var(--a),color-mix(in srgb,var(--a) 45%,#fff))}
.thm-dev--phone .thm-ms--hero{min-height:110px}
.thm-ms--hero i{display:block;width:50%;height:10px;border-radius:var(--radius-full);background:rgba(255,255,255,.9)}
.thm-ms--hero i+i{width:34%;height:6px;opacity:.75}
.thm-ms--hero b{display:block;width:84px;height:18px;border-radius:var(--radius-full);background:#fff}
.thm-ms--categories{justify-content:space-around;padding:8px 0}
.thm-ms--categories i{width:38px;height:38px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--a) 18%,var(--surface-card))}
.thm-ms--grid,.thm-ms--reviews,.thm-ms--countdown{display:grid;gap:8px}
.thm-ms--grid{grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));padding-top:22px}
.thm-ms--grid>span{display:flex;flex-direction:column;gap:4px}
.thm-ms--grid>span>b{aspect-ratio:1;border-radius:var(--radius-md);background:color-mix(in srgb,var(--a) 10%,var(--surface-subtle))}
.thm-ms--grid>span>i{height:5px;border-radius:var(--radius-full);background:var(--border-subtle)}
.thm-ms--grid>span>i+i{width:50%;background:color-mix(in srgb,var(--a) 40%,transparent)}
.thm-ms--spec{flex-direction:column;gap:0;padding-top:22px}
.thm-ms--spec>i{display:flex;height:16px;border-top:1px solid var(--border-subtle);background:linear-gradient(to right,var(--surface-subtle) 35%,transparent 35%)}
.thm-ms--banner{align-items:center;height:56px;padding:0 6%;background:color-mix(in srgb,var(--a) 16%,var(--surface-card))}
.thm-ms--banner i{width:40%;height:8px;border-radius:var(--radius-full);background:var(--a)}
.thm-ms--reviews{grid-template-columns:repeat(var(--rcols,3),minmax(0,1fr));padding-top:22px}
.thm-ms--reviews>span{display:flex;flex-direction:column;gap:4px;padding:8px;border-radius:var(--radius-md);box-shadow:inset 0 0 0 1px var(--border-subtle)}
.thm-ms--reviews>span>b{width:50%;height:5px;border-radius:var(--radius-full);background:var(--text-warning)}
.thm-ms--reviews>span>i{height:4px;border-radius:var(--radius-full);background:var(--border-subtle)}
.thm-ms--countdown{grid-template-columns:repeat(4,minmax(0,40px));justify-content:center;padding:22px 0 6px}
.thm-ms--countdown>i{aspect-ratio:1;border-radius:var(--radius-md);background:color-mix(in srgb,var(--a) 85%,#000)}
.thm-ms--form{flex-direction:column;gap:6px;padding:22px 12% 8px}
.thm-ms--form>i{height:18px;border-radius:var(--radius-sm);box-shadow:inset 0 0 0 1px var(--border-strong)}
.thm-ms--form>b{height:22px;border-radius:var(--radius-sm);background:var(--a)}
.thm-ms--footer{display:grid;grid-template-columns:repeat(var(--fcols,3),minmax(0,1fr));gap:8px;padding:14px;background:color-mix(in srgb,var(--a) 60%,#0f172a)}
.thm-ms--footer>span{display:flex;flex-direction:column;gap:5px}
.thm-ms--footer i{height:4px;border-radius:var(--radius-full);background:rgba(255,255,255,.35)}
.thm-ms--footer i:first-child{width:60%;background:rgba(255,255,255,.7)}
/* lists and forms */
.thm-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.thm-row:first-child{border-top:0}
.thm-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.thm-row__main b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.thm-row__main small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.thm-row__end{flex:none;display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:var(--space-2)}
.thm-empty{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.thm-sec{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.thm-form{display:flex;flex-direction:column;gap:var(--space-3)}
.thm-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.thm-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.thm-note{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.thm-note--warn{background:var(--fill-warning-soft);color:var(--text-heading)}
.thm-checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px var(--space-3);margin:0;padding:0;border:0}
.thm-checks legend{margin-bottom:6px;padding:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.thm-check{display:flex;align-items:center;gap:var(--space-2);min-height:28px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.thm-check input{flex:none;width:16px;height:16px;margin:0;accent-color:var(--primary)}
.thm-check.is-off{color:var(--text-muted);cursor:not-allowed}
.thm-radios{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;border:0}
.thm-radios legend{margin-bottom:6px;padding:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.thm-file{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.thm-file span{min-width:0;font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-body);overflow-wrap:anywhere}
.thm-verbtns{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.thm-scroll{max-height:220px;overflow:auto;padding:6px 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.thm-scroll .thm-checks{grid-template-columns:minmax(0,1fr)}
.thm-cmp{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:var(--space-3)}
.thm-cmp>div{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:var(--text-xs);color:var(--text-muted)}
.thm-cmp b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.thm-diff{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:var(--text-sm);color:var(--text-body)}
.thm-diff li{display:flex;gap:var(--space-2);align-items:baseline}
.thm-diff__s{flex:none;width:14px;font-family:var(--font-data);font-weight:var(--weight-semibold);text-align:center}
.thm-diff__s.is-add{color:var(--text-success)}.thm-diff__s.is-del{color:var(--text-danger)}.thm-diff__s.is-keep{color:var(--text-muted)}
.thm-switch{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;padding:4px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading)}
.thm-switch:first-child{border-top:0}
.thm-headact{display:inline-flex;align-items:center;gap:var(--space-1)}
@media (max-width:640px){
  .thm-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-3);padding:var(--space-3)}
  .thm-two,.thm-checks{grid-template-columns:minmax(0,1fr)}
  .thm-tools .ix-search{max-width:none}
  .thm-tools .gc-select{flex:1 1 140px;min-width:0}
  .thm-stage{padding:var(--space-2)}
  .thm-seg__b{height:36px}
  .thm-cmp{grid-template-columns:minmax(0,1fr)}
  .thm-cmp>svg{transform:rotate(90deg);justify-self:center}
}
`;

export function Skeleton({ label = 'Loading', header }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label}>
      {header}
      <div className="thm-skel thm-skel--sm" />
      <div className="thm-skel" />
    </div>
  );
}

export function StatusTag({ status }) { return <StatusBadge tone={STATUS_TONE[status] || 'neutral'}>{status}</StatusBadge>; }
export function Chips({ items, soft, inline }) {
  if (!items || !items.length) return <span className="thm-muted">—</span>;
  const cls = 'thm-chip' + (soft ? ' thm-chip--soft' : '');
  // inline: inside a button, where a list is not allowed
  if (inline) return <span className="thm-chips">{items.map((x) => <span key={x} className={cls}>{x}</span>)}</span>;
  return <ul className="thm-chips">{items.map((x) => <li key={x} className={cls}>{x}</li>)}</ul>;
}
export const PkgChips = ({ ids }) => <Chips items={PACKAGES.filter((p) => ids.includes(p.id)).map((p) => p.label)} />;
export const ModChips = ({ codes }) => <Chips items={codes.map(moduleName)} />;
export function Row({ title, sub, end }) {
  return (
    <div className="thm-row">
      <span className="thm-row__main"><b>{title}</b>{sub ? <small>{sub}</small> : null}</span>
      {end ? <span className="thm-row__end">{end}</span> : null}
    </div>
  );
}

// ---- placeholder pictures ------------------------------------------------------------------------------------------
const isLanding = (item) => item.kind === 'template' || item.category === 'Landing page' || item.category === 'Single product';
const isDense = (item) => ['Grocery', 'Multi-product store', 'General e-commerce'].includes(item.category);

/** A mock thumbnail in the item's accent: header bar, hero, then a product grid (or an order form for one-page items). */
export function Thumb({ item, small, label }) {
  const landing = isLanding(item);
  const dense = isDense(item);
  return (
    <span className={'thm-thumb' + (small ? ' thm-thumb--sm' : '')} style={{ '--a': item.accent }} aria-hidden="true">
      <span className="thm-thumb__bar"><span className="thm-thumb__logo" /><span className="thm-thumb__nav" /></span>
      {landing ? (
        <>
          <span className="thm-thumb__hero thm-thumb__hero--big"><span className="thm-thumb__line" /><span className="thm-thumb__line thm-thumb__line--short" /></span>
          <span className="thm-thumb__form"><span /><span /><span className="thm-thumb__btn" /></span>
        </>
      ) : (
        <>
          <span className={'thm-thumb__hero' + (dense ? ' thm-thumb__hero--low' : '')}><span className="thm-thumb__line" /><span className="thm-thumb__btn" /></span>
          <span className={'thm-thumb__grid' + (dense ? ' thm-thumb__grid--dense' : '')}>{Array.from({ length: dense ? 8 : 3 }).map((_, i) => <span key={i} />)}</span>
        </>
      )}
      {label ? <span className="thm-thumb__ph">{label}</span> : null}
    </span>
  );
}

const DEVICES = [['desktop', 'Desktop', 'monitor'], ['tablet', 'Tablet', 'tablet'], ['phone', 'Phone', 'smartphone']];
const COLS = { desktop: 4, tablet: 3, phone: 2 };

function MockSection({ kind, dev }) {
  const cols = COLS[dev];
  const tag = <span className="thm-ms__tag">{sectionName(kind)}</span>;
  switch (kind) {
    case 'announce': return <div className="thm-ms thm-ms--announce"><i /></div>;
    case 'header': return <div className="thm-ms thm-ms--header"><b />{dev === 'phone' ? <span className="thm-ms__sp" /> : <><i /><i /><i /><span className="thm-ms__sp" /></>}<i /></div>;
    case 'hero': return <div className="thm-ms thm-ms--hero"><i /><i /><b /></div>;
    case 'categories': return <div className="thm-ms thm-ms--categories">{Array.from({ length: dev === 'phone' ? 4 : 6 }).map((_, k) => <i key={k} />)}</div>;
    case 'grid': return <div className="thm-ms thm-ms--grid" style={{ '--cols': cols }}>{tag}{Array.from({ length: cols * 2 }).map((_, k) => <span key={k}><b /><i /><i /></span>)}</div>;
    case 'spec': return <div className="thm-ms thm-ms--spec">{tag}{Array.from({ length: 5 }).map((_, k) => <i key={k} />)}</div>;
    case 'banner': return <div className="thm-ms thm-ms--banner"><i /></div>;
    case 'reviews': return <div className="thm-ms thm-ms--reviews" style={{ '--rcols': dev === 'phone' ? 1 : 3 }}>{tag}{Array.from({ length: dev === 'phone' ? 2 : 3 }).map((_, k) => <span key={k}><b /><i /><i /></span>)}</div>;
    case 'countdown': return <div className="thm-ms thm-ms--countdown">{tag}<i /><i /><i /><i /></div>;
    case 'form': return <div className="thm-ms thm-ms--form">{tag}<i /><i /><i /><b /></div>;
    case 'footer': return <div className="thm-ms thm-ms--footer" style={{ '--fcols': dev === 'phone' ? 2 : 3 }}>{Array.from({ length: dev === 'phone' ? 2 : 3 }).map((_, k) => <span key={k}><i /><i /><i /></span>)}</div>;
    default: return null;
  }
}

/** Desktop / Tablet / Phone frames with the item's sections drawn as blocks. Nothing is rendered from theme files. */
export function PreviewFrames({ item }) {
  const [dev, setDev] = useState('desktop');
  const host = item.kind === 'template' ? 'yourstore.com.bd/offer' : 'yourstore.gridcommerce.shop';
  return (
    <div>
      <div className="thm-seg" role="group" aria-label="Preview size">
        {DEVICES.map(([k, l, ic]) => (
          <button key={k} type="button" className="thm-seg__b" aria-pressed={dev === k} onClick={() => setDev(k)}>
            <Icon name={ic} width="16" height="16" aria-hidden="true" />{l}
          </button>
        ))}
      </div>
      <figure className="thm-stage">
        <div className={'thm-dev thm-dev--' + dev} style={{ '--a': item.accent }} aria-hidden="true">
          <div className="thm-dev__chrome">{dev === 'phone' ? <i /> : <><i /><i /><i /><span className="thm-dev__url">{host}</span></>}</div>
          <div className="thm-dev__page">{item.sections.map((s) => <MockSection key={s} kind={s} dev={dev} />)}</div>
        </div>
        <figcaption className="thm-small thm-muted">
          Placeholder preview on a {dev}: themes are not rendered yet. Sections: {item.sections.map(sectionName).join(' · ')}.
        </figcaption>
      </figure>
    </div>
  );
}

// ---- form parts ----------------------------------------------------------------------------------------------------
export function Field({ id, label, error, hint, children }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });
const errOf = (err, f) => (err && err.field === f ? err.text : null);
const fieldFor = (text, map) => { for (const [re, f] of map) if (re.test(text || '')) return f; return 'form'; };

export function FormSheet({ id, title, close, onSubmit, submit, danger, error, children }) {
  return (
    <Sheet open title={title} onClose={close} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
        <button type="submit" form={id} className={'gc-btn ' + (danger ? 'gc-btn--error' : 'gc-btn--solid')}>{submit}</button>
      </>
    )}>
      <form id={id} className="thm-form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {children}
        {error && error.field === 'form' ? <p className="thm-formerr" role="alert">{error.text}</p> : null}
      </form>
    </Sheet>
  );
}

/** A group of checkboxes. options: [[value, label, disabled?]] */
export function Checks({ legend, options, value, onChange, error, cols }) {
  const flip = (k) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <fieldset className="thm-checks" style={cols === 1 ? { gridTemplateColumns: 'minmax(0,1fr)' } : undefined}>
      {legend ? <legend>{legend}</legend> : null}
      {options.map(([k, l, off]) => (
        <label key={k} className={'thm-check' + (off ? ' is-off' : '')}>
          <input type="checkbox" checked={value.includes(k)} disabled={!!off} onChange={() => flip(k)} />
          <span>{l}</span>
        </label>
      ))}
      {error ? <p className="gc-help gc-help--error" role="alert" style={{ gridColumn: '1/-1' }}>{error}</p> : null}
    </fieldset>
  );
}

const MOD_OPTS = THEME_MODULES.map((c) => [c, `${moduleName(c)} · ${c}`]);
const PKG_OPTS = PACKAGES.map((p) => [p.id, p.label]);

// ---- upload ----------------------------------------------------------------------------------------------------------
/** Upload a theme or a landing page template. Front end only: the zip is not read, its name is kept. */
export function UploadSheet({ kind = 'theme', close, onDone }) {
  const tpl = kind === 'template';
  const [f, setF] = useState({ name: '', category: '', family: '', version: '1.0.0', file: '', tagline: '', modules: tpl ? ['M12'] : ['M06', 'M02'], packages: ['online-growth', 'online-business', 'online-enterprise'] });
  const [err, setErr] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e && e.target ? e.target.value : e }); };
  const submit = () => {
    const r = uploadItem({ ...f, kind });
    if (!r.ok) { setErr({ field: fieldFor(r.error, [[/name|called/i, 'name'], [/category/i, 'category'], [/version/i, 'version'], [/zip|file/i, 'file'], [/package/i, 'packages']]), text: r.error }); return; }
    toast(`${f.name.trim()} uploaded as a draft`);
    close();
    if (onDone) onDone(r.id);
  };
  return (
    <FormSheet id="thm-up" title={tpl ? 'Upload template' : 'Upload theme'} close={close} onSubmit={submit} submit="Upload" error={err}>
      <p className="thm-note">It is saved as a Draft. Send it for review on <Link href="/admin/themes/releases">Releases</Link>; a second person approves it before any store can use it.</p>
      <Field id="thm-up-n" label="Name" error={errOf(err, 'name')}>
        <input id="thm-up-n" {...ctl(errOf(err, 'name'))} value={f.name} onChange={set('name')} autoComplete="off" />
      </Field>
      <div className="thm-two">
        <Field id="thm-up-c" label="Category" error={errOf(err, 'category')}>
          <select id="thm-up-c" {...ctl(errOf(err, 'category'), true)} value={f.category} onChange={set('category')}>
            <option value="">Choose</option>
            {(tpl ? TEMPLATE_CATEGORIES : CATEGORIES).map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="thm-up-v" label="Version" error={errOf(err, 'version')} hint="Three numbers, like 1.0.0">
          <input id="thm-up-v" {...ctl(errOf(err, 'version'))} className={ctl(errOf(err, 'version')).className + ' thm-data'} value={f.version} onChange={set('version')} inputMode="decimal" autoComplete="off" />
        </Field>
      </div>
      {tpl ? null : (
        <Field id="thm-up-f" label="Family" hint="The family on gridcommerce.net/themes, if it belongs to one">
          <select id="thm-up-f" {...ctl(null, true)} value={f.family} onChange={set('family')}>
            <option value="">No family</option>
            {FAMILIES.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.label}</option>)}
          </select>
        </Field>
      )}
      <div className="gc-field">
        <span className="gc-label" id="thm-up-z">{tpl ? 'Template' : 'Theme'} file (.zip)</span>
        <div className="thm-file">
          <button type="button" className="ix-btn ix-btn--sm" aria-describedby="thm-up-z" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="file-up" width="16" height="16" aria-hidden="true" />Choose file</button>
          <span>{f.file || 'No file chosen'}</span>
          <input ref={fileRef} type="file" accept=".zip,application/zip" hidden onChange={(e) => { const x = e.target.files && e.target.files[0]; setErr(null); setF({ ...f, file: x ? x.name : '' }); e.target.value = ''; }} />
        </div>
        {errOf(err, 'file') ? <p className="gc-help gc-help--error" role="alert">{errOf(err, 'file')}</p> : <p className="gc-help">Only the file name is kept in this demo.</p>}
      </div>
      <Field id="thm-up-t" label="Short description">
        <input id="thm-up-t" {...ctl(null)} value={f.tagline} onChange={set('tagline')} />
      </Field>
      <Checks legend="Works with modules" options={MOD_OPTS} value={f.modules} onChange={(v) => setF({ ...f, modules: v })} />
      <Checks legend="Offered on packages" options={PKG_OPTS} value={f.packages} onChange={(v) => { setErr(null); setF({ ...f, packages: v }); }} error={errOf(err, 'packages')} />
    </FormSheet>
  );
}

// ---- edit info -------------------------------------------------------------------------------------------------------
export function EditSheet({ item, close }) {
  const tpl = item.kind === 'template';
  const [f, setF] = useState({
    name: item.name, category: item.category, family: item.family || '', tagline: item.tagline, features: item.features.join('\n'),
    modules: [...item.modules], packages: [...item.packages], edit: [...item.access.edit], publish: [...item.access.publish],
  });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const submit = () => {
    const r = editItem(item.id, {
      name: f.name, category: f.category, family: tpl ? undefined : f.family, tagline: f.tagline, features: f.features.split('\n'),
      modules: f.modules, packages: f.packages, access: { edit: f.edit, publish: f.publish },
    });
    if (!r.ok) { setErr({ field: fieldFor(r.error, [[/name|called/i, 'name'], [/package/i, 'packages'], [/team/i, 'access']]), text: r.error }); return; }
    toast(r.changed.length ? 'Details saved' : 'Nothing changed');
    close();
  };
  return (
    <FormSheet id="thm-edit" title={`Edit ${item.name}`} close={close} onSubmit={submit} submit="Save" error={err}>
      <Field id="thm-e-n" label="Name" error={errOf(err, 'name')}>
        <input id="thm-e-n" {...ctl(errOf(err, 'name'))} value={f.name} onChange={set('name')} autoComplete="off" />
      </Field>
      <div className="thm-two">
        <Field id="thm-e-c" label="Category">
          <select id="thm-e-c" {...ctl(null, true)} value={f.category} onChange={set('category')}>{(tpl ? TEMPLATE_CATEGORIES : CATEGORIES).map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        {tpl ? null : (
          <Field id="thm-e-f" label="Family">
            <select id="thm-e-f" {...ctl(null, true)} value={f.family} onChange={set('family')}>
              <option value="">No family</option>
              {FAMILIES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </Field>
        )}
      </div>
      <Field id="thm-e-t" label="Short description">
        <input id="thm-e-t" {...ctl(null)} value={f.tagline} onChange={set('tagline')} />
      </Field>
      <Field id="thm-e-x" label="Features" hint="One per line">
        <textarea id="thm-e-x" className="gc-input" rows={4} value={f.features} onChange={set('features')} />
      </Field>
      <Checks legend="Works with modules" options={MOD_OPTS} value={f.modules} onChange={(v) => setF({ ...f, modules: v })} />
      <Checks legend="Offered on packages" options={PKG_OPTS} value={f.packages} onChange={(v) => { setErr(null); setF({ ...f, packages: v }); }} error={errOf(err, 'packages')} />
      <div className="thm-two">
        <Checks legend="Who can edit" options={TEAMS.map((x) => [x, x])} value={f.edit} onChange={(v) => { setErr(null); setF({ ...f, edit: v }); }} cols={1} />
        <Checks legend="Who can publish" options={TEAMS.map((x) => [x, x])} value={f.publish} onChange={(v) => { setErr(null); setF({ ...f, publish: v }); }} cols={1} error={errOf(err, 'access')} />
      </div>
    </FormSheet>
  );
}

// ---- release an update -------------------------------------------------------------------------------------------------
/** A new version into the workflow (straight to review). pick = choose the theme or template first. */
export function ReleaseSheet({ item: given, close, pick }) {
  const { db, data } = useThemes();
  const choices = itemsOf(data).filter((i) => i.state !== 'disabled');
  const [itemId, setItemId] = useState(given ? given.id : '');
  const item = itemId ? itemById(data, itemId) : null;
  const top = item ? releasesOf(data, item.id).map((r) => r.version)[0] : null;
  const live = item ? liveVersion(data, item.id) : null;
  const [f, setF] = useState({ version: top ? bump(top, 'minor') : '1.0.0', notes: '', rollout: 'next-visit', stores: [] });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const using = item ? (item.kind === 'theme' ? storesOn(data, db, item.id).map((s) => [s.shop.id, `${s.shop.name} · ${s.version}`]) : templateUse(data, db, item.id).map((u) => [u.shop.id, `${u.shop.name} · ${plural(u.pages.length, 'page')}`])) : [];
  const pickItem = (e) => {
    const id = e.target.value;
    setItemId(id); setErr(null);
    const t2 = id ? releasesOf(data, id).map((r) => r.version)[0] : null;
    setF({ ...f, version: t2 ? bump(t2, 'minor') : '1.0.0', stores: [] });
  };
  const submit = () => {
    if (!item) { setErr({ field: 'item', text: 'Choose a theme or template.' }); return; }
    const r = newRelease(item.id, { version: f.version, notes: f.notes, rollout: f.rollout, stores: f.stores, submit: true });
    if (!r.ok) { setErr({ field: fieldFor(r.error, [[/version|higher/i, 'version'], [/changed/i, 'notes'], [/stores/i, 'stores']]), text: r.error }); return; }
    toast(`${item.name} ${f.version.trim()} sent for review`);
    close();
  };
  return (
    <FormSheet id="thm-rel" title={item && !pick ? `Release update · ${item.name}` : 'New release'} close={close} onSubmit={submit} submit="Send for review" error={err}>
      <p className="thm-note">A second person (Technical ops) approves it on <Link href="/admin/themes/releases">Releases</Link> before it reaches any store.</p>
      {pick ? (
        <Field id="thm-rel-i" label="Theme or template" error={errOf(err, 'item')}>
          <select id="thm-rel-i" {...ctl(errOf(err, 'item'), true)} value={itemId} onChange={pickItem}>
            <option value="">Choose</option>
            <optgroup label="Themes">{choices.filter((i) => i.kind === 'theme').map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</optgroup>
            <optgroup label="Landing page templates">{choices.filter((i) => i.kind === 'template').map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</optgroup>
          </select>
        </Field>
      ) : null}
      {item ? (
        <>
          <Field id="thm-rel-v" label="New version" error={errOf(err, 'version')} hint={live ? `Live now: ${live}${top && top !== live ? ` · highest so far ${top}` : ''}` : 'Not published yet'}>
            <input id="thm-rel-v" {...ctl(errOf(err, 'version'))} className={ctl(errOf(err, 'version')).className + ' thm-data'} value={f.version} onChange={set('version')} autoComplete="off" />
          </Field>
          {top ? (
            <div className="thm-verbtns" role="group" aria-label="Suggested versions">
              {[['patch', 'Fix'], ['minor', 'Feature'], ['major', 'Big change']].map(([p, l]) => (
                <button key={p} type="button" className="ix-btn ix-btn--sm" aria-pressed={f.version === bump(top, p)} onClick={() => { setErr(null); setF({ ...f, version: bump(top, p) }); }}>{l} · <span className="thm-data">{bump(top, p)}</span></button>
              ))}
            </div>
          ) : null}
          <Field id="thm-rel-n" label="Release notes" error={errOf(err, 'notes')} hint="What changed, in plain words: merchants see this">
            <textarea id="thm-rel-n" className={'gc-input' + (errOf(err, 'notes') ? ' gc-input--error' : '')} rows={3} value={f.notes} onChange={set('notes')} />
          </Field>
          <fieldset className="thm-radios">
            <legend>How it reaches the {item.kind === 'theme' ? 'stores' : 'pages'}</legend>
            {ROLLOUTS.map(([k, l]) => (
              <label key={k} className="thm-check"><input type="radio" name="thm-rel-r" checked={f.rollout === k} onChange={() => { setErr(null); setF({ ...f, rollout: k }); }} /><span>{l}</span></label>
            ))}
          </fieldset>
          {f.rollout === 'selected' ? (
            using.length ? (
              <div className="thm-scroll"><Checks legend={`Stores (${f.stores.length} of ${using.length})`} options={using} value={f.stores} onChange={(v) => { setErr(null); setF({ ...f, stores: v }); }} error={errOf(err, 'stores')} cols={1} /></div>
            ) : <p className="thm-note thm-note--warn">No store uses it yet, so there is nobody to select.</p>
          ) : null}
        </>
      ) : null}
    </FormSheet>
  );
}

// ---- deprecate / disable -------------------------------------------------------------------------------------------------
export function DeprecateSheet({ item, close }) {
  const { db, data } = useThemes();
  const options = itemsOf(data, item.kind).filter((i) => i.id !== item.id && i.state === 'active' && liveVersion(data, i.id));
  const using = usageCount(data, db, item);
  const [f, setF] = useState({ reason: '', replacement: '', moveStores: false });
  const [err, setErr] = useState(null);
  const submit = () => {
    const r = deprecate(item.id, f);
    if (!r.ok) { setErr({ field: fieldFor(r.error, [[/why/i, 'reason'], [/replace|choose|published/i, 'replacement']]), text: r.error }); return; }
    toast(`${item.name} deprecated${r.moved ? ` · ${plural(r.moved, 'store')} moved` : ''}`);
    close();
  };
  return (
    <FormSheet id="thm-dep" title={`Deprecate ${item.name}`} close={close} onSubmit={submit} submit="Deprecate" danger error={err}>
      <p className="thm-note">New stores can no longer pick it. {using ? `${plural(using, 'store')} using it keep it until they change, and are shown the replacement.` : 'No store uses it now.'}</p>
      <Field id="thm-dep-r" label="Reason" error={errOf(err, 'reason')}>
        <textarea id="thm-dep-r" className={'gc-input' + (errOf(err, 'reason') ? ' gc-input--error' : '')} rows={2} value={f.reason} onChange={(e) => { setErr(null); setF({ ...f, reason: e.target.value }); }} />
      </Field>
      <Field id="thm-dep-x" label={`Replacement ${item.kind}`} error={errOf(err, 'replacement')}>
        <select id="thm-dep-x" {...ctl(errOf(err, 'replacement'), true)} value={f.replacement} onChange={(e) => { setErr(null); setF({ ...f, replacement: e.target.value }); }}>
          <option value="">Choose</option>
          {options.map((i) => <option key={i.id} value={i.id}>{i.name} · {liveVersion(data, i.id)}</option>)}
        </select>
      </Field>
      {item.kind === 'theme' && using ? (
        <label className="thm-check"><input type="checkbox" checked={f.moveStores} onChange={(e) => setF({ ...f, moveStores: e.target.checked })} /><span>Move the {plural(using, 'store')} to the replacement now</span></label>
      ) : null}
    </FormSheet>
  );
}

export function DisableSheet({ item, close }) {
  const { db, data } = useThemes();
  const using = usageCount(data, db, item);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState(null);
  const submit = () => {
    const r = setEnabled(item.id, false, reason);
    if (!r.ok) { setErr({ field: /why/i.test(r.error) ? 'reason' : 'form', text: r.error }); return; }
    toast(`${item.name} disabled`);
    close();
  };
  return (
    <FormSheet id="thm-dis" title={`Disable ${item.name}`} close={close} onSubmit={submit} submit="Disable" danger error={err}>
      <p className="thm-note thm-note--warn">It can't be given to a store or released while it is off. {using ? `${plural(using, 'store')} using it keep their copy.` : ''}</p>
      <Field id="thm-dis-r" label="Reason" error={errOf(err, 'reason')}>
        <textarea id="thm-dis-r" className={'gc-input' + (errOf(err, 'reason') ? ' gc-input--error' : '')} rows={2} value={reason} onChange={(e) => { setErr(null); setReason(e.target.value); }} />
      </Field>
    </FormSheet>
  );
}

// ---- give a store a theme --------------------------------------------------------------------------------------------------
/** Change a store's theme (shopId fixed) or give a theme to a store (themeId fixed), with what changes. */
export function ChangeSheet({ shopId: fixedShop, themeId: fixedTheme, close }) {
  const { db, data, t } = useThemes();
  const stores = onlineStores(db).slice().sort((a, b) => a.shop.name.localeCompare(b.shop.name));
  const [shopId, setShopId] = useState(fixedShop || '');
  const [themeId, setThemeId] = useState(fixedTheme || '');
  const [version, setVersion] = useState('');
  const [err, setErr] = useState(null);
  const shop = shopId ? db.shops.find((s) => s.id === shopId) : null;
  const pkg = shop ? packageOfShop(db, shop) : null;
  const cur = shopId ? data.assign[shopId] : null;
  const curItem = cur ? itemById(data, cur.themeId) : null;
  const all = itemsOf(data, 'theme').filter((i) => liveVersion(data, i.id));
  const vers = themeId ? publishedVersions(data, themeId) : [];
  const v = version && vers.includes(version) ? version : vers[0];
  const pv = shopId && themeId ? changePreview(data, db, shopId, themeId) : null;
  const storeMods = shop ? modulesOf(db, shop, t).filter((m) => m.active).map((m) => m.code) : [];
  const hidden = pv ? pv.to.modules.filter((c) => !storeMods.includes(c)) : [];
  const submit = () => {
    if (!shopId) { setErr({ field: 'shop', text: 'Choose a store.' }); return; }
    if (!themeId) { setErr({ field: 'theme', text: 'Choose a theme.' }); return; }
    const r = assignStore(shopId, themeId, v);
    if (!r.ok) { setErr({ field: 'form', text: r.error }); return; }
    toast(`${shop.name} now uses ${itemById(data, themeId).name} ${r.version}`);
    close();
  };
  const optLabel = (i) => {
    const why = i.state !== 'active' ? ` · ${i.state}` : pkg && !i.packages.includes(pkg) ? ' · not on this package' : '';
    return `${i.name} · ${liveVersion(data, i.id)}${why}`;
  };
  return (
    <FormSheet id="thm-chg" title={fixedShop && shop ? `Change theme · ${shop.name}` : fixedTheme ? `Assign ${itemById(data, fixedTheme).name} to a store` : 'Assign a theme'} close={close} onSubmit={submit} submit={cur && cur.themeId !== themeId ? 'Change theme' : 'Assign'} error={err}>
      {fixedShop ? null : (
        <Field id="thm-chg-s" label="Store" error={errOf(err, 'shop')}>
          <select id="thm-chg-s" {...ctl(errOf(err, 'shop'), true)} value={shopId} onChange={(e) => { setErr(null); setShopId(e.target.value); }}>
            <option value="">Choose a store</option>
            {stores.map(({ shop: s, pkg: p }) => {
              const a = data.assign[s.id];
              const on = a && a.themeId === fixedTheme;
              return <option key={s.id} value={s.id}>{s.name} · #{s.id} · {packageLabel(p)}{on ? ' · uses it' : ''}</option>;
            })}
          </select>
        </Field>
      )}
      {shop ? <p className="thm-small thm-muted">{shop.name} · {packageLabel(pkg)} · now {curItem ? `${curItem.name} ${cur.version}` : 'no theme'}</p> : null}
      {fixedTheme ? null : (
        <Field id="thm-chg-t" label="Theme" error={errOf(err, 'theme')}>
          <select id="thm-chg-t" {...ctl(errOf(err, 'theme'), true)} value={themeId} onChange={(e) => { setErr(null); setThemeId(e.target.value); setVersion(''); }}>
            <option value="">Choose a theme</option>
            {all.map((i) => <option key={i.id} value={i.id} disabled={i.state !== 'active' || (pkg && !i.packages.includes(pkg))}>{optLabel(i)}</option>)}
          </select>
        </Field>
      )}
      {vers.length > 1 ? (
        <Field id="thm-chg-v" label="Version" hint="The latest unless the store must stay on an older one">
          <select id="thm-chg-v" {...ctl(null, true)} value={v} onChange={(e) => setVersion(e.target.value)}>{vers.map((x, i) => <option key={x} value={x}>{x}{i === 0 ? ' · latest' : ''}</option>)}</select>
        </Field>
      ) : null}
      {pv ? (
        <>
          <p className="thm-sec">What changes for the store</p>
          <div className="thm-cmp">
            <div>{pv.from ? <Thumb item={pv.from} /> : <span className="thm-note">No theme</span>}<b>{pv.from ? `${pv.from.name} ${pv.fromVersion}` : 'Nothing yet'}</b>Now</div>
            <Icon name="arrow-right" width="16" height="16" aria-hidden="true" />
            <div><Thumb item={pv.to} /><b>{pv.to.name} {v}</b>After</div>
          </div>
          {!pv.pkgOk ? <p className="thm-note thm-note--warn">{pv.to.name} isn't offered on {packageLabel(pv.pkg)}. Turn it on for that package on Assignments first.</p> : null}
          {pv.to.state !== 'active' ? <p className="thm-note thm-note--warn">{pv.to.name} is {pv.to.state}.</p> : null}
          <ul className="thm-diff">
            {pv.sectionsAdded.map((s) => <li key={'a' + s}><span className="thm-diff__s is-add">+</span><span>{sectionName(s)} section</span></li>)}
            {pv.sectionsRemoved.map((s) => <li key={'r' + s}><span className="thm-diff__s is-del">−</span><span>{sectionName(s)} section (its content is kept, not shown)</span></li>)}
            {pv.from && pv.from.id !== pv.to.id ? pv.featuresGained.slice(0, 4).map((x) => <li key={'g' + x}><span className="thm-diff__s is-add">+</span><span>{x}</span></li>) : null}
            {pv.from && pv.from.id !== pv.to.id ? pv.featuresLost.slice(0, 4).map((x) => <li key={'l' + x}><span className="thm-diff__s is-del">−</span><span>{x}</span></li>) : null}
            {hidden.length ? <li><span className="thm-diff__s is-keep">·</span><span>Blocks stay hidden until the store has {hidden.map(moduleName).join(', ')}</span></li> : null}
            <li><span className="thm-diff__s is-keep">=</span><span>Products, pages, logo, colours and menus stay as they are</span></li>
          </ul>
        </>
      ) : null}
    </FormSheet>
  );
}

// ---- merchant editing (Planned) ----------------------------------------------------------------------------------------
/** Which parts merchants may change in their copy (UI only until merchant-side editing is built). */
export function MerchantEditing({ item, data }) {
  const vals = item ? item.editable : data.editing;
  const flip = (k) => {
    const r = setEditable(item ? item.id : null, k, !vals[k]);
    if (r.ok) toast(`${EDITABLE.find((e) => e[0] === k)[1]}: ${!vals[k] ? 'merchants may edit' : 'locked'} (applies when merchant editing ships)`);
    else toast(r.error);
  };
  return (
    <section className="ix-card" aria-labelledby={'thm-me-' + (item ? item.id : 'all')}>
      <div className="ix-card__head">
        <h2 id={'thm-me-' + (item ? item.id : 'all')}>Merchant editing</h2>
        <span className="thm-headact">
          <StatusBadge tone="neutral">Planned</StatusBadge>
          <InfoTip label="About merchant editing" text={item ? 'When merchants can edit their storefront, these switches decide which parts of this theme they may change. Nothing reaches a store yet.' : 'The default for new themes: which parts merchants will be able to change once merchant-side editing is built. Each theme can differ on its own page.'} />
        </span>
      </div>
      <div className="ix-card__body">
        {EDITABLE.map(([k, l]) => (
          <div key={k} className="thm-switch">
            <span id={'thm-ed-' + k + (item ? item.id : '')}>{l}</span>
            <button type="button" role="switch" className="gc-switch" aria-checked={!!vals[k]} aria-labelledby={'thm-ed-' + k + (item ? item.id : '')} onClick={() => flip(k)}><span className="gc-switch__knob" /></button>
          </div>
        ))}
      </div>
    </section>
  );
}

export { statusOf, cmpVer, isSemver, familyName, packageLabel, moduleName };
