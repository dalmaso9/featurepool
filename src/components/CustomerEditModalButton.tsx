'use client'

import { useState } from 'react'
import Modal from './Modal'
import CustomerEditForm from './forms/CustomerEditForm'

export default function CustomerEditModalButton({ customer }:{ customer: { id: string, name: string, segment: string|null, size: string|null, monthlyRevenue: number|null, employees: number|null } }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="text-xs text-indigo-600 hover:text-indigo-500 underline" onClick={() => setOpen(true)}>Editar</button>
      <Modal open={open} onClose={()=>setOpen(false)} title="Editar cliente" size="lg">
        <CustomerEditForm customer={customer} onClose={()=>setOpen(false)} />
      </Modal>
    </>
  )
}

