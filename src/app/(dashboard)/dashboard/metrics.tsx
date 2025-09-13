import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function MetricsCards() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  if (!workspaceId) return null

  const [features, votes, companies, interested, statuses] = await Promise.all([
    prisma.feature.count({ where: { workspaceId } }),
    prisma.featureVote.count({ where: { feature: { workspaceId } } }),
    prisma.customerCompany.count({ where: { workspaceId } }),
    prisma.featureInterestedCompany.count({ where: { feature: { workspaceId } } }),
    prisma.feature.groupBy({ where: { workspaceId }, by: ['status'], _count: { _all: true } })
  ])

  const statusMap: Record<string, number> = { BACKLOG: 0, UNDER_REVIEW: 0, IN_DEVELOPMENT: 0, DELIVERED: 0 }
  for (const s of statuses) statusMap[s.status] = s._count._all

  const Card = ({ title, value }:{ title: string, value: string|number }) => (
    <div className="rounded-lg border bg-white p-4"><div className="text-xs text-gray-500">{title}</div><div className="text-xl font-semibold">{value}</div></div>
  )

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card title="Funcionalidades" value={features} />
        <Card title="Votos" value={votes} />
        <Card title="Empresas clientes" value={companies} />
        <Card title="Pedidos (empresas interessadas)" value={interested} />
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h3 className="font-medium mb-3">Status do pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><div className="text-gray-500">Backlog</div><div className="text-lg font-semibold">{statusMap.BACKLOG}</div></div>
          <div><div className="text-gray-500">Em análise</div><div className="text-lg font-semibold">{statusMap.UNDER_REVIEW}</div></div>
          <div><div className="text-gray-500">Em dev</div><div className="text-lg font-semibold">{statusMap.IN_DEVELOPMENT}</div></div>
          <div><div className="text-gray-500">Entregues</div><div className="text-lg font-semibold">{statusMap.DELIVERED}</div></div>
        </div>
      </div>
    </section>
  )
}

