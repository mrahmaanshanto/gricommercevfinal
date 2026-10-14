// Phone-app pages (/m-*, /onb-*, /c-*, /app …): the app's session check (screens/app/kit/AppSession.jsx acts on the
// merchant app's /m-* pages only; the rest pass straight through).
import AppSessionGate from '@/screens/app/kit/AppSession';

export default function PhoneAppLayout({ children }) {
  return <AppSessionGate>{children}</AppSessionGate>;
}
