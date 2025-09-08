'use client'

import { useTransition, useState } from 'react'
import { voteFeature } from '@/actions/features'

export default function VoteButton({ featureId, initialVoted, initialCount }:
  { featureId: string, initialVoted: boolean, initialCount: number }) {
  const [pending, start] = useTransition()
  const [voted, setVoted] = useState(initialVoted)
  const [count, setCount] = useState(initialCount)

  const onVote = () => {
    setVoted(true); setCount(c => c + 1)
    start(async () => {
      try {
        await voteFeature(featureId)
      } catch (e) {
        // rollback
        setVoted(false); setCount(c => c - 1)
        console.error(e)
      }
    })
  }

  return (
    <button
      onClick={onVote}
      disabled={pending || voted}
      className={`rounded-md border px-3 py-1 text-sm ${voted ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'}`}
      aria-pressed={voted}
    >
      {voted ? `Votado (${count})` : `Votar (${count})`}
    </button>
  )
}
