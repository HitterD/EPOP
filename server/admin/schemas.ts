import { z } from 'zod'

export const ImportActionSchema = z.enum(['dry-run', 'commit', 'undo'])

export const ImportRowSchema = z.record(z.string(), z.unknown())

export const ImportRequestSchema = z.object({
  action: ImportActionSchema,
  mapping: z.record(z.string(), z.string()).optional(),
  rows: z.array(ImportRowSchema).optional(),
  skipInvalid: z.boolean().optional().default(true),
})

export type ImportAction = z.infer<typeof ImportActionSchema>
