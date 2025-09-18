import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import FeatureForm from '@/components/FeatureForm'
import PublicViewLinks from '@/components/PublicViewLinks'
import FeatureStatusSelect from './FeatureStatusSelect'
import FeatureEditModalButton from '@/components/FeatureEditModalButton'

const statuses = ['BACKLOG','UNDER_REVIEW','IN_DEVELOPMENT','DELIVERED'] as const

export default async function FeaturesInternalPage({ searchParams }:{ searchParams?: Record<string,string|undefined> }) {
  const session = await getServerSession(authOptions)
  const wid = (session as any)?.user?.workspaceId as string | undefined
  if (!wid) return <main>Sem workspace.</main>

  const q = (searchParams?.q || '').toString().trim()
  const s = (searchParams?.status || '').toString().toUpperCase()
  const sort = (searchParams?.sort || 'score').toString()

  const where:any = { workspaceId: wid }
  if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }]
  if (statuses.includes(s as any)) where.status = s

  const orderBy = sort === 'newest' ? [{ createdAt: 'desc' as const }] : [{ score: 'desc' as const }, { createdAt: 'desc' as const }]

  const features = await prisma.feature.findMany({ where, orderBy, include: { votes: true, interestedCos: true } })

  return (
    <main className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
      <aside className="space-y-3">
        <form className="rounded-lg border bg-white p-3 space-y-2" method="get">
          <div>
            <label className="block text-xs text-gray-500">Busca</label>
            <input name="q" defaultValue={q} className="w-full rounded-md border px-2 py-1 text-sm" placeholder="título ou descrição" />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Status</label>
            <select name="status" defaultValue={s} className="w-full rounded-md border px-2 py-1 text-sm">
              <option value="">Todos</option>
              <option value="BACKLOG">Backlog</option>
              <option value="UNDER_REVIEW">Em análise</option>
              <option value="IN_DEVELOPMENT">Em desenvolvimento</option>
              <option value="DELIVERED">Entregue</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Ordenação</label>
            <select name="sort" defaultValue={sort} className="w-full rounded-md border px-2 py-1 text-sm">
              <option value="score">Score</option>
              <option value="newest">Mais novas</option>
            </select>
          </div>
          <button className="btn btn-primary w-full" type="submit">Aplicar</button>
        </form>

        <div className="rounded-lg border bg-white p-3">
          <h3 className="text-sm font-medium mb-2">Criar nova</h3>
          <FeatureForm workspaceId={wid} />
        </div>
      </aside>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Funcionalidades</h1>
          <PublicViewLinks workspaceId={wid} />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {features.map(f => (
            <div key={f.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{f.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{f.description}</div>
                  <div className="mt-1 text-xs text-gray-500">{f.interestedCos.length} empresas • {f.votes.length} votos</div>
                </div>
                <div className="flex items-center gap-2">
                  <FeatureStatusSelect featureId={f.id} status={f.status as any} />
                  <FeatureEditModalButton feature={{ id: f.id, title: f.title, description: f.description, impact: f.impact as any, effort: f.effort as any }} />
                </div>
              </div>
            </div>
          ))}
          {features.length === 0 && (
            <div className="text-sm text-gray-500">Nenhuma funcionalidade encontrada.
            {q ? ' Ajuste seu filtro.' : ''}</div>
          )}
        </div>
      </section>
    </main>
  )
}
