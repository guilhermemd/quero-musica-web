import Link from 'next/link';
import { fetchPublicBands, formatGenre } from '@/lib/api';

export async function FeaturedBands() {
  const bands = await fetchPublicBands(12);

  return (
    <section className="home-featured" aria-labelledby="home-featured-title">
      <div className="home-featured__header">
        <h2 id="home-featured-title" className="home-featured__title">
          Destaques
        </h2>
        {/* <Link href="/#destaques" className="home-featured__more">
          Ver mais &gt;
        </Link> */}
      </div>

      {bands.length === 0 ? (
        <p className="home-featured__empty">
          Nenhuma banda cadastrada ainda.
        </p>
      ) : (
        <div className="home-featured__track" id="destaques">
          {bands.map((band) => (
            <Link
              key={band.id}
              href={`/banda/${band.slug}`}
              className="home-band-card"
            >
              {band.imageUrl ? (
                <img
                  className="home-band-card__image"
                  src={band.imageUrl}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="home-band-card__image" aria-hidden />
              )}
              <div className="home-band-card__body">
                <p className="home-band-card__name">{band.name}</p>
                <p className="home-band-card__meta">
                  {formatGenre(band.genre)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
