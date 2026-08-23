import { Inter } from 'next/font/google';
import Script from 'next/script';

import { SnackbarProvider } from '@/providers/SnackbarProvider';

import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="tr" className={inter.className}>
      <head>
        <title>MYD Export Panel</title>
      </head>
      <body>
        <SnackbarProvider>
          <Providers>{children}</Providers>
        </SnackbarProvider>

        <Script src="https://js.hcaptcha.com/1/api.js" strategy="afterInteractive" />
      </body>
    </html>
  );
};

export default RootLayout;
