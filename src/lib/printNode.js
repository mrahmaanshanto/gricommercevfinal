// printNode — print one element (a letter, ID cards, a payslip) on its own: it is copied with the page's styles
// into a hidden frame and that frame is printed, so dialogs, menus and the rest of the page never get in the way.
// `title` names the PDF when the person chooses "Save as PDF"; `css` adds print rules (e.g. @page size).

export function printNode(node, { title, css = '' } = {}) {
  if (typeof window === 'undefined' || !node) return;
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(frame);
  const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.outerHTML).join('');
  const html = document.documentElement;
  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html class="${html.className}" lang="${html.lang || 'en'}"><head><meta charset="utf-8"><title>${String(title || document.title).replace(/</g, '')}</title>${styles}<style>html,body{background:#fff!important;margin:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}${css}</style></head><body><div class="dc-screen ds">${node.outerHTML}</div></body></html>`);
  doc.close();
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    const run = () => { frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 1500); };
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(run, run); else run();
  };
  frame.onload = go;
  setTimeout(go, 600);
}
