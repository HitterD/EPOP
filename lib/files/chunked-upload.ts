/**
 * Chunked Resumable Upload
 * 
 * Handles large file uploads with:
 * - Chunk size: 8-16MB
 * - Parallel uploads: 3 chunks max
 * - Resume on network error
 * - Per-chunk progress tracking
 */

import { RetryManager } from '@/styles/states';

export interface UploadChunk {
  index: number;
  start: number;
  end: number;
  blob: Blob;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  uploadedBytes: number;
  retries: number;
  error?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  completedChunks: number;
  uploadedBytes: number;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed';
  chunks: UploadChunk[];
}

const DEFAULT_CHUNK_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_PARALLEL_UPLOADS = 3;
const MAX_RETRIES = 3;

export class ChunkedUpload {
  private file: File;
  private fileId: string;
  private chunkSize: number;
  private maxParallel: number;
  private chunks: UploadChunk[] = [];
  private uploadingChunks: Set<number> = new Set();
  private completedChunks: Set<number> = new Set();
  private retryManagers: Map<number, RetryManager> = new Map();
  private abortControllers: Map<number, AbortController> = new Map();
  private progressCallbacks: Set<(progress: UploadProgress) => void> = new Set();
  private status: UploadProgress['status'] = 'pending';

  constructor(
    file: File,
    options: {
      fileId?: string;
      chunkSize?: number;
      maxParallel?: number;
    } = {}
  ) {
    this.file = file;
    this.fileId = options.fileId || this.generateFileId();
    this.chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
    this.maxParallel = options.maxParallel || MAX_PARALLEL_UPLOADS;
    this.initializeChunks();
  }

  /**
   * Initialize chunks
   */
  private initializeChunks(): void {
    const totalChunks = Math.ceil(this.file.size / this.chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const blob = this.file.slice(start, end);

      this.chunks.push({
        index: i,
        start,
        end,
        blob,
        status: 'pending',
        progress: 0,
        uploadedBytes: 0,
        retries: 0,
      });
    }
  }

  /**
   * Start upload
   */
  async start(
    uploadFn: (chunk: Blob, index: number, signal: AbortSignal) => Promise<void>
  ): Promise<void> {
    this.status = 'uploading';
    this.notifyProgress();

    // Upload chunks in parallel (up to maxParallel)
    const uploadPromises: Promise<void>[] = [];

    for (let i = 0; i < this.chunks.length; i++) {
      // Wait if too many parallel uploads
      while (this.uploadingChunks.size >= this.maxParallel) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (this.status === 'paused') {
        break;
      }

      const chunk = this.chunks[i];
      if (chunk.status === 'completed') {
        continue;
      }

      uploadPromises.push(this.uploadChunk(chunk, uploadFn));
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    this.status = 'completed';
    this.notifyProgress();
  }

  /**
   * Upload a single chunk
   */
  private async uploadChunk(
    chunk: UploadChunk,
    uploadFn: (chunk: Blob, index: number, signal: AbortSignal) => Promise<void>
  ): Promise<void> {
    this.uploadingChunks.add(chunk.index);
    chunk.status = 'uploading';
    this.notifyProgress();

    // Create abort controller
    const abortController = new AbortController();
    this.abortControllers.set(chunk.index, abortController);

    // Get or create retry manager
    if (!this.retryManagers.has(chunk.index)) {
      this.retryManagers.set(chunk.index, new RetryManager({ maxAttempts: MAX_RETRIES }));
    }
    const retryManager = this.retryManagers.get(chunk.index)!;

    try {
      await uploadFn(chunk.blob, chunk.index, abortController.signal);
      
      chunk.status = 'completed';
      chunk.progress = 100;
      chunk.uploadedBytes = chunk.blob.size;
      this.completedChunks.add(chunk.index);
      retryManager.reset();
    } catch (error) {
      if (error.name === 'AbortError') {
        chunk.status = 'pending';
      } else if (retryManager.canRetry()) {
        // Retry with backoff
        chunk.retries++;
        retryManager.recordAttempt();
        const delay = retryManager.getDelay();
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.uploadChunk(chunk, uploadFn);
      } else {
        chunk.status = 'failed';
        chunk.error = error.message;
        this.status = 'failed';
      }
    } finally {
      this.uploadingChunks.delete(chunk.index);
      this.abortControllers.delete(chunk.index);
      this.notifyProgress();
    }
  }

  /**
   * Pause upload
   */
  pause(): void {
    this.status = 'paused';
    
    // Abort all ongoing uploads
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
    this.uploadingChunks.clear();
    
    // Reset uploading chunks to pending
    this.chunks.forEach((chunk) => {
      if (chunk.status === 'uploading') {
        chunk.status = 'pending';
      }
    });

    this.notifyProgress();
  }

  /**
   * Resume upload
   */
  async resume(
    uploadFn: (chunk: Blob, index: number, signal: AbortSignal) => Promise<void>
  ): Promise<void> {
    if (this.status !== 'paused') return;
    await this.start(uploadFn);
  }

  /**
   * Cancel upload
   */
  cancel(): void {
    this.pause();
    this.status = 'failed';
    this.notifyProgress();
  }

  /**
   * Get upload progress
   */
  getProgress(): UploadProgress {
    const uploadedBytes = this.chunks.reduce(
      (sum, chunk) => sum + chunk.uploadedBytes,
      0
    );

    return {
      fileId: this.fileId,
      fileName: this.file.name,
      fileSize: this.file.size,
      totalChunks: this.chunks.length,
      completedChunks: this.completedChunks.size,
      uploadedBytes,
      progress: Math.round((uploadedBytes / this.file.size) * 100),
      status: this.status,
      chunks: [...this.chunks],
    };
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (progress: UploadProgress) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  /**
   * Notify progress listeners
   */
  private notifyProgress(): void {
    const progress = this.getProgress();
    this.progressCallbacks.forEach((callback) => callback(progress));
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * React hook for chunked upload
 */
export function useChunkedUpload(
  file: File | null,
  uploadFn: (chunk: Blob, index: number, signal: AbortSignal) => Promise<void>
) {
  const [progress, setProgress] = React.useState<UploadProgress | null>(null);
  const uploadRef = React.useRef<ChunkedUpload | null>(null);

  React.useEffect(() => {
    if (!file) {
      uploadRef.current = null;
      setProgress(null);
      return;
    }

    const upload = new ChunkedUpload(file);
    uploadRef.current = upload;

    const unsubscribe = upload.onProgress(setProgress);

    return () => {
      unsubscribe();
      upload.cancel();
    };
  }, [file]);

  const start = React.useCallback(async () => {
    if (uploadRef.current) {
      await uploadRef.current.start(uploadFn);
    }
  }, [uploadFn]);

  const pause = React.useCallback(() => {
    uploadRef.current?.pause();
  }, []);

  const resume = React.useCallback(async () => {
    if (uploadRef.current) {
      await uploadRef.current.resume(uploadFn);
    }
  }, [uploadFn]);

  const cancel = React.useCallback(() => {
    uploadRef.current?.cancel();
  }, []);

  return {
    progress,
    start,
    pause,
    resume,
    cancel,
    isUploading: progress?.status === 'uploading',
    isPaused: progress?.status === 'paused',
    isCompleted: progress?.status === 'completed',
    isFailed: progress?.status === 'failed',
  };
}

// React import
import React from 'react';
