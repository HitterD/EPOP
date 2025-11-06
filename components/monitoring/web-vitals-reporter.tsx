'use client'

/**
 * FE-Obs-1: Web Vitals Reporter Component
 * Initializes Web Vitals reporting on client side
 */

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/monitoring/web-vitals'

export function WebVitalsReporter() {
  useEffect(() => {
    // Initialize Web Vitals reporting
    reportWebVitals()

    if (process.env.NODE_ENV === 'development') {
      console.log('[WebVitals] Reporting initialized')
    }
  }, [])

  // This component doesn't render anything
  return null
}
