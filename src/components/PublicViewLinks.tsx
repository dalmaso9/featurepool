import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { buildWorkspacePublicUrl } from '@/lib/tenant'

export default async function PublicViewLinks({ workspaceId }: { workspaceId: string }) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { slug: true }
  })

  if (!workspace?.slug) return null

  const featuresUrl = buildWorkspacePublicUrl(workspace.slug, 'features')
  const roadmapUrl = buildWorkspacePublicUrl(workspace.slug, 'roadmap')
  const changelogUrl = buildWorkspacePublicUrl(workspace.slug, 'changelog')

  return (
    <div className="flex items-center gap-2 text-xs">
      <Link href={featuresUrl} className="btn btn-ghost" prefetch={false}>
        Ver Features públicas
      </Link>
      <Link href={roadmapUrl} className="btn btn-ghost" prefetch={false}>
        Ver Roadmap público
      </Link>
      <Link href={changelogUrl} className="btn btn-ghost" prefetch={false}>
        Ver Changelog público
      </Link>
    </div>
  )
}
