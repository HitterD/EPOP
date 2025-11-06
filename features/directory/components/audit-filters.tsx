'use client'

import { useState } from 'react'
import { AuditFilters, AuditAction } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface AuditFiltersComponentProps {
  filters: AuditFilters
  onFiltersChange: (filters: AuditFilters) => void
  className?: string
}

const actionTypeOptions: { value: AuditAction; label: string }[] = [
  { value: 'user_moved', label: 'User Moved' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_updated', label: 'User Updated' },
  { value: 'user_deleted', label: 'User Deleted' },
  { value: 'unit_created', label: 'Unit Created' },
  { value: 'unit_updated', label: 'Unit Updated' },
  { value: 'unit_deleted', label: 'Unit Deleted' },
  { value: 'unit_merged', label: 'Unit Merged' },
]

const dateRangePresets = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
]

export function AuditFiltersComponent({
  filters,
  onFiltersChange,
  className,
}: AuditFiltersComponentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  )

  const activeFilterCount = [
    filters.startDate || filters.endDate,
    filters.actionType,
    filters.actorId,
  ].filter(Boolean).length

  const handleActionTypeChange = (value: string) => {
    if (value === 'all') {
      const { actionType, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({
        ...filters,
        actionType: value as AuditAction,
      })
    }
  }

  const handleDateRangePreset = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    setDateFrom(startDate)
    setDateTo(endDate)
    onFiltersChange({
      ...filters,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })
  }

  const handleCustomDateRange = () => {
    if (dateFrom && dateTo) {
      onFiltersChange({
        ...filters,
        startDate: dateFrom.toISOString(),
        endDate: dateTo.toISOString(),
      })
    }
  }

  const handleClearFilters = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    onFiltersChange({})
  }

  const handleRemoveFilter = (filterKey: keyof AuditFilters) => {
    const { [filterKey]: removed, ...rest } = filters
    if (filterKey === 'startDate' || filterKey === 'endDate') {
      const { startDate, endDate, ...others } = filters
      onFiltersChange(others)
      setDateFrom(undefined)
      setDateTo(undefined)
    } else {
      onFiltersChange(rest)
    }
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-[1.25rem] rounded-full px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Filter Audit Events</h4>
              <p className="text-xs text-muted-foreground">
                Narrow down the audit trail by action type and date range
              </p>
            </div>

            {/* Action Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select
                value={filters.actionType as string || 'all'}
                onValueChange={handleActionTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actionTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-3 gap-2">
                {dateRangePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangePreset(preset.value)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PP') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PP') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {dateFrom && dateTo && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCustomDateRange}
                  className="w-full"
                >
                  Apply Custom Range
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
              >
                Clear all
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters */}
      {(filters.startDate || filters.endDate) && (
        <Badge variant="secondary" className="gap-1">
          <CalendarIcon className="h-3 w-3" />
          {dateFrom && format(dateFrom, 'PP')} - {dateTo && format(dateTo, 'PP')}
          <button
            onClick={() => handleRemoveFilter('startDate')}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.actionType && (
        <Badge variant="secondary" className="gap-1">
          {actionTypeOptions.find((o) => o.value === filters.actionType)?.label}
          <button
            onClick={() => handleRemoveFilter('actionType')}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  )
}
