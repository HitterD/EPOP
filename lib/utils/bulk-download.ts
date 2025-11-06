/**
 * Bulk File Download Utility
 * Wave-2: Files bulk download with ZIP generation
 * 
 * NOTE: Requires 'jszip' package to be installed:
 * npm install jszip
 * npm install --save-dev @types/jszip
 */

interface FileDownloadItem {
  id: string
  name: string
  url: string
  size: number
}

interface BulkDownloadOptions {
  zipFilename?: string
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
}

/**
 * Download multiple files as a ZIP archive
 * 
 * @param files - Array of files to download
 * @param options - Download options
 */
export async function bulkDownloadAsZip(
  files: FileDownloadItem[],
  options: BulkDownloadOptions = {}
): Promise<void> {
  const {
    zipFilename = `files-${new Date().toISOString().split('T')[0]}.zip`,
    onProgress,
    onError,
  } = options

  try {
    // Dynamic import to avoid loading JSZip if not needed
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()
    const totalFiles = files.length
    let completedFiles = 0

    // Download and add each file to the ZIP
    for (const file of files) {
      try {
        // Fetch file content
        const response = await fetch(file.url)
        
        if (!response.ok) {
          throw new Error(`Failed to download ${file.name}: ${response.statusText}`)
        }

        // Get file as blob
        const blob = await response.blob()
        
        // Add to ZIP with original filename
        zip.file(file.name, blob)

        // Update progress
        completedFiles++
        if (onProgress) {
          const progress = Math.round((completedFiles / totalFiles) * 100)
          onProgress(progress)
        }
      } catch (error) {
        console.error(`Error downloading file ${file.name}:`, error)
        // Continue with other files
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    })

    // Trigger download
    downloadBlob(zipBlob, zipFilename)

  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error')
    if (onError) {
      onError(err)
    } else {
      throw err
    }
  }
}

/**
 * Download a single file
 * 
 * @param file - File to download
 */
export async function downloadSingleFile(file: FileDownloadItem): Promise<void> {
  try {
    const response = await fetch(file.url)
    
    if (!response.ok) {
      throw new Error(`Failed to download ${file.name}: ${response.statusText}`)
    }

    const blob = await response.blob()
    downloadBlob(blob, file.name)
  } catch (error) {
    console.error(`Error downloading file ${file.name}:`, error)
    throw error
  }
}

/**
 * Trigger browser download for a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Format file size for display
 */
export function formatBulkDownloadSize(totalBytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = totalBytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Estimate ZIP file size (rough estimate: 60% of original size with compression)
 */
export function estimateZipSize(files: FileDownloadItem[]): number {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  return Math.round(totalSize * 0.6) // Assume ~40% compression
}
