'use client'

import { getProviders, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function SignInPage() {
  const [providers, setProviders] = useState<any>({})
  useEffect(() => { getProviders().then(setProviders) }, [])

  const handleCredentials = async (e: any) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email') as string
    await signIn('credentials', { email, redirect: true, callbackUrl: '/dashboard' })
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-center mb-1">Entrar</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Acesse sua conta para gerenciar funcionalidades e roadmap.</p>

        <form onSubmit={handleCredentials} className="space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="voce@empresa.com"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <button type="submit" className="btn btn-primary w-full">Entrar com email</button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-2">
          {Object.values(providers).filter((p:any)=>p.id!=='credentials').length === 0 && (
            <p className="text-xs text-gray-500 text-center">Configure Google/Microsoft no .env para habilitar SSO.</p>
          )}
          {Object.values(providers).filter((p:any)=>p.id!=='credentials').map((provider: any) => (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
              className="btn w-full border"
            >
              Entrar com {provider.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}