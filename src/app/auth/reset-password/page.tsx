import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-[70vh] items-center justify-center"><div className="text-sm text-gray-600">Carregando...</div></main>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
