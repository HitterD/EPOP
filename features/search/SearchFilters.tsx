import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Filter, X, Calendar as CalendarIcon, User, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types/directory';

export interface SearchFiltersState {
  dateRange: {
    from?: Date;
    to?: Date;
    preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';
  };
  author?: string;
  hasAttachments?: boolean;
  hasLinks?: boolean;
  tags?: string[];
  status?: 'open' | 'closed' | 'in-progress' | 'archived';
  priority?: 'low' | 'medium' | 'high';
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  availableUsers?: UserType[];
  availableTags?: string[];
  showInline?: boolean;
}

export function SearchFilters({
  filters,
  onChange,
  availableUsers = [],
  availableTags = [],
  showInline = false,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFiltersState>(filters);

  const hasActiveFilters = () => {
    return (
      localFilters.dateRange.from ||
      localFilters.author ||
      localFilters.hasAttachments ||
      localFilters.hasLinks ||
      (localFilters.tags && localFilters.tags.length > 0) ||
      localFilters.status ||
      localFilters.priority
    );
  };

  const activeFilterCount = () => {
    let count = 0;
    if (localFilters.dateRange.from) count++;
    if (localFilters.author) count++;
    if (localFilters.hasAttachments) count++;
    if (localFilters.hasLinks) count++;
    if (localFilters.tags && localFilters.tags.length > 0) count++;
    if (localFilters.status) count++;
    if (localFilters.priority) count++;
    return count;
  };

  const updateFilter = <K extends keyof SearchFiltersState>(
    key: K,
    value: SearchFiltersState[K]
  ) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const updateDateRange = (
    preset: SearchFiltersState['dateRange']['preset']
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let from: Date | undefined;
    let to: Date | undefined = new Date();

    switch (preset) {
      case 'today':
        from = today;
        break;
      case 'yesterday':
        from = new Date(today);
        from.setDate(from.getDate() - 1);
        to = new Date(today);
        break;
      case 'last7days':
        from = new Date(today);
        from.setDate(from.getDate() - 7);
        break;
      case 'last30days':
        from = new Date(today);
        from.setDate(from.getDate() - 30);
        break;
    }

    updateFilter('dateRange', { from, to, preset });
  };

  const clearFilter = (key: keyof SearchFiltersState) => {
    const updated = { ...localFilters };
    if (key === 'dateRange') {
      updated.dateRange = {};
    } else {
      delete updated[key];
    }
    setLocalFilters(updated);
    onChange(updated);
  };

  const clearAllFilters = () => {
    const empty: SearchFiltersState = { dateRange: {} };
    setLocalFilters(empty);
    onChange(empty);
  };

  const toggleTag = (tag: string) => {
    const currentTags = localFilters.tags || [];
    const updated = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateFilter('tags', updated.length > 0 ? updated : undefined);
  };

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Date Range */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <CalendarIcon className="h-4 w-4" />
          Date Range
        </Label>
        <Select
          value={localFilters.dateRange.preset || ''}
          onValueChange={(value) =>
            updateDateRange(
              value as SearchFiltersState['dateRange']['preset']
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {localFilters.dateRange.preset === 'custom' && (
          <div className="space-y-2 pt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  {localFilters.dateRange.from ? (
                    format(localFilters.dateRange.from, 'PPP')
                  ) : (
                    'From date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateRange.from}
                  onSelect={(date) =>
                    updateFilter('dateRange', {
                      ...localFilters.dateRange,
                      from: date,
                    })
                  }
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  {localFilters.dateRange.to ? (
                    format(localFilters.dateRange.to, 'PPP')
                  ) : (
                    'To date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateRange.to}
                  onSelect={(date) =>
                    updateFilter('dateRange', {
                      ...localFilters.dateRange,
                      to: date,
                    })
                  }
                  disabled={(date) =>
                    localFilters.dateRange.from
                      ? date < localFilters.dateRange.from
                      : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Author */}
      {availableUsers.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4" />
            From
          </Label>
          <Select
            value={localFilters.author || ''}
            onValueChange={(value) => updateFilter('author', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any user</SelectItem>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Has Filters */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Has</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-attachments"
              checked={localFilters.hasAttachments || false}
              onCheckedChange={(checked) =>
                updateFilter('hasAttachments', checked as boolean)
              }
            />
            <Label
              htmlFor="has-attachments"
              className="text-sm font-normal cursor-pointer"
            >
              Attachments
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-links"
              checked={localFilters.hasLinks || false}
              onCheckedChange={(checked) =>
                updateFilter('hasLinks', checked as boolean)
              }
            />
            <Label
              htmlFor="has-links"
              className="text-sm font-normal cursor-pointer"
            >
              Links
            </Label>
          </div>
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Button
                key={tag}
                variant={
                  localFilters.tags?.includes(tag) ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => toggleTag(tag)}
                className="h-7 text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Status</Label>
        <Select
          value={localFilters.status || ''}
          onValueChange={(value) => updateFilter('status', value as any || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Priority</Label>
        <Select
          value={localFilters.priority || ''}
          onValueChange={(value) => updateFilter('priority', value as any || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear all */}
      {hasActiveFilters() && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-1" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  if (showInline) {
    return (
      <div
        className={cn(
          'border rounded-lg p-4',
          isExpanded ? 'block' : 'hidden'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <FilterContent />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount() > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {activeFilterCount()}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <FilterContent />
      </PopoverContent>
    </Popover>
  );
}

// Active filters display chips
export function ActiveFilters({
  filters,
  onRemove,
}: {
  filters: SearchFiltersState;
  onRemove: (key: keyof SearchFiltersState) => void;
}) {
  const chips: Array<{ key: keyof SearchFiltersState; label: string }> = [];

  if (filters.dateRange.from) {
    const label = filters.dateRange.preset
      ? filters.dateRange.preset.replace(/([A-Z])/g, ' $1').toLowerCase()
      : `${format(filters.dateRange.from, 'PP')} - ${filters.dateRange.to ? format(filters.dateRange.to, 'PP') : 'now'}`;
    chips.push({ key: 'dateRange', label: `Date: ${label}` });
  }

  if (filters.author) {
    chips.push({ key: 'author', label: `Author: ${filters.author}` });
  }

  if (filters.hasAttachments) {
    chips.push({ key: 'hasAttachments', label: 'Has: Attachments' });
  }

  if (filters.hasLinks) {
    chips.push({ key: 'hasLinks', label: 'Has: Links' });
  }

  if (filters.tags && filters.tags.length > 0) {
    chips.push({ key: 'tags', label: `Tags: ${filters.tags.join(', ')}` });
  }

  if (filters.status) {
    chips.push({ key: 'status', label: `Status: ${filters.status}` });
  }

  if (filters.priority) {
    chips.push({ key: 'priority', label: `Priority: ${filters.priority}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Button
          key={chip.key}
          variant="secondary"
          size="sm"
          onClick={() => onRemove(chip.key)}
          className="h-6 text-xs gap-1"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </Button>
      ))}
    </div>
  );
}
