import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Quero Música',
    template: '%s | Quero Música',
  },
  description: 'Peça músicas para bandas via Pix.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="shell">
          <header className="site-header">
            <a href="/" className="brand">
              Quero Música
            </a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
