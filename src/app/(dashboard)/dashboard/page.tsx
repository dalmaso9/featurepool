import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  if (!workspaceId) {
    return <main>Sem workspace associado ao usuário.</main>
  }
  const features = await prisma.feature.findMany({
    where: { workspaceId },
    include: { interestedCos: true }
  })
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Empresa — Painel</h1>
      <p className="text-sm text-gray-600">Total de funcionalidades: {features.length}</p>
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
    </main>
  )
}
