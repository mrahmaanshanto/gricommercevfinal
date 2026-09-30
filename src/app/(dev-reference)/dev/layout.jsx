import { notFound } from 'next/navigation';

// Reference material (UI kit, flows, site map, storyboards). Always available while developing;
// in a production build it is served only when NEXT_PUBLIC_SHOW_STORYBOARD=true.
export default function DevLayout({ children }) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SHOW_STORYBOARD !== 'true') notFound();
  return children;
}
