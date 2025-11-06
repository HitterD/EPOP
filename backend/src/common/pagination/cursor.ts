import { Buffer } from 'node:buffer'

export interface CursorPayload {
  id?: string
  off?: number
}

export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload)
  return Buffer.from(json, 'utf8').toString('base64url')
}

export function decodeCursor(cursor?: string | null): CursorPayload | null {
  if (!cursor) return null
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8')
    const obj = JSON.parse(json)
    const out: CursorPayload = {}
    if (obj && typeof obj.id === 'string') out.id = obj.id
    if (obj && typeof obj.off === 'number' && isFinite(obj.off)) out.off = obj.off
    return (out.id || typeof out.off === 'number') ? out : null
  } catch {
    return null
  }
}
