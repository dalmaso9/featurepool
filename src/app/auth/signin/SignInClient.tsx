"use client"

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn } from "lucide-react"
import Image from "next/image"

<Image 
  src="/icons/google.svg" 
  alt="Google" 
  width={20} 
  height={20} 
/>


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
        <h1 className="text-xl font-semibold text-center mb-1">Entrar na sua conta</h1>
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
                {showPass ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
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
              Registre-se
            </Link>
          </p>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-2">
          <button disabled className="btn w-full border opacity-60 cursor-not-allowed">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
            </svg>
            Entrar com Google
          </button>
          <button disabled className="btn w-full border opacity-60 cursor-not-allowed">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path>
            </svg>
            Entrar com Apple
          </button>
        </div>
      </div>
    </main>
  )
}
