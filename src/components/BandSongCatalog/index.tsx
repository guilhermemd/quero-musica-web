'use client';

import { Search } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { RequestSongDialog } from '@/components/RequestSongDialog';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  fetchBandSongs,
  formatGenre,
  type PublicBandSongsPage,
  type PublicSong,
} from '@/lib/api';
import { GenreFilter } from './GenreFilter';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 320;
const SEARCH_MIN_CHARS = 2;

type BandSongCatalogProps = {
  bandSlug: string;
  priceCents: number;
  acceptsPayments: boolean;
  initialSongsCount: number;
  initialPage: PublicBandSongsPage | null;
};

export function BandSongCatalog({
  bandSlug,
  priceCents,
  acceptsPayments,
  initialSongsCount,
  initialPage,
}: BandSongCatalogProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(initialPage?.page ?? 1);
  const [data, setData] = useState<PublicBandSongsPage | null>(initialPage);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const requestId = useRef(0);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = query.trim();
      setDebouncedQuery(
        trimmed.length >= SEARCH_MIN_CHARS ? trimmed : '',
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    const id = ++requestId.current;
    startTransition(async () => {
      setError(null);
      const result = await fetchBandSongs(bandSlug, {
        page,
        limit: PAGE_SIZE,
        genre: genre || undefined,
        q: debouncedQuery || undefined,
      });

      if (id !== requestId.current) return;

      if (!result) {
        setError('Não foi possível carregar as músicas.');
        return;
      }

      setData(result);
      if (page > result.totalPages) {
        setPage(result.totalPages);
      }
    });
  }, [bandSlug, page, genre, debouncedQuery]);

  function handleGenreChange(nextGenre: string) {
    setGenre(nextGenre);
    setPage(1);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  const songs: PublicSong[] = data?.items ?? [];
  const genres = data?.genres ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasCatalog = initialSongsCount > 0 || total > 0 || genres.length > 0;

  if (!hasCatalog && !query && !genre) {
    return (
      <div className="stack-md">
        <Alert>
          <AlertDescription>Nenhuma música cadastrada ainda.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <section className="band-catalog" aria-label="Repertório">
      <div className="band-catalog__filters">
        <label className="band-catalog__search">
          <Search className="band-catalog__search-icon" size={18} aria-hidden />
          <input
            className="band-catalog__search-input"
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Buscar música ou artista..."
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Buscar música ou artista"
          />
        </label>

        <GenreFilter
          value={genre}
          options={genres}
          onChange={handleGenreChange}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {songs.length === 0 ? (
        <Alert>
          <AlertDescription>
            {query.trim().length >= SEARCH_MIN_CHARS || genre
              ? 'Nenhuma música encontrada com esses filtros.'
              : 'Nenhuma música cadastrada ainda.'}
          </AlertDescription>
        </Alert>
      ) : (
        <ul className={`song-list${isPending ? ' is-loading' : ''}`}>
          {songs.map((song) => (
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
                bandSlug={bandSlug}
                songId={song.id}
                songName={song.name}
                artistName={song.artistName}
                priceCents={priceCents}
                enabled={acceptsPayments}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="band-catalog__pagination">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <p className="band-catalog__page">
            Página {page} de {totalPages}
            <span className="band-catalog__total"> · {total} músicas</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </section>
  );
}
