import { prisma } from '@/lib/prisma'
import KanbanBoard from '@/components/KanbanBoard'
import PublicViewLinks from '@/components/PublicViewLinks'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RoadmapInternalPage() {
  const session = await getServerSession(authOptions)
  const wid = (session as any)?.user?.workspaceId as string | undefined
  if (!wid) return <main>Sem workspace.</main>

  const items = await prisma.feature.findMany({
    where: { workspaceId: wid },
    select: { id: true, title: true, status: true }
  })

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Roadmap (interno)</h1>
        <PublicViewLinks />
      </div>
      <KanbanBoard items={items} canEdit={true} />
    </main>
  )
}
