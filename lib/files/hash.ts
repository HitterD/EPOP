/**
 * File Hash Utilities
 * 
 * SHA256 content addressing for deduplication
 */

/**
 * Calculate SHA256 hash of a file
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Calculate hash of a blob/chunk
 */
export async function calculateBlobHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Truncate hash for display
 */
export function truncateHash(hash: string, length: number = 8): string {
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

/**
 * React hook for file hash calculation
 */
export function useFileHash(file: File | null) {
  const [hash, setHash] = React.useState<string | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!file) {
      setHash(null);
      return;
    }

    let cancelled = false;

    async function calculate() {
      setIsCalculating(true);
      setError(null);
      
      try {
        const result = await calculateFileHash(file);
        if (!cancelled) {
          setHash(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsCalculating(false);
        }
      }
    }

    calculate();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return {
    hash,
    isCalculating,
    error,
    truncated: hash ? truncateHash(hash) : null,
  };
}

// React import
import React from 'react';
