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

type PartyTipDialogProps = {
  bandSlug: string;
  bandName: string;
  minAmountCents: number;
};

type CreatedTip = {
  id: string;
  status: string;
  amountCents: number;
  payment: {
    pixCopyPaste: string | null;
    status?: string;
  };
};

export function PartyTipDialog({
  bandSlug,
  bandName,
  minAmountCents,
}: PartyTipDialogProps) {
  const [open, setOpen] = useState(false);
  const [minCents, setMinCents] = useState(minAmountCents);
  const [contributorName, setContributorName] = useState('');
  const [amountInput, setAmountInput] = useState(
    formatCentsAsMoneyMask(minAmountCents),
  );
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tip, setTip] = useState<CreatedTip | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMinCents(minAmountCents);
  }, [minAmountCents]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const refreshMin = async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/bands/public/${encodeURIComponent(bandSlug)}`,
          { cache: 'no-store' },
        );
        if (!response.ok || cancelled) return;
        const band = (await response.json()) as {
          partyTipsMinCents?: number;
        };
        const nextMin = band.partyTipsMinCents;
        if (
          typeof nextMin === 'number' &&
          Number.isFinite(nextMin) &&
          nextMin > 0
        ) {
          setMinCents(nextMin);
          setAmountInput((current) => {
            const parsed = parseReaisToCents(current);
            if (parsed === null || parsed < nextMin) {
              return formatCentsAsMoneyMask(nextMin);
            }
            return current;
          });
        }
      } catch {
        /* mantém mínimo conhecido */
      }
    };

    void refreshMin();

    return () => {
      cancelled = true;
    };
  }, [open, bandSlug]);

  useEffect(() => {
    if (!tip?.id || tip.status === 'PAID') {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      try {
        await fetch(`${getApiUrl()}/tips/public/${tip.id}/sync`, {
          method: 'POST',
        });
        const response = await fetch(`${getApiUrl()}/tips/public/${tip.id}`);
        if (!response.ok || cancelled) return;
        const next = (await response.json()) as CreatedTip;
        if (!cancelled) {
          setTip(next);
        }
      } catch {
        /* polling */
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
  }, [tip?.id, tip?.status]);

  function resetState() {
    setContributorName('');
    setAmountInput(formatCentsAsMoneyMask(minCents));
    setNameError(null);
    setAmountError(null);
    setSubmitError(null);
    setTip(null);
    setCopied(false);
    setLoading(false);
  }

  function validateFields() {
    const trimmedName = contributorName.trim();
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
    } else if (amountCents < minCents) {
      nextAmountError = `O valor mínimo é ${formatPriceBRL(minCents)}`;
    }

    setNameError(nextNameError);
    setAmountError(nextAmountError);

    return {
      ok: !nextNameError && !nextAmountError,
      trimmedName,
      amountCents,
    };
  }

  async function handleCreateTip() {
    setSubmitError(null);
    const { ok, trimmedName, amountCents } = validateFields();
    if (!ok || amountCents === null) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/tips/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bandSlug,
          contributorName: trimmedName,
          amountCents,
        }),
      });

      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || `Erro ${response.status}`);
      }

      setTip(JSON.parse(body) as CreatedTip);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Falha ao gerar contribuição',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!tip?.payment.pixCopyPaste) return;
    await navigator.clipboard.writeText(tip.payment.pixCopyPaste);
    setCopied(true);
  }

  const isPaid = tip?.status === 'PAID';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          resetState();
        } else {
          setAmountInput(formatCentsAsMoneyMask(minCents));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="lg" className="party-tip-cta">
          Quer continuar a festa?
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!tip ? (
          <>
            <DialogHeader>
              <DialogTitle>Quer continuar a festa?</DialogTitle>
              <DialogDescription>
                Contribua com {bandName} via Pix · mínimo{' '}
                {formatPriceBRL(minCents)}
              </DialogDescription>
            </DialogHeader>
            <div className="request-song-dialog__form">
              <div className="request-song-dialog__field">
                <Label htmlFor="party-tip-name">Seu nome</Label>
                <Input
                  id="party-tip-name"
                  maxLength={80}
                  value={contributorName}
                  aria-invalid={Boolean(nameError)}
                  onChange={(event) => {
                    setContributorName(event.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Como a banda te chama?"
                />
                {nameError ? (
                  <p className="request-song-dialog__error">{nameError}</p>
                ) : null}
              </div>

              <div className="request-song-dialog__field">
                <Label htmlFor="party-tip-amount">Valor do Pix (R$)</Label>
                <Input
                  id="party-tip-amount"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={MONEY_MASK_MAX_LENGTH}
                  value={amountInput}
                  aria-invalid={Boolean(amountError)}
                  onChange={(event) => {
                    setAmountInput(formatMoneyMask(event.target.value));
                    if (amountError) setAmountError(null);
                  }}
                  placeholder={formatCentsAsMoneyMask(minCents)}
                />
                {amountError ? (
                  <p className="request-song-dialog__error">{amountError}</p>
                ) : (
                  <p className="request-song-dialog__hint">
                    Qualquer valor a partir do mínimo ajuda a manter a festa.
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
                onClick={() => void handleCreateTip()}
                disabled={loading}
              >
                {loading ? 'Gerando Pix...' : 'Gerar Pix'}
              </Button>
            </DialogFooter>
          </>
        ) : isPaid ? (
          <div className="request-song-dialog__paid">
            <DialogHeader>
              <DialogTitle>Obrigado!</DialogTitle>
              <DialogDescription>
                Sua contribuição foi confirmada. A festa continua.
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
                {formatPriceBRL(tip.amountCents)}. Aguardando confirmação…
              </DialogDescription>
            </DialogHeader>
            <Textarea
              readOnly
              value={tip.payment.pixCopyPaste ?? ''}
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
