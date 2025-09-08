import { NextRequest, NextResponse } from 'next/server'
import { s3 } from '@/lib/s3'
import { env } from '@/lib/env'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  if (!env.S3_BUCKET) return NextResponse.json({ error: 'S3 not configured' }, { status: 400 })
  const { filename, contentType } = await req.json()

  const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${filename}`

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  })
  const url = await getSignedUrl(s3, command, { expiresIn: 60 })
  const publicUrl = `${env.S3_ENDPOINT?.replace('https://', 'https://')}/${env.S3_BUCKET}/${key}`

  return NextResponse.json({ url, key, publicUrl })
}
