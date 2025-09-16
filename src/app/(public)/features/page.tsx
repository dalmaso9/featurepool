import { prisma } from '@/lib/prisma'
import FeatureCard from '@/components/FeatureCard'
import FeatureForm from '@/components/FeatureForm'
import VoteButton from '@/components/VoteButton'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cache } from 'react'
import { headers } from 'next/headers'
import { getWorkspaceFromHost } from '@/lib/tenant'
import { redirect } from 'next/navigation'

const listFeatures = cache(async (workspaceId: string) => {
  const items = await prisma.feature.findMany({
    where: { workspaceId },
    include: {
      votes: true,
      interestedCos: true
    },
    orderBy: [{ score: 'desc' }, { createdAt: 'desc' }]
  })
  return items.map(f => ({
    id: f.id,
    title: f.title,
    description: f.description,
    status: f.status,
    score: f.score,
    companies: f.interestedCos.length,
    votes: f.votes.length
  }))
})

export default async function FeaturesPage() {
  const session = await getServerSession(authOptions)
  const host = headers().get('host') || undefined
  const wsFromHost = await getWorkspaceFromHost(host)
  let wid = wsFromHost?.id

  if (!wid) {
    // Fallback para Demo quando não há workspace no host
    wid = (await prisma.workspace.findFirst({ where: { slug: 'demo' } }))?.id!
  }

  // Se for subdomínio e o workspace estiver privado, exigir login de interno do mesmo workspace
  if (wsFromHost && wsFromHost.publicAccessEnabled === false) {
    const role = (session as any)?.user?.role
    const userWs = (session as any)?.user?.workspaceId
    const isInternal = (role === 'COMPANY' || role === 'ADMIN') && userWs === wsFromHost.id
    if (!isInternal) redirect('/auth/signin')
  }

  const features = await listFeatures(wid)
  const role = (session as any)?.user?.role as string | undefined
  const canCreate = role === 'COMPANY' || role === 'ADMIN'
  const userWs = (session as any)?.user?.workspaceId
  const isInternal = (role === 'COMPANY' || role === 'ADMIN') && wsFromHost && userWs === wsFromHost.id

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Funcionalidades</h1>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {features.map(f => (
          <div key={f.id} className="space-y-2">
            <FeatureCard feature={f} showScoreAndCompanies={!!isInternal} />
            <VoteButton featureId={f.id} initialVoted={false} initialCount={f.votes} />
          </div>
        ))}
      </div>
      {wid && isInternal && canCreate && <FeatureForm workspaceId={wid} />}
    </main>
  )
}
