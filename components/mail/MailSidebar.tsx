import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox, Send, FileText, Trash2, Archive, PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MailSidebarProps } from '@/types/mail';

const folderIcons = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  deleted: Trash2,
  archive: Archive,
};

export function MailSidebar({
  folders,
  selectedFolder,
  onSelectFolder,
  unreadCounts,
  onCompose,
}: MailSidebarProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'c') {
        e.preventDefault();
        onCompose();
      } else if (e.key === 'g') {
        // Gmail-style shortcuts: g i (inbox), g s (sent), g d (drafts)
        const nextKey = new Promise<string>((resolve) => {
          const handler = (ne: KeyboardEvent) => {
            resolve(ne.key);
            window.removeEventListener('keydown', handler);
          };
          window.addEventListener('keydown', handler);
          setTimeout(() => window.removeEventListener('keydown', handler), 1000);
        });

        nextKey.then((key) => {
          if (key === 'i') onSelectFolder('inbox');
          else if (key === 's') onSelectFolder('sent');
          else if (key === 'd') onSelectFolder('drafts');
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCompose, onSelectFolder]);

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-3 border-b">
        <Button className="w-full gap-2" onClick={onCompose}>
          <PenSquare className="h-4 w-4" />
          Compose
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav role="navigation" aria-label="Mail folders" className="p-2 space-y-1">
          {folders.map((folder) => {
            const Icon = folderIcons[folder.icon as keyof typeof folderIcons] || Inbox;
            const unreadCount = unreadCounts[folder.id] || 0;
            const isSelected = selectedFolder === folder.id;

            return (
              <Button
                key={folder.id}
                variant={isSelected ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  isSelected && 'bg-accent'
                )}
                onClick={() => onSelectFolder(folder.id)}
                aria-current={isSelected ? 'page' : undefined}
                aria-label={`${folder.name} folder${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{folder.name}</span>
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto"
                    aria-label={`${unreadCount} unread`}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
