import { z } from 'zod';

// Common
export const CursorQuerySchema = z.object({
  cursor: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

// Presence
export const PresenceHeartbeatSchema = z.object({
  status: z.enum(['online', 'away', 'offline']).default('online'),
});

// Outbox
export const OutboxEnqueueSchema = z.object({
  id: z.string().min(1),
  chatId: z.string().min(1),
  content: z.string().min(1).max(10000),
});

export const OutboxDequeueSchema = z.object({
  id: z.string().min(1),
});

// Files init
export const InitUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  chunkSize: z.number().int().min(8 * 1024 * 1024).max(16 * 1024 * 1024).optional(),
});

// Files chunk
export const ChunkQuerySchema = z.object({
  uploadId: z.string().min(1),
  index: z.coerce.number().int().min(0),
});

// Files complete
export const CompleteUploadSchema = z.object({
  uploadId: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i),
  totalChunks: z.number().int().min(1),
});

// Chat read batch
export const ReadBatchSchema = z.object({
  messageIds: z.array(z.string().min(1)).min(1),
});
