export type SocialNetwork =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube';

export type BandSocialLink = {
  network: SocialNetwork;
  label: string;
  href: string;
};

function withProtocol(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

/** Celular BR (11 dígitos) → wa.me com DDI 55. */
export function toWhatsAppHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;

  const withCountry =
    digits.length === 11
      ? `55${digits}`
      : digits.length === 13 && digits.startsWith('55')
        ? digits
        : null;

  if (!withCountry) return null;
  return `https://wa.me/${withCountry}`;
}

/** Converte handle (@user) ou URL parcial em link absoluto. */
export function toSocialHref(
  network: Exclude<SocialNetwork, 'whatsapp'>,
  value: string,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1);
    if (!handle) return null;
    switch (network) {
      case 'instagram':
        return `https://instagram.com/${handle}`;
      case 'tiktok':
        return `https://tiktok.com/@${handle}`;
      default:
        return null;
    }
  }

  return withProtocol(trimmed);
}

export function buildBandSocialLinks(band: {
  phone?: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
}): BandSocialLink[] {
  const links: BandSocialLink[] = [];

  if (band.phone) {
    const whatsappHref = toWhatsAppHref(band.phone);
    if (whatsappHref) {
      links.push({
        network: 'whatsapp',
        label: 'WhatsApp',
        href: whatsappHref,
      });
    }
  }

  const entries: Array<{
    network: Exclude<SocialNetwork, 'whatsapp'>;
    label: string;
    value: string | null;
  }> = [
    { network: 'instagram', label: 'Instagram', value: band.instagram },
    { network: 'facebook', label: 'Facebook', value: band.facebook },
    { network: 'tiktok', label: 'TikTok', value: band.tiktok },
    { network: 'youtube', label: 'YouTube', value: band.youtube },
  ];

  for (const { network, label, value } of entries) {
    if (!value) continue;
    const href = toSocialHref(network, value);
    if (!href) continue;
    links.push({ network, label, href });
  }

  return links;
}
