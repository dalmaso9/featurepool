'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateChangelogEntry, deleteChangelogEntry } from '@/actions/changelog'

export default function ChangelogEditForm({ entry, onClose }:{ entry: { id: string, title: string, content: string }, onClose: () => void }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    start(async () => {
      await updateChangelogEntry({ id: entry.id, title, content })
      router.refresh()
      onClose()
    })
  }

  const onDelete = () => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return
    start(async () => {
      await deleteChangelogEntry(entry.id)
      router.refresh()
      onClose()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" required />
      <textarea value={content} onChange={e=>setContent(e.target.value)} rows={5} className="w-full rounded-md border px-3 py-2 text-sm" required />
      <div className="flex items-center justify-between">
        <button disabled={pending} className="btn btn-primary" type="submit">{pending ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" onClick={onDelete} className="btn btn-danger">Excluir</button>
      </div>
    </form>
  )
}

