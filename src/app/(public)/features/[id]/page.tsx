import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { getWorkspaceFromHost } from '@/lib/tenant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import InterestedCompanyForm from '@/components/InterestedCompanyForm'
import CommentList from '@/components/CommentList'
import CommentForm from '@/components/CommentForm'
import Link from 'next/link'

export default async function FeatureDetails({ params }:{ params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const host = headers().get('host')
  const ws = await getWorkspaceFromHost(host || undefined)

  if (ws && ws.publicAccessEnabled === false) {
    const role = (session as any)?.user?.role
    const userWs = (session as any)?.user?.workspaceId
    const isInternal = (role === 'COMPANY' || role === 'ADMIN') && userWs === ws.id
    if (!isInternal) redirect('/auth/signin')
  }

  const feature = await prisma.feature.findFirst({
    where: { id: params.id, ...(ws ? { workspaceId: ws.id } : {}) },
    include: {
      interestedCos: { include: { customerCompany: true } },
      comments: { include: { user: true }, orderBy: { createdAt: 'desc' } }
    }
  })
  if (!feature) return <main className="p-4">Funcionalidade não encontrada.</main>
  const isInternal = (() => {
    if (!ws) return false
    const role = (session as any)?.user?.role
    const userWs = (session as any)?.user?.workspaceId
    return (role === 'COMPANY' || role === 'ADMIN') && userWs === ws.id
  })()

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{feature.title}</h1>
        <Link href="/features" className="text-sm text-gray-600 hover:text-gray-800">← Voltar</Link>
      </div>
      <p className="text-sm text-gray-700">{feature.description}</p>

      {isInternal && (
        <section className="rounded-lg border bg-white">
          <div className="p-4 border-b">
            <h3 className="font-medium">Empresas que solicitaram ({feature.interestedCos.length})</h3>
          </div>
          <div className="divide-y">
            {feature.interestedCos.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Nenhuma empresa adicionada ainda.</div>
            )}
            {feature.interestedCos.map((ic) => (
              <div key={ic.customerCompanyId} className="p-4 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="font-medium">{ic.customerCompany.name}</div>
                <div className="text-gray-600">
                  {ic.contact && <span className="mr-4">Contato: {ic.contact}</span>}
                  {ic.internalAgent && <span className="mr-4">Atendente: {ic.internalAgent}</span>}
                  {ic.notes && <span className="block md:inline text-gray-500">Notas: {ic.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cadastro de empresa interessada: somente usuários logados */}
      {ws && session && (
        <InterestedCompanyForm featureId={feature.id} workspaceId={ws.id} />
      )}

      <section className="rounded-lg border bg-white p-4">
        <form action={`/api/features/${feature.id}/status`} method="post" className="flex items-center gap-3">
          {/* placeholder para futura edição de status/impact/effort aqui se desejar */}
          <span className="text-xs text-gray-500">Status atual: {String(feature.status).replaceAll('_',' ')}</span>
        </form>
      </section>

      {/* Comentários públicos */}
      <section className="rounded-lg border bg-white p-4 space-y-3">
        <h3 className="font-medium">Comentários</h3>
        <CommentList
          workspaceId={ws?.id || ''}
          featureId={feature.id}
          comments={feature.comments.map(c => ({ id: c.id, content: c.content, user: { name: c.user?.name ?? 'Usuário' } }))}
        />
        {session && (
          <CommentForm featureId={feature.id} />
        )}
      </section>
    </main>
  )
}
