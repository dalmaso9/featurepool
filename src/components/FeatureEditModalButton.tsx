'use client'

import { useState } from 'react'
import Modal from './Modal'
import FeatureEditForm from './forms/FeatureEditForm'

export default function FeatureEditModalButton({ feature }:{ feature: { id: string, title: string, description: string, impact: number|null, effort: number|null } }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="text-xs text-indigo-600 hover:text-indigo-500 underline" onClick={() => setOpen(true)}>Editar</button>
      <Modal open={open} onClose={()=>setOpen(false)} title="Editar funcionalidade" size="lg">
        <FeatureEditForm feature={feature} onClose={()=>setOpen(false)} />
      </Modal>
    </>
  )
}

