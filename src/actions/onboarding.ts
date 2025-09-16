'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateWorkspaceProfile(workspaceId: string, input: { name?: string }) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  if ((role !== 'ADMIN' && role !== 'COMPANY') || myWs !== workspaceId) throw new Error('Unauthorized')
  await prisma.workspace.update({ where: { id: workspaceId }, data: { name: input.name } })
  revalidatePath('/onboarding')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function seedSampleFeatures(workspaceId: string) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  const userId = (session as any)?.user?.id
  if ((role !== 'ADMIN' && role !== 'COMPANY') || myWs !== workspaceId) throw new Error('Unauthorized')

  const samples = [
    { title: 'Exportar relatório em CSV', description: 'Permitir exportação do dashboard em CSV.' },
    { title: 'Single Sign-On (SAML)', description: 'Integração SAML com provedores corporativos.' },
    { title: 'Filtros avançados no relatório', description: 'Salvar filtros favoritos e compartilhar com a equipe.' }
  ]

  await prisma.feature.createMany({
    data: samples.map(s => ({
      workspaceId,
      title: s.title,
      description: s.description,
      createdById: userId
    }))
  })

  revalidatePath('/features')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function completeOnboarding(workspaceId: string) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  const myWs = (session as any)?.user?.workspaceId
  if ((role !== 'ADMIN' && role !== 'COMPANY') || myWs !== workspaceId) throw new Error('Unauthorized')
  await prisma.workspace.update({ where: { id: workspaceId }, data: { onboardingCompleted: true } })
  revalidatePath('/dashboard')
  return { ok: true }
}

