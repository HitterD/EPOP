import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import type { RecentSearchesProps } from '@/types/search';

export function RecentSearches({ searches, onSelect, onClear }: RecentSearchesProps) {
  if (searches.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p>No recent searches</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Recent</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
      {searches.map((search) => (
        <Button
          key={search.id}
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => onSelect(search)}
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-left">{search.query}</span>
          <span className="text-xs text-muted-foreground">{search.scope}</span>
        </Button>
      ))}
    </div>
  );
}
