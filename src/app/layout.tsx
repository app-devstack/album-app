import type { Metadata, Viewport } from 'next';
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: '思い出帳 — 共有フォトアルバム',
  description:
    '家族や大切な人と思い出の写真をシェアする、美しいフォトアルバムアプリ。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#f5f0e8',
  width: 'device-width',
  initialScale: 1,
};

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
  // display: 'swap',
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  // weight: ['400', '600'],
  variable: '--font-serif',
  // display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={cn(
          'font-sans antialiased',
          notoSansJP.variable,
          notoSerifJP.variable
        )}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
