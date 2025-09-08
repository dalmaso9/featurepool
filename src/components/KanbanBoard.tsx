'use client'

import { useTransition } from 'react'
import { updateFeatureStatus } from '@/actions/features'

type Column = 'BACKLOG'|'UNDER_REVIEW'|'IN_DEVELOPMENT'|'DELIVERED'

export default function KanbanBoard({ items, canEdit }: {
  canEdit: boolean
  items: { id: string, title: string, status: Column }[]
}) {
  const [pending, start] = useTransition()
  const columns: Column[] = ['BACKLOG', 'UNDER_REVIEW', 'IN_DEVELOPMENT', 'DELIVERED']

  const move = (id: string, status: Column) => {
    start(async () => { await updateFeatureStatus(id, status) })
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {columns.map(col => (
        <div key={col} className="rounded-lg border bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">{col.replaceAll('_',' ')}</h3>
          <div className="space-y-2">
            {items.filter(i => i.status === col).map(i => (
              <div key={i.id} className="rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{i.title}</span>
                  {canEdit && (
                    <select
                      value={i.status}
                      onChange={(e)=>move(i.id, e.target.value as Column)}
                      disabled={pending}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      {columns.map(c => <option key={c} value={c}>{c.replaceAll('_',' ')}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
