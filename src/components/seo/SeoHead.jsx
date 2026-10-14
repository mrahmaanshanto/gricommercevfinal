'use client';
// SeoHead — writes a customer view's head tags (lib/seo.js › headFor): title, description, robots, canonical, Open
// Graph / Twitter and the JSON-LD. Tags it wrote carry data-gc-seo and are replaced as a whole. The app's own title,
// description, robots and canonical (Next.js metadata, which can arrive after the page loads) are taken out whenever
// they appear while the page is open, so the page never has two of anything and never the app's generic text.
// Front end only: the live website's server sends these in the HTML; here they are added after the page loads (see them
// in the browser's inspector, Elements › head).

import { useEffect } from 'react';

const MARK = 'data-gc-seo';
const FOREIGN = 'meta[name="description"],meta[name="robots"],link[rel="canonical"],meta[property^="og:"],meta[name^="twitter:"],script[type="application/ld+json"]';

export default function SeoHead({ head }) {
  useEffect(() => {
    if (!head || typeof document === 'undefined') return undefined;
    const h = document.head;
    const prevTitle = document.title;
    const strip = () => h.querySelectorAll(FOREIGN).forEach((n) => { if (!n.hasAttribute(MARK)) n.remove(); });
    const fixTitle = () => { if (head.title && document.title !== head.title) document.title = head.title; };
    h.querySelectorAll('[' + MARK + ']').forEach((n) => n.remove());
    strip();
    const add = (tag, attrs, text) => {
      const n = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      n.setAttribute(MARK, '');
      if (text != null) n.textContent = text;
      h.appendChild(n);
    };
    fixTitle();
    if (head.description) add('meta', { name: 'description', content: head.description });
    add('meta', { name: 'robots', content: head.robots || 'index, follow' });
    if (head.canonical) add('link', { rel: 'canonical', href: head.canonical });
    Object.entries(head.og || {}).forEach(([k, v]) => { if (v) add('meta', k.indexOf('twitter:') === 0 ? { name: k, content: v } : { property: k, content: v }); });
    (head.jsonld || []).forEach((j) => add('script', { type: 'application/ld+json' }, JSON.stringify(j)));
    // Next.js may write its metadata after this runs (and again on navigation): keep ours the only ones
    const watch = new MutationObserver(() => { strip(); fixTitle(); });
    watch.observe(h, { childList: true, subtree: true, characterData: true });
    return () => { watch.disconnect(); h.querySelectorAll('[' + MARK + ']').forEach((n) => n.remove()); document.title = prevTitle; };
  }, [head]);
  return null;
}
