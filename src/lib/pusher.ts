import PusherServer from 'pusher'
import PusherClient from 'pusher-js'
import { env } from './env'

export const pusherServer = env.PUSHER_KEY && env.PUSHER_SECRET && env.PUSHER_APP_ID
  ? new PusherServer({
      appId: env.PUSHER_APP_ID!,
      key: env.PUSHER_KEY!,
      secret: env.PUSHER_SECRET!,
      cluster: env.PUSHER_CLUSTER || 'eu',
      useTLS: true
    })
  : null

export const getPusherClient = () => {
  if (!env.PUSHER_KEY) return null
  const p = new PusherClient(env.PUSHER_KEY, {
    cluster: env.PUSHER_CLUSTER || 'eu',
    forceTLS: true
  })
  return p
}

export const workspaceChannel = (workspaceId: string) => `workspace-${workspaceId}`
