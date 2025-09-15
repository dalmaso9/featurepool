import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Metrics from './metrics'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  const isWsAdmin = !!(session as any)?.user?.workspaceAdmin
  if (!workspaceId) {
    return <main>Sem workspace associado ao usuário.</main>
  }
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (workspace && !workspace.onboardingCompleted && isWsAdmin) {
    redirect('/onboarding')
  }
  const features = await prisma.feature.findMany({
    where: { workspaceId },
    include: { interestedCos: true }
  })
  const users = await prisma.user.findMany({ where: { workspaceId }, select: { id: true, name: true, email: true, role: true } })
  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <Metrics />
      <section className="space-y-2">
        <h2 className="font-medium">Últimas funcionalidades</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {features.map(f => (
            <div key={f.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{f.title}</h3>
                <span className="text-xs text-gray-500">{f.status.replaceAll('_',' ')}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-3">{f.description}</p>
              <div className="mt-2 text-xs text-gray-500">{f.interestedCos.length} empresas interessadas</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
