'use client'

import { useEffect } from 'react'
import Pusher from 'pusher-js'
import { useRouter } from 'next/navigation'

export default function CommentList({ workspaceId, featureId, comments }:
  { workspaceId: string, featureId: string, comments: { id: string, content: string, user: { name: string | null } }[] }) {

  const router = useRouter()

  useEffect(() => {
    // simple real-time invalidation on comment events
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return
    const p = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu' })
    const channel = p.subscribe(`workspace-${workspaceId}`)
    channel.bind('feature:commented', (e: any) => {
      if (e.featureId === featureId) router.refresh()
    })
    return () => {
      channel.unsubscribe()
      p.disconnect()
    }
  }, [workspaceId, featureId, router])

  return (
    <ul className="mt-2 space-y-2">
      {comments.map(c => (
        <li key={c.id} className="rounded-md bg-gray-50 p-2 text-sm">
          <strong>{c.user.name ?? 'Usuário'}</strong>: {c.content}
        </li>
      ))}
    </ul>
  )
}
