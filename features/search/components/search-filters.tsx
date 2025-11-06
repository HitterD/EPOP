'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, X } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

interface SearchFiltersProps {
  filters: {
    dateFrom?: string
    dateTo?: string
    fileType?: string
    userId?: string
  }
  onFiltersChange: (filters: any) => void
  resultType?: string
}

export function SearchFilters({ filters, onFiltersChange, resultType }: SearchFiltersProps) {
  const hasFilters = filters.dateFrom || filters.dateTo || filters.fileType || filters.userId

  const clearFilters = () => {
    onFiltersChange({
      dateFrom: undefined,
      dateTo: undefined,
      fileType: undefined,
      userId: undefined,
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="h-8">
            <Filter size={14} className="mr-2" />
            Filters
            {hasFilters && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filter results</h4>
              {hasFilters && (
                <Button size="sm" variant="ghost" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            {/* Date range */}
            <div className="space-y-2">
              <Label className="text-xs">Date range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-xs">
                      {filters.dateFrom ? formatDate(filters.dateFrom, 'PP') : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                      onSelect={(date) =>
                        onFiltersChange({
                          ...filters,
                          dateFrom: date?.toISOString(),
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-xs">
                      {filters.dateTo ? formatDate(filters.dateTo, 'PP') : 'To date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                      onSelect={(date) =>
                        onFiltersChange({
                          ...filters,
                          dateTo: date?.toISOString(),
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* File type (only for files) */}
            {(resultType === 'files' || resultType === 'all') && (
              <div className="space-y-2">
                <Label className="text-xs">File type</Label>
                <Select
                  value={filters.fileType || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      fileType: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="archive">Archives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      {filters.dateFrom && (
        <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 rounded text-xs">
          <span>From: {formatDate(filters.dateFrom, 'PP')}</span>
          <button
            onClick={() => onFiltersChange({ ...filters, dateFrom: undefined })}
            className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {filters.dateTo && (
        <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 rounded text-xs">
          <span>To: {formatDate(filters.dateTo, 'PP')}</span>
          <button
            onClick={() => onFiltersChange({ ...filters, dateTo: undefined })}
            className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {filters.fileType && (
        <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 rounded text-xs">
          <span>Type: {filters.fileType}</span>
          <button
            onClick={() => onFiltersChange({ ...filters, fileType: undefined })}
            className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
