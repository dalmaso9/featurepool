import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getWorkspaceFromHost } from '@/lib/tenant'

export default async function Root() {
  const host = headers().get('host') || undefined
  const ws = await getWorkspaceFromHost(host)
  if (ws) {
    redirect('/features')
  } else {
    redirect('/auth/signin')
  }
}
