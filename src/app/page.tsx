export default function HomePage() {
  return (
    <main className="page">
      <h1>Peça a próxima música</h1>
      <p>
        Acesse a página pública de uma banda em{' '}
        <code>/banda/[slug]</code> para ver o repertório e, em breve, pedir
        músicas via Pix.
      </p>
      <p className="notice">
        Exemplo: <a href="/banda/classic-riders">/banda/classic-riders</a>
      </p>
    </main>
  );
}
