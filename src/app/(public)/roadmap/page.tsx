import { prisma } from '@/lib/prisma'
import KanbanBoard from '@/components/KanbanBoard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  const workspace = await prisma.workspace.findFirst({ where: { slug: 'demo' } })
  const wid = workspaceId ?? workspace?.id!

  const items = await prisma.feature.findMany({
    where: { workspaceId: wid },
    select: { id: true, title: true, status: true }
  })

  const role = (session as any)?.user?.role
  const canEdit = role === 'COMPANY' || role === 'ADMIN'

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Roadmap (Kanban)</h1>
      <KanbanBoard items={items} canEdit={!!canEdit} />
    </main>
  )
}
