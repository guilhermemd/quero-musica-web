import type { Metadata } from 'next';
import { BandSocialLinks } from '@/components/BandSocialLinks';
import { BandSongCatalog } from '@/components/BandSongCatalog';
import { PartyTipDialog } from '@/components/PartyTipDialog';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { fetchBandBySlug, fetchBandSongs } from '@/lib/api';
import { buildBandSocialLinks } from '@/lib/social';

type BandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const band = await fetchBandBySlug(slug);

  return {
    title: band?.name ?? slug,
    description: band
      ? `Repertório de ${band.name} — peça músicas via Pix.`
      : `Página pública da banda ${slug}.`,
  };
}

export default async function BandPage({ params }: BandPageProps) {
  const { slug } = await params;
  const band = await fetchBandBySlug(slug);

  if (!band) {
    return (
      <main className="site-main">
        <h1 className="site-main__title">{slug}</h1>
        <p className="site-main__lead">
          Banda não encontrada ou ainda sem cadastro público.
        </p>
      </main>
    );
  }

  const socials = buildBandSocialLinks(band);
  const initialSongs = await fetchBandSongs(slug, { page: 1, limit: 20 });

  return (
    <main className="site-main">
      <header className="band-hero">
        {band.imageUrl ? (
          <img
            className="band-hero__avatar"
            src={band.imageUrl}
            alt=""
            width={120}
            height={120}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="band-hero__avatar band-hero__avatar--placeholder"
            aria-hidden
          />
        )}
        <h1 className="band-hero__title">{band.name}</h1>
        <BandSocialLinks links={socials} />
      </header>

      {!band.acceptsPayments ? (
        <div className="stack-md">
          <Alert variant="warning">
            <AlertDescription>
              Pedidos via Pix ainda não estão disponíveis para esta banda.
            </AlertDescription>
          </Alert>
        </div>
      ) : null}

      {band.partyTipsEnabled && band.acceptsPayments ? (
        <div className="party-tip-banner">
          <PartyTipDialog
            bandSlug={band.slug}
            bandName={band.name}
            minAmountCents={band.partyTipsMinCents ?? 500}
          />
        </div>
      ) : null}

      <BandSongCatalog
        bandSlug={band.slug}
        priceCents={band.requestPriceCents}
        acceptsPayments={band.acceptsPayments}
        initialSongsCount={band.songsCount ?? initialSongs?.total ?? 0}
        initialPage={initialSongs}
      />
    </main>
  );
}
