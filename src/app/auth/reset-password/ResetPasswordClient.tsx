"use client"

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/actions/auth'

export default function ResetPasswordClient() {
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const [pending, start] = useTransition()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    start(async () => {
      const res = await resetPassword(fd)
      if (!res.ok) { setError(res.error || 'Erro'); return }
      router.push('/auth/signin?reset=1')
    })
  }

  if (!token) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="card w-full max-w-md p-6 text-sm">Token inválido.</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-center mb-1">Redefinir senha</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Defina uma nova senha para sua conta.</p>
        {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="block text-sm font-medium mb-1">Nova senha</label>
            <div className="relative">
              <input name="password" type={showPass ? 'text' : 'password'} required className="w-full rounded-md border px-3 py-2 text-sm pr-10" placeholder="Mínimo 8 caracteres" />
              <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">{showPass ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmar senha</label>
            <div className="relative">
              <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} required className="w-full rounded-md border px-3 py-2 text-sm pr-10" placeholder="Repita a senha" />
              <button type="button" onClick={()=>setShowConfirm(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">{showConfirm ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </div>
          <button disabled={pending} className="btn btn-primary w-full">{pending ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
      </div>
    </main>
  )
}

