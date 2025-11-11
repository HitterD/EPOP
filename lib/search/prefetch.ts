/**
 * Search Result Prefetch
 * 
 * Prefetches search result details on hover with debounce and AbortController.
 */

import { timeouts } from '@/styles/tokens';

interface PrefetchCache {
  [resultId: string]: {
    data: any;
    timestamp: number;
  };
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class PrefetchManager {
  private cache: PrefetchCache = {};
  private pendingRequests: Map<string, AbortController> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Prefetch result detail
   */
  async prefetch(
    resultId: string,
    fetcher: (signal: AbortSignal) => Promise<any>,
    options: {
      debounce?: number;
      force?: boolean;
    } = {}
  ): Promise<void> {
    const { debounce = timeouts.debounce, force = false } = options;

    // Check cache first
    if (!force && this.isCached(resultId)) {
      return;
    }

    // Cancel existing debounce timer
    const existingTimer = this.debounceTimers.get(resultId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Debounce the prefetch
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(resultId);

      // Cancel existing request for this result
      this.cancelPrefetch(resultId);

      // Create new AbortController
      const abortController = new AbortController();
      this.pendingRequests.set(resultId, abortController);

      try {
        const data = await fetcher(abortController.signal);
        
        // Cache the result
        this.cache[resultId] = {
          data,
          timestamp: Date.now(),
        };

        this.pendingRequests.delete(resultId);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Prefetch failed:', error);
        }
        this.pendingRequests.delete(resultId);
      }
    }, debounce);

    this.debounceTimers.set(resultId, timer);
  }

  /**
   * Get cached result
   */
  getCached(resultId: string): any | null {
    const cached = this.cache[resultId];
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      delete this.cache[resultId];
      return null;
    }

    return cached.data;
  }

  /**
   * Check if result is cached
   */
  isCached(resultId: string): boolean {
    return this.getCached(resultId) !== null;
  }

  /**
   * Cancel prefetch for a specific result
   */
  cancelPrefetch(resultId: string): void {
    // Cancel debounce timer
    const timer = this.debounceTimers.get(resultId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(resultId);
    }

    // Abort pending request
    const controller = this.pendingRequests.get(resultId);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(resultId);
    }
  }

  /**
   * Cancel all pending prefetches
   */
  cancelAll(): void {
    // Cancel all timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Abort all requests
    this.pendingRequests.forEach((controller) => controller.abort());
    this.pendingRequests.clear();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach((resultId) => {
      const cached = this.cache[resultId];
      if (now - cached.timestamp > CACHE_TTL) {
        delete this.cache[resultId];
      }
    });
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }

  /**
   * Get pending request count
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Singleton instance
let prefetchManagerInstance: PrefetchManager | null = null;

/**
 * Get the global prefetch manager
 */
export function getPrefetchManager(): PrefetchManager {
  if (!prefetchManagerInstance) {
    prefetchManagerInstance = new PrefetchManager();
  }
  return prefetchManagerInstance;
}

/**
 * React hook for prefetching
 */
export function usePrefetch() {
  const managerRef = React.useRef(getPrefetchManager());

  const prefetch = React.useCallback(
    (resultId: string, fetcher: (signal: AbortSignal) => Promise<any>) => {
      managerRef.current.prefetch(resultId, fetcher);
    },
    []
  );

  const getCached = React.useCallback((resultId: string) => {
    return managerRef.current.getCached(resultId);
  }, []);

  const cancelPrefetch = React.useCallback((resultId: string) => {
    managerRef.current.cancelPrefetch(resultId);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      managerRef.current.cancelAll();
    };
  }, []);

  return {
    prefetch,
    getCached,
    cancelPrefetch,
  };
}

/**
 * React hook for prefetch on hover
 */
export function usePrefetchOnHover(
  resultId: string,
  fetcher: (signal: AbortSignal) => Promise<any>,
  enabled = true
) {
  const { prefetch, cancelPrefetch, getCached } = usePrefetch();
  const [isPrefetching, setIsPrefetching] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    if (!enabled) return;
    setIsPrefetching(true);
    prefetch(resultId, fetcher);
  }, [enabled, resultId, fetcher, prefetch]);

  const handleMouseLeave = React.useCallback(() => {
    setIsPrefetching(false);
  }, []);

  const cached = getCached(resultId);

  return {
    handleMouseEnter,
    handleMouseLeave,
    isPrefetching,
    isCached: cached !== null,
    cachedData: cached,
  };
}

// React import
import React from 'react';
