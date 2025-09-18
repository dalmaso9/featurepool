"use client"

import { useState, useTransition, useEffect } from 'react'
import { updateWorkspaceSettings } from '@/actions/admin'

export default function WorkspaceSettingsForm({ workspaceId, initialSlug, initialPublic }:{ workspaceId: string, initialSlug: string, initialPublic: boolean }) {
  const [pending, start] = useTransition()
  const [slug, setSlug] = useState(initialSlug)
  const [publicAccess, setPublicAccess] = useState(initialPublic)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(false)
    start(async () => {
      try {
        await updateWorkspaceSettings(workspaceId, {
          slug,
          publicAccessEnabled: publicAccess
        })
        setOk(true)
      } catch (err: any) {
        setError(err?.message || 'Erro ao salvar')
      }
    })
  }

  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="text-base font-semibold mb-2">Configurações de Espaço (URL e Visibilidade)</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <input
              value={slug}
              onChange={(e)=>setSlug(e.target.value.toLowerCase())}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              required
              className="w-64 rounded-md border px-3 py-2 text-sm"
              placeholder="minha-empresa"
            />
            <span className="text-xs text-gray-600">Subdomínio: {/*{slug || 'minha-empresa'}.lvh.me:3000 (dev) •*/} {slug || 'minha-empresa'}.featurepool.com</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="publicAccess" type="checkbox" checked={publicAccess} onChange={e=>setPublicAccess(e.target.checked)} />
          <label htmlFor="publicAccess" className="text-sm">Permitir acesso público às páginas (Features / Roadmap / Changelog)</label>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {ok && <div className="text-sm text-green-600">Salvo com sucesso</div>}

        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>
    </section>
  )
}
