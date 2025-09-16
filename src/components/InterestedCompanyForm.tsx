'use client'

import { useState, useTransition } from 'react'
import { addInterestedCompany } from '@/actions/features'

export default function InterestedCompanyForm({ featureId, workspaceId }:{ featureId: string, workspaceId: string }) {
  const [pending, start] = useTransition()
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [agent, setAgent] = useState('')
  const [notes, setNotes] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    start(async () => {
      await addInterestedCompany({ featureId, workspaceId, company, contact, internalAgent: agent, notes })
      setCompany(''); setContact(''); setAgent(''); setNotes('')
    })
  }

  return (
    <form onSubmit={submit} className="rounded-lg border bg-white p-4 space-y-3">
      <h4 className="text-sm font-medium">Adicionar pedido de empresa</h4>
      <input value={company} onChange={e=>setCompany(e.target.value)} required placeholder="Ex.: Empresa Alfa"
        className="w-full rounded-md border px-3 py-2 text-sm" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Contato (opcional)"
          className="w-full rounded-md border px-3 py-2 text-sm" />
        <input value={agent} onChange={e=>setAgent(e.target.value)} placeholder="Atendente interno (opcional)"
          className="w-full rounded-md border px-3 py-2 text-sm" />
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notas (opcional)"
        className="w-full rounded-md border px-3 py-2 text-sm" rows={3} />
      <button disabled={pending} className="btn btn-primary">{pending ? 'Adicionando...' : 'Adicionar pedido'}</button>
    </form>
  )
}