import { format } from 'date-fns'

export default function ChangelogList({ entries }: { entries: {
  id: string
  title: string
  content: string
  releasedAt: Date
  assets: { id: string, url: string }[]
}[] }) {
  return (
    <ol className="relative border-s border-gray-200 md:ml-2 ml-1">
      {entries.map(e => (
        <li key={e.id} className="mb-6 ms-6">
          <span className="absolute -start-3 flex size-6 items-center justify-center rounded-full bg-indigo-100 ring-8 ring-white">
            <span className="size-2 rounded-full bg-indigo-600" />
          </span>
          <h3 className="text-base font-semibold text-gray-900">{e.title}</h3>
          <time className="mb-1 block text-xs text-gray-500">{format(new Date(e.releasedAt), 'dd/MM/yyyy')}</time>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{e.content}</p>
          {e.assets.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {e.assets.map(a => <a key={a.id} href={a.url} className="text-xs text-indigo-600 hover:text-indigo-500 underline" target="_blank">Anexo</a>)}
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
