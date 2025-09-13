import Link from 'next/link'

export default function PublicNavbar({ workspaceName, isLoggedIn }: { workspaceName?: string | null, isLoggedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container-app flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold">{workspaceName || 'Feature Requests'}</span>
          <nav className="hidden md:flex items-center gap-2">
            <Link className="btn btn-ghost" href="/features">Funcionalidades</Link>
            <Link className="btn btn-ghost" href="/roadmap">Roadmap</Link>
            <Link className="btn btn-ghost" href="/changelog">Changelog</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link className="btn" href="/dashboard">Minha conta</Link>
          ) : (
            <Link className="btn" href="/auth/signin">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  )
}
