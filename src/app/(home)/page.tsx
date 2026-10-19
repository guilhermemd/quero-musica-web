import { FeaturedBands } from './components/FeaturedBands';
import { HomeSearch } from './components/HomeSearch';
import { HowItWorks } from './components/HowItWorks';

export default function HomePage() {
  return (
    <main className="home">
      <section className="home-fold">
        <header className="home-brand">
          <h1 className="home-brand__logo">
            <span className="home-brand__toca">TOCA</span>
            <span className="home-brand__som">SOM</span>
          </h1>
          <p className="home-brand__tagline">Peça sua música</p>
        </header>

        <HomeSearch />
        <FeaturedBands />
      </section>

      <HowItWorks />
    </main>
  );
}
