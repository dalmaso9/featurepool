import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import UsersManager from '@/app/(dashboard)/dashboard/users'

export default async function UsersSettingsPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  if (!workspaceId) return <main>Sem workspace.</main>
  const users = await prisma.user.findMany({ where: { workspaceId }, select: { id: true, name: true, email: true, role: true } })
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Usuários</h1>
      <UsersManager users={users as any} />
    </main>
  )
}
