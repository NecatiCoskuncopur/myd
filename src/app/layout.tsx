'use client';

import { Inter } from 'next/font/google';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { theme } from '@/theme/theme';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="tr" className={inter.className}>
      <script src="https://js.hcaptcha.com/1/api.js" async defer />
      <body>
        <Providers>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
