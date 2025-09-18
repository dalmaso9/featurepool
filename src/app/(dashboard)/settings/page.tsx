import Link from 'next/link'

export default function SettingsIndex() {
  const Item = ({ href, title, desc }:{ href: string, title: string, desc: string }) => (
    <Link href={href} className="block rounded-lg border bg-white p-4 hover:bg-gray-50">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </Link>
  )
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Configurações</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Item href="/settings/company" title="Empresa e URL" desc="Nome, slug e visibilidade pública do espaço." />
        <Item href="/settings/users" title="Usuários" desc="Gerencie os membros e papéis do seu espaço." />
        <Item href="/settings/customers" title="Clientes" desc="Veja e pesquise todas as empresas cadastradas." />
        <Item href="/settings/scoring" title="Motor de Score" desc="Pesos e critérios para priorização." />
        <Item href="/settings/import" title="Importar Clientes" desc="Importe seus clientes (receita, colaboradores)." />
      </div>
    </main>
  )
}
