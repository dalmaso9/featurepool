import { prisma } from '@/lib/prisma'
import ChangelogList from '@/components/ChangelogList'

export default async function ChangelogPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: 'demo' } })
  const wid = workspace?.id!
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
