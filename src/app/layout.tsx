import { Inter } from 'next/font/google';

import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="tr" className={inter.className}>
      <head>
        <script src="https://js.hcaptcha.com/1/api.js" async defer />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
