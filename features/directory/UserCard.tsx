'use client'
import React from 'react';
import { Card } from '@/components/ui/card';
import { AvatarWithPresence } from '@/components/ui/presence-badge';
import { Badge } from '@/components/ui/badge';
import { Mail, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserCardProps } from '@/types/directory';
import { usePresenceStore } from '@/lib/stores/presence-store'

export function UserCard({ user, onClick }: UserCardProps) {
  const presence = usePresenceStore((s) => s.getPresence(user.id))
  const initials = user.name.split(' ').map((n) => n[0]).join('')
  return (
    <Card
      className={cn(
        'p-4 cursor-pointer hover:shadow-md transition-all',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <AvatarWithPresence
          {...(user.avatarUrl ? { src: user.avatarUrl } : {})}
          alt={user.name}
          fallback={initials}
          status={presence}
          {...(user.extension ? { extension: user.extension } : {})}
          size="lg"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{user.name}</h3>
            {user.extension && (
              <Badge variant="outline" className="text-xs font-mono">
                {user.extension}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.role}</p>
          
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Building className="h-3 w-3" />
            <span className="truncate">{user.department}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{user.email}</span>
          </div>
          
          <Badge
            variant={user.status === 'active' ? 'default' : 'secondary'}
            className="mt-2"
          >
            {user.status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
