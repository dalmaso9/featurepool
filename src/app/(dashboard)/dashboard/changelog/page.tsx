import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createChangelogEntry } from '@/actions/changelog'
import PublicViewLinks from '@/components/PublicViewLinks'
import ChangelogEditModalButton from '@/components/ChangelogEditModalButton'

export default async function ChangelogInternalPage() {
  const session = await getServerSession(authOptions)
  const wid = (session as any)?.user?.workspaceId as string | undefined
  if (!wid) return <main>Sem workspace.</main>

  const entries = await prisma.changelogEntry.findMany({
    where: { workspaceId: wid },
    orderBy: { releasedAt: 'desc' }
  })

  async function action(formData: FormData) {
    'use server'
    const title = String(formData.get('title') || '')
    const content = String(formData.get('content') || '')
    await createChangelogEntry({ workspaceId: wid!, title, content })
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Changelog</h1>
        <PublicViewLinks workspaceId={wid} />
      </div>
      <form action={action} className="rounded-lg border bg-white p-4 space-y-2 max-w-xl">
        <input name="title" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Título" required />
        <textarea name="content" rows={4} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Conteúdo" required />
        <button className="btn btn-primary" type="submit">Publicar</button>
      </form>
      <section className="space-y-2">
        <h2 className="font-medium">Entradas</h2>
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{e.title}</div>
                <ChangelogEditModalButton entry={{ id: e.id, title: e.title, content: e.content }} />
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">{e.content}</div>
            </div>
          ))}
          {entries.length === 0 && <div className="text-sm text-gray-500">Sem entradas ainda.</div>}
        </div>
      </section>
    </main>
  )
}
