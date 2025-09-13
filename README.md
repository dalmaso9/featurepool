% Feature Requests App — MVP (Next.js + Prisma + NextAuth + Pusher + BullMQ)

Stack (atualizado):
- Next.js 14 (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- NextAuth (credenciais com senha; SSO opcional Google/Azure AD; Apple planejado)
- RBAC (CLIENT, COMPANY, ADMIN)
- Tempo real com Pusher (UI otimista/refresh)
- BullMQ (Redis) para jobs (recompute de score etc.)
- Uploads S3/DO Spaces
- CI/CD (GitHub Actions → Vercel) • DB/Redis no Railway
- Observabilidade: Sentry + gancho para OTel

## 🚀 Rodando local
- Requisitos: Node >= 18.18, Postgres, Redis
- Passos:
  1) Copie `.env.example` para `.env` e preencha as variáveis (DB, Redis, etc.).
  2) Instale deps: `npm i`
  3) Gere Prisma: `npm run prisma:generate`
  4) Aplique o schema no banco (inclui `passwordHash`):
     - `npm run db:push` (dev) ou `npx prisma migrate dev -n init`
  5) (Opcional) Seed: `npm run db:seed`
  6) App: `npm run dev` (http://localhost:3000)
  7) Worker: `npm run worker` (em outro terminal)

Seeds (opcional):
- Empresa: pm@demo.local (COMPANY)
- Cliente: client@acme.local (CLIENT)
- Observação: usuários do seed não possuem senha; para testar credenciais, use o cadastro em `/auth/signup`.

## 🔐 Autenticação e RBAC
- Credenciais (email + senha) com hash scrypt.
- Signup em `/auth/signup`: confirmação de senha + “olhinho”; cria um workspace placeholder, completado no onboarding.
- Login em `/auth/signin`: campo com “olhinho” + link “Esqueceu a senha?”.
- Recuperação de senha:
  - `/auth/forgot-password` → gera link com token (em dev, mostrado na UI e no console)
  - `/auth/reset-password?token=...` → define nova senha
- SSO opcional: Google/Azure AD (habilite no `.env`); Apple está planejado.
- Middleware protege `/dashboard` (COMPANY/ADMIN) e `/admin` (ADMIN). Sessão carrega `role`, `workspaceId`, `customerCompanyId`.

## 🧱 Multi-tenant (Workspace)
- Tudo pertence a um `Workspace` (features, roadmap, changelog, clientes).
- Páginas públicas são por empresa via subdomínio/host (ex.: `minha.lvh.me:3000`).
- Consultas públicas filtram por `workspaceId` do host; uma empresa não vê dados de outra.
- Se `publicAccessEnabled=false`, exige login de usuário interno do mesmo workspace.
- Sem host reconhecido, há fallback para o workspace `demo` (para dev/demo).

### Tenant URLs (Subdomínios)
- `NEXT_PUBLIC_ROOT_DOMAIN` no `.env` (prod). Em dev use `lvh.me` (ex.: `acme.lvh.me:3000`).
- Subdomínio válido → `/features` do workspace. Domínio do app → `/auth/signin`.

## 🔢 Score
- Configuração em `/admin` (pesos: nº de empresas, impacto, esforço, receita/empregados).
- Motor em `src/lib/scoring.ts` e disparos nas actions/worker.

## 🔔 Tempo real
- Canal `workspace-{id}`: `feature:created`, `feature:voted`, `feature:commented`, `feature:status_updated`, `changelog:created`.
- Componentes com refresh otimista: `VoteButton`, `CommentList`.

## 📦 Uploads (S3/DO)
- `POST /api/upload` devolve URL assinada (PUT) + chave. Salve a URL pública nos assets do changelog.

## 🧰 Funcionalidades principais
- CRUD de funcionalidades, changelog e clientes (edição/exclusão) via modais.
- Comentários em páginas públicas (apenas usuários logados).
- Voto/Interesse de empresas; score ponderado configurável.

## 🗺️ Scripts úteis
- `npm run dev` • `npm run build` • `npm run start`
- `npm run prisma:generate` • `npm run db:push` • `npm run db:seed`
- `npm run worker`

## 🔧 Variáveis de ambiente
- Veja `.env.example` (DB, NEXTAUTH_URL/SECRET, Pusher, Redis, S3, Sentry/OTEL, OAuth Google/Azure).
- Para e‑mail de recuperação (produção), sugere-se configurar SMTP (não incluído por padrão):
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (a implementar)

## 📄 Licença
MIT — use como base e adapte.
