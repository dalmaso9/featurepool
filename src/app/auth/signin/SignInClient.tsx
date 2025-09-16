"use client"

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInClient() {
  const [showPass, setShowPass] = useState(false)
  const sp = useSearchParams()
  const resetOk = sp.get('reset') === '1'
  const errorParam = sp.get('error')
  const errorMessage = (() => {
    if (!errorParam) return null
    switch (errorParam) {
      case 'CredentialsSignin':
        return 'Email ou senha incorretos.'
      case 'AccessDenied':
        return 'Conta não encontrada. Crie uma conta primeiro.'
      default:
        return 'Não foi possível entrar. Tente novamente.'
    }
  })()

  const handleCredentials = async (e: any) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    await signIn('credentials', { email, password, redirect: true, callbackUrl: '/dashboard' })
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-center mb-1">Entrar</h1>
        {resetOk && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 text-center">
            Senha redefinida com sucesso. Faça login.
          </div>
        )}
        {errorMessage && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center">
            {errorMessage}
          </div>
        )}
        <p className="text-center text-sm text-gray-600 mb-6">Acesse sua conta para gerenciar funcionalidades e roadmap.</p>

        <form onSubmit={handleCredentials} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="voce@empresa.com"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Senha</label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Sua senha"
                className="w-full rounded-md border px-3 py-2 text-sm pr-10"
              />
              <button
                type="button"
                onClick={()=>setShowPass(s=>!s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600"
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="btn btn-primary">Entrar</button>
            <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">Esqueceu a senha?</Link>
          </div>
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
          <button disabled className="btn w-full border opacity-60 cursor-not-allowed">Entrar com Google</button>
          <button disabled className="btn w-full border opacity-60 cursor-not-allowed">Entrar com Apple</button>
        </div>
      </div>
    </main>
  )
}
