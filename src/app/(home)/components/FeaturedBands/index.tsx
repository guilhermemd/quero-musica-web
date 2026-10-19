import Link from 'next/link';

type FeaturedBand = {
  name: string;
  slug: string;
  meta: string;
};

const FEATURED_BANDS: FeaturedBand[] = [
  { name: 'teste', slug: 'teste', meta: 'Sertanejo' },
  { name: 'gmd band', slug: 'gmd-band', meta: 'Pop' },
  { name: 'Só Modão', slug: 'so-modao', meta: 'Modão Universitário' },
  { name: 'Terra & Raiz', slug: 'terra-raiz', meta: 'Sertanejo Raiz' },
];

export function FeaturedBands() {
  return (
    <section className="home-featured" aria-labelledby="home-featured-title">
      <div className="home-featured__header">
        <h2 id="home-featured-title" className="home-featured__title">
          Destaques
        </h2>
        <Link href="/#destaques" className="home-featured__more">
          Ver mais &gt;
        </Link>
      </div>

      <div className="home-featured__track" id="destaques">
        {FEATURED_BANDS.map((band) => (
          <Link
            key={band.slug}
            href={`/banda/${band.slug}`}
            className="home-band-card"
          >
            <div className="home-band-card__image" aria-hidden />
            <div className="home-band-card__body">
              <p className="home-band-card__name">{band.name}</p>
              <p className="home-band-card__meta">{band.meta}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
