# Quero Música Web

Aplicação pública (Next.js App Router) para os usuários pedirem músicas às bandas.

## Setup

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

npm install
npm run dev
```

- App: http://localhost:3002
- Página da banda: http://localhost:3002/banda/[slug]

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Next.js na porta 3002 |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |

## Segurança

Nunca commite `.env` ou `.env.local`. Use apenas `.env.example` como referência.
