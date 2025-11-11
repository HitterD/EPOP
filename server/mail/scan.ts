/**
 * In-memory virus scan status store per message
 */

export type ScanState = 'pending' | 'scanning' | 'clean' | 'threat' | 'failed'

export interface AttachmentScan {
  attachmentName: string
  status: ScanState
  details?: string
}

class ScanStore {
  private byMessage = new Map<string, AttachmentScan[]>()

  set(messageId: string, results: AttachmentScan[]) {
    this.byMessage.set(messageId, results)
  }

  get(messageId: string): AttachmentScan[] {
    return this.byMessage.get(messageId) || []
  }
}

export const scanStore = new ScanStore()
