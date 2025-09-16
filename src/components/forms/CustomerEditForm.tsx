'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCustomer, deleteCustomer } from '@/actions/customers'

export default function CustomerEditForm({
  customer,
  onClose
}:{
  customer: { id: string, name: string, segment: string|null, size: string|null, monthlyRevenue: number|null, employees: number|null }
  onClose: () => void
}) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const [name, setName] = useState(customer.name)
  const [segment, setSegment] = useState(customer.segment ?? '')
  const [size, setSize] = useState(customer.size ?? '')
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>(customer.monthlyRevenue != null ? String(customer.monthlyRevenue) : '')
  const [employees, setEmployees] = useState<string>(customer.employees != null ? String(customer.employees) : '')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      await updateCustomer({
        id: customer.id,
        name,
        segment: segment || null,
        size: size || null,
        monthlyRevenue: monthlyRevenue ? Number(monthlyRevenue) : null,
        employees: employees ? Number(employees) : null
      })
      router.refresh()
      onClose()
    })
  }

  const onDelete = () => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    start(async () => {
      await deleteCustomer(customer.id)
      router.refresh()
      onClose()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={segment} onChange={e=>setSegment(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Segmento" />
        <input value={size} onChange={e=>setSize(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Porte" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={monthlyRevenue} onChange={e=>setMonthlyRevenue(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Receita mensal" inputMode="numeric" />
        <input value={employees} onChange={e=>setEmployees(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Colaboradores" inputMode="numeric" />
      </div>
      <div className="flex items-center justify-between">
        <button disabled={pending} className="btn btn-primary" type="submit">{pending ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" onClick={onDelete} className="btn btn-danger">Excluir</button>
      </div>
    </form>
  )
}

