import { z } from 'zod'

export const featureSchema = z.object({
  workspaceId: z.string().cuid(),
  title: z.string().min(3).max(120),
  description: z.string().min(5).max(5000),
  impact: z.number().min(1).max(5).optional(),
  effort: z.number().min(1).max(5).optional()
})

export const commentSchema = z.object({
  featureId: z.string().cuid(),
  content: z.string().min(1).max(2000)
})
