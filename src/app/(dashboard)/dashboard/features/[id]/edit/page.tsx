import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { updateFeatureDetails, deleteFeature } from '@/actions/features'
import Link from 'next/link'

export default async function EditFeaturePage({ params }:{ params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const me = (session as any)?.user
  if (!me?.workspaceId) return <main>Sem workspace.</main>

  const feature = await prisma.feature.findUnique({ where: { id: params.id } })
  if (!feature) return notFound()
  if (feature.workspaceId !== me.workspaceId) return <main>Sem acesso.</main>
  const isOwner = feature.createdById === me.id
  const canManage = me.role === 'ADMIN' || me.role === 'COMPANY'
  if (!isOwner && !canManage) return <main>Sem permissão.</main>

  async function action(formData: FormData) {
    'use server'
    const title = String(formData.get('title') || '')
    const description = String(formData.get('description') || '')
    const impactRaw = String(formData.get('impact') || '')
    const effortRaw = String(formData.get('effort') || '')
    const impact = impactRaw ? Number(impactRaw) : null
    const effort = effortRaw ? Number(effortRaw) : null
    await updateFeatureDetails({ id: feature!.id, title, description, impact, effort })
    redirect('/dashboard/features')
  }

  async function remove() {
    'use server'
    await deleteFeature(feature!.id)
    redirect('/dashboard/features')
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar funcionalidade</h1>
        <Link href="/dashboard/features" className="text-sm text-gray-600 hover:text-gray-800">← Voltar</Link>
      </div>
      <form action={action} className="rounded-lg border bg-white p-4 space-y-3 max-w-2xl">
        <input name="title" defaultValue={feature!.title} className="w-full rounded-md border px-3 py-2 text-sm" required />
        <textarea name="description" defaultValue={feature!.description} rows={5} className="w-full rounded-md border px-3 py-2 text-sm" required />
        <div className="flex gap-3">
          <input name="impact" type="number" min={1} max={5} defaultValue={feature!.impact ?? ''} placeholder="Impacto (1-5)" className="w-40 rounded-md border px-3 py-2 text-sm" />
          <input name="effort" type="number" min={1} max={5} defaultValue={feature!.effort ?? ''} placeholder="Esforço (1-5)" className="w-40 rounded-md border px-3 py-2 text-sm" />
        </div>
        <button className="btn btn-primary" type="submit">Salvar</button>
      </form>
      <form action={remove}>
        <button className="btn btn-danger" type="submit">Excluir</button>
      </form>
    </main>
  )
}
