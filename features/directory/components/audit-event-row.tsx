'use client'

import { AuditEvent } from '@/types'
import { Avatar } from '@/components/ui/avatar-wrapper'
import { formatDistanceToNow } from 'date-fns'
import {
  UserPlus,
  UserMinus,
  UserCheck,
  Users,
  Building2,
  Edit,
  Trash2,
  ArrowRight,
  GitMerge,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuditEventRowProps {
  event: AuditEvent
  className?: string
}

const actionIcons = {
  user_moved: ArrowRight,
  user_created: UserPlus,
  user_updated: Edit,
  user_deleted: Trash2,
  unit_created: Building2,
  unit_updated: Edit,
  unit_deleted: Trash2,
  unit_merged: GitMerge,
}

const actionColors = {
  user_moved: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950',
  user_created: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
  user_updated: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950',
  user_deleted: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950',
  unit_created: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
  unit_updated: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950',
  unit_deleted: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950',
  unit_merged: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950',
}

export function AuditEventRow({ event, className }: AuditEventRowProps) {
  const Icon = actionIcons[event.action] || UserCheck
  const colorClass = actionColors[event.action]

  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center h-10 w-10 rounded-full shrink-0',
          colorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Actor and action */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar
              {...(event.actor.avatar ? { src: event.actor.avatar } : {})}
              alt={event.actor.name}
              size="sm"
              fallback={event.actor.name?.[0] ?? 'U'}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-none mb-1">
                {event.actor.name}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {event.details}
              </p>
            </div>
          </div>
          <time
            className="text-xs text-muted-foreground whitespace-nowrap shrink-0"
            dateTime={event.timestamp}
            title={new Date(event.timestamp).toLocaleString()}
          >
            {timeAgo}
          </time>
        </div>

        {/* Changes detail (if available) */}
        {event.changes && event.changes.fields && event.changes.fields.length > 0 && (
          <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
            <span className="font-medium text-muted-foreground">Changed fields: </span>
            <span className="text-foreground">
              {event.changes.fields.join(', ')}
            </span>
          </div>
        )}

        {/* Before/After (if available) */}
        {event.changes?.before && event.changes?.after && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-red-50 dark:bg-red-950/30">
              <span className="font-medium text-red-600 dark:text-red-400">Before: </span>
              <span className="text-foreground">
                {JSON.stringify(event.changes.before, null, 2)}
              </span>
            </div>
            <div className="p-2 rounded bg-green-50 dark:bg-green-950/30">
              <span className="font-medium text-green-600 dark:text-green-400">After: </span>
              <span className="text-foreground">
                {JSON.stringify(event.changes.after, null, 2)}
              </span>
            </div>
          </div>
        )}

        {/* Metadata (if available) */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              View metadata
            </summary>
            <pre className="mt-1 p-2 rounded bg-muted text-xs overflow-x-auto">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
