import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CustomerEditModalButton from '@/components/CustomerEditModalButton'

function formatMoney(n?: any) {
  if (n == null) return '-'
  const num = Number(n)
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default async function CustomersListPage({ searchParams }:{ searchParams?: Record<string,string|undefined> }) {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  if (!workspaceId) return <main>Sem workspace.</main>

  const q = (searchParams?.q || '').toString().trim()
  const order = (searchParams?.order || 'name').toString()

  const where:any = { workspaceId }
  if (q) where.name = { contains: q, mode: 'insensitive' }

  const orderBy:any = order === 'revenue' ? [{ monthlyRevenue: 'desc' }] : order === 'employees' ? [{ employees: 'desc' }] : [{ name: 'asc' }]

  const customers = await prisma.customerCompany.findMany({
    where,
    orderBy,
    include: { interestedIn: true }
  })

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <form className="flex items-center gap-2" method="get">
          <input name="q" defaultValue={q} placeholder="Buscar por nome" className="rounded-md border px-3 py-2 text-sm" />
          <select name="order" defaultValue={order} className="rounded-md border px-2 py-2 text-sm">
            <option value="name">Nome</option>
            <option value="revenue">Receita</option>
            <option value="employees">Colaboradores</option>
          </select>
          <button className="btn">Filtrar</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Segmento</th>
              <th className="px-4 py-2 text-left">Porte</th>
              <th className="px-4 py-2 text-right">Receita mensal</th>
              <th className="px-4 py-2 text-right">Colaboradores</th>
              <th className="px-4 py-2 text-right">Pedidos</th>
              <th className="px-4 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2 text-gray-600">{c.segment || '-'}</td>
                <td className="px-4 py-2 text-gray-600">{c.size || '-'}</td>
                <td className="px-4 py-2 text-right">{formatMoney(c.monthlyRevenue)}</td>
                <td className="px-4 py-2 text-right">{c.employees ?? '-'}</td>
                <td className="px-4 py-2 text-right">{c.interestedIn.length}</td>
                <td className="px-4 py-2 text-right">
                  <CustomerEditModalButton customer={{
                    id: c.id,
                    name: c.name,
                    segment: c.segment ?? null,
                    size: c.size ?? null,
                    monthlyRevenue: c.monthlyRevenue != null ? Number(c.monthlyRevenue) : null,
                    employees: c.employees != null ? Number(c.employees) : null
                  }} />
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Nenhum cliente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
