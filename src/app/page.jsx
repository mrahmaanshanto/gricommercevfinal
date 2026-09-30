import Link from 'next/link';
import { SCREENS } from '@/screens/registry';

export const metadata = { title: 'All screens' };

// Development index: every converted screen, grouped by the design canvas page it sits on.
export default function ScreensIndex() {
  const groups = new Map();
  for (const s of SCREENS) {
    const key = s.canvasPage || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  const ordered = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="screens-index">
      <style>{`
        .screens-index{max-width:1200px;margin:0 auto;padding:40px 24px 80px;font-family:Poppins,ui-sans-serif,system-ui,sans-serif;color:#1e293b}
        .screens-index h1{margin:0 0 6px;font-size:28px;font-weight:700;letter-spacing:-.02em;color:#0f172a}
        .screens-index .lead{margin:0 0 28px;color:#475569;font-size:14px}
        .screens-index .lead a{color:#003087;font-weight:600}
        .screens-index section{margin-top:28px}
        .screens-index h2{margin:0 0 10px;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#64748b}
        .screens-index ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px}
        .screens-index li a{display:block;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;text-decoration:none;color:inherit;transition:border-color .15s,box-shadow .15s}
        .screens-index li a:hover{border-color:#003087;box-shadow:0 4px 14px -8px rgba(0,48,135,.4)}
        .screens-index b{display:block;font-size:14px;font-weight:600;color:#0f172a}
        .screens-index small{display:block;font-size:12px;color:#64748b}
      `}</style>
      <h1>GridCommerce · all screens</h1>
      <p className="lead">
        {SCREENS.length} screens converted from the design canvas. Start at{' '}
        <Link href="/merchant-overview">Home</Link>, <Link href="/merchant-sign-in">Sign in</Link> or the{' '}
        <Link href="/site-map">Site map</Link>.
      </p>
      {ordered.map(([page, list]) => (
        <section key={page}>
          <h2>{page}</h2>
          <ul>
            {list.map((s) => (
              <li key={s.name}>
                <Link href={s.route}>
                  <b>{s.title}</b>
                  <small>{s.route} · {s.width}×{s.height}</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
