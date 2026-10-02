// ProposalDoc — /dev/proposal/doc: the comparison of today's build with Nayeem's proposal (docs/proposal-vs-build.md),
// read inside the app. A server component: the Markdown is turned into HTML when the page is built, so a brief or
// decision link on /dev/proposal (#<heading id>) lands on its section.
import Link from 'next/link';
import { renderMarkdown } from './proposalMarkdown';

const CSS = `
.pd{min-height:100vh;background:var(--surface-page);color:var(--text-body);font-family:var(--font-sans);font-size:var(--text-sm);line-height:1.6}
.pd-top{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-6);border-bottom:1px solid var(--border-subtle);background:var(--surface-header);backdrop-filter:blur(8px)}
.pd-top a{display:inline-flex;align-items:center;min-height:36px;font-weight:var(--weight-medium);color:var(--primary);text-decoration:none}
.pd-top span{font-size:var(--text-xs);color:var(--text-muted)}
.pd-body{max-width:1280px;margin:0 auto;padding:var(--space-6) var(--space-6) var(--space-12)}
.pd-toc{margin-bottom:var(--space-6);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.pd-toc ol{margin:0;padding:0 var(--space-5) var(--space-4) calc(var(--space-5) + 18px);columns:2 320px;column-gap:var(--space-8)}
.pd-toc li{break-inside:avoid}
.pd-toc li.l3{margin-left:var(--space-4);list-style:circle}
.pd-toc a{color:var(--primary);text-decoration:none}
.pd-doc h1,.pd-doc h2,.pd-doc h3,.pd-doc h4{color:var(--text-heading);font-weight:var(--weight-semibold);line-height:1.3;scroll-margin-top:72px}
.pd-doc h1{margin:0 0 var(--space-5);font-size:var(--text-2xl)}
.pd-doc h2{margin:var(--space-10) 0 var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-xl)}
.pd-doc h3{margin:var(--space-8) 0 var(--space-3);font-size:var(--text-lg)}
.pd-doc h4{margin:var(--space-6) 0 var(--space-2);font-size:var(--text-sm-plus)}
.pd-doc :target{background:var(--fill-warning-soft);border-radius:var(--radius-lg)}
.pd-doc p{margin:0 0 var(--space-3)}
.pd-doc ul,.pd-doc ol{margin:0 0 var(--space-3);padding-left:var(--space-6)}
.pd-doc li>ul,.pd-doc li>ol{margin:var(--space-1) 0 0}
.pd-doc strong{font-weight:var(--weight-semibold);color:var(--text-heading)}
.pd-doc code{padding:1px 5px;border-radius:var(--radius-sm);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs)}
.pd-doc a{color:var(--primary)}
.pd-doc blockquote{margin:0 0 var(--space-4);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.pd-doc blockquote p:last-child{margin:0}
.pd-tw{margin:0 0 var(--space-5);overflow-x:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.pd-doc table{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.pd-doc th{position:sticky;top:0;padding:var(--space-2) var(--space-3);background:var(--surface-subtle);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;white-space:nowrap}
.pd-doc td{padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle);vertical-align:top;min-width:96px}
.pd-doc td .gc-badge{white-space:nowrap}
@media (max-width:640px){.pd-top,.pd-body{padding-left:var(--space-4);padding-right:var(--space-4)}.pd-doc h2{font-size:var(--text-lg)}.pd-doc td{min-width:0}}
`;

export default function ProposalDoc({ md }) {
  const doc = md ? renderMarkdown(md) : null;
  return (
    <div className="pd">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="pd-top">
        <Link href="/dev/proposal">← Proposal switches</Link>
        <span>docs/proposal-vs-build.md</span>
      </header>
      <div className="pd-body">
        {doc ? (
          <>
            <details className="pd-toc gc-disclose">
              <summary>Contents</summary>
              <ol>
                {doc.toc.map((h) => <li key={h.id} className={'l' + h.level}><a href={'#' + h.id}>{h.text}</a></li>)}
              </ol>
            </details>
            <article className="pd-doc" dangerouslySetInnerHTML={{ __html: doc.html }} />
          </>
        ) : (
          <article className="pd-doc"><h1>Comparison not found</h1><p>Add <code>docs/proposal-vs-build.md</code> to this checkout and rebuild.</p></article>
        )}
      </div>
    </div>
  );
}
