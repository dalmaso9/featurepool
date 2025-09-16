import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import OnboardingWizard from './wizard'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const workspaceId = (session as any)?.user?.workspaceId
  if (!session || !workspaceId || (role !== 'COMPANY' && role !== 'ADMIN')) {
    redirect('/auth/signin')
  }
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!ws) redirect('/auth/signin')
  if (ws.onboardingCompleted) redirect('/dashboard')

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-2xl p-6">
        <h1 className="text-xl font-semibold mb-1">Bem-vindo! Vamos configurar seu espaço</h1>
        <p className="text-sm text-gray-600 mb-4">Isso leva menos de 2 minutos.</p>
        <OnboardingWizard
          workspaceId={ws.id}
          initialName={ws.name}
          initialSlug={ws.slug}
          initialPublic={ws.publicAccessEnabled}
        />
      </div>
    </main>
  )
}

