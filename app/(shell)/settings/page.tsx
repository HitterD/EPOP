'use client'

import { useMemo } from 'react'
import { useSessions, useRevokeSession, useRevokeAllSessions } from '@/lib/api/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Laptop, Smartphone, Tablet, Monitor, LogOut, Shield } from 'lucide-react'

function DeviceIcon({ type }: { type: 'desktop' | 'mobile' | 'tablet' | 'other' }) {
  switch (type) {
    case 'desktop':
      return <Monitor className="h-4 w-4" />
    case 'mobile':
      return <Smartphone className="h-4 w-4" />
    case 'tablet':
      return <Tablet className="h-4 w-4" />
    default:
      return <Laptop className="h-4 w-4" />
  }
}

export default function SettingsPage() {
  const { data: sessions, isLoading, isError } = useSessions()
  const revokeSession = useRevokeSession()
  const revokeAll = useRevokeAllSessions()

  const currentSession = useMemo(() => sessions?.find((s) => s.isCurrent), [sessions])
  const otherSessions = useMemo(() => (sessions || []).filter((s) => !s.isCurrent), [sessions])

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your sessions and connected devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Current Session */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Current device</h3>
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-3">
                    <DeviceIcon type={currentSession?.deviceType || 'desktop'} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{currentSession?.deviceName || 'This device'}</p>
                        <Badge variant="secondary">Current</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {currentSession?.userAgent}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">IP {currentSession?.ipAddress}</p>
                    {currentSession?.lastActiveAt && (
                      <p className="text-xs text-muted-foreground">
                        Active {formatDistanceToNow(new Date(currentSession.lastActiveAt))} ago
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Sessions */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Other devices</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeAll.mutate()}
                    disabled={revokeAll.isPending || !otherSessions.length}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Revoke all other sessions
                  </Button>
                </div>

                {isLoading ? (
                  <div className="rounded-md border p-4 text-sm text-muted-foreground">Loading sessions...</div>
                ) : isError ? (
                  <div className="rounded-md border p-4 text-sm text-destructive">Failed to load sessions.</div>
                ) : otherSessions.length === 0 ? (
                  <div className="rounded-md border p-4 text-sm text-muted-foreground">No other active sessions.</div>
                ) : (
                  <div className="space-y-3">
                    {otherSessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-md border p-4">
                        <div className="flex items-center gap-3">
                          <DeviceIcon type={s.deviceType} />
                          <div>
                            <p className="font-medium">{s.deviceName || 'Unknown device'}</p>
                            <p className="text-xs text-muted-foreground">{s.userAgent}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">IP {s.ipAddress}</p>
                            {s.lastActiveAt && (
                              <p className="text-xs text-muted-foreground">
                                Active {formatDistanceToNow(new Date(s.lastActiveAt))} ago
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeSession.mutate(s.id)}
                            disabled={revokeSession.isPending}
                          >
                            <LogOut className="mr-2 h-4 w-4" /> Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Security tips */}
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                  <Shield className="h-4 w-4" /> Security tips
                </div>
                If you notice an unfamiliar device, revoke the session immediately and change your password.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
