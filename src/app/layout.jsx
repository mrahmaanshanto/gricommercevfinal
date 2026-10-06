import '@/styles/globals.css';
import { NavigationBridge } from '@/shell/Shell';
import { Overlays } from '@/components/ui';
import { GridAi } from '@/components/ui/GridAi';
import { ChatDock } from '@/components/inbox/ChatDock';
import { EveningCheck } from '@/components/EveningCheck';
import { MeetingAlerts } from '@/components/MeetingAlerts';
import { HelpPanel } from '@/components/ui/HelpPanel';
import { ProposalBadge } from '@/components/ProposalBadge';

export const metadata = {
  title: { default: 'GridCommerce', template: '%s · GridCommerce' },
  description: 'GridCommerce merchant web app — front end.',
  // the square logo (the collapsed menu's), so browsers stop asking for a missing /favicon.ico
  icons: { icon: '/assets/8c3babaf605936b39809e7960e7c846f.png' },
};

// The demo shop changed (Dazzle Shop: phones, one warehouse, two branches; Oct 2026). Data saved in a browser under an
// older demo is cleared once, before anything reads it; the language, edition preview and sign-in stay. Bump DEMO_DATA
// when the demo data changes shape again.
const DEMO_DATA = 'dazzle-1';
const RESET = `(function(){try{var k='gc.demo.data',v='${DEMO_DATA}';if(localStorage.getItem(k)===v)return;var keep={'gc.edition.preview':1,'gc.locale':1,'gc.session':1,'gc.platform.db':1};for(var i=localStorage.length-1;i>=0;i--){var n=localStorage.key(i);if(n&&n.indexOf('gc.')===0&&!keep[n])localStorage.removeItem(n);}localStorage.setItem(k,v);}catch(e){}})();`;

const FONTS ='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESET }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        {children}
        <NavigationBridge />
        <Overlays />
        <GridAi />
        <ChatDock />
        <EveningCheck />
        <MeetingAlerts />
        <HelpPanel />
        <ProposalBadge />
      </body>
    </html>
  );
}
