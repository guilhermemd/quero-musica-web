import { Music2, QrCode, Search, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: '1. Busque a banda',
    description: 'Encontre a banda ideal para seu evento.',
  },
  {
    icon: Music2,
    title: '2. Escolha a música',
    description: 'Selecione a música que a banda vai tocar.',
  },
  {
    icon: QrCode,
    title: '3. Pague no Pix e a banda toca',
    description:
      'Pague com Pix com segurança e a banda confirma e toca no seu evento.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="home-how" aria-labelledby="home-how-title">
      <h2 id="home-how-title" className="home-how__title">
        Como funciona
      </h2>

      <ol className="home-how__list">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="home-how-card">
              <div className="home-how-card__top">
                <span className="home-how-card__icon" aria-hidden>
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <h3 className="home-how-card__heading">{step.title}</h3>
              </div>
              <p className="home-how-card__text">{step.description}</p>
            </li>
          );
        })}
      </ol>

      <p className="home-how__footer">
        <ShieldCheck size={16} strokeWidth={2.25} aria-hidden />
        <span>Simples, seguro e pensado para você.</span>
      </p>
    </section>
  );
}
