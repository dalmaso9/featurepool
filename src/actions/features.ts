'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { featureSchema, commentSchema } from '@/lib/validation'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { pusherServer, workspaceChannel } from '@/lib/pusher'
import { recomputeFeatureScore } from '@/lib/scoring'

export async function createFeature(input: unknown) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.workspaceId) throw new Error('Unauthorized')

  const parsed = featureSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid data')

  const { workspaceId, title, description, impact, effort } = parsed.data

  const feature = await prisma.feature.create({
    data: {
      workspaceId,
      title,
      description,
      impact: impact ?? null,
      effort: effort ?? null,
      createdById: (session!.user as any).id
    }
  })

  await recomputeFeatureScore(feature.id)

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(workspaceId), 'feature:created', { featureId: feature.id })
  }
  revalidateTag(`features:${workspaceId}`)
  revalidatePath(`/features`)
  return feature
}

export async function voteFeature(featureId: string) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id || !(session?.user as any)?.workspaceId) throw new Error('Unauthorized')
  // only clients can vote (MVP rule)
  // if ((session.user as any).role !== 'CLIENT') throw new Error('Somente clientes podem votar')

  const feature = await prisma.feature.findUnique({ where: { id: featureId } })
  if (!feature) throw new Error('Feature not found')

  await prisma.featureVote.upsert({
    where: { featureId_userId: { featureId, userId: (session!.user as any).id } },
    update: {},
    create: {
      featureId,
      userId: (session!.user as any).id,
      customerCompanyId: (session!.user as any).customerCompanyId ?? null
    }
  })

  // also upsert interested company (distinct by company)
  const companyId = (session!.user as any).customerCompanyId as string | undefined
  if (companyId) {
    await prisma.featureInterestedCompany.upsert({
      where: { featureId_customerCompanyId: { featureId, customerCompanyId: companyId } },
      update: {},
      create: { featureId, customerCompanyId: companyId }
    })
  }

  await recomputeFeatureScore(featureId)

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(feature.workspaceId), 'feature:voted', { featureId })
  }
  revalidateTag(`features:${feature.workspaceId}`)
  return { ok: true }
}

export async function commentFeature(input: unknown) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Unauthorized')
  const parsed = commentSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid data')

  const feature = await prisma.feature.findUnique({ where: { id: parsed.data.featureId } })
  if (!feature) throw new Error('Feature not found')

  const comment = await prisma.featureComment.create({
    data: {
      featureId: feature.id,
      userId: (session!.user as any).id,
      content: parsed.data.content
    },
    include: { user: true }
  })

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(feature.workspaceId), 'feature:commented', { featureId: feature.id })
  }
  revalidateTag(`features:${feature.workspaceId}`)
  return comment
}

export async function updateFeatureStatus(featureId: string, status: 'BACKLOG'|'UNDER_REVIEW'|'IN_DEVELOPMENT'|'DELIVERED', impact?: number|null, effort?: number|null) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  if (role !== 'COMPANY' && role !== 'ADMIN') throw new Error('Unauthorized')

  const feature = await prisma.feature.update({
    where: { id: featureId },
    data: { status, impact: impact ?? null, effort: effort ?? null }
  })

  await recomputeFeatureScore(featureId)

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(feature.workspaceId), 'feature:status_updated', { featureId })
  }
  revalidateTag(`features:${feature.workspaceId}`)
  revalidatePath('/dashboard')
  return feature
}
