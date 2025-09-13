'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateFeatureDetails, deleteFeature } from '@/actions/features'

export default function FeatureEditForm({
  feature,
  onClose
}:{
  feature: { id: string, title: string, description: string, impact: number|null, effort: number|null }
  onClose: () => void
}) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const [title, setTitle] = useState(feature.title)
  const [description, setDescription] = useState(feature.description)
  const [impact, setImpact] = useState<number|''>(feature.impact ?? '')
  const [effort, setEffort] = useState<number|''>(feature.effort ?? '')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      await updateFeatureDetails({ id: feature.id, title, description, impact: impact || null, effort: effort || null })
      router.refresh()
      onClose()
    })
  }

  const onDelete = () => {
    if (!confirm('Tem certeza que deseja excluir esta funcionalidade?')) return
    start(async () => {
      await deleteFeature(feature.id)
      router.refresh()
      onClose()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" required />
      <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5} className="w-full rounded-md border px-3 py-2 text-sm" required />
      <div className="flex gap-3">
        <input type="number" min={1} max={5} value={impact as any} onChange={e=>setImpact(e.target.value ? Number(e.target.value) : '')} placeholder="Impacto (1-5)" className="w-40 rounded-md border px-3 py-2 text-sm" />
        <input type="number" min={1} max={5} value={effort as any} onChange={e=>setEffort(e.target.value ? Number(e.target.value) : '')} placeholder="Esforço (1-5)" className="w-40 rounded-md border px-3 py-2 text-sm" />
      </div>
      <div className="flex items-center justify-between">
        <button disabled={pending} className="btn btn-primary" type="submit">{pending ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" onClick={onDelete} className="btn btn-danger">Excluir</button>
      </div>
    </form>
  )
}

