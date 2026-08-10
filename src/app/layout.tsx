import { Inter } from 'next/font/google';

import Providers from './providers';
import { SnackbarProvider } from '@/providers/SnackbarProvider';

const inter = Inter({ subsets: ['latin'] });

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="tr" className={inter.className}>
      <head>
        <script src="https://js.hcaptcha.com/1/api.js" async defer />
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
