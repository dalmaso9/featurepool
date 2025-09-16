'use client'

import { useState, useTransition } from 'react'
import { commentFeature } from '@/actions/features'

export default function CommentForm({ featureId }:{ featureId: string }) {
  const [pending, start] = useTransition()
  const [content, setContent] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    start(async () => {
      await commentFeature({ featureId, content })
      setContent('')
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e)=>setContent(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Adicionar um comentário"
        rows={3}
        required
      />
      <button disabled={pending} className="btn btn-primary">
        {pending ? 'Enviando...' : 'Comentar'}
      </button>
    </form>
  )
}

