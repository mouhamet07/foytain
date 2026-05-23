import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Foytain — Solidarité Médicale',
    template: '%s | Foytain',
  },
  description: 'Plateforme de tontine médicale — Ensemble pour votre santé',
  keywords: ['tontine', 'médicale', 'santé', 'cotisation', 'solidarité'],
  authors: [{ name: 'Foytain Team' }],
  openGraph: {
    type: 'website',
    siteName: 'Foytain',
    title: 'Foytain — Solidarité Médicale',
    description: 'Plateforme de tontine médicale — Ensemble pour votre santé',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
