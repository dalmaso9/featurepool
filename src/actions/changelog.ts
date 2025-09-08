'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pusherServer, workspaceChannel } from '@/lib/pusher'
import { revalidatePath } from 'next/cache'

export async function createChangelogEntry(input: {
  workspaceId: string
  title: string
  content: string
  featureId?: string | null
  assets?: { key: string, url: string, size?: number, mimeType?: string }[]
}) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  if (role !== 'COMPANY' && role !== 'ADMIN') throw new Error('Unauthorized')

  const entry = await prisma.changelogEntry.create({
    data: {
      workspaceId: input.workspaceId,
      title: input.title,
      content: input.content,
      featureId: input.featureId ?? null,
      createdById: (session!.user as any).id
    }
  })

  if (input.assets?.length) {
    await prisma.changelogAsset.createMany({
      data: input.assets.map(a => ({
        changelogId: entry.id,
        key: a.key,
        url: a.url,
        size: a.size,
        mimeType: a.mimeType
      }))
    })
  }

  if (pusherServer) {
    await pusherServer.trigger(workspaceChannel(input.workspaceId), 'changelog:created', { changelogId: entry.id })
  }

  revalidatePath('/changelog')
  revalidatePath('/dashboard/changelog')
  return entry
}
