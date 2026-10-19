'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { songGenreLabel } from '@/lib/song-genres';

type GenreFilterProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function GenreFilter({ value, options, onChange }: GenreFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const label =
    value === '' ? 'Todas' : songGenreLabel(value);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const items = [{ value: '', label: 'Todas' }, ...options.map((option) => ({
    value: option,
    label: songGenreLabel(option),
  }))];

  return (
    <div className="band-catalog__genre" ref={rootRef}>
      <span className="band-catalog__genre-label" id={`${listId}-label`}>
        Categoria
      </span>
      <button
        type="button"
        className={`band-catalog__genre-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${listId}-label`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{label}</span>
        <ChevronDown size={16} aria-hidden />
      </button>

      {open ? (
        <ul
          id={listId}
          className="band-catalog__genre-menu"
          role="listbox"
          aria-label="Categoria"
        >
          {items.map((item) => {
            const selected = item.value === value;
            return (
              <li key={item.value || 'all'} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`band-catalog__genre-option${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  {selected ? <Check size={14} aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
