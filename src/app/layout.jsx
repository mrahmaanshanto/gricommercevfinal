import '@/styles/globals.css';
import { NavigationBridge } from '@/shell/Shell';
import { Overlays } from '@/components/ui';
import { GridAi } from '@/components/ui/GridAi';
import { ChatDock } from '@/components/inbox/ChatDock';
import { EveningCheck } from '@/components/EveningCheck';
import { HelpPanel } from '@/components/ui/HelpPanel';
import { ProposalBadge } from '@/components/ProposalBadge';

export const metadata = {
  title: { default: 'GridCommerce', template: '%s · GridCommerce' },
  description: 'GridCommerce merchant web app — front end.',
  // the square logo (the collapsed menu's), so browsers stop asking for a missing /favicon.ico
  icons: { icon: '/assets/8c3babaf605936b39809e7960e7c846f.png' },
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
        <HelpPanel />
        <ProposalBadge />
      </body>
    </html>
  );
}
