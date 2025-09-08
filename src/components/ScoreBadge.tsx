import { Decimal } from '@prisma/client/runtime/library'

export default function ScoreBadge({ score }: { score: number | Decimal }) {
  const val = typeof score === 'number' ? score : Number(score)
  return (
    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
      Score: {val.toFixed(1)}
    </span>
  )
}
