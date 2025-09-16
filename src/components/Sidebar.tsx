"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import SignOutButton from './SignOutButton'

function cx(...s: (string|false|undefined)[]) { return s.filter(Boolean).join(' ') }

export default function Sidebar() {
  // Desabilitado: colapso e pinagem da sidebar (fixa por enquanto)
  const [collapsed] = useState(false)
  const [pinned] = useState(true)
  const pathname = usePathname()
  const { data } = useSession()
  const role = (data as any)?.user?.role as string | undefined

  useEffect(() => {
    // Colapso desativado: ignorar estado salvo
  }, [])

  useEffect(() => {
    // Colapso desativado: não persistir
  }, [collapsed])
  useEffect(() => {
    // Colapso desativado: não persistir
  }, [pinned])

  const NavLink = ({ href, label }:{ href: string, label: string }) => (
    <Link href={href} className={cx('block rounded-md px-3 py-2 text-sm hover:bg-gray-100', pathname === href && 'bg-gray-100 font-medium')}>
      {label}
    </Link>
  )

  return (
    <aside className={cx('border-r bg-white transition-all flex flex-col', 'w-64')}>
      <div className="h-14 flex items-center justify-between px-3 border-b">
        <span className={cx('text-sm font-semibold', collapsed && 'opacity-0 pointer-events-none')}>Featurepool</span>
        {/* Controles de colapso desativados */}
      </div>
      <nav className="p-2 space-y-1 flex-1">
        <NavLink href="/dashboard" label="Dashboard" />
        <div className="h-px bg-gray-200 my-2" />
        <NavLink href="/dashboard/features" label="Funcionalidades" />
        <NavLink href="/dashboard/roadmap" label="Roadmap" />
        <NavLink href="/dashboard/changelog" label="Changelog" />
        <NavLink href="/settings/customers" label="Clientes" />
        <div className="h-px bg-gray-200 my-2" />
        <NavLink href="/settings" label="Configurações" />
        {role === 'ADMIN' && (
          <NavLink href="/admin" label="Admin" />
        )}
        <div className="h-px bg-gray-200 my-2" />
        {/*<div className={cx('px-3 text-[11px] uppercase tracking-wide text-gray-500', collapsed && 'hidden')}>Visão pública</div>
        <NavLink href="/features" label="Features públicas" />
        <NavLink href="/roadmap" label="Roadmap público" />
        <NavLink href="/changelog" label="Changelog público" />*/}
      </nav>
      <div className="border-t p-2">
        <SignOutButton />
      </div>
    </aside>
  )
}
