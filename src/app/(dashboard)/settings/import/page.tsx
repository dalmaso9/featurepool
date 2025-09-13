import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ImportCustomersClient from './client'

export default async function ImportCustomersPage() {
  const session = await getServerSession(authOptions)
  const workspaceId = (session as any)?.user?.workspaceId
  if (!workspaceId) return <main>Sem workspace.</main>
  return <ImportCustomersClient workspaceId={workspaceId} />
}

