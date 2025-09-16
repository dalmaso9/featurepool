
import { Suspense } from 'react'
import SignInClient from './SignInClient'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="flex min-h-[70vh] items-center justify-center"><div className="text-sm text-gray-600">Carregando...</div></main>}>
      <SignInClient />
    </Suspense>
  )
}
