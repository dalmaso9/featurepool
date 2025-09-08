import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateScoringConfig } from '@/actions/admin'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  const workspace = workspaceId ? await prisma.workspace.findUnique({ where: { id: workspaceId }, include: { scoring: true } }) : await prisma.workspace.findFirst({ where: { slug: 'demo' }, include: { scoring: true } })
  if (!workspace) return <main>Sem workspace.</main>

  async function action(formData: FormData) {
    'use server'
    const weightCompanies = Number(formData.get('weightCompanies') || 5)
    const weightImpact = Number(formData.get('weightImpact') || 3)
    const weightEffort = Number(formData.get('weightEffort') || -2)
    const weightRevenue = Number(formData.get('weightRevenue') || 0)
    await updateScoringConfig(workspace!.id, { weightCompanies, weightImpact, weightEffort, weightRevenue })
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Admin — Configuração de Score</h1>
      <form action={action} className="rounded-lg border bg-white p-4 space-y-3 max-w-md">
        <div>
          <label className="block text-sm font-medium">Peso — Nº empresas</label>
          <input name="weightCompanies" defaultValue={workspace.scoring?.weightCompanies ?? 5} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Peso — Impacto</label>
          <input name="weightImpact" defaultValue={workspace.scoring?.weightImpact ?? 3} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Peso — Esforço</label>
          <input name="weightEffort" defaultValue={workspace.scoring?.weightEffort ?? -2} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Peso — Receita</label>
          <input name="weightRevenue" defaultValue={workspace.scoring?.weightRevenue ?? 0} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500" type="submit">Salvar</button>
      </form>
    </main>
  )
}
