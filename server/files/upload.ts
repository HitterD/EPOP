/**
 * In-memory upload session manager for chunked uploads
 */

export interface UploadSession {
  uploadId: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  chunkSize: number; // bytes
  chunksReceived: Set<number>;
  createdAt: number;
}

class UploadSessionStore {
  private sessions = new Map<string, UploadSession>();

  create(opts: { uploadId: string; chunkSize: number; fileName?: string; fileSize?: number; mimeType?: string }): UploadSession {
    const session: UploadSession = {
      uploadId: opts.uploadId,
      fileName: opts.fileName,
      fileSize: opts.fileSize,
      mimeType: opts.mimeType,
      chunkSize: opts.chunkSize,
      chunksReceived: new Set<number>(),
      createdAt: Date.now(),
    };
    this.sessions.set(opts.uploadId, session);
    return session;
  }

  get(uploadId: string): UploadSession | undefined {
    return this.sessions.get(uploadId);
  }

  markChunk(uploadId: string, index: number): void {
    const s = this.get(uploadId);
    if (!s) throw new Error('Upload session not found');
    s.chunksReceived.add(index);
  }

  complete(uploadId: string): UploadSession | undefined {
    return this.sessions.get(uploadId);
  }

  delete(uploadId: string): void {
    this.sessions.delete(uploadId);
  }
}

export const uploadSessions = new UploadSessionStore();
