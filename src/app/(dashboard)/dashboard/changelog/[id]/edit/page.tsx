import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { deleteChangelogEntry, updateChangelogEntry } from '@/actions/changelog'
import Link from 'next/link'

export default async function EditChangelogPage({ params }:{ params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const me = (session as any)?.user
  if (!me?.workspaceId) return <main>Sem workspace.</main>

  const entry = await prisma.changelogEntry.findUnique({ where: { id: params.id } })
  if (!entry) return notFound()
  if (entry.workspaceId !== me.workspaceId) return <main>Sem acesso.</main>
  const isOwner = entry.createdById === me.id
  const canManage = me.role === 'ADMIN' || me.role === 'COMPANY'
  if (!isOwner && !canManage) return <main>Sem permissão.</main>

  async function action(formData: FormData) {
    'use server'
    const title = String(formData.get('title') || '')
    const content = String(formData.get('content') || '')
    await updateChangelogEntry({ id: entry!.id, title, content })
    redirect('/dashboard/changelog')
  }

  async function remove() {
    'use server'
    await deleteChangelogEntry(entry!.id)
    redirect('/dashboard/changelog')
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar entrada de changelog</h1>
        <Link href="/dashboard/changelog" className="text-sm text-gray-600 hover:text-gray-800">← Voltar</Link>
      </div>
      <form action={action} className="rounded-lg border bg-white p-4 space-y-3 max-w-2xl">
        <input name="title" defaultValue={entry!.title} className="w-full rounded-md border px-3 py-2 text-sm" required />
        <textarea name="content" defaultValue={entry!.content} rows={5} className="w-full rounded-md border px-3 py-2 text-sm" required />
        <button className="btn btn-primary" type="submit">Salvar</button>
      </form>
      <form action={remove}>
        <button className="btn btn-danger" type="submit">Excluir</button>
      </form>
    </main>
  )
}
