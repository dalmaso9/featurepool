import { S3Client } from '@aws-sdk/client-s3'
import { env } from './env'

export const s3 = new S3Client({
  region: env.S3_REGION || 'us-east-1',
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: !!env.S3_ENDPOINT && env.S3_ENDPOINT.includes('digitaloceanspaces'),
  credentials: env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY
  } : undefined
})
