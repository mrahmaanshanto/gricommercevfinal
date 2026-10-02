'use client';
// Shared UI pieces for the screens. They render the gc-* classes from
// src/styles/design-system.css, so they look the same wherever they are used.
//
//   <Overlays />        mounted once in the root layout: toasts, confirm dialog, skip link,
//                       keyboard support for role="button", feedback for unwired controls
//   <PageHeader />      the one page header: h1 + description + actions (phones: primary + More);
//                       `about` = the longer explanation, shown only in Help
//   <Sheet />           side panel on desktop, bottom sheet on phones (Help, phone filters)
//   <EmptyState />      what a list shows when it has nothing to show
//   <InfoTip />         a small (i) button that shows an explanation on tap (keeps pages short)
//   <Dialog />          modal with focus trap, Esc to close, focus returned to the trigger
//   <ChannelIcon />     social / messaging channel mark (never text initials)
//   <StatusBadge />     soft pill with an icon, so status is never colour alone

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/runtime/dc';
import { getLocale } from '@/runtime/ui';
import { startMobileTables } from '@/runtime/mobileTables';
import { startTranslator } from '@/runtime/translateDom';

// ---- focus helpers ---------------------------------------------------------------------------
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useModalFocus(open, onClose) {
  const ref = useRef(null);
  // the latest onClose without re-running the effect: class screens pass a new function each render,
  // and re-running would pull focus back to the first field on every keystroke
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const trigger = document.activeElement;
    const box = ref.current;
    const first = box && (box.querySelector('[data-autofocus]') || box.querySelector(FOCUSABLE));
    if (first) first.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close.current(); return; }
      if (e.key !== 'Tab' || !box) return;
      const items = [...box.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const head = items[0], tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) { e.preventDefault(); tail.focus(); }
      else if (!e.shiftKey && document.activeElement === tail) { e.preventDefault(); head.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (trigger && trigger.focus) trigger.focus();
    };
  }, [open]);
  return ref;
}

// ---- Dialog ------------------------------------------------------------------------------------
export function Dialog({ open, title, onClose, children, footer, width = 480 }) {
  const ref = useModalFocus(open, onClose);
  if (!open) return null;
  return (
    <div className="gc-modal__backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className="gc-modal" role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth: width }}>
        <div className="gc-modal__head">
          <h2 className="gc-modal__title">{title}</h2>
          <button type="button" className="gc-iconbtn" aria-label="Close" onClick={onClose}><Icon name="x" width="18" height="18" /></button>
        </div>
        <div className="gc-modal__body">{children}</div>
        {footer ? <div className="gc-modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}

// ---- Sheet: side panel on desktop, bottom sheet on phones ---------------------------------------
export function Sheet({ open, title, onClose, children, footer, label }) {
  const ref = useModalFocus(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="gc-sheet__backdrop" onMouseDown={onClose} aria-hidden="true" />
      <aside ref={ref} className="gc-sheet" role="dialog" aria-modal="true" aria-label={label || title}>
        <div className="gc-sheet__head">
          <h2 className="gc-sheet__title">{title}</h2>
          <button type="button" className="gc-iconbtn" aria-label="Close" onClick={onClose}><Icon name="x" width="18" height="18" /></button>
        </div>
        <div className="gc-sheet__body">{children}</div>
        {footer ? <div className="gc-sheet__foot">{footer}</div> : null}
      </aside>
    </>
  );
}

// ---- PageHeader ------------------------------------------------------------------------------
// One page header: h1, one short line of context (hidden on phones — it is in Help), actions.
// On phones the solid (primary) action stays and the other actions move into a "More" menu.
const flat = (node) => React.Children.toArray(node).flatMap((c) => (c && c.type === React.Fragment ? flat(c.props.children) : [c]));
const isPrimary = (el) => !!(el && el.props && /gc-btn--solid/.test(el.props.className || ''));
/** True below 641 px (after mount; the first render is the desktop one). */
export function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const on = () => setPhone(mq.matches);
    on();
    if (mq.addEventListener) mq.addEventListener('change', on); else mq.addListener(on);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', on); else mq.removeListener(on); };
  }, []);
  return phone;
}

/** PhoneMore — secondary page actions: inline on desktop, one "More" menu on phones. */
export function PhoneMore({ children }) {
  const phone = useIsPhone();
  if (!phone) return <>{children}</>;
  return <MoreMenu items={children} on />;
}

/**
 * PhoneActionBar — on phones, a form's main action stays in reach: a bar fixed to the bottom of the screen
 * (rendered into <body>) with an optional note (e.g. the total) and the action button(s). Nothing on desktop.
 * For a form submit, give the form an id and use <button type="submit" form="that-id">.
 */
export function PhoneActionBar({ children, note, label = 'Actions' }) {
  const phone = useIsPhone();
  if (!phone || typeof document === 'undefined') return null;
  return createPortal(
    <div className="gc-phonebar" role="group" aria-label={label}>
      {note ? <span className="gc-phonebar__note">{note}</span> : null}
      {children}
    </div>, document.body);
}

function MoreMenu({ items, on }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className={'gc-pagehead__more' + (on ? ' gc-pagehead__more--on' : '')} ref={box}>
      <button type="button" className="gc-btn gc-btn--neutral" aria-haspopup="menu" aria-expanded={open} aria-label="More actions" onClick={() => setOpen(!open)}><Icon name="ellipsis" width="18" height="18" aria-hidden="true" /><span className="gc-more__text">More</span></button>
      {open ? <div className="gc-pagehead__menu" role="menu" onClick={() => setOpen(false)}>{items}</div> : null}
    </div>
  );
}
export function PageHeader({ title, description, about, actions, compact }) {
  const list = actions ? flat(actions) : [];
  const primary = list.filter(isPrimary);
  const others = list.filter((x) => !isPrimary(x));
  const split = others.length > 1 || (others.length === 1 && primary.length > 0);
  return (
    <header className={'gc-pagehead' + (compact ? ' gc-pagehead--compact' : '')}>
      <div className="gc-pagehead__text">
        <h1 className="gc-pagehead__title">{title}</h1>
        {description ? <p className="gc-pagehead__desc">{description}</p> : null}
        {about ? <span className="gc-pagehead__about" hidden>{about}</span> : null}
      </div>
      {list.length ? (
        split ? (
          <div className="gc-pagehead__actions gc-pagehead__actions--split">
            <span className="gc-pagehead__side">{others}</span>
            <MoreMenu items={others.map((el, i) => React.isValidElement(el) ? React.cloneElement(el, { key: 'm' + i, role: 'menuitem' }) : el)} />
            {primary}
          </div>
        ) : <div className="gc-pagehead__actions">{actions}</div>
      ) : null}
    </header>
  );
}

// ---- InfoTip ---------------------------------------------------------------------------------
// The explanation behind a figure or setting, one tap away instead of a paragraph on the page.
export function InfoTip({ text, label = 'More info' }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <span className="gc-infotip" ref={box}>
      <button type="button" className="gc-infotip__btn" aria-label={label} aria-expanded={open} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}><Icon name="info" width="15" height="15" aria-hidden="true" /></button>
      {open ? <span className="gc-infotip__pop" role="note">{text}</span> : null}
    </span>
  );
}

// ---- EmptyState ------------------------------------------------------------------------------
export function EmptyState({ icon = 'search-x', title, body, actionLabel, onAction }) {
  return (
    <div className="gc-empty" role="status">
      <span className="gc-empty__icon"><Icon name={icon} width="22" height="22" /></span>
      <p className="gc-empty__title">{title}</p>
      {body ? <p className="gc-empty__body">{body}</p> : null}
      {actionLabel ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={onAction}>{actionLabel}</button> : null}
    </div>
  );
}

// ---- ChannelIcon -----------------------------------------------------------------------------
const CHANNELS = {
  facebook: ['facebook', 'Facebook', '#1877f2'], fb: ['facebook', 'Facebook', '#1877f2'],
  instagram: ['instagram', 'Instagram', '#c13584'], ig: ['instagram', 'Instagram', '#c13584'],
  whatsapp: ['message-circle', 'WhatsApp', '#128c7e'], wa: ['message-circle', 'WhatsApp', '#128c7e'],
  messenger: ['message-circle-more', 'Messenger', '#0866ff'], ms: ['message-circle-more', 'Messenger', '#0866ff'],
  telegram: ['send', 'Telegram', '#1c8adb'], tg: ['send', 'Telegram', '#1c8adb'],
  linkedin: ['linkedin', 'LinkedIn', '#0a66c2'], li: ['linkedin', 'LinkedIn', '#0a66c2'],
  tiktok: ['music-2', 'TikTok', '#0f172a'], tt: ['music-2', 'TikTok', '#0f172a'],
  youtube: ['youtube', 'YouTube', '#c4302b'], yt: ['youtube', 'YouTube', '#c4302b'],
  x: ['twitter', 'X', '#0f172a'], tw: ['twitter', 'X', '#0f172a'],
  pinterest: ['pin', 'Pinterest', '#bd081c'], pi: ['pin', 'Pinterest', '#bd081c'],
  threads: ['at-sign', 'Threads', '#101010'], th: ['at-sign', 'Threads', '#101010'],
  google: ['star', 'Google reviews', '#1a73e8'], gbp: ['star', 'Google reviews', '#1a73e8'],
  email: ['mail', 'Email', '#475569'], em: ['mail', 'Email', '#475569'],
  sms: ['message-square-text', 'SMS', '#475569'],
  phone: ['phone', 'Phone', '#475569'], call: ['phone', 'Phone', '#475569'],
  web: ['globe', 'Website', '#003087'], site: ['globe', 'Website', '#003087'],
};

// channels with a supplied logo (public/assets/brands): shown as the logo itself instead of a glyph tile
const LOGOS = {
  instagram: '/assets/brands/instagram.png', ig: '/assets/brands/instagram.png',
  linkedin: '/assets/brands/linkedin.png', li: '/assets/brands/linkedin.png',
  youtube: '/assets/brands/youtube.png', yt: '/assets/brands/youtube.png',
  x: '/assets/brands/x.png', tw: '/assets/brands/x.png',
  pinterest: '/assets/brands/pinterest.png', pi: '/assets/brands/pinterest.png',
  threads: '/assets/brands/threads.png', th: '/assets/brands/threads.png',
  google: '/assets/brands/google-business.png', gbp: '/assets/brands/google-business.png',
};

/** A channel mark: the channel's logo, or a white glyph on the channel colour. `size` is the tile, the glyph is 60% of it. */
export function ChannelIcon({ channel, size = 20, label, plain, decorative }) {
  const key = String(channel || '').trim().toLowerCase();
  const [icon, name, color] = CHANNELS[key] || ['message-square', channel || 'Channel', '#475569'];
  const glyph = Math.max(12, Math.round(size * 0.6));
  // `decorative` (or label="") is for a mark that sits next to its visible name
  const hidden = decorative || label === '';
  const a11y = hidden ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': label || name };
  if (LOGOS[key]) {
    return (
      <span {...a11y} title={hidden ? undefined : label || name} className="gc-channel gc-channel--logo" style={{ width: size, height: size }}>
        <img src={LOGOS[key]} alt="" width={size} height={size} />
      </span>
    );
  }
  if (plain) return <Icon name={icon} width={size} height={size} {...a11y} style={{ color, flex: 'none' }} />;
  return (
    <span {...a11y} title={hidden ? undefined : label || name} className="gc-channel" style={{ width: size, height: size, background: color }}>
      <Icon name={icon} width={glyph} height={glyph} aria-hidden="true" />
    </span>
  );
}

// ---- StatusBadge -----------------------------------------------------------------------------
const TONE_ICON = { success: 'check', warning: 'clock', error: 'triangle-alert', info: 'info', neutral: 'minus', primary: 'circle' };

export function StatusBadge({ tone = 'neutral', icon, children }) {
  const cls = tone === 'neutral' ? 'slate' : tone;
  return (
    <span className={`gc-badge gc-badge--${cls}`}>
      <Icon name={icon || TONE_ICON[tone] || 'circle'} width="12" height="12" aria-hidden="true" />
      {children}
    </span>
  );
}

// ---- Overlays --------------------------------------------------------------------------------
const COPY = {
  en: { skip: 'Skip to content', cancel: 'Cancel', confirm: 'Confirm', undo: 'Undo', soon: 'This action is not available in the demo yet.' },
  bn: { skip: 'মূল অংশে যান', cancel: 'বাতিল', confirm: 'নিশ্চিত করুন', undo: 'ফিরিয়ে নিন', soon: 'এই কাজটি ডেমোতে এখনো চালু হয়নি।' },
};

/** True when React has a click handler on this element or one of its ancestors inside the screen. */
function isWired(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const key = Object.keys(n).find((k) => k.startsWith('__reactProps$'));
    const props = key ? n[key] : null;
    if (props && (props.onClick || props.onMouseDown || props.onPointerDown || props.onChange || props.onSubmit)) return true;
    if (n.tagName === 'FORM' || n.tagName === 'LABEL') return true;
  }
  return false;
}

export function Overlays() {
  const [toasts, setToasts] = useState([]);
  const [ask, setAsk] = useState(null);
  const [locale, setLoc] = useState('en');
  const t = COPY[locale] || COPY.en;
  const copyRef = useRef(t);
  copyRef.current = t;
  useEffect(() => { startMobileTables(); startTranslator(); }, []);

  const push = useCallback((detail) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, ...detail }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), detail.undo ? 5000 : 3000);
  }, []);

  useEffect(() => {
    const loc = getLocale();
    setLoc(loc);
    document.documentElement.lang = loc;
    const onToast = (e) => push(e.detail);
    const onConfirm = (e) => setAsk(e.detail);
    const onLocale = (e) => setLoc(e.detail);

    // role="button" elements behave like buttons from the keyboard
    const onKey = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target;
      if (!el || !el.matches || !el.matches('[role="button"],[role="tab"],tr[tabindex]') || /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
      e.preventDefault();
      el.click();
    };

    // a control with no handler still answers: it says it is not available yet
    const onClick = (e) => {
      const el = e.target && e.target.closest ? e.target.closest('button,a,[role="button"]') : null;
      if (!el || !el.closest('.dc-screen') || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
      if (el.tagName === 'A') {
        const href = el.getAttribute('href');
        if (href && href !== '#') return;
        e.preventDefault();
      }
      if (el.type === 'submit' || isWired(el)) return;
      push({ message: copyRef.current.soon, tone: 'info' });
    };

    // click-only containers (styled with cursor:pointer in a class) become reachable by keyboard
    let queued = 0;
    const reach = () => {
      queued = 0;
      for (const el of document.querySelectorAll('.dc-screen div, .dc-screen span, .dc-screen li, .dc-screen article, .dc-screen tr')) {
        if (el.hasAttribute('role') || el.hasAttribute('tabindex') || el.closest('button,a,label,[role="button"]')) continue;
        if (getComputedStyle(el).cursor !== 'pointer') continue;
        if (el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer') continue;
        if (el.tagName !== 'TR') el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
      }
    };
    const watch = new MutationObserver(() => { if (!queued) queued = window.setTimeout(reach, 400); });
    watch.observe(document.body, { childList: true, subtree: true });
    reach();

    window.addEventListener('gc:toast', onToast);
    window.addEventListener('gc:confirm', onConfirm);
    window.addEventListener('gc:locale', onLocale);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      watch.disconnect();
      window.clearTimeout(queued);
      window.removeEventListener('gc:toast', onToast);
      window.removeEventListener('gc:confirm', onConfirm);
      window.removeEventListener('gc:locale', onLocale);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [push]);

  const answer = useCallback((value) => {
    setAsk((cur) => { if (cur && cur.resolve) cur.resolve(value); return null; });
  }, []);
  const cancel = useCallback(() => answer(false), [answer]);
  const askRef = useModalFocus(!!ask, cancel);

  const skip = (e) => {
    const main = document.querySelector('main, [role="main"]');
    if (!main) return;
    e.preventDefault();
    main.setAttribute('tabindex', '-1');
    main.focus();
    main.scrollIntoView();
  };

  return (
    <>
      <a href="#main" className="gc-skip" onClick={skip}>{t.skip}</a>
      {ask ? (
        <div className="gc-modal__backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) cancel(); }}>
          <div ref={askRef} className="gc-modal gc-modal--confirm" role="alertdialog" aria-modal="true" aria-labelledby="gc-confirm-title" aria-describedby="gc-confirm-body">
            <h2 id="gc-confirm-title" className="gc-modal__title">{ask.title}</h2>
            {ask.body ? <p id="gc-confirm-body" className="gc-modal__text">{ask.body}</p> : null}
            <div className="gc-modal__foot">
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" data-autofocus onClick={cancel}>{ask.cancelLabel || t.cancel}</button>
              <button type="button" className={'gc-btn gc-btn--sm gc-btn--solid' + (ask.tone === 'danger' ? ' gc-btn--error' : '')} onClick={() => answer(true)}>{ask.confirmLabel || t.confirm}</button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="gc-toasts" aria-live="polite">
        {toasts.map((x) => (
          <div key={x.id} className={'gc-toast gc-toast--' + (x.tone || 'success')} role="status">
            <Icon name={x.tone === 'error' ? 'triangle-alert' : x.tone === 'info' ? 'info' : 'check'} width="16" height="16" aria-hidden="true" />
            <span>{x.message}</span>
            {x.undo ? <button type="button" className="gc-toast__undo" onClick={() => { x.undo(); setToasts((list) => list.filter((y) => y.id !== x.id)); }}>{t.undo}</button> : null}
          </div>
        ))}
      </div>
    </>
  );
}
