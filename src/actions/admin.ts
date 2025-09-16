'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateScoringConfig(workspaceId: string, weights: {
  weightCompanies?: number
  weightImpact?: number
  weightEffort?: number
  weightRevenue?: number
  weightEmployees?: number
}) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  if (role !== 'ADMIN' && role !== 'COMPANY') throw new Error('Unauthorized')

  await prisma.scoringConfig.upsert({
    where: { workspaceId },
    update: { ...weights },
    create: { workspaceId, ...weights }
  })

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateWorkspaceSettings(workspaceId: string, input: {
  slug?: string
  publicAccessEnabled?: boolean
}) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  if ((role !== 'ADMIN' && role !== 'COMPANY') || myWs !== workspaceId) {
    throw new Error('Unauthorized')
  }

  const data: any = {}
  if (typeof input.publicAccessEnabled === 'boolean') data.publicAccessEnabled = input.publicAccessEnabled
  if (input.slug) {
    const slug = input.slug.trim().toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error('Slug inválido: use apenas letras minúsculas, números e hífens')
    }
    data.slug = slug
  }

  try {
    await prisma.workspace.update({ where: { id: workspaceId }, data })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      throw new Error('Este slug já está em uso')
    }
    throw e
  }

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateWorkspaceUserRole(targetUserId: string, role: 'CLIENT'|'COMPANY') {
  const session = await getServerSession(authOptions)
  const myRole = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  if (!myWs || (myRole !== 'COMPANY' && myRole !== 'ADMIN')) throw new Error('Unauthorized')

  const target = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!target || target.workspaceId !== myWs) throw new Error('User not found')
  if ((session as any).user.id === targetUserId) throw new Error('Não é possível alterar seu próprio papel')

  await prisma.user.update({ where: { id: targetUserId }, data: { role } })
  revalidatePath('/dashboard')
  return { ok: true }
}
