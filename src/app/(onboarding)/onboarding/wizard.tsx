"use client"

import { useState, useTransition } from 'react'
import { updateWorkspaceSettings } from '@/actions/admin'
import { updateWorkspaceProfile, seedSampleFeatures, completeOnboarding } from '@/actions/onboarding'
import { useRouter } from 'next/navigation'

export default function OnboardingWizard({ workspaceId, initialName, initialSlug, initialPublic }:{ workspaceId: string, initialName: string, initialSlug: string, initialPublic: boolean }) {
  const [step, setStep] = useState(1)
  const [pending, start] = useTransition()
  const [name, setName] = useState(initialName)
  const [slug, setSlug] = useState(initialSlug)
  const [isPublic, setIsPublic] = useState(initialPublic)
  const [seed, setSeed] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const next = () => setStep(s => Math.min(3, s + 1))
  const prev = () => setStep(s => Math.max(1, s - 1))

  const saveStep = () => {
    setError(null)
    if (step === 1) {
      start(async () => {
        try {
          await updateWorkspaceProfile(workspaceId, { name })
          next()
        } catch (e:any) { setError(e?.message || 'Erro ao salvar nome') }
      })
    } else if (step === 2) {
      start(async () => {
        try {
          await updateWorkspaceSettings(workspaceId, { slug })
          next()
        } catch (e:any) { setError(e?.message || 'Erro ao salvar slug') }
      })
    } else if (step === 3) {
      start(async () => {
        try {
          await updateWorkspaceSettings(workspaceId, { publicAccessEnabled: isPublic })
          if (seed) await seedSampleFeatures(workspaceId)
          await completeOnboarding(workspaceId)
          router.push('/dashboard')
        } catch (e:any) { setError(e?.message || 'Erro ao finalizar') }
      })
    }
  }

  return (
    <div className="space-y-4">
      <Steps step={step} />

      {step === 1 && (
        <section className="space-y-3">
          <h2 className="font-medium">Sua empresa</h2>
          <label className="block text-sm">Nome da empresa</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3">
          <h2 className="font-medium">URL pública</h2>
          <label className="block text-sm">Slug</label>
          <div className="flex items-center gap-2">
            <input
              value={slug}
              onChange={e=>setSlug(e.target.value.toLowerCase())}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              required
              className="w-64 rounded-md border px-3 py-2 text-sm"
              placeholder="minha-empresa"
            />
            <span className="text-xs text-gray-600">Ex.: {slug || 'minha-empresa'}.lvh.me:3000 (dev) • {slug || 'minha-empresa'}.featurepool.com (prod)</span>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <h2 className="font-medium">Visibilidade e exemplo</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} />
            Permitir acesso público às páginas (Features/Roadmap/Changelog)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={seed} onChange={e=>setSeed(e.target.checked)} />
            Criar funcionalidades de exemplo no meu espaço
          </label>
        </section>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center justify-between">
        <button className="btn" onClick={prev} disabled={pending || step === 1}>Voltar</button>
        <button className="btn btn-primary" onClick={saveStep} disabled={pending}>
          {step < 3 ? 'Continuar' : (pending ? 'Finalizando...' : 'Finalizar')}
        </button>
      </div>
    </div>
  )
}

function Steps({ step }:{ step:number }) {
  const items = [
    { id: 1, label: 'Empresa' },
    { id: 2, label: 'URL' },
    { id: 3, label: 'Visibilidade' }
  ]
  return (
    <ol className="flex items-center gap-3 text-sm">
      {items.map(i => (
        <li key={i.id} className={`flex items-center gap-2 ${step === i.id ? 'font-medium' : 'text-gray-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= i.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{i.id}</span>
          {i.label}
        </li>
      ))}
    </ol>
  )
}

