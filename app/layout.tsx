import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Georgian } from 'next/font/google';
import type { ReactNode } from 'react';
import { Boot, Gate } from '@/components/Boot';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ModalHost } from '@/components/ModalHost';
import { Navigator } from '@/components/Navigator';
import { Toaster } from '@/components/Toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const georgian = Noto_Sans_Georgian({ subsets: ['georgian', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-georgian', display: 'swap' });

export const metadata: Metadata = {
  title: 'dazgveva.ge — V3 პროტოტიპი',
  description: 'აპოვნინე ხელოვნურ ინტელექტს შენთვის შესაფერისი სადაზღვევო პაკეტი. დემო ვერსია.',
  icons: { icon: '/logo.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ka" className={`${inter.variable} ${georgian.variable}`}>
      <body className="min-h-screen bg-white font-sans text-zinc-950 antialiased">
        <Boot />
        <Header />
        <main className="pb-24"><Gate>{children}</Gate></main>
        <Footer />
        <Navigator />
        <ModalHost />
        <Toaster />
      </body>
    </html>
  );
}
