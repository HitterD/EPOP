export type SearchScope = 'all' | 'messages' | 'files' | 'people' | 'projects';
export type SearchResultType = 'message' | 'file' | 'person' | 'project' | 'task';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  url: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
  scope: SearchScope;
}

export interface SearchCommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string, scope: SearchScope) => void;
}

export interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  onClick: () => void;
}

export interface ScopeFilterProps {
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  counts?: Record<SearchScope, number>;
}

export interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelect: (search: RecentSearch) => void;
  onClear: () => void;
}

export interface SearchFiltersProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}
