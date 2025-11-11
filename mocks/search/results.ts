import type { SearchResult, RecentSearch } from '@/types/search';

export const mockSearchResults: SearchResult[] = [
  {
    id: 'r1',
    type: 'message',
    title: 'Project Timeline Discussion',
    snippet: 'Can we discuss the timeline for the Q1 project? I think we need to adjust...',
    url: '/chat/c1',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'r2',
    type: 'file',
    title: 'presentation.pdf',
    snippet: 'Q1 Project Presentation - Final Draft',
    url: '/files/f1',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: 'r3',
    type: 'person',
    title: 'Alice Chen',
    snippet: 'Senior Designer • alice@epop.com',
    url: '/directory/u1',
  },
  {
    id: 'r4',
    type: 'project',
    title: 'Website Redesign',
    snippet: 'Complete redesign of the company website with modern UI',
    url: '/projects/p1',
    timestamp: new Date(Date.now() - 86400000),
  },
];

export const mockRecentSearches: RecentSearch[] = [
  { id: 's1', query: 'project timeline', timestamp: new Date(Date.now() - 3600000), scope: 'all' },
  { id: 's2', query: 'Alice', timestamp: new Date(Date.now() - 7200000), scope: 'people' },
  { id: 's3', query: 'presentation', timestamp: new Date(Date.now() - 86400000), scope: 'files' },
];
