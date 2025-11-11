"use client"

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AvatarWithPresence } from '@/components/ui/presence-badge'
import { useOrgTree } from '@/lib/api/hooks/use-directory'
import { usePresenceStore } from '@/lib/stores/presence-store'
import type { OrgUnit, User } from '@/types'

export function PresenceRoster() {
  const { data: root } = useOrgTree()
  const getPresence = usePresenceStore((s) => s.getPresence)

  const users = useMemo(() => {
    const acc: Array<Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'extension'>> = []
    const walk = (unit?: OrgUnit) => {
      if (!unit) return
      for (const m of unit.members || []) acc.push(m)
      for (const c of unit.children || []) walk(c)
    }
    walk(root)
    return acc
  }, [root])

  const online = useMemo(() => {
    return users.filter((u) => getPresence(u.id) !== 'offline')
  }, [users, getPresence])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Online now</h2>
          <div className="text-sm text-muted-foreground">{online.length}</div>
        </div>
        {online.length === 0 ? (
          <div className="text-sm text-muted-foreground">No one is online</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {online.slice(0, 20).map((u) => (
              <div key={u.id} className="flex items-center gap-2 rounded border p-2">
                <AvatarWithPresence
                  {...(u.avatar ? { src: u.avatar } : {})}
                  alt={u.name}
                  fallback={u.name.split(' ').map((n) => n[0]).join('')}
                  status={getPresence(u.id)}
                  {...(u.extension ? { extension: u.extension } : {})}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{u.name}</div>
                  {u.email && <div className="truncate text-xs text-muted-foreground">{u.email}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
