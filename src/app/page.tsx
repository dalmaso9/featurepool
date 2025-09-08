import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="space-y-12">
      <section className="mx-auto max-w-3xl text-center py-8">
        <p className="mb-3 text-xs text-gray-600">📣 Em desenvolvimento — Acesse antecipadamente (beta)</p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          Transforme pedidos de <span className="underline-accent">funcionalidades</span> em <span className="text-gradient">estratégia</span>
        </h1>
        <p className="mt-4 text-gray-700">
          Centralize, priorize e comunique seu roadmap com dados. Clientes votam e comentam; empresa vê impacto, esforço e score.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/auth/signin" className="btn btn-primary">Quero o Beta</Link>
          <Link href="/features" className="btn btn-ghost">Ver funcionalidades</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <h3 className="font-semibold">Pedidos dispersos</h3>
          <p className="text-sm text-gray-600">Pare de perder pedidos em e-mails e planilhas.</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold">Priorização subjetiva</h3>
          <p className="text-sm text-gray-600">Use dados: nº de empresas, impacto, esforço e receita.</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold">Clientes no escuro</h3>
          <p className="text-sm text-gray-600">Transparência com Roadmap Kanban e Changelog.</p>
        </div>
      </section>
    </main>
  )
}