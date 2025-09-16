'use client'

import { useState } from 'react'
import Modal from './Modal'
import ChangelogEditForm from './forms/ChangelogEditForm'

export default function ChangelogEditModalButton({ entry }:{ entry: { id: string, title: string, content: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="text-xs text-indigo-600 hover:text-indigo-500 underline" onClick={() => setOpen(true)}>Editar</button>
      <Modal open={open} onClose={()=>setOpen(false)} title="Editar entrada de changelog" size="lg">
        <ChangelogEditForm entry={entry} onClose={()=>setOpen(false)} />
      </Modal>
    </>
  )
}

