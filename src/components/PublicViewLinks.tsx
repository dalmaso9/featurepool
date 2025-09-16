"use client"

import Link from 'next/link'

export default function PublicViewLinks() {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Link href="/features" className="btn btn-ghost">Ver Features públicas</Link>
      <Link href="/roadmap" className="btn btn-ghost">Ver Roadmap público</Link>
      <Link href="/changelog" className="btn btn-ghost">Ver Changelog público</Link>
    </div>
  )
}

