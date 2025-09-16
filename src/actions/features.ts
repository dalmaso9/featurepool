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

export async function updateFeatureDetails(input: {
  id: string
  title: string
  description: string
  impact?: number | null
  effort?: number | null
}) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Unauthorized')
  const me = (session!.user as any)

  const existing = await prisma.feature.findUnique({ where: { id: input.id } })
  if (!existing) throw new Error('Feature not found')
  const isOwner = existing.createdById === me.id
  const canManage = me.role === 'ADMIN' || me.role === 'COMPANY'
  if (!isOwner && !canManage) throw new Error('Unauthorized')

  const feature = await prisma.feature.update({
    where: { id: input.id },
    data: {
      title: input.title,
      description: input.description,
      impact: input.impact ?? null,
      effort: input.effort ?? null
    }
  })

  await recomputeFeatureScore(input.id)

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(feature.workspaceId), 'feature:updated', { featureId: input.id })
  }
  revalidateTag(`features:${feature.workspaceId}`)
  revalidatePath('/dashboard/features')
  revalidatePath(`/features/${input.id}`)
  return feature
}

export async function deleteFeature(featureId: string) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Unauthorized')
  const me = (session!.user as any)

  const existing = await prisma.feature.findUnique({ where: { id: featureId } })
  if (!existing) throw new Error('Feature not found')
  const isOwner = existing.createdById === me.id
  const canManage = me.role === 'ADMIN' || me.role === 'COMPANY'
  if (!isOwner && !canManage) throw new Error('Unauthorized')

  await prisma.feature.delete({ where: { id: featureId } })

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(existing.workspaceId), 'feature:deleted', { featureId })
  }
  revalidateTag(`features:${existing.workspaceId}`)
  revalidatePath('/dashboard/features')
  return { ok: true }
}

export async function addInterestedCompany(input: {
  featureId: string
  workspaceId: string
  company: string
  contact?: string
  internalAgent?: string
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  // Apenas usuários cadastrados podem cadastrar empresas interessadas
  if (!(session?.user as any)?.id) throw new Error('Unauthorized')

  const { featureId, workspaceId, company, contact, internalAgent, notes } = input

  // Ensure feature belongs to workspace to avoid cross-tenant pollution
  const feature = await prisma.feature.findUnique({ where: { id: featureId } })
  if (!feature || feature.workspaceId !== workspaceId) throw new Error('Feature not found for workspace')

  // Find or create the customer company within the workspace
  let cc = await prisma.customerCompany.findFirst({ where: { workspaceId, name: company } })
  if (!cc) {
    cc = await prisma.customerCompany.create({
      data: { workspaceId, name: company }
    })
  }

  // Upsert interest record with extra details
  await prisma.featureInterestedCompany.upsert({
    where: { featureId_customerCompanyId: { featureId, customerCompanyId: cc.id } },
    update: { contact: contact ?? null, internalAgent: internalAgent ?? null, notes: notes ?? null },
    create: {
      featureId,
      customerCompanyId: cc.id,
      contact: contact ?? null,
      internalAgent: internalAgent ?? null,
      notes: notes ?? null
    }
  })

  await recomputeFeatureScore(featureId)

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(workspaceId), 'feature:interest_added', { featureId })
  }
  revalidateTag(`features:${workspaceId}`)
  revalidatePath('/features')
  // also revalidate the details page if being viewed
  revalidatePath(`/features/${featureId}`)
  return { ok: true }
}
