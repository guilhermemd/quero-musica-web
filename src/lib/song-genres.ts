/** Mesma lista de categorias usada para bandas. */
export const SONG_GENRES = [
  { value: 'ROCK', label: 'Rock' },
  { value: 'FOLK', label: 'Folk' },
  { value: 'PAGODE', label: 'Pagode' },
  { value: 'SERTANEJO', label: 'Sertanejo' },
  { value: 'POP', label: 'Pop' },
  { value: 'SAMBA', label: 'Samba' },
  { value: 'MPB', label: 'MPB' },
  { value: 'FUNK', label: 'Funk' },
  { value: 'AXE', label: 'Axé' },
  { value: 'FORRO', label: 'Forró' },
  { value: 'GOSPEL', label: 'Gospel' },
  { value: 'ELETRONICA', label: 'Eletrônica' },
  { value: 'HIP_HOP', label: 'Hip Hop' },
  { value: 'RAP', label: 'Rap' },
  { value: 'BLUES', label: 'Blues' },
  { value: 'JAZZ', label: 'Jazz' },
  { value: 'REGGAE', label: 'Reggae' },
  { value: 'ROMANTICA', label: 'Romântica' },
  { value: 'COUNTRY', label: 'Country' },
  { value: 'INDIE', label: 'Indie' },
  { value: 'METAL', label: 'Metal' },
  { value: 'PUNK', label: 'Punk' },
  { value: 'ALTERNATIVO', label: 'Alternativo' },
  { value: 'CLASSICA', label: 'Clássica' },
  { value: 'INFANTIL', label: 'Infantil' },
  { value: 'OUTRO', label: 'Outro' },
] as const;

export type SongGenreValue = (typeof SONG_GENRES)[number]['value'];

export function songGenreLabel(value: string): string {
  return SONG_GENRES.find((genre) => genre.value === value)?.label ?? value;
}
