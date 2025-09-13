'use client'

import { ReactNode, useEffect } from 'react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}:{
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm'|'md'|'lg'|'xl'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const width = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full ${width} rounded-lg bg-white shadow-lg ring-1 ring-black/5`}
          role="dialog" aria-modal="true">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-medium">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="p-4">
            {children}
          </div>
          {footer && (
            <div className="border-t px-4 py-3 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

