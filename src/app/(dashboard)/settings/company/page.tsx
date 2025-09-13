import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import WorkspaceSettingsForm from '@/app/(dashboard)/dashboard/workspace-settings'

export default async function CompanySettingsPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  if (!workspaceId) return <main>Sem workspace.</main>
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) return <main>Sem workspace.</main>
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Empresa e URL</h1>
      <WorkspaceSettingsForm workspaceId={workspace.id} initialSlug={workspace.slug} initialPublic={workspace.publicAccessEnabled} />
    </main>
  )
}

