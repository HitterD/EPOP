/**
 * Lazy-loaded Components for Code Splitting
 * Import these instead of direct imports for better performance
 */

import dynamic from 'next/dynamic'

// Charts (heavy dependency - Recharts)
export const ProjectChartsView = dynamic(
  () => import('@/features/projects/components').then((mod) => ({ default: mod.ProjectChartsView })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Grid View (heavy dependency - TanStack Table)
export const ProjectGridView = dynamic(
  () => import('@/features/projects/components').then((mod) => ({ default: mod.ProjectGridView })),
  {
    loading: () => null,
  }
)

// File Preview (heavy - PDF/image viewers)
export const FilePreviewModal = dynamic(
  () => import('@/features/files/components/file-preview-modal').then((mod) => ({ default: mod.FilePreviewModal })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Search Dialog (only load when needed)
export const GlobalSearchDialog = dynamic(
  () => import('@/features/search/components/global-search-dialog').then((mod) => ({ default: mod.GlobalSearchDialog })),
  {
    loading: () => null,
  }
)

// Audit Trail (admin feature - lazy load)
export const AuditTrailViewer = dynamic(
  () => import('@/features/directory/components').then((mod) => ({ default: mod.AuditTrailViewer })),
  {
    loading: () => null,
  }
)

// Bulk Import Wizard (admin feature - lazy load)
export const BulkImportWizard = dynamic(
  () => import('@/features/admin/components').then((mod) => ({ default: mod.BulkImportWizard })),
  {
    loading: () => null,
  }
)
