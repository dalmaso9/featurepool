"use client"

import { useTransition } from 'react'
import { updateWorkspaceUserRole } from '@/actions/admin'

export default function UsersManager({ users }:{ users: { id: string, name: string|null, email: string|null, role: 'CLIENT'|'COMPANY'|'ADMIN' }[] }) {
  const [pending, start] = useTransition()

  const onChange = (id: string, role: 'CLIENT'|'COMPANY') => {
    start(async () => {
      await updateWorkspaceUserRole(id, role)
    })
  }

  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="text-base font-semibold mb-3">Usuários da empresa</h2>
      <div className="divide-y">
        {users.map(u => (
          <div key={u.id} className="py-2 flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="font-medium">{u.name || u.email}</div>
              <div className="text-gray-500">{u.email}</div>
            </div>
            {u.role === 'ADMIN' ? (
              <span className="text-xs text-gray-500">ADMIN global</span>
            ) : (
              <select
                defaultValue={u.role}
                onChange={(e)=>onChange(u.id, e.target.value as any)}
                disabled={pending}
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value="CLIENT">Cliente</option>
                <option value="COMPANY">Colaborador (admin do espaço)</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

