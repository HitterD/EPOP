import type { Meta, StoryObj } from '@storybook/react';
import { SearchFilters, ActiveFilters, type SearchFiltersState } from '@/features/search/SearchFilters';
import { useState } from 'react';

const meta: Meta<typeof SearchFilters> = {
  title: 'Search/SearchFilters',
  component: SearchFilters,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchFilters>;

const sampleUsers = [
  { id: '1', name: 'Alice Chen', email: 'alice@company.com', role: 'admin', department: 'Engineering', status: 'active', presence: 'online' as const, joinedAt: new Date() },
  { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'member', department: 'Engineering', status: 'active', presence: 'online' as const, joinedAt: new Date() },
  { id: '3', name: 'Carol Lee', email: 'carol@company.com', role: 'member', department: 'Design', status: 'active', presence: 'away' as const, joinedAt: new Date() },
];

const sampleTags = ['urgent', 'design', 'backend', 'frontend', 'bug', 'feature'];

function SearchFiltersDemo() {
  const [filters, setFilters] = useState<SearchFiltersState>({ dateRange: {} });

  return (
    <div className="space-y-4">
      <SearchFilters
        filters={filters}
        onChange={setFilters}
        availableUsers={sampleUsers}
        availableTags={sampleTags}
      />
      {Object.keys(filters).some(key => {
        const value = filters[key as keyof SearchFiltersState];
        return value && (typeof value === 'object' ? Object.keys(value).length > 0 : true);
      }) && (
        <ActiveFilters
          filters={filters}
          onRemove={(key) => {
            const updated = { ...filters };
            if (key === 'dateRange') {
              updated.dateRange = {};
            } else {
              delete updated[key];
            }
            setFilters(updated);
          }}
        />
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <SearchFiltersDemo />,
};

export const WithActiveFilters: Story = {
  args: {
    filters: {
      dateRange: { preset: 'last7days', from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() },
      author: '1',
      hasAttachments: true,
      tags: ['urgent', 'design'],
      status: 'open',
    },
    onChange: (filters) => console.log('Filters changed:', filters),
    availableUsers: sampleUsers,
    availableTags: sampleTags,
  },
};

export const Inline: Story = {
  args: {
    filters: { dateRange: {} },
    onChange: (filters) => console.log('Filters changed:', filters),
    availableUsers: sampleUsers,
    availableTags: sampleTags,
    showInline: true,
  },
};
