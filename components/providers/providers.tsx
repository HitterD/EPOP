'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Devtools loaded dynamically only in development
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'
import { useTraceStore } from '@/lib/stores/trace-store'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const ServiceWorkerProvider = dynamic(
  () => import('./service-worker-provider').then((m) => m.ServiceWorkerProvider),
  { ssr: false }
)
const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), { ssr: false })
const ReactQueryDevtoolsDynamic = dynamic(
  () => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
  { ssr: false }
)
const WebVitalsReporter = dynamic(
  () => import('@/components/monitoring/web-vitals-reporter').then((m) => m.WebVitalsReporter),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default: medium-freshness data (chat messages, notifications)
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  const lastRequestId = useTraceStore((s) => s.lastRequestId)

  const pathname = usePathname()
  const isAuth = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {/* FE-Obs-1: Web Vitals monitoring */}
        <WebVitalsReporter />
        
        {isAuth ? (
          <>{children}</>
        ) : (
          <ServiceWorkerProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
            {process.env.NODE_ENV !== 'production' && lastRequestId && (
              <div className="pointer-events-auto fixed bottom-2 right-2 z-50 rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground shadow">
                Trace ID: <span className="font-mono">{lastRequestId}</span>
              </div>
            )}
          </ServiceWorkerProvider>
        )}
      </ThemeProvider>
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtoolsDynamic initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
