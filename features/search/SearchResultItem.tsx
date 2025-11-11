import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, User, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResultItemProps } from '@/types/search';

const iconMap = {
  message: MessageSquare,
  file: FileText,
  person: User,
  project: FolderKanban,
  task: FolderKanban,
};

export function SearchResultItem({ result, query, onClick }: SearchResultItemProps) {
  const Icon = iconMap[result.type];
  
  const highlightText = (text: string) => {
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
    );
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start p-3 h-auto"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 w-full">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium truncate">{highlightText(result.title)}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {highlightText(result.snippet)}
          </p>
        </div>
      </div>
    </Button>
  );
}
