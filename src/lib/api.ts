const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type PublicSong = {
  id: string;
  name: string;
  artistName: string;
  genre: string;
};

export type PublicBandListItem = {
  id: string;
  name: string;
  slug: string;
  genre: string | null;
  imageUrl: string | null;
  requestPriceCents: number;
  acceptsPayments: boolean;
};

export type PublicBand = PublicBandListItem & {
  phone: string | null;
  showWhatsapp?: boolean;
  partyTipsEnabled?: boolean;
  partyTipsMinCents?: number;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  songsCount?: number;
};

export type PublicBandSongsPage = {
  items: PublicSong[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  genres: string[];
};

export type FetchBandSongsParams = {
  page?: number;
  limit?: number;
  genre?: string;
  q?: string;
};

const GENRE_LABELS: Record<string, string> = {
  ROCK: 'Rock',
  FOLK: 'Folk',
  PAGODE: 'Pagode',
  SERTANEJO: 'Sertanejo',
  POP: 'Pop',
  SAMBA: 'Samba',
  MPB: 'MPB',
  FUNK: 'Funk',
  AXE: 'Axé',
  FORRO: 'Forró',
  GOSPEL: 'Gospel',
  ELETRONICA: 'Eletrônica',
  HIP_HOP: 'Hip Hop',
  RAP: 'Rap',
  BLUES: 'Blues',
  JAZZ: 'Jazz',
  REGGAE: 'Reggae',
  ROMANTICA: 'Romântica',
  COUNTRY: 'Country',
  INDIE: 'Indie',
  METAL: 'Metal',
  PUNK: 'Punk',
  ALTERNATIVO: 'Alternativo',
  CLASSICA: 'Clássica',
  INFANTIL: 'Infantil',
  OUTRO: 'Outro',
};

export function getApiUrl() {
  return API_URL;
}

export async function fetchPublicBands(
  limit = 20,
): Promise<PublicBandListItem[]> {
  try {
    const response = await fetch(
      `${API_URL}/bands/public?limit=${limit}`,
      { next: { revalidate: 30 } },
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as PublicBandListItem[];
  } catch {
    return [];
  }
}

export async function fetchBandBySlug(
  slug: string,
): Promise<PublicBand | null> {
  try {
    const response = await fetch(`${API_URL}/bands/public/${slug}`, {
      next: { revalidate: 10 },
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

export async function fetchBandSongs(
  slug: string,
  params: FetchBandSongsParams = {},
  init?: RequestInit,
): Promise<PublicBandSongsPage | null> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.genre) search.set('genre', params.genre);
  if (params.q?.trim()) search.set('q', params.q.trim());

  const query = search.toString();
  const url = `${API_URL}/bands/public/${encodeURIComponent(slug)}/songs${
    query ? `?${query}` : ''
  }`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...init,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicBandSongsPage;
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

const MONEY_CENTS_MAX = 1_000_000;
const MONEY_DIGITS_MAX = String(MONEY_CENTS_MAX).length;
export const MONEY_MASK_MAX_LENGTH = 10;

function moneyDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, MONEY_DIGITS_MAX);
}

export function formatCentsAsMoneyMask(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) return '';
  const capped = Math.min(Math.trunc(cents), MONEY_CENTS_MAX);
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(capped / 100);
}

export function formatMoneyMask(value: string): string {
  const digits = moneyDigits(value);
  if (!digits) return '';
  return formatCentsAsMoneyMask(Number.parseInt(digits, 10));
}

export function parseReaisToCents(value: string): number | null {
  const digits = moneyDigits(value);
  if (!digits) return null;
  const cents = Number.parseInt(digits, 10);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return Math.min(cents, MONEY_CENTS_MAX);
}

export function formatGenre(genre: string | null | undefined) {
  if (!genre) return 'Sem categoria';
  return GENRE_LABELS[genre] ?? genre;
}
