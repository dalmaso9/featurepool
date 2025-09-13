import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateScoringConfig } from '@/actions/admin'

export default async function ScoringSettingsPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  if (!workspaceId) return <main>Sem workspace.</main>
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, include: { scoring: true } })
  if (!workspace) return <main>Sem workspace.</main>

  async function action(formData: FormData) {
    'use server'
    const weightCompanies = Number(formData.get('weightCompanies') || 5)
    const weightImpact = Number(formData.get('weightImpact') || 3)
    const weightEffort = Number(formData.get('weightEffort') || -2)
    const weightRevenue = Number(formData.get('weightRevenue') || 0)
    const weightEmployees = Number(formData.get('weightEmployees') || 0)
    await updateScoringConfig(workspace!.id, { weightCompanies, weightImpact, weightEffort, weightRevenue, /* @ts-ignore */ weightEmployees })
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Motor de Score</h1>
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
          <label className="block text-sm font-medium">Peso — Receita mensal</label>
          <input name="weightRevenue" defaultValue={workspace.scoring?.weightRevenue ?? 0} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Peso — Nº colaboradores</label>
          <input name="weightEmployees" defaultValue={(workspace.scoring as any)?.weightEmployees ?? 0} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500" type="submit">Salvar</button>
      </form>
      <p className="text-sm text-gray-600 max-w-xl">Dica: a receita e colaboradores entram via log para evitar distorções. Ajuste os pesos para refletir seu modelo de priorização.</p>
    </main>
  )
}

