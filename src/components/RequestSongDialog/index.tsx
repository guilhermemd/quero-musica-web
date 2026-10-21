'use client';

import { useEffect, useState } from 'react';
import {
  formatCentsAsMoneyMask,
  formatMoneyMask,
  formatPriceBRL,
  getApiUrl,
  MONEY_MASK_MAX_LENGTH,
  parseReaisToCents,
} from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

type RequestSongDialogProps = {
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

export function RequestSongDialog({
  bandSlug,
  songId,
  songName,
  artistName,
  priceCents,
  enabled,
}: RequestSongDialogProps) {
  const songLabel = artistName ? `${songName} - ${artistName}` : songName;
  const [open, setOpen] = useState(false);
  const [requesterName, setRequesterName] = useState('');
  const [amountInput, setAmountInput] = useState(
    formatCentsAsMoneyMask(priceCents),
  );
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  function resetState() {
    setRequesterName('');
    setAmountInput(formatCentsAsMoneyMask(priceCents));
    setNameError(null);
    setAmountError(null);
    setSubmitError(null);
    setOrder(null);
    setCopied(false);
    setLoading(false);
  }

  function validateFields() {
    const trimmedName = requesterName.trim();
    let nextNameError: string | null = null;
    let nextAmountError: string | null = null;

    if (!trimmedName) {
      nextNameError = 'Informe seu nome';
    } else if (trimmedName.length < 2) {
      nextNameError = 'Nome precisa ter pelo menos 2 caracteres';
    }

    const amountCents = parseReaisToCents(amountInput);
    if (amountCents === null) {
      nextAmountError = 'Informe um valor válido';
    } else if (amountCents < priceCents) {
      nextAmountError = `O valor mínimo é ${formatPriceBRL(priceCents)}`;
    }

    setNameError(nextNameError);
    setAmountError(nextAmountError);

    return {
      ok: !nextNameError && !nextAmountError,
      trimmedName,
      amountCents,
    };
  }

  async function handleCreateOrder() {
    setSubmitError(null);
    const { ok, trimmedName, amountCents } = validateFields();
    if (!ok || amountCents === null) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/orders/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bandSlug,
          songId,
          requesterName: trimmedName,
          amountCents,
        }),
      });

      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || `Erro ${response.status}`);
      }

      setOrder(JSON.parse(body) as CreatedOrder);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Falha ao criar pedido',
      );
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
      <Button type="button" variant="secondary" size="sm" disabled>
        Indisponível
      </Button>
    );
  }

  const isPaid = order?.status === 'PAID';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          resetState();
        } else {
          setAmountInput(formatCentsAsMoneyMask(priceCents));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          Pedir · {formatPriceBRL(priceCents)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!order ? (
          <>
            <DialogHeader>
              <DialogTitle>Pedir música</DialogTitle>
              <DialogDescription>
                “{songLabel}” · mínimo {formatPriceBRL(priceCents)}
              </DialogDescription>
            </DialogHeader>
            <div className="request-song-dialog__form">
              <div className="request-song-dialog__field">
                <Label htmlFor={`requester-${songId}`}>Seu nome</Label>
                <Input
                  id={`requester-${songId}`}
                  maxLength={80}
                  value={requesterName}
                  aria-invalid={Boolean(nameError)}
                  onChange={(event) => {
                    setRequesterName(event.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Como a banda te chama?"
                />
                {nameError ? (
                  <p className="request-song-dialog__error">{nameError}</p>
                ) : null}
              </div>

              <div className="request-song-dialog__field">
                <Label htmlFor={`amount-${songId}`}>Valor do Pix (R$)</Label>
                <Input
                  id={`amount-${songId}`}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={MONEY_MASK_MAX_LENGTH}
                  value={amountInput}
                  aria-invalid={Boolean(amountError)}
                  onChange={(event) => {
                    setAmountInput(formatMoneyMask(event.target.value));
                    if (amountError) setAmountError(null);
                  }}
                  placeholder={formatCentsAsMoneyMask(priceCents)}
                />
                {amountError ? (
                  <p className="request-song-dialog__error">{amountError}</p>
                ) : (
                  <p className="request-song-dialog__hint">
                    Você pode contribuir com um valor maior que o mínimo.
                  </p>
                )}
              </div>

              {submitError ? (
                <p className="request-song-dialog__error">{submitError}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => void handleCreateOrder()}
                disabled={loading}
              >
                {loading ? 'Gerando Pix...' : 'Gerar Pix'}
              </Button>
            </DialogFooter>
          </>
        ) : isPaid ? (
          <div className="request-song-dialog__paid">
            <DialogHeader>
              <DialogTitle>Pagamento confirmado</DialogTitle>
              <DialogDescription>
                Pedido de “{songLabel}” pago com sucesso. A banda já pode tocar.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pix gerado</DialogTitle>
              <DialogDescription>
                Copie o código e pague no app do seu banco. Valor:{' '}
                {formatPriceBRL(order.songPriceCents)}. Aguardando confirmação…
              </DialogDescription>
            </DialogHeader>
            <Textarea
              readOnly
              value={order.payment.pixCopyPaste ?? ''}
              rows={4}
            />
            <DialogFooter>
              <Button type="button" onClick={() => void handleCopy()}>
                {copied ? 'Copiado!' : 'Copiar Pix'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
