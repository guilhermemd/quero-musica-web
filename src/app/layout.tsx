import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import '@/styles/globals.scss';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'tocasom',
    template: '%s | tocasom',
  },
  description: 'Peça músicas para bandas via Pix — tocasom.com.br',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${inter.className}`}>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
