/**
 * Standardized State Taxonomy for All Modules
 * 
 * Five-state model: idle | loading | optimistic | success | error
 * 
 * Usage:
 * - idle: Initial/rest state, no action taken
 * - loading: Async operation in progress (show spinner)
 * - optimistic: UI updated before server confirms (instant feedback)
 * - success: Operation completed successfully (transient state)
 * - error: Operation failed (show error message)
 */

export type AsyncState = 'idle' | 'loading' | 'optimistic' | 'success' | 'error';

export interface AsyncOperation<T = unknown, E = Error> {
  state: AsyncState;
  data?: T;
  error?: E;
  timestamp?: number;
}

// State transition helpers
export const stateTransitions = {
  canTransitionTo(from: AsyncState, to: AsyncState): boolean {
    const validTransitions: Record<AsyncState, AsyncState[]> = {
      idle: ['loading', 'optimistic'],
      loading: ['success', 'error', 'idle'],
      optimistic: ['success', 'error'],
      success: ['idle', 'loading'],
      error: ['idle', 'loading'],
    };
    return validTransitions[from]?.includes(to) ?? false;
  },

  isTerminal(state: AsyncState): boolean {
    return state === 'success' || state === 'error';
  },

  isInProgress(state: AsyncState): boolean {
    return state === 'loading' || state === 'optimistic';
  },

  shouldShowSpinner(state: AsyncState): boolean {
    return state === 'loading';
  },

  shouldShowOptimistic(state: AsyncState): boolean {
    return state === 'optimistic' || state === 'success';
  },
};

// State factory functions
export function createIdleState<T = unknown>(): AsyncOperation<T> {
  return { state: 'idle' };
}

export function createLoadingState<T = unknown>(data?: T): AsyncOperation<T> {
  return { state: 'loading', data, timestamp: Date.now() };
}

export function createOptimisticState<T = unknown>(data: T): AsyncOperation<T> {
  return { state: 'optimistic', data, timestamp: Date.now() };
}

export function createSuccessState<T = unknown>(data: T): AsyncOperation<T> {
  return { state: 'success', data, timestamp: Date.now() };
}

export function createErrorState<E = Error>(error: E): AsyncOperation<unknown, E> {
  return { state: 'error', error, timestamp: Date.now() };
}

// Retry logic with exponential backoff
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
  jitter: number;
}

export class RetryManager {
  private attempts = 0;
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 3,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 10000,
      multiplier: config.multiplier ?? 2,
      jitter: config.jitter ?? 0.1,
    };
  }

  canRetry(): boolean {
    return this.attempts < this.config.maxAttempts;
  }

  getDelay(): number {
    if (this.attempts === 0) {
      return this.config.initialDelay;
    }

    const exponentialDelay = this.config.initialDelay * Math.pow(this.config.multiplier, this.attempts);
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitterRange = cappedDelay * this.config.jitter;
    const jitter = (Math.random() - 0.5) * jitterRange;
    
    return Math.max(0, cappedDelay + jitter);
  }

  recordAttempt(): void {
    this.attempts++;
  }

  reset(): void {
    this.attempts = 0;
  }

  getAttempts(): number {
    return this.attempts;
  }
}

// Hook for managing async state
export function useAsyncState<T = unknown, E = Error>(
  initialState: AsyncState = 'idle'
) {
  const [operation, setOperation] = React.useState<AsyncOperation<T, E>>({
    state: initialState,
  });

  const setIdle = React.useCallback(() => {
    setOperation(createIdleState<T>());
  }, []);

  const setLoading = React.useCallback((data?: T) => {
    setOperation(createLoadingState<T>(data));
  }, []);

  const setOptimistic = React.useCallback((data: T) => {
    setOperation(createOptimisticState<T>(data));
  }, []);

  const setSuccess = React.useCallback((data: T) => {
    setOperation(createSuccessState<T>(data));
  }, []);

  const setError = React.useCallback((error: E) => {
    setOperation(createErrorState<E>(error));
  }, []);

  return {
    ...operation,
    setIdle,
    setLoading,
    setOptimistic,
    setSuccess,
    setError,
    isIdle: operation.state === 'idle',
    isLoading: operation.state === 'loading',
    isOptimistic: operation.state === 'optimistic',
    isSuccess: operation.state === 'success',
    isError: operation.state === 'error',
    isInProgress: stateTransitions.isInProgress(operation.state),
    isTerminal: stateTransitions.isTerminal(operation.state),
  };
}

// React import for hook
import React from 'react';
