import '@/styles/globals.css';
import { NavigationBridge } from '@/shell/Shell';
import { Overlays } from '@/components/ui';
import { GridAi } from '@/components/ui/GridAi';

export const metadata = {
  title: { default: 'GridCommerce', template: '%s · GridCommerce' },
  description: 'GridCommerce merchant web app — front end.',
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
      </body>
    </html>
  );
}
