import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { env } from '@/lib/env'
import { recomputeFeatureScore } from '@/lib/scoring'

const connection = new IORedis(env.REDIS_URL || 'redis://localhost:6379', {
  // BullMQ exige isso para não bloquear requisições internas:
  maxRetriesPerRequest: null,
  // Evita o "ready check" (útil em cloud e dev):
  enableReadyCheck: false,
})

export const scoreQueue = new Queue('recompute-score', { connection })

export function startWorkers() {
  new Worker(
    'recompute-score',
    async (job) => {
      const featureId = job.data.featureId as string
      await recomputeFeatureScore(featureId)
    },
    { connection }
  )
}