const PIX_UNAVAILABLE_MESSAGE =
  'Não foi possível gerar o Pix agora. Tente de novo em alguns minutos.';

const FINANCIAL_IDENTITY_CAUSE = /financial identity use case/i;

export function publicActionError(body: string, fallback: string): string {
  const message = readApiMessage(body);
  if (!message) {
    return fallback;
  }
  if (FINANCIAL_IDENTITY_CAUSE.test(message)) {
    return PIX_UNAVAILABLE_MESSAGE;
  }
  return message;
}

function readApiMessage(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown };
    if (typeof parsed.message === 'string') {
      return parsed.message.trim();
    }
    if (Array.isArray(parsed.message)) {
      return parsed.message
        .filter((item): item is string => typeof item === 'string')
        .join('. ')
        .trim();
    }
  } catch {
    if (FINANCIAL_IDENTITY_CAUSE.test(trimmed)) {
      return trimmed;
    }
  }

  return '';
}
