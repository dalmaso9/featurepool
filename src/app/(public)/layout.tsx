import { ReactNode } from 'react'
import { headers } from 'next/headers'
import { getWorkspaceFromHost } from '@/lib/tenant'
import PublicNavbar from '@/components/PublicNavbar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  const host = headers().get('host') || undefined
  const ws = await getWorkspaceFromHost(host)
  return (
    <>
      <PublicNavbar workspaceName={ws?.name} isLoggedIn={!!session} />
      <div className="container-app py-6">{children}</div>
    </>
  )
}
