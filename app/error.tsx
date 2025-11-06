'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useTraceStore } from '@/lib/stores/trace-store'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const lastRequestId = useTraceStore((s) => s.lastRequestId)

  useEffect(() => {
    // Log the error to an error reporting service if desired
    // console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          {lastRequestId && (
            <p className="text-sm text-muted-foreground">
              Trace ID: <span className="font-mono">{lastRequestId}</span>
            </p>
          )}
          {error?.digest && (
            <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>Go Home</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
