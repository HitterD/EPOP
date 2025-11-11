/**
 * Content-addressed storage (in-memory index)
 * Maps sha256 -> file metadata & path
 */

export interface StoredFileMeta {
  sha256: string;
  path: string; // e.g., /files/sha256/ab/abcdef...
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: number;
  duplicateCount: number;
}

class ContentAddressedStore {
  private byHash = new Map<string, StoredFileMeta>();

  ensure(sha256: string, opts: { fileName?: string; fileSize?: number; mimeType?: string }): StoredFileMeta {
    const existing = this.byHash.get(sha256);
    if (existing) {
      existing.duplicateCount += 1;
      return existing;
    }
    const path = this.hashToPath(sha256);
    const meta: StoredFileMeta = {
      sha256,
      path,
      fileName: opts.fileName,
      fileSize: opts.fileSize,
      mimeType: opts.mimeType,
      createdAt: Date.now(),
      duplicateCount: 0,
    };
    this.byHash.set(sha256, meta);
    return meta;
  }

  get(sha256: string): StoredFileMeta | undefined {
    return this.byHash.get(sha256);
  }

  private hashToPath(sha256: string): string {
    const prefix = sha256.slice(0, 2);
    return `/files/sha256/${prefix}/${sha256}`;
    // Real implementation would move object to that path in object storage
  }
}

export const contentStore = new ContentAddressedStore();
