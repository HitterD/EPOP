import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FolderTreeProps, FolderNode } from '@/types/files';

interface FolderItemProps {
  folder: FolderNode;
  level: number;
  selectedId?: string;
  onSelect: (id: string) => void;
}

function FolderItem({ folder, level, selectedId, onSelect }: FolderItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'w-full justify-start gap-2',
          isSelected && 'bg-accent'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0 h-4 w-4"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        {isOpen ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
        <span className="flex-1 text-left truncate">{folder.name}</span>
        {folder.fileCount !== undefined && (
          <span className="text-xs text-muted-foreground">{folder.fileCount}</span>
        )}
      </Button>
      {isOpen && hasChildren && (
        <div>
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({ folders, selectedId, onSelect }: FolderTreeProps) {
  return (
    <div className="space-y-1" role="tree" aria-label="Folder tree">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
