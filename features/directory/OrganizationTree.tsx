import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Building2, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrganizationTreeProps, OrgNode } from '@/types/directory';

interface TreeNodeProps {
  node: OrgNode;
  level: number;
  onNodeClick: (node: OrgNode) => void;
}

function TreeNode({ node, level, onNodeClick }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  const Icon = node.type === 'department' ? Building2 : node.type === 'team' ? Users : User;

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'w-full justify-start gap-2',
          'hover:bg-accent'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onNodeClick(node);
        }}
      >
        {hasChildren && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}
        
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate">{node.name}</span>
        
        {/* Show extension for user nodes */}
        {node.type === 'user' && node.extension && (
          <Badge variant="secondary" className="ml-2 text-xs font-mono">
            {node.extension}
          </Badge>
        )}
      </Button>

      {isExpanded && hasChildren && (
        <div role="group">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrganizationTree({ tree, onNodeClick }: OrganizationTreeProps) {
  return (
    <div role="tree" aria-label="Organization structure" className="space-y-1">
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} level={0} onNodeClick={onNodeClick} />
      ))}
    </div>
  );
}
