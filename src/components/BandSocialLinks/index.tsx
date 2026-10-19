import type { BandSocialLink, SocialNetwork } from '@/lib/social';

function SocialIcon({ network }: { network: SocialNetwork }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true as const,
  };

  switch (network) {
    case 'whatsapp':
      return (
        <svg {...common}>
          <path d="M12.04 2a9.94 9.94 0 0 0-8.6 14.9L2 22l5.24-1.37A9.94 9.94 0 1 0 12.04 2Zm0 1.8a8.14 8.14 0 0 1 6.9 12.4 8.14 8.14 0 0 1-9.7 2.55l-.35-.2-3.1.81.83-3.02-.22-.37A8.14 8.14 0 0 1 12.04 3.8Zm4.66 11.66c-.2.56-1.15 1.03-1.6 1.1-.41.06-.93.09-1.5-.09-.35-.11-.79-.26-1.36-.5-2.39-1.03-3.94-3.44-4.06-3.6-.12-.16-1-1.33-1-2.54s.63-1.8.85-2.05c.2-.23.45-.29.6-.29h.44c.14 0 .33-.05.52.4.2.47.67 1.63.73 1.75.06.12.1.25.02.41-.08.16-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.24.24-.1.47.14.23.62 1.02 1.33 1.65.92.82 1.69 1.08 1.93 1.2.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.14 1.14Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common}>
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Z" />
          <path d="M12 7.2A4.8 4.8 0 1 1 12 16.8 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 12 14.8 2.8 2.8 0 0 0 12 9.2Z" />
          <circle cx="17.4" cy="6.6" r="1.2" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...common}>
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...common}>
          <path d="M16.5 3c.4 2.2 1.8 3.8 4 4.2v2.7c-1.4-.1-2.7-.5-3.8-1.2v6.6c0 3.5-2.7 6.2-6.4 6.2S4 18.8 4 15.3s2.8-6.3 6.3-6.3c.3 0 .7 0 1 .1v2.9a3.4 3.4 0 0 0-1-.1c-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.5-1.5 3.5-3.4V3h2.7Z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      );
  }
}

export function BandSocialLinks({ links }: { links: BandSocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <nav className="band-socials" aria-label="Redes sociais da banda">
      {links.map((link) => (
        <a
          key={link.network}
          className="band-socials__link"
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          title={link.label}
        >
          <SocialIcon network={link.network} />
        </a>
      ))}
    </nav>
  );
}
