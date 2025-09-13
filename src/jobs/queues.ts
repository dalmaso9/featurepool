import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { env } from '@/lib/env'
import { recomputeFeatureScore } from '@/lib/scoring'

const url = env.REDIS_URL ?? 'redis://localhost:6379'
const isTLS = url.startsWith('rediss://')


const connection = new IORedis(url, {
  // BullMQ exige isso para não bloquear requisições internas:
  maxRetriesPerRequest: null,
  // Evita o "ready check" (útil em cloud e dev):
  enableReadyCheck: false,
  // Se o Railway te der rediss://, ativa TLS:
  ...(isTLS ? { tls: {} } : {}),
})

export const scoreQueue = new Queue('recompute-score', { connection })

export function startWorkers() {
  const worker = new Worker(
    'recompute-score',
    async (job) => {
      const featureId = job.data.featureId as string
      await recomputeFeatureScore(featureId)
    },
    { connection }
  )

   // 👇 Fechamento gracioso
  const shutdown = async (signal: string) => {
    console.log(`[worker] ${signal} recebido. Encerrando com graça...`)
    try {
      await worker.close()        // espera terminar o job atual
      await scoreQueue.close()    // fecha a fila (não aceita mais cmds)
      await connection.quit()     // encerra a conexão Redis de forma limpa
    } catch (err) {
      console.error('[worker] erro ao encerrar:', err)
    } finally {
      process.exit(0)
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}