import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { deleteCustomer, updateCustomer } from '@/actions/customers'
import Link from 'next/link'

export default async function EditCustomerPage({ params }:{ params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const me = (session as any)?.user
  if (!me?.workspaceId) return <main>Sem workspace.</main>

  const customer = await prisma.customerCompany.findUnique({ where: { id: params.id } })
  if (!customer) return notFound()
  if (customer.workspaceId !== me.workspaceId) return <main>Sem acesso.</main>

  async function action(formData: FormData) {
    'use server'
    const name = String(formData.get('name') || '')
    const segment = String(formData.get('segment') || '') || null
    const size = String(formData.get('size') || '') || null
    const monthlyRevenueRaw = String(formData.get('monthlyRevenue') || '')
    const employeesRaw = String(formData.get('employees') || '')
    const monthlyRevenue = monthlyRevenueRaw ? Number(monthlyRevenueRaw) : null
    const employees = employeesRaw ? Number(employeesRaw) : null
    await updateCustomer({ id: customer!.id, name, segment, size, monthlyRevenue, employees })
    redirect('/settings/customers')
  }

  async function remove() {
    'use server'
    await deleteCustomer(customer!.id)
    redirect('/settings/customers')
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar cliente</h1>
        <Link href="/settings/customers" className="text-sm text-gray-600 hover:text-gray-800">← Voltar</Link>
      </div>
      <form action={action} className="rounded-lg border bg-white p-4 space-y-3 max-w-2xl">
        <input name="name" defaultValue={customer!.name} className="w-full rounded-md border px-3 py-2 text-sm" required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="segment" defaultValue={customer!.segment ?? ''} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Segmento" />
          <input name="size" defaultValue={customer!.size ?? ''} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Porte" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="monthlyRevenue" type="number" defaultValue={customer!.monthlyRevenue ? Number(customer!.monthlyRevenue) : ''} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Receita mensal" />
          <input name="employees" type="number" defaultValue={customer!.employees ?? ''} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Colaboradores" />
        </div>
        <button className="btn btn-primary" type="submit">Salvar</button>
      </form>
      <form action={remove}>
        <button className="btn btn-danger" type="submit">Excluir</button>
      </form>
    </main>
  )
}
