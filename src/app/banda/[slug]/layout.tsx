import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function BandLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
