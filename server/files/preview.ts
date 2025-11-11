/**
 * Preview streaming (stub) for range requests.
 * We do not persist real file bytes in this demo; instead we generate
 * deterministic pseudo-bytes based on sha256 so range responses work.
 */

export interface PreviewSource {
  size: number;
  getRange(start: number, end: number): Uint8Array; // inclusive range
}

function pseudoRandomByte(seed: number, idx: number): number {
  // Simple LCG-like generator for deterministic bytes
  let x = (seed ^ (idx + 2654435761)) >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return x & 0xff;
}

export function getPreviewSource(sha256: string, targetSize = 1024 * 1024): PreviewSource {
  // Use first 8 hex chars as seed
  const seed = parseInt(sha256.slice(0, 8), 16) || 0x12345678;
  const size = targetSize; // 1MB synthetic preview

  return {
    size,
    getRange(start: number, end: number) {
      const s = Math.max(0, start);
      const e = Math.min(size - 1, end);
      const len = e >= s ? e - s + 1 : 0;
      const out = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        out[i] = pseudoRandomByte(seed, s + i);
      }
      return out;
    },
  };
}
