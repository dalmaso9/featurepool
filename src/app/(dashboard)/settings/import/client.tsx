"use client"

import { useState, useTransition } from 'react'
import { importCustomers } from '@/actions/customers'

export default function ImportCustomersClient({ workspaceId }:{ workspaceId: string }) {
  const [csv, setCsv] = useState('name,monthlyRevenue,employees,size,segment\nACME,50000,1200,enterprise,manufacturing')
  const [pending, start] = useTransition()
  const [result, setResult] = useState<string>('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      try {
        const res = await importCustomers(workspaceId, csv)
        setResult(`${res.imported} clientes importados/atualizados`)
      } catch (e:any) {
        setResult(e?.message || 'Erro ao importar')
      }
    })
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Importar Clientes</h1>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm text-gray-600">Cole seus dados CSV com cabeçalho: <code>name,monthlyRevenue,employees,size,segment</code></p>
        <textarea value={csv} onChange={e=>setCsv(e.target.value)} rows={10} className="w-full rounded-md border px-3 py-2 text-sm font-mono" />
        <button disabled={pending} className="btn btn-primary">{pending ? 'Importando...' : 'Importar'}</button>
        {result && <div className="text-sm text-gray-700">{result}</div>}
      </form>
    </main>
  )
}

