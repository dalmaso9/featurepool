"use client"

import { useTransition } from 'react'
import { updateFeatureStatus } from '@/actions/features'

export default function FeatureStatusSelect({ featureId, status }:{ featureId: string, status: 'BACKLOG'|'UNDER_REVIEW'|'IN_DEVELOPMENT'|'DELIVERED' }) {
  const [pending, start] = useTransition()
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as any
    start(async () => {
      await updateFeatureStatus(featureId, value)
    })
  }
  return (
    <select defaultValue={status} onChange={onChange} disabled={pending} className="rounded-md border px-2 py-1 text-xs">
      <option value="BACKLOG">Backlog</option>
      <option value="UNDER_REVIEW">Em análise</option>
      <option value="IN_DEVELOPMENT">Em desenvolvimento</option>
      <option value="DELIVERED">Entregue</option>
    </select>
  )
}

