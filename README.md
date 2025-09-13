# Feature Requests App — MVP (Next.js + Prisma + NextAuth + Pusher + BullMQ)

Stack:
- **Next.js (App Router)**
- **PostgreSQL (Prisma)**
- **NextAuth (Credenciais/Google/Azure AD)**
- **RBAC** (client, company, admin)
- **Tempo real** com Pusher (UI otimista)
- **BullMQ** (Redis) p/ jobs
- **Uploads** S3/DO Spaces
- **CI/CD** (GitHub Actions → Vercel) / DB+Redis no Railway
- **Observabilidade**: Sentry + (gancho para OTel)

## 🚀 Rodando local
1) Crie `.env` a partir de `.env.example` e ajuste a conexão do Postgres/Redis etc.
2) Instale deps: `npm i`
3) Gere Prisma: `npm run prisma:generate`
4) Migre/seed:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5) Dev server: `npm run dev` (http://localhost:3000)
6) Workers: `npm run worker` (em um terminal separado)

Usuários seeds:
- **Empresa**: pm@demo.local (role COMPANY)
- **Cliente**: client@acme.local (role CLIENT)

> O provedor de Credenciais está aberto no seed para testes. Em produção, ajuste para exigir senha hash (ou use somente SSO).

## 🧱 Multi-tenant (Workspace)
- Cada funcionalidade/roadmap/changelog pertence a um `Workspace`.
- Clientes (usuários externos) pertencem a uma `CustomerCompany` dentro de um `Workspace`.
- Páginas públicas usam o workspace `demo` por padrão (ver `prisma/seed.ts`).

### Tenant URLs (Subdomínios)
- Configure `NEXT_PUBLIC_ROOT_DOMAIN` no `.env` (ex.: `featurepool.com`). Em dev, use `lvh.me` que resolve para `127.0.0.1` e permite subdomínios: `arista.lvh.me:3000`.
- A raiz de subdomínios válidos redireciona para `/features` daquele workspace. Ex.: `arista.featurepool.com/` → `arista.featurepool.com/features`.
- Domínio do app (ex. `app.featurepool.com` ou `localhost`) redireciona para `/auth/signin`.

## 🔢 Score
- Configuração em **/admin** — pesos para nº de empresas, impacto, esforço, receita.
- Cálculo em `src/lib/scoring.ts` e acionado em server actions e no worker (fila `recompute-score`).

## 🔔 Tempo real
- Eventos Pusher por canal `workspace-{id}`: `feature:created`, `feature:voted`, `feature:commented`, `feature:status_updated`, `changelog:created`.
- Exemplo de invalidation/refresh nos componentes (VoteButton, CommentList).

## 📦 Uploads (S3/DO)
- Endpoint `POST /api/upload` retorna URL assinada (PUT) + chave.
- Use `publicUrl` para salvar nos assets do changelog.

## 🔐 RBAC
- Middleware protege `/dashboard` (COMPANY/ADMIN) e `/admin` (ADMIN).
- Sessão inclui `role`, `workspaceId`, `customerCompanyId`.
 - Páginas públicas (`/features`, `/roadmap`, `/changelog`) são abertas; o formulário de criar feature só aparece para COMPANY/ADMIN logados.

## 🛠️ Próximos passos
- UI de autenticação dedicada (login/logout, página do NextAuth).
- Drag&drop no Kanban; detalhes da feature com comentários inline.
- Métricas (Admin): empresas pedindo, votos, engajamento.
- Notificações (e-mail/webhooks) quando status/changelog mudam.
- IA: agrupamento de pedidos semelhantes (worker + embeddings).

## 📄 Licença
MIT — use como base e adapte.



# Atualização 1

# Feature Requests App — MVP (Next.js + Prisma + NextAuth + Pusher + BullMQ)

## Novidades
- **Login custom** em `/signin` (NextAuth pages.signIn)
- **Layout inspirado na LP**: topbar branca com CTA "Quero o Beta", hero com `text-gradient`, cartões arredondados (`.card`), botões `.btn` e `.btn-primary`.

## Rodando
1) Configure `.env` (DATABASE_URL, NEXTAUTH_URL=http://localhost:3000, NEXTAUTH_SECRET).
2) `npm i && npm run prisma:generate && npm run db:push && npm run db:seed`
3) Dev: `npm run dev` — Worker: `npm run worker`

Usuários seed:
- pm@demo.local (COMPANY)
- client@acme.local (CLIENT)
