'use client'

import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Search,
  Grid3x3,
  List,
  File,
  Image,
  FileText,
  Download,
  MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes, formatDate } from '@/lib/utils'
import { useFiles, usePresignedUploadFlow } from '@/lib/api/hooks/use-files'
import { toast } from 'sonner'
import { useVirtualizer } from '@tanstack/react-virtual'

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useFiles()
  const uploadFlow = usePresignedUploadFlow()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const fileItems = useMemo(() => (data?.pages || []).flatMap((p: any) => p.items || []), [data])
  const files = useMemo(
    () => fileItems.filter((f: any) => f.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [fileItems, searchQuery]
  )

  // Virtualizer for list view
  const listParentRef = useRef<HTMLDivElement>(null)
  const listVirtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => 88,
    overscan: 8,
  })

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.includes('pdf')) return FileText
    return File
  }

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      setProgress(0)
      await uploadFlow.mutateAsync({
        file,
        onProgress: (p) => setProgress(Math.round(p)),
      })
      toast.success('File uploaded successfully')
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-muted-foreground">Browse and manage your files</p>
        </div>
        <div className="flex items-center gap-3">
          {uploading && (
            <div className="text-sm text-muted-foreground">Uploading… {progress}%</div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={handleUploadClick} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Files Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.mimeType)
            return (
              <Card key={file.id} className="group transition-shadow hover:shadow-lg">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="mb-1 truncate font-medium" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="mb-2 text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  <Badge variant="outline" className="text-xs">
                    {file.context.name}
                  </Badge>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(file.createdAt, 'relative')}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        // Files List (virtualized)
        <div ref={listParentRef} className="h-[60vh] overflow-auto">
          {files.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No files</div>
          ) : (
            <div className="relative" style={{ height: listVirtualizer.getTotalSize() }}>
              {listVirtualizer.getVirtualItems().map((vr) => {
                const file = files[vr.index]
                const FileIcon = getFileIcon(file.mimeType)
                return (
                  <div
                    key={vr.key}
                    className="absolute left-0 right-0"
                    style={{ transform: `translateY(${vr.start}px)`, height: vr.size }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatBytes(file.size)} • {file.uploadedBy} • {formatDate(file.createdAt, 'relative')}
                          </p>
                        </div>
                        <Badge variant="outline">{file.context.name}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}
