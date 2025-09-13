import Link from 'next/link'
import ScoreBadge from './ScoreBadge'

export default function FeatureCard({
  feature,
  showScoreAndCompanies = true
}: {
  feature: {
    id: string
    title: string
    description: string
    status: string
    score: any
    companies: number
    votes: number
  },
  showScoreAndCompanies?: boolean
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900">{feature.title}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-3">{feature.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10">
              {feature.status.replaceAll('_',' ')}
            </span>
            {showScoreAndCompanies && <ScoreBadge score={feature.score} />}
            {showScoreAndCompanies && <span className="text-xs text-gray-500">{feature.companies} empresas</span>}
            <span className="text-xs text-gray-500">{feature.votes} votos</span>
          </div>
        </div>
        <Link href={`/features/${feature.id}`} className="text-sm text-indigo-600 hover:text-indigo-500">
          Detalhes
        </Link>
      </div>
    </div>
  )
}
