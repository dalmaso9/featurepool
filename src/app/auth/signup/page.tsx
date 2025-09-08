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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await signupAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      // Fazer login automático após signup
      await signIn('credentials', {
        email: result.email,
        redirect: false
      })
      router.push('/dashboard')
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
            <label className="block text-sm font-medium mb-1">Nome da empresa</label>
            <input
              name="company"
              type="text"
              required
              placeholder="Nome da sua empresa"
              className="w-full rounded-md border px-3 py-2 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de conta</label>
            <select
              name="role"
              className="w-full rounded-md border px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="CLIENT">Cliente (quero solicitar funcionalidades)</option>
              <option value="COMPANY">Empresa (quero gerenciar funcionalidades)</option>
            </select>
          </div>

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
      </div>
    </main>
  )
}
