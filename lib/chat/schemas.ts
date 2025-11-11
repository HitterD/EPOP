import { z } from 'zod'

export const CreateMessageSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1),
  deliveryPriority: z.enum(['normal', 'important', 'urgent']).default('normal'),
  threadId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

export type CreateMessageDTO = z.infer<typeof CreateMessageSchema>

export const AddReactionSchema = z.object({
  emoji: z.string().min(1),
})
export type AddReactionDTO = z.infer<typeof AddReactionSchema>

export const MarkReadSchema = z.object({
  // no body content needed, kept for forward-compat
})
export type MarkReadDTO = z.infer<typeof MarkReadSchema>

export const CreateThreadMessageSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1),
})
export type CreateThreadMessageDTO = z.infer<typeof CreateThreadMessageSchema>

export const CursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
})
export type CursorQuery = z.infer<typeof CursorQuerySchema>
