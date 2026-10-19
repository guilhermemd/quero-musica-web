import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand">
          <span className="site-header__toca">TOCA</span>
          <span className="site-header__som">SOM</span>
        </Link>
        <span className="site-header__hint">Peça sua música</span>
      </div>
    </header>
  );
}
