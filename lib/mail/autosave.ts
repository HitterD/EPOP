export type Draft = {
  to?: string
  cc?: string
  bcc?: string
  subject?: string
  body?: string
  attachments?: Array<{ name: string; url: string; fileId?: string }>
}

const PREFIX = 'mail-draft-'

export function draftKey(id: string): string {
  return `${PREFIX}${id}`
}

export function loadDraft(id: string): Draft | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(draftKey(id))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as Draft
    return parsed
  } catch {
    return undefined
  }
}

export function saveDraft(id: string, data: Draft): void {
  if (typeof window === 'undefined') return
  try {
    const sanitized: Draft = {
      ...(data.to ? { to: data.to } : {}),
      ...(data.cc ? { cc: data.cc } : {}),
      ...(data.bcc ? { bcc: data.bcc } : {}),
      ...(data.subject ? { subject: data.subject } : {}),
      ...(data.body ? { body: data.body } : {}),
      ...(Array.isArray(data.attachments) && data.attachments.length ? { attachments: data.attachments } : {}),
    }
    localStorage.setItem(draftKey(id), JSON.stringify(sanitized))
  } catch {
    // ignore
  }
}

export function clearDraft(id: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(draftKey(id)) } catch {}
}
