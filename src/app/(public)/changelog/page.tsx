import { prisma } from '@/lib/prisma'
import ChangelogList from '@/components/ChangelogList'
import { headers } from 'next/headers'
import { getWorkspaceFromHost } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ChangelogPage() {
  const session = await getServerSession(authOptions)
  const host = headers().get('host')
  const ws = await getWorkspaceFromHost(host || undefined)
  const wid = ws?.id ?? (await prisma.workspace.findFirst({ where: { slug: 'demo' } }))?.id!
  if (ws && ws.publicAccessEnabled === false) {
    const role = (session as any)?.user?.role
    const userWs = (session as any)?.user?.workspaceId
    const isInternal = (role === 'COMPANY' || role === 'ADMIN') && userWs === ws.id
    if (!isInternal) redirect('/auth/signin')
  }
  const entries = await prisma.changelogEntry.findMany({
    where: { workspaceId: wid },
    include: { assets: true },
    orderBy: { releasedAt: 'desc' }
  })
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Changelog</h1>
      <ChangelogList entries={entries as any} />
    </main>
  )
}
