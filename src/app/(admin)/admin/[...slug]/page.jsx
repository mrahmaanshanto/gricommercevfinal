import { notFound } from 'next/navigation';
import Planned from '@/screens/admin/Planned';
import { PAGES, RECORDS } from '@/screens/admin/adminNav';

// Every super admin page that is not built yet (adminNav.js) opens its "Planned" page. A built page has its own
// folder under /admin and is left out here.
const planned = () => [...PAGES, ...RECORDS].filter((p) => !p.built && p.href.startsWith('/admin/'));

export const dynamicParams = false;

export function generateStaticParams() {
  return planned().map((p) => ({ slug: p.href.slice('/admin/'.length).split('/') }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = planned().find((x) => x.href === '/admin/' + slug.join('/'));
  return { title: (p ? (p.label === 'Overview' && p.areaLabel ? p.areaLabel : p.label) : 'Not found') + ' · Admin' };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const path = '/admin/' + slug.join('/');
  if (!planned().some((p) => p.href === path)) notFound();
  return <Planned path={path} />;
}
