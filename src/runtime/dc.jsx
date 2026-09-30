'use client';
// Runtime for the screens converted from the design canvas (.dc.html "Design Components").
// A screen's logic is a `class Component extends DCLogic` with a `renderVals()` that returns the
// values its markup binds to. The converter turns the markup into JSX and adds a `render()`.

import React from 'react';
import Link from 'next/link';
import { icons } from 'lucide';
import { isScreenHref, routeOf, rewriteAssets } from './routes';

/** Base class for every screen's logic: a React class component without its own render(). */
export class DCLogic extends React.Component {}

// Some screens call `window.lucide.createIcons()` after mounting, as the design runtime needed.
// Icons are React components here, so that call becomes a no-op. The icon table stays available
// for the shell's shadow-DOM elements.
if (typeof window !== 'undefined' && !window.lucide) {
  window.lucide = { icons, createIcons() {} };
}

/** Safe list for <sc-for>. */
export function list(value) {
  return Array.isArray(value) ? value : [];
}

// ---- style="…" strings -> React style objects -------------------------------------------------

const cache = new Map();

function propName(name) {
  const n = name.trim();
  if (n.startsWith('--')) return n;
  const lower = n.toLowerCase();
  if (lower.startsWith('-ms-')) return 'ms' + lower.slice(4).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return lower.replace(/^-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^(webkit|moz)/, (m) => m[0].toUpperCase() + m.slice(1));
}

/** Split a declaration list on `;`, ignoring semicolons inside quotes and parentheses. */
export function splitDecls(text) {
  const out = [];
  let depth = 0, quote = '', cur = '';
  for (const ch of text) {
    if (quote) { if (ch === quote) quote = ''; cur += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Converts a CSS declaration string to a React style object (objects pass through). */
export function sx(style) {
  if (style == null || style === '') return undefined;
  if (typeof style === 'object') return style;
  const key = String(style);
  if (cache.has(key)) return cache.get(key);
  const obj = {};
  for (const decl of splitDecls(rewriteAssets(key))) {
    const i = decl.indexOf(':');
    if (i < 1) continue;
    obj[propName(decl.slice(0, i))] = decl.slice(i + 1).trim();
  }
  cache.set(key, obj);
  return obj;
}

// ---- links -------------------------------------------------------------------------------------

/** An <a> whose href is only known at render time (it may point at another screen). */
export const A = React.forwardRef(function A({ href, ...rest }, ref) {
  if (isScreenHref(href)) return <Link ref={ref} href={routeOf(href)} {...rest} />;
  return <a ref={ref} href={typeof href === 'string' ? rewriteAssets(href) : href} {...rest} />;
});

// ---- icons -------------------------------------------------------------------------------------

const pascal = (n) => String(n || '').replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

function toReactAttrs(attrs) {
  const out = {};
  for (const k in attrs) {
    if (k === 'class') out.className = attrs[k];
    else if (k.startsWith('data-') || k.startsWith('aria-')) out[k] = attrs[k];
    else out[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = attrs[k];
  }
  return out;
}

/**
 * A Lucide icon, replacing the design's `<i data-lucide="name">` placeholders.
 * Attributes given on the element win over the icon's defaults, as with lucide.createIcons().
 */
export function Icon({ name, className, ...rest }) {
  const node = icons[pascal(name)];
  if (!node) return <i data-lucide={name} className={className} {...rest} />;
  const [, svgAttrs, children] = node;
  return (
    <svg
      {...toReactAttrs(svgAttrs)}
      className={['lucide', 'lucide-' + name, className].filter(Boolean).join(' ')}
      data-lucide={name}
      {...rest}
    >
      {children.map(([tag, a], i) => React.createElement(tag, { key: i, ...toReactAttrs(a) }))}
    </svg>
  );
}
