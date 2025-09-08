'use client'

import { useState, useTransition } from 'react'
import { createFeature } from '@/actions/features'

export default function FeatureForm({ workspaceId }:{ workspaceId: string }) {
  const [pending, start] = useTransition()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [impact, setImpact] = useState<number|''>('')
  const [effort, setEffort] = useState<number|''>('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      await createFeature({ workspaceId, title, description, impact: impact || undefined, effort: effort || undefined })
      setTitle(''); setDescription(''); setImpact(''); setEffort('')
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-900">Sugerir nova funcionalidade</h3>
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Título"
          required
          minLength={3}
        />
        <textarea
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Descrição"
          rows={4}
          required
        />
      </div>
      <div className="flex gap-3">
        <input type="number" min={1} max={5} value={impact as any}
          onChange={(e)=>setImpact(e.target.value ? Number(e.target.value): '')}
          placeholder="Impacto (1-5)"
          className="w-40 rounded-md border px-3 py-2 text-sm"/>
        <input type="number" min={1} max={5} value={effort as any}
          onChange={(e)=>setEffort(e.target.value ? Number(e.target.value): '')}
          placeholder="Esforço (1-5)"
          className="w-40 rounded-md border px-3 py-2 text-sm"/>
      </div>
      <button
        disabled={pending}
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        type="submit"
      >
        {pending ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  )
}
