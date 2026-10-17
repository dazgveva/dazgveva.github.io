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
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#ffffff' };

/* Every clickable gets the hand cursor (Tailwind v4 leaves buttons on the default arrow);
   taps get no grey flash and no double-tap-zoom delay. */
const INTERACTIVE = '[&_button:not(:disabled)]:cursor-pointer [&_[role=button]]:cursor-pointer [&_[role=checkbox]]:cursor-pointer [&_[role=radio]]:cursor-pointer [&_[role=switch]]:cursor-pointer [&_select]:cursor-pointer [&_summary]:cursor-pointer [&_input[type=range]]:cursor-pointer [&_label:has(input[type=checkbox],input[type=radio])]:cursor-pointer [&_button]:touch-manipulation [&_a]:touch-manipulation [-webkit-tap-highlight-color:transparent]';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Browser extensions add attributes to <html> before React loads (e.g. data-mbtss-nonce); this
    // silences only those attribute mismatches on this one element, not errors in the app below it.
    <html lang="ka" className={`${inter.variable} ${georgian.variable}`} suppressHydrationWarning>
      <body className={`min-h-dvh bg-white font-sans text-zinc-950 antialiased selection:bg-brand-200 selection:text-navy-950 ${INTERACTIVE}`}>
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
