'use client'

import { useState } from 'react'
import { signupAction } from '@/actions/auth'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const pass = String(formData.get('password') || '')
    const confirm = String(formData.get('confirmPassword') || '')
    if (pass !== confirm) {
      setError('As senhas não coincidem.')
      setIsLoading(false)
      return
    }
    const result = await signupAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      // Fazer login automático após signup
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      await signIn('credentials', { email, password, redirect: false })
      if (result.createdWorkspace || result.role === 'COMPANY') router.push('/onboarding')
      else router.push('/features')
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-center mb-1">Criar Conta</h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Comece a gerenciar suas funcionalidades e roadmap.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome completo</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Seu nome completo"
              className="w-full rounded-md border px-3 py-2 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="voce@empresa.com"
              className="w-full rounded-md border px-3 py-2 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-md border px-3 py-2 text-sm pr-10"
                disabled={isLoading}
              />
              <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirmar senha</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="Repita a senha"
                className="w-full rounded-md border px-3 py-2 text-sm pr-10"
                disabled={isLoading}
              />
              <button type="button" onClick={()=>setShowConfirm(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                {showConfirm ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {/* Tipo de conta removido. Primeiro usuário do workspace vira admin automaticamente. */}

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-2">
          <button disabled className="btn w-full border opacity-60 cursor-not-allowed">Criar conta com Google (desabilitado)</button>
          <button disabled className="btn w-full border opacity-60 cursor-not-allowed">Criar conta com Apple (desabilitado)</button>
        </div>
      </div>
    </main>
  )
}
