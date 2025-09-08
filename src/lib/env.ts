import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AZURE_AD_CLIENT_ID: z.string().optional(),
  AZURE_AD_CLIENT_SECRET: z.string().optional(),
  AZURE_AD_TENANT_ID: z.string().optional(),

  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),

  REDIS_URL: z.string().optional(),

  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENV: z.string().optional(),
})

export const env = envSchema.parse(process.env)
