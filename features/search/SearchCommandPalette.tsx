import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScopeFilter } from './ScopeFilter';
import { SearchResultItem } from './SearchResultItem';
import { RecentSearches } from './RecentSearches';
import type { SearchCommandPaletteProps, SearchScope } from '@/types/search';
import { mockSearchResults, mockRecentSearches } from '@/mocks/search/results';

export function SearchCommandPalette({ open, onClose, onSearch }: SearchCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [results, setResults] = useState(mockSearchResults);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      onSearch(value, scope);
      setResults(mockSearchResults.filter(r => 
        r.title.toLowerCase().includes(value.toLowerCase()) ||
        r.snippet.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setResults([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 text-lg"
            autoFocus
          />
        </div>
        
        <ScopeFilter scope={scope} onScopeChange={setScope} />
        
        <div className="max-h-[400px] overflow-y-auto">
          {query.length < 2 ? (
            <RecentSearches
              searches={mockRecentSearches}
              onSelect={(s) => handleSearch(s.query)}
              onClear={() => {}}
            />
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  query={query}
                  onClick={onClose}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
