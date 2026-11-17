# Contexto — Web (`@quero-musica/web`)

Site público do **Toca Som** (`tocasom.com.br`). Quem está na plateia busca uma banda, escolhe uma música e paga no Pix, ou contribui para continuar a festa. Não há login neste app.

## Como ler este arquivo

A raiz deste repositório **é** o site público. Não existe pasta `apps/web` aqui dentro. API (porta 3001) e admin (porta 3000) são outros repositórios git. O código deles não está neste workspace. Não procure o `CONTEXTO.md` deles aqui.

Não há testes automatizados. Não criar Jest, Vitest, Playwright nem script de teste para “completar” o projeto.

Contrato com a API que este app usa de fato:

- `GET /bands/public` e `GET /bands/public/:slug`
- `GET /bands/public/:slug/songs`
- `POST /orders/public`, `POST /orders/public/:id/sync`, `GET /orders/public/:id`
- `POST /tips/public`, `POST /tips/public/:id/sync`, `GET /tips/public/:id`

Não há login, cookie nem `Authorization` neste app.

| Ambiente | URL | API |
| --- | --- | --- |
| Dev | http://localhost:3002 | `NEXT_PUBLIC_API_URL=http://localhost:3001` |
| Produção | https://tocasom.com.br e www | `https://api.tocasom.com.br` |
| Staging | https://stg.tocasom.com.br | `https://api-stg.tocasom.com.br` |

Stack: Next.js 15 (App Router), React 19, TypeScript strict, SCSS (sem Tailwind), Radix Dialog, lucide-react. Alias `@/*` → `src/*`.

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

Única variável: `NEXT_PUBLIC_API_URL`. Sem ela, o fallback é `http://localhost:3001`. Nunca commitar `.env` nem `.env.local`.

`next.config.ts` só liga `reactStrictMode`. Sem rewrites: o browser e o servidor Next falam direto com a API.

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | Home: marca TOCA SOM, busca, carrossel de bandas, “como funciona”. |
| `/banda/[slug]` | Página da banda: avatar, redes, banner da festa, catálogo e pedido Pix. |

Não existe área logada, checkout próprio nem página de admin. O slug da URL é o slug da API (gerado a partir do nome da banda).

Layout raiz (`src/app/layout.tsx`): `lang="pt-BR"`, fonte Inter, título `tocasom` / `%s | tocasom`, descrição “Peça músicas para bandas via Pix”. Tudo dentro de `.shell`.

## O que a home faz

- `HomeSearch` **não chama a API**. Não existe busca por nome. O submit só normaliza o texto (sem acento, minúsculo, hífen) e faz `router.push('/banda/' + slug)`. “Banda do Bar” abre `/banda/banda-do-bar`. Se esse slug não existir, a página da banda mostra “não encontrada”. Não implementar busca, autocomplete nem `GET /bands/public?q=` até a API ter esse endpoint.
- `FeaturedBands` é a única lista real: `GET /bands/public?limit=20` com `revalidate: 30`. Falha ou HTTP ruim vira lista vazia, não quebra a página.
- `HowItWorks`: buscar a banda → escolher a música → pagar no Pix. É texto estático.

Uma banda só aparece na API pública se estiver aprovada, com gênero, Mercado Pago conectado, preço ≥ piso da plataforma e ao menos uma música. O web não reimplementa esse filtro.

## Página da banda

Server Component. `generateMetadata` usa o nome da banda.

1. `GET /bands/public/:slug` com `revalidate: 10`. 404 ou erro → “Banda não encontrada ou ainda sem cadastro público.”
2. Avatar é `imageUrl` (foto do Google do músico). Sem foto, placeholder.
3. Redes via `buildBandSocialLinks`: Instagram, Facebook, TikTok, YouTube e WhatsApp. WhatsApp só existe se a API devolver `phone` (ela só manda o número quando `showWhatsapp` é true). Celular BR de 11 dígitos vira `https://wa.me/55…`. Link sem protocolo ganha `https://`.
4. `PartyTipBanner` só depois de **reconfirmar** `partyTipsEnabled` no client (`cache: 'no-store'`). O HTML do servidor pode estar em cache; o botão não aparece até a API responder que a festa está aberta. Isso evita botão fantasma.
5. `BandSongCatalog` recebe a primeira página de músicas no servidor (`page=1`, `limit=20`, `cache: 'no-store'`) e pagina/filtra/busca no client.

Músicas: `GET /bands/public/:slug/songs?page&limit&genre&q`. Constantes do catálogo: `PAGE_SIZE = 20`, busca só a partir de `SEARCH_MIN_CHARS = 2`, debounce `SEARCH_DEBOUNCE_MS = 320`. Abaixo de 2 caracteres o client não manda `q`. A resposta traz `items`, `page`, `limit`, `total`, `totalPages` e `genres` (gêneros que a banda realmente tem). A primeira renderização usa a página que o servidor já buscou e não refaz o fetch.

`acceptsPayments === false` mostra aviso e esconde pedido e festa. Na prática a API pública já devolve `true`; o web ainda trata o falso.

## Pedir música

`RequestSongDialog` (client):

- Nome do solicitante e valor mascarado em reais. O valor inicial é o preço da banda. Dá para pagar **mais**, não menos — a API rejeita abaixo de `requestPriceCents`.
- Máscara: só dígitos, teto R$ 10.000,00 (`MONEY_CENTS_MAX = 1_000_000`, `MONEY_MASK_MAX_LENGTH = 10`). `parseReaisToCents` / `formatMoneyMask` em `src/lib/api.ts`.
- `POST /orders/public` com `{ bandSlug, songId, requesterName, amountCents }`.
- Mostra o Pix copia e cola (`payment.pixCopyPaste`). Enquanto `status !== 'PAID'`, faz polling a cada **4 segundos**: primeiro `POST /orders/public/:id/sync`, depois `GET /orders/public/:id`. O intervalo está fixo em `setInterval(..., 4000)` dentro de `RequestSongDialog`. Não trocar por websocket nem por outro período sem pedido explícito. Erro de rede no tick é ignorado e o intervalo continua.
- Erro: `publicActionError`. Se a mensagem tiver “financial identity use case”, troca pela frase fixa “Não foi possível gerar o Pix agora. Tente de novo em alguns minutos.” Nunca mostrar a causa crua do Mercado Pago.

## Continuar a festa

`PartyTipDialog`: nome + valor ≥ `partyTipsMinCents` (a API manda o mínimo; padrão de banda é R$ 5,00). `POST /tips/public` com `{ bandSlug, contributorName, amountCents }`. O polling é o mesmo do pedido: a cada **4 segundos**, `POST /tips/public/:id/sync` e em seguida `GET /tips/public/:id`, até `status === 'PAID'`. Mesma sanitização de erro de Pix.

O web não abre nem fecha sessão. Isso é do admin (`partyTipsEnabled`). Sem sessão aberta, a API abre uma ao criar a contribuição.

## Dinheiro e gênero

- API fala centavos. UI fala reais `pt-BR` (`formatPriceBRL`).
- Gêneros e rótulos ficam em `src/lib/song-genres.ts` e no mapa `GENRE_LABELS` de `api.ts` (ROCK → Rock, FORRO → Forró, AXE → Axé, …). O valor enviado/recebido é o enum da API (`FORRO`, não “Forró”).
- Sem gênero: “Sem categoria”.

## Fetch

Não há cliente HTTP compartilhado com cookie. A página pública é anônima.

| Função | Cache |
| --- | --- |
| `fetchPublicBands` | `next: { revalidate: 30 }`, erro → `[]` |
| `fetchBandBySlug` | `revalidate: 10`, erro/404 → `null` |
| `fetchBandSongs` | `cache: 'no-store'` |
| Banner da festa e dialogs | `fetch` no client, sem cache |

Falhas de leitura de banda não estouram a árvore; falhas de criar Pix aparecem no dialog.

## UI e estilo

- Componentes em pasta com `index.tsx`: `src/components/<Nome>/index.tsx`.
- Primitivos em `src/components/ui` (Button, Input, Label, Textarea, Dialog, Alert, Badge), em cima de Radix + `class-variance-authority` + `clsx`.
- Estilos globais em `src/styles`: `_tokens.scss`, `_reset.scss`, `_ui.scss`, `_layout.scss`, `_home.scss`, `_breakpoints.scss`, `_mixins.scss`, `globals.scss`.
- Paleta: laranja `#f97316`, grafite `#1f2933`, fundo `#fafaf8`, raio `0.625rem`, Inter. A marca na home é “TOCA” + “SOM”, não “Quero Música”.
- Ícones: lucide-react.
- Client Component só onde tem estado (dialogs, banner, catálogo interativo). Página e layout seguem Server Component.

## Regras para mudar este app

- Não criar autenticação aqui. Sessão, banda, preço, repertório e Mercado Pago moram no admin e na API.
- Não duplicar a regra de “banda pública”. Se a API não listar, a home não deve inventar.
- Não mostrar o botão da festa com base só no props do servidor. Confirmar `partyTipsEnabled` no client antes.
- Não expor telefone que a API não mandou. WhatsApp depende de `showWhatsapp`.
- Valores sempre em centavos na ida para a API e em máscara BRL na tela. Não usar float de reais no payload.
- Pedido pode ser maior que o preço da banda; nunca menor.
- Erro de identidade financeira do Pix vira a frase genérica de `public-error.ts`.
- Texto de interface em português.
- CORS da API precisa incluir a origem deste app (`localhost:3002` ou o domínio real). Em produção a API recusa localhost.
- Não transformar a busca da home em chamada de API. Ela só slugifica o texto e navega para `/banda/{slug}`.
- Não mudar o polling do Pix: 4 segundos, sync e depois GET, para pedido e para festa.
- Não criar suíte de testes nem runner. Este repositório não tem.
