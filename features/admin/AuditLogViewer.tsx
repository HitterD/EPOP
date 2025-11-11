import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Trash2, UserPlus, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'permission_change';
  actor: string;
  target: string;
  details: string;
  timestamp: Date;
}

interface AuditLogViewerProps {
  logs: AuditLog[];
}

const actionIcons = {
  create: UserPlus,
  update: Edit,
  delete: Trash2,
  permission_change: Shield,
};

const actionColors = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  permission_change: 'bg-yellow-500',
};

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Audit Log</h3>
        <p className="text-sm text-muted-foreground">
          Track all administrative actions
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No audit logs yet</p>
            </div>
          ) : (
            logs.map((log) => {
              const Icon = actionIcons[log.action];
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 border rounded hover:bg-accent transition-colors"
                >
                  <div className={`p-2 rounded ${actionColors[log.action]} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.actor}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(log.timestamp, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
