import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Evita qualquer tentativa de pré-render/SSG e garante execução em runtime
export const dynamic = 'force-dynamic'
export const revalidate = 0

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
