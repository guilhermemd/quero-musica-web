'use client';

import { useEffect, useState } from 'react';
import { PartyTipDialog } from '@/components/PartyTipDialog';
import { getApiUrl } from '@/lib/api';

type PartyTipBannerProps = {
  bandSlug: string;
  bandName: string;
  minAmountCents: number;
  initiallyEnabled: boolean;
};

type PublicBandSnippet = {
  partyTipsEnabled?: boolean;
  partyTipsMinCents?: number;
};

export function PartyTipBanner({
  bandSlug,
  bandName,
  minAmountCents,
  initiallyEnabled,
}: PartyTipBannerProps) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [minCents, setMinCents] = useState(minAmountCents);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEnabled(initiallyEnabled);
    setMinCents(minAmountCents);
  }, [initiallyEnabled, minAmountCents]);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/bands/public/${encodeURIComponent(bandSlug)}`,
          { cache: 'no-store' },
        );
        if (!response.ok || cancelled) return;
        const band = (await response.json()) as PublicBandSnippet;
        if (cancelled) return;
        setEnabled(Boolean(band.partyTipsEnabled));
        if (
          typeof band.partyTipsMinCents === 'number' &&
          Number.isFinite(band.partyTipsMinCents) &&
          band.partyTipsMinCents > 0
        ) {
          setMinCents(band.partyTipsMinCents);
        }
      } catch {
        // mantém SSR se a confirmação falhar
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [bandSlug]);

  // Só mostra depois de confirmar na API (evita botão fantasma por cache do SSR)
  if (!ready || !enabled) {
    return null;
  }

  return (
    <div className="party-tip-banner">
      <PartyTipDialog
        bandSlug={bandSlug}
        bandName={bandName}
        minAmountCents={minCents}
      />
    </div>
  );
}
