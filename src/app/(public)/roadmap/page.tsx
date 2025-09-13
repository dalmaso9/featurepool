import { prisma } from '@/lib/prisma'
import KanbanBoard from '@/components/KanbanBoard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { headers } from 'next/headers'
import { getWorkspaceFromHost } from '@/lib/tenant'
import { redirect } from 'next/navigation'

export default async function RoadmapPage() {
  const session = await getServerSession(authOptions)
  const host = headers().get('host')
  const wsFromHost = await getWorkspaceFromHost(host || undefined)
  const wid = wsFromHost?.id ?? (await prisma.workspace.findFirst({ where: { slug: 'demo' } }))?.id!

  if (wsFromHost && wsFromHost.publicAccessEnabled === false) {
    const role = (session as any)?.user?.role
    const userWs = (session as any)?.user?.workspaceId
    const isInternal = (role === 'COMPANY' || role === 'ADMIN') && userWs === wsFromHost.id
    if (!isInternal) redirect('/auth/signin')
  }

  const items = await prisma.feature.findMany({
    where: { workspaceId: wid },
    select: { id: true, title: true, status: true }
  })

  const role = (session as any)?.user?.role
  const canEdit = role === 'COMPANY' || role === 'ADMIN'

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Roadmap</h1>
      <KanbanBoard items={items} canEdit={!!canEdit} />
    </main>
  )
}
