'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { apiClient } from '@/lib/api/client'

interface Props {
  children: ReactNode
  fallback?: (error: Error, errorInfo: ErrorInfo, traceId: string) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  traceId: string | null
}

/**
 * Error Boundary component with error reporting and trace ID
 * Catches React errors and reports them to the backend
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      traceId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const traceId = this.generateTraceId()

    this.setState({
      error,
      errorInfo,
      traceId,
    })

    // Log error to backend
    this.logErrorToBackend(error, errorInfo, traceId)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
      console.error('TraceId:', traceId)
    }
  }

  private generateTraceId(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substring(2, 15)
    return `err-${timestamp}-${randomPart}`
  }

  private async logErrorToBackend(error: Error, errorInfo: ErrorInfo, traceId: string) {
    try {
      await apiClient.post('/errors/report', {
        traceId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      // Failed to log error, but don't throw to avoid infinite loop
      console.error('Failed to log error to backend:', err)
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      traceId: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.state.traceId || 'unknown'
        )
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
                <p className="text-sm text-gray-500">
                  Trace ID: <code className="text-xs">{this.state.traceId}</code>
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-md bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">Error:</p>
              <p className="mt-1 text-sm text-gray-600">{this.state.error.message}</p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error.stack && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Stack trace
                </summary>
                <pre className="mt-2 overflow-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based error boundary for use in function components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
