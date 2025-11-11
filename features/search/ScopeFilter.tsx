import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ScopeFilterProps, SearchScope } from '@/types/search';

const scopes: { value: SearchScope; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'messages', label: 'Messages' },
  { value: 'files', label: 'Files' },
  { value: 'people', label: 'People' },
  { value: 'projects', label: 'Projects' },
];

export function ScopeFilter({ scope, onScopeChange, counts }: ScopeFilterProps) {
  return (
    <Tabs value={scope} onValueChange={(v) => onScopeChange(v as SearchScope)} className="px-2">
      <TabsList className="w-full justify-start">
        {scopes.map((s) => (
          <TabsTrigger key={s.value} value={s.value} className="gap-2">
            {s.label}
            {counts?.[s.value] !== undefined && (
              <span className="text-xs text-muted-foreground">
                {counts[s.value]}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
