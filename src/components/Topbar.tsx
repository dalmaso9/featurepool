import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import SignOutButton from './SignOutButton'
import Logo from './Logo'

export default async function Topbar() {
  const session = await getServerSession(authOptions)
  const isAuthed = !!session?.user

  // Se não estiver logado, não renderiza nada
  if (!isAuthed) return null

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container-app flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-2">
            <Link className="btn btn-ghost" href="/features">Funcionalidades</Link>
            <Link className="btn btn-ghost" href="/roadmap">Roadmap</Link>
            <Link className="btn btn-ghost" href="/changelog">Changelog</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link className="btn btn-ghost" href="/dashboard">Empresa</Link>
          <Link className="btn btn-ghost" href="/admin">Admin</Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
