import Providers from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <script src="https://js.hcaptcha.com/1/api.js" async defer />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
