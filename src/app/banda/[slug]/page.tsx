import type { Metadata } from 'next';
import { RequestSongButton } from '@/components/RequestSongButton';
import { fetchBandBySlug, formatGenre, formatPriceBRL } from '@/lib/api';

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
      <main className="page">
        <h1>{slug}</h1>
        <p>Banda não encontrada ou ainda sem cadastro público.</p>
      </main>
    );
  }

  const socials = [
    { label: 'Instagram', href: band.instagram },
    { label: 'Facebook', href: band.facebook },
    { label: 'TikTok', href: band.tiktok },
    { label: 'YouTube', href: band.youtube },
  ].filter((item) => item.href);

  const hasPrice = band.requestPriceCents > 0;

  return (
    <main className="page">
      <h1>{band.name}</h1>
      <p>
        Escolha uma música do repertório
        {hasPrice ? ` · pedido ${formatPriceBRL(band.requestPriceCents)}` : ''}.
      </p>

      {socials.length > 0 ? (
        <p className="notice">
          {socials.map((item, index) => (
            <span key={item.label}>
              {index > 0 ? ' · ' : null}
              <a href={item.href!} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            </span>
          ))}
        </p>
      ) : null}

      {!band.acceptsPayments ? (
        <p className="notice warning">
          Pedidos via Pix ainda não estão disponíveis para esta banda.
        </p>
      ) : null}

      {band.songs.length === 0 ? (
        <p className="notice">Nenhuma música cadastrada ainda.</p>
      ) : (
        <ul className="song-list">
          {band.songs.map((song) => (
            <li key={song.id} className="song-item">
              <div>
                <strong>
                  {song.name}
                  <span className="song-artist"> - {song.artistName}</span>
                </strong>
                <div className="song-meta">{formatGenre(song.genre)}</div>
              </div>
              <RequestSongButton
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
