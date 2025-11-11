import { z } from 'zod'

export const EmailAddress = z.string().email()
export const EmailList = z.union([EmailAddress, z.array(EmailAddress)]).transform((v) => (Array.isArray(v) ? v : [v]))

export const AttachmentSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  size: z.number().int().nonnegative().optional(),
  mimeType: z.string().min(1).optional(),
  url: z.string().url().optional(),
})

export const MailCreateSchema = z.object({
  to: EmailList,
  cc: z.optional(EmailList).default([]),
  bcc: z.optional(EmailList).default([]),
  subject: z.string().max(255).optional().default(''),
  body: z.union([z.string(), z.object({ html: z.string() })]),
  attachments: z.array(AttachmentSchema).optional().default([]),
  priority: z.enum(['normal', 'important', 'urgent']).optional().default('normal'),
})

export const DraftLockSchema = z.object({
  draftId: z.string().min(1),
  tabId: z.string().min(1),
})

export const DraftSaveSchema = z.object({
  draftId: z.string().min(1),
  tabId: z.string().min(1),
  body: z.string().optional().default(''),
  clientUpdatedAt: z.number().int().nonnegative(),
})

export const ScanStatusSchema = z.object({
  messageId: z.string().min(1),
  results: z.array(
    z.object({ attachmentName: z.string().min(1), status: z.enum(['pending','scanning','clean','threat','failed']), details: z.string().optional() })
  ).min(1),
})
