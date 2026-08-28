import { Inter } from 'next/font/google';

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
      </body>
    </html>
  );
};

export default RootLayout;
