const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type PublicSong = {
  id: string;
  name: string;
  artistName: string;
  genre: string;
};

export type PublicBand = {
  id: string;
  name: string;
  slug: string;
  requestPriceCents: number;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  songs: PublicSong[];
};

const GENRE_LABELS: Record<string, string> = {
  POP: 'Pop',
  REGGAE: 'Reggae',
  ROMANTICA: 'Romântica',
  SERTANEJO: 'Sertanejo',
};

export function getApiUrl() {
  return API_URL;
}

export async function fetchBandBySlug(
  slug: string,
): Promise<PublicBand | null> {
  try {
    const response = await fetch(`${API_URL}/bands/public/${slug}`, {
      next: { revalidate: 60 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicBand;
  } catch {
    return null;
  }
}

export function formatPriceBRL(priceCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceCents / 100);
}

export function formatGenre(genre: string) {
  return GENRE_LABELS[genre] ?? genre;
}
