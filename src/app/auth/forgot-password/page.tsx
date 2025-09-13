"use client"

import { useState, useTransition } from 'react'
import { requestPasswordReset } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [pending, start] = useTransition()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<{ ok: boolean, url?: string } | null>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      const res = await requestPasswordReset(new FormData(e.target as HTMLFormElement))
      setSent({ ok: true, url: res.devResetUrl })
    })
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-center mb-1">Esqueceu a senha</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Informe seu email para receber o link de redefinição.</p>

        {sent?.ok ? (
          <div className="space-y-3">
            <div className="p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-700">
              Se o email existir, enviaremos um link de redefinição.
            </div>
            {sent.url && (
              <div className="p-3 rounded-md bg-gray-50 border text-xs break-all">
                Ambiente de desenvolvimento: use este link para testar:
                <div className="mt-1 text-indigo-700">{sent.url}</div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm font-medium">Email</label>
            <input name="email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full rounded-md border px-3 py-2 text-sm" />
            <button disabled={pending} className="btn btn-primary w-full">{pending ? 'Enviando...' : 'Enviar'}</button>
          </form>
        )}
      </div>
    </main>
  )
}
