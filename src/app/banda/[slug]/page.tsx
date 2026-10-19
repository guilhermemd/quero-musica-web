import type { Metadata } from 'next';
import { BandSocialLinks } from '@/components/BandSocialLinks';
import { RequestSongDialog } from '@/components/RequestSongDialog';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { fetchBandBySlug, formatGenre } from '@/lib/api';
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

  return (
    <main className="site-main">
      <h1 className="site-main__title">{band.name}</h1>

      <BandSocialLinks links={socials} />

      {!band.acceptsPayments ? (
        <div className="stack-md">
          <Alert variant="warning">
            <AlertDescription>
              Pedidos via Pix ainda não estão disponíveis para esta banda.
            </AlertDescription>
          </Alert>
        </div>
      ) : null}

      {band.songs.length === 0 ? (
        <div className="stack-md">
          <Alert>
            <AlertDescription>Nenhuma música cadastrada ainda.</AlertDescription>
          </Alert>
        </div>
      ) : (
        <ul className="song-list">
          {band.songs.map((song) => (
            <li key={song.id} className="song-item">
              <div>
                <p className="song-item__title">
                  {song.name}
                  <span className="song-item__artist"> - {song.artistName}</span>
                </p>
                <div className="song-item__meta">
                  <Badge variant="secondary">{formatGenre(song.genre)}</Badge>
                </div>
              </div>
              <RequestSongDialog
                bandSlug={band.slug}
                songId={song.id}
                songName={song.name}
                artistName={song.artistName}
                priceCents={band.requestPriceCents}
                enabled={band.acceptsPayments}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
