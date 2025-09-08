import { prisma } from '@/lib/prisma'
import FeatureCard from '@/components/FeatureCard'
import FeatureForm from '@/components/FeatureForm'
import VoteButton from '@/components/VoteButton'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cache } from 'react'

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
  const workspaceId = (session as any)?.user?.workspaceId
  // For demo purposes, fallback to the Demo workspace if not logged-in.
  const workspace = await prisma.workspace.findFirst({ where: { slug: 'demo' } })
  const wid = workspaceId ?? workspace?.id!
  const features = await listFeatures(wid)

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Funcionalidades</h1>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {features.map(f => (
          <div key={f.id} className="space-y-2">
            <FeatureCard feature={f} />
            <VoteButton featureId={f.id} initialVoted={false} initialCount={f.votes} />
          </div>
        ))}
      </div>
      {wid && <FeatureForm workspaceId={wid} />}
    </main>
  )
}
