'use client';

import { useEffect, useState } from 'react';
import { formatPriceBRL, getApiUrl } from '@/lib/api';

type RequestSongButtonProps = {
  bandSlug: string;
  songId: string;
  songName: string;
  artistName?: string;
  priceCents: number;
  enabled: boolean;
};

type CreatedOrder = {
  id: string;
  status: string;
  songPriceCents: number;
  payment: {
    pixCopyPaste: string | null;
    status?: string;
  };
};

export function RequestSongButton({
  bandSlug,
  songId,
  songName,
  artistName,
  priceCents,
  enabled,
}: RequestSongButtonProps) {
  const songLabel = artistName ? `${songName} - ${artistName}` : songName;
  const [open, setOpen] = useState(false);
  const [requesterName, setRequesterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order?.id || order.status === 'PAID') {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      try {
        await fetch(`${getApiUrl()}/orders/public/${order.id}/sync`, {
          method: 'POST',
        });
        const response = await fetch(`${getApiUrl()}/orders/public/${order.id}`);
        if (!response.ok || cancelled) return;
        const next = (await response.json()) as CreatedOrder;
        if (!cancelled) {
          setOrder(next);
        }
      } catch {
        // silencioso durante o polling
      }
    };

    void tick();
    const interval = window.setInterval(() => {
      void tick();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [order?.id, order?.status]);

  async function handleCreateOrder() {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch(`${getApiUrl()}/orders/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bandSlug,
          songId,
          requesterName: requesterName.trim(),
        }),
      });

      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || `Erro ${response.status}`);
      }

      setOrder(JSON.parse(body) as CreatedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar pedido');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!order?.payment.pixCopyPaste) return;
    await navigator.clipboard.writeText(order.payment.pixCopyPaste);
    setCopied(true);
  }

  if (!enabled) {
    return (
      <button type="button" className="song-action" disabled>
        Indisponível
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="song-action"
        onClick={() => setOpen(true)}
      >
        Pedir · {formatPriceBRL(priceCents)}
      </button>
    );
  }

  const isPaid = order?.status === 'PAID';

  return (
    <div className="request-box">
      {!order ? (
        <>
          <p className="request-title">
            Pedir “{songName}
            {artistName ? (
              <span className="song-artist"> - {artistName}</span>
            ) : null}
            ”
          </p>
          <label className="request-label">
            Seu nome
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={requesterName}
              onChange={(event) => setRequesterName(event.target.value)}
              placeholder="Como a banda te chama?"
            />
          </label>
          {error ? <p className="request-error">{error}</p> : null}
          <div className="request-actions">
            <button
              type="button"
              className="song-action secondary"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="song-action"
              onClick={() => void handleCreateOrder()}
              disabled={loading || requesterName.trim().length < 2}
            >
              {loading ? 'Gerando Pix...' : 'Gerar Pix'}
            </button>
          </div>
        </>
      ) : isPaid ? (
        <>
          <p className="request-title">Pagamento confirmado</p>
          <p className="request-hint">
            Pedido de “{songLabel}” pago com sucesso. A banda já pode tocar.
          </p>
          <button
            type="button"
            className="song-action secondary"
            onClick={() => {
              setOpen(false);
              setOrder(null);
              setRequesterName('');
              setCopied(false);
            }}
          >
            Fechar
          </button>
        </>
      ) : (
        <>
          <p className="request-title">Pix gerado</p>
          <p className="request-hint">
            Copie o código e pague no app do seu banco. Valor:{' '}
            {formatPriceBRL(order.songPriceCents)}. Aguardando confirmação…
          </p>
          <textarea
            className="pix-code"
            readOnly
            value={order.payment.pixCopyPaste ?? ''}
            rows={4}
          />
          <div className="request-actions">
            <button
              type="button"
              className="song-action"
              onClick={() => void handleCopy()}
            >
              {copied ? 'Copiado!' : 'Copiar Pix'}
            </button>
            <button
              type="button"
              className="song-action secondary"
              onClick={() => {
                setOpen(false);
                setOrder(null);
                setRequesterName('');
                setCopied(false);
              }}
            >
              Fechar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
