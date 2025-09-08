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
