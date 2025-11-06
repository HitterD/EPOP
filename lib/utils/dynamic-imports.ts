/**
 * FE-Perf-4: Dynamic imports for heavy modules
 * Reduces initial bundle size and improves LCP
 */

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

import { createElement } from 'react'

/**
 * Loading fallback component
 */
const LoadingFallback = () =>
  createElement(
    'div',
    { className: 'flex items-center justify-center h-full' },
    createElement('div', {
      className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary',
    })
  )

/**
 * Heavy table components - ~50KB
 */
export const DynamicTanStackTable = dynamic(
  () => import('@tanstack/react-table').then(mod => mod as any),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * Rich text editor - ~120KB
 */
export const DynamicTiptapEditor = dynamic(
  () => import('@tiptap/react').then(mod => ({ default: mod.EditorContent })),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * Charts library - ~80KB
 */
export const DynamicRechartsBarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  { loading: () => <LoadingFallback />, ssr: false }
)

export const DynamicRechartsLineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  { loading: () => <LoadingFallback />, ssr: false }
)

export const DynamicRechartsAreaChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.AreaChart })),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * PDF viewer - ~200KB
 */
export const DynamicPDFViewer = dynamic(
  () => import('react-pdf').then(mod => ({ default: mod.Document })),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * Calendar/Date picker - ~40KB
 */
export const DynamicBigCalendar = dynamic(
  () => import('react-big-calendar').then(mod => ({ default: mod.Calendar })),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * Gantt chart (when implemented) - estimated ~100KB
 */
export const DynamicGanttChart = dynamic(
  () => import('@/features/projects/components/gantt-chart').then(mod => ({ default: mod.GanttChart })),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * File preview modal - ~60KB
 */
export const DynamicFilePreviewModal = dynamic(
  () => import('@/features/files/components/file-preview-modal').then(mod => ({ default: mod.FilePreviewModal })),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * Admin pages - ~30KB each
 */
export const DynamicAuditTrailViewer = dynamic(
  () => import('@/features/admin/components/audit-trail-viewer').then(mod => ({ default: mod.AuditTrailViewer })),
  { loading: () => <LoadingFallback />, ssr: false }
)

export const DynamicBulkImportWizard = dynamic(
  () => import('@/features/admin/components/bulk-import-wizard').then(mod => ({ default: mod.BulkImportWizard })),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * Storybook (development only) - ~500KB
 */
export const DynamicStorybookPreview = dynamic(
  () => import('@storybook/react').then(mod => mod as any),
  { loading: () => <LoadingFallback />, ssr: false }
)

/**
 * Helper function to create dynamic import with custom loading
 */
export function createDynamicImport<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType
    ssr?: boolean
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || LoadingFallback,
    ssr: options?.ssr ?? false,
  })
}
