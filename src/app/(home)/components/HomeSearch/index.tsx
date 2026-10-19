'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    // Busca na API ainda não existe: tenta slug simples a partir do nome.
    const slug = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (slug) {
      router.push(`/banda/${slug}`);
    }
  }

  return (
    <form className="home-search" onSubmit={handleSubmit} role="search">
      <Search className="home-search__icon" size={18} aria-hidden />
      <input
        className="home-search__input"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar banda ou artista..."
        autoComplete="off"
        enterKeyHint="search"
        aria-label="Buscar banda ou artista"
      />
    </form>
  );
}
