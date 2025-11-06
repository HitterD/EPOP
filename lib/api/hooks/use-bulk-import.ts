import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { BulkImportResult, BulkImportPreview, BulkImportMapping } from '@/types'

/**
 * Hook for dry-run validation
 */
export function useBulkImportDryRun() {
  return useMutation<BulkImportPreview, Error, { file: File; mapping?: BulkImportMapping }>({
    mutationFn: async ({ file, mapping }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (mapping) {
        formData.append('mapping', JSON.stringify(mapping))
      }
      formData.append('dryRun', 'true')

      const response = await apiClient.post<BulkImportPreview>(
        '/admin/users/bulk-import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data!
    },
  })
}

/**
 * Hook for actual import
 */
export function useBulkImport() {
  return useMutation<BulkImportResult, Error, { file: File; mapping?: BulkImportMapping; skipInvalid?: boolean }>({
    mutationFn: async ({ file, mapping, skipInvalid = false }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (mapping) {
        formData.append('mapping', JSON.stringify(mapping))
      }
      if (skipInvalid) {
        formData.append('skipInvalid', 'true')
      }

      const response = await apiClient.post<BulkImportResult>(
        '/admin/users/bulk-import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data!
    },
  })
}

/**
 * Generate CSV template for download
 */
export function generateBulkImportTemplate() {
  const headers = ['email', 'firstName', 'lastName', 'title', 'department', 'extension', 'unitPath']
  const example = [
    'john.doe@company.com',
    'John',
    'Doe',
    'Senior Engineer',
    'Engineering',
    '1234',
    '/Engineering/Backend Team',
  ]

  const csvContent = [
    headers.join(','),
    example.join(','),
    '# Add more rows below (remove this comment line)',
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'bulk-import-template.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export errors to CSV
 */
export function exportErrorsToCSV(errors: Array<{ row: number; field?: string; message: string }>) {
  const headers = ['Row', 'Field', 'Error']
  const rows = errors.map((error) => [
    error.row.toString(),
    error.field || 'N/A',
    `"${error.message.replace(/"/g, '""')}"`,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `import-errors-${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
